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
        const entity = entities.find(entity => entity.id === id) || null;
        
        // Asegurar formato de campos compatible
        if (entity) {
            // Normalizar campos (convertir objetos o strings a objetos)
            entity.fields = entity.fields.map((field, index) => {
                if (typeof field === 'string') {
                    return {
                        id: field,
                        order: index
                    };
                }
                return field;
            });
            
            // Ordenar campos por la propiedad order
            entity.fields.sort((a, b) => a.order - b.order);
        }
        
        return entity;
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
        
        // Convertir el array simple de IDs a un array de objetos con orden
        data.entities[entityIndex].fields = fieldIds.map((fieldId, index) => {
            // Si el campo ya existe en la entidad, mantener su orden actual
            const existingField = data.entities[entityIndex].fields.find(
                field => typeof field === 'object' ? field.id === fieldId : field === fieldId
            );
            
            if (existingField && typeof existingField === 'object') {
                return existingField;
            }
            
            // Si es nuevo o estaba en formato antiguo, crear objeto con orden
            return {
                id: fieldId,
                order: index
            };
        });
        
        StorageService.saveData(data);
        
        return data.entities[entityIndex];
    }
};