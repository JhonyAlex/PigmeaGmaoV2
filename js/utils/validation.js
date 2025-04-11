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
    
    async validateImportData(data) {
        try {
            if (!data || typeof data !== 'object' || !Array.isArray(data.entities) || !Array.isArray(data.fields)) {
                return { isValid: false, message: 'Invalid data format' };
            }
            for (const entity of data.entities) {
                if (!entity || typeof entity !== 'object' || !entity.name || !Array.isArray(entity.fields)) {
                    return { isValid: false, message: 'Invalid entity format' };
                }
            }
            for (const field of data.fields) {
                if (!field || typeof field !== 'object' || !field.name || !field.type || !field.entityId) {
                    return { isValid: false, message: 'Invalid field format' };
                }
            }
            return { isValid: true, message: 'Data is valid' };
        } catch (error) {
            console.error('Error during validation:', error);
            return { isValid: false, message: 'Error during validation' };
            }
        }
    }
};