const conexion = require('../db/conexion');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

function manejarRutaAuth(req, res, pathname, method, body, parsedUrl) {
    if (pathname === '/api/auth/login' && method === 'POST') {
        const { email, contrasena } = JSON.parse(body);
        
        const query = 'SELECT * FROM usuarios WHERE email = ?';
        conexion.query(query, [email], async (err, results) => {
            if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Error en la base de datos' }));
                return;
            }
            
            if (results.length === 0) {
                res.writeHead(401);
                res.end(JSON.stringify({ error: 'Credenciales inválidas' }));
                return;
            }
            
            const usuario = results[0];
            const passwordValid = await bcrypt.compare(contrasena, usuario.contrasena);
            
            if (!passwordValid) {
                res.writeHead(401);
                res.end(JSON.stringify({ error: 'Credenciales inválidas' }));
                return;
            }
            
            if (usuario.estado !== 'activo') {
                res.writeHead(401);
                res.end(JSON.stringify({ error: 'Usuario inactivo' }));
                return;
            }
            
            const token = jwt.sign(
                { 
                    id: usuario.id, 
                    email: usuario.email, 
                    rol: usuario.rol 
                },
                process.env.JWT_SECRET || 'clave_secreta_jwt',
                { expiresIn: '24h' }
            );
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                token,
                usuario: {
                    id: usuario.id,
                    nombre_completo: usuario.nombre_completo,
                    email: usuario.email,
                    rol: usuario.rol
                }
            }));
        });
    } else if (pathname === '/api/auth/registro' && method === 'POST') {
        const {
            numero_de_identificacion,
            nombre_completo,
            fecha_de_nacimiento,
            direccion,
            email,
            numero_de_contacto,
            eps,
            estatura_cm,
            peso_kg,
            contrasena,
            plan_id
        } = JSON.parse(body);
        
        // Validar que el usuario no exista
        const checkQuery = 'SELECT * FROM usuarios WHERE email = ? OR numero_de_identificacion = ?';
        conexion.query(checkQuery, [email, numero_de_identificacion], async (err, results) => {
            if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Error en la base de datos' }));
                return;
            }
            
            if (results.length > 0) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Email o número de identificación ya registrado' }));
                return;
            }
            
            // Encriptar contraseña
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(contrasena, saltRounds);
            
            const insertQuery = `
                INSERT INTO usuarios (
                    numero_de_identificacion, nombre_completo, fecha_de_nacimiento, 
                    direccion, email, numero_de_contacto, eps, estatura_cm, peso_kg, 
                    contrasena, plan_id, fecha_de_ingreso
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const values = [
                numero_de_identificacion,
                nombre_completo,
                fecha_de_nacimiento,
                direccion,
                email,
                numero_de_contacto,
                eps,
                estatura_cm,
                peso_kg,
                hashedPassword,
                plan_id || null,
                new Date()
            ];
            
            conexion.query(insertQuery, values, (err, result) => {
                if (err) {
                    res.writeHead(500);
                    res.end(JSON.stringify({ error: 'Error al registrar usuario' }));
                    return;
                }
                
                res.writeHead(201);
                res.end(JSON.stringify({ message: 'Usuario registrado exitosamente' }));
            });
        });
    } else if (pathname === '/api/auth/verificar' && method === 'POST') {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            res.writeHead(401);
            res.end(JSON.stringify({ error: 'Token no proporcionado' }));
            return;
        }
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta_jwt');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ valido: true, usuario: decoded }));
        } catch (error) {
            res.writeHead(401);
            res.end(JSON.stringify({ error: 'Token inválido' }));
        }
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
    }
}

module.exports = { manejarRutaAuth };