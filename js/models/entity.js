/**
 * Modelo para la gestión de entidades principales
 */
const EntityModel = {
    /**
     * Obtiene todas las entidades
     * @returns {Promise<Array>} Promesa que se resuelve con la lista de entidades
     */
    async getAll() {
        await StorageService.initializeStorage();
        return StorageService.getAllFromStore('entities');
    },
    
    /**
     * Obtiene una entidad por su ID
     * @param {string} id ID de la entidad
     * @returns {Promise<Object|null>} Promesa que se resuelve con la entidad encontrada o null
     */
    async getById(id) {
        await StorageService.initializeStorage();
        const entity = await StorageService.getFromStore('entities', id);
        return entity || null;
    },
    
    /**
     * Crea una nueva entidad
     * @param {string} name Nombre de la entidad
     * @returns {Promise<Object>} Promesa que se resuelve con la entidad creada
     */
    async create(name) {
        await StorageService.initializeStorage();
        const newEntity = {
            id: 'entity_' + Date.now(),
            name: name,
            fields: [] // IDs de campos asignados
        };
        
        return StorageService.saveToStore('entities', newEntity);
    },
    
    /**
     * Actualiza una entidad existente
     * @param {string} id ID de la entidad
     * @param {string} name Nuevo nombre
     * @returns {Promise<Object|null>} Promesa que se resuelve con la entidad actualizada o null
     */
    async update(id, name) {
        await StorageService.initializeStorage();
        const entity = await this.getById(id);
        
        if (!entity) return null;
        
        entity.name = name;
        return StorageService.saveToStore('entities', entity);
    },
    
    /**
     * Elimina una entidad
     * @param {string} id ID de la entidad
     * @returns {Promise<boolean>} Promesa que se resuelve con true si se eliminó correctamente
     */
    async delete(id) {
        await StorageService.initializeStorage();
        
        // Eliminar la entidad
        await StorageService.deleteFromStore('entities', id);
        
        // Eliminar registros asociados
        const records = await RecordModel.getAll();
        const recordsToDelete = records.filter(record => record.entityId === id);
        
        for (const record of recordsToDelete) {
            await StorageService.deleteFromStore('records', record.id);
        }
        
        return true;
    },
    
    /**
     * Asigna campos a una entidad
     * @param {string} entityId ID de la entidad
     * @param {Array} fieldIds IDs de los campos a asignar
     * @returns {Promise<Object|null>} Promesa que se resuelve con la entidad actualizada o null
     */
    async assignFields(entityId, fieldIds) {
        await StorageService.initializeStorage();
        const entity = await this.getById(entityId);
        
        if (!entity) return null;
        
        entity.fields = fieldIds;
        return StorageService.saveToStore('entities', entity);
    }
};