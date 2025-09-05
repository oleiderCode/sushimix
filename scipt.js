// Valor de la hora extra
const valorHoraExtra = 36;

// Mostrar el valor de la hora extra en un elemento oculto
document.addEventListener('DOMContentLoaded', () => {
    const info = document.createElement('div');
    info.style.display = 'none';
    info.id = 'valorHoraExtraInfo';
    info.textContent = `Valor hora extra: $${valorHoraExtra}`;
    document.body.appendChild(info);
});

function setDefaultFecha() {
    const fechaInput = document.getElementById('fecha');
    const now = new Date();
    now.setHours(now.getHours() - 5);
    fechaInput.value = now.toISOString().split('T')[0];
}

function setDefaultHoras() {
    const tiempoJornada = document.getElementById('tiempoJornada').value;
    const entradaInput = document.getElementById('entrada');
    const salidaInput = document.getElementById('salida');
    if (tiempoJornada === '11-20') {
        entradaInput.value = '11:00';
        salidaInput.value = '20:00';
    } else {
        entradaInput.value = '16:00';
        salidaInput.value = '01:00';
    }
}

document.getElementById('tiempoJornada').addEventListener('change', setDefaultHoras);

window.onload = function() {
    setDefaultFecha();
    setDefaultHoras();
};

function agregarRegistro() {
    const fecha = document.getElementById('fecha').value;
    const entrada = document.getElementById('entrada').value;
    const salida = document.getElementById('salida').value;
    const sueldoBase = parseFloat(document.getElementById('sueldoBase').value) || 0;
    const tipoJornada = document.getElementById('tipoJornada').value;
    const tiempoJornada = document.getElementById('tiempoJornada').options[document.getElementById('tiempoJornada').selectedIndex].text;
    const descuentos = parseFloat(document.getElementById('descuentos').value) || 0;

    let horasTrabajadas = calcularHoras(entrada, salida);
    let horasExtra = Math.max(0, horasTrabajadas - 9); // Solo después de la 9ª hora
    let pagoHorasExtra = horasExtra * valorHoraExtra;
    let pagoDiario = sueldoBase + pagoHorasExtra;
    let netoDiario = pagoDiario - descuentos;

    const tabla = document.getElementById('tablaHoras').getElementsByTagName('tbody')[0];
    const fila = tabla.insertRow();
    fila.innerHTML = `
        <td>${fecha}</td>
        <td>${entrada}</td>
        <td>${salida}</td>
        <td>${tiempoJornada}</td>
        <td>${horasTrabajadas}</td>
        <td>${horasExtra}</td>
        <td>${sueldoBase.toFixed(2)}</td>
        <td>${pagoDiario.toFixed(2)}</td>
        <td>${descuentos.toFixed(2)}</td>
        <td>${netoDiario.toFixed(2)}</td>
        <td><button onclick="eliminarRegistro(this)">Eliminar</button></td>
    `;
    actualizarResumen();
}

function calcularHoras(entrada, salida) {
    const [hEntrada, mEntrada] = entrada.split(':').map(Number);
    const [hSalida, mSalida] = salida.split(':').map(Number);
    let inicio = new Date(2000, 0, 1, hEntrada, mEntrada);
    let fin = new Date(2000, 0, 1, hSalida, mSalida);
    if (fin <= inicio) fin.setDate(fin.getDate() + 1);
    return ((fin - inicio) / (1000 * 60 * 60)).toFixed(2);
}

function eliminarRegistro(btn) {
    btn.parentElement.parentElement.remove();
    actualizarResumen();
}

function actualizarResumen() {
    const filas = document.querySelectorAll('#tablaHoras tbody tr');
    let totalNormales = 0,
        totalExtra = 0,
        totalPagado = 0,
        totalDescuentos = 0,
        netoTotal = 0;
    filas.forEach(fila => {
        totalNormales += parseFloat(fila.cells[4].textContent) || 0;
        totalExtra += parseFloat(fila.cells[5].textContent) || 0;
        totalPagado += parseFloat(fila.cells[7].textContent) || 0;
        totalDescuentos += parseFloat(fila.cells[8].textContent) || 0;
        netoTotal += parseFloat(fila.cells[9].textContent) || 0;
    });
    document.getElementById('totalHorasNormales').textContent = totalNormales.toFixed(2);
    document.getElementById('totalHorasExtra').textContent = totalExtra.toFixed(2);
    document.getElementById('totalPagado').textContent = totalPagado.toFixed(2);
    document.getElementById('totalDescuentos').textContent = totalDescuentos.toFixed(2);
    document.getElementById('netoTotal').textContent = netoTotal.toFixed(2);
}

function generarPDFReporteSemanal(fechaInicio, fechaFin) {
    // Verificar que jsPDF esté cargado
    if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
        alert('jsPDF no está cargado. Agrega la librería antes de generar el PDF.');
        return;
    }

    const jsPDF = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
    const doc = new jsPDF();

    // Calcular número de semana
    const semana = getNumeroSemana(fechaInicio);

    // Encabezado
    doc.setFontSize(18);
    doc.text('Reporte Semanal de Horas Laborales', 10, 15);

    doc.setFontSize(12);
    doc.text(`Semana ${semana} del año ${fechaInicio.getFullYear()}`, 10, 25);
    doc.text(`Desde: ${fechaInicio.toISOString().split('T')[0]}  Hasta: ${fechaFin.toISOString().split('T')[0]}`, 10, 32);

    // Encabezados de tabla
    let y = 45;
    doc.setFontSize(10);
    doc.text('Fecha', 10, y);
    doc.text('Entrada', 30, y);
    doc.text('Salida', 50, y);
    doc.text('Horas Trab.', 70, y);
    doc.text('Horas Extra', 90, y);
    doc.text('Pago Diario', 115, y);
    doc.text('Neto Diario', 140, y);

    y += 6;

    // Recorrer filas de la tabla HTML
    const filas = document.querySelectorAll('#tablaHoras tbody tr');
    filas.forEach(fila => {
        const fecha = fila.cells[0].textContent;
        const entrada = fila.cells[1].textContent;
        const salida = fila.cells[2].textContent;
        const horasTrab = fila.cells[4].textContent;
        const horasExtra = fila.cells[5].textContent;
        const pagoDiario = fila.cells[7].textContent;
        const netoDiario = fila.cells[9].textContent;

        doc.text(fecha, 10, y);
        doc.text(entrada, 30, y);
        doc.text(salida, 50, y);
        doc.text(horasTrab, 75, y, { align: 'right' });
        doc.text(horasExtra, 95, y, { align: 'right' });
        doc.text(`$${pagoDiario}`, 115, y);
        doc.text(`$${netoDiario}`, 140, y);

        y += 6;

        // Salto de página si se llena
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
    });

    // Resumen final
    y += 10;
    doc.setFontSize(12);
    doc.text('Resumen:', 10, y);
    y += 6;
    doc.setFontSize(10);
    doc.text(`Total Horas Normales: ${document.getElementById('totalHorasNormales').textContent}`, 10, y);
    y += 5;
    doc.text(`Total Horas Extra: ${document.getElementById('totalHorasExtra').textContent}`, 10, y);
    y += 5;
    doc.text(`Total Pagado: $${document.getElementById('totalPagado').textContent}`, 10, y);
    y += 5;
    doc.text(`Total Descuentos: $${document.getElementById('totalDescuentos').textContent}`, 10, y);
    y += 5;
    doc.text(`Neto Total: $${document.getElementById('netoTotal').textContent}`, 10, y);

    // Guardar PDF
    doc.save(`reporte_semanal_sem${semana}_${fechaInicio.getFullYear()}.pdf`);
}


// Genera 10 registros de la última semana y crea el resumen semanal en PDF
function generarReporteSemanal() {
    // Calcula el último domingo y sábado
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const ultimoDomingo = new Date(hoy);
    ultimoDomingo.setDate(hoy.getDate() - diaSemana);
    const sabado = new Date(ultimoDomingo);
    sabado.setDate(ultimoDomingo.getDate() + 6);

    // Si la semana no ha terminado, no genera reporte
    if (hoy < sabado) {
        alert('La semana aún no ha terminado. No se puede generar el reporte.');
        return;
    }

    // Limpia la tabla antes de agregar registros
    document.querySelector('#tablaHoras tbody').innerHTML = '';

    // Genera 10 registros con 10 horas extras repartidas al azar
    let horasExtrasTotales = 10;
    let extrasPorRegistro = Array(10).fill(0);
    for (let i = 0; i < horasExtrasTotales; i++) {
        extrasPorRegistro[Math.floor(Math.random() * 10)] += 1;
    }

    for (let i = 0; i < 10; i++) {
        let fecha = new Date(ultimoDomingo);
        fecha.setDate(ultimoDomingo.getDate() + i);
        let fechaStr = fecha.toISOString().split('T')[0];
        let entrada = '11:00';
        let salida = '21:00'; // 10 horas trabajadas
        let sueldoBase = 383.3333333;
        let descuentos = 0;
        let horasTrabajadas = 10 + extrasPorRegistro[i];
        let horasExtra = extrasPorRegistro[i];
        let pagoHorasExtra = horasExtra * valorHoraExtra;
        let pagoDiario = sueldoBase + pagoHorasExtra;
        let netoDiario = pagoDiario - descuentos;

        const tabla = document.getElementById('tablaHoras').getElementsByTagName('tbody')[0];
        const fila = tabla.insertRow();
        fila.innerHTML = `
            <td>${fechaStr}</td>
            <td>${entrada}</td>
            <td>${salida}</td>
            <td>11:00 - 20:00</td>
            <td>${horasTrabajadas}</td>
            <td>${horasExtra}</td>
            <td>${sueldoBase.toFixed(2)}</td>
            <td>${pagoDiario.toFixed(2)}</td>
            <td>${descuentos.toFixed(2)}</td>
            <td>${netoDiario.toFixed(2)}</td>
            <td><button onclick="eliminarRegistro(this)">Eliminar</button></td>
        `;
    }
    actualizarResumen();

    // Genera el reporte en PDF
    generarPDFReporteSemanal(ultimoDomingo, sabado);
}

function getNumeroSemana(date) {
    // Copia la fecha para no modificar el original
    const fecha = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    // Ajusta al jueves de la semana actual
    const diaSemana = fecha.getUTCDay() || 7;
    fecha.setUTCDate(fecha.getUTCDate() + 4 - diaSemana);
    // Calcula el inicio del año
    const inicioAno = new Date(Date.UTC(fecha.getUTCFullYear(), 0, 1));
    // Calcula el número de semana
    const numeroSemana = Math.ceil((((fecha - inicioAno) / 86400000) + 1) / 7);
    return numeroSemana;
}


function generarReporteSemanal(semanaObjetivo) {
    const hoy = new Date();
    const anoActual = hoy.getFullYear();

    // Calcular el primer día de la semana objetivo (lunes)
    const primerDiaAno = new Date(anoActual, 0, 1);
    const diaSemana = primerDiaAno.getDay() || 7;
    const primerLunes = new Date(primerDiaAno);
    if (diaSemana !== 1) {
        primerLunes.setDate(primerDiaAno.getDate() + (8 - diaSemana));
    }
    const fechaInicio = new Date(primerLunes);
    fechaInicio.setDate(primerLunes.getDate() + (semanaObjetivo - 1) * 7);

    // Fecha fin (domingo)
    const fechaFin = new Date(fechaInicio);
    fechaFin.setDate(fechaInicio.getDate() + 6);

    // Aquí puedes poner tu lógica de generar registros de prueba
    console.log(`Generando reporte de la semana ${semanaObjetivo} (${fechaInicio.toISOString().split('T')[0]} a ${fechaFin.toISOString().split('T')[0]})`);

    // Limpia la tabla antes de agregar registros
    document.querySelector('#tablaHoras tbody').innerHTML = '';

    // Ejemplo de generación de datos ficticios
    for (let i = 0; i < 7; i++) {
        let fecha = new Date(fechaInicio);
        fecha.setDate(fechaInicio.getDate() + i);
        let fechaStr = fecha.toISOString().split('T')[0];
        let entrada = '11:00';
        let salida = '20:00';
        let sueldoBase = 383.3333333;
        let horasTrabajadas = 9;
        let horasExtra = 0;
        let pagoHorasExtra = horasExtra * valorHoraExtra;
        let pagoDiario = sueldoBase + pagoHorasExtra;
        let netoDiario = pagoDiario;

        const tabla = document.getElementById('tablaHoras').getElementsByTagName('tbody')[0];
        const fila = tabla.insertRow();
        fila.innerHTML = `
            <td>${fechaStr}</td>
            <td>${entrada}</td>
            <td>${salida}</td>
            <td>11:00 - 20:00</td>
            <td>${horasTrabajadas}</td>
            <td>${horasExtra}</td>
            <td>${sueldoBase.toFixed(2)}</td>
            <td>${pagoDiario.toFixed(2)}</td>
            <td>0.00</td>
            <td>${netoDiario.toFixed(2)}</td>
            <td><button onclick="eliminarRegistro(this)">Eliminar</button></td>
        `;
    }

    actualizarResumen();
    generarPDFReporteSemanal(fechaInicio, fechaFin);
}


function generarReporteSemanalDesdeInput() {
    const semana = parseInt(document.getElementById('semanaSeleccionada').value);
    if (isNaN(semana) || semana < 1 || semana > 53) {
        alert('Por favor ingresa un número de semana válido (1-53)');
        return;
    }
    generarReporteSemanal(semana);
}


document.addEventListener('DOMContentLoaded', () => {
    const hoy = new Date();
    document.getElementById('semanaActual').textContent = getNumeroSemana(hoy);
});

// Llama esta función por consola para generar el reporte
// generarReporteSemanal();