document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // Verificar rol
    fetch('/api/auth/verificar', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.usuario.rol !== 'administradora' && data.usuario.rol !== 'auxiliar') {
            alert('Acceso denegado');
            window.location.href = '/';
            return;
        }
    });

    document.getElementById('registroAsociadaForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const userData = Object.fromEntries(formData);
        
        // Agregar contraseña igual al número de identificación
        userData.contrasena = userData.numero_de_identificacion;
        userData.estado = 'activo';
        userData.fecha_de_ingreso = new Date().toISOString().split('T')[0];
        
        try {
            const response = await fetch('/api/usuarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Asociada creada exitosamente');
                window.location.href = '/dashboard-auxiliar.html'; // O dashboard-admin.html
            } else {
                alert(data.error || 'Error creando asociada');
            }
        } catch (error) {
            alert('Error de conexión');
        }
    });
});