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
                        <div>
                            <button type="button" class="btn btn-outline-light btn-sm me-2" id="select-all-kpi-fields">
                                <i class="bi bi-check-all"></i> Seleccionar Todo
                            </button>
                            <button type="button" class="btn btn-light btn-sm" id="save-kpi-config-btn">
                                <i class="bi bi-save"></i> Guardar Configuración
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="mb-4">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <div class="card h-100 border-primary">
                                        <div class="card-header bg-primary text-white">
                                            <h6 class="mb-0">Campos Numéricos</h6>
                                        </div>
                                        <div class="card-body" style="max-height: 300px; overflow-y: auto;">
                                            ${numericFields.length === 0 ? `
                                                <div class="alert alert-info">
                                                    No hay campos numéricos disponibles. Cree campos numéricos en la sección de Administración.
                                                </div>
                                            ` : `
                                                <div class="row">
                                                    ${numericFields.map(field => `
                                                        <div class="col-md-6 mb-2">
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
                                            `}
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <div class="card h-100 border-info">
                                        <div class="card-header bg-info text-white">
                                            <h6 class="mb-0">Opciones de Visualización</h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="mb-3">
                                                <label class="form-label">Estilo de tarjetas KPI:</label>
                                                <div class="form-check">
                                                    <input class="form-check-input" type="radio" name="kpi-style" id="kpi-style-modern" value="modern" checked>
                                                    <label class="form-check-label" for="kpi-style-modern">
                                                        Moderno (tarjetas de colores)
                                                    </label>
                                                </div>
                                                <div class="form-check">
                                                    <input class="form-check-input" type="radio" name="kpi-style" id="kpi-style-classic" value="classic">
                                                    <label class="form-check-label" for="kpi-style-classic">
                                                        Clásico (tarjetas blancas)
                                                    </label>
                                                </div>
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label" for="default-aggregation">Agregación por defecto:</label>
                                                <select class="form-select" id="default-aggregation">
                                                    <option value="sum">Suma</option>
                                                    <option value="avg">Promedio</option>
                                                    <option value="max">Máximo</option>
                                                    <option value="min">Mínimo</option>
                                                </select>
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label" for="decimal-places">Decimales a mostrar:</label>
                                                <select class="form-select" id="decimal-places">
                                                    <option value="0">0 (números enteros)</option>
                                                    <option value="1">1 decimal</option>
                                                    <option value="2" selected>2 decimales</option>
                                                    <option value="3">3 decimales</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="row mt-3">
                                <div class="col-md-12 mb-3">
                                    <div class="card border-success">
                                        <div class="card-header bg-success text-white">
                                            <h6 class="mb-0">Métricas Adicionales</h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="row">
                                                <div class="col-md-4 mb-2">
                                                    <div class="form-check">
                                                        <input class="form-check-input" type="checkbox" id="show-count" checked>
                                                        <label class="form-check-label" for="show-count">
                                                            Mostrar conteo de registros
                                                        </label>
                                                    </div>
                                                </div>
                                                <div class="col-md-4 mb-2">
                                                    <div class="form-check">
                                                        <input class="form-check-input" type="checkbox" id="show-daily-avg" checked>
                                                        <label class="form-check-label" for="show-daily-avg">
                                                            Mostrar promedio diario
                                                        </label>
                                                    </div>
                                                </div>
                                                <div class="col-md-4 mb-2">
                                                    <div class="form-check">
                                                        <input class="form-check-input" type="checkbox" id="show-entities-count" checked>
                                                        <label class="form-check-label" for="show-entities-count">
                                                            Mostrar número de entidades
                                                        </label>
                                                    </div>
                                                </div>
                                                <div class="col-md-4 mb-2">
                                                    <div class="form-check">
                                                        <input class="form-check-input" type="checkbox" id="show-growth-rate">
                                                        <label class="form-check-label" for="show-growth-rate">
                                                            Mostrar tasa de crecimiento
                                                        </label>
                                                    </div>
                                                </div>
                                                <div class="col-md-4 mb-2">
                                                    <div class="form-check">
                                                        <input class="form-check-input" type="checkbox" id="show-predictions">
                                                        <label class="form-check-label" for="show-predictions">
                                                            Mostrar predicciones simples
                                                        </label>
                                                    </div>
                                                </div>
                                                <div class="col-md-4 mb-2">
                                                    <div class="form-check">
                                                        <input class="form-check-input" type="checkbox" id="show-percent-change">
                                                        <label class="form-check-label" for="show-percent-change">
                                                            Mostrar cambio porcentual
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
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
                        
                        <div class="chart-container">
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
                            <div class="col-md-4">
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
                            <div class="col-md-4">
                                <label for="trend-period" class="form-label">Período</label>
                                <select class="form-select" id="trend-period">
                                    <option value="custom">Personalizado (usar fechas de filtros)</option>
                                    <option value="day">Diario</option>
                                    <option value="week">Semanal</option>
                                    <option value="month" selected>Mensual</option>
                                    <option value="quarter">Trimestral</option>
                                    <option value="year">Anual</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label for="comparison-mode" class="form-label">Modo de Comparación</label>
                                <select class="form-select" id="comparison-mode">
                                    <option value="period">Período Anterior</option>
                                    <option value="year">Mismo Período Año Anterior</option>
                                    <option value="custom">Rango Personalizado</option>
                                    <option value="none">Sin Comparación</option>
                                </select>
                            </div>
                        </div>
                        
                        <div id="custom-comparison-range" class="row mb-3" style="display: none;">
                            <div class="col-md-6">
                                <label for="comparison-from-date" class="form-label">Desde</label>
                                <input type="date" class="form-control" id="comparison-from-date">
                            </div>
                            <div class="col-md-6">
                                <label for="comparison-to-date" class="form-label">Hasta</label>
                                <input type="date" class="form-control" id="comparison-to-date">
                            </div>
                        </div>
                        
                        <div class="chart-container">
                            <canvas id="trend-chart"></canvas>
                        </div>
                        
                        <div class="mt-4">
                            <h6>Comparación del Período</h6>
                            <div class="table-responsive">
                                <table class="table table-sm table-bordered table-hover">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Métrica</th>
                                            <th>Período Actual</th>
                                            <th>Período Anterior</th>
                                            <th>Diferencia</th>
                                            <th>Variación %</th>
                                        </tr>
                                    </thead>
                                    <tbody id="comparison-table-body">
                                        <tr>
                                            <td colspan="5" class="text-center">Seleccione un campo y un período para ver la comparación</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
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
        
        // Listener para seleccionar todos los campos KPI
        const selectAllBtn = document.getElementById('select-all-kpi-fields');
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => {
                document.querySelectorAll('.kpi-field-check').forEach(checkbox => {
                    checkbox.checked = true;
                });
                this.updateSelectedFields();
                this.generateKPIs();
                this.updateFieldSelects();
            });
        }
        
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
        
        // Listeners para tendencias y comparación
        const trendField = document.getElementById('trend-field');
        const trendPeriod = document.getElementById('trend-period');
        const comparisonMode = document.getElementById('comparison-mode');
        const comparisonFromDate = document.getElementById('comparison-from-date');
        const comparisonToDate = document.getElementById('comparison-to-date');
        const customComparisonRange = document.getElementById('custom-comparison-range');
        
        // Listener para mostrar/ocultar el rango personalizado
        if (comparisonMode) {
            comparisonMode.addEventListener('change', () => {
                if (customComparisonRange) {
                    customComparisonRange.style.display = 
                        comparisonMode.value === 'custom' ? 'flex' : 'none';
                }
                this.updateTrendChart();
            });
        }
        
        // Listeners para actualizar el gráfico al cambiar parámetros
        if (trendField && trendPeriod) {
            [trendField, trendPeriod].forEach(select => {
                select.addEventListener('change', () => {
                    this.updateTrendChart();
                });
            });
        }
        
        // Listeners para fechas de comparación personalizadas
        if (comparisonFromDate && comparisonToDate) {
            [comparisonFromDate, comparisonToDate].forEach(input => {
                input.addEventListener('change', () => {
                    if (comparisonMode.value === 'custom') {
                        this.updateTrendChart();
                    }
                });
            });
        }
        
        // Listeners para opciones de visualización
        const decimalPlaces = document.getElementById('decimal-places');
        const defaultAggregation = document.getElementById('default-aggregation');
        const kpiStyleOptions = document.querySelectorAll('input[name="kpi-style"]');
        
        if (decimalPlaces) {
            decimalPlaces.addEventListener('change', () => {
                this.updateTrendChart();
            });
        }
        
        if (defaultAggregation) {
            defaultAggregation.addEventListener('change', () => {
                this.generateKPIs();
            });
        }
        
        if (kpiStyleOptions.length > 0) {
            kpiStyleOptions.forEach(option => {
                option.addEventListener('change', () => {
                    this.generateKPIs();
                });
            });
        }
        
        // Listeners para métricas adicionales
        const metricCheckboxes = [
            'show-count',
            'show-daily-avg',
            'show-entities-count',
            'show-growth-rate',
            'show-predictions',
            'show-percent-change'
        ];
        
        metricCheckboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    this.generateKPIs();
                });
            }
        });
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
        // Actualizar campos seleccionados
        this.updateSelectedFields();
        
        // Obtener la configuración actual
        const config = StorageService.getConfig();
        
        // Guardar campos seleccionados
        config.kpiFields = this.selectedFields;
        
        // Guardar estilo de KPI
        const kpiStyleModern = document.getElementById('kpi-style-modern');
        config.kpiStyle = kpiStyleModern && kpiStyleModern.checked ? 'modern' : 'classic';
        
        // Guardar configuración de decimales
        const decimalPlaces = document.getElementById('decimal-places');
        config.kpiDecimalPlaces = decimalPlaces ? parseInt(decimalPlaces.value) : 2;
        
        // Guardar agregación por defecto
        const defaultAggregation = document.getElementById('default-aggregation');
        config.kpiDefaultAggregation = defaultAggregation ? defaultAggregation.value : 'sum';
        
        // Guardar métricas adicionales
        config.kpiMetrics = {
            showCount: document.getElementById('show-count')?.checked || false,
            showDailyAvg: document.getElementById('show-daily-avg')?.checked || false,
            showEntitiesCount: document.getElementById('show-entities-count')?.checked || false,
            showGrowthRate: document.getElementById('show-growth-rate')?.checked || false,
            showPredictions: document.getElementById('show-predictions')?.checked || false,
            showPercentChange: document.getElementById('show-percent-change')?.checked || false
        };
        
        // Guardar configuración de visualización
        config.kpiVisualization = {
            defaultChartType: document.getElementById('chart-type')?.value || 'bar',
            defaultPeriod: document.getElementById('trend-period')?.value || 'month',
            defaultComparison: document.getElementById('comparison-mode')?.value || 'period'
        };
        
        // Guardar en el almacenamiento
        StorageService.updateConfig(config);
        
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
        
        // Obtener configuraciones
        const config = StorageService.getConfig();
        const kpiStyle = config.kpiStyle || 'modern';
        const kpiDecimalPlaces = config.kpiDecimalPlaces || 2;
        const kpiDefaultAggregation = config.kpiDefaultAggregation || 'sum';
        const kpiMetrics = config.kpiMetrics || {
            showCount: true,
            showDailyAvg: true,
            showEntitiesCount: true,
            showGrowthRate: false,
            showPredictions: false,
            showPercentChange: false
        };
        
        // Obtener valores actuales de los checkboxes (si existen)
        const showCount = document.getElementById('show-count')?.checked ?? kpiMetrics.showCount;
        const showDailyAvg = document.getElementById('show-daily-avg')?.checked ?? kpiMetrics.showDailyAvg;
        const showEntitiesCount = document.getElementById('show-entities-count')?.checked ?? kpiMetrics.showEntitiesCount;
        const showGrowthRate = document.getElementById('show-growth-rate')?.checked ?? kpiMetrics.showGrowthRate;
        const showPredictions = document.getElementById('show-predictions')?.checked ?? kpiMetrics.showPredictions;
        const showPercentChange = document.getElementById('show-percent-change')?.checked ?? kpiMetrics.showPercentChange;
        
        // Calcular métricas básicas
        const metricsContainer = document.getElementById('kpi-metrics-container');
        metricsContainer.innerHTML = '';
        
        // Estilo de las tarjetas basado en la configuración
        const cardStyle = kpiStyle === 'modern' ? 'border-0 shadow-sm' : 'border';
        const cardColors = kpiStyle === 'modern' ? [
            'bg-primary text-white',
            'bg-success text-white',
            'bg-info text-white',
            'bg-warning text-dark',
            'bg-danger text-white',
            'bg-secondary text-white'
        ] : [
            'bg-white',
            'bg-white',
            'bg-white',
            'bg-white',
            'bg-white',
            'bg-white'
        ];
        
        // Contador para colores
        let colorIndex = 0;
        
        // KPI: Total de registros
        if (showCount) {
            const countCard = document.createElement('div');
            countCard.className = 'col-md-4 mb-4';
            countCard.innerHTML = `
                <div class="card ${cardStyle} h-100 ${cardColors[colorIndex++ % cardColors.length]}">
                    <div class="card-body text-center">
                        <h6 class="text-uppercase">Total de Registros</h6>
                        <h1 class="display-4">${filteredRecords.length}</h1>
                        <p class="small mb-0">Registros en el período</p>
                    </div>
                </div>
            `;
            metricsContainer.appendChild(countCard);
        }
        
        // KPI: Promedio diario
        if (showDailyAvg) {
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
                    avgRecordsPerDay = Math.round((filteredRecords.length / totalDays) * Math.pow(10, kpiDecimalPlaces)) / Math.pow(10, kpiDecimalPlaces);
                }
            }
            
            const avgCard = document.createElement('div');
            avgCard.className = 'col-md-4 mb-4';
            avgCard.innerHTML = `
                <div class="card ${cardStyle} h-100 ${cardColors[colorIndex++ % cardColors.length]}">
                    <div class="card-body text-center">
                        <h6 class="text-uppercase">Promedio Diario</h6>
                        <h1 class="display-4">${avgRecordsPerDay.toFixed(kpiDecimalPlaces)}</h1>
                        <p class="small mb-0">Registros por día</p>
                    </div>
                </div>
            `;
            metricsContainer.appendChild(avgCard);
        }
        
        // KPI: Total de entidades
        if (showEntitiesCount) {
            const allEntities = EntityModel.getAll();
            
            const entitiesCard = document.createElement('div');
            entitiesCard.className = 'col-md-4 mb-4';
            entitiesCard.innerHTML = `
                <div class="card ${cardStyle} h-100 ${cardColors[colorIndex++ % cardColors.length]}">
                    <div class="card-body text-center">
                        <h6 class="text-uppercase">${UIUtils.getEntityName()}s</h6>
                        <h1 class="display-4">${allEntities.length}</h1>
                        <p class="small mb-0">${UIUtils.getEntityName()}s registradas</p>
                    </div>
                </div>
            `;
            metricsContainer.appendChild(entitiesCard);
        }
        
        // KPI: Tasa de crecimiento
        if (showGrowthRate && filteredRecords.length > 0) {
            // Calcular tasa de crecimiento
            const growthRate = this.calculateGrowthRate(filteredRecords);
            
            const growthCard = document.createElement('div');
            growthCard.className = 'col-md-4 mb-4';
            growthCard.innerHTML = `
                <div class="card ${cardStyle} h-100 ${cardColors[colorIndex++ % cardColors.length]}">
                    <div class="card-body text-center">
                        <h6 class="text-uppercase">Tasa de Crecimiento</h6>
                        <h1 class="display-4 ${growthRate >= 0 ? 'text-success' : 'text-danger'}">
                            ${growthRate >= 0 ? '+' : ''}${growthRate.toFixed(1)}%
                        </h1>
                        <p class="small mb-0">Último período vs. anterior</p>
                    </div>
                </div>
            `;
            metricsContainer.appendChild(growthCard);
        }
        
        // KPI: Predicción simple
        if (showPredictions && filteredRecords.length > 0) {
            // Calcular predicción para el próximo período
            const prediction = this.calculateSimplePrediction(filteredRecords);
            
            const predictionCard = document.createElement('div');
            predictionCard.className = 'col-md-4 mb-4';
            predictionCard.innerHTML = `
                <div class="card ${cardStyle} h-100 ${cardColors[colorIndex++ % cardColors.length]}">
                    <div class="card-body text-center">
                        <h6 class="text-uppercase">Predicción</h6>
                        <h1 class="display-4">${prediction}</h1>
                        <p class="small mb-0">Registros esperados próximo período</p>
                    </div>
                </div>
            `;
            metricsContainer.appendChild(predictionCard);
        }
        
        // KPI: Cambio porcentual
        if (showPercentChange && this.selectedFields.length > 0) {
            const fieldId = this.selectedFields[0]; // Usar el primer campo seleccionado
            const field = FieldModel.getById(fieldId);
            
            if (field && field.type === 'number') {
                // Calcular cambio porcentual entre períodos
                const percentChange = this.calculatePercentChange(filteredRecords, fieldId);
                
                const changeCard = document.createElement('div');
                changeCard.className = 'col-md-4 mb-4';
                changeCard.innerHTML = `
                    <div class="card ${cardStyle} h-100 ${cardColors[colorIndex++ % cardColors.length]}">
                        <div class="card-body text-center">
                            <h6 class="text-uppercase">Cambio en ${field.name}</h6>
                            <h1 class="display-4 ${percentChange >= 0 ? 'text-success' : 'text-danger'}">
                                ${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%
                            </h1>
                            <p class="small mb-0">Último período vs. anterior</p>
                        </div>
                    </div>
                `;
                metricsContainer.appendChild(changeCard);
            }
        }
        
        // Generar KPIs para campos seleccionados
        const kpiFieldsContainer = document.getElementById('kpi-fields-container');
        kpiFieldsContainer.innerHTML = '';
        
        // Colores para las tarjetas de KPI
        colorIndex = 0; // Reiniciar contador de colores
        
        // Obtener la agregación por defecto
        const aggregation = document.getElementById('default-aggregation')?.value || kpiDefaultAggregation;
        
        // Generar KPIs para cada campo seleccionado
        this.selectedFields.forEach((fieldId) => {
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
            const colorClass = cardColors[colorIndex++ % cardColors.length];
            
            // Valor principal según la agregación seleccionada
            let mainValue, mainLabel;
            switch (aggregation) {
                case 'avg':
                    mainValue = avg;
                    mainLabel = 'Promedio';
                    break;
                case 'max':
                    mainValue = max;
                    mainLabel = 'Máximo';
                    break;
                case 'min':
                    mainValue = min;
                    mainLabel = 'Mínimo';
                    break;
                case 'sum':
                default:
                    mainValue = sum;
                    mainLabel = 'Suma';
            }
            
            // Crear tarjeta de KPI
            const kpiCard = document.createElement('div');
            kpiCard.className = 'col-md-6 col-lg-4 mb-4';
            kpiCard.innerHTML = `
                <div class="card ${cardStyle} h-100 ${colorClass}">
                    <div class="card-body">
                        <h5 class="card-title text-center">${field.name}</h5>
                        <div class="text-center mb-3">
                            <h6 class="text-uppercase small opacity-75">${mainLabel}</h6>
                            <h2>${ChartUtils.formatNumber(mainValue, kpiDecimalPlaces)}</h2>
                        </div>
                        <div class="row text-center">
                            ${aggregation !== 'sum' ? `
                            <div class="col-6 mb-2">
                                <h6 class="text-uppercase small opacity-75">Suma</h6>
                                <h4>${ChartUtils.formatNumber(sum, kpiDecimalPlaces)}</h4>
                            </div>` : ''}
                            ${aggregation !== 'avg' ? `
                            <div class="col-6 mb-2">
                                <h6 class="text-uppercase small opacity-75">Promedio</h6>
                                <h4>${ChartUtils.formatNumber(avg, kpiDecimalPlaces)}</h4>
                            </div>` : ''}
                            ${aggregation !== 'max' ? `
                            <div class="col-6">
                                <h6 class="text-uppercase small opacity-75">Máximo</h6>
                                <h4>${ChartUtils.formatNumber(max, kpiDecimalPlaces)}</h4>
                            </div>` : ''}
                            ${aggregation !== 'min' ? `
                            <div class="col-6">
                                <h6 class="text-uppercase small opacity-75">Mínimo</h6>
                                <h4>${ChartUtils.formatNumber(min, kpiDecimalPlaces)}</h4>
                            </div>` : ''}
                        </div>
                    </div>
                    <div class="card-footer text-center">
                        <small class="text-${kpiStyle === 'modern' ? 'white' : 'muted'}">
                            ${values.length} registros analizados
                        </small>
                    </div>
                </div>
            `;
            
            kpiFieldsContainer.appendChild(kpiCard);
        });
    },

    /**
     * Calcula la tasa de crecimiento entre períodos
     * @param {Array} records Registros filtrados
     * @returns {number} Tasa de crecimiento en porcentaje
     */
    calculateGrowthRate(records) {
        // Ordenar registros por fecha
        records.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        if (records.length < 2) return 0;
        
        // Obtener el rango de fechas
        const firstDate = new Date(records[0].timestamp);
        const lastDate = new Date(records[records.length - 1].timestamp);
        
        // Calcular duración total en días
        const totalDays = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24));
        
        if (totalDays <= 1) return 0;
        
        // Dividir en dos períodos
        const middleDate = new Date(firstDate.getTime() + (lastDate - firstDate) / 2);
        
        // Contar registros en cada período
        const firstPeriodCount = records.filter(r => new Date(r.timestamp) < middleDate).length;
        const secondPeriodCount = records.filter(r => new Date(r.timestamp) >= middleDate).length;
        
        // Calcular tasa de crecimiento
        if (firstPeriodCount === 0) return 100; // Si no había registros antes, es 100% de crecimiento
        
        return ((secondPeriodCount - firstPeriodCount) / firstPeriodCount) * 100;
    },

    /**
     * Calcula una predicción simple para el próximo período
     * @param {Array} records Registros filtrados
     * @returns {number} Número de registros predichos
     */
    calculateSimplePrediction(records) {
        // Ordenar registros por fecha
        records.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        if (records.length < 2) return records.length;
        
        // Obtener el rango de fechas
        const firstDate = new Date(records[0].timestamp);
        const lastDate = new Date(records[records.length - 1].timestamp);
        
        // Calcular duración total en días
        const totalDays = Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)) || 1;
        
        // Calcular registros por día
        const recordsPerDay = records.length / totalDays;
        
        // Predicción simple: mantener la misma tasa para el siguiente período
        return Math.round(recordsPerDay * totalDays);
    },

    /**
     * Calcula el cambio porcentual en un campo entre períodos
     * @param {Array} records Registros filtrados
     * @param {string} fieldId ID del campo a analizar
     * @returns {number} Cambio porcentual
     */
    calculatePercentChange(records, fieldId) {
        // Ordenar registros por fecha
        records.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        // Filtrar registros que contengan el campo
        const recordsWithField = records.filter(r => r.data[fieldId] !== undefined);
        
        if (recordsWithField.length < 2) return 0;
        
        // Obtener el rango de fechas
        const firstDate = new Date(recordsWithField[0].timestamp);
        const lastDate = new Date(recordsWithField[recordsWithField.length - 1].timestamp);
        
        // Dividir en dos períodos
        const middleDate = new Date(firstDate.getTime() + (lastDate - firstDate) / 2);
        
        // Obtener valores para cada período
        const firstPeriodValues = recordsWithField
            .filter(r => new Date(r.timestamp) < middleDate)
            .map(r => parseFloat(r.data[fieldId]) || 0);
            
        const secondPeriodValues = recordsWithField
            .filter(r => new Date(r.timestamp) >= middleDate)
            .map(r => parseFloat(r.data[fieldId]) || 0);
        
        if (firstPeriodValues.length === 0 || secondPeriodValues.length === 0) return 0;
        
        // Calcular sumas
        const firstPeriodSum = firstPeriodValues.reduce((a, b) => a + b, 0);
        const secondPeriodSum = secondPeriodValues.reduce((a, b) => a + b, 0);
        
        // Calcular cambio porcentual
        if (firstPeriodSum === 0) return 100; // Si no había valor antes, es 100% de crecimiento
        
        return ((secondPeriodSum - firstPeriodSum) / firstPeriodSum) * 100;
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
     * Actualiza el gráfico de tendencia con comparación de períodos
     */
    updateTrendChart() {
        const trendField = document.getElementById('trend-field');
        const trendPeriod = document.getElementById('trend-period');
        const comparisonMode = document.getElementById('comparison-mode');
        
        if (!trendField || !trendPeriod || !comparisonMode) return;
        if (!trendField.value) return;
        
        const fieldId = trendField.value;
        const periodType = trendPeriod.value;
        const compareMode = comparisonMode.value;
        
        const field = FieldModel.getById(fieldId);
        if (!field) return;
        
        // Obtener filtros actuales
        const filters = this.applyFilters();
        const currentPeriodRecords = RecordModel.filterMultiple(filters);
        
        // Filtrar registros que tengan el campo seleccionado
        const recordsWithField = currentPeriodRecords.filter(record => record.data[fieldId] !== undefined);
        
        if (recordsWithField.length === 0) {
            // No hay datos para mostrar
            this.showNoDataChart('trend-chart');
            this.clearComparisonTable();
            return;
        }
        
        // Calcular fechas para el período anterior basado en el modo de comparación
        const previousPeriodDates = this.calculatePreviousPeriodDates(filters.fromDate, filters.toDate, compareMode);
        
        // Si se seleccionó un modo de comparación diferente a "none"
        let previousPeriodRecords = [];
        if (compareMode !== 'none') {
            // Obtener registros del período anterior
            const previousFilters = {
                ...filters,
                fromDate: previousPeriodDates.fromDate,
                toDate: previousPeriodDates.toDate
            };
            
            previousPeriodRecords = RecordModel.filterMultiple(previousFilters)
                .filter(record => record.data[fieldId] !== undefined);
        }
        
        // Procesar datos según el tipo de período
        const currentPeriodData = this.aggregateRecordsByPeriod(recordsWithField, fieldId, periodType);
        const previousPeriodData = compareMode !== 'none' ? 
            this.aggregateRecordsByPeriod(previousPeriodRecords, fieldId, periodType) : null;
        
        // Generar etiquetas y series para el gráfico
        const { labels, datasets } = this.prepareComparisonChartData(
            currentPeriodData, 
            previousPeriodData, 
            field.name, 
            periodType,
            compareMode
        );
        
        // Dibujar gráfico de línea para tendencias
        this.drawChart('trend-chart', 'line', labels, datasets, `Tendencia de ${field.name} por ${this.getPeriodLabel(periodType)}`);
        
        // Actualizar tabla de comparación
        this.updateComparisonTable(currentPeriodData, previousPeriodData, field.name);
    },

    /**
     * Calcula las fechas para el período anterior basado en el modo de comparación
     * @param {string} fromDate Fecha inicial del período actual
     * @param {string} toDate Fecha final del período actual
     * @param {string} compareMode Modo de comparación ('period', 'year', 'custom', 'none')
     * @returns {Object} Fechas del período anterior
     */
    calculatePreviousPeriodDates(fromDate, toDate, compareMode) {
        // Si no hay fechas, usar últimos 30 días por defecto
        if (!fromDate || !toDate) {
            const today = new Date();
            toDate = today.toISOString().split('T')[0];
            
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(today.getDate() - 30);
            fromDate = thirtyDaysAgo.toISOString().split('T')[0];
        }
        
        const from = new Date(fromDate);
        const to = new Date(toDate);
        
        // Duración del período en milisegundos
        const periodDuration = to.getTime() - from.getTime();
        
        let previousFromDate, previousToDate;
        
        switch (compareMode) {
            case 'period':
                // Período inmediatamente anterior de la misma duración
                previousToDate = new Date(from);
                previousToDate.setDate(previousToDate.getDate() - 1);
                
                previousFromDate = new Date(previousToDate);
                previousFromDate.setTime(previousToDate.getTime() - periodDuration);
                break;
                
            case 'year':
                // Mismo período del año anterior
                previousFromDate = new Date(from);
                previousFromDate.setFullYear(previousFromDate.getFullYear() - 1);
                
                previousToDate = new Date(to);
                previousToDate.setFullYear(previousToDate.getFullYear() - 1);
                break;
                
            case 'custom':
                // Usar fechas personalizadas (se manejan en UI)
                const customFromInput = document.getElementById('comparison-from-date');
                const customToInput = document.getElementById('comparison-to-date');
                
                if (customFromInput && customToInput && 
                    customFromInput.value && customToInput.value) {
                    previousFromDate = new Date(customFromInput.value);
                    previousToDate = new Date(customToInput.value);
                } else {
                    // Si no hay fechas personalizadas, usar período anterior
                    previousToDate = new Date(from);
                    previousToDate.setDate(previousToDate.getDate() - 1);
                    
                    previousFromDate = new Date(previousToDate);
                    previousFromDate.setTime(previousToDate.getTime() - periodDuration);
                }
                break;
                
            default:
                // Por defecto usar período anterior
                previousToDate = new Date(from);
                previousToDate.setDate(previousToDate.getDate() - 1);
                
                previousFromDate = new Date(previousToDate);
                previousFromDate.setTime(previousToDate.getTime() - periodDuration);
        }
        
        return {
            fromDate: previousFromDate.toISOString().split('T')[0],
            toDate: previousToDate.toISOString().split('T')[0]
        };
    },

    /**
     * Agrupa registros por período y calcula métricas
     * @param {Array} records Registros a agrupar
     * @param {string} fieldId ID del campo para las métricas
     * @param {string} periodType Tipo de período ('day', 'week', 'month', 'quarter', 'year', 'custom')
     * @returns {Object} Datos agrupados
     */
    aggregateRecordsByPeriod(records, fieldId, periodType) {
        // Ordenar registros por fecha
        records.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        // Agrupar por período
        const groupedData = {};
        let totalSum = 0;
        let totalCount = 0;
        let minValue = Infinity;
        let maxValue = -Infinity;
        
        records.forEach(record => {
            const date = new Date(record.timestamp);
            let groupKey;
            
            switch (periodType) {
                case 'day':
                    groupKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
                    break;
                    
                case 'week':
                    // Calcular semana (tomando lunes como día 1)
                    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
                    const dayOfYear = Math.floor((date - firstDayOfYear) / (24 * 60 * 60 * 1000));
                    const weekNumber = Math.ceil((dayOfYear + firstDayOfYear.getDay()) / 7);
                    groupKey = `${date.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
                    break;
                    
                case 'month':
                    groupKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
                    break;
                    
                case 'quarter':
                    const quarter = Math.floor(date.getMonth() / 3) + 1;
                    groupKey = `${date.getFullYear()}-Q${quarter}`;
                    break;
                    
                case 'year':
                    groupKey = date.getFullYear().toString();
                    break;
                    
                default: // custom o cualquier otro
                    // Para personalizados o no especificados, usar todo el período como un solo grupo
                    groupKey = 'all';
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
            
            // Actualizar estadísticas globales
            totalSum += value;
            totalCount++;
            minValue = Math.min(minValue, value);
            maxValue = Math.max(maxValue, value);
        });
        
        // Calcular promedios y otras métricas para cada grupo
        Object.keys(groupedData).forEach(key => {
            const group = groupedData[key];
            group.avg = group.sum / group.count;
            group.min = Math.min(...group.values);
            group.max = Math.max(...group.values);
        });
        
        // Métricas globales
        const averageValue = totalCount > 0 ? totalSum / totalCount : 0;
        
        return {
            groups: groupedData,
            total: {
                count: totalCount,
                sum: totalSum,
                avg: averageValue,
                min: totalCount > 0 ? minValue : 0,
                max: totalCount > 0 ? maxValue : 0
            }
        };
    },

    /**
     * Prepara los datos para el gráfico de comparación
     * @param {Object} currentPeriodData Datos del período actual
     * @param {Object} previousPeriodData Datos del período anterior (opcional)
     * @param {string} fieldName Nombre del campo
     * @param {string} periodType Tipo de período
     * @param {string} compareMode Modo de comparación
     * @returns {Object} Datos preparados para el gráfico
     */
    prepareComparisonChartData(currentPeriodData, previousPeriodData, fieldName, periodType, compareMode) {
        // Si no hay período anterior, mostrar solo el actual
        if (!previousPeriodData || compareMode === 'none') {
            const currentGroups = currentPeriodData.groups;
            const sortedKeys = Object.keys(currentGroups).sort();
            
            const labels = sortedKeys.map(key => this.formatPeriodLabel(key, periodType));
            const datasets = [{
                label: `${fieldName} (Período Actual)`,
                data: sortedKeys.map(key => currentGroups[key].sum),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: false
            }];
            
            return { labels, datasets };
        }
        
        // Combinar claves de ambos períodos
        const currentGroups = currentPeriodData.groups;
        const previousGroups = previousPeriodData.groups;
        
        // Obtener todas las claves únicas
        const allKeys = new Set([
            ...Object.keys(currentGroups),
            ...Object.keys(previousGroups)
        ]);
        
        // Ordenar las claves
        const sortedKeys = Array.from(allKeys).sort();
        
        // Preparar etiquetas y datos
        const labels = sortedKeys.map(key => this.formatPeriodLabel(key, periodType));
        
        // Preparar conjuntos de datos
        const currentData = sortedKeys.map(key => 
            currentGroups[key] ? currentGroups[key].sum : null
        );
        
        const previousData = sortedKeys.map(key => 
            previousGroups[key] ? previousGroups[key].sum : null
        );
        
        const datasets = [
            {
                label: `${fieldName} (Período Actual)`,
                data: currentData,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: false
            },
            {
                label: `${fieldName} (Período Anterior)`,
                data: previousData,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: false,
                borderDash: [5, 5]
            }
        ];
        
        return { labels, datasets };
    },

    /**
     * Formatea una etiqueta de período para mostrar
     * @param {string} key Clave del período
     * @param {string} periodType Tipo de período
     * @returns {string} Etiqueta formateada
     */
    formatPeriodLabel(key, periodType) {
        if (key === 'all') return 'Todo el período';
        
        switch (periodType) {
            case 'day':
                // Formato YYYY-MM-DD a DD/MM/YYYY
                const [year, month, day] = key.split('-');
                return `${day}/${month}/${year}`;
                
            case 'week':
                // Formato YYYY-Wnn
                const [weekYear, weekNum] = key.split('-W');
                return `Semana ${weekNum}, ${weekYear}`;
                
            case 'month':
                // Formato YYYY-MM
                const [monthYear, monthNum] = key.split('-');
                const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                               'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
                return `${months[parseInt(monthNum) - 1]} ${monthYear}`;
                
            case 'quarter':
                // Formato YYYY-Qn
                const [quarterYear, quarterNum] = key.split('-Q');
                return `Q${quarterNum} ${quarterYear}`;
                
            case 'year':
                // Formato YYYY
                return key;
                
            default:
                return key;
        }
    },

    /**
     * Obtiene la etiqueta descriptiva para un tipo de período
     * @param {string} periodType Tipo de período
     * @returns {string} Etiqueta del período
     */
    getPeriodLabel(periodType) {
        switch (periodType) {
            case 'day': return 'día';
            case 'week': return 'semana';
            case 'month': return 'mes';
            case 'quarter': return 'trimestre';
            case 'year': return 'año';
            case 'custom': return 'período personalizado';
            default: return 'período';
        }
    },

    /**
     * Actualiza la tabla de comparación entre períodos
     * @param {Object} currentPeriodData Datos del período actual
     * @param {Object} previousPeriodData Datos del período anterior (opcional)
     * @param {string} fieldName Nombre del campo
     */
    updateComparisonTable(currentPeriodData, previousPeriodData, fieldName) {
        const tableBody = document.getElementById('comparison-table-body');
        if (!tableBody) return;
        
        const decimals = document.getElementById('decimal-places')?.value || 2;
        const current = currentPeriodData.total;
        
        // Si no hay período anterior, mostrar solo estadísticas del período actual
        if (!previousPeriodData) {
            tableBody.innerHTML = `
                <tr>
                    <td>Suma de ${fieldName}</td>
                    <td>${ChartUtils.formatNumber(current.sum, decimals)}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                </tr>
                <tr>
                    <td>Promedio de ${fieldName}</td>
                    <td>${ChartUtils.formatNumber(current.avg, decimals)}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                </tr>
                <tr>
                    <td>Máximo de ${fieldName}</td>
                    <td>${ChartUtils.formatNumber(current.max, decimals)}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                </tr>
                <tr>
                    <td>Mínimo de ${fieldName}</td>
                    <td>${ChartUtils.formatNumber(current.min, decimals)}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                </tr>
                <tr>
                    <td>Número de registros</td>
                    <td>${current.count}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                </tr>
            `;
            return;
        }
        
        // Datos del período anterior
        const previous = previousPeriodData.total;
        
        // Calcular diferencias y porcentajes
        const sumDiff = current.sum - previous.sum;
        const sumPercent = previous.sum !== 0 ? (sumDiff / previous.sum) * 100 : 0;
        
        const avgDiff = current.avg - previous.avg;
        const avgPercent = previous.avg !== 0 ? (avgDiff / previous.avg) * 100 : 0;
        
        const maxDiff = current.max - previous.max;
        const maxPercent = previous.max !== 0 ? (maxDiff / previous.max) * 100 : 0;
        
        const minDiff = current.min - previous.min;
        const minPercent = previous.min !== 0 ? (minDiff / previous.min) * 100 : 0;
        
        const countDiff = current.count - previous.count;
        const countPercent = previous.count !== 0 ? (countDiff / previous.count) * 100 : 0;
        
        // Crear filas con clases para colores según si aumentó o disminuyó
        tableBody.innerHTML = `
            <tr>
                <td>Suma de ${fieldName}</td>
                <td>${ChartUtils.formatNumber(current.sum, decimals)}</td>
                <td>${ChartUtils.formatNumber(previous.sum, decimals)}</td>
                <td class="${sumDiff >= 0 ? 'text-success' : 'text-danger'}">${sumDiff >= 0 ? '+' : ''}${ChartUtils.formatNumber(sumDiff, decimals)}</td>
                <td class="${sumDiff >= 0 ? 'text-success' : 'text-danger'}">${sumDiff >= 0 ? '+' : ''}${sumPercent.toFixed(2)}%</td>
            </tr>
            <tr>
                <td>Promedio de ${fieldName}</td>
                <td>${ChartUtils.formatNumber(current.avg, decimals)}</td>
                <td>${ChartUtils.formatNumber(previous.avg, decimals)}</td>
                <td class="${avgDiff >= 0 ? 'text-success' : 'text-danger'}">${avgDiff >= 0 ? '+' : ''}${ChartUtils.formatNumber(avgDiff, decimals)}</td>
                <td class="${avgDiff >= 0 ? 'text-success' : 'text-danger'}">${avgDiff >= 0 ? '+' : ''}${avgPercent.toFixed(2)}%</td>
            </tr>
            <tr>
                <td>Máximo de ${fieldName}</td>
                <td>${ChartUtils.formatNumber(current.max, decimals)}</td>
                <td>${ChartUtils.formatNumber(previous.max, decimals)}</td>
                <td class="${maxDiff >= 0 ? 'text-success' : 'text-danger'}">${maxDiff >= 0 ? '+' : ''}${ChartUtils.formatNumber(maxDiff, decimals)}</td>
                <td class="${maxDiff >= 0 ? 'text-success' : 'text-danger'}">${maxDiff >= 0 ? '+' : ''}${maxPercent.toFixed(2)}%</td>
            </tr>
            <tr>
                <td>Mínimo de ${fieldName}</td>
                <td>${ChartUtils.formatNumber(current.min, decimals)}</td>
                <td>${ChartUtils.formatNumber(previous.min, decimals)}</td>
                <td class="${minDiff >= 0 ? 'text-success' : 'text-danger'}">${minDiff >= 0 ? '+' : ''}${ChartUtils.formatNumber(minDiff, decimals)}</td>
                <td class="${minDiff >= 0 ? 'text-success' : 'text-danger'}">${minDiff >= 0 ? '+' : ''}${minPercent.toFixed(2)}%</td>
            </tr>
            <tr>
                <td>Número de registros</td>
                <td>${current.count}</td>
                <td>${previous.count}</td>
                <td class="${countDiff >= 0 ? 'text-success' : 'text-danger'}">${countDiff >= 0 ? '+' : ''}${countDiff}</td>
                <td class="${countDiff >= 0 ? 'text-success' : 'text-danger'}">${countDiff >= 0 ? '+' : ''}${countPercent.toFixed(2)}%</td>
            </tr>
        `;
    },

    /**
     * Limpia la tabla de comparación
     */
    clearComparisonTable() {
        const tableBody = document.getElementById('comparison-table-body');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">Seleccione un campo y un período para ver la comparación</td>
                </tr>
            `;
        }
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