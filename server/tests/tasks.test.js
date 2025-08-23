    // server/tests/tasks.test.js
    const request = require('supertest');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongoose = require('mongoose');
    const { app } = require('../src/app');
    const { connectDB, disconnectDB } = require('../src/db');
    const Task = require('../src/models/Task');

    // Increase default Jest timeout (downloads can take time on first run)
    jest.setTimeout(60000);

    let mongod;
    const atlasUri = process.env.TEST_MONGODB_URI; // Optional: use Atlas for tests if set

    beforeAll(async () => {
    if (atlasUri) {
        // Use your real Atlas (tests will write to a temp DB name)
        const uri = atlasUri.includes('?')
        ? `${atlasUri}&retryWrites=true&w=majority`
        : `${atlasUri}?retryWrites=true&w=majority`;
        await connectDB(uri);
    } else {
        // Use in-memory MongoDB and pin a version that works well on Windows
        mongod = await MongoMemoryServer.create({
        binary: { version: '7.0.14' },
        instance: { storageEngine: 'wiredTiger' }
        });
        const uri = mongod.getUri();
        await connectDB(uri);
    }
    });

    afterAll(async () => {
    try {
        await mongoose.connection.dropDatabase();
    } catch (_) {}
    await disconnectDB();
    if (mongod) await mongod.stop();
    });

    afterEach(async () => {
    await Task.deleteMany({});
    });

    test('POST /api/tasks creates a task', async () => {
    const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Write tests' })
        .expect(201);

    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toBe('Write tests');
    expect(res.body.completed).toBe(false);

    const getRes = await request(app).get('/api/tasks').expect(200);
    expect(getRes.body.length).toBe(1);
    });

    test('DELETE /api/tasks/:id deletes the task', async () => {
    const create = await request(app).post('/api/tasks').send({ title: 'Temp' });
    const id = create.body._id;

    await request(app).delete(`/api/tasks/${id}`).expect(204);

    const getRes = await request(app).get('/api/tasks').expect(200);
    expect(getRes.body.length).toBe(0);
    });
