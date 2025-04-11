/**
 * Utilidades para validación de formularios
 */
const ValidationUtils = {
    /**
     * Valida un formulario personalizado
     * @param {HTMLFormElement} form Elemento del formulario
     * @param {Array} fields Campos personalizados para validar
     * @returns {Object} Resultado de la validación { isValid, data }
     */
    validateForm(form, fields = []) {
        let isValid = true;
        const data = {};
        
        // Reset de errores previos
        form.querySelectorAll('.is-invalid').forEach(el => {
            el.classList.remove('is-invalid');
        });
        
        // Validación básica de HTML5
        if (!form.checkValidity()) {
            form.querySelectorAll(':invalid').forEach(el => {
                el.classList.add('is-invalid');
            });
            isValid = false;
        }
        
        // Recolectar datos válidos
        if (isValid) {
            // Para cada campo en el formulario
            fields.forEach(field => {
                const input = form.querySelector(`[name="${field.id}"]`);
                if (!input) return;
                
                let value = input.value.trim();
                
                // Validación específica según tipo
                if (field.type === 'number') {
                    if (value === '') {
                        value = null;
                    } else {
                        value = parseFloat(value);
                        if (isNaN(value)) {
                            input.classList.add('is-invalid');
                            isValid = false;
                            return;
                        }
                    }
                }
                
                // Validar campo requerido
                if (field.required && (value === '' || value === null)) {
                    input.classList.add('is-invalid');
                    isValid = false;
                    return;
                }
                
                // Guardar valor
                data[field.id] = value;
            });
        }
        
        return { isValid, data };
    },
    
    /**
     * Valida datos de importación
     * @param {Object} data Datos importados
     * @returns {boolean} Validez de los datos
     */
    validateImportData(data) {
        // Verificar estructura básica
        if (!data || typeof data !== 'object') return false;
        if (!data.config || !data.entities || !data.fields || !data.records) return false;
        
        // Verificar que config tiene los campos correctos
        if (typeof data.config.title !== 'string' || typeof data.config.description !== 'string') {
            return false;
        }
        
        // Verificar que entities, fields y records son arrays
        if (!Array.isArray(data.entities) || !Array.isArray(data.fields) || !Array.isArray(data.records)) {
            return false;
        }
        
        // Validar estructura de cada entidad
        for (const entity of data.entities) {
            if (!entity.id || !entity.name || !Array.isArray(entity.fields)) {
                return false;
            }
        }
        
        // Validar estructura de cada campo
        for (const field of data.fields) {
            if (!field.id || !field.name || !field.type) {
                return false;
            }
            
            if (field.type === 'select' && !Array.isArray(field.options)) {
                return false;
            }
        }
        
        // Validar estructura de cada registro
        for (const record of data.records) {
            if (!record.id || !record.entityId || !record.timestamp || !record.data) {
                return false;
            }
            
            if (typeof record.data !== 'object') {
                return false;
            }
        }
        
        return true;
    }
};