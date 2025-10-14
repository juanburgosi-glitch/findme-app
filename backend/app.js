const express = require('express');
const cors = require('cors');
const app = express();

// Configure CORS
app.use(cors({
    origin: [
        'https://juanburgosi-glitch.github.io',
        'http://localhost:3000',
        'http://127.0.0.1:5500'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// ...existing code...