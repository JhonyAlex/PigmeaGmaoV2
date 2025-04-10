/**
 * Vista de KPIs para mostrar métricas clave
 */
const KPIsView = {
    /**
     * Campos seleccionados para los KPIs
     */
    selectedFields: [],
    
    /**
     * Inicializa la vista de KPIs
     */
    init() {
        // Cargar campos seleccionados guardados
        this.loadSelectedFields();
        
        // Renderizar la vista
        this.render();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Generar KPIs iniciales
        this.generateKPIs();
    },
    
    /**
     * Carga los campos seleccionados para KPIs desde la configuración
     */
    loadSelectedFields() {
        const config = StorageService.getConfig();
        this.selectedFields = config.kpiFields || [];
    },
    
    /**
     * Guarda los campos seleccionados para KPIs en la configuración
     */
    saveSelectedFields() {
        const config = StorageService.getConfig();
        config.kpiFields = this.selectedFields;
        StorageService.updateConfig(config);
    },
    
    /**
     * Renderiza el contenido de la vista
     */
    render() {
        const mainContent = document.getElementById('main-content');
        const fields = FieldModel.getAll();
        const numericFields = fields.filter(field => field.type === 'number');
        
        // Obtener las entidades para filtros
        const entities = EntityModel.getAll();
        
        // Formatear fecha actual para los inputs de fecha
        const today = new Date().toISOString().split('T')[0];
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const lastMonthStr = lastMonth.toISOString().split('T')[0];
        
        // Obtener nombre personalizado de la entidad
        const config = StorageService.getConfig();
        const entityName = config.entityName || 'Entidad';
        
        const template = `
            <div class="container mt-4">
                <h2>KPIs y Métricas Clave</h2>
                
                <div class="card mb-4">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">Filtros</h5>
                    </div>
                    <div class="card-body">
                        <form id="kpi-filter-form" class="row g-3">
                            <div class="col-md-4">
                                <label for="kpi-filter-entity" class="form-label">${entityName}(es)</label>
                                <select class="form-select" id="kpi-filter-entity" multiple size="4">
                                    <option value="">Todas las ${entityName.toLowerCase()}s</option>
                                    ${entities.map(entity =>
                                        `<option value="${entity.id}">${entity.name}</option>`
                                    ).join('')}
                                </select>
                                <div class="form-text">Mantenga presionado Ctrl (⌘ en Mac) para seleccionar múltiples ${entityName.toLowerCase()}s</div>
                            </div>
                            <div class="col-md-4">
                                <label for="kpi-filter-from-date" class="form-label">Desde</label>
                                <input type="date" class="form-control" id="kpi-filter-from-date" value="${lastMonthStr}">
                            </div>
                            <div class="col-md-4">
                                <label for="kpi-filter-to-date" class="form-label">Hasta</label>
                                <input type="date" class="form-control" id="kpi-filter-to-date" value="${today}">
                            </div>
                            <div class="col-12">
                                <button type="submit" class="btn btn-primary">Aplicar Filtros</button>
                            </div>
                        </form>
                    </div>
                </div>
                
                <div class="card mb-4">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">Atajos de fecha</h5>
                    </div>
                    <div class="card-body text-center">
                        <div class="btn-group" role="group" aria-label="Atajos de fecha">
                            <button type="button" class="btn btn-outline-primary date-shortcut" data-range="yesterday">Ayer</button>
                            <button type="button" class="btn btn-outline-primary date-shortcut" data-range="thisWeek">Esta semana</button>
                            <button type="button" class="btn btn-outline-primary date-shortcut" data-range="lastWeek">Semana pasada</button>
                            <button type="button" class="btn btn-outline-primary date-shortcut" data-range="thisMonth">Mes actual</button>
                            <button type="button" class="btn btn-outline-primary date-shortcut" data-range="lastMonth">Mes pasado</button>
                        </div>
                    </div>
                </div>
                
                <div class="card mb-4">
                    <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Configuración de KPIs</h5>
                        <button type="button" class="btn btn-light btn-sm" id="save-kpi-config-btn">
                            <i class="bi bi-save"></i> Guardar Configuración
                        </button>
                    </div>
                    <div class="card-body">
                        <div class="mb-4">
                            <label class="form-label">Seleccione los campos para los KPIs:</label>
                            <div class="row">
                                ${numericFields.length === 0 ? `
                                    <div class="col-12">
                                        <div class="alert alert-info">
                                            No hay campos numéricos para mostrar KPIs. Cree campos numéricos en la sección de Administración.
                                        </div>
                                    </div>
                                ` : numericFields.map(field => `
                                    <div class="col-md-4 mb-2">
                                        <div class="form-check">
                                            <input class="form-check-input kpi-field-check" type="checkbox" 
                                                id="kpi-field-${field.id}" value="${field.id}" 
                                                ${this.selectedFields.includes(field.id) ? 'checked' : ''}>
                                            <label class="form-check-label" for="kpi-field-${field.id}">
                                                ${field.name}
                                            </label>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row" id="kpi-metrics-container">
                    <!-- Aquí se mostrarán las tarjetas de KPIs -->
                    <div class="col-md-4 mb-4">
                        <div class="card border-0 shadow-sm h-100 bg-primary text-white">
                            <div class="card-body text-center">
                                <h6 class="text-uppercase">Total de Registros</h6>
                                <h1 class="display-4" id="total-records-kpi">0</h1>
                                <p class="small mb-0">Registros en el sistema</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-4 mb-4">
                        <div class="card border-0 shadow-sm h-100 bg-success text-white">
                            <div class="card-body text-center">
                                <h6 class="text-uppercase">Promedio Diario</h6>
                                <h1 class="display-4" id="avg-records-kpi">0</h1>
                                <p class="small mb-0">Registros por día</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-4 mb-4">
                        <div class="card border-0 shadow-sm h-100 bg-info text-white">
                            <div class="card-body text-center">
                                <h6 class="text-uppercase">${entityName}s</h6>
                                <h1 class="display-4" id="total-entities-kpi">0</h1>
                                <p class="small mb-0">${entityName}s registradas</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="row" id="kpi-fields-container">
                    <!-- Aquí se mostrarán los KPIs de campos específicos -->
                </div>
                
                <div class="card mb-4">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">Gráficos de KPIs</h5>
                    </div>
                    <div class="card-body">
                        <div class="row mb-3">
                            <div class="col-md-4">
                                <label for="chart-type" class="form-label">Tipo de Gráfico</label>
                                <select class="form-select" id="chart-type">
                                    <option value="bar">Barras</option>
                                    <option value="line">Línea</option>
                                    <option value="pie">Circular</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label for="chart-field" class="form-label">Campo a Graficar</label>
                                <select class="form-select" id="chart-field">
                                    <option value="">Seleccione un campo</option>
                                    ${numericFields.map(field => `
                                        <option value="${field.id}" ${this.selectedFields.includes(field.id) ? '' : 'disabled'}>
                                            ${field.name}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label for="chart-grouping" class="form-label">Agrupar Por</label>
                                <select class="form-select" id="chart-grouping">
                                    <option value="entity">${entityName}</option>
                                    <option value="day">Día</option>
                                    <option value="week">Semana</option>
                                    <option value="month">Mes</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="chart-container" style="position: relative; height:400px;">
                            <canvas id="kpi-chart"></canvas>
                        </div>
                    </div>
                </div>
                
                <!-- Tendencias y Comparativas -->
                <div class="card mb-4">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">Tendencias y Comparativas</h5>
                    </div>
                    <div class="card-body">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="trend-field" class="form-label">Campo para Tendencia</label>
                                <select class="form-select" id="trend-field">
                                    <option value="">Seleccione un campo</option>
                                    ${numericFields.map(field => `
                                        <option value="${field.id}" ${this.selectedFields.includes(field.id) ? '' : 'disabled'}>
                                            ${field.name}
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="trend-period" class="form-label">Periodo</label>
                                <select class="form-select" id="trend-period">
                                    <option value="day">Diario</option>
                                    <option value="week">Semanal</option>
                                    <option value="month" selected>Mensual</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="chart-container" style="position: relative; height:300px;">
                            <canvas id="trend-chart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        mainContent.innerHTML = template;
    },
    
    /**
     * Configura los event listeners para la vista
     */
    setupEventListeners() {
        // Listener para el formulario de filtros
        document.getElementById('kpi-filter-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.applyFilters();
            this.generateKPIs();
            this.updateCharts();
        });
        
        // Listener para guardado de configuración de KPIs
        document.getElementById('save-kpi-config-btn').addEventListener('click', () => {
            this.saveKPIConfiguration();
        });
        
        // Listeners para los checkboxes de campos
        document.querySelectorAll('.kpi-field-check').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateSelectedFields();
                this.generateKPIs();
                this.updateFieldSelects();
            });
        });
        
        // Listener para atajos de fecha
        document.querySelectorAll('.date-shortcut').forEach(button => {
            button.addEventListener('click', (e) => {
                const range = e.target.getAttribute('data-range');
                this.setDateRange(range);
                // Aplicar filtros automáticamente
                document.getElementById('kpi-filter-form').dispatchEvent(new Event('submit'));
            });
        });
        
        // Listeners para los cambios de gráfico
        const chartField = document.getElementById('chart-field');
        const chartType = document.getElementById('chart-type');
        const chartGrouping = document.getElementById('chart-grouping');
        
        if (chartField && chartType && chartGrouping) {
            [chartField, chartType, chartGrouping].forEach(select => {
                select.addEventListener('change', () => {
                    this.updateCharts();
                });
            });
        }
        
        // Listeners para tendencias
        const trendField = document.getElementById('trend-field');
        const trendPeriod = document.getElementById('trend-period');
        
        if (trendField && trendPeriod) {
            [trendField, trendPeriod].forEach(select => {
                select.addEventListener('change', () => {
                    this.updateTrendChart();
                });
            });
        }
    },
    
    /**
     * Actualiza los campos seleccionados para KPIs
     */
    updateSelectedFields() {
        this.selectedFields = [];
        document.querySelectorAll('.kpi-field-check:checked').forEach(checkbox => {
            this.selectedFields.push(checkbox.value);
        });
    },
    
    /**
     * Actualiza los selects de campos basados en los campos seleccionados
     */
    updateFieldSelects() {
        const chartField = document.getElementById('chart-field');
        const trendField = document.getElementById('trend-field');
        
        [chartField, trendField].forEach(select => {
            if (!select) return;
            
            // Habilitar o deshabilitar opciones según los campos seleccionados
            Array.from(select.options).forEach(option => {
                if (option.value) {
                    option.disabled = !this.selectedFields.includes(option.value);
                }
            });
            
            // Si la opción seleccionada está deshabilitada, seleccionar la primera disponible
            if (select.selectedIndex > 0 && select.options[select.selectedIndex].disabled) {
                const enabledOption = Array.from(select.options).find(opt => opt.value && !opt.disabled);
                if (enabledOption) {
                    select.value = enabledOption.value;
                } else {
                    select.selectedIndex = 0;
                }
            }
        });
        
        // Actualizar los gráficos
        this.updateCharts();
        this.updateTrendChart();
    },
    
    /**
     * Guarda la configuración de KPIs
     */
    saveKPIConfiguration() {
        this.updateSelectedFields();
        this.saveSelectedFields();
        
        UIUtils.showAlert('Configuración de KPIs guardada correctamente', 'success');
    },
    
    /**
     * Aplica los filtros seleccionados
     * @returns {Object} Filtros aplicados
     */
    applyFilters() {
        const entityFilterSelect = document.getElementById('kpi-filter-entity');
        const selectedEntities = Array.from(entityFilterSelect.selectedOptions).map(option => option.value);
        
        // Si se selecciona "Todas las entidades" o no se selecciona ninguna, no aplicamos filtro de entidad
        const entityFilter = selectedEntities.includes('') || selectedEntities.length === 0
            ? []
            : selectedEntities;
            
        const fromDateFilter = document.getElementById('kpi-filter-from-date').value;
        const toDateFilter = document.getElementById('kpi-filter-to-date').value;
        
        const filters = {
            entityIds: entityFilter.length > 0 ? entityFilter : undefined,
            fromDate: fromDateFilter || undefined,
            toDate: toDateFilter || undefined
        };
        
        return filters;
    },
    
    /**
     * Configura el rango de fecha según el atajo seleccionado
     * @param {string} range Tipo de rango (yesterday, thisWeek, lastWeek, thisMonth, lastMonth)
     */
    setDateRange(range) {
        const fromDateInput = document.getElementById('kpi-filter-from-date');
        const toDateInput = document.getElementById('kpi-filter-to-date');
        
        // Fecha actual
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let fromDate, toDate;
        
        // Calcular rango según selección
        switch (range) {
            case 'yesterday':
                // Ayer (solo un día)
                fromDate = new Date(today);
                fromDate.setDate(today.getDate() - 1);
                toDate = new Date(fromDate);
                break;
                
            case 'thisWeek':
                // Esta semana (desde lunes hasta hoy)
                fromDate = new Date(today);
                // Obtener el primer día de la semana (0 = domingo, 1 = lunes)
                const firstDayOfWeek = 1; // Usando lunes como primer día
                const day = today.getDay();
                const diff = (day >= firstDayOfWeek) ? day - firstDayOfWeek : 6;
                fromDate.setDate(today.getDate() - diff);
                toDate = new Date(today);
                break;
                
            case 'lastWeek':
                // Semana pasada
                fromDate = new Date(today);
                const firstDayLastWeek = 1; // Lunes
                const dayLastWeek = today.getDay();
                // Retroceder al lunes de la semana pasada
                fromDate.setDate(today.getDate() - dayLastWeek - 6);
                // Fin de semana pasada (domingo)
                toDate = new Date(fromDate);
                toDate.setDate(fromDate.getDate() + 6);
                break;
                
            case 'thisMonth':
                // Mes actual
                fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
                toDate = new Date(today);
                break;
                
            case 'lastMonth':
                // Mes pasado
                fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                toDate = new Date(today.getFullYear(), today.getMonth(), 0);
                break;
                
            default:
                return; // No hacer nada si no coincide
        }
        
        // Formatear fechas para los inputs
        fromDateInput.value = this.formatDateForInput(fromDate);
        toDateInput.value = this.formatDateForInput(toDate);
    },
    
    /**
     * Formatea una fecha para usar en input type="date"
     * @param {Date} date Objeto Date a formatear
     * @returns {string} Fecha formateada YYYY-MM-DD
     */
    formatDateForInput(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    
    /**
     * Genera y muestra los KPIs basados en los filtros y campos seleccionados
     */
    generateKPIs() {
        const filters = this.applyFilters();
        const filteredRecords = RecordModel.filterMultiple(filters);
        
        // KPI: Total de registros
        document.getElementById('total-records-kpi').textContent = filteredRecords.length;
        
        // KPI: Promedio diario
        let avgRecordsPerDay = 0;
        if (filteredRecords.length > 0) {
            // Agrupar por fecha
            const recordsByDate = {};
            filteredRecords.forEach(record => {
                const date = new Date(record.timestamp).toISOString().split('T')[0];
                if (!recordsByDate[date]) {
                    recordsByDate[date] = 0;
                }
                recordsByDate[date]++;
            });
            
            // Calcular promedio
            const totalDays = Object.keys(recordsByDate).length;
            if (totalDays > 0) {
                avgRecordsPerDay = Math.round((filteredRecords.length / totalDays) * 10) / 10; // Redondeado a 1 decimal
            }
        }
        document.getElementById('avg-records-kpi').textContent = avgRecordsPerDay;
        
        // KPI: Total de entidades
        const allEntities = EntityModel.getAll();
        document.getElementById('total-entities-kpi').textContent = allEntities.length;
        
        // Generar KPIs para campos seleccionados
        const kpiFieldsContainer = document.getElementById('kpi-fields-container');
        kpiFieldsContainer.innerHTML = '';
        
        // Colores para las tarjetas de KPI
        const cardColors = [
            'bg-warning text-dark',
            'bg-danger text-white',
            'bg-info text-white',
            'bg-success text-white',
            'bg-primary text-white',
            'bg-secondary text-white'
        ];
        
        // Generar KPIs para cada campo seleccionado
        this.selectedFields.forEach((fieldId, index) => {
            const field = FieldModel.getById(fieldId);
            if (!field || field.type !== 'number') return;
            
            // Obtener valores para este campo
            const values = filteredRecords
                .filter(record => record.data[fieldId] !== undefined)
                .map(record => parseFloat(record.data[fieldId]) || 0);
            
            if (values.length === 0) return;
            
            // Calcular métricas
            const sum = values.reduce((a, b) => a + b, 0);
            const avg = sum / values.length;
            const max = Math.max(...values);
            const min = Math.min(...values);
            
            // Seleccionar color de la tarjeta
            const colorClass = cardColors[index % cardColors.length];
            
            // Crear tarjeta de KPI
            const kpiCard = document.createElement('div');
            kpiCard.className = 'col-md-6 col-lg-4 mb-4';
            kpiCard.innerHTML = `
                <div class="card border-0 shadow-sm h-100 ${colorClass}">
                    <div class="card-body">
                        <h5 class="card-title text-center">${field.name}</h5>
                        <div class="row text-center">
                            <div class="col-6 mb-3">
                                <h6 class="text-uppercase small opacity-75">Suma</h6>
                                <h3>${ChartUtils.formatNumber(sum)}</h3>
                            </div>
                            <div class="col-6 mb-3">
                                <h6 class="text-uppercase small opacity-75">Promedio</h6>
                                <h3>${ChartUtils.formatNumber(avg)}</h3>
                            </div>
                            <div class="col-6">
                                <h6 class="text-uppercase small opacity-75">Máximo</h6>
                                <h3>${ChartUtils.formatNumber(max)}</h3>
                            </div>
                            <div class="col-6">
                                <h6 class="text-uppercase small opacity-75">Mínimo</h6>
                                <h3>${ChartUtils.formatNumber(min)}</h3>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            kpiFieldsContainer.appendChild(kpiCard);
        });
    },
    
    /**
     * Actualiza los gráficos de KPIs
     */
    updateCharts() {
        const chartField = document.getElementById('chart-field');
        const chartType = document.getElementById('chart-type');
        const chartGrouping = document.getElementById('chart-grouping');
        
        if (!chartField || !chartType || !chartGrouping) return;
        if (!chartField.value) return;
        
        const fieldId = chartField.value;
        const chartTypeValue = chartType.value;
        const groupingType = chartGrouping.value;
        
        const field = FieldModel.getById(fieldId);
        if (!field) return;
        
        const filters = this.applyFilters();
        const filteredRecords = RecordModel.filterMultiple(filters);
        
        // Filtrar registros que tengan el campo seleccionado
        const recordsWithField = filteredRecords.filter(record => record.data[fieldId] !== undefined);
        
        if (recordsWithField.length === 0) {
            // No hay datos para mostrar
            this.showNoDataChart('kpi-chart');
            return;
        }
        
        // Agrupar datos según el tipo de agrupación
        let groupedData = {};
        
        if (groupingType === 'entity') {
            // Agrupar por entidad
            recordsWithField.forEach(record => {
                const entity = EntityModel.getById(record.entityId);
                const entityName = entity ? entity.name : 'Desconocido';
                
                if (!groupedData[entityName]) {
                    groupedData[entityName] = {
                        count: 0,
                        sum: 0,
                        values: []
                    };
                }
                
                const value = parseFloat(record.data[fieldId]) || 0;
                groupedData[entityName].count++;
                groupedData[entityName].sum += value;
                groupedData[entityName].values.push(value);
            });
        } else {
            // Agrupar por período de tiempo
            recordsWithField.forEach(record => {
                const date = new Date(record.timestamp);
                let groupKey;
                
                if (groupingType === 'day') {
                    groupKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
                } else if (groupingType === 'week') {
                    // Calcular semana (tomando lunes como día 1)
                    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
                    const dayOfYear = Math.floor((date - firstDayOfYear) / (24 * 60 * 60 * 1000));
                    const weekNumber = Math.ceil((dayOfYear + firstDayOfYear.getDay()) / 7);
                    groupKey = `Semana ${weekNumber}, ${date.getFullYear()}`;
                } else if (groupingType === 'month') {
                    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                    groupKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
                }
                
                if (!groupedData[groupKey]) {
                    groupedData[groupKey] = {
                        count: 0,
                        sum: 0,
                        values: []
                    };
                }
                
                const value = parseFloat(record.data[fieldId]) || 0;
                groupedData[groupKey].count++;
                groupedData[groupKey].sum += value;
                groupedData[groupKey].values.push(value);
            });
        }
        
        // Calcular promedios
        Object.keys(groupedData).forEach(key => {
            groupedData[key].avg = groupedData[key].sum / groupedData[key].count;
        });
        
        // Preparar datos para el gráfico
        const labels = Object.keys(groupedData);
        const datasets = [{
            label: field.name,
            data: labels.map(label => groupedData[label].sum),
            backgroundColor: ChartUtils.chartColors.slice(0, labels.length),
            borderColor: ChartUtils.chartColors.map(color => color.replace('0.7', '1')),
            borderWidth: 1
        }];
        
        // Dibujar gráfico
        this.drawChart('kpi-chart', chartTypeValue, labels, datasets, field.name);
    },
    
    /**
     * Actualiza el gráfico de tendencia
     */
    updateTrendChart() {
        const trendField = document.getElementById('trend-field');
        const trendPeriod = document.getElementById('trend-period');
        
        if (!trendField || !trendPeriod) return;
        if (!trendField.value) return;
        
        const fieldId = trendField.value;
        const periodType = trendPeriod.value;
        
        const field = FieldModel.getById(fieldId);
        if (!field) return;
        
        const filters = this.applyFilters();
        const filteredRecords = RecordModel.filterMultiple(filters);
        
        // Filtrar registros que tengan el campo seleccionado
        const recordsWithField = filteredRecords.filter(record => record.data[fieldId] !== undefined);
        
        if (recordsWithField.length === 0) {
            // No hay datos para mostrar
            this.showNoDataChart('trend-chart');
            return;
        }
        
        // Ordenar por fecha
        recordsWithField.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        // Agrupar por período
        const groupedData = {};
        
        recordsWithField.forEach(record => {
            const date = new Date(record.timestamp);
            let groupKey;
            
            if (periodType === 'day') {
                groupKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
            } else if (periodType === 'week') {
                // Calcular semana
                const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
                const dayOfYear = Math.floor((date - firstDayOfYear) / (24 * 60 * 60 * 1000));
                const weekNumber = Math.ceil((dayOfYear + firstDayOfYear.getDay()) / 7);
                groupKey = `S${weekNumber}-${date.getFullYear()}`;
            } else if (periodType === 'month') {
                groupKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            }
            
            if (!groupedData[groupKey]) {
                groupedData[groupKey] = {
                    count: 0,
                    sum: 0,
                    values: []
                };
            }
            
            const value = parseFloat(record.data[fieldId]) || 0;
            groupedData[groupKey].count++;
            groupedData[groupKey].sum += value;
            groupedData[groupKey].values.push(value);
        });
        
        // Calcular métricas para cada grupo
        Object.keys(groupedData).forEach(key => {
            groupedData[key].avg = groupedData[key].sum / groupedData[key].count;
        });
        
        // Preparar datos para el gráfico
        const sortedKeys = Object.keys(groupedData).sort(); // Ordenar períodos cronológicamente
        const labels = sortedKeys;
        
        // Obtener series de suma y promedio
        const sumData = sortedKeys.map(key => groupedData[key].sum);
        const avgData = sortedKeys.map(key => groupedData[key].avg);
        
        const datasets = [
            {
                label: `Suma de ${field.name}`,
                data: sumData,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            },
            {
                label: `Promedio de ${field.name}`,
                data: avgData,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            }
        ];
        
        // Dibujar gráfico de línea para tendencias
        this.drawChart('trend-chart', 'line', labels, datasets, `Tendencia de ${field.name} por ${periodType}`);
    },
    
    /**
     * Dibuja un gráfico en el canvas especificado
     * @param {string} canvasId ID del elemento canvas
     * @param {string} type Tipo de gráfico ('bar', 'line', 'pie', etc.)
     * @param {Array} labels Etiquetas para el eje X
     * @param {Array} datasets Conjuntos de datos
     * @param {string} title Título del gráfico
     */
    drawChart(canvasId, type, labels, datasets, title) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        // Destruir gráfico anterior si existe
        if (canvas.chart) {
            canvas.chart.destroy();
        }
        
        // Crear opciones del gráfico
        const options = {
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
                            const value = ChartUtils.formatNumber(context.raw);
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
                            return ChartUtils.formatNumber(value);
                        }
                    }
                }
            }
        };
        
        // Ajustes específicos según tipo de gráfico
        if (type === 'pie' || type === 'doughnut') {
            // Eliminar escalas para gráficos circulares
            delete options.scales;
        }
        
        // Crear el gráfico
        const chart = new Chart(canvas, {
            type: type,
            data: {
                labels: labels,
                datasets: datasets
            },
            options: options
        });
        
        // Guardar referencia al gráfico en el canvas
        canvas.chart = chart;
    },
    
    /**
     * Muestra un gráfico de "No hay datos disponibles"
     * @param {string} canvasId ID del elemento canvas
     */
    showNoDataChart(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        // Destruir gráfico anterior si existe
        if (canvas.chart) {
            canvas.chart.destroy();
        }
        
        // Crear un gráfico vacío con mensaje
        const chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ['No hay datos disponibles'],
                datasets: [{
                    label: '',
                    data: [0],
                    backgroundColor: 'rgba(200, 200, 200, 0.2)',
                    borderColor: 'rgba(200, 200, 200, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'No hay datos disponibles para mostrar'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            display: false
                        }
                    }
                }
            }
        });
        
        // Guardar referencia al gráfico en el canvas
        canvas.chart = chart;
    }
};