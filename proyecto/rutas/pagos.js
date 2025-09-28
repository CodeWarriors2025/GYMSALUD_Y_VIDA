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

function manejarRutaPagos(req, res, pathname, method, body, parsedUrl) {
    const decoded = verificarToken(req);
    if (!decoded) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Token inválido o no proporcionado' }));
        return;
    }
    
    const userRole = decoded.rol;
    
    if (pathname === '/api/pagos' && method === 'GET') {
        let query;
        let params = [];
        
        if (userRole === 'asociada') {
            // Asociada solo ve sus propios pagos
            query = `
                SELECT p.*, u.nombre_completo 
                FROM pagos p 
                JOIN usuarios u ON p.usuario_id = u.id 
                WHERE u.id = ?
                ORDER BY p.fecha_de_pago DESC
            `;
            params = [decoded.id];
        } else {
            // Administradora y auxiliar ven todos los pagos
            query = `
                SELECT p.*, u.nombre_completo, u.email 
                FROM pagos p 
                JOIN usuarios u ON p.usuario_id = u.id 
                ORDER BY p.fecha_de_pago DESC
            `;
        }
        
        conexion.query(query, params, (err, results) => {
            if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Error en la base de datos' }));
                return;
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        });
    } else if (pathname === '/api/pagos' && method === 'POST') {
        if (userRole !== 'administradora' && userRole !== 'auxiliar') {
            res.writeHead(403);
            res.end(JSON.stringify({ error: 'Permiso denegado' }));
            return;
        }
        
        const { usuario_id, monto, fecha_de_pago, metodo_de_pago } = JSON.parse(body);
        
        const insertQuery = 'INSERT INTO pagos (usuario_id, monto, fecha_de_pago, metodo_de_pago) VALUES (?, ?, ?, ?)';
        conexion.query(insertQuery, [usuario_id, monto, fecha_de_pago, metodo_de_pago], (err, result) => {
            if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Error registrando pago' }));
                return;
            }
            
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Pago registrado exitosamente', id: result.insertId }));
        });
    } else if (pathname.startsWith('/api/pagos/usuario/') && method === 'GET') {
        const userId = pathname.split('/')[3];
        
        const query = `
            SELECT p.*, u.nombre_completo 
            FROM pagos p 
            JOIN usuarios u ON p.usuario_id = u.id 
            WHERE p.usuario_id = ?
            ORDER BY p.fecha_de_pago DESC
        `;
        
        conexion.query(query, [userId], (err, results) => {
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

module.exports = { manejarRutaPagos };