const express = require('express');
const router = express.Router();
const User = require('../models/User');
const VerificationService = require('../services/verification.service');

// Añadir nuevo endpoint para solicitar verificación
router.post('/register/verify', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Verificar si el email ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        const code = VerificationService.generateCode();
        await VerificationService.sendVerificationEmail(email, code);
        VerificationService.storeCode(email, code);

        res.json({ message: 'Código de verificación enviado' });
    } catch (error) {
        console.error('Error en verificación:', error);
        res.status(500).json({ error: 'Error al enviar el código de verificación' });
    }
});

// Modificar el endpoint de registro existente
router.post('/register', async (req, res) => {
    try {
        const { email, password, verificationCode } = req.body;

        // Verificar el código
        if (!VerificationService.verifyCode(email, verificationCode)) {
            return res.status(400).json({ error: 'Código de verificación inválido o expirado' });
        }

        // Continuar con el registro normal...
        // ...existing registration code...

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

module.exports = router;