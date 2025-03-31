/**
 * Modelo para la gestión de campos personalizados
 */
const FieldModel = {
    /**
     * Obtiene todos los campos
     * @returns {Promise<Array>} Promesa que se resuelve con la lista de campos
     */
    async getAll() {
        await StorageService.initializeStorage();
        return StorageService.getAllFromStore('fields');
    },
    
    /**
     * Obtiene un campo por su ID
     * @param {string} id ID del campo
     * @returns {Promise<Object|null>} Promesa que se resuelve con el campo encontrado o null
     */
    async getById(id) {
        await StorageService.initializeStorage();
        const field = await StorageService.getFromStore('fields', id);
        return field || null;
    },
    
    /**
     * Obtiene campos por IDs
     * @param {Array} ids Lista de IDs de campos
     * @returns {Promise<Array>} Promesa que se resuelve con la lista de campos encontrados
     */
    async getByIds(ids) {
        await StorageService.initializeStorage();
        const fields = await this.getAll();
        return fields.filter(field => ids.includes(field.id));
    },
    
    /**
     * Crea un nuevo campo
     * @param {Object} fieldData Datos del campo
     * @returns {Promise<Object>} Promesa que se resuelve con el campo creado
     */
    async create(fieldData) {
        await StorageService.initializeStorage();
        const newField = {
            id: 'field_' + Date.now(),
            name: fieldData.name,
            type: fieldData.type,
            required: !!fieldData.required,
            options: fieldData.type === 'select' ? (fieldData.options || []) : []
        };
        
        return StorageService.saveToStore('fields', newField);
    },
    
    /**
     * Actualiza un campo existente
     * @param {string} id ID del campo
     * @param {Object} fieldData Nuevos datos del campo
     * @returns {Promise<Object|null>} Promesa que se resuelve con el campo actualizado o null
     */
    async update(id, fieldData) {
        await StorageService.initializeStorage();
        const field = await this.getById(id);
        
        if (!field) return null;
        
        field.name = fieldData.name;
        field.type = fieldData.type;
        field.required = !!fieldData.required;
        field.options = fieldData.type === 'select' ? (fieldData.options || []) : [];
        
        return StorageService.saveToStore('fields', field);
    },
    
    /**
     * Elimina un campo
     * @param {string} id ID del campo
     * @returns {Promise<boolean>} Promesa que se resuelve con true si se eliminó correctamente
     */
    async delete(id) {
        await StorageService.initializeStorage();
        
        // Eliminar el campo
        await StorageService.deleteFromStore('fields', id);
        
        // Eliminar el campo de todas las entidades que lo tengan asignado
        const entities = await EntityModel.getAll();
        for (const entity of entities) {
            if (entity.fields.includes(id)) {
                entity.fields = entity.fields.filter(fieldId => fieldId !== id);
                await StorageService.saveToStore('entities', entity);
            }
        }
        
        return true;
    },
    
    /**
     * Obtiene los campos numéricos compartidos entre entidades
     * @returns {Promise<Array>} Promesa que se resuelve con la lista de campos numéricos compartidos
     */
    async getSharedNumericFields() {
        await StorageService.initializeStorage();
        const fields = await this.getAll();
        const numericFields = fields.filter(field => field.type === 'number');
        
        const entities = await EntityModel.getAll();
        const fieldUsage = {};
        
        // Contar las entidades que usan cada campo
        entities.forEach(entity => {
            entity.fields.forEach(fieldId => {
                if (!fieldUsage[fieldId]) {
                    fieldUsage[fieldId] = 0;
                }
                fieldUsage[fieldId]++;
            });
        });
        
        // Filtrar campos numéricos que están en más de una entidad
        return numericFields.filter(field => (fieldUsage[field.id] || 0) > 1);
    }
};