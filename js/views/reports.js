/**
 * Vista de reportes para visualizar datos
 */
const ReportsView = {
    /**
     * Propiedades para paginación
     */
    pagination: {
        currentPage: 1,
        itemsPerPage: 20,
    },

    /**
     * Propiedades para ordenación de columnas
     */
    sorting: {
        column: 'timestamp', // Columna por defecto para ordenar (fecha)
        direction: 'desc'    // Dirección por defecto (descendente)
    },

    /**
     * Columnas seleccionadas por el usuario para mostrar
     */
    selectedColumns: {
        field1: '',
        field2: '',
        field3: ''
    },

    /**
     * Inicializa la vista de reportes
     */
    init() {
        this.render();
        this.setupEventListeners();
        
        // Generar automáticamente el reporte al cargar la página
        this.autoGenerateReport();
    },

    /**
     * Genera automáticamente un informe al cargar la página si hay datos disponibles
     */
    autoGenerateReport() {
        // Verificar si hay campos disponibles para generar un reporte
        const sharedNumericFields = FieldModel.getSharedNumericFields();
        if (sharedNumericFields.length === 0) {
            return; // No hay campos para generar reporte
        }

        // Esperar a que el DOM esté completamente cargado (por si acaso)
        setTimeout(() => {
            // Obtener campos marcados para reportes comparativos
            const compareField = FieldModel.getAll().find(field => field.isCompareField);
            
            if (compareField) {
                // Si hay un campo marcado para comparar, usarlo
                document.getElementById('report-field').value = compareField.id;
            } else {
                // Si no hay campo marcado, usar el primer campo numérico disponible
                document.getElementById('report-field').value = sharedNumericFields[0].id;
            }
            
            // Generar el reporte usando los valores predeterminados o los que están en el formulario
            this.generateReport();
        }, 100);
    },

    /**
     * Renderiza el contenido de la vista
     */
    render() {
        const mainContent = document.getElementById('main-content');
        const entities = EntityModel.getAll();
        const sharedNumericFields = FieldModel.getSharedNumericFields();
        const sharedFields = FieldModel.getAll(); // Todos los campos para el eje horizontal
    
        // Formatear fecha actual para los inputs de fecha
        const today = new Date().toISOString().split('T')[0];
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const lastMonthStr = lastMonth.toISOString().split('T')[0];
        // Obtener nombre personalizado de la entidad
        const config = StorageService.getConfig();
        const entityName = config.entityName || 'Entidad';
    
        // Obtener campos marcados para columnas
        const column3Field = FieldModel.getAll().find(field => field.isColumn3);
        const column4Field = FieldModel.getAll().find(field => field.isColumn4);
        const column5Field = FieldModel.getAll().find(field => field.isColumn5);
    
        // Actualiza SelectedColumns al cargar si hay campos marcados
        if (column3Field) this.selectedColumns.field1 = column3Field.id;
        if (column4Field) this.selectedColumns.field2 = column4Field.id;
        if (column5Field) this.selectedColumns.field3 = column5Field.id;
    
        // Obtener campos marcados para reportes comparativos
        const horizontalAxisField = FieldModel.getAll().find(field => field.isHorizontalAxis);
        const compareField = FieldModel.getAll().find(field => field.isCompareField);
    
        const template = `
            <div class="container mt-4">
        <h2>Reportes y Análisis</h2>
    
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
                    <div class="p-3 bg-light border-bottom">
                    <div class="input-group">
                        <span class="input-group-text">
                            <i class="bi bi-search"></i>
                        </span>
                        <input type="text" id="search-records" class="form-control" placeholder="Buscar en registros...">
                    </div>
                </div>
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
                <div class="table-responsive">
                    <table class="table table-hover mb-0" id="records-table">
                        <thead class="table-light">
                            <tr>
                                <th class="sortable" data-sort="entity">${entityName} <i class="bi"></i></th>
                                <th class="sortable" data-sort="timestamp">Fecha y Hora <i class="bi"></i></th>
                                <th class="sortable column-1" data-sort="field1">Columna 3 <i class="bi"></i></th>
                                <th class="sortable column-2" data-sort="field2">Columna 4 <i class="bi"></i></th>
                                <th class="sortable column-3" data-sort="field3">Columna 5 <i class="bi"></i></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody id="records-list">
                            </tbody>
                    </table>
                </div>
                <div id="no-filtered-records" class="text-center py-4">
                    <p class="text-muted">No hay registros que coincidan con los filtros.</p>
                </div>
    
                <div class="d-flex justify-content-between align-items-center mt-3 p-2 bg-light">
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
                                </ul>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    
    
    </div>
        `;
    
        mainContent.innerHTML = template;
    
        // Cargar datos iniciales con los filtros predeterminados
        this.applyFilters();
    },

    /**
     * Establece los event listeners para la vista
     */
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

                // Obtener registros filtrados
                const filteredRecords = RecordModel.filterMultiple(filters);

                // Ordenar por fecha (más reciente primero)
                const sortedRecords = [...filteredRecords].sort((a, b) =>
                    new Date(b.timestamp) - new Date(a.timestamp)
                );

                // Exportar a CSV
                ExportUtils.exportToCSV(sortedRecords);
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
                const fieldNumber = index + 1;
                const prevValue = this.selectedColumns[`field${fieldNumber}`];
                const newValue = select.value;
                
                // Si es una columna distinta, actualizar el modelo
                if (prevValue !== newValue) {
                    this.selectedColumns[`field${fieldNumber}`] = newValue;
                    
                    // Actualizar campos en modelo si el valor es válido
                    if (newValue) {
                        const fields = FieldModel.getAll();
                        
                        // Desmarcar cualquier campo que esté usando esta columna
                        fields.forEach(field => {
                            if (fieldNumber === 1 && field.isColumn3) {
                                field.isColumn3 = field.id === newValue;
                                FieldModel.update(field.id, field);
                            } else if (fieldNumber === 2 && field.isColumn4) {
                                field.isColumn4 = field.id === newValue;
                                FieldModel.update(field.id, field);
                            } else if (fieldNumber === 3 && field.isColumn5) {
                                field.isColumn5 = field.id === newValue;
                                FieldModel.update(field.id, field);
                            }
                        });
                        
                        // Marcar el nuevo campo
                        const selectedField = fields.find(f => f.id === newValue);
                        if (selectedField) {
                            if (fieldNumber === 1) selectedField.isColumn3 = true;
                            else if (fieldNumber === 2) selectedField.isColumn4 = true;
                            else if (fieldNumber === 3) selectedField.isColumn5 = true;
                            
                            selectedField.useForRecordsTable = true;
                            FieldModel.update(selectedField.id, selectedField);
                        }
                    }
                    
                    // Actualizar el encabezado de columna con el nombre del campo seleccionado
                    const columnHeader = document.querySelector(`.column-${fieldNumber}`);
                    if (columnHeader) {
                        // Obtener el nombre del campo seleccionado
                        const fieldId = select.value;
                        if (fieldId) {
                            const field = FieldModel.getById(fieldId);
                            if (field) {
                                columnHeader.innerHTML = `${field.name} <i class="bi"></i>`;
                            }
                        } else {
                            columnHeader.innerHTML = `Campo ${fieldNumber + 2} <i class="bi"></i>`;
                        }
                    }
                    
                    // Actualizar la tabla
                    this.filterRecordsBySearch();
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
                icon.className = `bi bi-sort-${this.sorting.direction === 'asc' ? 'up' : 'down'}`;

                // Actualizar la tabla
                this.filterRecordsBySearch();
            });
        });
    },

    /**
     * Aplica los filtros y muestra los registros filtrados
     */
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

        // Actualizar contador
        document.getElementById('records-count').textContent = `${filteredRecords.length} registros`;

        // Guardar los registros filtrados para usarlos en la búsqueda
        this.filteredRecords = filteredRecords;

        // Reiniciar la página actual al aplicar nuevos filtros
        this.pagination.currentPage = 1;

        // Mostrar registros (aplicando también el filtro de búsqueda si existe)
        this.filterRecordsBySearch();
    },

    /**
     * Filtra los registros según el texto de búsqueda ingresado
     */
    filterRecordsBySearch() {
        const searchText = document.getElementById('search-records').value.toLowerCase().trim();

        // Si no hay texto de búsqueda, mostrar todos los registros filtrados
        let searchedRecords = this.filteredRecords;

        if (searchText) {
            // Filtrar registros que contengan el texto de búsqueda
            searchedRecords = this.filteredRecords.filter(record => {
                // Obtener la entidad
                const entity = EntityModel.getById(record.entityId) || { name: 'Desconocido' };

                // Verificar si el nombre de la entidad coincide
                if (entity.name.toLowerCase().includes(searchText)) return true;

                // Verificar en la fecha
                const formattedDate = UIUtils.formatDate(record.timestamp).toLowerCase();
                if (formattedDate.includes(searchText)) return true;

                // Verificar en los datos del registro
                const fields = FieldModel.getByIds(Object.keys(record.data));

                for (const fieldId in record.data) {
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

        // Guardar los resultados de la búsqueda
        this.searchedRecords = searchedRecords;

        // Actualizar contador
        document.getElementById('records-count').textContent = `${searchedRecords.length} registros`;

        // Ordenar registros según la columna seleccionada y dirección
        const sortedRecords = this.sortRecords(searchedRecords);

        // Actualizar registros con ordenación aplicada
        this.searchedRecords = sortedRecords;

        // Mostrar registros paginados
        this.displayPaginatedRecords();
    },

    /**
     * Ordena los registros según la configuración actual de ordenación
     * @param {Array} records Registros a ordenar
     * @returns {Array} Registros ordenados
     */
    sortRecords(records) {
        const { column, direction } = this.sorting;
        const multiplier = direction === 'asc' ? 1 : -1;

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
                    // Ordenar por campos personalizados
                    const fieldNumber = column.charAt(5); // Extraer el número del campo (1, 2 o 3)
                    const fieldId = this.selectedColumns[column];

                    // Si no hay un campo seleccionado, usar la fecha como fallback
                    if (!fieldId) {
                        valueA = new Date(a.timestamp).getTime();
                        valueB = new Date(b.timestamp).getTime();
                    } else {
                        // Comparar valores del campo seleccionado
                        valueA = a.data && a.data[fieldId] !== undefined ? a.data[fieldId] : '';
                        valueB = b.data && b.data[fieldId] !== undefined ? b.data[fieldId] : '';

                        // Si son números, convertirlos para una comparación numérica
                        if (!isNaN(valueA) && !isNaN(valueB)) {
                            valueA = Number(valueA);
                            valueB = Number(valueB);
                        } else {
                            // Si no son números, convertir a string para comparación
                            valueA = String(valueA).toLowerCase();
                            valueB = String(valueB).toLowerCase();
                        }
                    }
                    break;

                default:
                    // Por defecto, ordenar por fecha (más reciente primero)
                    valueA = new Date(a.timestamp).getTime();
                    valueB = new Date(b.timestamp).getTime();
                    multiplier = -1; // Invertir para que el más reciente esté primero por defecto
            }

            // Comparar valores
            if (valueA < valueB) return -1 * multiplier;
            if (valueA > valueB) return 1 * multiplier;
            return 0;
        });
    },

    /**
     * Muestra los registros con paginación
     */
    displayPaginatedRecords() {
        const { currentPage, itemsPerPage } = this.pagination;
        const records = this.searchedRecords || [];
        const totalRecords = records.length;
        const totalPages = Math.ceil(totalRecords / itemsPerPage);

        // Calcular índices de registros a mostrar
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, totalRecords);
        const recordsToShow = records.slice(startIndex, endIndex);

        // Mostrar registros paginados
        this.displayFilteredRecords(recordsToShow);

        // Actualizar controles de paginación
        this.updatePaginationControls(totalPages);
    },

    /**
     * Actualiza los controles de paginación
     * @param {number} totalPages Total de páginas
     */
    updatePaginationControls(totalPages) {
        const paginationControls = document.getElementById('pagination-controls');
        if (!paginationControls) return;

        const { currentPage } = this.pagination;

        // Limpiar controles existentes
        paginationControls.innerHTML = '';

        // No mostrar paginación si hay una sola página o ninguna
        if (totalPages <= 1) return;

        // Botón Anterior
        const prevButton = document.createElement('li');
        prevButton.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevButton.innerHTML = `<a class="page-link" href="#" aria-label="Anterior"><span aria-hidden="true">&laquo;</span></a>`;

        if (currentPage > 1) {
            prevButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToPage(currentPage - 1);
            });
        }

        paginationControls.appendChild(prevButton);

        // Determinar qué números de página mostrar
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);

        // Ajustar si estamos al final para mostrar 5 páginas cuando sea posible
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        // Primera página y elipsis si es necesario
        if (startPage > 1) {
            const firstPageItem = document.createElement('li');
            firstPageItem.className = 'page-item';
            firstPageItem.innerHTML = `<a class="page-link" href="#">1</a>`;
            firstPageItem.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToPage(1);
            });
            paginationControls.appendChild(firstPageItem);

            if (startPage > 2) {
                const ellipsisItem = document.createElement('li');
                ellipsisItem.className = 'page-item disabled';
                ellipsisItem.innerHTML = `<a class="page-link" href="#">...</a>`;
                paginationControls.appendChild(ellipsisItem);
            }
        }

        // Páginas numeradas
        for (let i = startPage; i <= endPage; i++) {
            const pageItem = document.createElement('li');
            pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
            pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;

            if (i !== currentPage) {
                pageItem.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.goToPage(i);
                });
            }

            paginationControls.appendChild(pageItem);
        }

        // Elipsis y última página si es necesario
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsisItem = document.createElement('li');
                ellipsisItem.className = 'page-item disabled';
                ellipsisItem.innerHTML = `<a class="page-link" href="#">...</a>`;
                paginationControls.appendChild(ellipsisItem);
            }

            const lastPageItem = document.createElement('li');
            lastPageItem.className = 'page-item';
            lastPageItem.innerHTML = `<a class="page-link" href="#">${totalPages}</a>`;
            lastPageItem.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToPage(totalPages);
            });
            paginationControls.appendChild(lastPageItem);
        }

        // Botón Siguiente
        const nextButton = document.createElement('li');
        nextButton.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
        nextButton.innerHTML = `<a class="page-link" href="#" aria-label="Siguiente"><span aria-hidden="true">&raquo;</span></a>`;

        if (currentPage < totalPages) {
            nextButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToPage(currentPage + 1);
            });
        }

        paginationControls.appendChild(nextButton);
    },

    /**
     * Navega a una página específica
     * @param {number} pageNumber Número de página
     */
    goToPage(pageNumber) {
        this.pagination.currentPage = pageNumber;
        this.displayPaginatedRecords();

        // Desplazar al inicio de la tabla
        document.getElementById('records-table').scrollIntoView({ behavior: 'smooth' });
    },

    /**
     * Muestra los registros filtrados en la tabla
     * @param {Array} records Registros a mostrar
     */
    displayFilteredRecords(records) {
        const recordsList = document.getElementById('records-list');
        const noFilteredRecords = document.getElementById('no-filtered-records');
        const recordsTable = document.getElementById('records-table');

        // Mostrar mensaje si no hay registros
        if (records.length === 0) {
            noFilteredRecords.style.display = 'block';
            recordsTable.style.display = 'none';
            return;
        }

        // Mostrar tabla si hay registros
        noFilteredRecords.style.display = 'none';
        recordsTable.style.display = 'table';

        // Limpiar lista
        recordsList.innerHTML = '';

        // Renderizar cada registro
        records.forEach(record => {
            const entity = EntityModel.getById(record.entityId) || { name: 'Desconocido' };
            const fields = FieldModel.getByIds(Object.keys(record.data));

            // Obtener los valores de las columnas personalizadas
            const fieldColumns = {
                field1: this.getFieldValue(record, this.selectedColumns.field1, fields),
                field2: this.getFieldValue(record, this.selectedColumns.field2, fields),
                field3: this.getFieldValue(record, this.selectedColumns.field3, fields)
            };

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entity.name}</td>
                <td>${UIUtils.formatDate(record.timestamp)}</td>
                <td>${fieldColumns.field1}</td>
                <td>${fieldColumns.field2}</td>
                <td>${fieldColumns.field3}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-record" data-record-id="${record.id}">
                        Ver
                    </button>
                </td>
            `;

            recordsList.appendChild(row);
        });

        // Configurar event listeners para ver detalles
        recordsList.querySelectorAll('.view-record').forEach(button => {
            button.addEventListener('click', (e) => {
                const recordId = e.target.getAttribute('data-record-id');
                this.showRecordDetails(recordId);
            });
        });
    },

    /**
     * Obtiene el valor formateado de un campo para una columna personalizada
     * @param {Object} record Registro del que obtener el dato
     * @param {string} fieldId ID del campo a obtener
     * @param {Array} fields Lista de campos disponibles
     * @returns {string} Valor formateado del campo o un string vacío si no existe
     */
    getFieldValue(record, fieldId, fields) {
        if (!fieldId || !record.data || record.data[fieldId] === undefined) {
            return '';
        }

        const field = fields.find(f => f.id === fieldId);
        if (!field) return record.data[fieldId];

        // Formatear el valor según el tipo de campo (si fuera necesario)
        // Por ahora simplemente devolver el valor como string
        return record.data[fieldId];
    },

    /**
     * Muestra los detalles de un registro
     * @param {string} recordId ID del registro
     */
    showRecordDetails(recordId) {
        const record = RecordModel.getById(recordId);
        if (!record) return;

        const entity = EntityModel.getById(record.entityId) || { name: 'Desconocido' };
        const fields = FieldModel.getByIds(Object.keys(record.data));
        // Obtener nombre personalizado de la entidad
        const config = StorageService.getConfig();
        const entityName = config.entityName || 'Entidad';
        const modal = UIUtils.initModal('viewRecordModal');
        const recordDetails = document.getElementById('record-details');

        // Preparar contenido del modal
        const detailsHTML = `
            <div class="mb-3">
                <strong>${entityName}:</strong> ${entity.name}
            </div>
            <div class="mb-3">
                <strong>Fecha y Hora:</strong> <span id="record-timestamp">${UIUtils.formatDate(record.timestamp)}</span>
            </div>
            <div class="mb-3">
                <strong>Datos:</strong>
                <div id="record-fields-container">
                    <table class="table table-sm table-bordered mt-2">
                        <thead class="table-light">
                            <tr>
                                <th>Campo</th>
                                <th>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(record.data).map(([fieldId, value]) => {
                                const field = fields.find(f => f.id === fieldId) || { name: fieldId };
                                return `
                                    <tr data-field-id="${fieldId}" data-field-type="${field.type || 'text'}">
                                        <td>${field.name}</td>
                                        <td class="field-value">${value}</td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        recordDetails.innerHTML = detailsHTML;

        // Añadir botones y sus listeners
        const footerDiv = document.querySelector('#viewRecordModal .modal-footer');
        footerDiv.innerHTML = `
            <button type="button" class="btn btn-danger me-auto" id="deleteRecordBtn">Eliminar registro</button>
            <button type="button" class="btn btn-warning" id="editRecordBtn">Editar registro</button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
        `;

        // Listener para el botón de eliminar registro
        document.getElementById('deleteRecordBtn').addEventListener('click', () => {
            // Configurar el modal de confirmación
            const confirmModal = UIUtils.initModal('confirmModal');
            document.getElementById('confirm-message').textContent =
                '¿Está seguro de que desea eliminar este registro? Esta acción no se puede deshacer.';

            const confirmBtn = document.getElementById('confirmActionBtn');

            // Limpiar listeners anteriores
            const newConfirmBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

            // Añadir nuevo listener
            newConfirmBtn.addEventListener('click', () => {
                const deleted = RecordModel.delete(recordId);
                confirmModal.hide();
                modal.hide();

                if (deleted) {
                    this.applyFilters(); // Actualizar lista de registros
                    UIUtils.showAlert('Registro eliminado correctamente', 'success', document.querySelector('.card-body'));
                } else {
                    UIUtils.showAlert('Error al eliminar el registro', 'danger', document.querySelector('.card-body'));
                }
            });

            // Mostrar modal de confirmación
            confirmModal.show();
        });

        // Listener para el botón de editar registro
        document.getElementById('editRecordBtn').addEventListener('click', () => {
            // Cambiar el título del botón durante la edición
            const editBtn = document.getElementById('editRecordBtn');
            if (editBtn.textContent === 'Guardar cambios') {
                // Estamos en modo edición, guardar los cambios
                this.saveRecordChanges(recordId, modal);
                return;
            }
            
            // Cambiar a modo edición
            editBtn.textContent = 'Guardar cambios';
            editBtn.classList.remove('btn-warning');
            editBtn.classList.add('btn-success');
            
            // Añadir botón para cancelar la edición
            if (!document.getElementById('cancelEditBtn')) {
                const cancelBtn = document.createElement('button');
                cancelBtn.id = 'cancelEditBtn';
                cancelBtn.className = 'btn btn-outline-secondary';
                cancelBtn.textContent = 'Cancelar';
                cancelBtn.addEventListener('click', () => {
                    // Recargar los detalles del registro sin guardar cambios
                    this.showRecordDetails(recordId);
                    // Eliminar el backdrop manualmente
                    this.removeModalBackdrop();
                });
                
                // Insertar antes del botón Cerrar
                const closeBtn = document.querySelector('#viewRecordModal .modal-footer button[data-bs-dismiss="modal"]');
                footerDiv.insertBefore(cancelBtn, closeBtn);
            }
            
            // Editar fecha y hora
            const timestampSpan = document.getElementById('record-timestamp');
            const currentTimestamp = new Date(record.timestamp);
            const formattedDate = currentTimestamp.toISOString().slice(0, 16);
            
            timestampSpan.innerHTML = `
                <div class="input-group">
                    <input type="datetime-local" id="new-timestamp" class="form-control form-control-sm" value="${formattedDate}">
                </div>
            `;
            
            // Hacer editables todos los campos del registro
            const fieldsContainer = document.getElementById('record-fields-container');
            const fieldRows = fieldsContainer.querySelectorAll('tbody tr');
            
            fieldRows.forEach(row => {
                const fieldId = row.getAttribute('data-field-id');
                const fieldType = row.getAttribute('data-field-type');
                const field = fields.find(f => f.id === fieldId);
                const currentValue = record.data[fieldId];
                const valueCell = row.querySelector('.field-value');
                
                // Crear el input adecuado según el tipo de campo
                let inputHTML;
                
                switch (fieldType) {
                    case 'number':
                        inputHTML = `<input type="number" class="form-control form-control-sm edit-field" 
                                    data-field-id="${fieldId}" value="${currentValue}">`;
                        break;
                    case 'select':
                        if (field && field.options && field.options.length > 0) {
                            inputHTML = `
                                <select class="form-select form-select-sm edit-field" data-field-id="${fieldId}">
                                    ${field.options.map(option => 
                                        `<option value="${option}" ${currentValue === option ? 'selected' : ''}>${option}</option>`
                                    ).join('')}
                                </select>
                            `;
                        } else {
                            // Si no hay opciones o campo no encontrado, usar un input text
                            inputHTML = `<input type="text" class="form-control form-control-sm edit-field" 
                                       data-field-id="${fieldId}" value="${currentValue}">`;
                        }
                        break;
                    case 'text':
                    default:
                        inputHTML = `<input type="text" class="form-control form-control-sm edit-field" 
                                   data-field-id="${fieldId}" value="${currentValue}">`;
                }
                
                valueCell.innerHTML = inputHTML;
            });
        });

        modal.show();
    },
    
    /**
     * Guarda los cambios realizados en un registro
     * @param {string} recordId ID del registro
     * @param {bootstrap.Modal} modal Instancia del modal
     */
    saveRecordChanges(recordId, modal) {
        const record = RecordModel.getById(recordId);
        if (!record) return;
        
        // Obtener todos los datos editados
        const fieldsData = {};
        document.querySelectorAll('.edit-field').forEach(input => {
            const fieldId = input.getAttribute('data-field-id');
            fieldsData[fieldId] = input.value;
        });
        
        // Obtener la nueva fecha
        const newTimestamp = document.getElementById('new-timestamp').value;
        if (!newTimestamp) {
            UIUtils.showAlert('Debe seleccionar una fecha válida', 'warning', document.getElementById('record-details'));
            return;
        }
        
        // Convertir a formato ISO
        const newDate = new Date(newTimestamp).toISOString();
        
        // Actualizar el registro
        const success = RecordModel.update(recordId, fieldsData, newDate);
        
        if (success) {
            // Recargar los detalles del registro para ver los cambios
            this.showRecordDetails(recordId);
            
            // Eliminar el backdrop manualmente
            this.removeModalBackdrop();
            
            // Actualizar la lista de registros
            this.applyFilters();
            
            // Mostrar mensaje de éxito
            UIUtils.showAlert('Registro actualizado correctamente', 'success', document.getElementById('record-details'));
        } else {
            UIUtils.showAlert('Error al actualizar el registro', 'danger', document.getElementById('record-details'));
        }
    },

    /**
     * Elimina manualmente el backdrop modal y restaura el scroll
     */
    removeModalBackdrop() {
        // Eliminar cualquier backdrop modal que pudiera quedar
        const backdrops = document.querySelectorAll('.modal-backdrop');
        if (backdrops.length > 0) {
            backdrops.forEach(backdrop => backdrop.remove());
        }
        
        // Cerrar todos los modales abiertos
        const openModals = document.querySelectorAll('.modal.show');
        if (openModals.length > 0) {
            openModals.forEach(modalEl => {
                modalEl.classList.remove('show');
                modalEl.style.display = 'none';
                modalEl.setAttribute('aria-hidden', 'true');
                modalEl.removeAttribute('aria-modal');
            });
        }
        
        // Restaurar estados del body
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        // Restaurar html (documentElement)
        document.documentElement.style.overflow = '';
        document.documentElement.style.paddingRight = '';
        
        // Forzar scroll con un timeout para asegurar que se aplican los cambios
        setTimeout(() => {
            // Desbloquear scroll de diferentes formas
            document.body.style.overflow = 'auto';
            document.documentElement.style.overflow = 'auto';
            
            // Forzar un reflow del documento
            document.body.offsetHeight;
            
            // Intentar mover el scroll mínimamente
            window.scrollBy(0, 1);
            window.scrollBy(0, -1);
            
            // Si hay un bloqueo de scroll en toda la ventana, intentar eliminarlo
            if (window.scrollY === 0 && document.body.scrollHeight > window.innerHeight) {
                window.scrollTo(0, 1);
            }
        }, 200);
    },

    /**
     * Genera y muestra un reporte comparativo
     */
    generateReport() {
        const fieldId = document.getElementById('report-field').value;
        const horizontalFieldId = document.getElementById('report-horizontal-field').value;
        const aggregation = document.getElementById('report-aggregation').value;

        if (!fieldId) {
            UIUtils.showAlert('Seleccione un campo para generar el reporte', 'warning', document.querySelector('.card-body'));
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
            UIUtils.showAlert(reportData.error, 'danger', document.querySelector('.card-body'));
            return;
        }

        // Mostrar contenedor del reporte
        const reportContainer = document.getElementById('report-container');
        reportContainer.style.display = 'block';

        // Crear gráfico
        ChartUtils.createBarChart('report-chart', reportData);

        // Crear tabla resumen
        const reportSummary = document.getElementById('report-summary');
        reportSummary.innerHTML = `
            <h6 class="mb-3">Resumen del Reporte</h6>
            ${ChartUtils.createSummaryTable(reportData)}
        `;
    },
    /**
     * Configura el rango de fecha según el atajo seleccionado
     * @param {string} range Tipo de rango de fecha (yesterday, thisWeek, lastWeek, thisMonth, lastMonth)
     */
    setDateRange(range) {
        const fromDateInput = document.getElementById('filter-from-date');
        const toDateInput = document.getElementById('filter-to-date');

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
                // Esta semana (desde domingo o lunes hasta hoy)
                fromDate = new Date(today);
                // Obtener el primer día de la semana (0 = domingo, 1 = lunes)
                const firstDayOfWeek = 1; // Usando lunes como primer día
                const day = today.getDay();
                const diff = (day >= firstDayOfWeek) ? day - firstDayOfWeek : 6 - firstDayOfWeek + day;
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
    }
};