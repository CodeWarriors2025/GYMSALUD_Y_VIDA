document.addEventListener('DOMContentLoaded', async function() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
    
    // Verificar token
    try {
        const response = await fetch('/api/auth/verificar', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        if (!response.ok || data.usuario.rol !== 'auxiliar') {
            localStorage.removeItem('token');
            window.location.href = '/login.html';
            return;
        }
        
        document.getElementById('userName').textContent = data.usuario.nombre_completo;
    } catch (error) {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
        return;
    }
    
    // Cargar datos
    await cargarUsuarios();
    await cargarEstadisticas();
    
    // Evento de formulario de pago
    document.getElementById('pagoForm').addEventListener('submit', registrarPago);
});

async function cargarUsuarios() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('/api/usuarios', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const usuarios = await response.json();
        const tbody = document.getElementById('usuariosBody');
        const select = document.getElementById('usuario_id');
        
        if (response.ok) {
            tbody.innerHTML = '';
            select.innerHTML = '<option value="">Seleccionar Asociada</option>';
            
            usuarios.forEach(usuario => {
                if (usuario.estado === 'activo') {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${usuario.id}</td>
                        <td>${usuario.nombre_completo}</td>
                        <td>${usuario.email}</td>
                        <td>${usuario.plan_nombre || 'No asignado'}</td>
                        <td>${usuario.estado}</td>
                    `;
                    tbody.appendChild(row);
                    
                    const option = document.createElement('option');
                    option.value = usuario.id;
                    option.textContent = `${usuario.nombre_completo} (${usuario.email})`;
                    select.appendChild(option);
                }
            });
        }
    } catch (error) {
        console.error('Error cargando usuarios:', error);
    }
}

async function cargarEstadisticas() {
    const token = localStorage.getItem('token');
    
    try {
        const usuariosResponse = await fetch('/api/usuarios', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const pagosResponse = await fetch('/api/pagos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const usuarios = await usuariosResponse.json();
        const pagos = await pagosResponse.json();
        
        // Calcular estadísticas
        const usuariosActivos = usuarios.filter(u => u.estado === 'activo').length;
        const pagosHoy = pagos.filter(p => p.fecha_de_pago === new Date().toISOString().split('T')[0]).length;
        
        document.getElementById('totalAsociadas').textContent = usuariosActivos;
        document.getElementById('totalPagos').textContent = pagosHoy;
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

async function registrarPago(e) {
    e.preventDefault();
    
    const formData = new FormData(document.getElementById('pagoForm'));
    const pagoData = Object.fromEntries(formData);
    
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('/api/pagos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(pagoData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Pago registrado exitosamente');
            document.getElementById('pagoForm').reset();
            cargarUsuarios(); // Recargar datos
        } else {
            alert(data.error || 'Error registrando pago');
        }
    } catch (error) {
        alert('Error de conexión');
    }
}