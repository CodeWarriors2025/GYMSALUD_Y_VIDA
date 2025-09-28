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
        if (!response.ok || data.usuario.rol !== 'administradora') {
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
    await cargarPagos();
    await cargarEstadisticas();
    
    // Evento de búsqueda
    document.getElementById('searchInput').addEventListener('input', function(e) {
        buscarUsuarios(e.target.value);
    });
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
        
        if (response.ok) {
            tbody.innerHTML = '';
            usuarios.forEach(usuario => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${usuario.id}</td>
                    <td>${usuario.nombre_completo}</td>
                    <td>${usuario.email}</td>
                    <td>${usuario.plan_nombre || 'No asignado'}</td>
                    <td>${usuario.estado}</td>
                    <td>
                        <button class="btn-action btn-edit" onclick="editarUsuario(${usuario.id})">Editar</button>
                        <button class="btn-action btn-delete" onclick="pausarUsuario(${usuario.id})">Pausar</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error cargando usuarios:', error);
    }
}

async function cargarPagos() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('/api/pagos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const pagos = await response.json();
        const tbody = document.getElementById('pagosBody');
        
        if (response.ok) {
            tbody.innerHTML = '';
            pagos.forEach(pago => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${pago.id}</td>
                    <td>${pago.nombre_completo}</td>
                    <td>$${pago.monto}</td>
                    <td>${pago.fecha_de_pago}</td>
                    <td>${pago.metodo_de_pago}</td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error cargando pagos:', error);
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
        const totalAsociadas = usuarios.length;
        const totalPagos = pagos.length;
        const ingresosMensuales = pagos.reduce((sum, pago) => sum + parseFloat(pago.monto), 0);
        
        document.getElementById('totalAsociadas').textContent = totalAsociadas;
        document.getElementById('totalPagos').textContent = totalPagos;
        document.getElementById('ingresosMensuales').textContent = `$${ingresosMensuales.toLocaleString()}`;
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

async function buscarUsuarios(busqueda) {
    const token = localStorage.getItem('token');
    
    if (busqueda.trim() === '') {
        await cargarUsuarios();
        return;
    }
    
    try {
        const response = await fetch(`/api/usuarios/buscar?q=${encodeURIComponent(busqueda)}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const usuarios = await response.json();
        const tbody = document.getElementById('usuariosBody');
        
        if (response.ok) {
            tbody.innerHTML = '';
            usuarios.forEach(usuario => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${usuario.id}</td>
                    <td>${usuario.nombre_completo}</td>
                    <td>${usuario.email}</td>
                    <td>${usuario.plan_nombre || 'No asignado'}</td>
                    <td>${usuario.estado}</td>
                    <td>
                        <button class="btn-action btn-edit" onclick="editarUsuario(${usuario.id})">Editar</button>
                        <button class="btn-action btn-delete" onclick="pausarUsuario(${usuario.id})">Pausar</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error buscando usuarios:', error);
    }
}

function editarUsuario(id) {
    // Implementar edición de usuario
    alert(`Editar usuario ID: ${id}`);
}

function pausarUsuario(id) {
    if (confirm('¿Estás seguro de pausar este usuario?')) {
        const token = localStorage.getItem('token');
        
        fetch(`/api/usuarios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ estado: 'pausado' })
        })
        .then(response => response.json())
        .then(data => {
            if (response.ok) {
                alert('Usuario pausado exitosamente');
                cargarUsuarios();
            } else {
                alert(data.error || 'Error pausando usuario');
            }
        })
        .catch(error => {
            alert('Error de conexión');
        });
    }
}