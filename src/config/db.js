const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        };

        cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongooseInstance) => {
            console.log(`✅ MongoDB Connecté | Host: ${mongooseInstance.connection.host} | DB: ${mongooseInstance.connection.name}`);
            return mongooseInstance;
        }).catch((error) => {
            console.error(`❌ Erreur de connexion MongoDB : ${error.message}`);
            cached.promise = null; // reset cache on failure so next request tries again
            throw error;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
};

module.exports = connectDB;
