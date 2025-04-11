/**
 * Modelo para la gestión de registros
 */
const RecordModel = {
    /**
     * Obtiene todos los registros
     * @returns {Array} Lista de registros
     */
    getAll() {
        return StorageService.getData().records;
    },
    
    /**
     * Obtiene un registro por su ID
     * @param {string} id ID del registro
     * @returns {Object|null} Registro encontrado o null
     */
    getById(id) {
        const records = this.getAll();
        return records.find(record => record.id === id) || null;
    },
    
    /**
     * Crea un nuevo registro
     * @param {string} entityId ID de la entidad
     * @param {Object} formData Datos del formulario
     * @returns {Object} Registro creado
     */
    create(entityId, formData) {
        const data = StorageService.getData();
        const newRecord = {
            id: 'record_' + Date.now(),
            entityId: entityId,
            timestamp: new Date().toISOString(),
            data: { ...formData }
        };
        
        data.records.push(newRecord);
        StorageService.saveData(data);
        
        return newRecord;
    },
    
    /**
     * Filtra registros según criterios (una sola entidad)
     * @param {Object} filters Criterios de filtrado
     * @returns {Array} Registros filtrados
     */
    filter(filters = {}) {
        let records = this.getAll();
        
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
     * @returns {Array} Registros filtrados
     */
    filterMultiple(filters = {}) {
        let records = this.getAll();
        
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
     * @returns {Array} Últimos registros
     */
    getRecent(limit = 10) {
        const records = this.getAll();
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
     * @returns {Object} Datos para el reporte
     */
    generateReportMultiple(fieldId, aggregation = 'sum', filters = {}, horizontalFieldId = '') {
        // Obtenemos el campo para asegurarnos que es numérico
        const field = FieldModel.getById(fieldId);
        if (!field || field.type !== 'number') {
            return { error: 'El campo debe ser numérico' };
        }
        
        // Obtenemos las entidades que usan este campo
        let entities = EntityModel.getAll().filter(entity => 
            entity.fields.includes(fieldId)
        );
        
        // Si hay un filtro de entidades específicas, filtramos aún más
        if (filters.entityIds && filters.entityIds.length > 0) {
            entities = entities.filter(entity => filters.entityIds.includes(entity.id));
        }
        
        // Si no hay entidades, no podemos generar el reporte
        if (entities.length === 0) {
            return { error: 'No hay entidades que coincidan con los filtros y usen este campo' };
        }
        
        // Filtramos los registros
        const filteredRecords = this.filterMultiple(filters);
        
        // Si se proporciona un campo para el eje horizontal, lo usamos
        if (horizontalFieldId) {
            const horizontalField = FieldModel.getById(horizontalFieldId);
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
        entities.forEach(entity => {
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
                return;
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
        });
        
        return reportData;
    },

    /**
     * Actualiza la fecha de un registro
     * @param {string} id ID del registro
     * @param {string} newDate Nueva fecha (en formato ISO)
     * @returns {Object|null} Registro actualizado o null si no se encuentra
     */
    updateDate(id, newDate) {
        const data = StorageService.getData();
        const recordIndex = data.records.findIndex(record => record.id === id);
        
        if (recordIndex === -1) {
            return null;
        }
        
        data.records[recordIndex].timestamp = newDate;
        StorageService.saveData(data);
        
        return data.records[recordIndex];
    },

    /**
     * Elimina un registro por su ID
     * @param {string} id ID del registro a eliminar
     * @returns {boolean} true si se eliminó correctamente, false si no
     */
    delete(id) {
        const data = StorageService.getData();
        const initialLength = data.records.length;
        
        data.records = data.records.filter(record => record.id !== id);
        
        if (data.records.length !== initialLength) {
            StorageService.saveData(data);
            return true;
        }
        
        return false;
    },

    /**
     * Actualiza un registro completo
     * @param {string} id ID del registro
     * @param {Object} newData Nuevos valores para los campos del registro
     * @param {string} newDate Nueva fecha (en formato ISO)
     * @returns {boolean} true si se actualizó correctamente, false si no
     */
    update(id, newData, newDate) {
        const data = StorageService.getData();
        const recordIndex = data.records.findIndex(record => record.id === id);
        
        if (recordIndex === -1) {
            return false;
        }
        
        // Actualizar los datos del registro
        data.records[recordIndex].data = { ...data.records[recordIndex].data, ...newData };
        
        // Actualizar la fecha si se proporciona
        if (newDate) {
            data.records[recordIndex].timestamp = newDate;
        }
        
        // Guardar los cambios
        StorageService.saveData(data);
        
        return true;
    }
};