    const mongoose = require('mongoose');

    const connectDB = async (uri) => {
    if (mongoose.connection.readyState === 1) return mongoose.connection;
    if (!uri) throw new Error('MONGODB_URI not provided');
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri);
    return mongoose.connection;
    };

    const disconnectDB = async () => {
    await mongoose.disconnect();
    };

    module.exports = { connectDB, disconnectDB };
