const conexion = require('../db/conexion');
const jwt = require('jsonwebtoken');

function verificarToken(req) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return null;
    
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta_jwt');
    } catch (error) {
        return null;
    }
}

function manejarRutaPlanes(req, res, pathname, method, body, parsedUrl) {
    const decoded = verificarToken(req);
    if (!decoded) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Token inválido o no proporcionado' }));
        return;
    }
    
    if (pathname === '/api/planes' && method === 'GET') {
        const query = 'SELECT * FROM planes ORDER BY precio ASC';
        conexion.query(query, (err, results) => {
            if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Error en la base de datos' }));
                return;
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        });
    } else if (pathname === '/api/planes/alimentacion' && method === 'GET') {
        const nivel_acceso = decoded.rol === 'administradora' ? 
            ['Básico', 'Semipersonal', 'Premium'] : 
            decoded.rol === 'asociada' ? ['Básico', 'Semipersonal'] : ['Básico'];
        
        const query = 'SELECT * FROM planes_alimentacion WHERE nivel_de_acceso IN (?) ORDER BY nivel_de_acceso';
        conexion.query(query, [nivel_acceso], (err, results) => {
            if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Error en la base de datos' }));
                return;
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        });
    } else if (pathname === '/api/planes/ejercicio' && method === 'GET') {
        const nivel_acceso = decoded.rol === 'administradora' ? 
            ['Básico', 'Semipersonal', 'Premium'] : 
            decoded.rol === 'asociada' ? ['Básico', 'Semipersonal'] : ['Básico'];
        
        const query = 'SELECT * FROM rutinas_ejercicio WHERE nivel_de_acceso IN (?) ORDER BY nivel_de_acceso';
        conexion.query(query, [nivel_acceso], (err, results) => {
            if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Error en la base de datos' }));
                return;
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        });
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
    }
}

module.exports = { manejarRutaPlanes };