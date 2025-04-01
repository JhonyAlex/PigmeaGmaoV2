/**
 * Vista de administración para gestionar entidades y campos
 */
const AdminView = {
    /**
     * Inicializa la vista de administración
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
        const entityName = config.entityName || 'Entidad';
        
        const template = `
            <div class="container mt-4">
                <h2>Administración del Sistema</h2>
                
                <!-- Configuración General -->
                <div class="card mb-4">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">Configuración General</h5>
                    </div>
                    <div class="card-body">
                        <form id="config-form">
                            <div class="mb-3">
                                <label for="app-title" class="form-label">Título</label>
                                <input type="text" class="form-control" id="app-title" value="${config.title}" required>
                                <small class="text-muted">Este será el título del sitio</small>
                            </div>
                            <div class="mb-3">
                                <label for="app-description" class="form-label">Descripción</label>
                                <textarea class="form-control" id="app-description" rows="2">${config.description}</textarea>
                                <small class="text-muted">Este es la descripción general</small>
                            </div>
                            <div class="mb-3">
                            <label for="entity-name-config" class="form-label">Nombre de Entidad</label>
                            <input type="text" class="form-control" id="entity-name-config" value="${config.entityName || 'Entidad'}" required>
                            <small class="text-muted">Este nombre reemplazará la palabra "Entidad" en todo el sistema</small>
                            </div>
                            <div class="mb-3">
                                <label for="navbar-title" class="form-label">Título del Sistema</label>
                                <input type="text" class="form-control" id="navbar-title" value="${config.navbarTitle || 'Sistema de Registro Flexible'}" required>
                                <small class="text-muted">Este título aparecerá en la barra de navegación</small>
                            </div>
                                <button type="submit" class="btn btn-primary">Guardar Configuración</button>
                        </form>
                    </div>
                </div>
                
                <!-- Entidades Principales -->
                <div class="card mb-4">
                    <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">${entityName}s Principales</h5>
                        <button class="btn btn-light btn-sm" id="add-entity-btn">
                            <i class="bi bi-plus-circle"></i> Agregar ${entityName}
                        </button>
                    </div>
                    <div class="card-body">
                        <div id="entities-container">
                            <div class="text-center py-4" id="no-entities-message">
                                <p class="text-muted">No hay ${entityName.toLowerCase()}s registradas. Agregue una nueva ${entityName.toLowerCase()}.</p>
                            </div>
                            <div class="table-responsive" id="entities-table-container" style="display: none;">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Campos Asignados</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody id="entities-list">
                                        <!-- Entidades se cargarán aquí -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Campos Personalizados -->
                <div class="card mb-4">
                    <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">Campos Personalizados</h5>
                        <button class="btn btn-light btn-sm" id="add-field-btn">
                            <i class="bi bi-plus-circle"></i> Agregar Campo
                        </button>
                    </div>
                    <div class="card-body">
                        <div id="fields-container">
                            <div class="text-center py-4" id="no-fields-message">
                                <p class="text-muted">No hay campos registrados. Agregue un nuevo campo.</p>
                            </div>
                            <div class="table-responsive" id="fields-table-container" style="display: none;">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Tipo</th>
                                            <th>Requerido</th>
                                            <th>Opciones</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody id="fields-list">
                                        <!-- Campos se cargarán aquí -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        mainContent.innerHTML = template;
        
        // Cargar datos iniciales
        this.loadEntities();
        this.loadFields();
    },
    
    /**
     * Establece los event listeners para la vista
     */
    setupEventListeners() {
        const configForm = document.getElementById('config-form');
        const addEntityBtn = document.getElementById('add-entity-btn');
        const addFieldBtn = document.getElementById('add-field-btn');
        const saveEntityBtn = document.getElementById('saveEntityBtn');
        const saveFieldBtn = document.getElementById('saveFieldBtn');
        const fieldType = document.getElementById('field-type');
        const addOptionBtn = document.getElementById('add-option-btn');
        const saveAssignFieldsBtn = document.getElementById('saveAssignFieldsBtn');
        const optionsContainer = document.getElementById('options-container');
    
        // Configuración del formulario
        if (configForm) {
            console.log("Configurando listener para el formulario de configuración");
            configForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log("Formulario de configuración enviado");
                this.saveConfig();
            });
        } else {
            console.error("Formulario de configuración no encontrado");
        }
    
        // Entidades
        if (addEntityBtn) {
            addEntityBtn.addEventListener('click', () => {
                this.showEntityModal();
            });
        }
    
        // Campos
        if (addFieldBtn) {
            addFieldBtn.addEventListener('click', () => {
                this.showFieldModal();
            });
        }
    
        // Modal de entidad
        if (saveEntityBtn) {
            saveEntityBtn.addEventListener('click', () => {
                this.saveEntity();
            });
        }
    
        // Modal de campo
        if (saveFieldBtn) {
            saveFieldBtn.addEventListener('click', () => {
                this.saveField();
            });
        }
    
        // Mostrar/ocultar opciones al cambiar tipo de campo
        if (fieldType) {
            fieldType.addEventListener('change', (e) => {
                if (optionsContainer) {
                    optionsContainer.style.display = e.target.value === 'select' ? 'block' : 'none';
                }
            });
        }
    
        // Agregar opción
        if (addOptionBtn) {
            addOptionBtn.addEventListener('click', () => {
                this.addOptionInput();
            });
        }
    
        // Modal de asignación de campos
        if (saveAssignFieldsBtn) {
            saveAssignFieldsBtn.addEventListener('click', () => {
                this.saveAssignedFields();
            });
        }
    },
    
    /**
     * Carga y muestra las entidades
     */
    loadEntities() {
        const entities = EntityModel.getAll();
        const entitiesContainer = document.getElementById('entities-container');
        const noEntitiesMessage = document.getElementById('no-entities-message');
        const entitiesTableContainer = document.getElementById('entities-table-container');
        const entitiesList = document.getElementById('entities-list');
        
        // Mostrar mensaje si no hay entidades
        if (entities.length === 0) {
            noEntitiesMessage.style.display = 'block';
            entitiesTableContainer.style.display = 'none';
            return;
        }
        
        // Mostrar tabla si hay entidades
        noEntitiesMessage.style.display = 'none';
        entitiesTableContainer.style.display = 'block';
        
        // Limpiar lista
        entitiesList.innerHTML = '';
        
        // Renderizar cada entidad
        entities.forEach(entity => {
            // Obtener campos asignados
            const fields = FieldModel.getByIds(entity.fields);
            const fieldNames = fields.map(field => field.name).join(', ') || 'Ninguno';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entity.name}</td>
                <td>${fieldNames}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-primary assign-fields" data-entity-id="${entity.id}">
                        Asignar Campos
                    </button>
                    <button class="btn btn-sm btn-outline-primary edit-entity" data-entity-id="${entity.id}">
                        Editar
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-entity" data-entity-id="${entity.id}">
                        Eliminar
                    </button>
                </td>
            `;
            
            entitiesList.appendChild(row);
        });
        
        // Agregar event listeners para los botones de acción
        entitiesList.querySelectorAll('.edit-entity').forEach(button => {
            button.addEventListener('click', (e) => {
                const entityId = e.target.getAttribute('data-entity-id');
                this.showEntityModal(entityId);
            });
        });
        
        entitiesList.querySelectorAll('.delete-entity').forEach(button => {
            button.addEventListener('click', (e) => {
                const entityId = e.target.getAttribute('data-entity-id');
                this.confirmDeleteEntity(entityId);
            });
        });
        
        entitiesList.querySelectorAll('.assign-fields').forEach(button => {
            button.addEventListener('click', (e) => {
                const entityId = e.target.getAttribute('data-entity-id');
                this.showAssignFieldsModal(entityId);
            });
        });
    },
    
    /**
     * Carga y muestra los campos personalizados
     */
    loadFields() {
        const fields = FieldModel.getAll();
        const fieldsContainer = document.getElementById('fields-container');
        const noFieldsMessage = document.getElementById('no-fields-message');
        const fieldsTableContainer = document.getElementById('fields-table-container');
        const fieldsList = document.getElementById('fields-list');
        
        // Mostrar mensaje si no hay campos
        if (fields.length === 0) {
            noFieldsMessage.style.display = 'block';
            fieldsTableContainer.style.display = 'none';
            return;
        }
        
        // Mostrar tabla si hay campos
        noFieldsMessage.style.display = 'none';
        fieldsTableContainer.style.display = 'block';
        
        // Limpiar lista
        fieldsList.innerHTML = '';
        
        // Renderizar cada campo
        fields.forEach(field => {
            const row = document.createElement('tr');
            
            // Formatear tipo de campo
            let fieldType = '';
            switch (field.type) {
                case 'text': fieldType = 'Texto'; break;
                case 'number': fieldType = 'Número'; break;
                case 'select': fieldType = 'Selección'; break;
                default: fieldType = field.type;
            }
            
            // Formatear opciones (solo para tipo selección)
            let options = '';
            if (field.type === 'select') {
                options = field.options.join(', ');
            } else {
                options = '-';
            }
            
            row.innerHTML = `
                <td>${field.name}</td>
                <td>${fieldType}</td>
                <td>${field.required ? 'Sí' : 'No'}</td>
                <td>${options}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-outline-primary edit-field" data-field-id="${field.id}">
                        Editar
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-field" data-field-id="${field.id}">
                        Eliminar
                    </button>
                </td>
            `;
            
            fieldsList.appendChild(row);
        });
        
        // Agregar event listeners para los botones de acción
        fieldsList.querySelectorAll('.edit-field').forEach(button => {
            button.addEventListener('click', (e) => {
                const fieldId = e.target.getAttribute('data-field-id');
                this.showFieldModal(fieldId);
            });
        });
        
        fieldsList.querySelectorAll('.delete-field').forEach(button => {
            button.addEventListener('click', (e) => {
                const fieldId = e.target.getAttribute('data-field-id');
                this.confirmDeleteField(fieldId);
            });
        });
    },
    
    /**
     * Guarda la configuración general
     */
    saveConfig() {
        console.log("Guardando configuración...");
        const title = document.getElementById('app-title').value;
        const description = document.getElementById('app-description').value;
        const entityName = document.getElementById('entity-name-config').value;
        const navbarTitle = document.getElementById('navbar-title').value;
        
        const config = {
            title: title,
            description: description,
            entityName: entityName,
            navbarTitle: navbarTitle
        };
        
        StorageService.updateConfig(config);
        UIUtils.showAlert('Configuración guardada correctamente', 'success', document.querySelector('.container'));
        
        // Actualizar navbar-brand inmediatamente
        document.querySelector('.navbar-brand').textContent = navbarTitle;
        
        // Actualizar menciones de "Entidad" visibles en la página actual
        this.updateEntityNameReferences(entityName);
        
        console.log("Configuración guardada:", config);
    },
    
    /**
     * Muestra el modal para crear/editar una entidad
     * @param {string} entityId ID de la entidad (vacío para crear nueva)
     */
    showEntityModal(entityId = null) {
        const modal = UIUtils.initModal('entityModal');
        const modalTitle = document.getElementById('entityModalTitle');
        const entityIdInput = document.getElementById('entity-id');
        const entityNameInput = document.getElementById('entity-name');
        
        // Obtener nombre personalizado
        const config = StorageService.getConfig();
        const entityName = config.entityName || 'Entidad';
        
        // Limpiar formulario
        document.getElementById('entityForm').reset();
        
        if (entityId) {
            // Modo edición
            const entity = EntityModel.getById(entityId);
            if (!entity) return;
            
            modalTitle.textContent = `Editar ${entityName} Principal`;
            entityIdInput.value = entity.id;
            entityNameInput.value = entity.name;
        } else {
            // Modo creación
            modalTitle.textContent = `Nueva ${entityName} Principal`;
            entityIdInput.value = '';
        }
        
        modal.show();
    },
    
    /**
     * Guarda una entidad (nueva o existente)
     */
    saveEntity() {
        const entityForm = document.getElementById('entityForm');
        if (!entityForm.checkValidity()) {
            entityForm.reportValidity();
            return;
        }
        
        const entityId = document.getElementById('entity-id').value;
        const entityName = document.getElementById('entity-name').value;
        
        // Obtener el nombre personalizado para entidad
        const config = StorageService.getConfig();
        const entityTypeName = config.entityName || 'Entidad';
        
        let result;
        if (entityId) {
            // Actualizar entidad existente
            result = EntityModel.update(entityId, entityName);
        } else {
            // Crear nueva entidad
            result = EntityModel.create(entityName);
        }
        
        if (result) {
            // Cerrar modal
            bootstrap.Modal.getInstance(document.getElementById('entityModal')).hide();
            
            // Recargar lista
            this.loadEntities();
            
            // Mostrar mensaje con el nombre personalizado
            const message = entityId ? 
                entityTypeName + ' actualizada correctamente' : 
                entityTypeName + ' creada correctamente';
            UIUtils.showAlert(message, 'success', document.querySelector('.container'));
        } else {
            UIUtils.showAlert('Error al guardar la ' + entityTypeName.toLowerCase(), 'danger', document.querySelector('.container'));
        }
    },
    
    /**
     * Confirma la eliminación de una entidad
     * @param {string} entityId ID de la entidad a eliminar
     */
    confirmDeleteEntity(entityId) {
        const entity = EntityModel.getById(entityId);
    if (!entity) return;
    
    const config = StorageService.getConfig();
    const entityName = config.entityName || 'Entidad';
    
    const confirmModal = UIUtils.initModal('confirmModal');
    const confirmMessage = document.getElementById('confirm-message');
    const confirmActionBtn = document.getElementById('confirmActionBtn');
    
    confirmMessage.textContent = `¿Está seguro de eliminar la ${entityName.toLowerCase()} "${entity.name}"? Esta acción no se puede deshacer y eliminará todos los registros asociados.`;
        
        // Eliminar listeners anteriores
        const newConfirmBtn = confirmActionBtn.cloneNode(true);
        confirmActionBtn.parentNode.replaceChild(newConfirmBtn, confirmActionBtn);
        
        // Agregar nuevo listener
        newConfirmBtn.addEventListener('click', () => {
            const deleted = EntityModel.delete(entityId);
            
            if (deleted) {
                // Cerrar modal
                bootstrap.Modal.getInstance(document.getElementById('confirmModal')).hide();
                
                // Recargar lista
                this.loadEntities();
                
                // Mostrar mensaje
                const config = StorageService.getConfig();
                const entityTypeName = config.entityName || 'Entidad';
                UIUtils.showAlert(entityTypeName + ' eliminada correctamente', 'success', document.querySelector('.container'));
            } else {
                UIUtils.showAlert('Error al eliminar la ' + entityTypeName.toLowerCase(), 'danger', document.querySelector('.container'));
            }
        });
        
        confirmModal.show();
    },
    
    /**
     * Muestra el modal para crear/editar un campo
     * @param {string} fieldId ID del campo (vacío para crear nuevo)
     */
    showFieldModal(fieldId = null) {
        const modal = UIUtils.initModal('fieldModal');
        const modalTitle = document.getElementById('fieldModalTitle');
        const fieldIdInput = document.getElementById('field-id');
        const fieldNameInput = document.getElementById('field-name');
        const fieldTypeSelect = document.getElementById('field-type');
        const fieldRequiredCheck = document.getElementById('field-required');
        const optionsContainer = document.getElementById('options-container');
        const optionsList = document.getElementById('options-list');
        
        // Limpiar formulario
        document.getElementById('fieldForm').reset();
        optionsList.innerHTML = `
            <div class="input-group mb-2">
                <input type="text" class="form-control field-option" placeholder="Opción">
                <button type="button" class="btn btn-outline-danger remove-option">×</button>
            </div>
        `;
        
        // Configurar listener para remover opción
        this.setupOptionRemovalListeners();
        
        if (fieldId) {
            // Modo edición
            const field = FieldModel.getById(fieldId);
            if (!field) return;
            
            modalTitle.textContent = 'Editar Campo Personalizado';
            fieldIdInput.value = field.id;
            fieldNameInput.value = field.name;
            fieldTypeSelect.value = field.type;
            fieldRequiredCheck.checked = field.required;
            
            // Mostrar contenedor de opciones si es tipo selección
            optionsContainer.style.display = field.type === 'select' ? 'block' : 'none';
            
            // Cargar opciones existentes
            if (field.type === 'select' && field.options.length > 0) {
                optionsList.innerHTML = '';
                field.options.forEach(option => {
                    this.addOptionInput(option);
                });
            }
        } else {
            // Modo creación
            modalTitle.textContent = 'Nuevo Campo Personalizado';
            fieldIdInput.value = '';
            optionsContainer.style.display = 'none';
        }
        
        modal.show();
    },
    
    /**
     * Agrega un input para una opción en el modal de campo
     * @param {string} value Valor inicial (opcional)
     */
    addOptionInput(value = '') {
        const optionsList = document.getElementById('options-list');
        const optionDiv = document.createElement('div');
        optionDiv.className = 'input-group mb-2';
        optionDiv.innerHTML = `
            <input type="text" class="form-control field-option" placeholder="Opción" value="${value}">
            <button type="button" class="btn btn-outline-danger remove-option">×</button>
        `;
        
        optionsList.appendChild(optionDiv);
        
        // Configurar listener para el nuevo botón de eliminar
        this.setupOptionRemovalListeners();
    },
    
    /**
     * Configura los listeners para los botones de eliminar opción
     */
    setupOptionRemovalListeners() {
        document.querySelectorAll('.remove-option').forEach(button => {
            button.addEventListener('click', (e) => {
                const optionDiv = e.target.parentNode;
                const optionsList = optionDiv.parentNode;
                
                // No eliminar si es el único
                if (optionsList.children.length > 1) {
                    optionsList.removeChild(optionDiv);
                }
            });
        });
    },
    
    /**
     * Guarda un campo (nuevo o existente)
     */
    saveField() {
        const fieldForm = document.getElementById('fieldForm');
        if (!fieldForm.checkValidity()) {
            fieldForm.reportValidity();
            return;
        }
        
        const fieldId = document.getElementById('field-id').value;
        const fieldName = document.getElementById('field-name').value;
        const fieldType = document.getElementById('field-type').value;
        const fieldRequired = document.getElementById('field-required').checked;
        
        // Recolectar opciones si es tipo selección
        let options = [];
        if (fieldType === 'select') {
            const optionInputs = document.querySelectorAll('.field-option');
            optionInputs.forEach(input => {
                const value = input.value.trim();
                if (value) options.push(value);
            });
            
            // Validar que haya al menos una opción
            if (options.length === 0) {
                UIUtils.showAlert('Debe agregar al menos una opción para el tipo Selección', 'warning', document.querySelector('.modal-body'));
                return;
            }
        }
        
        const fieldData = {
            name: fieldName,
            type: fieldType,
            required: fieldRequired,
            options: options
        };
        
        let result;
        if (fieldId) {
            // Actualizar campo existente
            result = FieldModel.update(fieldId, fieldData);
        } else {
            // Crear nuevo campo
            result = FieldModel.create(fieldData);
        }
        
        if (result) {
            // Cerrar modal
            bootstrap.Modal.getInstance(document.getElementById('fieldModal')).hide();
            
            // Recargar lista
            this.loadFields();
            
            // Mostrar mensaje
            const message = fieldId ? 'Campo actualizado correctamente' : 'Campo creado correctamente';
            UIUtils.showAlert(message, 'success', document.querySelector('.container'));
        } else {
            UIUtils.showAlert('Error al guardar el campo', 'danger', document.querySelector('.container'));
        }
    },
    
    /**
     * Confirma la eliminación de un campo
     * @param {string} fieldId ID del campo a eliminar
     */
    confirmDeleteField(fieldId) {
        const field = FieldModel.getById(fieldId);
        if (!field) return;
        
        const confirmModal = UIUtils.initModal('confirmModal');
        const confirmMessage = document.getElementById('confirm-message');
        const confirmActionBtn = document.getElementById('confirmActionBtn');
        
        confirmMessage.textContent = `¿Está seguro de eliminar el campo "${field.name}"? Esta acción no se puede deshacer y afectará a todas las entidades que lo utilizan.`;
        
        // Eliminar listeners anteriores
        const newConfirmBtn = confirmActionBtn.cloneNode(true);
        confirmActionBtn.parentNode.replaceChild(newConfirmBtn, confirmActionBtn);
        
        // Agregar nuevo listener
        newConfirmBtn.addEventListener('click', () => {
            const deleted = FieldModel.delete(fieldId);
            
            if (deleted) {
                // Cerrar modal
                bootstrap.Modal.getInstance(document.getElementById('confirmModal')).hide();
                
                // Recargar lista
                this.loadFields();
                
                // Mostrar mensaje
                UIUtils.showAlert('Campo eliminado correctamente', 'success', document.querySelector('.container'));
            } else {
                UIUtils.showAlert('Error al eliminar el campo', 'danger', document.querySelector('.container'));
            }
        });
        
        confirmModal.show();
    },
    
    /**
     * Muestra el modal para asignar campos a una entidad
     * @param {string} entityId ID de la entidad
     */
    showAssignFieldsModal(entityId) {
        const entity = EntityModel.getById(entityId);
        if (!entity) return;
        
        const modal = UIUtils.initModal('assignFieldsModal');
        const entityNameTitle = document.getElementById('entity-name-title');
        const availableFieldsList = document.getElementById('available-fields-list');
        const assignedFieldsList = document.getElementById('assigned-fields-list');
        const saveAssignFieldsBtn = document.getElementById('saveAssignFieldsBtn');
        
        // Establecer título
        entityNameTitle.textContent = entity.name;
        
        // Guardar entityId para uso posterior
        saveAssignFieldsBtn.setAttribute('data-entity-id', entityId);
        
        // Cargar campos
        const allFields = FieldModel.getAll();
        const assignedFieldIds = entity.fields;
        
        // Limpiar listas
        availableFieldsList.innerHTML = '';
        assignedFieldsList.innerHTML = '';
        
        // Campos disponibles (no asignados)
        allFields.filter(field => !assignedFieldIds.includes(field.id)).forEach(field => {
            const item = document.createElement('div');
            item.className = 'list-group-item list-group-item-action field-item';
            item.setAttribute('data-field-id', field.id);
            item.textContent = `${field.name} (${this.getFieldTypeLabel(field.type)})`;
            
            item.addEventListener('click', () => {
                this.toggleFieldSelection(item, 'available');
            });
            
            availableFieldsList.appendChild(item);
        });
        
        // Campos asignados
        const assignedFields = FieldModel.getByIds(assignedFieldIds);
        assignedFields.forEach(field => {
            const item = document.createElement('div');
            item.className = 'list-group-item list-group-item-action field-item';
            item.setAttribute('data-field-id', field.id);
            item.textContent = `${field.name} (${this.getFieldTypeLabel(field.type)})`;
            
            item.addEventListener('click', () => {
                this.toggleFieldSelection(item, 'assigned');
            });
            
            assignedFieldsList.appendChild(item);
        });
        
        modal.show();
    },
    
    /**
     * Obtiene la etiqueta legible para un tipo de campo
     * @param {string} type Tipo de campo
     * @returns {string} Etiqueta del tipo
     */
    getFieldTypeLabel(type) {
        switch (type) {
            case 'text': return 'Texto';
            case 'number': return 'Número';
            case 'select': return 'Selección';
            default: return type;
        }
    },
    
    /**
     * Alterna la selección de un campo en el modal de asignación
     * @param {HTMLElement} item Elemento del campo
     * @param {string} listType Tipo de lista ('available' o 'assigned')
     */
    toggleFieldSelection(item, listType) {
        item.classList.toggle('selected');
        
        // Mover a la otra lista
        const fieldId = item.getAttribute('data-field-id');
        const availableFieldsList = document.getElementById('available-fields-list');
        const assignedFieldsList = document.getElementById('assigned-fields-list');
        
        if (item.classList.contains('selected')) {
            // Esperar un momento para dar feedback visual
            setTimeout(() => {
                if (listType === 'available') {
                    // Mover de disponible a asignado
                    assignedFieldsList.appendChild(item);
                    item.classList.remove('selected');
                    
                    // Cambiar listener
                    item.removeEventListener('click', () => {
                        this.toggleFieldSelection(item, 'available');
                    });
                    item.addEventListener('click', () => {
                        this.toggleFieldSelection(item, 'assigned');
                    });
                } else {
                    // Mover de asignado a disponible
                    availableFieldsList.appendChild(item);
                    item.classList.remove('selected');
                    
                    // Cambiar listener
                    item.removeEventListener('click', () => {
                        this.toggleFieldSelection(item, 'assigned');
                    });
                    item.addEventListener('click', () => {
                        this.toggleFieldSelection(item, 'available');
                    });
                }
            }, 300);
        }
    },
    
    /**
     * Guarda los campos asignados a una entidad
     */
    saveAssignedFields() {
        const saveBtn = document.getElementById('saveAssignFieldsBtn');
        const entityId = saveBtn.getAttribute('data-entity-id');
        const assignedFieldsList = document.getElementById('assigned-fields-list');
        
        // Recolectar IDs de campos asignados
        const assignedFieldIds = [];
        assignedFieldsList.querySelectorAll('.field-item').forEach(item => {
            assignedFieldIds.push(item.getAttribute('data-field-id'));
        });
        
        // Guardar asignación
        const result = EntityModel.assignFields(entityId, assignedFieldIds);
        
        if (result) {
            // Cerrar modal
            bootstrap.Modal.getInstance(document.getElementById('assignFieldsModal')).hide();
            
            // Recargar lista
            this.loadEntities();
            
            // Mostrar mensaje
            UIUtils.showAlert('Campos asignados correctamente', 'success', document.querySelector('.container'));
        } else {
            UIUtils.showAlert('Error al asignar campos', 'danger', document.querySelector('.container'));
        }
    },
    /**
 * Actualiza las referencias visibles a "Entidad" con el nuevo nombre
 * @param {string} newEntityName El nuevo nombre para "Entidad"
 */
/**
 * Actualiza las referencias visibles a "Entidad" con el nuevo nombre
 * @param {string} newEntityName El nuevo nombre para "Entidad"
 */
updateEntityNameReferences(newEntityName) {
    console.log("Actualizando referencias a Entidad con:", newEntityName);
    
    // Actualizar encabezado "Entidades Principales"
    const entitiesHeader = document.querySelector('.card-header h5');
    if (entitiesHeader && entitiesHeader.textContent.includes("Entidades")) {
        entitiesHeader.textContent = entitiesHeader.textContent.replace("Entidades", newEntityName + "s");
    }
    
    // Actualizar botón "Agregar Entidad"
    const addEntityBtn = document.getElementById('add-entity-btn');
    if (addEntityBtn) {
        const btnHTML = addEntityBtn.innerHTML;
        if (btnHTML.includes("Agregar Entidad")) {
            addEntityBtn.innerHTML = btnHTML.replace("Agregar Entidad", "Agregar " + newEntityName);
        }
    }
    
    // Actualizar mensaje "No hay entidades registradas"
    const noEntitiesMessage = document.getElementById('no-entities-message');
    if (noEntitiesMessage) {
        const messageText = noEntitiesMessage.querySelector('p');
        if (messageText && messageText.textContent.includes("entidades")) {
            messageText.textContent = messageText.textContent
                .replace("entidades", newEntityName.toLowerCase() + "s")
                .replace("nueva entidad", "nueva " + newEntityName.toLowerCase());
        }
    }
    
    // Actualizar modal de entidad
    const entityModalTitle = document.getElementById('entityModalTitle');
    if (entityModalTitle) {
        if (entityModalTitle.textContent === "Entidad Principal") {
            entityModalTitle.textContent = newEntityName + " Principal";
        } else if (entityModalTitle.textContent === "Nueva Entidad Principal") {
            entityModalTitle.textContent = "Nueva " + newEntityName + " Principal";
        } else if (entityModalTitle.textContent === "Editar Entidad Principal") {
            entityModalTitle.textContent = "Editar " + newEntityName + " Principal";
        }
    }
}
};  