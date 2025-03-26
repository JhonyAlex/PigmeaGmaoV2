document.addEventListener('DOMContentLoaded', () => {
    // --- VARIABLES GLOBALES Y ESTADO ---
    let config = {
        systemTitle: "Sistema de Registro de Producción",
        systemDescription: "Registre aquí la producción diaria.",
        entityTypeName: "Máquina", // Nombre configurable para la entidad principal
        // entityTypeNamePlural: "Máquinas" // Podríamos añadir pluralización automática o manual
    };
    let availableFields = []; // { id: 'field_123', name: 'Total Metros', type: 'number', options: [] }
    let entities = []; // { id: 'entity_456', name: 'Torno CNC 1', fields: [{ fieldId: 'field_123', required: true }] }
    let productionLogs = []; // { id: 'log_789', entityId: 'entity_456', timestamp: 1678886400000, data: { field_123: 150.5 } }

    let currentChart = null; // Referencia al gráfico actual de Chart.js

    // --- ELEMENTOS DEL DOM ---
    // Generales
    const appTitle = document.getElementById('appTitle');
    const navAppTitle = document.getElementById('navAppTitle');
    const mainTitle = document.getElementById('mainTitle');
    const mainDescription = document.getElementById('mainDescription');
    const liveClock = document.getElementById('liveClock');
    const currentLogTime = document.getElementById('currentLogTime');
    const entitySelector = document.getElementById('entitySelector');
    const entitySelectorLabel = document.getElementById('entitySelectorLabel');
    const dynamicFieldsContainer = document.getElementById('dynamicFieldsContainer');
    const logForm = document.getElementById('logForm');
    const recentLogsContainer = document.getElementById('recentLogsContainer');
    const noRecentLogs = document.getElementById('noRecentLogs');
    const exportDataBtn = document.getElementById('exportDataBtn');
    const importDataInput = document.getElementById('importDataInput');
    const toastElement = document.getElementById('liveToast');
    const toastTitle = document.getElementById('toastTitle');
    const toastBody = document.getElementById('toastBody');
    const bsToast = new bootstrap.Toast(toastElement, { delay: 3000 });

    // Administración
    const adminModal = document.getElementById('adminModal');
    const adminSystemTitle = document.getElementById('adminSystemTitle');
    const adminSystemDesc = document.getElementById('adminSystemDesc');
    const adminEntityName = document.getElementById('adminEntityName');
    const saveGeneralSettingsBtn = document.getElementById('saveGeneralSettingsBtn');
    const addFieldForm = document.getElementById('addFieldForm');
    const newFieldName = document.getElementById('newFieldName');
    const newFieldType = document.getElementById('newFieldType');
    const newFieldOptionsContainer = document.getElementById('newFieldOptionsContainer');
    const newFieldOptions = document.getElementById('newFieldOptions');
    const availableFieldsList = document.getElementById('availableFieldsList');
    const addEntityForm = document.getElementById('addEntityForm');
    const entityListTitle = document.getElementById('entityListTitle');
    const newEntityName = document.getElementById('newEntityName');
    const entitiesList = document.getElementById('entitiesList');
    const entityTypeLabels = document.querySelectorAll('.entity-type-label'); // Para actualizar etiquetas dinámicamente

    // Modal Configuración Entidad
    const configureEntityModal = document.getElementById('configureEntityModal');
    const configureEntityModalLabel = document.getElementById('configureEntityModalLabel');
    const configureEntityName = document.getElementById('configureEntityName');
    const configEntityIdHidden = document.getElementById('configEntityIdHidden');
    const addFieldToEntitySelector = document.getElementById('addFieldToEntitySelector');
    const addFieldToEntityBtn = document.getElementById('addFieldToEntityBtn');
    const assignedFieldsList = document.getElementById('assignedFieldsList');
    const bsConfigureEntityModal = new bootstrap.Modal(configureEntityModal);

    // Reportes
    const reportEntityName = document.getElementById('reportEntityName');
    const reportFieldSelector = document.getElementById('reportFieldSelector');
    const reportTypeSelector = document.getElementById('reportTypeSelector');
    const generateReportBtn = document.getElementById('generateReportBtn');
    const productionChartCtx = document.getElementById('productionChart').getContext('2d');
    const reportSummary = document.getElementById('reportSummary');

    // --- FUNCIONES AUXILIARES ---

    // Genera IDs únicos simples
    const generateId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Muestra notificaciones Toast
    const showToast = (message, title = "Notificación", type = "info") => {
        toastTitle.textContent = title;
        toastBody.textContent = message;
        // Opcional: Cambiar color según tipo
        toastElement.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'bg-info');
        if (type === 'success') toastElement.classList.add('bg-success', 'text-white');
        else if (type === 'error') toastElement.classList.add('bg-danger', 'text-white');
        else if (type === 'warning') toastElement.classList.add('bg-warning', 'text-dark');
        else toastElement.classList.add('bg-light', 'text-dark'); // default info

        bsToast.show();
    };

    // Guarda todo el estado en localStorage
    const saveData = () => {
        try {
            const dataToSave = { config, availableFields, entities, productionLogs };
            localStorage.setItem('productionAppData', JSON.stringify(dataToSave));
            console.log("Datos guardados en localStorage.");
        } catch (error) {
            console.error("Error al guardar en localStorage:", error);
            showToast("Error al guardar datos. Posiblemente el almacenamiento está lleno.", "Error", "error");
        }
    };

    // Carga los datos desde localStorage
    const loadData = () => {
        const savedData = localStorage.getItem('productionAppData');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                config = parsedData.config || config;
                availableFields = parsedData.availableFields || [];
                entities = parsedData.entities || [];
                productionLogs = parsedData.productionLogs || [];
                console.log("Datos cargados desde localStorage.");
            } catch (error) {
                console.error("Error al parsear datos de localStorage:", error);
                showToast("Error al cargar datos guardados. Se usarán valores por defecto.", "Error", "error");
                // Opcional: Limpiar localStorage si está corrupto
                // localStorage.removeItem('productionAppData');
            }
        }
        // Asegurarse de que las estructuras básicas existan si no se cargaron
        config = config || { systemTitle: "Sistema de Registro", systemDescription: "Registre producción.", entityTypeName: "Elemento" };
        availableFields = Array.isArray(availableFields) ? availableFields : [];
        entities = Array.isArray(entities) ? entities : [];
        productionLogs = Array.isArray(productionLogs) ? productionLogs : [];
    };

    // Obtiene el nombre de un campo por su ID
    const getFieldName = (fieldId) => availableFields.find(f => f.id === fieldId)?.name || 'Campo Desconocido';
    // Obtiene el nombre de una entidad por su ID
    const getEntityName = (entityId) => entities.find(e => e.id === entityId)?.name || 'Entidad Desconocida';


    // --- FUNCIONES DE RENDERIZADO (Actualización de UI en tiempo real) ---

    // Actualiza títulos, descripciones y etiquetas basadas en 'config'
    const renderGlobalConfig = () => {
        appTitle.textContent = config.systemTitle;
        navAppTitle.textContent = config.systemTitle.substring(0, 20); // Acortar para navbar
        mainTitle.textContent = config.systemTitle;
        mainDescription.textContent = config.systemDescription;
        entitySelectorLabel.textContent = `Seleccionar ${config.entityTypeName}:`;
        entityListTitle.textContent = `Gestión de ${config.entityTypeName}s`; // Simple pluralización añadiendo 's'
        reportEntityName.textContent = config.entityTypeName;

        // Actualizar todas las etiquetas dinámicas
        entityTypeLabels.forEach(label => label.textContent = config.entityTypeName);

        // Actualizar valores en el modal de admin
        adminSystemTitle.value = config.systemTitle;
        adminSystemDesc.value = config.systemDescription;
        adminEntityName.value = config.entityTypeName;
    };

    // Renderiza la lista de campos disponibles en Admin
    const renderAvailableFields = () => {
        availableFieldsList.innerHTML = ''; // Limpiar lista
        if (availableFields.length === 0) {
            availableFieldsList.innerHTML = '<li class="list-group-item text-muted">No hay campos definidos.</li>';
            return;
        }
        availableFields.forEach(field => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                <span>${field.name} (${field.type}${field.type === 'select' ? ` [${(field.options || []).join(', ')}]` : ''})</span>
                <button class="btn btn-sm btn-danger delete-field-btn" data-field-id="${field.id}">Eliminar</button>
            `;
            availableFieldsList.appendChild(li);
        });

        // Actualizar selector de campos en reportes
        renderReportFieldSelector();
    };

     // Renderiza la lista de entidades (máquinas) en Admin y el selector principal
    const renderEntities = () => {
        entitiesList.innerHTML = '';
        entitySelector.innerHTML = '<option value="" selected disabled>-- Elija una opción --</option>'; // Resetear selector

        if (entities.length === 0) {
            entitiesList.innerHTML = `<li class="list-group-item text-muted">No hay ${config.entityTypeName}s definidos.</li>`;
        } else {
            entities.forEach(entity => {
                // Añadir a lista en Admin
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center';
                li.dataset.entityId = entity.id; // Guardar ID en el elemento
                li.innerHTML = `
                    <span>${entity.name}</span>
                    <div>
                        <button class="btn btn-sm btn-warning me-2 configure-entity-btn" data-entity-id="${entity.id}">Configurar Campos</button>
                        <button class="btn btn-sm btn-danger delete-entity-btn" data-entity-id="${entity.id}">Eliminar</button>
                    </div>
                `;
                entitiesList.appendChild(li);

                // Añadir a selector principal
                const option = document.createElement('option');
                option.value = entity.id;
                option.textContent = entity.name;
                entitySelector.appendChild(option);
            });
        }
         // Resetear formulario si no hay entidades
         if (entities.length === 0) {
            renderLogForm(); // Limpiará el formulario
         }
    };

    // Renderiza los campos dinámicos en el formulario de registro según la entidad seleccionada
    const renderLogForm = () => {
        dynamicFieldsContainer.innerHTML = ''; // Limpiar campos anteriores
        const selectedEntityId = entitySelector.value;

        if (!selectedEntityId) {
            // No hay entidad seleccionada, no mostrar campos
            return;
        }

        const entity = entities.find(e => e.id === selectedEntityId);
        if (!entity || !entity.fields || entity.fields.length === 0) {
             dynamicFieldsContainer.innerHTML = `<p class="text-muted">Esta ${config.entityTypeName} no tiene campos configurados.</p>`;
            return;
        }

        // Ordenar campos (si tuviéramos un campo de orden) o simplemente por cómo están
        entity.fields.forEach(entityField => {
            const fieldDefinition = availableFields.find(f => f.id === entityField.fieldId);
            if (!fieldDefinition) return; // Campo no encontrado (debería limpiarse?)

            const fieldId = `logfield_${entity.id}_${fieldDefinition.id}`; // ID único para el input
            const isRequired = entityField.required;

            const div = document.createElement('div');
            div.className = 'mb-3';

            let labelHtml = `<label for="${fieldId}" class="form-label">${fieldDefinition.name}${isRequired ? '<span class="required-label"></span>' : ''}</label>`;
            let inputHtml = '';

            switch (fieldDefinition.type) {
                case 'number':
                    inputHtml = `<input type="number" step="any" class="form-control" id="${fieldId}" data-field-id="${fieldDefinition.id}" ${isRequired ? 'required' : ''}>`;
                    break;
                case 'select':
                    const optionsHtml = (fieldDefinition.options || [])
                        .map(opt => `<option value="${opt}">${opt}</option>`)
                        .join('');
                    inputHtml = `
                        <select class="form-select" id="${fieldId}" data-field-id="${fieldDefinition.id}" ${isRequired ? 'required' : ''}>
                            <option value="" selected disabled>-- Seleccione --</option>
                            ${optionsHtml}
                        </select>`;
                    break;
                case 'text':
                default:
                    inputHtml = `<input type="text" class="form-control" id="${fieldId}" data-field-id="${fieldDefinition.id}" ${isRequired ? 'required' : ''}>`;
                    break;
            }

            div.innerHTML = labelHtml + inputHtml;
            dynamicFieldsContainer.appendChild(div);
        });
    };

    // Renderiza la lista de últimos registros
    const renderRecentLogs = (limit = 10) => {
        recentLogsContainer.innerHTML = ''; // Limpiar
        if (productionLogs.length === 0) {
            noRecentLogs.style.display = 'block';
            return;
        }

        noRecentLogs.style.display = 'none';
        // Mostrar los últimos 'limit' registros, más recientes primero
        const recent = [...productionLogs].reverse().slice(0, limit);

        recent.forEach(log => {
            const logTime = new Date(log.timestamp).toLocaleString('es-ES');
            const entityName = getEntityName(log.entityId);
            let dataDetails = Object.entries(log.data)
                .map(([fieldId, value]) => `<strong>${getFieldName(fieldId)}:</strong> ${value}`)
                .join('; ');

            const div = document.createElement('div');
            div.className = 'list-group-item list-group-item-action flex-column align-items-start';
            // Añadimos botón de eliminar al registro
            div.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${entityName}</h6>
                    <small class="text-muted">${logTime}</small>
                </div>
                <p class="mb-1 small">${dataDetails}</p>
                <button class="btn btn-sm btn-outline-danger float-end delete-log-btn" data-log-id="${log.id}">Eliminar</button>
            `;
            recentLogsContainer.appendChild(div);
        });
    };

     // Renderiza el selector de campos numéricos para el reporte
     const renderReportFieldSelector = () => {
        reportFieldSelector.innerHTML = '<option value="" selected disabled>-- Seleccione un campo --</option>';
        const numericFields = availableFields.filter(f => f.type === 'number');
        numericFields.forEach(field => {
            const option = document.createElement('option');
            option.value = field.id;
            option.textContent = field.name;
            reportFieldSelector.appendChild(option);
        });
    };

    // Genera y muestra el gráfico de producción
    const renderProductionChart = () => {
        const selectedFieldId = reportFieldSelector.value;
        const selectedChartType = reportTypeSelector.value || 'bar';

        if (!selectedFieldId) {
            // Limpiar gráfico si no hay campo seleccionado
            if (currentChart) {
                currentChart.destroy();
                currentChart = null;
            }
             reportSummary.innerHTML = ''; // Limpiar resumen
            productionChartCtx.clearRect(0, 0, productionChartCtx.canvas.width, productionChartCtx.canvas.height); // Limpiar canvas
            showToast("Seleccione un campo numérico para generar el reporte.", "Información", "info");
            return;
        }

        const fieldName = getFieldName(selectedFieldId);
        const reportData = {}; // { entityId: totalValue }
        let grandTotal = 0;

        productionLogs.forEach(log => {
            if (log.data && log.data[selectedFieldId] !== undefined && log.data[selectedFieldId] !== null && log.data[selectedFieldId] !== '') {
                const value = parseFloat(log.data[selectedFieldId]);
                if (!isNaN(value)) {
                    if (!reportData[log.entityId]) {
                        reportData[log.entityId] = 0;
                    }
                    reportData[log.entityId] += value;
                    grandTotal += value;
                }
            }
        });

        const labels = [];
        const dataValues = [];
        const backgroundColors = []; // Para pie/bar
        const borderColors = []; // Para line/bar

        // Colores base (puedes añadir más)
        const baseColors = [
            'rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(75, 192, 192, 0.6)',
            'rgba(255, 206, 86, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)',
             'rgba(199, 199, 199, 0.6)', 'rgba(83, 102, 255, 0.6)', 'rgba(100, 255, 100, 0.6)'
        ];
        const baseBorderColors = baseColors.map(color => color.replace('0.6', '1')); // Opacidad completa para bordes

        let colorIndex = 0;
        for (const entityId in reportData) {
            labels.push(getEntityName(entityId));
            dataValues.push(reportData[entityId]);
             backgroundColors.push(baseColors[colorIndex % baseColors.length]);
            borderColors.push(baseBorderColors[colorIndex % baseBorderColors.length]);
            colorIndex++;
        }

        if (currentChart) {
            currentChart.destroy(); // Destruir gráfico anterior si existe
        }

        try {
            currentChart = new Chart(productionChartCtx, {
                type: selectedChartType,
                data: {
                    labels: labels,
                    datasets: [{
                        label: `Total de ${fieldName} por ${config.entityTypeName}`,
                        data: dataValues,
                        backgroundColor: selectedChartType === 'line' ? 'transparent' : backgroundColors, // No rellenar en línea por defecto
                        borderColor: borderColors,
                        borderWidth: selectedChartType === 'line' ? 2 : 1, // Línea más gruesa
                        tension: selectedChartType === 'line' ? 0.1 : 0 // Curvatura para líneas
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false, // Ajustarse al contenedor
                    scales: (selectedChartType !== 'pie') ? { // Las escalas no aplican a 'pie'
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: fieldName }
                        },
                        x: {
                             title: { display: true, text: config.entityTypeName }
                        }
                    } : {},
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: `Comparativa de ${fieldName}`
                        }
                    }
                }
            });

            // Mostrar resumen (suma total)
            reportSummary.innerHTML = `<strong>Suma Total de ${fieldName}: ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>`;

        } catch (error) {
            console.error("Error al crear el gráfico:", error);
            showToast("Error al generar el gráfico.", "Error", "error");
             reportSummary.innerHTML = ''; // Limpiar resumen en caso de error
        }
    };

    // --- MANEJADORES DE EVENTOS ---

    // Actualizar reloj cada segundo
    setInterval(() => {
        const now = new Date();
        liveClock.textContent = now.toLocaleTimeString('es-ES');
        currentLogTime.textContent = `Hora actual: ${now.toLocaleTimeString('es-ES')}`;
    }, 1000);

    // Guardar Configuración General (Admin)
    saveGeneralSettingsBtn.addEventListener('click', () => {
        const oldEntityName = config.entityTypeName;
        config.systemTitle = adminSystemTitle.value.trim() || config.systemTitle;
        config.systemDescription = adminSystemDesc.value.trim() || config.systemDescription;
        config.entityTypeName = adminEntityName.value.trim() || config.entityTypeName;

        if (config.entityTypeName !== oldEntityName) {
             // Opcional: Preguntar confirmación si el nombre cambia, ya que afecta toda la UI
            console.log(`Nombre de entidad cambiado de "${oldEntityName}" a "${config.entityTypeName}"`);
        }

        saveData();
        renderGlobalConfig(); // Actualizar toda la UI relevante
        renderEntities(); // Nombres en la lista de entidades pueden necesitar actualizarse (ej. 'Agregar Máquina')
        showToast("Configuración general guardada.", "Éxito", "success");
    });

     // Mostrar/ocultar opciones de campo 'select' en Admin
    newFieldType.addEventListener('change', (e) => {
        if (e.target.value === 'select') {
            newFieldOptionsContainer.style.display = 'block';
            newFieldOptions.required = true;
        } else {
            newFieldOptionsContainer.style.display = 'none';
            newFieldOptions.required = false;
            newFieldOptions.value = ''; // Limpiar por si acaso
        }
    });

    // Agregar nuevo Campo (Admin)
    addFieldForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = newFieldName.value.trim();
        const type = newFieldType.value;
        let options = [];

        if (type === 'select') {
            options = newFieldOptions.value.split(',')
                         .map(opt => opt.trim())
                         .filter(opt => opt.length > 0);
            if (options.length === 0) {
                showToast("Debe ingresar al menos una opción válida para el tipo 'Selección'.", "Error", "error");
                return;
            }
        }

        // Validar que no exista un campo con el mismo nombre (sensible a mayúsculas/minúsculas)
        if (availableFields.some(f => f.name.toLowerCase() === name.toLowerCase())) {
             showToast(`Ya existe un campo llamado "${name}".`, "Error", "error");
             return;
        }

        const newField = {
            id: generateId('field'),
            name: name,
            type: type,
            options: type === 'select' ? options : [] // Guardar opciones solo si es select
        };

        availableFields.push(newField);
        saveData();
        renderAvailableFields(); // Actualizar lista UI
        addFieldForm.reset(); // Limpiar formulario
        newFieldOptionsContainer.style.display = 'none'; // Ocultar opciones de select
        showToast(`Campo "${name}" agregado.`, "Éxito", "success");
    });

     // Eliminar Campo (Admin - Delegación de eventos)
    availableFieldsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-field-btn')) {
            const fieldId = e.target.dataset.fieldId;
            const fieldName = getFieldName(fieldId);

            // *** IMPORTANTE: Validación de dependencias ***
            const isFieldInUse = entities.some(entity =>
                entity.fields && entity.fields.some(ef => ef.fieldId === fieldId)
            );

            if (isFieldInUse) {
                showToast(`El campo "${fieldName}" está siendo usado por una o más ${config.entityTypeName}s y no puede ser eliminado directamente. Primero quítelo de todas las configuraciones.`, "Error", "error");
                return;
            }

            // Confirmación
             if (confirm(`¿Está seguro de que desea eliminar el campo "${fieldName}"? Esta acción no se puede deshacer.`)) {
                availableFields = availableFields.filter(f => f.id !== fieldId);

                // Opcional: Limpiar datos huérfanos en logs (más complejo)
                // Por ahora, los datos permanecerán pero no se mostrarán bien si el campo se borra
                // productionLogs.forEach(log => {
                //     if (log.data && log.data[fieldId]) {
                //         delete log.data[fieldId];
                //     }
                // });

                saveData();
                renderAvailableFields();
                // Si el campo eliminado estaba en el modal de config, actualizarlo
                if (configureEntityModal.classList.contains('show')) {
                    const entityId = configEntityIdHidden.value;
                    renderConfigureEntityModal(entityId);
                }
                 showToast(`Campo "${fieldName}" eliminado.`, "Éxito", "success");
            }
        }
    });

    // Agregar nueva Entidad (Admin)
    addEntityForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = newEntityName.value.trim();

        // Validar que no exista una entidad con el mismo nombre
         if (entities.some(ent => ent.name.toLowerCase() === name.toLowerCase())) {
             showToast(`Ya existe ${config.entityTypeName === 'Máquina' ? 'una' : 'un'} ${config.entityTypeName} con el nombre "${name}".`, "Error", "error");
             return;
        }

        const newEntity = {
            id: generateId('entity'),
            name: name,
            fields: [] // Inicialmente sin campos asignados
        };

        entities.push(newEntity);
        saveData();
        renderEntities(); // Actualizar lista y selector
        addEntityForm.reset();
         showToast(`${config.entityTypeName} "${name}" agregada.`, "Éxito", "success");
    });

    // Eliminar Entidad (Admin - Delegación de eventos)
    entitiesList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-entity-btn')) {
            const entityId = e.target.dataset.entityId;
            const entityName = getEntityName(entityId);

            // Confirmación MUY IMPORTANTE: Eliminar una entidad borrará todos sus logs asociados
             if (confirm(`¡ADVERTENCIA!\n¿Está seguro de eliminar "${entityName}"?\n\nSe borrarán TODOS los registros de producción asociados a ${config.entityTypeName === 'Máquina' ? 'esta' : 'este'} ${config.entityTypeName}.\n\nEsta acción NO SE PUEDE DESHACER.`)) {
                entities = entities.filter(e => e.id !== entityId);
                // Eliminar logs asociados
                productionLogs = productionLogs.filter(log => log.entityId !== entityId);

                saveData();
                renderEntities();
                renderRecentLogs(); // Actualizar logs recientes
                renderLogForm(); // Resetear formulario si la entidad eliminada estaba seleccionada
                renderProductionChart(); // Actualizar gráfico
                showToast(`${config.entityTypeName} "${entityName}" y todos sus registros han sido eliminados.`, "Éxito", "success");
            }
        }

        // Abrir Modal Configurar Entidad
        if (e.target.classList.contains('configure-entity-btn')) {
             const entityId = e.target.dataset.entityId;
             renderConfigureEntityModal(entityId);
             bsConfigureEntityModal.show();
        }
    });

    // --- Lógica del Modal de Configuración de Campos por Entidad ---

    // Función para popular el modal de configuración
    const renderConfigureEntityModal = (entityId) => {
        const entity = entities.find(e => e.id === entityId);
        if (!entity) return;

        configureEntityName.textContent = entity.name;
        configEntityIdHidden.value = entityId; // Guardar ID para referencia

        // Llenar selector de campos disponibles (que NO estén ya asignados)
        addFieldToEntitySelector.innerHTML = '<option value="" selected disabled>-- Seleccione un campo --</option>';
        const assignedFieldIds = new Set((entity.fields || []).map(ef => ef.fieldId));
        availableFields.forEach(field => {
            if (!assignedFieldIds.has(field.id)) {
                const option = document.createElement('option');
                option.value = field.id;
                option.textContent = `${field.name} (${field.type})`;
                addFieldToEntitySelector.appendChild(option);
            }
        });
         // Deshabilitar botón si no hay campos para añadir
        addFieldToEntityBtn.disabled = addFieldToEntitySelector.options.length <= 1;


        // Llenar lista de campos asignados
        assignedFieldsList.innerHTML = '';
        if (!entity.fields || entity.fields.length === 0) {
            assignedFieldsList.innerHTML = `<li class="list-group-item text-muted">No hay campos asignados a esta ${config.entityTypeName}.</li>`;
            return;
        }

        entity.fields.forEach(entityField => {
            const fieldDefinition = availableFields.find(f => f.id === entityField.fieldId);
            if (!fieldDefinition) return; // Campo no encontrado

            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.dataset.fieldId = fieldDefinition.id; // Guardar fieldId en el LI

            const isChecked = entityField.required ? 'checked' : '';
            const uniqueCheckboxId = `req_${fieldDefinition.id}_${entityId}`;

            li.innerHTML = `
                <span>${fieldDefinition.name} (${fieldDefinition.type})</span>
                <div>
                    <div class="form-check form-check-inline">
                      <input class="form-check-input required-checkbox" type="checkbox" id="${uniqueCheckboxId}" data-field-id="${fieldDefinition.id}" ${isChecked}>
                      <label class="form-check-label small" for="${uniqueCheckboxId}">Obligatorio</label>
                    </div>
                    <button class="btn btn-sm btn-danger remove-field-from-entity-btn" data-field-id="${fieldDefinition.id}">Quitar</button>
                </div>
            `;
            assignedFieldsList.appendChild(li);
        });
    };

    // Añadir campo seleccionado a la entidad (Modal)
    addFieldToEntityBtn.addEventListener('click', () => {
        const entityId = configEntityIdHidden.value;
        const fieldIdToAdd = addFieldToEntitySelector.value;

        if (!entityId || !fieldIdToAdd) return;

        const entity = entities.find(e => e.id === entityId);
        if (!entity) return;

        // Asegurarse de que entity.fields exista
        if (!entity.fields) {
            entity.fields = [];
        }

        // Evitar duplicados (aunque el selector ya debería prevenirlo)
        if (!entity.fields.some(ef => ef.fieldId === fieldIdToAdd)) {
            entity.fields.push({ fieldId: fieldIdToAdd, required: false }); // Añadir como no obligatorio por defecto
            saveData();
            renderConfigureEntityModal(entityId); // Re-renderizar modal
             // Si el formulario de log está mostrando esta entidad, actualizarlo también
            if (entitySelector.value === entityId) {
                renderLogForm();
            }
            showToast("Campo añadido a la configuración.", "Éxito", "success");
        }
    });

    // Quitar campo o cambiar obligatoriedad (Modal - Delegación)
    assignedFieldsList.addEventListener('click', (e) => {
        const entityId = configEntityIdHidden.value;
        const entity = entities.find(ent => ent.id === entityId);
        if (!entity || !entity.fields) return;

        const fieldId = e.target.dataset.fieldId;
        if (!fieldId) return; // Clic en otro lugar

        // Botón Quitar
        if (e.target.classList.contains('remove-field-from-entity-btn')) {
             const fieldName = getFieldName(fieldId);
             if (confirm(`¿Quitar el campo "${fieldName}" de la configuración de "${entity.name}"?`)) {
                entity.fields = entity.fields.filter(ef => ef.fieldId !== fieldId);
                saveData();
                renderConfigureEntityModal(entityId); // Re-renderizar modal
                 // Si el formulario de log está mostrando esta entidad, actualizarlo también
                if (entitySelector.value === entityId) {
                    renderLogForm();
                }
                showToast(`Campo "${fieldName}" quitado de la configuración.`, "Éxito", "success");
            }
        }

        // Checkbox Obligatorio
        if (e.target.classList.contains('required-checkbox')) {
            const isRequired = e.target.checked;
            const entityField = entity.fields.find(ef => ef.fieldId === fieldId);
            if (entityField) {
                entityField.required = isRequired;
                saveData();
                // Re-renderizar solo la etiqueta de obligatorio en el formulario principal si es visible
                if (entitySelector.value === entityId) {
                   renderLogForm(); // Más fácil re-renderizar todo el form
                }
                 showToast(`Obligatoriedad del campo actualizada.`, "Éxito", "success");
                // No es necesario re-renderizar todo el modal, solo el checkbox ya cambió visualmente
            }
        }
    });

    // --- Lógica Principal de Registro ---

    // Cambiar entidad seleccionada en el formulario principal
    entitySelector.addEventListener('change', () => {
        renderLogForm(); // Renderizar los campos correspondientes
    });

    // Guardar Registro de Producción
    logForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const selectedEntityId = entitySelector.value;
        if (!selectedEntityId) {
             showToast("Por favor, seleccione primero una "+ config.entityTypeName + ".", "Error", "error");
             return;
        }

        const entity = entities.find(ent => ent.id === selectedEntityId);
        if (!entity) return; // No debería pasar si el selector está bien poblado

        const logData = {};
        let formIsValid = true;

        // Recoger datos de los campos dinámicos
        const inputFields = dynamicFieldsContainer.querySelectorAll('input, select');
        inputFields.forEach(input => {
            const fieldId = input.dataset.fieldId;
            if (fieldId) {
                const value = input.value.trim();
                 // Validación de obligatorios (HTML5 'required' ya ayuda, pero doble check)
                const entityFieldConf = entity.fields.find(ef => ef.fieldId === fieldId);
                if (entityFieldConf?.required && value === '') {
                    formIsValid = false;
                    // Podríamos marcar el campo inválido visualmente aquí si 'required' no es suficiente
                     input.classList.add('is-invalid'); // Bootstrap class
                } else {
                     input.classList.remove('is-invalid');
                }

                // Conversión a número si es necesario (y si hay valor)
                const fieldDef = availableFields.find(f => f.id === fieldId);
                if (fieldDef?.type === 'number' && value !== '') {
                    const numValue = parseFloat(value);
                    if (isNaN(numValue)) {
                        formIsValid = false;
                         input.classList.add('is-invalid');
                         showToast(`El valor para "${fieldDef.name}" debe ser un número válido.`, "Error", "error");
                    } else {
                        logData[fieldId] = numValue; // Guardar como número
                    }
                } else if (value !== '') { // Guardar solo si no está vacío (a menos que sea obligatorio)
                    logData[fieldId] = value;
                } else if (entityFieldConf?.required) {
                     logData[fieldId] = ''; // Guardar vacío si es obligatorio y se dejó vacío (debería haber sido bloqueado por 'required')
                }
                // No guardar campos opcionales vacíos
            }
        });

        if (!formIsValid) {
            showToast("Por favor, complete todos los campos obligatorios (*) correctamente.", "Error", "error");
            return;
        }

        // Crear el nuevo registro
        const newLog = {
            id: generateId('log'),
            entityId: selectedEntityId,
            timestamp: Date.now(), // Guardar como timestamp numérico
            data: logData
        };

        productionLogs.push(newLog);
        saveData();

        // Actualizar UI
        renderRecentLogs();
        renderProductionChart(); // El gráfico podría cambiar con nuevos datos

        // Limpiar formulario (manteniendo la entidad seleccionada)
        inputFields.forEach(input => {
             input.value = '';
             input.classList.remove('is-invalid');
             if(input.tagName === 'SELECT') input.selectedIndex = 0; // Resetear select
        });

        showToast("Registro de producción guardado.", "Éxito", "success");
    });

    // Eliminar Registro (Delegación de eventos)
    recentLogsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-log-btn')) {
            const logId = e.target.dataset.logId;
             if (confirm("¿Está seguro de eliminar este registro de producción?")) {
                productionLogs = productionLogs.filter(log => log.id !== logId);
                saveData();
                renderRecentLogs();
                renderProductionChart(); // Actualizar gráfico
                showToast("Registro eliminado.", "Éxito", "success");
            }
        }
    });

    // --- Exportar / Importar Datos ---

    exportDataBtn.addEventListener('click', () => {
        try {
            const dataStr = JSON.stringify({ config, availableFields, entities, productionLogs }, null, 2); // Pretty print JSON
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const timestamp = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
            a.href = url;
            a.download = `produccion_backup_${timestamp}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast("Datos exportados correctamente.", "Éxito", "success");
        } catch (error) {
             console.error("Error al exportar datos:", error);
             showToast("Error al exportar los datos.", "Error", "error");
        }
    });

    importDataInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!confirm("IMPORTANTE: Importar datos reemplazará TODA la configuración y registros actuales. ¿Desea continuar?")) {
            importDataInput.value = ''; // Resetear input file
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);

                // Validaciones básicas de la estructura importada
                if (typeof importedData !== 'object' || importedData === null ||
                    !importedData.hasOwnProperty('config') ||
                    !Array.isArray(importedData.availableFields) ||
                    !Array.isArray(importedData.entities) ||
                    !Array.isArray(importedData.productionLogs)) {
                    throw new Error("El archivo JSON no tiene la estructura esperada.");
                }

                // Reemplazar datos actuales con los importados
                config = importedData.config;
                availableFields = importedData.availableFields;
                entities = importedData.entities;
                productionLogs = importedData.productionLogs;

                saveData(); // Guardar los nuevos datos importados

                // Re-renderizar toda la aplicación
                renderGlobalConfig();
                renderAvailableFields();
                renderEntities();
                renderLogForm(); // Resetear formulario
                renderRecentLogs();
                renderProductionChart();

                showToast("Datos importados y aplicados correctamente.", "Éxito", "success");

            } catch (error) {
                console.error("Error al importar datos:", error);
                showToast(`Error al importar el archivo: ${error.message}`, "Error", "error");
            } finally {
                 importDataInput.value = ''; // Resetear input file siempre
            }
        };
        reader.onerror = () => {
            showToast("Error al leer el archivo seleccionado.", "Error", "error");
            importDataInput.value = ''; // Resetear input file
        };
        reader.readAsText(file);
    });


    // --- Reportes ---
    generateReportBtn.addEventListener('click', renderProductionChart);
    reportFieldSelector.addEventListener('change', renderProductionChart); // Opcional: actualizar al cambiar campo
    reportTypeSelector.addEventListener('change', renderProductionChart); // Actualizar al cambiar tipo


    // --- INICIALIZACIÓN ---
    const initApp = () => {
        loadData(); // Cargar datos primero
        renderGlobalConfig(); // Aplicar configuración general a la UI
        renderAvailableFields(); // Llenar lista de campos en admin
        renderEntities(); // Llenar lista de entidades en admin y selector principal
        renderLogForm(); // Renderizar formulario (inicialmente vacío o con la primera entidad si existe)
        renderRecentLogs(); // Mostrar logs guardados
        renderProductionChart(); // Intentar renderizar gráfico inicial (puede estar vacío)
        console.log("Aplicación inicializada.");
    };

    initApp(); // Ejecutar inicialización
});