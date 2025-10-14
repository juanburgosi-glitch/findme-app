const nodemailer = require('nodemailer');

class VerificationService {
    constructor() {
        this.codes = new Map();
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD
            }
        });
    }

    generateCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async sendVerificationEmail(email, code) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verificación de cuenta - FindMe',
            html: `
                <h1>Bienvenido a FindMe</h1>
                <p>Tu código de verificación es: <strong>${code}</strong></p>
                <p>Este código expirará en 10 minutos.</p>
            `
        };

        await this.transporter.sendMail(mailOptions);
    }

    storeCode(email, code) {
        this.codes.set(email, {
            code,
            timestamp: Date.now()
        });

        // Eliminar código después de 10 minutos
        setTimeout(() => {
            this.codes.delete(email);
        }, 600000);
    }

    verifyCode(email, code) {
        const stored = this.codes.get(email);
        if (!stored) return false;
        
        if (Date.now() - stored.timestamp > 600000) {
            this.codes.delete(email);
            return false;
        }

        return stored.code === code;
    }
}

module.exports = new VerificationService();
