// Cargar tabla de asistencias
function loadAttendanceTable() {
    const attendanceBody = document.getElementById('attendance-body');
    attendanceBody.innerHTML = '';
    
    // Obtener el rango de fechas de la semana seleccionada
    const weekValue = document.getElementById('attendance-week').value;
    const [year, week] = weekValue.split('-W').map(Number);
    const startDate = getDateOfISOWeek(week, year);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        days.push(date.toISOString().split('T')[0]);
    }
    
    // Para cada empleado activo, mostrar su asistencia
    getActiveEmployees().forEach(emp => {
        const row = document.createElement('tr');
        let rowContent = `<td>${emp.name}</td>`;
        
        let totalDays = 0;
        let totalExtra = 0;
        
        days.forEach(day => {
            const attendance = appData.attendance.find(a => 
                a.employeeId === emp.id && a.date === day
            );
            
            if (attendance) {
                if (attendance.status === 'present') {
                    rowContent += `<td class="present">✓<br><small>${attendance.extraHours}h</small></td>`;
                    totalDays++;
                    totalExtra += attendance.extraHours;
                } else {
                    rowContent += `<td class="absent">✗</td>`;
                }
            } else {
                rowContent += `<td>-</td>`;
            }
        });
        
        rowContent += `<td>${totalDays}</td>`;
        rowContent += `<td class="extra-hours">${totalExtra.toFixed(1)}h</td>`;
        
        row.innerHTML = rowContent;
        attendanceBody.appendChild(row);
    });
}

// Agregar nuevo registro de asistencia
function addAttendance(e) {
    e.preventDefault();
    
    const date = document.getElementById('attendance-date').value;
    const employeeId = parseInt(document.getElementById('attendance-employee').value);
    const status = document.getElementById('attendance-status').value;
    const extraHours = parseFloat(document.getElementById('extra-hours').value) || 0;
    
    if (!isValidDate(date)) {
        alert('Por favor ingrese una fecha válida en formato YYYY-MM-DD');
        return;
    }
    
    // Verificar si ya existe un registro para esta fecha y empleado
    const existingIndex = appData.attendance.findIndex(a => 
        a.date === date && a.employeeId === employeeId
    );
    
    if (existingIndex !== -1) {
        appData.attendance[existingIndex] = { date, employeeId, status, extraHours };
    } else {
        appData.attendance.push({ date, employeeId, status, extraHours });
    }
    
    saveData();
    loadAttendanceTable();
    
    // Reset form
    document.getElementById('attendance-form').reset();
}

// Configurar event listeners para asistencias
function setupAttendanceListeners() {
    document.getElementById('attendance-form').addEventListener('submit', addAttendance);
    document.getElementById('load-attendance').addEventListener('click', loadAttendanceTable);
}