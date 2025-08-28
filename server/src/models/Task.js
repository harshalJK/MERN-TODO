    const { Schema, model } = require('mongoose');

    const SubtaskSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        completed: { type: Boolean, default: false }
    },
    { _id: true }
    );

    const TaskSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        completed: { type: Boolean, default: false },
        dueAt: { type: Date, default: null },           // NEW
        tags: { type: [String], default: [] },          // NEW
        subtasks: { type: [SubtaskSchema], default: [] } // NEW
    },
    { timestamps: true }
    );

    // Index for common queries: filter/sort
    TaskSchema.index({ completed: 1, dueAt: 1, createdAt: -1 });

    module.exports = model('Task', TaskSchema);
