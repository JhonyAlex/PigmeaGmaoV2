/**
 * Vista de registro para crear y editar registros
 */

// Exportamos la función que renderiza la vista
export function renderRegisterView() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <div class="container mt-4">
            <h2>Registro de Datos</h2>
            
            <!-- Selector de entidad -->
            <div class="card mb-4">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">Seleccione la Entidad a Registrar</h5>
                </div>
                <div class="card-body">
                    <select class="form-select" id="entity-selector">
                        <option value="">-- Seleccione una entidad --</option>
                        <!-- Las entidades se cargarán dinámicamente -->
                    </select>
                </div>
            </div>
            
            <!-- Formulario dinámico (aparece al seleccionar entidad) -->
            <div id="dynamic-form-container" style="display: none;">
                <div class="card mb-4">
                    <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <h5 class="mb-0" id="form-title">Formulario de Registro</h5>
                        <button class="btn btn-light btn-sm" id="reset-form-btn">
                            Limpiar Formulario
                        </button>
                    </div>
                    <div class="card-body">
                        <form id="dynamic-form">
                            <!-- Los campos se generarán dinámicamente -->
                        </form>
                        <div class="mt-3">
                            <button type="button" class="btn btn-primary" id="save-record-btn">
                                Guardar Registro
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Listado de registros (aparece al seleccionar entidad) -->
            <div id="records-container" style="display: none;">
                <div class="card">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">Registros Existentes</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead id="records-table-head">
                                    <!-- Las columnas se generarán dinámicamente -->
                                </thead>
                                <tbody id="records-table-body">
                                    <!-- Los registros se cargarán dinámicamente -->
                                </tbody>
                            </table>
                        </div>
                        <div id="no-records-message" class="text-center py-3">
                            <p class="text-muted">No hay registros para mostrar</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Inicializar la vista
    initializeRegisterView();
}

// Función para inicializar la vista de registro
function initializeRegisterView() {
    // Cargar entidades en el selector
    loadEntities();
    
    // Configurar eventos
    setupEventListeners();
}

// Función para cargar las entidades en el selector
function loadEntities() {
    // Aquí deberías cargar las entidades desde tu sistema de almacenamiento
    // Este es solo un ejemplo, ajústalo según tus necesidades
    
    const entitySelector = document.getElementById('entity-selector');
    
    // Obtener entidades
    const entities = []; // Reemplaza esto con tu lógica para obtener entidades
    
    // Limpiar selector
    entitySelector.innerHTML = '<option value="">-- Seleccione una entidad --</option>';
    
    // Agregar las entidades al selector
    entities.forEach(entity => {
        const option = document.createElement('option');
        option.value = entity.id;
        option.textContent = entity.name;
        entitySelector.appendChild(option);
    });
}

// Configurar event listeners
function setupEventListeners() {
    const entitySelector = document.getElementById('entity-selector');
    
    // Cambio de entidad seleccionada
    entitySelector.addEventListener('change', (e) => {
        const entityId = e.target.value;
        
        if (entityId) {
            // Mostrar formulario y tabla de registros
            document.getElementById('dynamic-form-container').style.display = 'block';
            document.getElementById('records-container').style.display = 'block';
            
            // Cargar formulario y registros
            loadDynamicForm(entityId);
            loadRecords(entityId);
        } else {
            // Ocultar formulario y tabla si no hay entidad seleccionada
            document.getElementById('dynamic-form-container').style.display = 'none';
            document.getElementById('records-container').style.display = 'none';
        }
    });
    
    // Limpiar formulario
    document.getElementById('reset-form-btn').addEventListener('click', () => {
        document.getElementById('dynamic-form').reset();
    });
    
    // Guardar registro
    document.getElementById('save-record-btn').addEventListener('click', () => {
        saveRecord();
    });
}

// Cargar formulario dinámico
function loadDynamicForm(entityId) {
    // Aquí deberías cargar la entidad y sus campos desde tu sistema de almacenamiento
    // Este es solo un ejemplo, ajústalo según tus necesidades
    
    // Limpiar formulario
    const form = document.getElementById('dynamic-form');
    form.innerHTML = '';
    
    // Obtener entidad y sus campos
    const entity = {}; // Reemplaza esto con tu lógica para obtener la entidad por ID
    const fields = []; // Reemplaza esto con tu lógica para obtener los campos de la entidad
    
    // Establecer título del formulario
    document.getElementById('form-title').textContent = `Registro de ${entity.name}`;
    
    // Generar campos dinámicamente
    fields.forEach(field => {
        const fieldContainer = document.createElement('div');
        fieldContainer.className = 'mb-3';
        
        // Label
        const label = document.createElement('label');
        label.className = 'form-label';
        label.setAttribute('for', `field-${field.id}`);
        label.textContent = field.name;
        if (field.required) {
            const requiredSpan = document.createElement('span');
            requiredSpan.className = 'text-danger ms-1';
            requiredSpan.textContent = '*';
            label.appendChild(requiredSpan);
        }
        fieldContainer.appendChild(label);
        
        // Input/Select según el tipo
        switch (field.type) {
            case 'text':
                const textInput = document.createElement('input');
                textInput.type = 'text';
                textInput.className = 'form-control';
                textInput.id = `field-${field.id}`;
                textInput.name = `field-${field.id}`;
                textInput.required = field.required;
                fieldContainer.appendChild(textInput);
                break;
                
            case 'number':
                const numberInput = document.createElement('input');
                numberInput.type = 'number';
                numberInput.className = 'form-control';
                numberInput.id = `field-${field.id}`;
                numberInput.name = `field-${field.id}`;
                numberInput.required = field.required;
                fieldContainer.appendChild(numberInput);
                break;
                
            case 'select':
                const select = document.createElement('select');
                select.className = 'form-select';
                select.id = `field-${field.id}`;
                select.name = `field-${field.id}`;
                select.required = field.required;
                
                // Opción vacía inicial
                const emptyOption = document.createElement('option');
                emptyOption.value = '';
                emptyOption.textContent = '-- Seleccione --';
                select.appendChild(emptyOption);
                
                // Agregar opciones
                if (field.options && field.options.length > 0) {
                    field.options.forEach(option => {
                        const optElement = document.createElement('option');
                        optElement.value = option;
                        optElement.textContent = option;
                        select.appendChild(optElement);
                    });
                }
                
                fieldContainer.appendChild(select);
                break;
        }
        
        form.appendChild(fieldContainer);
    });
    
    // Campo oculto para ID de entidad
    const entityIdInput = document.createElement('input');
    entityIdInput.type = 'hidden';
    entityIdInput.id = 'entity-id';
    entityIdInput.value = entityId;
    form.appendChild(entityIdInput);
    
    // Campo oculto para ID de registro (para edición)
    const recordIdInput = document.createElement('input');
    recordIdInput.type = 'hidden';
    recordIdInput.id = 'record-id';
    form.appendChild(recordIdInput);
}

// Cargar registros de la entidad seleccionada
function loadRecords(entityId) {
    // Aquí deberías cargar los registros desde tu sistema de almacenamiento
    // Este es solo un ejemplo, ajústalo según tus necesidades
    
    // Obtener entidad y sus campos
    const entity = {}; // Reemplaza esto con tu lógica para obtener la entidad por ID
    const fields = []; // Reemplaza esto con tu lógica para obtener los campos de la entidad
    
    // Obtener registros
    const records = []; // Reemplaza esto con tu lógica para obtener los registros de la entidad
    
    // Configurar cabecera de tabla
    const tableHead = document.getElementById('records-table-head');
    tableHead.innerHTML = '';
    
    const headerRow = document.createElement('tr');
    
    // Columnas para cada campo
    fields.forEach(field => {
        const th = document.createElement('th');
        th.textContent = field.name;
        headerRow.appendChild(th);
    });
    
    // Columna de acciones
    const actionsHeader = document.createElement('th');
    actionsHeader.textContent = 'Acciones';
    headerRow.appendChild(actionsHeader);
    
    tableHead.appendChild(headerRow);
    
    // Configurar cuerpo de tabla
    const tableBody = document.getElementById('records-table-body');
    tableBody.innerHTML = '';
    
    // Mensaje cuando no hay registros
    const noRecordsMessage = document.getElementById('no-records-message');
    
    if (records.length === 0) {
        noRecordsMessage.style.display = 'block';
        return;
    }
    
    noRecordsMessage.style.display = 'none';
    
    // Agregar filas para cada registro
    records.forEach(record => {
        const row = document.createElement('tr');
        
        // Celdas para cada campo
        fields.forEach(field => {
            const td = document.createElement('td');
            td.textContent = record.data[field.id] || '';
            row.appendChild(td);
        });
        
        // Celda de acciones
        const actionsTd = document.createElement('td');
        actionsTd.className = 'action-buttons';
        
        // Botón ver
        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn btn-sm btn-outline-info me-1';
        viewBtn.innerHTML = '<i class="bi bi-eye"></i>';
        viewBtn.addEventListener('click', () => {
            viewRecord(record.id);
        });
        actionsTd.appendChild(viewBtn);
        
        // Botón editar
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-outline-primary me-1';
        editBtn.innerHTML = '<i class="bi bi-pencil"></i>';
        editBtn.addEventListener('click', () => {
            editRecord(record.id);
        });
        actionsTd.appendChild(editBtn);
        
        // Botón eliminar
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-outline-danger';
        deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
        deleteBtn.addEventListener('click', () => {
            confirmDeleteRecord(record.id);
        });
        actionsTd.appendChild(deleteBtn);
        
        row.appendChild(actionsTd);
        
        tableBody.appendChild(row);
    });
}

// Guardar un registro (nuevo o editado)
function saveRecord() {
    const form = document.getElementById('dynamic-form');
    
    // Validar formulario
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Recolectar datos
    const entityId = document.getElementById('entity-id').value;
    const recordId = document.getElementById('record-id').value;
    
    // Obtener campos de la entidad
    const fields = []; // Reemplaza esto con tu lógica para obtener los campos de la entidad
    
    // Recolectar valores
    const data = {};
    fields.forEach(field => {
        const input = document.getElementById(`field-${field.id}`);
        data[field.id] = input.value;
    });
    
    // Crear o actualizar registro
    if (recordId) {
        // Actualizar registro existente
        updateRecord(recordId, data);
    } else {
        // Crear nuevo registro
        createRecord(entityId, data);
    }
}

// Crear un nuevo registro
function createRecord(entityId, data) {
    // Aquí deberías guardar el registro en tu sistema de almacenamiento
    // Este es solo un ejemplo, ajústalo según tus necesidades
    
    // Limpiar formulario después de guardar
    document.getElementById('dynamic-form').reset();
    document.getElementById('record-id').value = '';
    
    // Recargar lista de registros
    loadRecords(entityId);
    
    // Mostrar mensaje de éxito
    alert('Registro guardado correctamente');
}

// Actualizar un registro existente
function updateRecord(recordId, data) {
    // Aquí deberías actualizar el registro en tu sistema de almacenamiento
    // Este es solo un ejemplo, ajústalo según tus necesidades
    
    // Obtener ID de entidad
    const entityId = document.getElementById('entity-id').value;
    
    // Limpiar formulario después de actualizar
    document.getElementById('dynamic-form').reset();
    document.getElementById('record-id').value = '';
    
    // Cambiar botón de guardar a estado normal
    const saveBtn = document.getElementById('save-record-btn');
    saveBtn.textContent = 'Guardar Registro';
    
    // Recargar lista de registros
    loadRecords(entityId);
    
    // Mostrar mensaje de éxito
    alert('Registro actualizado correctamente');
}

// Ver detalles de un registro
function viewRecord(recordId) {
    // Aquí deberías obtener el registro desde tu sistema de almacenamiento
    // Este es solo un ejemplo, ajústalo según tus necesidades
    
    // Obtener registro
    const record = {}; // Reemplaza esto con tu lógica para obtener el registro por ID
    
    // Obtener campos
    const fields = []; // Reemplaza esto con tu lógica para obtener los campos de la entidad
    
    // Configurar modal
    const modal = new bootstrap.Modal(document.getElementById('viewRecordModal'));
    const recordDetails = document.getElementById('record-details');
    
    // Generar HTML con los detalles
    let html = '<dl class="row">';
    
    fields.forEach(field => {
        html += `
            <dt class="col-sm-3">${field.name}</dt>
            <dd class="col-sm-9">${record.data[field.id] || '-'}</dd>
        `;
    });
    
    html += '</dl>';
    
    recordDetails.innerHTML = html;
    
    // Mostrar modal
    modal.show();
}

// Cargar datos para editar un registro
function editRecord(recordId) {
    // Aquí deberías obtener el registro desde tu sistema de almacenamiento
    // Este es solo un ejemplo, ajústalo según tus necesidades
    
    // Obtener registro
    const record = {}; // Reemplaza esto con tu lógica para obtener el registro por ID
    
    // Obtener campos
    const fields = []; // Reemplaza esto con tu lógica para obtener los campos de la entidad
    
    // Establecer ID del registro en el campo oculto
    document.getElementById('record-id').value = recordId;
    
    // Establecer valores en el formulario
    fields.forEach(field => {
        const input = document.getElementById(`field-${field.id}`);
        if (input) {
            input.value = record.data[field.id] || '';
        }
    });
    
    // Cambiar botón de guardar para indicar edición
    const saveBtn = document.getElementById('save-record-btn');
    saveBtn.textContent = 'Actualizar Registro';
    
    // Desplazar a la parte superior del formulario
    document.getElementById('dynamic-form-container').scrollIntoView({
        behavior: 'smooth'
    });
}

// Confirmar eliminación de un registro
function confirmDeleteRecord(recordId) {
    // Configurar modal de confirmación
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    const confirmMessage = document.getElementById('confirm-message');
    const confirmBtn = document.getElementById('confirmActionBtn');
    
    confirmMessage.textContent = '¿Está seguro de eliminar este registro? Esta acción no se puede deshacer.';
    
    // Eliminar listeners anteriores
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    // Agregar nuevo listener
    newConfirmBtn.addEventListener('click', () => {
        deleteRecord(recordId);
        modal.hide();
    });
    
    modal.show();
}

// Eliminar un registro
function deleteRecord(recordId) {
    // Aquí deberías eliminar el registro de tu sistema de almacenamiento
    // Este es solo un ejemplo, ajústalo según tus necesidades
    
    // Obtener ID de entidad
    const entityId = document.getElementById('entity-id').value;
    
    // Recargar lista de registros
    loadRecords(entityId);
    
    // Mostrar mensaje de éxito
    alert('Registro eliminado correctamente');
}

// Exportar para su uso en el router
export default {
    init: renderRegisterView
};