/**
 * Vista de registro para capturar datos
 */
const RegisterView = {
    /**
     * Inicializa la vista de registro
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
        const config = StorageService.getConfig();
        const entities = EntityModel.getAll();

        const template = `
            <div class="container mt-4">
                <div class="row">
                    <div class="col-md-8 mx-auto">
                        <div class="card mb-4">
                            <div class="card-header bg-primary text-white">
                                <h3 class="mb-0">${config.title}</h3>
                            </div>
                            <div class="card-body">
                                <p class="card-text">${config.description}</p>
                                
                                <form id="register-form">
                                    <div class="mb-3">
                                        <label for="entity-selector" class="form-label">Seleccione ${entities.length > 0 ? 'una Entidad' : 'la Entidad'}</label>
                                        <select class="form-select" id="entity-selector" required>
                                            <option value="">-- Seleccione --</option>
                                            ${entities.map(entity =>
            `<option value="${entity.id}">${entity.name}</option>`
        ).join('')}
                                        </select>
                                    </div>
                                    
                                    <div id="dynamic-fields-container">
                                        <!-- Los campos se cargarán dinámicamente -->
                                    </div>
                                    
                                    <div class="d-grid gap-2">
                                        <button type="submit" class="btn btn-primary" id="save-record-btn">
                                            Guardar Registro
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                        
                        <!-- Últimos registros -->
                        <div class="card">
                            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                                <h5 class="mb-0">Últimos Registros</h5>
                            </div>
                            <div class="card-body p-0">
                                <div class="recent-records-container">
                                    <table class="table table-hover mb-0" id="recent-records-table">
                                        <thead class="table-light">
                                            <tr>
                                                <th>Entidad</th>
                                                <th>Fecha y Hora</th>
                                                <th>Datos</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody id="recent-records-list">
                                            <!-- Los registros se cargarán dinámicamente -->
                                        </tbody>
                                    </table>
                                </div>
                                <div id="no-records-message" class="text-center py-4">
                                    <p class="text-muted">No hay registros recientes.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        mainContent.innerHTML = template;

        // Cargar registros recientes
        this.loadRecentRecords();
    },

    /**
     * Establece los event listeners para la vista
     */
    setupEventListeners() {
        // Cambio de entidad
        document.getElementById('entity-selector').addEventListener('change', (e) => {
            this.loadDynamicFields(e.target.value);
        });

        // Envío del formulario
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRecord();
        });
    },

    /**
     * Carga los campos dinámicos basados en la entidad seleccionada
     * @param {string} entityId ID de la entidad seleccionada
     */
    loadDynamicFields(entityId) {
        const dynamicFieldsContainer = document.getElementById('dynamic-fields-container');

        // Limpiar contenedor
        dynamicFieldsContainer.innerHTML = '';

        if (!entityId) return;

        // Obtener entidad y sus campos
        const entity = EntityModel.getById(entityId);
        if (!entity) return;

        const fields = FieldModel.getByIds(entity.fields);

        // No hay campos asignados
        if (fields.length === 0) {
            dynamicFieldsContainer.innerHTML = `
                <div class="alert alert-warning">
                    Esta entidad no tiene campos asignados. 
                    Configure los campos en la sección de Administración.
                </div>
            `;
            return;
        }

        // Generar campos dinámicos
        fields.forEach(field => {
            const fieldHTML = UIUtils.generateFieldInput(field);
            dynamicFieldsContainer.insertAdjacentHTML('beforeend', fieldHTML);
        });
    },

    /**
     * Guarda un nuevo registro
     */
    saveRecord() {
        const form = document.getElementById('register-form');
        const entityId = document.getElementById('entity-selector').value;

        if (!entityId) {
            UIUtils.showAlert('Debe seleccionar una entidad', 'warning', document.querySelector('.card-body'));
            return;
        }

        // Obtener entidad y sus campos
        const entity = EntityModel.getById(entityId);
        if (!entity) return;

        const fields = FieldModel.getByIds(entity.fields);

        // Validar el formulario
        const validation = ValidationUtils.validateForm(form, fields);

        if (!validation.isValid) {
            UIUtils.showAlert('Por favor complete correctamente todos los campos requeridos', 'warning', document.querySelector('.card-body'));
            return;
        }

        // Guardar registro
        const newRecord = RecordModel.create(entityId, validation.data);

        if (newRecord) {
            // Limpiar formulario
            form.reset();
            document.getElementById('dynamic-fields-container').innerHTML = '';

            // Recargar registros recientes
            this.loadRecentRecords();

            // Mostrar mensaje
            UIUtils.showAlert('Registro guardado correctamente', 'success', document.querySelector('.card-body'));
        } else {
            UIUtils.showAlert('Error al guardar el registro', 'danger', document.querySelector('.card-body'));
        }
    },

    /**
     * Carga y muestra los registros recientes
     */
    loadRecentRecords() {
        const recentRecords = RecordModel.getRecent(10);
        const recentRecordsList = document.getElementById('recent-records-list');
        const noRecordsMessage = document.getElementById('no-records-message');
        const recentRecordsTable = document.getElementById('recent-records-table');

        // Mostrar mensaje si no hay registros
        if (recentRecords.length === 0) {
            noRecordsMessage.style.display = 'block';
            recentRecordsTable.style.display = 'none';
            return;
        }

        // Mostrar tabla si hay registros
        noRecordsMessage.style.display = 'none';
        recentRecordsTable.style.display = 'table';

        // Limpiar lista
        recentRecordsList.innerHTML = '';

        // Renderizar cada registro
        recentRecords.forEach(record => {
            const entity = EntityModel.getById(record.entityId) || { name: 'Desconocido' };
            const fields = FieldModel.getByIds(Object.keys(record.data));

            // Crear fila para el registro
            const row = document.createElement('tr');

            // Preparar datos para mostrar (limitados a 3 campos)
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

            row.innerHTML = `
                <td>${entity.name}</td>
                <td>${UIUtils.formatDate(record.timestamp)}</td>
                <td>${displayData}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary view-record" data-record-id="${record.id}">
                        Ver
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-record" data-record-id="${record.id}">
                        Eliminar
                    </button>
                </td>
            `;

            // Aplicar efecto de highlight si es un nuevo registro
            const isNew = Date.now() - new Date(record.timestamp).getTime() < 10000; // 10 segundos
            if (isNew) {
                UIUtils.highlightNewElement(row);
            }

            recentRecordsList.appendChild(row);
        });

        // Configurar event listeners para ver detalles
        recentRecordsList.querySelectorAll('.view-record').forEach(button => {
            button.addEventListener('click', (e) => {
                const recordId = e.target.getAttribute('data-record-id');
                this.showRecordDetails(recordId);
            });
        });

        recentRecordsList.querySelectorAll('.delete-record').forEach(button => {
            button.addEventListener('click', (e) => {
                const recordId = e.target.getAttribute('data-record-id');
                this.confirmDeleteRecord(recordId);
            });
        });
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

        const modal = UIUtils.initModal('viewRecordModal');
        const recordDetails = document.getElementById('record-details');

        // Preparar contenido del modal
        const detailsHTML = `
            <div class="mb-3">
                <strong>Entidad:</strong> ${entity.name}
            </div>
            <div class="mb-3">
                <strong>Fecha y Hora:</strong> ${UIUtils.formatDate(record.timestamp)}
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
        modal.show();
    },

    /**
 * Confirma la eliminación de un registro
 * @param {string} recordId ID del registro
 */
    confirmDeleteRecord(recordId) {
        const record = RecordModel.getById(recordId);
        if (!record) return;

        const entity = EntityModel.getById(record.entityId) || { name: 'Desconocido' };

        const confirmModal = UIUtils.initModal('confirmModal');
        const confirmMessage = document.getElementById('confirm-message');
        const confirmActionBtn = document.getElementById('confirmActionBtn');

        confirmMessage.textContent = `¿Está seguro de eliminar este registro de "${entity.name}" del ${UIUtils.formatDate(record.timestamp)}? Esta acción no se puede deshacer.`;

        // Eliminar listeners anteriores
        const newConfirmBtn = confirmActionBtn.cloneNode(true);
        confirmActionBtn.parentNode.replaceChild(newConfirmBtn, confirmActionBtn);

        // Agregar nuevo listener
        newConfirmBtn.addEventListener('click', () => {
            const deleted = RecordModel.delete(recordId);

            if (deleted) {
                // Cerrar modal
                bootstrap.Modal.getInstance(document.getElementById('confirmModal')).hide();

                // Recargar registros
                this.loadRecentRecords();

                // Mostrar mensaje
                UIUtils.showAlert('Registro eliminado correctamente', 'success', document.querySelector('.card-body'));
            } else {
                UIUtils.showAlert('Error al eliminar el registro', 'danger', document.querySelector('.container'));
            }
        });

        confirmModal.show();
    }

};