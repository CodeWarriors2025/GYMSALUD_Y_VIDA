const fs = require('fs');
const path = require('path');

function manejarRutaPrincipal(req, res, pathname) {
    let filePath;
    
    switch (pathname) {
        case '/':
        case '/index':
        case '/index.html':
            filePath = path.join(__dirname, '../public/index.html');
            break;
        case '/contacto':
        case '/contacto.html':
            filePath = path.join(__dirname, '../public/contacto.html');
            break;
        case '/login':
        case '/login.html':
            filePath = path.join(__dirname, '../public/login.html');
            break;
        case '/registro':
        case '/registro.html':
            filePath = path.join(__dirname, '../public/registro.html');
            break;
        case '/dashboard-asociada':
        case '/dashboard-asociada.html':
            filePath = path.join(__dirname, '../public/dashboard-asociada.html');
            break;
        case '/dashboard-admin':
        case '/dashboard-admin.html':
            filePath = path.join(__dirname, '../public/dashboard-admin.html');
            break;
        case '/dashboard-auxiliar':
        case '/dashboard-auxiliar.html':
            filePath = path.join(__dirname, '../public/dashboard-auxiliar.html');
            break;
        case '/planes':
        case '/planes.html':
            filePath = path.join(__dirname, '../public/planes.html');
            break;
        case '/rutinas':
        case '/rutinas.html':
            filePath = path.join(__dirname, '../public/rutinas.html');
            break;
        case '/alimentacion':
        case '/alimentacion.html':
            filePath = path.join(__dirname, '../public/alimentacion.html');
            break;
        case '/perfil':
        case '/perfil.html':
            filePath = path.join(__dirname, '../public/perfil.html');
            break;
        default:
            filePath = path.join(__dirname, '../public/404.html');
            res.writeHead(404, { 'Content-Type': 'text/html' });
            fs.readFile(filePath, (err, content) => {
                if (err) {
                    res.end('Página no encontrada');
                } else {
                    res.end(content);
                }
            });
            return;
    }

    // Si llega aquí, no es un error 404
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            fs.readFile(path.join(__dirname, '../public/404.html'), (err404, content404) => {
                if (err404) {
                    res.writeHead(404);
                    res.end('Página no encontrada');
                } else {
                    res.end(content404);
                }
            });
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        }
    });
}

module.exports = { manejarRutaPrincipal };