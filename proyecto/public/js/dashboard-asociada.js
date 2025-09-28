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
        
        if (!response.ok) {
            localStorage.removeItem('token');
            window.location.href = '/login.html';
            return;
        }
    } catch (error) {
        localStorage.removeItem('token');
        window.location.href = '/login.html';
        return;
    }
    
    // Cargar datos del perfil
    await cargarPerfil();
    await cargarPagos();
    await cargarRutinas();
});

async function cargarPerfil() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('/api/usuarios/perfil', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('userName').textContent = data.nombre_completo;
            document.getElementById('planNombre').textContent = data.plan_nombre || 'No asignado';
            document.getElementById('estado').textContent = data.estado;
            
            // Llenar formulario
            document.getElementById('nombre_completo').value = data.nombre_completo;
            document.getElementById('fecha_de_nacimiento').value = data.fecha_de_nacimiento;
            document.getElementById('email').value = data.email;
            document.getElementById('direccion').value = data.direccion;
            document.getElementById('numero_de_contacto').value = data.numero_de_contacto;
            document.getElementById('eps').value = data.eps;
            document.getElementById('estatura_cm').value = data.estatura_cm;
            document.getElementById('peso_kg').value = data.peso_kg;
            
            // Buscar último pago
            const pagosResponse = await fetch(`/api/pagos/usuario/${data.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const pagos = await pagosResponse.json();
            if (pagos.length > 0) {
                const ultimoPago = pagos[0];
                document.getElementById('ultimoPago').textContent = 
                    `${ultimoPago.fecha_de_pago} - $${ultimoPago.monto}`;
            } else {
                document.getElementById('ultimoPago').textContent = 'Ninguno';
            }
        }
    } catch (error) {
        console.error('Error cargando perfil:', error);
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
                    <td>${pago.fecha_de_pago}</td>
                    <td>$${pago.monto}</td>
                    <td>${pago.metodo_de_pago}</td>
                `;
                tbody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error cargando pagos:', error);
    }
}

async function cargarRutinas() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('/api/planes/ejercicio', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const rutinas = await response.json();
        const container = document.getElementById('rutinasContent');
        
        if (response.ok) {
            container.innerHTML = '';
            rutinas.forEach(rutina => {
                const div = document.createElement('div');
                div.className = 'card';
                div.innerHTML = `
                    <div class="card-content">
                        <h3>${rutina.nombre}</h3>
                        <p>${rutina.descripcion}</p>
                        <div style="margin-top: 1rem;">
                            <button class="btn" onclick="verRutina(${rutina.id})">Ver Rutina</button>
                        </div>
                    </div>
                `;
                container.appendChild(div);
            });
        }
    } catch (error) {
        console.error('Error cargando rutinas:', error);
    }
}

function verRutina(id) {
    // Implementar vista detallada de rutina
    alert(`Rutina ID: ${id}`);
}

document.getElementById('perfilForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const perfilData = Object.fromEntries(formData);
    
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('/api/usuarios/perfil', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(perfilData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Perfil actualizado exitosamente');
        } else {
            alert(data.error || 'Error actualizando perfil');
        }
    } catch (error) {
        alert('Error de conexión');
    }
});