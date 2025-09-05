// Cargar propinas en la tabla
function loadTips() {
    const tipsBody = document.getElementById('tips-body');
    tipsBody.innerHTML = '';
    
    // Ordenar propinas por fecha (más recientes primero)
    const sortedTips = [...appData.tips].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedTips.forEach(tip => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${tip.date}</td>
            <td>${getDayName(tip.date)}</td>
            <td>${formatCurrency(tip.amount)}</td>
            <td>
                <button class="btn btn-danger" onclick="deleteTip('${tip.date}')">Eliminar</button>
            </td>
        `;
        tipsBody.appendChild(row);
    });
}

// Agregar nueva propina
function addTips(e) {
    e.preventDefault();
    
    const date = document.getElementById('tips-date').value;
    const amount = parseFloat(document.getElementById('tips-amount').value);
    
    if (!isValidDate(date)) {
        alert('Por favor ingrese una fecha válida en formato YYYY-MM-DD');
        return;
    }
    
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

// Eliminar propina
function deleteTip(date) {
    if (confirm('¿Está seguro de que desea eliminar este registro de propinas?')) {
        appData.tips = appData.tips.filter(tip => tip.date !== date);
        saveData();
        loadTips();
    }
}

// Configurar event listeners para propinas
function setupTipsListeners() {
    document.getElementById('tips-form').addEventListener('submit', addTips);
}