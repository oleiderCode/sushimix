

function loadEmployees() {
    const employeesBody = document.getElementById("employees-body");
    employeesBody.innerHTML = "";

    appData.employees.forEach(emp => {
        const row = document.createElement("tr");
        row.innerHTML = `
      <td>${emp.id}</td>
      <td>${emp.name}</td>
      <td>${emp.position}</td>
      <td>${emp.status === 'active' ? 'Activo' : 'Inactivo'}</td>
      <td>
        <button class="btn btn-danger" data-id="${emp.id}" class="delete-btn">Eliminar</button>
      </td>
    `;
        employeesBody.appendChild(row);
    });

    // Delegación de eventos
    employeesBody.addEventListener("click", e => {
        if (e.target.classList.contains("delete-btn")) {
            deleteEmployee(Number(e.target.dataset.id));
        }
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

    e.target.reset();


export function deleteEmployee(id) {
    if (confirm("¿Está seguro de eliminar este empleado?")) {
        appData.employees = appData.employees.filter(emp => emp.id !== id);
        saveData();
        loadEmployees();
    }
}
