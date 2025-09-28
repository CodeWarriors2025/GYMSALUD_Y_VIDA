document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('registroForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const userData = Object.fromEntries(formData);
        
        try {
            const response = await fetch('/api/auth/registro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Usuario registrado exitosamente');
                window.location.href = '/login.html';
            } else {
                alert(data.error || 'Error al registrar usuario');
            }
        } catch (error) {
            alert('Error de conexión');
        }
    });
});