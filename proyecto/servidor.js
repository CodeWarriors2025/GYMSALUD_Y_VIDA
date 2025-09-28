const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Importar rutas
const { manejarRutaPrincipal } = require('./rutas/index');
const { manejarRutaAuth } = require('./rutas/auth');
const { manejarRutaUsuarios } = require('./rutas/usuarios');
const { manejarRutaPagos } = require('./rutas/pagos');
const { manejarRutaPlanes } = require('./rutas/planes');
const { manejarRutaContacto } = require('./rutas/contacto');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method;

    // Rutas estáticas
    if (pathname.startsWith('/css/') || pathname.startsWith('/js/') || pathname.startsWith('/images/')) {
        const filePath = path.join(__dirname, 'public', pathname);
        const ext = path.extname(filePath);
        const contentType = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'text/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.jpeg': 'image/jpeg',
            '.webp': 'image/webp',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml'
        }[ext] || 'application/octet-stream';

        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(404);
                res.end('Archivo no encontrado');
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content);
            }
        });
        return;
    }

    // Rutas API
    if (pathname.startsWith('/api/')) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            if (pathname.startsWith('/api/auth/')) {
                manejarRutaAuth(req, res, pathname, method, body, parsedUrl);
            } else if (pathname.startsWith('/api/usuarios/')) {
                manejarRutaUsuarios(req, res, pathname, method, body, parsedUrl);
            } else if (pathname.startsWith('/api/pagos/')) {
                manejarRutaPagos(req, res, pathname, method, body, parsedUrl);
            } else if (pathname.startsWith('/api/planes/')) {
                manejarRutaPlanes(req, res, pathname, method, body, parsedUrl);
            } else if (pathname.startsWith('/api/contacto')) {
                manejarRutaContacto(req, res, pathname, method, body, parsedUrl);
            } else {
                res.writeHead(404);
                res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
            }
        });
    } else {
        // Rutas principales
        manejarRutaPrincipal(req, res, pathname);
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});