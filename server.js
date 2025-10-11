// server.js (Versión con la ruta /api/login)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt'); // Necesitas instalar: npm install bcrypt
const jwt = require('jsonwebtoken'); // Necesitas instalar: npm install jsonwebtoken
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
app.use(cors()); // Asegúrate de que cors esté configurado para permitir tu URL de GitHub Pages
app.use(express.json());
app.use(express.static(__dirname)); // Sirve archivos desde la raíz

// =======================================================
//          ✅ RUTAS DE API AÑADIDAS AQUÍ
// =======================================================

// Ruta para el inicio de sesión
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
    }
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });

    } catch (error) {
        console.error('Error en /api/login:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// Aquí debes agregar las otras rutas (/api/register, /api/people, etc.)

// =======================================================

// Ruta principal para servir el frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en puerto ${PORT}`);
});