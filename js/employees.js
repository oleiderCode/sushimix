let appData = JSON.parse(localStorage.getItem('tipAppData')) || sampleData;


function saveData() {
    localStorage.setItem('tipAppData', JSON.stringify(appData));
}

function loadEmployees() {
    const employeesBody = document.getElementById('employees-body');
    employeesBody.innerHTML = '';

    appData.employees.forEach(emp => {
        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>${emp.id}</td>
                    <td>${emp.name}</td>
                    <td>${emp.position}</td>
                    <td>${emp.status === 'active' ? 'Activo' : 'Inactivo'}</td>
                    <td>
                        <button class="btn btn-danger" onclick="deleteEmployee(${emp.id})">Eliminar</button>
                    </td>
                `;
        employeesBody.appendChild(row);
    });

    // Actualizar selector de empleados en asistencia
    const attendanceEmployee = document.getElementById('attendance-employee');
    attendanceEmployee.innerHTML = '';

    appData.employees.filter(emp => emp.status === 'active').forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.id;
        option.textContent = emp.name;
        attendanceEmployee.appendChild(option);
    });
}

window.loadEmployees = loadEmployees;

function addEmployee(e) {
    e.preventDefault();

    const name = document.getElementById("employee-name").value;
    const position = document.getElementById("employee-position").value;
    const status = document.getElementById("employee-status").value;

    const newId = appData.employees.length > 0
        ? Math.max(...appData.employees.map(emp => emp.id)) + 1
        : 1;

    appData.employees.push({ id: newId, name, position, status });
}
window.addEmployee = addEmployee;
saveData();
loadEmployees();

// e.target.reset();


function deleteEmployee(id) {
    if (confirm("¿Está seguro de eliminar este empleado?")) {
        appData.employees = appData.employees.filter(emp => emp.id !== id);
        saveData();
        loadEmployees();
    }
}

export{
    addEmployee,
    deleteEmployee,
    loadEmployees
}