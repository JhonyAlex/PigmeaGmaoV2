// js/ui.js
const UI = (() => {
    // Selectores de Secciones
    const adminSection = document.getElementById('admin-section');
    const registerSection = document.getElementById('register-section');
    const reportsSection = document.getElementById('reports-section');

    // Selectores de Modales
    const mainModalElement = document.getElementById('mainModal');
    const mainModal = new bootstrap.Modal(mainModalElement); // Instancia de Bootstrap Modal
    const mainModalTitle = document.getElementById('mainModalLabel');
    const mainModalBody = document.getElementById('mainModalBody');
    const mainModalFooter = document.getElementById('mainModalFooter');

    // --- Renderizado de Secciones ---
    const showSection = (sectionId) => {
        [adminSection, registerSection, reportsSection].forEach(section => {
            section.classList.add('d-none');
        });
        document.getElementById(sectionId + '-section').classList.remove('d-none');

        // Actualizar active class en navbar
        document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
             link.classList.remove('active');
             if (link.dataset.section === sectionId) {
                 link.classList.add('active');
             }
        });
    };

    // --- Renderizado Sección Admin ---
    const renderAdminSection = () => {
        adminSection.innerHTML = `
            <h2>Administración</h2>
            <hr>
            <div class="card mb-4">
                <div class="card-header">Configuración General</div>
                <div class="card-body">
                    <form id="settings-form">
                        <div class="mb-3">
                            <label for="settings-title" class="form-label">Título del Formulario de Registro</label>
                            <input type="text" class="form-control" id="settings-title" required>
                        </div>
                        <div class="mb-3">
                            <label for="settings-description" class="form-label">Descripción del Formulario</label>
                            <textarea class="form-control" id="settings-description" rows="2"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary btn-sm">Guardar Configuración</button>
                    </form>
                </div>
            </div>

            <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    Gestión de Entidades Principales
                    <button class="btn btn-success btn-sm" id="add-entity-btn">Agregar Entidad</button>
                </div>
                <div class="card-body">
                    <div id="entities-list"></div>
                </div>
            </div>

             <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                    Gestión de Campos Personalizados
                    <button class="btn btn-success btn-sm" id="add-field-btn">Agregar Campo</button>
                </div>
                <div class="card-body">
                    <div id="fields-list"></div>
                </div>
            </div>
        `;
        renderEntitiesList();
        renderFieldsList();
        loadSettingsForm(); // Cargar datos actuales en el form de settings
    };

    const renderEntitiesList = () => {
        const entities = Storage.getEntities();
        const listElement = document.getElementById('entities-list');
        if (!listElement) return;

        if (entities.length === 0) {
            listElement.innerHTML = `<p class="text-muted">No hay entidades creadas.</p>`;
            return;
        }

        listElement.innerHTML = `
            <ul class="list-group">
                ${entities.map(entity => `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <span>${Utils.escapeHTML(entity.name)}</span>
                        <div>
                            <button class="btn btn-outline-primary btn-sm me-2" data-action="manage-fields" data-entity-id="${entity.id}">Asociar Campos</button>
                            <button class="btn btn-outline-secondary btn-sm me-2" data-action="edit-entity" data-entity-id="${entity.id}">Editar</button>
                            <button class="btn btn-outline-danger btn-sm" data-action="delete-entity" data-entity-id="${entity.id}">Eliminar</button>
                        </div>
                    </li>
                `).join('')}
            </ul>`;
    };

    const renderFieldsList = () => {
        const fields = Storage.getFields();
        const listElement = document.getElementById('fields-list');
         if (!listElement) return;

        if (fields.length === 0) {
            listElement.innerHTML = `<p class="text-muted">No hay campos personalizados creados.</p>`;
            return;
        }

        listElement.innerHTML = `
            <ul class="list-group">
                ${fields.map(field => `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${Utils.escapeHTML(field.name)}</strong>
                            <small class="text-muted ms-2">(${field.type}${field.required ? ', Obligatorio' : ''}${field.type === 'Selección' ? ', Opciones: ' + Utils.escapeHTML(field.options.join(', ')) : ''})</small>
                        </div>
                        <div>
                            <button class="btn btn-outline-danger btn-sm" data-action="delete-field" data-field-id="${field.id}">Eliminar</button>
                        </div>
                    </li>
                `).join('')}
            </ul>`;
    };

    const loadSettingsForm = () => {
        const settings = Storage.getSettings();
        const titleInput = document.getElementById('settings-title');
        const descriptionInput = document.getElementById('settings-description');
        if(titleInput) titleInput.value = settings.title;
        if(descriptionInput) descriptionInput.value = settings.description;
    }

    // --- Renderizado Modales Admin ---
    const showEntityFormModal = (entity = null) => {
        const isEditing = entity !== null;
        mainModalTitle.textContent = isEditing ? 'Editar Entidad Principal' : 'Agregar Nueva Entidad Principal';
        mainModalBody.innerHTML = `
            <form id="entity-form">
                <input type="hidden" id="entity-id" value="${isEditing ? entity.id : ''}">
                <div class="mb-3">
                    <label for="entity-name" class="form-label">Nombre de la Entidad</label>
                    <input type="text" class="form-control" id="entity-name" value="${isEditing ? Utils.escapeHTML(entity.name) : ''}" required>
                    <div class="invalid-feedback">El nombre es obligatorio.</div>
                </div>
            </form>
        `;
        mainModalFooter.innerHTML = `
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" form="entity-form" class="btn btn-primary">${isEditing ? 'Guardar Cambios' : 'Crear Entidad'}</button>
        `;
        mainModal.show();
    };

    const showFieldFormModal = () => { // Edición de campos no implementada inicialmente
        mainModalTitle.textContent = 'Agregar Nuevo Campo Personalizado';
        mainModalBody.innerHTML = `
            <form id="field-form">
                <div class="mb-3">
                    <label for="field-name" class="form-label">Nombre del Campo</label>
                    <input type="text" class="form-control" id="field-name" required>
                    <div class="invalid-feedback">El nombre es obligatorio.</div>
                </div>
                <div class="mb-3">
                    <label for="field-type" class="form-label">Tipo de Campo</label>
                    <select class="form-select" id="field-type" required>
                        <option value="" selected disabled>Seleccione...</option>
                        <option value="Texto">Texto</option>
                        <option value="Número">Número</option>
                        <option value="Selección">Selección</option>
                    </select>
                     <div class="invalid-feedback">Seleccione un tipo.</div>
                </div>
                <div class="mb-3 d-none" id="field-options-container">
                    <label for="field-options" class="form-label">Opciones (separadas por coma)</label>
                    <input type="text" class="form-control" id="field-options">
                     <div class="invalid-feedback">Ingrese al menos dos opciones separadas por coma.</div>
                </div>
                <div class="form-check mb-3">
                    <input class="form-check-input" type="checkbox" value="" id="field-required">
                    <label class="form-check-label" for="field-required">
                        ¿Es obligatorio?
                    </label>
                </div>
            </form>
        `;
        mainModalFooter.innerHTML = `
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" form="field-form" class="btn btn-primary">Crear Campo</button>
        `;

        // Lógica para mostrar/ocultar opciones de selección
        const fieldTypeSelect = mainModalBody.querySelector('#field-type');
        const optionsContainer = mainModalBody.querySelector('#field-options-container');
        const optionsInput = mainModalBody.querySelector('#field-options');
        fieldTypeSelect.addEventListener('change', (e) => {
            if (e.target.value === 'Selección') {
                optionsContainer.classList.remove('d-none');
                optionsInput.required = true;
            } else {
                optionsContainer.classList.add('d-none');
                optionsInput.required = false;
                 optionsInput.value = ''; // Limpiar por si acaso
            }
        });

        mainModal.show();
    };

    const showManageFieldsModal = (entity) => {
        const allFields = Storage.getFields();
        const associatedFieldIds = entity.associatedFieldIds || [];
        mainModalTitle.textContent = `Asociar Campos a: ${Utils.escapeHTML(entity.name)}`;
        mainModalBody.innerHTML = `
            <form id="manage-fields-form">
                <input type="hidden" id="manage-entity-id" value="${entity.id}">
                <h5>Seleccione los campos para esta entidad:</h5>
                ${allFields.length === 0 ? '<p class="text-muted">No hay campos creados para asociar.</p>' : ''}
                ${allFields.map(field => `
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="${field.id}" id="field-assoc-${field.id}"
                               ${associatedFieldIds.includes(field.id) ? 'checked' : ''}>
                        <label class="form-check-label" for="field-assoc-${field.id}">
                            ${Utils.escapeHTML(field.name)} <small class="text-muted">(${field.type})</small>
                        </label>
                    </div>
                `).join('')}
            </form>
        `;
        mainModalFooter.innerHTML = `
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" form="manage-fields-form" class="btn btn-primary">Guardar Asociaciones</button>
        `;
        mainModal.show();
    };

     const showConfirmDeleteModal = (message, confirmCallback) => {
        mainModalTitle.textContent = 'Confirmar Eliminación';
        mainModalBody.innerHTML = `<p>${Utils.escapeHTML(message)}</p><p class="text-danger">Esta acción no se puede deshacer.</p>`;
        mainModalFooter.innerHTML = `
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" id="confirm-delete-btn" class="btn btn-danger">Eliminar</button>
        `;
        // Eliminar listener previo si existe para evitar múltiples llamadas
        const confirmBtn = mainModalFooter.querySelector('#confirm-delete-btn');
        confirmBtn.replaceWith(confirmBtn.cloneNode(true)); // Clona para remover listeners
        mainModalFooter.querySelector('#confirm-delete-btn').addEventListener('click', () => {
             confirmCallback();
             mainModal.hide();
        });
        mainModal.show();
    };


    // --- Renderizado Sección Registro ---
    const renderRegisterSection = () => {
        const settings = Storage.getSettings();
        const entities = Storage.getEntities();

        registerSection.innerHTML = `
            <h2>${Utils.escapeHTML(settings.title)}</h2>
            <p>${Utils.escapeHTML(settings.description)}</p>
            <hr>
            <form id="register-form" class="needs-validation" novalidate>
                <div class="row g-3">
                    <div class="col-md-6 mb-3">
                        <label for="entity-select" class="form-label">Seleccione Entidad</label>
                        <select class="form-select" id="entity-select" required>
                            <option value="" selected disabled>Elija una entidad...</option>
                            ${entities.map(e => `<option value="${e.id}">${Utils.escapeHTML(e.name)}</option>`).join('')}
                        </select>
                         <div class="invalid-feedback">Debe seleccionar una entidad.</div>
                    </div>
                </div>
                <div id="dynamic-form-fields" class="mt-3">
                    <p class="text-muted">Seleccione una entidad para ver sus campos.</p>
                </div>
                 <hr>
                 <button type="submit" class="btn btn-primary" id="save-registration-btn" disabled>Guardar Registro</button>
            </form>

            <div class="mt-5">
                <h4>Últimos Registros</h4>
                <div id="last-registrations">
                   </div>
            </div>
        `;
        renderLastRegistrations(); // Mostrar registros iniciales
    };

    const renderDynamicFormFields = (entityId) => {
        const entity = Storage.getEntityById(entityId);
        const dynamicFieldsContainer = document.getElementById('dynamic-form-fields');
        const saveButton = document.getElementById('save-registration-btn');

        if (!entity || !entity.associatedFieldIds || entity.associatedFieldIds.length === 0) {
            dynamicFieldsContainer.innerHTML = `<p class="text-muted">Esta entidad no tiene campos asociados.</p>`;
            saveButton.disabled = true;
            return;
        }

        const fields = Storage.getFieldsByIds(entity.associatedFieldIds);
        dynamicFieldsContainer.innerHTML = fields.map(field => {
            let inputHtml = '';
            const requiredAttr = field.required ? 'required' : '';
            const fieldId = `field-${field.id}`; // ID único para el input/select

            switch (field.type) {
                case 'Texto':
                    inputHtml = `<input type="text" class="form-control" id="${fieldId}" name="${Utils.escapeHTML(field.name)}" ${requiredAttr}>`;
                    break;
                case 'Número':
                    inputHtml = `<input type="number" step="any" class="form-control" id="${fieldId}" name="${Utils.escapeHTML(field.name)}" ${requiredAttr}>`; // step="any" para decimales
                    break;
                case 'Selección':
                    inputHtml = `
                        <select class="form-select" id="${fieldId}" name="${Utils.escapeHTML(field.name)}" ${requiredAttr}>
                            <option value="" selected disabled>Seleccione...</option>
                            ${(field.options || []).map(opt => `<option value="${Utils.escapeHTML(opt)}">${Utils.escapeHTML(opt)}</option>`).join('')}
                        </select>`;
                    break;
                default:
                    inputHtml = `<span class="text-danger">Tipo de campo no soportado: ${field.type}</span>`;
            }

            return `
                <div class="col-md-6 mb-3">
                    <label for="${fieldId}" class="form-label">${Utils.escapeHTML(field.name)}${field.required ? ' <span class="text-danger">*</span>' : ''}</label>
                    ${inputHtml}
                    <div class="invalid-feedback">Este campo es obligatorio${field.type === 'Número' ? ' y debe ser un número válido' : ''}${field.type === 'Selección' ? ' (debe seleccionar una opción)' : ''}.</div>
                </div>
            `;
        }).join('');

        // Insertar dentro de un .row para layout correcto
        dynamicFieldsContainer.innerHTML = `<div class="row">${dynamicFieldsContainer.innerHTML}</div>`;
        saveButton.disabled = false;
    };

     const clearRegisterForm = () => {
        const form = document.getElementById('register-form');
        if(form) {
            form.reset(); // Limpia inputs y selects
            document.getElementById('dynamic-form-fields').innerHTML = '<p class="text-muted">Seleccione una entidad para ver sus campos.</p>'; // Restaura mensaje inicial
             document.getElementById('save-registration-btn').disabled = true; // Deshabilitar botón
             form.classList.remove('was-validated'); // Limpiar estado de validación
        }
     };

    const renderLastRegistrations = (limit = 5) => {
        const container = document.getElementById('last-registrations');
        if(!container) return;

        const registrations = Storage.getRegistrations().slice(0, limit); // Ya vienen ordenados
        const entities = Storage.getEntities(); // Para obtener nombres

        if (registrations.length === 0) {
            container.innerHTML = `<p class="text-muted">No hay registros aún.</p>`;
            return;
        }

        container.innerHTML = `
            <ul class="list-group">
                ${registrations.map(reg => {
                    const entity = entities.find(e => e.id === reg.entityId);
                    const entityName = entity ? Utils.escapeHTML(entity.name) : 'Entidad Desconocida';
                    const dataPairs = Object.entries(reg.data)
                        .map(([key, value]) => `<strong>${Utils.escapeHTML(key)}:</strong> ${Utils.escapeHTML(value)}`)
                        .join(', ');

                    return `
                        <li class="list-group-item">
                            <div class="d-flex w-100 justify-content-between">
                                <h6 class="mb-1">${entityName}</h6>
                                <small class="text-muted">${Utils.formatDate(reg.timestamp)}</small>
                            </div>
                            <p class="mb-1">${dataPairs}</p>
                            <button class="btn btn-outline-danger btn-sm float-end" data-action="delete-registration" data-reg-id="${reg.id}" style="margin-top: -25px;">Eliminar</button>
                         </li>`;
                 }).join('')}
            </ul>`;
    };


    // --- Renderizado Sección Reportes ---
    const renderReportsSection = () => {
        const entities = Storage.getEntities();
        const fields = Storage.getFields(); // Para buscar campos numéricos compartidos

        // Identificar campos numéricos compartidos
        const numericFields = fields.filter(f => f.type === 'Número');
        const fieldUsageCount = {};
        Storage.getEntities().forEach(entity => {
            (entity.associatedFieldIds || []).forEach(fieldId => {
                const field = fields.find(f => f.id === fieldId);
                if (field && field.type === 'Número') {
                    fieldUsageCount[field.name] = (fieldUsageCount[field.name] || 0) + 1;
                }
            });
        });
        const sharedNumericFields = numericFields.filter(f => fieldUsageCount[f.name] > 1);


        reportsSection.innerHTML = `
            <h2>Reportes</h2>
            <hr>
            <div class="row mb-3 g-3 align-items-end">
                 <div class="col-md-4">
                    <label for="report-entity-filter" class="form-label">Filtrar por Entidad</label>
                    <select class="form-select" id="report-entity-filter">
                        <option value="">Todas las Entidades</option>
                         ${entities.map(e => `<option value="${e.id}">${Utils.escapeHTML(e.name)}</option>`).join('')}
                    </select>
                 </div>
                 <div class="col-md-3">
                    <label for="report-date-start" class="form-label">Fecha Inicio</label>
                    <input type="date" class="form-control" id="report-date-start">
                 </div>
                 <div class="col-md-3">
                    <label for="report-date-end" class="form-label">Fecha Fin</label>
                    <input type="date" class="form-control" id="report-date-end">
                 </div>
                 <div class="col-md-2">
                     <button class="btn btn-primary w-100" id="apply-report-filters">Aplicar Filtros</button>
                 </div>
            </div>

            <h4>Registros Filtrados</h4>
            <div id="report-table-container" style="max-height: 400px; overflow-y: auto;" class="mb-4">
                 <p class="text-muted">Aplique filtros para ver los registros.</p>
                 </div>

            <h4>Reportes Comparativos (Campos Numéricos Compartidos)</h4>
            <div id="report-charts-container">
                ${sharedNumericFields.length === 0 ? '<p class="text-muted">No hay campos numéricos compartidos entre entidades para comparar.</p>' : ''}
                ${sharedNumericFields.map(field => `
                    <div class="card mb-3">
                        <div class="card-header">Comparativa: ${Utils.escapeHTML(field.name)}</div>
                        <div class="card-body">
                             <div style="position: relative; height: 300px;">
                                 <canvas id="chart-${field.id}"></canvas>
                             </div>
                             <div id="summary-table-${field.id}" class="mt-3">
                                </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        // Inicialmente no mostramos datos ni gráficos hasta aplicar filtros
    };

     const renderReportTable = (filteredRegistrations) => {
        const container = document.getElementById('report-table-container');
        const entities = Storage.getEntities(); // Para nombres
        const fields = Storage.getFields(); // Para obtener todos los nombres posibles de columnas

        if (!container) return;

        if (filteredRegistrations.length === 0) {
            container.innerHTML = `<p class="text-muted">No se encontraron registros con los filtros aplicados.</p>`;
            return;
        }

        // Determinar todas las columnas posibles (nombres de campos únicos de los registros filtrados + Entidad + Fecha)
        const allFieldNames = new Set(['Entidad', 'Fecha']);
        filteredRegistrations.forEach(reg => {
            Object.keys(reg.data).forEach(fieldName => allFieldNames.add(fieldName));
        });
        const headers = Array.from(allFieldNames);

        container.innerHTML = `
            <table class="table table-striped table-bordered table-sm">
                <thead>
                    <tr>
                        ${headers.map(h => `<th>${Utils.escapeHTML(h)}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${filteredRegistrations.map(reg => {
                        const entity = entities.find(e => e.id === reg.entityId);
                        const entityName = entity ? Utils.escapeHTML(entity.name) : 'Desconocida';
                        const rowData = {
                            'Entidad': entityName,
                            'Fecha': Utils.formatDate(reg.timestamp)
                        };
                        // Llenar con datos del registro, usando '' si el campo no existe en este registro particular
                        headers.forEach(header => {
                            if (header !== 'Entidad' && header !== 'Fecha') {
                                rowData[header] = Utils.escapeHTML(reg.data[header] ?? ''); // Usar '' si el campo no está
                            }
                        });

                        return `<tr>${headers.map(h => `<td>${rowData[h]}</td>`).join('')}</tr>`;
                    }).join('')}
                </tbody>
            </table>`;
    };

    // Almacenar instancias de Chart para poder destruirlas antes de re-renderizar
    let chartInstances = {};

    const renderComparisonCharts = (filteredRegistrations) => {
        const fields = Storage.getFields();
        const entities = Storage.getEntities();

        // Re-identificar campos numéricos compartidos (podría pasarse como argumento)
        const numericFields = fields.filter(f => f.type === 'Número');
        const fieldUsageCount = {};
        entities.forEach(entity => {
            (entity.associatedFieldIds || []).forEach(fieldId => {
                const field = fields.find(f => f.id === fieldId);
                if (field && field.type === 'Número') {
                    fieldUsageCount[field.name] = (fieldUsageCount[field.name] || 0) + 1;
                }
            });
        });
        const sharedNumericFields = numericFields.filter(f => fieldUsageCount[f.name] > 1);

        sharedNumericFields.forEach(field => {
            const chartCanvas = document.getElementById(`chart-${field.id}`);
            const summaryTableContainer = document.getElementById(`summary-table-${field.id}`);
            if (!chartCanvas) return;

            // Destruir gráfico anterior si existe
            if (chartInstances[field.id]) {
                chartInstances[field.id].destroy();
            }

            // Agrupar datos por entidad para el campo actual
            const dataByEntity = {}; // { entityId: { name: '...', total: 0, count: 0 }, ... }

            filteredRegistrations.forEach(reg => {
                 const fieldValue = parseFloat(reg.data[field.name]); // Intentar convertir a número
                 if (!isNaN(fieldValue)) { // Solo si es un número válido y el campo existe en el registro
                    if (!dataByEntity[reg.entityId]) {
                        const entity = entities.find(e => e.id === reg.entityId);
                        dataByEntity[reg.entityId] = {
                            name: entity ? Utils.escapeHTML(entity.name) : 'Desconocida',
                            total: 0,
                            count: 0 // Para calcular promedios si fuera necesario
                        };
                    }
                    dataByEntity[reg.entityId].total += fieldValue;
                    dataByEntity[reg.entityId].count += 1;
                 }
            });

            const labels = Object.values(dataByEntity).map(d => d.name);
            const dataTotals = Object.values(dataByEntity).map(d => d.total);

            // Generar colores dinámicamente (o usar un conjunto predefinido)
            const backgroundColors = labels.map((_, i) => `hsl(${i * (360 / labels.length)}, 70%, 50%)`);

            if (labels.length > 0) {
                chartInstances[field.id] = new Chart(chartCanvas, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: `Suma Total de ${Utils.escapeHTML(field.name)}`,
                            data: dataTotals,
                            backgroundColor: backgroundColors,
                            borderColor: backgroundColors.map(c => c.replace('50%', '40%')), // Borde más oscuro
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: { display: true, text: 'Suma Total' }
                            },
                             x: {
                                title: { display: true, text: 'Entidad Principal' }
                            }
                        },
                         plugins: {
                            legend: { display: false }, // Ocultar leyenda si solo hay un dataset
                            title: { display: true, text: `Comparativa: ${Utils.escapeHTML(field.name)} por Entidad` }
                        }
                    }
                });

                // Renderizar tabla resumen (opcional)
                if (summaryTableContainer) {
                    summaryTableContainer.innerHTML = `
                        <h6>Resumen - ${Utils.escapeHTML(field.name)}</h6>
                        <table class="table table-sm table-bordered">
                            <thead><tr><th>Entidad</th><th>Suma Total</th><th>Registros</th><th>Promedio</th></tr></thead>
                            <tbody>
                                ${Object.values(dataByEntity).map(d => `
                                    <tr>
                                        <td>${d.name}</td>
                                        <td>${d.total.toLocaleString('es-ES')}</td>
                                        <td>${d.count}</td>
                                        <td>${(d.total / d.count).toLocaleString('es-ES', { maximumFractionDigits: 2 })}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>`;
                }

            } else {
                 // Si no hay datos para este gráfico, mostrar mensaje
                chartCanvas.getContext('2d').clearRect(0, 0, chartCanvas.width, chartCanvas.height); // Limpiar canvas
                 if(summaryTableContainer) summaryTableContainer.innerHTML = '';
                 // Podríamos poner un mensaje tipo "No hay datos para mostrar para este campo con los filtros aplicados"
                 // Por ahora, se mostrará vacío.
            }
        });
    };

    // --- Funciones Públicas ---
    return {
        showSection,
        renderAdminSection,
        renderEntitiesList,
        renderFieldsList,
        loadSettingsForm,
        showEntityFormModal,
        showFieldFormModal,
        showManageFieldsModal,
        showConfirmDeleteModal,
        renderRegisterSection,
        renderDynamicFormFields,
        clearRegisterForm,
        renderLastRegistrations,
        renderReportsSection,
        renderReportTable,
        renderComparisonCharts,
        hideModal: () => mainModal.hide() // Para cerrar el modal desde otros módulos
    };
})();   