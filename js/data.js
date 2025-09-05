// Datos de ejemplo
window.sampleData = {
  employees: [
    { id: 1, name: "Oleider gonzalez", position: "Auxiliar", status: "active" },
    { id: 2, name: "Paty", position: "Auxiliar", status: "active" },
    { id: 3, name: "Cristofer", position: "Auxiliar", status: "active" },
    { id: 4, name: "Francisco", position: "Cociner", status: "active" },
    { id: 5, name: "Alan", position: "Auxiliar", status: "active" }

  ],
  tips: [
    { date: "2025-08-01", amount: 120.00 },
    { date: "2025-08-02", amount: 150.50 },
    { date: "2025-08-03", amount: 130.75 },
    { date: "2025-08-04", amount: 160.00 },
    { date: "2025-08-05", amount: 170.25 },
    { date: "2025-08-06", amount: 180.00 },
    { date: "2025-08-07", amount: 200.00 }
  ],
  attendance: []
};

// Estado global
window.appData = JSON.parse(localStorage.getItem('tipAppData')) || window.sampleData;

// Guardar datos en localStorage
window.saveData = function saveData() {
  localStorage.setItem('tipAppData', JSON.stringify(window.appData));
}
