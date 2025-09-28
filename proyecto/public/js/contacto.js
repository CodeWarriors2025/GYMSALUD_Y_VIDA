document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const contactoData = Object.fromEntries(formData);
        
        try {
            const response = await fetch('/api/contacto', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(contactoData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Mensaje enviado exitosamente');
                form.reset();
            } else {
                alert(data.error || 'Error enviando mensaje');
            }
        } catch (error) {
            alert('Error de conexión');
        }
    });
});