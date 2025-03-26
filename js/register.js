// js/register.js
const Register = (() => {
    const registerSection = document.getElementById('register-section');
    let currentSelectedEntityId = null; // Para saber si refrescar

    function initRegister() {
        // Listeners específicos de registro
        registerSection.addEventListener('change', handleRegisterChange);
        registerSection.addEventListener('submit', handleRegisterSubmit);
        registerSection.addEventListener('click', handleRegisterClicks); // Para eliminar últimos registros
    }

    function handleRegisterChange(event) {
        if (event.target.id === 'entity-select') {
            currentSelectedEntityId = event.target.value;
            if (currentSelectedEntityId) {
                UI.renderDynamicFormFields(currentSelectedEntityId);
                 // Limpiar validaciones previas al cambiar entidad
                 const form = document.getElementById('register-form');
                 if (form) form.classList.remove('was-validated');
            } else {
                // Limpiar formulario si no se selecciona entidad
                document.getElementById('dynamic-form-fields').innerHTML = '<p class="text-muted">Seleccione una entidad para ver sus campos.</p>';
                 document.getElementById('save-registration-btn').disabled = true;
            }
        }
    }

    function handleRegisterSubmit(event) {
         const form = event.target;
         if (form.id === 'register-form') {
             event.preventDefault();

             // Aplicar validación de Bootstrap
             if (!form.checkValidity()) {
                event.stopPropagation();
                form.classList.add('was-validated');
                return;
             }
             form.classList.add('was-validated'); // Mostrar feedback visual aunque sea válido

             const entityId = form.querySelector('#entity-select').value;
             const formDataElements = form.querySelectorAll('#dynamic-form-fields [name]');
             const registrationData = {};

             formDataElements.forEach(input => {
                 // Usar input.name que ya contiene el nombre del campo escapado
                 registrationData[input.name] = input.value;
             });

             const newRegistration = {
                 id: Utils.generateUUID(),
                 entityId: entityId,
                 timestamp: new Date().toISOString(),
                 data: registrationData
             };

             Storage.saveRegistration(newRegistration);
             UI.renderLastRegistrations(); // Actualizar UI de últimos registros
             UI.clearRegisterForm(); // Limpiar y resetear el formulario
             currentSelectedEntityId = null; // Resetear entidad seleccionada

             // Opcional: Mostrar un mensaje de éxito temporal
             // alert('Registro guardado con éxito!');
         }
    }

     function handleRegisterClicks(event) {
        const target = event.target;
        if (target.dataset.action === 'delete-registration') {
            const regId = target.dataset.regId;
             UI.showConfirmDeleteModal('¿Seguro que quieres eliminar este registro?', () => {
                 Storage.deleteRegistration(regId);
                 UI.renderLastRegistrations(); // Actualizar la lista
                  Reports.refreshIfNeeded(); // Los reportes pueden cambiar
             });
        }
    }

    // Función para refrescar la sección si es necesario (ej. tras cambios en admin)
    function refreshIfNeeded() {
         // Verificar si la sección de registro está activa
        if (!registerSection.classList.contains('d-none')) {
             // Volver a renderizar toda la sección para reflejar cambios en entidades o settings
             UI.renderRegisterSection();
             // Si había una entidad seleccionada, intentar restaurarla y renderizar su form
             if(currentSelectedEntityId) {
                 const entitySelect = document.getElementById('entity-select');
                 if(entitySelect) {
                      entitySelect.value = currentSelectedEntityId;
                      // Verificar si la entidad aún existe
                      if (entitySelect.value === currentSelectedEntityId) {
                           UI.renderDynamicFormFields(currentSelectedEntityId);
                      } else {
                           // La entidad fue eliminada, resetear
                           currentSelectedEntityId = null;
                           UI.clearRegisterForm();
                      }
                 }
             }
        }
    }

    return {
        init: initRegister,
        refreshIfNeeded
    };
})();