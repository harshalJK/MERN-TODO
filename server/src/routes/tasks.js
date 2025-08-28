    const express = require('express');
    const Task = require('../models/Task');
    const router = express.Router();

    /**
     * Helpers: parse query params safely
     */
    function parseSort(sort) {
    // allowed: 'dueSoonest' | 'dueLatest' | 'newest' | 'oldest'
    switch (sort) {
        case 'dueSoonest': return { dueAt: 1, createdAt: -1 };
        case 'dueLatest':  return { dueAt: -1, createdAt: -1 };
        case 'oldest':     return { createdAt: 1 };
        default:           return { createdAt: -1 }; // 'newest'
    }
    }

    /**
     * GET /api/tasks
     * Supports:
     *   - query=<text>   (case-insensitive title regex)
     *   - tag=work       (single tag filter)
     *   - completed=true/false
     *   - sort=dueSoonest|dueLatest|newest|oldest
     */
    router.get('/', async (req, res, next) => {
    try {
        const { query, tag, completed, sort } = req.query;
        const find = {};

        if (query) {
        find.title = { $regex: query, $options: 'i' };
        }
        if (tag) {
        find.tags = tag;
        }
        if (typeof completed !== 'undefined') {
        if (completed === 'true') find.completed = true;
        if (completed === 'false') find.completed = false;
        }

        const tasks = await Task.find(find).sort(parseSort(sort));
        res.json(tasks);
    } catch (err) {
        next(err);
    }
    });

    // Create
    router.post('/', async (req, res, next) => {
    try {
        const { title, dueAt, tags, subtasks } = req.body;
        if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });

        const payload = { title: title.trim() };
        if (dueAt) payload.dueAt = new Date(dueAt);
        if (Array.isArray(tags)) payload.tags = tags.map(String).map(t => t.trim()).filter(Boolean);
        if (Array.isArray(subtasks)) {
        payload.subtasks = subtasks
            .filter(s => s && typeof s.title === 'string' && s.title.trim())
            .map(s => ({ title: s.title.trim(), completed: !!s.completed }));
        }

        const task = await Task.create(payload);
        res.status(201).json(task);
    } catch (err) {
        next(err);
    }
    });

    // Update (title / completed / dueAt / tags / subtasks replace)
    router.patch('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, completed, dueAt, tags, subtasks } = req.body;
        const updates = {};
        if (typeof title === 'string') updates.title = title.trim();
        if (typeof completed === 'boolean') updates.completed = completed;
        if (typeof dueAt !== 'undefined') updates.dueAt = dueAt ? new Date(dueAt) : null;
        if (Array.isArray(tags)) updates.tags = tags.map(String).map(t => t.trim()).filter(Boolean);
        if (Array.isArray(subtasks)) {
        updates.subtasks = subtasks
            .filter(s => s && typeof s.title === 'string' && s.title.trim())
            .map(s => ({ _id: s._id, title: s.title.trim(), completed: !!s.completed }));
        }

        const task = await Task.findByIdAndUpdate(id, updates, { new: true });
        if (!task) return res.status(404).json({ error: 'Not found' });
        res.json(task);
    } catch (err) {
        next(err);
    }
    });

    // Delete
    router.delete('/:id', async (req, res, next) => {
    try {
        const deleted = await Task.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Not found' });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
    });

    /**
     * BULK update completions
     * PATCH /api/tasks/bulk
     * body: { ids: [id1, id2], completed: true }
     */
    router.patch('/bulk', async (req, res, next) => {
    try {
        const { ids, completed } = req.body;
        if (!Array.isArray(ids) || typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'ids[] and completed(boolean) required' });
        }
        await Task.updateMany({ _id: { $in: ids } }, { $set: { completed } });
        const updated = await Task.find({ _id: { $in: ids } });
        res.json({ updated });
    } catch (err) {
        next(err);
    }
    });

    /**
     * BULK delete
     * DELETE /api/tasks/bulk
     * body: { ids: [id1, id2] }
     */
    router.delete('/bulk', async (req, res, next) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids)) {
        return res.status(400).json({ error: 'ids[] required' });
        }
        await Task.deleteMany({ _id: { $in: ids } });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
    });

    /**
     * SUBTASKS convenience endpoints (optional):
     *  - POST /api/tasks/:id/subtasks { title }
     *  - PATCH /api/tasks/:id/subtasks/:sid { title?, completed? }
     *  - DELETE /api/tasks/:id/subtasks/:sid
     */

    router.post('/:id/subtasks', async (req, res, next) => {
    try {
        const { title } = req.body;
        if (!title || !title.trim()) return res.status(400).json({ error: 'Subtask title required' });
        const task = await Task.findByIdAndUpdate(
        req.params.id,
        { $push: { subtasks: { title: title.trim(), completed: false } } },
        { new: true }
        );
        if (!task) return res.status(404).json({ error: 'Not found' });
        res.json(task);
    } catch (err) {
        next(err);
    }
    });

    router.patch('/:id/subtasks/:sid', async (req, res, next) => {
    try {
        const { title, completed } = req.body;
        const sets = {};
        if (typeof title === 'string') sets['subtasks.$.title'] = title.trim();
        if (typeof completed === 'boolean') sets['subtasks.$.completed'] = completed;

        const task = await Task.findOneAndUpdate(
        { _id: req.params.id, 'subtasks._id': req.params.sid },
        { $set: sets },
        { new: true }
        );
        if (!task) return res.status(404).json({ error: 'Not found' });
        res.json(task);
    } catch (err) {
        next(err);
    }
    });

    router.delete('/:id/subtasks/:sid', async (req, res, next) => {
    try {
        const task = await Task.findByIdAndUpdate(
        req.params.id,
        { $pull: { subtasks: { _id: req.params.sid } } },
        { new: true }
        );
        if (!task) return res.status(404).json({ error: 'Not found' });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
    });

    // Basic error handler
    router.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
    });

    module.exports = router;
