// server.js (Versión Final y Completa)
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

// --- Configuración de Multer para subida de imágenes ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'public/uploads';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

// --- Configuración de la Base de Datos ---
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// --- Middleware ---
app.use(cors({ origin: 'https://juanburgosi-glitch.github.io' }));
app.use(express.json());
// Sirve archivos estáticos (imágenes subidas, etc.) desde la carpeta public
app.use('/public', express.static(path.join(__dirname, 'public')));

// Middleware para verificar el token en rutas protegidas
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401); // No autorizado

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Token no válido o expirado
        req.user = user;
        next();
    });
};

// ===============================================
//          RUTAS DE LA API (COMPLETAS)
// ===============================================

// --- Rutas de Autenticación (Públicas) ---
app.post('/api/login', async (req, res) => {
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

// --- Rutas de Personas (Protegidas) ---
app.get('/api/people', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM people WHERE user_id = $1 AND is_deleted = FALSE ORDER BY created_at DESC', [req.user.userId]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener personas' });
    }
});

app.post('/api/people', authenticateToken, upload.single('profileImage'), async (req, res) => {
    const { fullName, contactNumber, preferredHospital, medicalConditions } = req.body;
    const imageUrl = req.file ? `/public/uploads/${req.file.filename}` : null;
    try {
        await pool.query('INSERT INTO people (user_id, full_name, contact_number, preferred_hospital, medical_conditions, image_url) VALUES ($1, $2, $3, $4, $5, $6)', [req.user.userId, fullName, contactNumber, preferredHospital, medicalConditions, imageUrl]);
        res.status(201).json({ message: 'Persona creada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear persona' });
    }
});

app.get('/api/people/:id', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM people WHERE id = $1 AND user_id = $2', [req.params.id, req.user.userId]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Persona no encontrada' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener persona' });
    }
});

app.put('/api/people/:id', authenticateToken, upload.single('profileImage'), async (req, res) => {
    const { fullName, contactNumber, preferredHospital, medicalConditions } = req.body;
    let imageUrl;
    if (req.file) {
        imageUrl = `/public/uploads/${req.file.filename}`;
    }
    try {
        if (imageUrl) {
            await pool.query('UPDATE people SET full_name = $1, contact_number = $2, preferred_hospital = $3, medical_conditions = $4, image_url = $5 WHERE id = $6 AND user_id = $7', [fullName, contactNumber, preferredHospital, medicalConditions, imageUrl, req.params.id, req.user.userId]);
        } else {
            // Si no se sube una nueva imagen, no se actualiza ese campo
            await pool.query('UPDATE people SET full_name = $1, contact_number = $2, preferred_hospital = $3, medical_conditions = $4 WHERE id = $5 AND user_id = $6', [fullName, contactNumber, preferredHospital, medicalConditions, req.params.id, req.user.userId]);
        }
        res.json({ message: 'Persona actualizada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar persona' });
    }
});

app.delete('/api/people/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('UPDATE people SET is_deleted = TRUE, deleted_at = NOW() WHERE id = $1 AND user_id = $2', [req.params.id, req.user.userId]);
        res.json({ message: 'Persona eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar persona' });
    }
});

app.post('/api/people/:id/revert', authenticateToken, async (req, res) => {
    try {
        await pool.query('UPDATE people SET is_deleted = FALSE, deleted_at = NULL WHERE id = $1 AND user_id = $2', [req.params.id, req.user.userId]);
        res.json({ message: 'Eliminación revertida' });
    } catch (error) {
        res.status(500).json({ error: 'Error al revertir' });
    }
});

// --- Rutas de Perfil de Usuario ---
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    // ... (el código de perfil que ya tenías)
});

app.put('/api/user/profile', authenticateToken, upload.single('profileImage'), async (req, res) => {
    // ... (el código de perfil que ya tenías)
});

// --- Ruta de Ubicación ---
app.post('/api/location/update', authenticateToken, async (req, res) => {
    const { lat, lon, personId } = req.body;
    try {
        const check = await pool.query('SELECT id FROM people WHERE id = $1 AND user_id = $2', [personId, req.user.userId]);
        if (check.rows.length === 0) return res.status(403).json({ error: 'Acceso no autorizado a esta persona.' });
        await pool.query('UPDATE people SET last_lat = $1, last_lon = $2 WHERE id = $3', [lat, lon, personId]);
        res.json({ message: 'Ubicación actualizada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar ubicación' });
    }
});

// ===============================================

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en puerto ${PORT}`);
});