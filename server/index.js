require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow all origins for now to troubleshoot connectivity
        // In production, we should restrict this to the Vercel domain
        callback(null, true);
    },
    credentials: true
}));
app.use(express.json());

// Database Connection
const promptConnection = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.warn('⚠️ MONGO_URI is missing in .env file. Database will not connect.');
            return;
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err);
    }
};

// Routes
const publicRoutes = require('./routes/publicRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('API Turnero Odontológico is running...');
});

// Start Server
app.listen(PORT, async () => {
    await promptConnection();
    console.log(`🚀 Server running on port ${PORT}`);
});
