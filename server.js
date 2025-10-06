// =================================================================
//          SERVIDOR BACK-END CONFIGURADO PARA RENDER
// =================================================================

// 1. IMPORTACIONES Y CONFIGURACIÓN INICIAL
require('dotenv').config(); // Carga las variables de entorno desde .env
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000; // Render usa 10000 por defecto
const JWT_SECRET = process.env.JWT_SECRET; // Es crucial que definas esto en Render

if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET no está definida en las variables de entorno.");
    process.exit(1); // Detiene la app si el secreto no está configurado
}

// 2. CONFIGURACIÓN DE CORS
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:5173', // Puerto por defecto de Vite
        'https://juanburgosi-glitch.github.io',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    optionsSuccessStatus: 200
};

// 3. MIDDLEWARE GENERAL
app.use(cors(corsOptions));
app.use(express.json());
// Sirve los archivos estáticos (imágenes subidas) desde la carpeta 'public'
app.use(express.static('public'));

// 4. CONEXIÓN A POSTGRESQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Requerido por Render para conexiones SSL
    }
});

// Verificación de la conexión
pool.query('SELECT NOW()')
    .then(res => console.log('✅ Conectado a PostgreSQL:', res.rows[0]))
    .catch(err => console.error('Error conectando a la base de datos:', err));

// 5. CONFIGURACIÓN DE MULTER (Subida de archivos)
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // Límite de 10MB
}).single('profileImage'); // El nombre del campo en el formulario debe ser 'profileImage'

// 6. MIDDLEWARE DE VERIFICACIÓN DE TOKEN JWT
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Token inválido o expirado.' });
    }
}


// =================================================================
//                       RUTAS DE LA APLICACIÓN
// =================================================================

// --- Rutas de Autenticación ---
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
    }
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email;';
        const result = await pool.query(query, [email, passwordHash]);
        res.status(201).json({ message: 'Usuario registrado con éxito.', user: result.rows[0] });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'El email ya está registrado.' });
        }
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
    }
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '8h' });
        res.json({ message: 'Inicio de sesión exitoso.', token });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// --- Rutas de Perfil de Usuario ---
app.get('/api/user/profile', verifyToken, async (req, res) => {
    try {
        const query = 'SELECT id, email, contact_number FROM users WHERE id = $1';
        const result = await pool.query(query, [req.userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

app.put('/api/user/profile', verifyToken, async (req, res) => {
    const { contactNumber } = req.body;
    try {
        const query = 'UPDATE users SET contact_number = $1 WHERE id = $2 RETURNING id, email, contact_number;';
        const result = await pool.query(query, [contactNumber, req.userId]);
        res.json({ message: 'Perfil actualizado con éxito.', user: result.rows[0] });
    } catch (error) {
        console.error('Error actualizando perfil:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// --- Rutas de Gestión de Personas ---
app.get('/api/people', verifyToken, async (req, res) => {
    try {
        const query = 'SELECT * FROM people WHERE user_id = $1 AND is_deleted = FALSE ORDER BY created_at DESC';
        const result = await pool.query(query, [req.userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo personas:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

app.get('/api/people/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'SELECT * FROM people WHERE id = $1 AND user_id = $2';
        const result = await pool.query(query, [id, req.userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Persona no encontrada o no autorizada.' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al obtener la persona:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

app.post('/api/people', verifyToken, upload, async (req, res) => {
    const { fullName, contactNumber, preferredHospital, medicalConditions } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    if (!fullName) {
        return res.status(400).json({ error: 'El nombre completo es requerido.' });
    }
    try {
        const query = `
            INSERT INTO people (full_name, contact_number, preferred_hospital, medical_conditions, user_id, image_url) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
        `;
        const values = [fullName, contactNumber, preferredHospital, medicalConditions, req.userId, imageUrl];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creando persona:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// ✅ CORRECCIÓN CRÍTICA: Se añadió el middleware 'upload' para poder cambiar la imagen
app.put('/api/people/:id', verifyToken, upload, async (req, res) => {
    const { id } = req.params;
    const { fullName, contactNumber, preferredHospital, medicalConditions } = req.body;
    if (!fullName) {
        return res.status(400).json({ error: 'El nombre completo es requerido.' });
    }

    try {
        // 1. Obtener la URL de la imagen actual para poder borrarla si se sube una nueva
        const findOldImageQuery = 'SELECT image_url FROM people WHERE id = $1 AND user_id = $2';
        const oldImageResult = await pool.query(findOldImageQuery, [id, req.userId]);
        const oldImageUrl = oldImageResult.rows.length > 0 ? oldImageResult.rows[0].image_url : null;

        // 2. Determinar la nueva URL de la imagen
        let newImageUrl = oldImageUrl; // Por defecto, mantenemos la imagen antigua
        if (req.file) {
            newImageUrl = `/uploads/${req.file.filename}`; // Si se subió un archivo nuevo, usamos su ruta
        }

        // 3. Actualizar la base de datos
        const updateQuery = `
            UPDATE people 
            SET full_name = $1, contact_number = $2, preferred_hospital = $3, medical_conditions = $4, image_url = $5 
            WHERE id = $6 AND user_id = $7 RETURNING *;
        `;
        const values = [fullName, contactNumber, preferredHospital, medicalConditions, newImageUrl, id, req.userId];
        const result = await pool.query(updateQuery, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Persona no encontrada o no autorizada.' });
        }

        // 4. Si la actualización fue exitosa y se subió una nueva imagen, borrar la antigua
        if (req.file && oldImageUrl) {
            fs.unlink(path.join(__dirname, 'public', oldImageUrl), (err) => {
                if (err) console.error("Error al borrar la imagen antigua:", err);
                else console.log("Imagen antigua borrada con éxito:", oldImageUrl);
            });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error al actualizar persona:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

app.delete('/api/people/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'UPDATE people SET is_deleted = TRUE, deleted_at = NOW() WHERE id = $1 AND user_id = $2';
        const result = await pool.query(query, [id, req.userId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Persona no encontrada o no autorizada.' });
        }
        res.status(200).json({ message: 'Persona eliminada (marcada como borrada).' });
    } catch (error) {
        console.error('Error al eliminar persona:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});


// --- Ruta de Ubicación ---
app.post('/api/location/update', verifyToken, async (req, res) => {
    const { lat, lon, personId } = req.body;
    if (lat === undefined || lon === undefined || personId === undefined) {
        return res.status(400).json({ error: 'Faltan datos de ubicación o ID de persona.' });
    }
    try {
        const query = 'UPDATE people SET last_lat = $1, last_lon = $2 WHERE id = $3 AND user_id = $4';
        const result = await pool.query(query, [lat, lon, personId, req.userId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Persona no encontrada o no autorizada.' });
        }
        res.status(200).json({ message: 'Ubicación actualizada con éxito.' });
    } catch (error) {
        console.error('Error al actualizar la ubicación:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// =================================================================
//                      INICIAR SERVIDOR
// =================================================================
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en puerto ${PORT}`);
    console.log(`🔗 Ambiente: ${process.env.NODE_ENV || 'desarrollo'}`);
});