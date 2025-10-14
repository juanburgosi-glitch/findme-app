const transporter = require('../config/email.config');

// Almacenamiento temporal de códigos (en producción usar Redis)
const verificationCodes = new Map();

class VerificationService {
    static generateCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    static async sendVerificationEmail(email, code) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Código de verificación - FindMe',
            html: `
                <h1>Bienvenido a FindMe</h1>
                <p>Tu código de verificación es: <strong>${code}</strong></p>
                <p>Este código expirará en 10 minutos.</p>
            `
        };

        await transporter.sendMail(mailOptions);
    }

    static storeCode(email, code) {
        verificationCodes.set(email, {
            code,
            timestamp: Date.now()
        });

        // Eliminar código después de 10 minutos
        setTimeout(() => {
            verificationCodes.delete(email);
        }, 600000);
    }

    static verifyCode(email, code) {
        const stored = verificationCodes.get(email);
        if (!stored) return false;
        
        // Verificar si el código no ha expirado (10 minutos)
        if (Date.now() - stored.timestamp > 600000) {
            verificationCodes.delete(email);
            return false;
        }

        return stored.code === code;
    }
}

module.exports = VerificationService;
