    const express = require('express');
    const Task = require('../models/Task');
    const router = express.Router();

    // Read all
    router.get('/', async (req, res, next) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        next(err);
    }
    });

    // Create
    router.post('/', async (req, res, next) => {
    try {
        const { title } = req.body;
        if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });
        const task = await Task.create({ title: title.trim() });
        res.status(201).json(task);
    } catch (err) {
        next(err);
    }
    });

    // Update (title and/or completed)
    router.patch('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, completed } = req.body;
        const updates = {};
        if (typeof title === 'string') updates.title = title.trim();
        if (typeof completed === 'boolean') updates.completed = completed;

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

    // Basic error handler for this router
    router.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
    });

    module.exports = router;
