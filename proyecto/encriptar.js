const bcrypt = require('bcrypt');

// Encriptar una contraseña
const contrasena = '1010234157'; // La contraseña que quieres encriptar

bcrypt.hash(contrasena, 10, function(err, hash) {
    if (err) {
        console.log('Error:', err);
        return;
    }
    
    console.log('Contraseña original:', contrasena);
    console.log('Contraseña encriptada:', hash);
});