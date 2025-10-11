// =================================================================
//          SERVIDOR BACK-END CONFIGURADO PARA RENDER
// =================================================================

// 1. IMPORTACIONES Y CONFIGURACIÓN INICIAL
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./src/routes');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://juanburgosi-glitch.github.io',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true
}));

app.use(express.json());
app.use(express.static('public'));

// Rutas
app.use('/api', routes);

// Manejo de errores
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en puerto ${PORT}`);
    console.log(`🔗 Ambiente: ${process.env.NODE_ENV || 'desarrollo'}`);
});