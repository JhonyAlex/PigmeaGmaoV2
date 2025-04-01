/**
 * Vista de reportes para visualizar datos
 */
const ReportsView = {
    /**
     * Inicializa la vista de reportes
     */
    init() {
        this.render();
        this.setupEventListeners();
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
                    <label for="filter-entity" class="form-label">Entidad(es)</label>
                    <select class="form-select" id="filter-entity" multiple size="4">
                        <option value="">Todas las entidades</option>
                        ${entities.map(entity => 
                            `<option value="${entity.id}">${entity.name}</option>`
                        ).join('')}
                    </select>
                    <div class="form-text">Mantenga presionado Ctrl (⌘ en Mac) para seleccionar múltiples entidades</div>
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

        <!-- Reportes Comparativos -->
        <div class="card mb-4">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0">Reportes Comparativos</h5>
            </div>
            <div class="card-body">
                ${sharedNumericFields.length === 0 ? `
                    <div class="alert alert-info">
                        No hay campos numéricos compartidos entre entidades para generar reportes comparativos.
                        <hr>
                        <p class="mb-0">Para generar reportes comparativos, debe crear campos numéricos y asignarlos a múltiples entidades.</p>
                    </div>
                ` : `
                    <form id="report-form" class="row g-3 mb-4">
                        <div class="col-md-4">
                            <label for="report-field" class="form-label">Campo a Comparar</label>
                            <select class="form-select" id="report-field" required>
                                <option value="">Seleccione un campo</option>
                                ${sharedNumericFields.map(field => 
                                    `<option value="${field.id}">${field.name}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label for="report-horizontal-field" class="form-label">Eje Horizontal</label>
                            <select class="form-select" id="report-horizontal-field">
                                <option value="">Identidad Principal</option>
                                ${sharedFields.map(field => 
                                    `<option value="${field.id}">${field.name}</option>`
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
    
    <!-- Tabla de Registros -->
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
            <div class="table-responsive">
                <table class="table table-hover mb-0" id="records-table">
                    <thead class="table-light">
                        <tr>
                            <th>Entidad</th>
                            <th>Fecha y Hora</th>
                            <th>Datos</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody id="records-list">
                        <!-- Los registros se cargarán dinámicamente -->
                    </tbody>
                </table>
            </div>
            <div id="no-filtered-records" class="text-center py-4">
                <p class="text-muted">No hay registros que coincidan con los filtros.</p>
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
    // Modificar setupEventListeners para incluir el evento del botón de exportar a CSV
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
},
    
    /**
     * Aplica los filtros y muestra los registros filtrados
     */
    applyFilters() {
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
        
        // Obtener registros filtrados
        const filteredRecords = RecordModel.filterMultiple(filters);
        
        // Actualizar contador
        document.getElementById('records-count').textContent = `${filteredRecords.length} registros`;
        
        // Mostrar registros
        this.displayFilteredRecords(filteredRecords);
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
        
        // Ordenar registros por fecha (más reciente primero)
        const sortedRecords = [...records].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
        
        // Renderizar cada registro
        sortedRecords.forEach(record => {
            const entity = EntityModel.getById(record.entityId) || { name: 'Desconocido' };
            const fields = FieldModel.getByIds(Object.keys(record.data));
            
            // Preparar datos para mostrar
            const dataFields = [];
            for (const fieldId in record.data) {
                const field = fields.find(f => f.id === fieldId);
                if (field) {
                    dataFields.push(`${field.name}: ${record.data[fieldId]}`);
                }
            }
            
            // Limitar a 3 campos y agregar elipsis si hay más
            let displayData = dataFields.slice(0, 3).join(', ');
            if (dataFields.length > 3) {
                displayData += '...';
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entity.name}</td>
                <td>${UIUtils.formatDate(record.timestamp)}</td>
                <td>${displayData}</td>
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
     * Muestra los detalles de un registro
     * @param {string} recordId ID del registro
     */
    /**
 * Muestra los detalles de un registro
 * @param {string} recordId ID del registro
 */
showRecordDetails(recordId) {
    const record = RecordModel.getById(recordId);
    if (!record) return;
    
    const entity = EntityModel.getById(record.entityId) || { name: 'Desconocido' };
    const fields = FieldModel.getByIds(Object.keys(record.data));
    
    const modal = UIUtils.initModal('viewRecordModal');
    const recordDetails = document.getElementById('record-details');
    
    // Preparar contenido del modal
    const detailsHTML = `
        <div class="mb-3">
            <strong>Entidad:</strong> ${entity.name}
        </div>
        <div class="mb-3">
            <strong>Fecha y Hora:</strong> <span id="record-timestamp">${UIUtils.formatDate(record.timestamp)}</span>
        </div>
        <div class="mb-3">
            <strong>Datos:</strong>
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
                            <tr>
                                <td>${field.name}</td>
                                <td>${value}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    recordDetails.innerHTML = detailsHTML;
    
    // Añadir botones y sus listeners
    const footerDiv = document.querySelector('#viewRecordModal .modal-footer');
    footerDiv.innerHTML = `
        <button type="button" class="btn btn-danger me-auto" id="deleteRecordBtn">Eliminar registro</button>
        <button type="button" class="btn btn-warning" id="editDateBtn">Editar fecha</button>
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
                this.renderRecords(); // Actualizar lista de registros
                UIUtils.showAlert('Registro eliminado correctamente', 'success', document.querySelector('.card-body'));
            } else {
                UIUtils.showAlert('Error al eliminar el registro', 'danger', document.querySelector('.card-body'));
            }
        });
        
        // Mostrar modal de confirmación
        confirmModal.show();
    });
    
    // Listener para el botón de editar fecha
    document.getElementById('editDateBtn').addEventListener('click', () => {
        // Crear un input para la fecha y hora
        const timestampSpan = document.getElementById('record-timestamp');
        const currentTimestamp = new Date(record.timestamp);
        
        // Formatear la fecha para el input datetime-local
        const formattedDate = currentTimestamp.toISOString().slice(0, 16);
        
        // Reemplazar el texto por un input
        timestampSpan.innerHTML = `
            <div class="input-group">
                <input type="datetime-local" id="new-timestamp" class="form-control form-control-sm" value="${formattedDate}">
                <button class="btn btn-sm btn-primary" id="save-timestamp">Guardar</button>
                <button class="btn btn-sm btn-secondary" id="cancel-timestamp">Cancelar</button>
            </div>
        `;
        
        // Listener para guardar la nueva fecha
        document.getElementById('save-timestamp').addEventListener('click', () => {
            const newTimestamp = document.getElementById('new-timestamp').value;
            
            if (!newTimestamp) {
                UIUtils.showAlert('Debe seleccionar una fecha válida', 'warning', recordDetails);
                return;
            }
            
            // Convertir a formato ISO
            const newDate = new Date(newTimestamp).toISOString();
            const updatedRecord = RecordModel.updateDate(recordId, newDate);
            
            if (updatedRecord) {
                // Actualizar la vista
                timestampSpan.textContent = UIUtils.formatDate(newDate);
                this.renderRecords(); // Actualizar lista de registros
                UIUtils.showAlert('Fecha actualizada correctamente', 'success', recordDetails);
            } else {
                UIUtils.showAlert('Error al actualizar la fecha', 'danger', recordDetails);
            }
        });
        
        // Listener para cancelar la edición
        document.getElementById('cancel-timestamp').addEventListener('click', () => {
            timestampSpan.textContent = UIUtils.formatDate(record.timestamp);
        });
    });
    
    modal.show();
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
    }
};