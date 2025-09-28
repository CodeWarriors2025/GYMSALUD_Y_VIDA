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

function manejarRutaUsuarios(req, res, pathname, method, body, parsedUrl) {
    const decoded = verificarToken(req);
    if (!decoded) {
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Token inválido o no proporcionado' }));
        return;
    }
    
    const userId = decoded.id;
    const userRole = decoded.rol;
    
    if (pathname === '/api/usuarios' && method === 'GET') {
        let query;
        let params = [];
        
        if (userRole === 'administradora') {
            query = `
                SELECT u.*, p.nombre as plan_nombre 
                FROM usuarios u 
                LEFT JOIN planes p ON u.plan_id = p.id 
                ORDER BY u.fecha_de_creacion DESC
            `;
        } else if (userRole === 'auxiliar') {
            query = `
                SELECT u.*, p.nombre as plan_nombre 
                FROM usuarios u 
                LEFT JOIN planes p ON u.plan_id = p.id 
                WHERE u.estado = 'activo'
                ORDER BY u.fecha_de_creacion DESC
            `;
        } else {
            // Asociada solo puede ver su información
            query = `
                SELECT u.*, p.nombre as plan_nombre 
                FROM usuarios u 
                LEFT JOIN planes p ON u.plan_id = p.id 
                WHERE u.id = ?
            `;
            params = [userId];
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
    } else if (pathname === '/api/usuarios/buscar' && method === 'GET') {
        const { q } = parsedUrl.query;
        if (!q) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Parámetro de búsqueda requerido' }));
            return;
        }
        
        const searchQuery = `
            SELECT u.*, p.nombre as plan_nombre 
            FROM usuarios u 
            LEFT JOIN planes p ON u.plan_id = p.id 
            WHERE u.nombre_completo LIKE ? OR u.email LIKE ? OR u.numero_de_identificacion LIKE ?
            ORDER BY u.fecha_de_creacion DESC
        `;
        
        const searchTerm = `%${q}%`;
        conexion.query(searchQuery, [searchTerm, searchTerm, searchTerm], (err, results) => {
            if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Error en la base de datos' }));
                return;
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results));
        });
    } else if (pathname === '/api/usuarios/perfil' && method === 'GET') {
        const query = `
            SELECT u.*, p.nombre as plan_nombre 
            FROM usuarios u 
            LEFT JOIN planes p ON u.plan_id = p.id 
            WHERE u.id = ?
        `;
        
        conexion.query(query, [userId], (err, results) => {
            if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Error en la base de datos' }));
                return;
            }
            
            if (results.length === 0) {
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'Usuario no encontrado' }));
                return;
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(results[0]));
        });
    } else if (pathname === '/api/usuarios/perfil' && method === 'PUT') {
        const {
            nombre_completo,
            fecha_de_nacimiento,
            direccion,
            numero_de_contacto,
            eps,
            estatura_cm,
            peso_kg
        } = JSON.parse(body);
        
        const updateQuery = `
            UPDATE usuarios 
            SET nombre_completo = ?, fecha_de_nacimiento = ?, direccion = ?, 
                numero_de_contacto = ?, eps = ?, estatura_cm = ?, peso_kg = ?, 
                fecha_de_actualizacion = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        const values = [
            nombre_completo,
            fecha_de_nacimiento,
            direccion,
            numero_de_contacto,
            eps,
            estatura_cm,
            peso_kg,
            userId
        ];
        
        conexion.query(updateQuery, values, (err, result) => {
            if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Error actualizando perfil' }));
                return;
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Perfil actualizado exitosamente' }));
        });
    } else if (pathname.startsWith('/api/usuarios/') && method === 'PUT') {
        if (userRole !== 'administradora' && userRole !== 'auxiliar') {
            res.writeHead(403);
            res.end(JSON.stringify({ error: 'Permiso denegado' }));
            return;
        }
        
        const userIdToUpdate = pathname.split('/')[3];
        const { estado, plan_id } = JSON.parse(body);
        
        const updateQuery = `
            UPDATE usuarios 
            SET estado = ?, plan_id = ?, fecha_de_actualizacion = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        conexion.query(updateQuery, [estado, plan_id, userIdToUpdate], (err, result) => {
            if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Error actualizando usuario' }));
                return;
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Usuario actualizado exitosamente' }));
        });
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
    }
}

module.exports = { manejarRutaUsuarios };