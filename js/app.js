// Inicializar la aplicación
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
    loadDashboard();
    
    // Configurar event listeners
    setupEmployeeListeners();
    setupTipsListeners();
    setupAttendanceListeners();
    setupDashboardListeners();
    setupCalculationListeners();
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);