/**
 * Utilidades para generar gráficos y reportes visuales
 */
const ChartUtils = {
    /**
     * Colores para usar en los gráficos
     */
    chartColors: [
        'rgba(54, 162, 235, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(255, 205, 86, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(201, 203, 207, 0.7)',
        'rgba(255, 99, 71, 0.7)',
        'rgba(50, 205, 50, 0.7)',
        'rgba(138, 43, 226, 0.7)'
    ],
    
    /**
     * Formatea números con el formato: 1'000.000,00
     * Usa apóstrofo para millones, punto para miles y coma para decimales
     * @param {number} number Número a formatear
     * @param {number} decimals Cantidad de decimales (default: 2)
     * @returns {string} Número formateado
     */
    formatNumber(number, decimals = 2) {
        // Convertir a string con decimales fijos
        const fixed = number.toFixed(decimals);
        
        // Separar parte entera y decimal
        const parts = fixed.split('.');
        const integerPart = parts[0];
        const decimalPart = parts[1] || '';
        
        // Si el número es menor que 1000, simplemente devuelve el formato básico con coma decimal
        if (integerPart.length <= 3) {
            return decimalPart ? `${integerPart},${decimalPart}` : integerPart;
        }
        
        // Formateamos números mayores a 1000
        // El patrón está basado en grupos de 3 dígitos desde la derecha
        
        // Obtenemos la cantidad de grupos de 3 dígitos
        const groups = Math.ceil(integerPart.length / 3);
        
        // Procesamos cada grupo
        const formattedGroups = [];
        for (let i = 0; i < groups; i++) {
            // Calculamos el inicio del grupo actual desde la derecha
            const start = Math.max(0, integerPart.length - (i + 1) * 3);
            const end = integerPart.length - i * 3;
            
            // Extraemos los dígitos del grupo actual
            const group = integerPart.substring(start, end);
            
            // Agregamos el grupo al inicio de la lista
            formattedGroups.unshift(group);
        }
        
        // Unimos los grupos con el separador apropiado
        let result = '';
        for (let i = 0; i < formattedGroups.length; i++) {
            // Si es el primer grupo (millones o mayor), usamos apóstrofo
            if (i === 0 && formattedGroups.length > 2) {
                result = formattedGroups[i];
            } 
            // Para el grupo siguiente, aplicamos el separador de millones (apóstrofo)
            else if (i === 1 && formattedGroups.length > 2) {
                result += "'" + formattedGroups[i];
            }
            // Para el último grupo (miles), usamos punto
            else if (i === formattedGroups.length - 1) {
                result += "." + formattedGroups[i];
            }
            // Para otros grupos, usamos apóstrofo
            else {
                result += "'" + formattedGroups[i];
            }
        }
        
        // Unimos con la parte decimal usando coma
        return decimalPart ? `${result},${decimalPart}` : result;
    },
    
    /**
     * Crea o actualiza un gráfico de barras
     * @param {string} canvasId ID del elemento canvas
     * @param {Object} reportData Datos del reporte
     * @returns {Chart} Instancia del gráfico
     */
    createBarChart(canvasId, reportData) {
        const canvas = document.getElementById(canvasId);
        
        // Destruir gráfico anterior si existe
        if (canvas.chart) {
            canvas.chart.destroy();
        }
        
        // Preparar datos del gráfico
        const labels = reportData.entities.map(entity => entity.name);
        const values = reportData.entities.map(entity => entity.value);
        
        // Título según el tipo de agregación y campos
        const horizontalFieldName = reportData.horizontalField ? reportData.horizontalField : 'Entidad';
        const title = reportData.aggregation === 'sum' 
            ? `Suma total de ${reportData.field} por ${horizontalFieldName}`
            : `Promedio de ${reportData.field} por ${horizontalFieldName}`;
        
        // Crear el gráfico
        const chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: reportData.field,
                    data: values,
                    backgroundColor: this.chartColors.slice(0, labels.length),
                    borderColor: this.chartColors.map(color => color.replace('0.7', '1')),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: title
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = this.formatNumber(context.raw);
                                return `${context.dataset.label}: ${value}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => {
                                return this.formatNumber(value);
                            }
                        }
                    }
                }
            }
        });
        
        // Guardar referencia al gráfico en el canvas
        canvas.chart = chart;
        
        return chart;
    },
    
    /**
     * Genera una tabla resumen para el reporte
     * @param {Object} reportData Datos del reporte
     * @returns {string} HTML de la tabla
     */
    createSummaryTable(reportData) {
        const rows = reportData.entities.map(entity => {
            const formattedValue = this.formatNumber(entity.value);
            return `
                <tr>
                    <td>${entity.name}</td>
                    <td class="text-end">${formattedValue}</td>
                    <td class="text-end">${this.formatNumber(entity.count, 0)}</td>
                </tr>
            `;
        });
        
        // Calcular total general
        const totalValue = reportData.entities.reduce((sum, entity) => sum + entity.value, 0);
        const totalCount = reportData.entities.reduce((sum, entity) => sum + entity.count, 0);
        
        // Determinar el título de la primera columna
        const entityHeaderTitle = reportData.horizontalField ? reportData.horizontalField : 'Entidad';
        
        return `
            <table class="table table-sm table-striped">
                <thead>
                    <tr>
                        <th>${entityHeaderTitle}</th>
                        <th class="text-end">${reportData.aggregation === 'sum' ? 'Total' : 'Promedio'}</th>
                        <th class="text-end">Registros</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows.join('')}
                </tbody>
                <tfoot>
                    <tr class="table-primary">
                        <th>TOTAL</th>
                        <th class="text-end">${this.formatNumber(totalValue)}</th>
                        <th class="text-end">${this.formatNumber(totalCount, 0)}</th>
                    </tr>
                </tfoot>
            </table>
        `;
    }
};