/**
 * Modelo para la gestión de entidades principales
 */
const EntityModel = {
    /**
     * Obtiene todas las entidades
     * @returns {Array} Lista de entidades
     */
    getAll() {
        return StorageService.getData().entities;
    },
    
    /**
     * Obtiene una entidad por su ID
     * @param {string} id ID de la entidad
     * @returns {Object|null} Entidad encontrada o null
     */
    getById(id) {
        const entities = this.getAll();
        return entities.find(entity => entity.id === id) || null;
    },
    
    /**
     * Crea una nueva entidad
     * @param {string} name Nombre de la entidad
     * @returns {Object} Entidad creada
     */
    create(name) {
        const data = StorageService.getData();
        const newEntity = {
            id: 'entity_' + Date.now(),
            name: name,
            fields: [] // IDs de campos asignados
        };
        
        data.entities.push(newEntity);
        StorageService.saveData(data);
        
        return newEntity;
    },
    
    /**
     * Actualiza una entidad existente
     * @param {string} id ID de la entidad
     * @param {string} name Nuevo nombre
     * @returns {Object|null} Entidad actualizada o null
     */
    update(id, name) {
        const data = StorageService.getData();
        const entityIndex = data.entities.findIndex(entity => entity.id === id);
        
        if (entityIndex === -1) return null;
        
        data.entities[entityIndex].name = name;
        StorageService.saveData(data);
        
        return data.entities[entityIndex];
    },
    
    /**
     * Elimina una entidad
     * @param {string} id ID de la entidad
     * @returns {boolean} Éxito de la eliminación
     */
    delete(id) {
        const data = StorageService.getData();
        const initialLength = data.entities.length;
        
        data.entities = data.entities.filter(entity => entity.id !== id);
        
        // También eliminamos los registros asociados
        data.records = data.records.filter(record => record.entityId !== id);
        
        StorageService.saveData(data);
        
        return data.entities.length < initialLength;
    },
    
    /**
     * Asigna campos a una entidad
     * @param {string} entityId ID de la entidad
     * @param {Array} fieldIds IDs de los campos a asignar
     * @returns {Object|null} Entidad actualizada o null
     */
    assignFields(entityId, fieldIds) {
        const data = StorageService.getData();
        const entityIndex = data.entities.findIndex(entity => entity.id === entityId);
        
        if (entityIndex === -1) return null;
        
        data.entities[entityIndex].fields = fieldIds;
        StorageService.saveData(data);
        
        return data.entities[entityIndex];
    }
};