// js/admin.js
(function() {
    const adminSection = document.getElementById('admin-section');

    function initAdmin() {
        // Event listeners específicos de la sección admin (usando delegación)
        adminSection.addEventListener('click', handleAdminClicks);
        adminSection.addEventListener('submit', handleAdminSubmits);
    }

    function handleAdminClicks(event) {
        const target = event.target;
        const action = target.dataset.action;

        if (target.id === 'add-entity-btn') {
            UI.showEntityFormModal();
        } else if (target.id === 'add-field-btn') {
            UI.showFieldFormModal();
        } else if (action === 'edit-entity') {
            const entityId = target.dataset.entityId;
            const entity = Storage.getEntityById(entityId);
            if (entity) UI.showEntityFormModal(entity);
        } else if (action === 'delete-entity') {
            const entityId = target.dataset.entityId;
            const entity = Storage.getEntityById(entityId);
            if (entity) {
                UI.showConfirmDeleteModal(`¿Seguro que quieres eliminar la entidad "${entity.name}"? Esto NO eliminará los registros ya existentes asociados a ella.`, () => {
                    Storage.deleteEntity(entityId);
                    UI.renderEntitiesList(); // Actualizar UI
                    // Si la sección de registro está visible y usaba esta entidad, refrescarla
                    Register.refreshIfNeeded();
                     // Refrescar reportes si es necesario (filtros, etc.)
                    Reports.refreshIfNeeded();
                });
            }
        } else if (action === 'delete-field') {
            const fieldId = target.dataset.fieldId;
            const field = Storage.getFieldById(fieldId);
             if (field) {
                UI.showConfirmDeleteModal(`¿Seguro que quieres eliminar el campo "${field.name}"? Se desasociará de todas las entidades.`, () => {
                    Storage.deleteField(fieldId);
                    UI.renderFieldsList(); // Actualizar UI lista de campos
                    UI.renderEntitiesList(); // Actualizar UI entidades (por si cambia asociación)
                     Register.refreshIfNeeded();
                     Reports.refreshIfNeeded();
                });
            }
        } else if (action === 'manage-fields') {
             const entityId = target.dataset.entityId;
             const entity = Storage.getEntityById(entityId);
             if (entity) UI.showManageFieldsModal(entity);
        }
    }

    function handleAdminSubmits(event) {
        event.preventDefault();
        const form = event.target;

        if (form.id === 'settings-form') {
            const title = form.querySelector('#settings-title').value.trim();
            const description = form.querySelector('#settings-description').value.trim();
            Storage.saveSettings({ title, description });
            alert('Configuración guardada.');
             // Si el registro está visible, actualizar título/descripción
            Register.refreshIfNeeded();

        } else if (form.id === 'entity-form') {
            const entityId = form.querySelector('#entity-id').value;
            const entityName = form.querySelector('#entity-name').value.trim();

            if(!entityName) {
                 form.querySelector('#entity-name').classList.add('is-invalid');
                 return;
            }
             form.querySelector('#entity-name').classList.remove('is-invalid');


            if (entityId) { // Editando
                const existingEntity = Storage.getEntityById(entityId);
                if (existingEntity) {
                     const updatedEntity = { ...existingEntity, name: entityName };
                     Storage.updateEntity(updatedEntity);
                }
            } else { // Creando
                const newEntity = {
                    id: Utils.generateUUID(),
                    name: entityName,
                    associatedFieldIds: [] // Inicialmente sin campos asociados
                };
                Storage.saveEntity(newEntity);
            }
            UI.renderEntitiesList();
            UI.hideModal();
            Register.refreshIfNeeded(); // Actualizar dropdown en registro
            Reports.refreshIfNeeded(); // Actualizar filtro en reportes
            return false; // Add this line
        } else if (form.id === 'field-form') {
            const name = form.querySelector('#field-name').value.trim();
            const type = form.querySelector('#field-type').value;
            const optionsInput = form.querySelector('#field-options');
            const optionsRaw = optionsInput.value.trim();
            const required = form.querySelector('#field-required').checked;
            let options = null;

            let isValid = true;
            if(!name) {
                form.querySelector('#field-name').classList.add('is-invalid');
                isValid = false;
            } else form.querySelector('#field-name').classList.remove('is-invalid');

            if(!type) {
                 form.querySelector('#field-type').classList.add('is-invalid');
                 isValid = false;
            } else form.querySelector('#field-type').classList.remove('is-invalid');


            if (type === 'Selección') {
                options = optionsRaw.split(',').map(opt => opt.trim()).filter(opt => opt !== '');
                if (options.length < 2) { // Requerir al menos 2 opciones
                     optionsInput.classList.add('is-invalid');
                     isValid = false;
                } else {
                     optionsInput.classList.remove('is-invalid');
                }
            } else {
                optionsInput.classList.remove('is-invalid'); // Limpiar por si acaso
            }

            if (!isValid) return;

            // Verificar si ya existe un campo con ese nombre (case-insensitive)
             const existingFields = Storage.getFields();
             if (existingFields.some(f => f.name.toLowerCase() === name.toLowerCase())) {
                 alert(`Error: Ya existe un campo con el nombre "${name}". Los nombres deben ser únicos.`);
                 form.querySelector('#field-name').classList.add('is-invalid');
                 return;
             }


            const newField = {
                id: Utils.generateUUID(),
                name: name,
                type: type,
                options: options,
                required: required
            };
            Storage.saveField(newField);
            UI.renderFieldsList();
            UI.hideModal();
             Reports.refreshIfNeeded(); // Nuevos campos podrían ser comparables

        } else if (form.id === 'manage-fields-form') {
            const entityId = form.querySelector('#manage-entity-id').value;
            const selectedFieldIds = Array.from(form.querySelectorAll('input[type="checkbox"]:checked')).map(input => input.value);

            const entity = Storage.getEntityById(entityId);
            if (entity) {
                const updatedEntity = { ...entity, associatedFieldIds: selectedFieldIds };
                Storage.updateEntity(updatedEntity);
            }
            UI.hideModal();
            Register.refreshIfNeeded(); // Si la entidad editada estaba seleccionada
        }
        return false; // Add this line
    }

    // Exponer función de inicialización
    window.Admin = {
        init: initAdmin
    };
})();
