    const { app } = require('./src/app');
    const { connectDB } = require('./src/db');

    const PORT = process.env.PORT || 5000;
    const MONGODB_URI = process.env.MONGODB_URI;

    connectDB(MONGODB_URI)
    .then(() => {
        app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB', err);
        process.exit(1);
    });
