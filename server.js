// =================================================================
//          SERVIDOR BACK-END CONFIGURADO PARA RENDER
// =================================================================

// 1. IMPORTAR LIBRERÍAS
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 2. CONFIGURACIÓN INICIAL
const app = express();
const PORT = process.env.PORT || 3000; // Render asigna el puerto automáticamente
const JWT_SECRET = process.env.JWT_SECRET || 'cambiar_en_produccion_usar_variable_de_entorno';

// 3. CONFIGURAR CORS PARA PERMITIR GITHUB PAGES
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:8080',
        'https://juanburgosi-glitch.github.io', // Tu GitHub Pages URL
        process.env.FRONTEND_URL // Variable de entorno adicional
    ].filter(Boolean),
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static('public'));

// 4. CONEXIÓN A POSTGRESQL
// Render proporciona DATABASE_URL automáticamente
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// 5. VERIFICAR CONEXIÓN A LA BASE DE DATOS
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
    } else {
        console.log('✅ Conectado a PostgreSQL:', res.rows[0]);
    }
});

// 6. CONFIGURACIÓN DE MULTER
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 } // 10MB
}).single('profileImage');

// Crear directorio uploads si no existe
const uploadsDir = './public/uploads';
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// ============= RUTAS =============

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

// RUTA PARA SUBIR IMÁGENES
app.post('/api/upload', verifyToken, (req, res) => {
    upload(req, res, (err) => {
        if(err){
            return res.status(400).json({ error: err.message });
        }
        if(req.file == undefined){
            return res.status(400).json({ error: 'No se seleccionó ningún archivo.' });
        }
        res.json({
            message: 'Archivo subido con éxito.',
            filePath: `/uploads/${req.file.filename}`
        });
    });
});

// RUTAS DE AUTENTICACIÓN
app.post('/api/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const query = 'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email;';
        const result = await pool.query(query, [email, passwordHash]);
        res.status(201).json({
            message: 'Usuario registrado con éxito.',
            user: result.rows[0],
        });
    } catch (error) {
        console.error('Error en registro:', error);
        if (error.code === '23505') {
            return res.status(409).json({ error: 'El email ya está registrado.' });
        }
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
        res.json({ message: 'Inicio de sesión exitoso.', token: token });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// MIDDLEWARE DE VERIFICACIÓN DE TOKEN
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

// RUTAS DE PERFIL DE USUARIO
app.get('/api/user/profile', verifyToken, async (req, res) => {
    try {
        const query = 'SELECT id, email, first_name, middle_name, last_name, second_last_name, contact_number FROM users WHERE id = $1';
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
    const { firstName, middleName, lastName, secondLastName, contactNumber } = req.body;
    try {
        const query = `
            UPDATE users 
            SET first_name = $1, middle_name = $2, last_name = $3, second_last_name = $4, contact_number = $5 
            WHERE id = $6 
            RETURNING id, email, first_name, middle_name, last_name, second_last_name, contact_number;
        `;
        const values = [firstName, middleName, lastName, secondLastName, contactNumber, req.userId];
        const result = await pool.query(query, values);
        res.json({ message: 'Perfil actualizado con éxito.', user: result.rows[0] });
    } catch (error) {
        console.error('Error actualizando perfil:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// RUTAS DE GESTIÓN DE PERSONAS
app.get('/api/people', verifyToken, async (req, res) => {
    try {
        const query = 'SELECT id, full_name, medical_conditions, image_url FROM people WHERE user_id = $1 AND is_deleted = FALSE ORDER BY created_at DESC';
        const result = await pool.query(query, [req.userId]);
        const data = result.rows.map(person => ({ ...person, title: person.medical_conditions }));
        res.json(data);
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
            return res.status(404).json({ error: 'Persona no encontrada o no tienes permiso para verla.' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error obteniendo persona:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

app.post('/api/people', verifyToken, async (req, res) => {
    const { fullName, contactNumber, preferredHospital, medicalConditions, imageUrl } = req.body;
    if (!fullName) {
        return res.status(400).json({ error: 'El nombre completo es requerido' });
    }
    try {
        const query = `INSERT INTO people (full_name, contact_number, preferred_hospital, medical_conditions, user_id, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`;
        const values = [fullName, contactNumber, preferredHospital, medicalConditions, req.userId, imageUrl];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creando persona:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

app.put('/api/people/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { fullName, contactNumber, preferredHospital, medicalConditions, imageUrl } = req.body;
    if (!fullName) {
        return res.status(400).json({ error: 'El nombre completo es requerido.' });
    }
    
    try {
        const findOldImageQuery = 'SELECT image_url FROM people WHERE id = $1 AND user_id = $2';
        const oldImageResult = await pool.query(findOldImageQuery, [id, req.userId]);

        if (oldImageResult.rows.length > 0 && oldImageResult.rows[0].image_url && imageUrl !== oldImageResult.rows[0].image_url) {
            const oldImagePath = path.join(__dirname, 'public', oldImageResult.rows[0].image_url);
            
            fs.unlink(oldImagePath, (err) => {
                if (err) {
                    console.error("No se pudo borrar la imagen antigua:", oldImagePath, err);
                } else {
                    console.log("Imagen antigua borrada con éxito:", oldImagePath);
                }
            });
        }
        
        const updateQuery = `UPDATE people SET full_name = $1, contact_number = $2, preferred_hospital = $3, medical_conditions = $4, image_url = $5 WHERE id = $6 AND user_id = $7 RETURNING *;`;
        const values = [fullName, contactNumber, preferredHospital, medicalConditions, imageUrl, id, req.userId];
        const result = await pool.query(updateQuery, values);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Persona no encontrada o no tienes permiso para editarla.' });
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
        const findImageQuery = 'SELECT image_url FROM people WHERE id = $1 AND user_id = $2';
        const imageResult = await pool.query(findImageQuery, [id, req.userId]);

        if (imageResult.rows.length > 0 && imageResult.rows[0].image_url) {
            const imagePath = path.join(__dirname, 'public', imageResult.rows[0].image_url);
            
            fs.unlink(imagePath, (err) => {
                if (err) console.error("No se pudo borrar la imagen al eliminar persona:", imagePath, err);
                else console.log("Imagen de persona eliminada con éxito:", imagePath);
            });
        }

        const deleteQuery = 'UPDATE people SET is_deleted = TRUE WHERE id = $1 AND user_id = $2';
        const deleteResult = await pool.query(deleteQuery, [id, req.userId]);

        if (deleteResult.rowCount === 0) {
            return res.status(404).json({ error: 'Persona no encontrada o no pertenece al usuario.' });
        }
        res.status(200).json({ message: 'Persona marcada como eliminada.' });
    } catch (error) {
        console.error('Error al eliminar persona:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

app.post('/api/people/:id/revert', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const query = 'UPDATE people SET is_deleted = FALSE WHERE id = $1 AND user_id = $2';
        const result = await pool.query(query, [id, req.userId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Persona no encontrada o no pertenece al usuario.' });
        }
        res.status(200).json({ message: 'La eliminación ha sido revertida.' });
    } catch (error) {
        console.error('Error revirtiendo eliminación:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

app.post('/api/location/update', verifyToken, async (req, res) => {
    const { lat, lon, personId } = req.body;
    
    if (lat === undefined || lon === undefined || personId === undefined) {
        return res.status(400).json({ error: 'Faltan datos de latitud, longitud o ID de la persona.' });
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

// INICIAR SERVIDOR
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en puerto ${PORT}`);
    console.log(`🔗 Ambiente: ${process.env.NODE_ENV || 'desarrollo'}`);
});