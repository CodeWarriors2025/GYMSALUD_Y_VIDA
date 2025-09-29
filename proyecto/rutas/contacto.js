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
            
            // Configurar Nodemailer
            const transporter = nodemailer.createTransporter({
                service: 'gmail',
                auth: {
                    user: 'svgimnasio@gmail.com',
                    pass: 'eadr bhhk lmiy xozc' // NO es tu contraseña normal
                }
            });
            
            // Enviar correo de notificación
            const mailOptions = {
                from: 'svgimnasio@gmail.com',
                to: 'svgimnasio@gmail.com', // Tu mismo correo
                subject: `Nuevo mensaje de contacto de ${nombre}`,
                text: `Nombre: ${nombre}\nEmail: ${email}\nMensaje: ${mensaje}\n\nFecha: ${new Date()}`
            };
            
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log('Error enviando correo:', error);
                    // No detenemos el proceso si falla el correo
                } else {
                    console.log('Correo enviado:', info.response);
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