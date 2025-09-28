// Script principal para la página de inicio
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el usuario está logueado
    const token = localStorage.getItem('token');
    if (token) {
        // Actualizar enlaces de navegación
        const navLinks = document.querySelector('.nav-links');
        navLinks.innerHTML = `
            <li><a href="/">Inicio</a></li>
            <li><a href="/planes.html">Planes</a></li>
            <li><a href="/rutinas.html">Rutinas</a></li>
            <li><a href="/alimentacion.html">Alimentación</a></li>
            <li><a href="/contacto.html">Contacto</a></li>
            <li><a href="/dashboard-asociada.html">Mi Perfil</a></li>
            <li><a href="#" onclick="cerrarSesion()">Cerrar Sesión</a></li>
        `;
    }
});

function cerrarSesion() {
    localStorage.removeItem('token');
    window.location.href = '/';
}