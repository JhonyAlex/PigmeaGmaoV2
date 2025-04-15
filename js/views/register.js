/**
 * Vista de registro para capturar datos
 */
const RegisterView = {
    /**
     * Nombre personalizado para "Entidad"
     */
    entityName: 'Entidad',
    
    /**
     * Almacena los últimos datos ingresados por entidad durante la sesión
     */
    lastEntityRecords: {},
    
    /**
     * Inicializa la vista de registro
     */
    init() {
        // Obtener el nombre personalizado de la configuración
        const config = StorageService.getConfig();
        this.entityName = config.entityName || 'Entidad';
        
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
                                        <label class="form-label">Seleccione ${entities.length > 0 ? `una ${this.entityName}` : `la ${this.entityName}`}</label>
                                        <div id="entity-selector" class="d-flex flex-wrap gap-2">
                                            ${entities.map(entity => 
                                                `<button type="button" class="btn btn-outline-primary entity-btn" data-entity-id="${entity.id}">${entity.name}</button>`
                                            ).join('')}
                                        </div>
                                        <input type="hidden" id="selected-entity-id" name="entity-id" required>
                                    </div>
                                    
                                    <div id="dynamic-fields-container">
                                        <!-- Los campos se cargarán dinámicamente -->
                                    </div>
                                    
                                    <div id="submit-container" style="display: none;">
                                        <div class="d-flex justify-content-between align-items-center mt-3">
                                            <button type="submit" class="btn btn-primary" id="save-record-btn">
                                                Guardar Registro
                                            </button>
                                            <div class="form-check">
                                                <input class="form-check-input" type="checkbox" id="yesterday-check">
                                                <label class="form-check-label" for="yesterday-check">
                                                    Ayer
                                                </label>
                                            </div>
                                        </div>
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
                                                <th>${this.entityName}</th>
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
        // Botones de entidad
        document.querySelectorAll('.entity-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const clickedButton = e.target;
                const entityId = clickedButton.getAttribute('data-entity-id');
                const currentEntityId = document.getElementById('selected-entity-id').value;
                const isToggle = entityId === currentEntityId && document.getElementById('dynamic-fields-container').innerHTML !== '';
                
                // Si es toggle, deseleccionar el botón y limpiar campos
                if (isToggle) {
                    clickedButton.classList.remove('btn-primary');
                    clickedButton.classList.add('btn-outline-primary');
                    document.getElementById('selected-entity-id').value = '';
                    this.loadDynamicFields(''); // Pasamos string vacío para limpiar
                } else {
                    // Quitar clase activa de todos los botones
                    document.querySelectorAll('.entity-btn').forEach(btn => {
                        btn.classList.remove('btn-primary');
                        btn.classList.add('btn-outline-primary');
                    });
                    
                    // Agregar clase activa al botón seleccionado
                    clickedButton.classList.remove('btn-outline-primary');
                    clickedButton.classList.add('btn-primary');
                    
                    // Guardar ID de entidad seleccionada
                    document.getElementById('selected-entity-id').value = entityId;
                    
                    // Cargar campos dinámicos
                    this.loadDynamicFields(entityId);
                }
            });
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
        const submitContainer = document.getElementById('submit-container');
        
        // Limpiar contenedor
        dynamicFieldsContainer.innerHTML = '';
        
        // Si no hay entityId, ocultar el contenedor del botón y limpiar
        if (!entityId) {
            submitContainer.style.display = 'none';
            return;
        }
        
        // Obtener entidad y sus campos
        const entity = EntityModel.getById(entityId);
        if (!entity) {
            submitContainer.style.display = 'none';
            return;
        }
        
        const fields = FieldModel.getByIds(entity.fields);
        
        // No hay campos asignados
        if (fields.length === 0) {
            dynamicFieldsContainer.innerHTML = `
                <div class="alert alert-warning">
                    Esta ${this.entityName.toLowerCase()} no tiene campos asignados. 
                    Configure los campos en la sección de Administración.
                </div>
            `;
            submitContainer.style.display = 'none';
            return;
        }
        
        // Generar campos dinámicos
        fields.forEach(field => {
            const fieldHTML = UIUtils.generateFieldInput(field);
            dynamicFieldsContainer.insertAdjacentHTML('beforeend', fieldHTML);
        });

        // Mostrar el contenedor del botón y checkbox
        submitContainer.style.display = 'block';
        
        // CORRECCIÓN: Guardar referencia a los limpiadores de eventos
        const cleanupFunctions = [];
        
        // Inicializar los selectores de búsqueda después de insertar todos los campos en el DOM
        setTimeout(() => {
            fields.forEach(field => {
                if (field.type === 'select') {
                    // CORRECCIÓN: Almacenar la función de limpieza devuelta por setupSearchableSelect
                    const cleanup = UIUtils.setupSearchableSelect(`#${field.id}`);
                    if (typeof cleanup === 'function') {
                        cleanupFunctions.push(cleanup);
                    }
                    
                    // Hacer visible el select una vez inicializado
                    const selectElement = document.getElementById(field.id);
                    if (selectElement) {
                        selectElement.style.visibility = 'visible';
                    }
                }
            });
            
            // CORRECCIÓN: Agregar una función de limpieza al contenedor para eliminar listeners
            if (cleanupFunctions.length > 0) {
                dynamicFieldsContainer.addEventListener('DOMNodeRemoved', function handler() {
                    // Limpiar listeners cuando se elimine el contenedor
                    cleanupFunctions.forEach(cleanup => cleanup());
                    dynamicFieldsContainer.removeEventListener('DOMNodeRemoved', handler);
                });
            }

            // Cargar últimos datos si existen para esta entidad
            if (this.lastEntityRecords[entityId]) {
                const lastData = this.lastEntityRecords[entityId];
                
                // Rellenar los campos con los últimos datos
                fields.forEach(field => {
                    const fieldElement = document.getElementById(field.id);
                    if (fieldElement && lastData[field.id] !== undefined) {
                        if (field.type === 'checkbox') {
                            fieldElement.checked = lastData[field.id] === true || lastData[field.id] === 'true';
                        } else {
                            fieldElement.value = lastData[field.id];
                            
                            // Si es un select y tiene la biblioteca select2 inicializada
                            if (field.type === 'select' && fieldElement.classList.contains('select2-hidden-accessible')) {
                                try {
                                    $(fieldElement).val(lastData[field.id]).trigger('change');
                                } catch (e) {
                                    console.warn('Error al establecer valor en select2:', e);
                                }
                            }
                        }
                    }
                });
            }
        }, 10); // Un pequeño delay para asegurar que el DOM se actualice primero
    },
    
    /**
     * Guarda un nuevo registro
     */
    saveRecord() {
        const form = document.getElementById('register-form');
        const entityId = document.getElementById('selected-entity-id').value;
        
        if (!entityId) {
            UIUtils.showAlert(`Debe seleccionar una ${this.entityName.toLowerCase()}`, 'warning', document.querySelector('.card-body'));
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
        
        // Verificar si el checkbox "Ayer" está marcado
        const yesterdayCheck = document.getElementById('yesterday-check');
        const useYesterdayDate = yesterdayCheck && yesterdayCheck.checked;
        
        // CORRECCIÓN: Almacenar los elementos que contienen listeners antes de limpiar el formulario
        const fieldsWithSelects = [];
        fields.forEach(field => {
            if (field.type === 'select') {
                const element = document.getElementById(field.id);
                if (element) {
                    fieldsWithSelects.push(element);
                }
            }
        });
        
        // Guardar los valores del formulario en lastEntityRecords
        this.lastEntityRecords[entityId] = { ...validation.data };
        
        // Guardar registro
        const newRecord = RecordModel.create(entityId, validation.data);
        
        if (newRecord) {
            // Si el checkbox de ayer está marcado, actualizar la fecha
            if (useYesterdayDate) {
                // Obtener la fecha actual del registro
                const currentDate = new Date(newRecord.timestamp);
                
                // Restar un día manteniendo la misma hora
                currentDate.setDate(currentDate.getDate() - 1);
                
                // Actualizar la fecha del registro
                RecordModel.updateDate(newRecord.id, currentDate.toISOString());
            }
            
            // CORRECCIÓN: Disparar un evento personalizado antes de limpiar el formulario
            // para que los componentes puedan prepararse para la eliminación
            const cleanupEvent = new CustomEvent('prepareFormReset', { 
                bubbles: true, detail: { formId: form.id } 
            });
            form.dispatchEvent(cleanupEvent);
            
            // Limpiar formulario
            form.reset();
            
            // CORRECCIÓN: Limpiar el contenedor de campos correctamente
            const dynamicFieldsContainer = document.getElementById('dynamic-fields-container');
            if (dynamicFieldsContainer) {
                // Antes de limpiar, disparar evento para que los listeners puedan limpiarse
                dynamicFieldsContainer.dispatchEvent(new Event('DOMNodeRemoved', { bubbles: true }));
                dynamicFieldsContainer.innerHTML = '';
            }
            
            // Ocultar el contenedor del botón y checkbox
            document.getElementById('submit-container').style.display = 'none';
            
            // Desactivar el botón de la entidad seleccionada
            document.querySelectorAll('.entity-btn').forEach(btn => {
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-outline-primary');
            });
            
            // Limpiar el ID de entidad seleccionada
            document.getElementById('selected-entity-id').value = '';
            
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
                <strong>${this.entityName}:</strong> ${entity.name}
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
                    this.loadRecentRecords(); // Corregido: era this.renderRecords()
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
                    this.loadRecentRecords(); // Actualizar lista de registros
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
     * Actualiza las referencias visibles a "Entidad" en esta vista
     * @param {string} newEntityName Nombre personalizado para "Entidad"
     */
    updateEntityNameReferences(newEntityName) {
        // Actualizar la propiedad del objeto
        this.entityName = newEntityName;
        
        console.log("Actualizando referencias a Entidad en vista de registro con:", newEntityName);
        
        // Actualizar etiquetas y textos
        document.querySelectorAll('label, th, strong').forEach(el => {
            if (el.textContent === "Entidad:") {
                el.textContent = `${newEntityName}:`;
            }
            if (el.textContent === "Entidad") {
                el.textContent = newEntityName;
            }
        });
        
        // Actualizar mensajes de alert que pueden contener la palabra "entidad"
        document.querySelectorAll('.alert').forEach(alert => {
            if (alert.textContent.includes("entidad")) {
                alert.textContent = alert.textContent.replace(/entidad/g, newEntityName.toLowerCase());
            }
        });
    }
};