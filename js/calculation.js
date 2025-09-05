// Cargar cálculo de propinas
function loadCalculation() {
    // Calcular total de propinas
    const totalTips = appData.tips.reduce((sum, tip) => sum + tip.amount, 0);
    document.getElementById('calc-total-tips').textContent = formatCurrency(totalTips);
    
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
    document.getElementById('calc-total-days').textContent = totalDays;
    
    // Calcular valor por día
    const valuePerDay = totalDays > 0 ? totalTips / totalDays : 0;
    document.getElementById('calc-value-per-day').textContent = formatCurrency(valuePerDay);
    
    // Calcular valor por hora extra (1.5x el valor de una hora regular)
    const valuePerHour = valuePerDay / 8;
    const valuePerExtra = valuePerHour * 1.5;
    document.getElementById('calc-value-per-extra').textContent = formatCurrency(valuePerExtra);
    
    // Generar tabla de cálculo
    const calculationBody = document.getElementById('calculation-body');
    calculationBody.innerHTML = '';
    
    getActiveEmployees().forEach(emp => {
        const daysWorked = employeeDays[emp.id] || 0;
        const extraHours = appData.attendance
            .filter(a => a.employeeId === emp.id && a.status === 'present')
            .reduce((sum, a) => sum + a.extraHours, 0);
        
        const baseTip = daysWorked * valuePerDay;
        const extraTip = extraHours * valuePerExtra;
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
        calculationBody.appendChild(row);
    });
}

// Calcular distribución de propinas
function calculateTips() {
    loadCalculation();
    alert('Cálculo de propinas completado. Revise los resultados en la tabla.');
}

// Configurar event listeners para el cálculo
function setupCalculationListeners() {
    document.getElementById('calculate-tips').addEventListener('click', calculateTips);
    document.getElementById('load-calculation').addEventListener('click', loadCalculation);
    document.getElementById('export-excel').addEventListener('click', () => exportToExcel('calculation-body', 'distribucion-propinas'));
    document.getElementById('export-pdf').addEventListener('click', () => exportToPDF('calculation-body', 'distribucion-propinas'));
}