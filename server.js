// ... (todas las importaciones y configuraciones iniciales se mantienen igual)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;

// --- Configuración de Multer, Pool, y Middleware (sin cambios) ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'public/uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage: storage });
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
app.use(cors({ origin: 'https://juanburgosi-glitch.github.io' }));
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// ===============================================
//               RUTAS DE LA API
// ===============================================

// --- Rutas de Autenticación y Personas (sin cambios) ---
app.post('/api/login', async (req, res) => { /* ... código de login ... */ });
app.get('/api/people', authenticateToken, async (req, res) => { /* ... código de get people ... */ });
// ... (todas las otras rutas de /api/people)

// --- ✅ NUEVAS RUTAS PARA PERFIL DE USUARIO ---
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT email, first_name, middle_name, last_name, second_last_name, contact_number, profile_image_url FROM users WHERE id = $1', [req.user.userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el perfil' });
    }
});

app.put('/api/user/profile', authenticateToken, upload.single('profileImage'), async (req, res) => {
    const { firstName, middleName, lastName, secondLastName, contactNumber } = req.body;
    const imageUrl = req.file ? `/${req.file.path.replace(/\\/g, "/")}` : req.body.existingImageUrl;

    try {
        // Obtenemos la URL actual para no borrarla si no se sube una nueva imagen
        let finalImageUrl = imageUrl;
        if (!req.file) {
            const current = await pool.query('SELECT profile_image_url FROM users WHERE id = $1', [req.user.userId]);
            finalImageUrl = current.rows[0]?.profile_image_url;
        }

        const query = `
            UPDATE users SET 
            first_name = $1, middle_name = $2, last_name = $3, second_last_name = $4, contact_number = $5, profile_image_url = $6
            WHERE id = $7
        `;
        await pool.query(query, [firstName, middleName, lastName, secondLastName, contactNumber, finalImageUrl, req.user.userId]);
        res.json({ message: 'Perfil actualizado correctamente.' });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ error: 'Error al actualizar el perfil' });
    }
});

// --- Rutas de Ubicación (sin cambios) ---
app.post('/api/location/update', authenticateToken, async (req, res) => { /* ... código de update location ... */ });

// ===============================================

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en puerto ${PORT}`);
});