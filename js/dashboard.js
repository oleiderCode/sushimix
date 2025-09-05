// Cargar dashboard
function loadDashboard() {
    // Calcular total de propinas
    const totalTips = appData.tips.reduce((sum, tip) => sum + tip.amount, 0);
    document.getElementById('total-tips').textContent = formatCurrency(totalTips);
    
    // Contar empleados activos
    const activeEmployees = getActiveEmployees().length;
    document.getElementById('total-employees').textContent = activeEmployees;
    
    // Calcular días trabajados
    const employeeDays = {};
    appData.attendance.forEach(record => {
        if (record.status === 'present') {
            if (!employeeDays[record.employeeId]) {
                employeeDays[record.employeeId] = 0;
            }
            employeeDays[record.employeeId]++;
        }
    });
    
    const totalDays = Object.values(employeeDays).reduce((sum, days) => sum + days, 0);
    document.getElementById('total-days').textContent = totalDays;
    
    // Calcular valor por día
    const valuePerDay = totalDays > 0 ? totalTips / totalDays : 0;
    document.getElementById('value-per-day').textContent = formatCurrency(valuePerDay);
    
    // Generar tabla de distribución
    const distributionBody = document.getElementById('distribution-body');
    distributionBody.innerHTML = '';
    
    getActiveEmployees().forEach(emp => {
        const daysWorked = employeeDays[emp.id] || 0;
        const extraHours = appData.attendance
            .filter(a => a.employeeId === emp.id && a.status === 'present')
            .reduce((sum, a) => sum + a.extraHours, 0);
        
        const baseTip = daysWorked * valuePerDay;
        const extraTip = extraHours * (valuePerDay / 8) * 1.5; // 1.5x por hora extra
        const totalTip = baseTip + extraTip;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${emp.name}</td>
            <td>${daysWorked}</td>
            <td>${extraHours.toFixed(1)}</td>
            <td>${formatCurrency(baseTip)}</td>
            <td>${formatCurrency(extraTip)}</td>
            <td>${formatCurrency(totalTip)}</td>
        `;
        distributionBody.appendChild(row);
    });
}

// Configurar event listeners para el dashboard
function setupDashboardListeners() {
    document.getElementById('load-week').addEventListener('click', loadDashboard);
}