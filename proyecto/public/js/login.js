document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const numero_identificacion = formData.get('numero_identificacion');
        const contrasena = formData.get('contrasena');
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ numero_identificacion, contrasena })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.token);
                
                // Redirigir según el rol
                switch(data.usuario.rol) {
                    case 'administradora':
                        window.location.href = '/dashboard-admin.html';
                        break;
                    case 'auxiliar':
                        window.location.href = '/dashboard-auxiliar.html';
                        break;
                    case 'asociada':
                        window.location.href = '/dashboard-asociada.html';
                        break;
                    default:
                        window.location.href = '/dashboard-asociada.html';
                }
            } else {
                alert(data.error || 'Credenciales inválidas');
            }
        } catch (error) {
            alert('Error de conexión');
        }
    });
});