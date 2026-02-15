require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const { MongoMemoryServer } = require('mongodb-memory-server');

// Database Connection
const connectDB = async () => {
    try {
        const uris = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/love_calculator_prank';
        await mongoose.connect(uris, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('MongoDB Connected (Local)');
    } catch (err) {
        console.log('Local MongoDB Connection Failed (' + err.message + '). Starting In-Memory MongoDB...');
        try {
            const mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            console.log('Memory Server URI:', uri);
            await mongoose.connect(uri);
            console.log('MongoDB Connected (In-Memory)');
        } catch (memErr) {
            console.error('Fatal Error: Could not connect to Memory Server.');
            console.error(memErr);
            process.exit(1);
        }
    }
};

connectDB();

// Routes
app.use('/api', apiRoutes);

// Serve frontend files explicitly if needed, but express.static handles most.
// For clean URLs like /prank/:id, we might want to serve prank.html
app.get('/prank/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'prank.html'));
});

app.get('/dashboard/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'dashboard.html'));
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
