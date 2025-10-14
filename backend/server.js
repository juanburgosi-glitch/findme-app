require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// --- Middleware ---

// 1. CORS Configuration
// This allows your frontend to make requests to your backend
app.use(cors({
    origin: [
        'https://juanburgosi-glitch.github.io', // Your frontend domain
        'http://localhost:3000',
        'http://127.0.0.1:5500' // For local development
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Body Parser
// This allows your server to read JSON from request bodies
app.use(express.json());

// --- Database Connection ---
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully.'))
.catch(err => console.error('MongoDB connection error:', err));

// --- Routes ---

// Import your route files
const authRoutes = require('./routes/auth');
// const userRoutes = require('./routes/user'); // Example for other routes

// Use the routes with a prefix
// This is the crucial part to fix the 404 error
app.use('/api', authRoutes);
// app.use('/api/user', userRoutes); // Example for other routes

// --- Server Start ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
