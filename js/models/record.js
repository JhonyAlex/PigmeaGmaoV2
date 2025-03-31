/**
 * Modelo para la gestión de registros
 */
const RecordModel = {
    /**
     * Obtiene todos los registros
     * @returns {Promise<Array>} Promesa que se resuelve con la lista de registros
     */
    async getAll() {
        await StorageService.initializeStorage();
        return StorageService.getAllFromStore('records');
    },
    
    /**
     * Obtiene un registro por su ID
     * @param {string} id ID del registro
     * @returns {Promise<Object|null>} Promesa que se resuelve con el registro encontrado o null
     */
    async getById(id) {
        await StorageService.initializeStorage();
        const record = await StorageService.getFromStore('records', id);
        return record || null;
    },
    
    /**
     * Crea un nuevo registro
     * @param {string} entityId ID de la entidad
     * @param {Object} formData Datos del formulario
     * @returns {Promise<Object>} Promesa que se resuelve con el registro creado
     */
    async create(entityId, formData) {
        await StorageService.initializeStorage();
        const newRecord = {
            id: 'record_' + Date.now(),
            entityId: entityId,
            timestamp: new Date().toISOString(),
            data: { ...formData }
        };
        
        return StorageService.saveToStore('records', newRecord);
    },
    
    /**
     * Filtra registros según criterios (una sola entidad)
     * @param {Object} filters Criterios de filtrado
     * @returns {Promise<Array>} Promesa que se resuelve con los registros filtrados
     */
    async filter(filters = {}) {
        await StorageService.initializeStorage();
        let records = await this.getAll();
        
        // Filtrar por entidad
        if (filters.entityId) {
            records = records.filter(record => record.entityId === filters.entityId);
        }
        
        // Filtrar por fecha
        if (filters.fromDate) {
            const fromDate = new Date(filters.fromDate);
            records = records.filter(record => new Date(record.timestamp) >= fromDate);
        }
        
        if (filters.toDate) {
            const toDate = new Date(filters.toDate);
            toDate.setHours(23, 59, 59); // Final del día
            records = records.filter(record => new Date(record.timestamp) <= toDate);
        }
        
        return records;
    },
    
    /**
     * Filtra registros según criterios (múltiples entidades)
     * @param {Object} filters Criterios de filtrado con entityIds como array
     * @returns {Promise<Array>} Promesa que se resuelve con los registros filtrados
     */
    async filterMultiple(filters = {}) {
        await StorageService.initializeStorage();
        let records = await this.getAll();
        
        // Filtrar por entidades (múltiples)
        if (filters.entityIds && filters.entityIds.length > 0) {
            records = records.filter(record => filters.entityIds.includes(record.entityId));
        }
        
        // Filtrar por fecha
        if (filters.fromDate) {
            const fromDate = new Date(filters.fromDate);
            records = records.filter(record => new Date(record.timestamp) >= fromDate);
        }
        
        if (filters.toDate) {
            const toDate = new Date(filters.toDate);
            toDate.setHours(23, 59, 59); // Final del día
            records = records.filter(record => new Date(record.timestamp) <= toDate);
        }
        
        return records;
    },
    
    /**
     * Obtiene los últimos N registros
     * @param {number} limit Número de registros a retornar
     * @returns {Promise<Array>} Promesa que se resuelve con los últimos registros
     */
    async getRecent(limit = 10) {
        await StorageService.initializeStorage();
        const records = await this.getAll();
        
        // Ordenar por fecha (más reciente primero)
        return [...records]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
    },
    
    /**
     * Genera datos para reportes comparativos (compatible con múltiples entidades)
     * @param {string} fieldId ID del campo a comparar
     * @param {string} aggregation Tipo de agregación ('sum' o 'average')
     * @param {Object} filters Filtros adicionales (puede incluir entityIds como array)
     * @param {string} horizontalFieldId ID del campo para el eje horizontal (opcional)
     * @returns {Promise<Object>} Promesa que se resuelve con los datos para el reporte
     */
    async generateReportMultiple(fieldId, aggregation = 'sum', filters = {}, horizontalFieldId = '') {
        await StorageService.initializeStorage();
        
        // Obtenemos el campo para asegurarnos que es numérico
        const field = await FieldModel.getById(fieldId);
        if (!field || field.type !== 'number') {
            return { error: 'El campo debe ser numérico' };
        }
        
        // Obtenemos las entidades y filtramos las que usan este campo
        let entities = await EntityModel.getAll();
        entities = entities.filter(entity => entity.fields.includes(fieldId));
        
        // Si hay un filtro de entidades específicas, filtramos aún más
        if (filters.entityIds && filters.entityIds.length > 0) {
            entities = entities.filter(entity => filters.entityIds.includes(entity.id));
        }
        
        // Si no hay entidades, no podemos generar el reporte
        if (entities.length === 0) {
            return { error: 'No hay entidades que coincidan con los filtros y usen este campo' };
        }
        
        // Filtramos los registros
        const filteredRecords = await this.filterMultiple(filters);
        
        // Si se proporciona un campo para el eje horizontal, lo usamos
        if (horizontalFieldId) {
            const horizontalField = await FieldModel.getById(horizontalFieldId);
            if (!horizontalField) {
                return { error: 'El campo seleccionado para el eje horizontal no existe' };
            }
            
            // Agrupar por el valor del campo horizontal
            const reportData = {
                field: field.name,
                horizontalField: horizontalField.name,
                aggregation: aggregation,
                entities: []
            };
            
            // Obtener valores únicos del campo horizontal
            const uniqueValues = new Set();
            filteredRecords.forEach(record => {
                if (record.data[horizontalFieldId] !== undefined) {
                    uniqueValues.add(record.data[horizontalFieldId]);
                }
            });
            
            // Para cada valor único, calcular la agregación
            Array.from(uniqueValues).forEach(value => {
                // Filtrar registros para este valor
                const valueRecords = filteredRecords.filter(record => 
                    record.data[horizontalFieldId] === value && 
                    record.data[fieldId] !== undefined
                );
                
                if (valueRecords.length === 0) {
                    reportData.entities.push({
                        id: value,
                        name: value,
                        value: 0,
                        count: 0
                    });
                    return;
                }
                
                // Convertir valores a números
                const values = valueRecords.map(record => 
                    parseFloat(record.data[fieldId]) || 0
                );
                
                // Calcular valor según agregación
                let aggregatedValue = 0;
                if (aggregation === 'sum') {
                    aggregatedValue = values.reduce((sum, val) => sum + val, 0);
                } else if (aggregation === 'average') {
                    aggregatedValue = values.reduce((sum, val) => sum + val, 0) / values.length;
                }
                
                reportData.entities.push({
                    id: value,
                    name: value,
                    value: aggregatedValue,
                    count: valueRecords.length
                });
            });
            
            return reportData;
        }
        
        // Si no hay campo horizontal, usamos las entidades como siempre
        const reportData = {
            field: field.name,
            aggregation: aggregation,
            entities: []
        };
        
        // Para cada entidad (ya filtradas si hay filtro de entidad), calculamos los valores
        for (const entity of entities) {
            // Filtrar registros para esta entidad
            const entityRecords = filteredRecords.filter(record => 
                record.entityId === entity.id && 
                record.data[fieldId] !== undefined
            );
            
            if (entityRecords.length === 0) {
                reportData.entities.push({
                    id: entity.id,
                    name: entity.name,
                    value: 0,
                    count: 0
                });
                continue;
            }
            
            // Convertir valores a números
            const values = entityRecords.map(record => 
                parseFloat(record.data[fieldId]) || 0
            );
            
            // Calcular valor según agregación
            let value = 0;
            if (aggregation === 'sum') {
                value = values.reduce((sum, val) => sum + val, 0);
            } else if (aggregation === 'average') {
                value = values.reduce((sum, val) => sum + val, 0) / values.length;
            }
            
            reportData.entities.push({
                id: entity.id,
                name: entity.name,
                value: value,
                count: entityRecords.length
            });
        }
        
        return reportData;
    }
};