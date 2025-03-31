/**
 * Utilidades para la interfaz de usuario
 */
const UIUtils = {
    /**
     * Muestra un mensaje de alerta temporal
     * @param {string} message Mensaje a mostrar
     * @param {string} type Tipo de alerta ('success', 'danger', 'warning', 'info')
     * @param {HTMLElement} container Elemento donde mostrar la alerta
     */
    showAlert(message, type = 'info', container = document.body) {
        const alertId = 'alert-' + Date.now();
        const alertHTML = `
            <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        // Insertar al inicio del contenedor
        container.insertAdjacentHTML('afterbegin', alertHTML);
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            const alertElement = document.getElementById(alertId);
            if (alertElement) {
                const bsAlert = new bootstrap.Alert(alertElement);
                bsAlert.close();
            }
        }, 5000);
    },
    
    /**
     * Formatea una fecha ISO a una representación legible
     * @param {string} isoDate Fecha en formato ISO
     * @returns {string} Fecha formateada
     */
    formatDate(isoDate) {
        const date = new Date(isoDate);
        return date.toLocaleString();
    },
    
    /**
     * Inicializa un modal de Bootstrap
     * @param {string} modalId ID del modal
     * @returns {bootstrap.Modal} Instancia del modal
     */
    initModal(modalId) {
        const modalElement = document.getElementById(modalId);
        return new bootstrap.Modal(modalElement);
    },
    
    /**
     * Genera inputs dinámicos para un campo personalizado
     * @param {Object} field Definición del campo
     * @param {string} value Valor inicial (opcional)
     * @returns {string} HTML del campo
     */
    generateFieldInput(field, value = '') {
        const required = field.required ? 'required' : '';
        const requiredClass = field.required ? 'required-field' : '';
        let inputHTML = '';
        
        switch (field.type) {
            case 'text':
                inputHTML = `
                    <div class="mb-3 dynamic-field">
                        <label for="${field.id}" class="form-label ${requiredClass}">${field.name}</label>
                        <input type="text" class="form-control" id="${field.id}" name="${field.id}" value="${value}" ${required}>
                    </div>
                `;
                break;
                
            case 'number':
                inputHTML = `
                    <div class="mb-3 dynamic-field">
                        <label for="${field.id}" class="form-label ${requiredClass}">${field.name}</label>
                        <input type="number" class="form-control" id="${field.id}" name="${field.id}" value="${value}" step="any" ${required}>
                    </div>
                `;
                break;
                
            case 'select':
                const options = field.options.map(option => 
                    `<option value="${option}" ${option === value ? 'selected' : ''}>${option}</option>`
                ).join('');
                
                inputHTML = `
                    <div class="mb-3 dynamic-field">
                        <label for="${field.id}" class="form-label ${requiredClass}">${field.name}</label>
                        <select class="form-select" id="${field.id}" name="${field.id}" ${required}>
                            <option value="" ${value ? '' : 'selected'}>-- Seleccione --</option>
                            ${options}
                        </select>
                    </div>
                `;
                break;
        }
        
        return inputHTML;
    },
    
    /**
     * Agrega efecto de animación a un elemento recién creado
     * @param {HTMLElement} element Elemento a animar
     */
    highlightNewElement(element) {
        element.classList.add('highlight-new');
        setTimeout(() => {
            element.classList.remove('highlight-new');
        }, 2000);
    }
};