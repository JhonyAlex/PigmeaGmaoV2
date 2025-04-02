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
     * Formatea números con el formato solicitado:
     * 10 → 10,00
     * 100 → 100,00
     * 1000 → 1.000,00
     * 100000 → 100.000,00
     * 1000000 → 1'000.000,00
     * 1000000000 → 1.000'000.000,00
     * 
     * @param {number} number Número a formatear
     * @param {number} decimals Cantidad de decimales (default: 2)
     * @returns {string} Número formateado
     */
    formatNumber(number, decimals = 2) {
        // Paso 1: Convertir el número a string con los decimales requeridos
        let numStr = number.toFixed(decimals);
        
        // Paso 2: Separar la parte entera y decimal
        const [integerStr, decimalStr] = numStr.split('.');
        
        // Paso 3: Si el número es menor que 1000, no necesitamos separadores
        if (integerStr.length <= 3) {
            return `${integerStr},${decimalStr || '00'}`;
        }
        
        // Paso 4: Para números mayores, procesamos la parte entera
        let result = '';
        const len = integerStr.length;
        
        // Procesamos cada dígito de derecha a izquierda
        for (let i = len - 1; i >= 0; i--) {
            // Añadimos el dígito al inicio
            result = integerStr[i] + result;
            
            // Calculamos la posición desde la derecha (empezando desde 0)
            const posFromRight = len - 1 - i;
            
            // Si no es el último dígito y estamos en una posición que requiere separador
            if (i > 0 && (posFromRight + 1) % 3 === 0) {
                // Posición 6 desde la derecha = posición de millones
                if (posFromRight === 5) {
                    result = "'" + result;
                } else {
                    result = "." + result;
                }
            }
        }
        
        // Paso 5: Unir la parte entera formateada con la parte decimal
        return `${result},${decimalStr || '00'}`;
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