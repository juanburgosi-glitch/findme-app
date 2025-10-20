const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Almacenamiento temporal de códigos (en producción usar Redis)
const verificationCodes = new Map();

// Configurar nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

// Función para generar código de 6 dígitos
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Endpoint para solicitar código de verificación
router.post('/register/verify', async (req, res) => {
    try {
        const { email } = req.body;

        // Validar email
        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Email inválido' });
        }

        const User = require('../models/user.model'); // Asumiendo que creaste el archivo
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        // Generar y almacenar código
        const code = generateVerificationCode();
        verificationCodes.set(email, {
            code,
            timestamp: Date.now()
        });

        // Enviar email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verificación de cuenta - FindMe',
            html: `
                <h1>Bienvenido a FindMe</h1>
                <p>Tu código de verificación es: <strong>${code}</strong></p>
                <p>Este código expirará en 10 minutos.</p>
            `
        });

        // Eliminar código después de 10 minutos
        setTimeout(() => {
            verificationCodes.delete(email);
        }, 600000);

        res.json({ message: 'Código de verificación enviado' });
    } catch (error) {
        console.error('Error en verificación:', error);
        res.status(500).json({ error: 'Error al enviar el código de verificación' });
    }
});

// Endpoint de registro
router.post('/register', async (req, res) => {
    try {
        const { email, password, verificationCode } = req.body;

        // Verificar código
        const storedData = verificationCodes.get(email);
        if (!storedData || storedData.code !== verificationCode) {
            return res.status(400).json({ error: 'Código de verificación inválido o expirado' });
        }

        // Verificar si el código no ha expirado (10 minutos)
        if (Date.now() - storedData.timestamp > 600000) {
            verificationCodes.delete(email);
            return res.status(400).json({ error: 'El código de verificación ha expirado' });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create(email, hashedPassword);
        
        verificationCodes.delete(email);

        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

// ...resto de endpoints existentes...

module.exports = router;
