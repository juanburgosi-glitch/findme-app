// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');       // Para encriptar y comparar contraseñas
const jwt = require('jsonwebtoken');  // Para crear tokens de sesión
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 10000;

// Configuración de la Base de Datos
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Middleware
app.use(cors({
    origin: 'https://juanburgosi-glitch.github.io' // Permite solicitudes desde tu frontend
}));
app.use(express.json()); // Permite al servidor entender JSON
app.use('/public', express.static(path.join(__dirname, 'public')));


// =======================================================
//          AQUÍ COMIENZAN LAS RUTAS DE LA API
// =======================================================

// Ruta para el inicio de sesión
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });

    } catch (error) {
        console.error('Error en /api/login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// AÑADE AQUÍ LAS DEMÁS RUTAS: /api/register, /api/people, etc.

// =======================================================


// Sirve el archivo principal del frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en puerto ${PORT}`);
});