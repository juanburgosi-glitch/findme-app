// server.js (Versión con API de Login y People)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 10000;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

app.use(cors({
    origin: 'https://juanburgosi-glitch.github.io'
}));
app.use(express.json());
app.use(express.static(__dirname));
app.use('/public', express.static(path.join(__dirname, 'public')));


// =======================================================
//          ✅ MIDDLEWARE PARA AUTENTICACIÓN
// =======================================================
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

    if (token == null) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user; // Guardamos la info del usuario (ej: { userId: 1 }) en la petición
        next(); // Continuamos a la ruta protegida
    });
};


// =======================================================
//                 RUTAS DE LA API
// =======================================================

// Ruta para el inicio de sesión (Pública)
app.post('/api/login', async (req, res) => {
    // ... (código de login que ya tenías)
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ error: 'Credenciales inválidas' });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ✅ NUEVA RUTA para obtener la lista de personas (Protegida)
app.get('/api/people', authenticateToken, async (req, res) => {
    try {
        // El ID del usuario viene del middleware authenticateToken (req.user.userId)
        const userId = req.user.userId;
        const result = await pool.query(
            'SELECT * FROM people WHERE user_id = $1 AND is_deleted = FALSE ORDER BY created_at DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error en /api/people:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// AÑADE AQUÍ FUTURAS RUTAS: POST /api/people, PUT /api/people/:id, etc.


// =======================================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en puerto ${PORT}`);
});