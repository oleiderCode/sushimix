// Datos de ejemplo para simular la aplicación
        const sampleData = {
            employees: [
                
            ],
            tips: [
                
            ],
            attendance: [
                
            ]
        };

        // Almacenamiento local
        let appData = JSON.parse(localStorage.getItem('tipAppData')) || sampleData;

        // Funciones de la aplicación
        function initApp() {
            // Inicializar pestañas
            document.querySelectorAll('.tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
                    
                    tab.classList.add('active');
                    document.getElementById(tab.dataset.tab).classList.add('active');
                });
            });
            
            // Cargar datos iniciales
            loadEmployees();
            loadTips();
            loadAttendanceTable();
            loadCalculation();
            
            // Configurar event listeners
            document.getElementById('employee-form').addEventListener('submit', addEmployee);
            document.getElementById('tips-form').addEventListener('submit', addTips);
            document.getElementById('attendance-form').addEventListener('submit', addAttendance);
            document.getElementById('calculate-tips').addEventListener('click', calculateTips);
            document.getElementById('load-week').addEventListener('click', loadDashboard);
            document.getElementById('load-attendance').addEventListener('click', loadAttendanceTable);
            document.getElementById('load-calculation').addEventListener('click', loadCalculation);
            
            // Cargar dashboard
            loadDashboard();
        }

        function loadDashboard() {
            // Calcular total de propinas
            const totalTips = appData.tips.reduce((sum, tip) => sum + tip.amount, 0);
            document.getElementById('total-tips').textContent = `$${totalTips.toFixed(2)}`;
            
            // Contar empleados activos
            const activeEmployees = appData.employees.filter(emp => emp.status === 'active').length;
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
            document.getElementById('value-per-day').textContent = `$${valuePerDay.toFixed(2)}`;
            
            // Generar tabla de distribución
            const distributionBody = document.getElementById('distribution-body');
            distributionBody.innerHTML = '';
            
            appData.employees.filter(emp => emp.status === 'active').forEach(emp => {
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
                    <td>$${baseTip.toFixed(2)}</td>
                    <td>$${extraTip.toFixed(2)}</td>
                    <td>$${totalTip.toFixed(2)}</td>
                `;
                distributionBody.appendChild(row);
            });
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

        function addEmployee(e) {
            e.preventDefault();
            
            const name = document.getElementById('employee-name').value;
            const position = document.getElementById('employee-position').value;
            const status = document.getElementById('employee-status').value;
            
            const newId = appData.employees.length > 0 
                ? Math.max(...appData.employees.map(emp => emp.id)) + 1 
                : 1;
            
            appData.employees.push({
                id: newId,
                name,
                position,
                status
            });
            
            saveData();
            loadEmployees();
            
            // Reset form
            document.getElementById('employee-form').reset();
        }

        function deleteEmployee(id) {
            if (confirm('¿Está seguro de que desea eliminar este empleado?')) {
                appData.employees = appData.employees.filter(emp => emp.id !== id);
                saveData();
                loadEmployees();
            }
        }

        function loadTips() {
            const tipsBody = document.getElementById('tips-body');
            tipsBody.innerHTML = '';
            
            appData.tips.forEach(tip => {
                const date = new Date(tip.date);
                const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                const dayName = dayNames[date.getDay()];
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${tip.date}</td>
                    <td>${dayName}</td>
                    <td>$${tip.amount.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-danger" onclick="deleteTip('${tip.date}')">Eliminar</button>
                    </td>
                `;
                tipsBody.appendChild(row);
            });
        }

        function addTips(e) {
            e.preventDefault();
            
            const date = document.getElementById('tips-date').value;
            const amount = parseFloat(document.getElementById('tips-amount').value);
            
            // Verificar si ya existe un registro para esta fecha
            const existingIndex = appData.tips.findIndex(tip => tip.date === date);
            
            if (existingIndex !== -1) {
                appData.tips[existingIndex].amount = amount;
            } else {
                appData.tips.push({ date, amount });
            }
            
            saveData();
            loadTips();
            
            // Reset form
            document.getElementById('tips-form').reset();
        }

        function deleteTip(date) {
            if (confirm('¿Está seguro de que desea eliminar este registro de propinas?')) {
                appData.tips = appData.tips.filter(tip => tip.date !== date);
                saveData();
                loadTips();
            }
        }

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
            appData.employees.filter(emp => emp.status === 'active').forEach(emp => {
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

        function addAttendance(e) {
            e.preventDefault();
            
            const date = document.getElementById('attendance-date').value;
            const employeeId = parseInt(document.getElementById('attendance-employee').value);
            const status = document.getElementById('attendance-status').value;
            const extraHours = parseFloat(document.getElementById('extra-hours').value) || 0;
            
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

        function loadCalculation() {
            // Calcular total de propinas
            const totalTips = appData.tips.reduce((sum, tip) => sum + tip.amount, 0);
            document.getElementById('calc-total-tips').textContent = `$${totalTips.toFixed(2)}`;
            
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
            document.getElementById('calc-value-per-day').textContent = `$${valuePerDay.toFixed(2)}`;
            
            // Calcular valor por hora extra (1.5x el valor de una hora regular)
            const valuePerHour = valuePerDay / 8;
            const valuePerExtra = valuePerHour * 1.5;
            document.getElementById('calc-value-per-extra').textContent = `$${valuePerExtra.toFixed(2)}`;
            
            // Generar tabla de cálculo
            const calculationBody = document.getElementById('calculation-body');
            calculationBody.innerHTML = '';
            
            appData.employees.filter(emp => emp.status === 'active').forEach(emp => {
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
                    <td>$${baseTip.toFixed(2)}</td>
                    <td>$${extraTip.toFixed(2)}</td>
                    <td>$${totalTip.toFixed(2)}</td>
                `;
                calculationBody.appendChild(row);
            });
        }

        function calculateTips() {
            loadCalculation();
            alert('Cálculo de propinas completado. Revise los resultados en la tabla.');
        }

        function saveData() {
            localStorage.setItem('tipAppData', JSON.stringify(appData));
        }

        // Función auxiliar para obtener la fecha de inicio de una semana ISO
        function getDateOfISOWeek(week, year) {
            const simple = new Date(year, 0, 1 + (week - 1) * 7);
            const dow = simple.getDay();
            const ISOweekStart = simple;
            if (dow <= 4) {
                ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
            } else {
                ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
            }
            return ISOweekStart;
        }

        // Inicializar la aplicación cuando el DOM esté listo
        document.addEventListener('DOMContentLoaded', initApp);