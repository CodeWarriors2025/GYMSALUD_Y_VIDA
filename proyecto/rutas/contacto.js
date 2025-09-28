const conexion = require('../db/conexion');
const nodemailer = require('nodemailer');

function manejarRutaContacto(req, res, pathname, method, body, parsedUrl) {
    if (pathname === '/api/contacto' && method === 'POST') {
        const { nombre, email, mensaje } = JSON.parse(body);
        
        if (!nombre || !email || !mensaje) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Todos los campos son requeridos' }));
            return;
        }
        
        // Insertar mensaje en la base de datos
        const insertQuery = 'INSERT INTO mensajes_contacto (nombre, email, mensaje) VALUES (?, ?, ?)';
        conexion.query(insertQuery, [nombre, email, mensaje], (err, result) => {
            if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Error guardando mensaje' }));
                return;
            }
            
            // Enviar correo de notificación (opcional)
            const transporter = nodemailer.createTransporter({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER || 'tu_email@gmail.com',
                    pass: process.env.EMAIL_PASS || 'tu_contraseña'
                }
            });
            
            const mailOptions = {
                from: process.env.EMAIL_USER || 'tu_email@gmail.com',
                to: email,
                subject: 'Confirmación de contacto - Salud y Vida',
                text: `Hola ${nombre},\n\nHemos recibido tu mensaje:\n\n${mensaje}\n\nPronto nos pondremos en contacto contigo.\n\nSaludos,\nEquipo Salud y Vida`
            };
            
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error enviando correo:', error);
                }
            });
            
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Mensaje enviado exitosamente' }));
        });
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
    }
}

module.exports = { manejarRutaContacto };