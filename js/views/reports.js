/**
 * Vista de reportes para visualizar datos
 */
const ReportsView = {
    // --- Propiedades Inicializadas ---
    pagination: {
        currentPage: 1,
        itemsPerPage: 20, // O el valor por defecto que prefieras
    },
    sorting: {
        column: 'timestamp', // Columna inicial para ordenar (o null)
        direction: 'desc',   // Dirección inicial ('asc' o 'desc')
    },
    selectedColumns: {
        field1: null, // O '', dependiendo de cómo manejes la ausencia de selección
        field2: null,
        field3: null,
    },
    filteredRecords: [], // Inicializar como array vacío
    searchedRecords: [], // Inicializar como array vacío
    // ---------------------------------

    /**
     * Inicializa la vista de reportes
     */
    init() {
        // Reiniciar estado al inicializar (opcional pero recomendado)
        this.pagination = { currentPage: 1, itemsPerPage: parseInt(document.getElementById('items-per-page')?.value) || 20 };
        this.sorting = { column: 'timestamp', direction: 'desc' };
        this.selectedColumns = { field1: null, field2: null, field3: null };
        this.filteredRecords = [];
        this.searchedRecords = [];

        this.render(); // Ahora 'this.selectedColumns' existe
        this.setupEventListeners();

        // Generar automáticamente el reporte al cargar la página
        this.autoGenerateReport();
    },

    // ... (resto del código sin cambios en la definición inicial) ...

    /**
     * Renderiza el contenido de la vista
     */
    render() {
        const mainContent = document.getElementById('main-content');
        // --- Añadir verificación para mainContent ---
        if (!mainContent) {
            console.error("Error: Elemento con id 'main-content' no encontrado en el DOM.");
            return; // Detener la renderización si el contenedor principal no existe
        }
        // -------------------------------------------

        const entities = EntityModel.getAll();
        const sharedNumericFields = FieldModel.getSharedNumericFields();
        const sharedFields = FieldModel.getAll(); // Todos los campos para el eje horizontal

        // Formatear fecha actual para los inputs de fecha
        const today = new Date().toISOString().split('T')[0];
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        // --- Corrección: Usar formatDateForInput para consistencia ---
        // const lastMonthStr = lastMonth.toISOString().split('T')[0];
        const lastMonthStr = this.formatDateForInput(lastMonth);
        // ----------------------------------------------------------

        // Obtener nombre personalizado de la entidad
        const config = StorageService.getConfig();
        const entityName = config.entityName || 'Entidad';

        // Obtener campos marcados para columnas
        const column3Field = FieldModel.getAll().find(field => field.isColumn3);
        const column4Field = FieldModel.getAll().find(field => field.isColumn4);
        const column5Field = FieldModel.getAll().find(field => field.isColumn5);

        // Actualiza SelectedColumns al cargar si hay campos marcados
        // Ahora 'this.selectedColumns' está definido gracias a la inicialización
        this.selectedColumns.field1 = column3Field ? column3Field.id : null; // Línea 70 (modificada para seguridad)
        this.selectedColumns.field2 = column4Field ? column4Field.id : null; // Línea 71 (modificada para seguridad)
        this.selectedColumns.field3 = column5Field ? column5Field.id : null; // Línea 72 (modificada para seguridad)


        // Obtener campos marcados para reportes comparativos
        const horizontalAxisField = FieldModel.getAll().find(field => field.isHorizontalAxis);
        const compareField = FieldModel.getAll().find(field => field.isCompareField);

        // --- HTML Template Reorganizado ---
        const template = `
            <div class="container mt-4">
                <h2>Reportes y Análisis</h2>

                <!-- Filtros -->
                <div class="card mb-4">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">Filtros</h5>
                    </div>
                    <div class="card-body">
                        <form id="filter-form" class="row g-3">
                            <div class="col-md-4">
                                <label for="filter-entity" class="form-label">${entityName}(es)</label>
                                <select class="form-select" id="filter-entity" multiple size="4">
                                    <option value="">Todas las ${entityName.toLowerCase()}s</option>
                                    ${entities.map(entity =>
                                        `<option value="${entity.id}">${entity.name}</option>`
                                    ).join('')}
                                </select>
                                <div class="form-text">Mantenga presionado Ctrl (⌘ en Mac) para seleccionar múltiples ${entityName.toLowerCase()}s</div>
                            </div>
                            <div class="col-md-4">
                                <label for="filter-from-date" class="form-label">Desde</label>
                                <input type="date" class="form-control" id="filter-from-date" value="${lastMonthStr}">
                            </div>
                            <div class="col-md-4">
                                <label for="filter-to-date" class="form-label">Hasta</label>
                                <input type="date" class="form-control" id="filter-to-date" value="${today}">
                            </div>
                            <div class="col-12">
                                <button type="submit" class="btn btn-primary">Aplicar Filtros</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Atajos de fecha -->
                <div class="card mb-4">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">Atajos de fecha</h5>
                    </div>
                    <div class="card-body text-center">
                        <div class="btn-group mb-3" role="group" aria-label="Atajos de fecha">
                            <button type="button" class="btn btn-outline-primary date-shortcut" data-range="yesterday">Ayer</button>
                            <button type="button" class="btn btn-outline-primary date-shortcut" data-range="thisWeek">Esta semana</button>
                            <button type="button" class="btn btn-outline-primary date-shortcut" data-range="lastWeek">Semana pasada</button>
                            <button type="button" class="btn btn-outline-primary date-shortcut" data-range="thisMonth">Mes actual</button>
                            <button type="button" class="btn btn-outline-primary date-shortcut" data-range="lastMonth">Mes pasado</button>
                        </div>

                        <h6 class="mt-3 mb-2">Última semana</h6>
                        <div class="btn-group flex-wrap" role="group" aria-label="Días última semana">
                            <button type="button" class="btn btn-sm btn-outline-secondary date-shortcut" data-range="lastMonday">Lunes</button>
                            <button type="button" class="btn btn-sm btn-outline-secondary date-shortcut" data-range="lastTuesday">Martes</button>
                            <button type="button" class="btn btn-sm btn-outline-secondary date-shortcut" data-range="lastWednesday">Miércoles</button>
                            <button type="button" class="btn btn-sm btn-outline-secondary date-shortcut" data-range="lastThursday">Jueves</button>
                            <button type="button" class="btn btn-sm btn-outline-secondary date-shortcut" data-range="lastFriday">Viernes</button>
                            <button type="button" class="btn btn-sm btn-outline-secondary date-shortcut" data-range="lastSaturday">Sábado</button>
                            <button type="button" class="btn btn-sm btn-outline-secondary date-shortcut" data-range="lastSunday">Domingo</button>
                        </div>
                    </div>
                </div>

                <!-- Reportes Comparativos -->
                <div class="card mb-4">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">Reportes Comparativos</h5>
                    </div>
                    <div class="card-body">
                        ${sharedNumericFields.length === 0 ? `
                            <div class="alert alert-info">
                                No hay campos numéricos compartidos entre ${entityName.toLowerCase()}s para generar reportes comparativos.
                                <hr>
                                <p class="mb-0">Para generar reportes comparativos, debe crear campos numéricos y asignarlos a múltiples ${entityName.toLowerCase()}s.</p>
                            </div>
                        ` : `
                            <form id="report-form" class="row g-3 mb-4">
                                <div class="col-md-4">
                                    <label for="report-horizontal-field" class="form-label">Eje Horizontal</label>
                                    <select class="form-select" id="report-horizontal-field">
                                        <option value="">${entityName} Principal</option>
                                        ${sharedFields.map(field =>
                                            `<option value="${field.id}" ${(horizontalAxisField && horizontalAxisField.id === field.id) ? 'selected' : ''}>${field.name}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label for="report-field" class="form-label">Campo a Comparar</label>
                                    <select class="form-select" id="report-field" required>
                                        <option value="">Seleccione un campo</option>
                                        ${sharedNumericFields.map(field =>
                                            `<option value="${field.id}" ${(compareField && compareField.id === field.id) ? 'selected' : ''}>${field.name}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label for="report-aggregation" class="form-label">Tipo de Agregación</label>
                                    <select class="form-select" id="report-aggregation">
                                        <option value="sum">Suma</option>
                                        <option value="average">Promedio</option>
                                    </select>
                                </div>
                                <div class="col-12">
                                    <button type="submit" class="btn btn-primary">Generar Reporte</button>
                                </div>
                            </form>

                            <div id="report-container" style="display: none;">
                                <div class="row">
                                    <div class="col-md-8">
                                        <div class="chart-container">
                                            <canvas id="report-chart"></canvas>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div id="report-summary"></div>
                                    </div>
                                </div>
                            </div>
                        `}
                    </div>
                </div>

                <!-- Registros -->
                <div class="card mb-4">
                    <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Registros</h5>
                        <div>
                            <button id="export-csv-btn" class="btn btn-outline-light btn-sm me-2">
                                <i class="bi bi-file-earmark-spreadsheet"></i> Exportar a CSV
                            </button>
                            <span id="records-count" class="badge bg-light text-dark">0 registros</span>
                        </div>
                    </div>
                    <div class="card-body p-0">
                        <!-- Búsqueda -->
                        <div class="p-3 bg-light border-bottom">
                            <div class="input-group">
                                <span class="input-group-text">
                                    <i class="bi bi-search"></i>
                                </span>
                                <input type="text" id="search-records" class="form-control" placeholder="Buscar en registros...">
                            </div>
                        </div>
                        <!-- Selectores de Columna -->
                        <div class="p-3 bg-light border-bottom">
                            <div class="row g-3 align-items-end">
                                <div class="col-md-4">
                                    <label for="column-selector-1" class="form-label">Columna 3:</label>
                                    <select class="form-select form-select-sm column-selector" id="column-selector-1">
                                        <option value="">Seleccione un campo</option>
                                        ${sharedFields.map(field =>
                                            `<option value="${field.id}" ${(column3Field && column3Field.id === field.id) ? 'selected' : ''}>${field.name}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label for="column-selector-2" class="form-label">Columna 4:</label>
                                    <select class="form-select form-select-sm column-selector" id="column-selector-2">
                                        <option value="">Seleccione un campo</option>
                                        ${sharedFields.map(field =>
                                            `<option value="${field.id}" ${(column4Field && column4Field.id === field.id) ? 'selected' : ''}>${field.name}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label for="column-selector-3" class="form-label">Columna 5:</label>
                                    <select class="form-select form-select-sm column-selector" id="column-selector-3">
                                        <option value="">Seleccione un campo</option>
                                        ${sharedFields.map(field =>
                                            `<option value="${field.id}" ${(column5Field && column5Field.id === field.id) ? 'selected' : ''}>${field.name}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <!-- Tabla de Registros -->
                        <div class="table-responsive">
                            <table class="table table-hover mb-0" id="records-table">
                                <thead class="table-light">
                                    <tr>
                                        <th class="sortable" data-sort="entity">${entityName} <i class="bi"></i></th>
                                        <th class="sortable" data-sort="timestamp">Fecha y Hora <i class="bi"></i></th>
                                        <th class="sortable column-1" data-sort="field1">Columna 3 <i class="bi"></i></th>
                                        <th class="sortable column-2" data-sort="field2">Columna 4 <i class="bi"></i></th>
                                        <th class="sortable column-3" data-sort="field3">Columna 5 <i class="bi"></i></th>
                                        <th></th> <!-- Columna para acciones -->
                                    </tr>
                                </thead>
                                <tbody id="records-list">
                                    <!-- Las filas se insertarán aquí -->
                                </tbody>
                            </table>
                        </div>
                        <!-- Mensaje si no hay registros -->
                        <div id="no-filtered-records" class="text-center py-4" style="display: none;">
                            <p class="text-muted">No hay registros que coincidan con los filtros.</p>
                        </div>
                        <!-- Paginación -->
                        <div class="d-flex justify-content-between align-items-center mt-3 p-2 bg-light border-top">
                            <div class="d-flex align-items-center">
                                <label class="me-2 mb-0">Registros por página:</label>
                                <select id="items-per-page" class="form-select form-select-sm" style="width: auto;">
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                            </div>
                            <div class="pagination-container">
                                <nav aria-label="Navegación de página">
                                    <ul class="pagination pagination-sm mb-0" id="pagination-controls">
                                        <!-- Controles de paginación se insertarán aquí -->
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div> <!-- Fin card-body p-0 -->
                </div> <!-- Fin card Registros -->

            </div> <!-- Fin container -->
        `;

        mainContent.innerHTML = template;

        // --- Añadir verificación antes de llamar a funciones dependientes del DOM ---
        try {
            // Actualizar los nombres de las columnas en la tabla según los campos marcados
            this.updateColumnHeaders();

            // Cargar datos iniciales con los filtros predeterminados
            this.applyFilters();
        } catch (error) {
            console.error("Error al actualizar cabeceras o aplicar filtros iniciales:", error);
            // Opcionalmente mostrar un mensaje al usuario
            mainContent.innerHTML = `<div class="alert alert-danger">Error al inicializar la vista de reportes. Revise la consola para más detalles.</div>`;
        }
        // -------------------------------------------------------------------------
    },

    // ... (resto de métodos: updateColumnHeaders, setupEventListeners, applyFilters, etc.) ...

    /**
     * Actualiza los encabezados de columna en la tabla según los campos seleccionados
     */
    updateColumnHeaders() {
        // Actualizar encabezados de columna basados en los campos seleccionados
        const column1Header = document.querySelector('th.column-1');
        const column2Header = document.querySelector('th.column-2');
        const column3Header = document.querySelector('th.column-3');

        // Función auxiliar para actualizar un encabezado
        const updateHeader = (headerElement, fieldId) => {
            if (headerElement) {
                const field = fieldId ? FieldModel.getById(fieldId) : null;
                // Usar el nombre del campo o el texto por defecto si no hay campo seleccionado
                const headerText = field ? field.name : headerElement.getAttribute('data-sort').replace('field', 'Columna '); // Ej: Columna 3
                headerElement.innerHTML = `${headerText} <i class="bi"></i>`;
            }
        };

        updateHeader(column1Header, this.selectedColumns.field1);
        updateHeader(column2Header, this.selectedColumns.field2);
        updateHeader(column3Header, this.selectedColumns.field3);
    },

    // ... (resto de los métodos sin cambios) ...
    setupEventListeners() {
        // Aplicar filtros
        document.getElementById('filter-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.applyFilters();

            // Si hay un reporte generado, actualizarlo con los nuevos filtros
            const reportContainer = document.getElementById('report-container');
            if (reportContainer && reportContainer.style.display === 'block') {
                this.generateReport();
            }
        });

        // Generar reporte comparativo
        const reportForm = document.getElementById('report-form');
        if (reportForm) {
            reportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generateReport();
            });
        }

        // Exportar a CSV
        const exportCsvBtn = document.getElementById('export-csv-btn');
        if (exportCsvBtn) {
            exportCsvBtn.addEventListener('click', () => {
                // Obtener los registros filtrados actuales
                const entityFilterSelect = document.getElementById('filter-entity');
                const selectedEntities = Array.from(entityFilterSelect.selectedOptions).map(option => option.value);

                const entityFilter = selectedEntities.includes('') || selectedEntities.length === 0
                    ? []
                    : selectedEntities;

                const fromDateFilter = document.getElementById('filter-from-date').value;
                const toDateFilter = document.getElementById('filter-to-date').value;

                const filters = {
                    entityIds: entityFilter.length > 0 ? entityFilter : undefined,
                    fromDate: fromDateFilter || undefined,
                    toDate: toDateFilter || undefined
                };

                // Obtener registros filtrados (usar los ya filtrados y buscados si existen)
                const recordsToExport = this.searchedRecords || this.filteredRecords || RecordModel.filterMultiple(filters);


                // Ordenar por fecha (más reciente primero) si no hay ordenación activa o es por fecha
                 let sortedRecords = [...recordsToExport];
                 if (!this.sorting.column || this.sorting.column === 'timestamp') {
                     sortedRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                 } else {
                    // Si hay otra ordenación activa, usarla (ya debería estar en this.searchedRecords)
                    sortedRecords = this.searchedRecords ? [...this.searchedRecords] : sortedRecords;
                 }


                // Exportar a CSV usando las columnas seleccionadas
                ExportUtils.exportToCSV(
                    sortedRecords,
                    this.selectedColumns.field1,
                    this.selectedColumns.field2,
                    this.selectedColumns.field3
                );
            });
        }

        // Buscador en la tabla de registros
        const searchInput = document.getElementById('search-records');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.filterRecordsBySearch();
            });
        }

        // Añadir event listener para el selector de registros por página
        const itemsPerPageSelect = document.getElementById('items-per-page');
        if (itemsPerPageSelect) {
            itemsPerPageSelect.value = this.pagination.itemsPerPage; // Asegurar valor inicial
            itemsPerPageSelect.addEventListener('change', () => {
                this.pagination.itemsPerPage = parseInt(itemsPerPageSelect.value);
                this.pagination.currentPage = 1; // Volver a la primera página al cambiar
                this.filterRecordsBySearch(); // Actualizar la visualización
            });
        }

        // Atajos de fecha
        document.querySelectorAll('.date-shortcut').forEach(button => {
            button.addEventListener('click', (e) => {
                const range = e.target.getAttribute('data-range');
                this.setDateRange(range);
                // Aplicar filtros automáticamente
                document.getElementById('filter-form').dispatchEvent(new Event('submit'));
            });
        });

        // Event listeners para selectores de columnas
        document.querySelectorAll('.column-selector').forEach((select, index) => {
            select.addEventListener('change', () => {
                const fieldNumber = index + 1; // 1, 2, or 3
                const columnKey = `field${fieldNumber}`; // field1, field2, field3
                const newValue = select.value; // ID del campo seleccionado o ""

                // Actualizar el estado interno
                this.selectedColumns[columnKey] = newValue;

                // Actualizar el encabezado de la columna inmediatamente
                this.updateColumnHeaders();

                // Actualizar la tabla con los nuevos datos de la columna
                this.filterRecordsBySearch(); // Esto reordena y repagina si es necesario

                // Persistir la selección en el modelo de campos (opcional, pero mantiene la coherencia con Admin)
                // Desmarcar el campo anterior que usaba esta columna (si había uno)
                const allFields = FieldModel.getAll();
                const previousFieldId = allFields.find(f => {
                    if (fieldNumber === 1) return f.isColumn3 && f.id !== newValue;
                    if (fieldNumber === 2) return f.isColumn4 && f.id !== newValue;
                    if (fieldNumber === 3) return f.isColumn5 && f.id !== newValue;
                    return false;
                })?.id;

                if (previousFieldId) {
                    const prevField = FieldModel.getById(previousFieldId);
                    if (prevField) {
                        if (fieldNumber === 1) prevField.isColumn3 = false;
                        if (fieldNumber === 2) prevField.isColumn4 = false;
                        if (fieldNumber === 3) prevField.isColumn5 = false;
                        // Considerar si desmarcar 'useForRecordsTable' si ya no se usa en ninguna columna
                        if (!prevField.isColumn3 && !prevField.isColumn4 && !prevField.isColumn5) {
                           // prevField.useForRecordsTable = false; // Descomentar si se quiere este comportamiento
                        }
                        FieldModel.update(previousFieldId, prevField);
                    }
                }

                // Marcar el nuevo campo seleccionado
                if (newValue) {
                    const selectedField = FieldModel.getById(newValue);
                    if (selectedField) {
                        if (fieldNumber === 1) selectedField.isColumn3 = true;
                        if (fieldNumber === 2) selectedField.isColumn4 = true;
                        if (fieldNumber === 3) selectedField.isColumn5 = true;
                        selectedField.useForRecordsTable = true; // Asegurar que esté marcado para usar en tabla
                        FieldModel.update(newValue, selectedField);
                    }
                }
            });
        });


        // Event listeners para ordenar las columnas
        document.querySelectorAll('th.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const column = th.getAttribute('data-sort');

                // Si ya estamos ordenando por esta columna, invertir dirección
                if (this.sorting.column === column) {
                    this.sorting.direction = this.sorting.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    // Nueva columna seleccionada, establecer ordenación ascendente por defecto
                    this.sorting.column = column;
                    this.sorting.direction = 'asc';
                }

                // Actualizar íconos de ordenación en todas las columnas
                document.querySelectorAll('th.sortable i.bi').forEach(icon => {
                    icon.className = 'bi'; // Resetear clase
                });

                // Actualizar ícono de la columna seleccionada
                const icon = th.querySelector('i.bi');
                if (icon) { // Asegurarse que el icono existe
                   icon.className = `bi bi-sort-${this.sorting.direction === 'asc' ? 'up' : 'down'}`;
                }


                // Actualizar la tabla
                this.filterRecordsBySearch(); // Esto ya llama a sortRecords y displayPaginatedRecords
            });
        });

        // Suscribirse a cambios en el modelo de campos para actualizar los encabezados cuando
        // las casillas de verificación de columnas cambien en el formulario de campos (AdminView)
        document.addEventListener('fieldModelUpdated', (e) => {
            const field = e.detail; // El campo que fue actualizado
            let shouldUpdateUI = false;

            // Comprobar si el campo actualizado afecta a alguna de las columnas seleccionadas
            if (field.id === this.selectedColumns.field1 || field.isColumn3) {
                this.selectedColumns.field1 = field.isColumn3 ? field.id : '';
                shouldUpdateUI = true;
            }
            if (field.id === this.selectedColumns.field2 || field.isColumn4) {
                this.selectedColumns.field2 = field.isColumn4 ? field.id : '';
                shouldUpdateUI = true;
            }
            if (field.id === this.selectedColumns.field3 || field.isColumn5) {
                this.selectedColumns.field3 = field.isColumn5 ? field.id : '';
                shouldUpdateUI = true;
            }

            // Si hubo un cambio relevante, actualizar la UI
            if (shouldUpdateUI) {
                // Actualizar los valores de los <select>
                const column1Select = document.getElementById('column-selector-1');
                const column2Select = document.getElementById('column-selector-2');
                const column3Select = document.getElementById('column-selector-3');

                if (column1Select) column1Select.value = this.selectedColumns.field1;
                if (column2Select) column2Select.value = this.selectedColumns.field2;
                if (column3Select) column3Select.value = this.selectedColumns.field3;

                // Actualizar encabezados y tabla
                this.updateColumnHeaders();
                this.filterRecordsBySearch(); // Vuelve a filtrar, ordenar y mostrar
            }

            // También, si se actualiza el campo del eje horizontal o de comparación, actualizar los selects del reporte
            const horizontalSelect = document.getElementById('report-horizontal-field');
            const compareSelect = document.getElementById('report-field');

            if (horizontalSelect && (field.id === horizontalSelect.value || field.isHorizontalAxis)) {
                 const horizontalAxisField = FieldModel.getAll().find(f => f.isHorizontalAxis);
                 horizontalSelect.value = horizontalAxisField ? horizontalAxisField.id : '';
            }
             if (compareSelect && (field.id === compareSelect.value || field.isCompareField)) {
                 const compareField = FieldModel.getAll().find(f => f.isCompareField);
                 compareSelect.value = compareField ? compareField.id : '';
             }
        });
    },
    applyFilters() {
        const entityFilterSelect = document.getElementById('filter-entity');
        const selectedEntities = Array.from(entityFilterSelect.selectedOptions).map(option => option.value);
        // Obtener nombre personalizado de la entidad
        const config = StorageService.getConfig();
        const entityName = config.entityName || 'Entidad';
        // Si se selecciona "Todas las entidades" o no se selecciona ninguna, no aplicamos filtro de entidad
        const entityFilter = selectedEntities.includes('') || selectedEntities.length === 0
            ? []
            : selectedEntities;

        const fromDateFilter = document.getElementById('filter-from-date').value;
        const toDateFilter = document.getElementById('filter-to-date').value;

        const filters = {
            entityIds: entityFilter.length > 0 ? entityFilter : undefined,
            fromDate: fromDateFilter || undefined,
            toDate: toDateFilter || undefined
        };

        // Obtener registros filtrados
        const filteredRecords = RecordModel.filterMultiple(filters);

        // Actualizar contador (antes de la búsqueda)
        // document.getElementById('records-count').textContent = `${filteredRecords.length} registros`; // Movido a filterRecordsBySearch

        // Guardar los registros filtrados para usarlos en la búsqueda
        this.filteredRecords = filteredRecords;

        // Reiniciar la página actual al aplicar nuevos filtros
        this.pagination.currentPage = 1;

        // Mostrar registros (aplicando también el filtro de búsqueda si existe)
        this.filterRecordsBySearch(); // Llama a sort y display
    },
    filterRecordsBySearch() {
        const searchInput = document.getElementById('search-records');
        const searchText = searchInput ? searchInput.value.toLowerCase().trim() : '';


        // Si no hay texto de búsqueda, usar todos los registros filtrados
        let searchedRecords = this.filteredRecords || []; // Asegurarse de que sea un array

        if (searchText && this.filteredRecords) {
            // Filtrar registros que contengan el texto de búsqueda
            searchedRecords = this.filteredRecords.filter(record => {
                // Obtener la entidad
                const entity = EntityModel.getById(record.entityId) || { name: 'Desconocido' };

                // Verificar si el nombre de la entidad coincide
                if (entity.name.toLowerCase().includes(searchText)) return true;

                // Verificar en la fecha
                const formattedDate = UIUtils.formatDate(record.timestamp).toLowerCase();
                if (formattedDate.includes(searchText)) return true;

                // Verificar en los datos del registro (incluyendo campos de columnas seleccionadas)
                const fields = FieldModel.getAll(); // Obtener todos para buscar por nombre

                // Comprobar valores de las columnas seleccionadas
                const col1Value = this.getFieldValue(record, this.selectedColumns.field1, fields);
                const col2Value = this.getFieldValue(record, this.selectedColumns.field2, fields);
                const col3Value = this.getFieldValue(record, this.selectedColumns.field3, fields);

                if (String(col1Value).toLowerCase().includes(searchText)) return true;
                if (String(col2Value).toLowerCase().includes(searchText)) return true;
                if (String(col3Value).toLowerCase().includes(searchText)) return true;


                // Verificar en todos los datos del registro (por si no están en las columnas)
                for (const fieldId in record.data) {
                    // Evitar comprobar de nuevo si ya está en una columna seleccionada
                    if (fieldId === this.selectedColumns.field1 ||
                        fieldId === this.selectedColumns.field2 ||
                        fieldId === this.selectedColumns.field3) {
                        continue;
                    }

                    const field = fields.find(f => f.id === fieldId) || { name: fieldId };
                    const value = String(record.data[fieldId]).toLowerCase();

                    // Verificar si el nombre del campo o su valor coincide
                    if (field.name.toLowerCase().includes(searchText) || value.includes(searchText)) {
                        return true;
                    }
                }

                return false;
            });
        }

        // Guardar los resultados de la búsqueda/filtrado
        this.searchedRecords = searchedRecords;

        // Actualizar contador con el número de registros después de la búsqueda
        const recordsCountSpan = document.getElementById('records-count');
         if (recordsCountSpan) {
            recordsCountSpan.textContent = `${searchedRecords.length} registros`;
         }


        // Ordenar registros según la columna seleccionada y dirección
        const sortedRecords = this.sortRecords(searchedRecords);

        // Actualizar registros con ordenación aplicada
        this.searchedRecords = sortedRecords; // Guardar los ordenados

        // Mostrar registros paginados
        this.displayPaginatedRecords();
    },
    sortRecords(records) {
        if (!records) return []; // Devolver array vacío si no hay registros

        const { column, direction } = this.sorting;
        const multiplier = direction === 'asc' ? 1 : -1;

        // Obtener todos los campos una vez para optimizar
        const allFields = FieldModel.getAll();

        return [...records].sort((a, b) => {
            let valueA, valueB;

            switch (column) {
                case 'entity':
                    // Ordenar por nombre de entidad
                    const entityA = EntityModel.getById(a.entityId) || { name: '' };
                    const entityB = EntityModel.getById(b.entityId) || { name: '' };
                    valueA = entityA.name.toLowerCase();
                    valueB = entityB.name.toLowerCase();
                    break;

                case 'timestamp':
                    // Ordenar por fecha
                    valueA = new Date(a.timestamp).getTime();
                    valueB = new Date(b.timestamp).getTime();
                    break;

                case 'field1':
                case 'field2':
                case 'field3':
                    // Ordenar por campos personalizados de las columnas
                    const fieldId = this.selectedColumns[column]; // column es 'field1', 'field2', o 'field3'

                    // Obtener valores usando la función auxiliar, pasando allFields
                    valueA = this.getFieldValue(a, fieldId, allFields);
                    valueB = this.getFieldValue(b, fieldId, allFields);

                    // Si no hay campo seleccionado o el valor es vacío/nulo, tratar como string vacío para consistencia
                    valueA = valueA === null || valueA === undefined ? '' : valueA;
                    valueB = valueB === null || valueB === undefined ? '' : valueB;


                    // Intentar comparación numérica si ambos son números válidos
                    const numA = Number(valueA);
                    const numB = Number(valueB);

                    if (!isNaN(numA) && !isNaN(numB) && String(valueA).trim() !== '' && String(valueB).trim() !== '') {
                        valueA = numA;
                        valueB = numB;
                    } else {
                        // Comparación como strings (ignorando mayúsculas/minúsculas)
                        valueA = String(valueA).toLowerCase();
                        valueB = String(valueB).toLowerCase();
                    }
                    break;

                default:
                     // Por defecto, si no hay columna de ordenación, usar fecha descendente
                     valueA = new Date(a.timestamp).getTime();
                     valueB = new Date(b.timestamp).getTime();
                     // No necesitamos multiplier aquí, la comparación directa lo hará descendente
                     // return valueB - valueA; // Directamente descendente
                     // O mantener la lógica del multiplier:
                     if (valueA < valueB) return 1; // b viene antes que a (desc)
                     if (valueA > valueB) return -1; // a viene antes que b (desc)
                     return 0;
            }

            // Comparar valores (aplicando multiplier)
            if (valueA < valueB) return -1 * multiplier;
            if (valueA > valueB) return 1 * multiplier;
            return 0;
        });
    },
    displayPaginatedRecords() {
        const { currentPage, itemsPerPage } = this.pagination;
        const records = this.searchedRecords || []; // Usar los registros buscados/ordenados
        const totalRecords = records.length;
        const totalPages = Math.ceil(totalRecords / itemsPerPage);

        // Validar currentPage
        if (currentPage > totalPages && totalPages > 0) {
            this.pagination.currentPage = totalPages; // Ir a la última página si la actual es inválida
        } else if (currentPage < 1) {
            this.pagination.currentPage = 1; // Asegurar que sea al menos 1
        }


        // Calcular índices de registros a mostrar (usando el currentPage potencialmente corregido)
        const startIndex = (this.pagination.currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, totalRecords);
        const recordsToShow = records.slice(startIndex, endIndex);

        // Mostrar registros paginados
        this.displayFilteredRecords(recordsToShow);

        // Actualizar controles de paginación
        this.updatePaginationControls(totalPages);
    },
    updatePaginationControls(totalPages) {
        const paginationControls = document.getElementById('pagination-controls');
        if (!paginationControls) return;

        const { currentPage } = this.pagination;

        // Limpiar controles existentes
        paginationControls.innerHTML = '';

        // No mostrar paginación si hay una sola página o ninguna
        if (totalPages <= 1) return;

        // --- Lógica de paginación mejorada ---
        const maxPagesToShow = 5; // Máximo de botones numéricos a mostrar
        let startPage, endPage;

        if (totalPages <= maxPagesToShow) {
            // Mostrar todas las páginas si son pocas
            startPage = 1;
            endPage = totalPages;
        } else {
            // Calcular páginas a mostrar alrededor de la actual
            const maxPagesBeforeCurrent = Math.floor(maxPagesToShow / 2);
            const maxPagesAfterCurrent = Math.ceil(maxPagesToShow / 2) - 1;

            if (currentPage <= maxPagesBeforeCurrent) {
                // Cerca del inicio
                startPage = 1;
                endPage = maxPagesToShow;
            } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
                // Cerca del final
                startPage = totalPages - maxPagesToShow + 1;
                endPage = totalPages;
            } else {
                // En el medio
                startPage = currentPage - maxPagesBeforeCurrent;
                endPage = currentPage + maxPagesAfterCurrent;
            }
        }

        // Función auxiliar para crear un item de paginación
        const createPageItem = (page, text = page, isDisabled = false, isActive = false, isEllipsis = false) => {
            const li = document.createElement('li');
            li.className = `page-item ${isDisabled ? 'disabled' : ''} ${isActive ? 'active' : ''}`;
            const a = document.createElement('a');
            a.className = 'page-link';
            a.href = '#';
            a.innerHTML = text;
            if (isEllipsis) {
                 a.setAttribute('aria-disabled', 'true');
            } else if (!isDisabled && !isActive) {
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.goToPage(page);
                });
            }
             if (isActive) {
                 a.setAttribute('aria-current', 'page');
             }
            li.appendChild(a);
            return li;
        };

        // Botón Anterior
        paginationControls.appendChild(createPageItem(currentPage - 1, '<span aria-hidden="true">&laquo;</span>', currentPage === 1));


        // Primera página y elipsis si es necesario
        if (startPage > 1) {
            paginationControls.appendChild(createPageItem(1));
            if (startPage > 2) {
                paginationControls.appendChild(createPageItem(0, '...', true, false, true)); // Ellipsis
            }
        }

        // Páginas numeradas
        for (let i = startPage; i <= endPage; i++) {
            paginationControls.appendChild(createPageItem(i, i, false, i === currentPage));
        }

        // Elipsis y última página si es necesario
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                 paginationControls.appendChild(createPageItem(0, '...', true, false, true)); // Ellipsis
            }
            paginationControls.appendChild(createPageItem(totalPages));
        }

        // Botón Siguiente
        paginationControls.appendChild(createPageItem(currentPage + 1, '<span aria-hidden="true">&raquo;</span>', currentPage === totalPages));

    },
    goToPage(pageNumber) {
        const { itemsPerPage } = this.pagination;
        const totalRecords = (this.searchedRecords || []).length;
        const totalPages = Math.ceil(totalRecords / itemsPerPage);

        // Validar número de página
        if (pageNumber < 1 || pageNumber > totalPages) {
            return; // No hacer nada si la página es inválida
        }

        this.pagination.currentPage = pageNumber;
        this.displayPaginatedRecords();

        // Desplazar al inicio de la tabla (opcional, pero útil)
        const tableElement = document.getElementById('records-table');
        if (tableElement) {
            tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },
    displayFilteredRecords(records) {
        const recordsList = document.getElementById('records-list');
        const noFilteredRecordsDiv = document.getElementById('no-filtered-records');
        const recordsTable = document.getElementById('records-table');
        const paginationControls = document.getElementById('pagination-controls').closest('.d-flex'); // Contenedor de paginación
        const itemsPerPageSelector = document.getElementById('items-per-page').closest('.d-flex'); // Contenedor de items por página

        if (!recordsList || !noFilteredRecordsDiv || !recordsTable || !paginationControls || !itemsPerPageSelector) {
            console.error("Elementos de la tabla o paginación no encontrados en el DOM.");
            return;
        }


        // Mostrar/ocultar elementos según si hay registros
        const hasRecords = records.length > 0;
        noFilteredRecordsDiv.style.display = hasRecords ? 'none' : 'block';
        recordsTable.style.display = hasRecords ? 'table' : 'none';
        // Ocultar paginación si no hay registros
        paginationControls.style.visibility = hasRecords ? 'visible' : 'hidden';
        itemsPerPageSelector.style.visibility = hasRecords ? 'visible' : 'hidden';


        // Limpiar lista
        recordsList.innerHTML = '';

        // Si no hay registros, salir
        if (!hasRecords) return;

        // Obtener todos los campos una vez para optimizar
        const allFields = FieldModel.getAll();

        // Renderizar cada registro
        records.forEach(record => {
            const entity = EntityModel.getById(record.entityId) || { name: 'Desconocido' };

            // Obtener los valores de las columnas personalizadas usando la función auxiliar
            const fieldColumns = {
                field1: this.getFieldValue(record, this.selectedColumns.field1, allFields),
                field2: this.getFieldValue(record, this.selectedColumns.field2, allFields),
                field3: this.getFieldValue(record, this.selectedColumns.field3, allFields)
            };

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entity.name}</td>
                <td>${UIUtils.formatDate(record.timestamp)}</td>
                <td>${fieldColumns.field1}</td>
                <td>${fieldColumns.field2}</td>
                <td>${fieldColumns.field3}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-record" data-record-id="${record.id}" title="Ver Detalles">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            `;

            recordsList.appendChild(row);
        });

        // Configurar event listeners para ver detalles (re-asignar después de renderizar)
        recordsList.querySelectorAll('.view-record').forEach(button => {
            // Remover listener previo si existe (buena práctica)
            button.replaceWith(button.cloneNode(true));
            // Añadir nuevo listener
            recordsList.querySelector(`[data-record-id="${button.dataset.recordId}"]`).addEventListener('click', (e) => {
                 // Usar currentTarget para asegurar que obtenemos el botón, incluso si se hace clic en el icono
                 const recordId = e.currentTarget.getAttribute('data-record-id');
                 this.showRecordDetails(recordId);
            });
        });
    },
    getFieldValue(record, fieldId, fields) {
        // Si no hay fieldId, o no hay datos, o el campo específico no existe en los datos, devolver vacío
        if (!fieldId || !record.data || record.data[fieldId] === undefined || record.data[fieldId] === null) {
            return ''; // Devolver string vacío para consistencia
        }

        // No necesitamos buscar el 'field' aquí si solo queremos el valor.
        // La formateo específico (si es necesario) se puede hacer en otro lugar o añadir aquí si se requiere.
        // Por ejemplo, si quisiéramos formatear números o fechas de forma especial.

        // Devolver el valor directamente
        return record.data[fieldId];
    },
    showRecordDetails(recordId) {
        const record = RecordModel.getById(recordId);
        if (!record) return;

        const entity = EntityModel.getById(record.entityId) || { name: 'Desconocido' };
        const fields = FieldModel.getByIds(Object.keys(record.data)); // Campos usados en este registro
        const allFields = FieldModel.getAll(); // Todos los campos para el selector de tipo
        // Obtener nombre personalizado de la entidad
        const config = StorageService.getConfig();
        const entityName = config.entityName || 'Entidad';

        // Usar UIUtils para obtener o crear el modal
        const modalElement = document.getElementById('viewRecordModal');
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement); // Usar getOrCreateInstance

        const recordDetails = document.getElementById('record-details');
        const modalTitle = modalElement.querySelector('.modal-title');
        modalTitle.textContent = `Detalles del Registro - ${entity.name}`; // Título más específico

        // Preparar contenido del modal
        const detailsHTML = `
            <div class="mb-3 row">
                <strong class="col-sm-3 col-form-label">${entityName}:</strong>
                <div class="col-sm-9">
                    <input type="text" readonly class="form-control-plaintext" value="${entity.name}">
                </div>
            </div>
            <div class="mb-3 row">
                <strong class="col-sm-3 col-form-label">Fecha y Hora:</strong>
                <div class="col-sm-9">
                     <span id="record-timestamp-display">${UIUtils.formatDate(record.timestamp)}</span>
                     <div id="record-timestamp-edit" style="display: none;">
                         <input type="datetime-local" id="new-timestamp" class="form-control form-control-sm" value="${new Date(record.timestamp).toISOString().slice(0, 16)}">
                     </div>
                </div>
            </div>
            <hr>
            <h6>Datos Registrados:</h6>
            <div id="record-fields-container">
                <table class="table table-sm table-bordered mt-2">
                    <thead class="table-light">
                        <tr>
                            <th>Campo</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(record.data).sort(([fieldIdA], [fieldIdB]) => {
                            // Ordenar campos alfabéticamente por nombre
                            const fieldA = fields.find(f => f.id === fieldIdA) || { name: fieldIdA };
                            const fieldB = fields.find(f => f.id === fieldIdB) || { name: fieldIdB };
                            return fieldA.name.localeCompare(fieldB.name);
                        }).map(([fieldId, value]) => {
                            const field = fields.find(f => f.id === fieldId) || { name: fieldId, type: 'text' }; // Default a text si no se encuentra
                            return `
                                <tr data-field-id="${fieldId}" data-field-type="${field.type || 'text'}">
                                    <td>${field.name}</td>
                                    <td class="field-value-display">${value}</td>
                                    <td class="field-value-edit" style="display: none;">
                                        <!-- Input se generará dinámicamente al editar -->
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;

        recordDetails.innerHTML = detailsHTML;

        // Configurar botones del footer
        this.setupModalFooter(recordId, modal, record);


        modal.show();
    },
    /**
     * Configura los botones y listeners del footer del modal de detalles/edición.
     */
    setupModalFooter(recordId, modalInstance, record) {
        const footerDiv = document.querySelector('#viewRecordModal .modal-footer');
        footerDiv.innerHTML = ''; // Limpiar footer

        // Botón Eliminar
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn btn-danger me-auto';
        deleteBtn.id = 'deleteRecordBtn';
        deleteBtn.innerHTML = '<i class="bi bi-trash"></i> Eliminar';
        deleteBtn.addEventListener('click', () => this.confirmDeleteRecord(recordId, modalInstance));
        footerDiv.appendChild(deleteBtn);

        // Botón Editar/Guardar
        const editSaveBtn = document.createElement('button');
        editSaveBtn.type = 'button';
        editSaveBtn.className = 'btn btn-warning';
        editSaveBtn.id = 'editRecordBtn';
        editSaveBtn.innerHTML = '<i class="bi bi-pencil"></i> Editar';
        editSaveBtn.addEventListener('click', () => this.toggleEditMode(recordId, modalInstance, record));
        footerDiv.appendChild(editSaveBtn);

        // Botón Cerrar
        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'btn btn-secondary';
        closeBtn.setAttribute('data-bs-dismiss', 'modal');
        closeBtn.textContent = 'Cerrar';
        footerDiv.appendChild(closeBtn);

         // Listener para resetear el modo al cerrar el modal
         modalInstance._element.addEventListener('hidden.bs.modal', () => {
             this.resetEditMode(modalInstance);
         }, { once: true }); // Ejecutar solo una vez por cierre
    },

    /**
     * Cambia entre el modo de visualización y edición en el modal.
     */
    toggleEditMode(recordId, modalInstance, record) {
        const editSaveBtn = document.getElementById('editRecordBtn');
        const isEditing = editSaveBtn.classList.contains('btn-success'); // Si ya está en modo guardar

        if (isEditing) {
            // Guardar Cambios
            this.saveRecordChanges(recordId, modalInstance);
        } else {
            // Entrar en Modo Edición
            editSaveBtn.classList.remove('btn-warning');
            editSaveBtn.classList.add('btn-success');
            editSaveBtn.innerHTML = '<i class="bi bi-save"></i> Guardar';

            // Añadir botón Cancelar
            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.className = 'btn btn-outline-secondary';
            cancelBtn.id = 'cancelEditBtn';
            cancelBtn.textContent = 'Cancelar';
            cancelBtn.addEventListener('click', () => this.resetEditMode(modalInstance, recordId));
            // Insertar antes del botón de cerrar
            const closeBtn = footerDiv.querySelector('[data-bs-dismiss="modal"]');
            footerDiv.insertBefore(cancelBtn, closeBtn);


            // Ocultar display, mostrar edit
            document.getElementById('record-timestamp-display').style.display = 'none';
            document.getElementById('record-timestamp-edit').style.display = 'block';

            const allFields = FieldModel.getAll(); // Necesario para las opciones de select

            modalInstance._element.querySelectorAll('#record-fields-container tbody tr').forEach(row => {
                const displayCell = row.querySelector('.field-value-display');
                const editCell = row.querySelector('.field-value-edit');
                const fieldId = row.dataset.fieldId;
                const fieldType = row.dataset.fieldType;
                const currentValue = record.data[fieldId];
                const fieldDefinition = allFields.find(f => f.id === fieldId);

                displayCell.style.display = 'none';
                editCell.style.display = 'table-cell'; // Mostrar celda de edición

                // Crear input adecuado
                let inputHTML = '';
                switch (fieldType) {
                    case 'number':
                        inputHTML = `<input type="number" class="form-control form-control-sm edit-field" data-field-id="${fieldId}" value="${currentValue}">`;
                        break;
                    case 'select':
                        if (fieldDefinition && fieldDefinition.options && fieldDefinition.options.length > 0) {
                            inputHTML = `
                                <select class="form-select form-select-sm edit-field" data-field-id="${fieldId}">
                                    ${fieldDefinition.options.map(option =>
                                        `<option value="${option}" ${currentValue === option ? 'selected' : ''}>${option}</option>`
                                    ).join('')}
                                </select>`;
                        } else {
                            // Fallback a texto si no hay opciones
                            inputHTML = `<input type="text" class="form-control form-control-sm edit-field" data-field-id="${fieldId}" value="${currentValue}">`;
                        }
                        break;
                    case 'text':
                    default:
                        inputHTML = `<input type="text" class="form-control form-control-sm edit-field" data-field-id="${fieldId}" value="${currentValue}">`;
                }
                editCell.innerHTML = inputHTML;
            });
        }
    },

    /**
     * Restaura el modal al modo de visualización.
     */
    resetEditMode(modalInstance, recordId = null) {
        const editSaveBtn = document.getElementById('editRecordBtn');
        if (editSaveBtn) {
            editSaveBtn.classList.remove('btn-success');
            editSaveBtn.classList.add('btn-warning');
            editSaveBtn.innerHTML = '<i class="bi bi-pencil"></i> Editar';
        }

        const cancelBtn = document.getElementById('cancelEditBtn');
        if (cancelBtn) {
            cancelBtn.remove();
        }

        // Si se proporcionó un recordId, significa que se canceló la edición,
        // así que recargamos los detalles originales.
        if (recordId) {
             this.showRecordDetails(recordId); // Recarga los datos originales
        } else {
             // Si no hay recordId, simplemente revertimos los elementos visuales (al cerrar modal)
             const timestampDisplay = document.getElementById('record-timestamp-display');
             const timestampEdit = document.getElementById('record-timestamp-edit');
             if(timestampDisplay) timestampDisplay.style.display = 'inline';
             if(timestampEdit) timestampEdit.style.display = 'none';


             modalInstance._element.querySelectorAll('#record-fields-container tbody tr').forEach(row => {
                 const displayCell = row.querySelector('.field-value-display');
                 const editCell = row.querySelector('.field-value-edit');
                 if(displayCell) displayCell.style.display = 'table-cell';
                 if(editCell) {
                    editCell.style.display = 'none';
                    editCell.innerHTML = ''; // Limpiar input
                 }
             });
        }
    },

    /**
     * Muestra confirmación antes de eliminar un registro.
     */
    confirmDeleteRecord(recordId, viewModalInstance) {
        const confirmModalElement = document.getElementById('confirmModal');
        const confirmModal = bootstrap.Modal.getOrCreateInstance(confirmModalElement);
        document.getElementById('confirm-message').textContent =
            '¿Está seguro de que desea eliminar este registro? Esta acción no se puede deshacer.';

        const confirmBtn = document.getElementById('confirmActionBtn');
        // Clonar y reemplazar para evitar listeners duplicados
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

        newConfirmBtn.onclick = () => { // Usar onclick para simplicidad aquí
            const deleted = RecordModel.delete(recordId);
            confirmModal.hide();
            viewModalInstance.hide(); // Ocultar modal de detalles también

            if (deleted) {
                this.applyFilters(); // Actualizar lista de registros
                // Mostrar alerta en el contenedor principal de reportes
                UIUtils.showAlert('Registro eliminado correctamente', 'success', document.querySelector('.container.mt-4'));
            } else {
                 UIUtils.showAlert('Error al eliminar el registro', 'danger', document.querySelector('.container.mt-4'));
            }
        };

        confirmModal.show();
    },
    saveRecordChanges(recordId, modal) {
        const record = RecordModel.getById(recordId);
        if (!record) return;

        // Obtener todos los datos editados
        const fieldsData = {};
        let validationError = false;
        document.querySelectorAll('.edit-field').forEach(input => {
            const fieldId = input.getAttribute('data-field-id');
            const value = input.value;
            // Validación básica (se podría expandir)
            if (input.required && !value.trim()) {
                 input.classList.add('is-invalid');
                 validationError = true;
            } else {
                 input.classList.remove('is-invalid');
            }
            fieldsData[fieldId] = value;
        });

        // Obtener la nueva fecha
        const newTimestampInput = document.getElementById('new-timestamp');
        const newTimestamp = newTimestampInput.value;
        if (!newTimestamp) {
            newTimestampInput.classList.add('is-invalid');
            validationError = true;
        } else {
            newTimestampInput.classList.remove('is-invalid');
        }

        if (validationError) {
            UIUtils.showAlert('Por favor, corrija los campos marcados.', 'warning', document.getElementById('record-details'));
            return;
        }

        // Convertir a formato ISO
        const newDate = new Date(newTimestamp).toISOString();

        // Actualizar el registro
        const success = RecordModel.update(recordId, fieldsData, newDate);

        if (success) {
            // Salir del modo edición y mostrar los datos actualizados
            this.resetEditMode(modal, recordId); // Pasa recordId para recargar

            // Actualizar la lista de registros en segundo plano
            this.applyFilters();

            // Mostrar mensaje de éxito dentro del modal
            UIUtils.showAlert('Registro actualizado correctamente', 'success', document.getElementById('record-details'));
        } else {
            UIUtils.showAlert('Error al actualizar el registro', 'danger', document.getElementById('record-details'));
        }
    },
    removeModalBackdrop() {
        // Esta función puede volverse compleja y propensa a errores al interactuar
        // directamente con el manejo de modales de Bootstrap.
        // Generalmente, es mejor dejar que Bootstrap maneje sus backdrops.
        // Si hay problemas persistentes, considera investigar por qué Bootstrap no los limpia.
        // Forzar la eliminación puede tener efectos secundarios inesperados.

        // Intento simple de cerrar todos los modales abiertos por Bootstrap:
        const openModals = document.querySelectorAll('.modal.show');
        openModals.forEach(modalEl => {
            const instance = bootstrap.Modal.getInstance(modalEl);
            if (instance) {
                instance.hide();
            }
        });

        // Bootstrap debería eliminar los backdrops al llamar a hide().
        // Si aún quedan, podría ser un bug o una interacción inesperada.
        // Como último recurso (no recomendado):
        // setTimeout(() => {
        //     document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
        //     document.body.classList.remove('modal-open');
        //     document.body.style.overflow = '';
        //     document.body.style.paddingRight = '';
        // }, 500); // Esperar a que terminen las transiciones de Bootstrap
        console.warn("removeModalBackdrop: Se recomienda dejar que Bootstrap maneje los backdrops.");
    },
    generateReport() {
        const fieldId = document.getElementById('report-field').value;
        const horizontalFieldId = document.getElementById('report-horizontal-field').value;
        const aggregation = document.getElementById('report-aggregation').value;
        const reportForm = document.getElementById('report-form'); // Para mostrar alertas cerca

        if (!fieldId) {
            UIUtils.showAlert('Seleccione un campo para generar el reporte', 'warning', reportForm);
            return;
        }

        // Obtener filtros actuales
        const entityFilterSelect = document.getElementById('filter-entity');
        const selectedEntities = Array.from(entityFilterSelect.selectedOptions).map(option => option.value);

        // Si se selecciona "Todas las entidades" o no se selecciona ninguna, no aplicamos filtro de entidad
        const entityFilter = selectedEntities.includes('') || selectedEntities.length === 0
            ? []
            : selectedEntities;

        const fromDateFilter = document.getElementById('filter-from-date').value;
        const toDateFilter = document.getElementById('filter-to-date').value;

        const filters = {
            entityIds: entityFilter.length > 0 ? entityFilter : undefined,
            fromDate: fromDateFilter || undefined,
            toDate: toDateFilter || undefined
        };

        // Generar datos del reporte
        const reportData = RecordModel.generateReportMultiple(fieldId, aggregation, filters, horizontalFieldId);

        if (reportData.error) {
            UIUtils.showAlert(reportData.error, 'danger', reportForm);
             // Ocultar contenedor del reporte si hubo error
             const reportContainer = document.getElementById('report-container');
             if (reportContainer) reportContainer.style.display = 'none';
            return;
        }

        // Mostrar contenedor del reporte
        const reportContainer = document.getElementById('report-container');
        if (!reportContainer) return; // Salir si no existe el contenedor
        reportContainer.style.display = 'block';

        // Crear gráfico (asegurándose de que ChartUtils y el canvas existen)
        const chartCanvas = document.getElementById('report-chart');
        if (ChartUtils && chartCanvas) {
             ChartUtils.createBarChart('report-chart', reportData);
        } else {
            console.error("ChartUtils o el canvas 'report-chart' no están disponibles.");
        }


        // Crear tabla resumen
        const reportSummaryDiv = document.getElementById('report-summary');
        if (reportSummaryDiv && ChartUtils) {
            reportSummaryDiv.innerHTML = `
                <h6 class="mb-3">Resumen del Reporte</h6>
                ${ChartUtils.createSummaryTable(reportData)}
            `;
        } else {
             console.error("El div 'report-summary' o ChartUtils no están disponibles.");
        }

        // Desplazar a la vista del reporte (opcional)
        reportContainer.scrollIntoView({ behavior: 'smooth' });
    },
    setDateRange(range) {
        const fromDateInput = document.getElementById('filter-from-date');
        const toDateInput = document.getElementById('filter-to-date');

        if (!fromDateInput || !toDateInput) return; // Salir si los inputs no existen

        // Fecha actual (medianoche)
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let fromDate, toDate;

        // Calcular rango según selección
        switch (range) {
            case 'yesterday':
                fromDate = new Date(today);
                fromDate.setDate(today.getDate() - 1);
                toDate = new Date(fromDate); // Ayer fue solo un día
                break;

            case 'thisWeek':
                fromDate = new Date(today);
                const firstDayOfWeek = 1; // 1 para Lunes, 0 para Domingo
                const dayOfWeek = today.getDay(); // 0=Domingo, 1=Lunes, ...
                // Calcular cuántos días retroceder para llegar al primer día de la semana
                const diff = (dayOfWeek >= firstDayOfWeek) ? (dayOfWeek - firstDayOfWeek) : (6); // Si hoy es Domingo (0) y la semana empieza Lunes (1), retroceder 6 días
                fromDate.setDate(today.getDate() - diff);
                toDate = new Date(today); // Hasta hoy
                break;

            case 'lastWeek':
                 fromDate = new Date(today);
                 const firstDayOfLastWeek = 1; // Lunes
                 const currentDayOfWeek = today.getDay();
                 // Retroceder hasta el lunes de la semana pasada
                 // Días a retroceder = día actual + (7 - primer día de semana)
                 const daysToLastMonday = currentDayOfWeek + (7 - firstDayOfLastWeek);
                 fromDate.setDate(today.getDate() - daysToLastMonday);
                 toDate = new Date(fromDate);
                 toDate.setDate(fromDate.getDate() + 6); // La semana pasada termina el domingo
                break;

            case 'thisMonth':
                fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
                toDate = new Date(today); // Hasta hoy
                break;

            case 'lastMonth':
                fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1); // Primer día del mes anterior
                toDate = new Date(today.getFullYear(), today.getMonth(), 0); // Último día del mes anterior (día 0 del mes actual)
                break;

            case 'lastMonday':
            case 'lastTuesday':
            case 'lastWednesday':
            case 'lastThursday':
            case 'lastFriday':
            case 'lastSaturday':
            case 'lastSunday':
                fromDate = new Date(today);
                const dayMap = { // 0=Domingo, 1=Lunes,...
                    'lastSunday': 0, 'lastMonday': 1, 'lastTuesday': 2, 'lastWednesday': 3,
                    'lastThursday': 4, 'lastFriday': 5, 'lastSaturday': 6
                };
                const targetDay = dayMap[range];
                const currentDay = today.getDay();
                let daysToSubtract = currentDay - targetDay;
                // Si el día objetivo ya pasó esta semana (o es hoy), ir a la semana anterior (sumar 7)
                if (daysToSubtract <= 0) {
                    daysToSubtract += 7;
                }
                fromDate.setDate(today.getDate() - daysToSubtract);
                toDate = new Date(fromDate); // Solo ese día
                break;

            default:
                console.warn(`Rango de fecha desconocido: ${range}`);
                return; // No hacer nada si no coincide
        }

        // Formatear fechas para los inputs (YYYY-MM-DD)
        fromDateInput.value = this.formatDateForInput(fromDate);
        toDateInput.value = this.formatDateForInput(toDate);
    },
    formatDateForInput(date) {
        if (!(date instanceof Date) || isNaN(date)) {
            return ''; // Devolver vacío si no es una fecha válida
        }
        // Intl.DateTimeFormat es más robusto para formateo, pero toISOString es simple para YYYY-MM-DD
        // return date.toISOString().split('T')[0];
        // O usando padStart para asegurar dos dígitos:
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
};
