/**
 * Modelo para la gestión de registros
 */
const RecordModel = {
    /**
     * Obtiene todos los registros
     * @returns {Array} Lista de registros
     */
    getAll() {
        // Asumiendo que StorageService.getData() devuelve un objeto { records: [...] }
        const data = StorageService.getData();
        return data && data.records ? data.records : [];
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
        const data = StorageService.getData() || { records: [] }; // Inicializa si no existe
        const newRecord = {
            id: 'record_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7), // ID más único
            entityId: entityId,
            timestamp: new Date().toISOString(),
            data: { ...formData }
        };

        if (!data.records) {
             data.records = []; // Asegura que el array exista
        }
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
            // Para comparar solo fechas, ignorando la hora:
            fromDate.setHours(0, 0, 0, 0);
            records = records.filter(record => {
                const recordDate = new Date(record.timestamp);
                recordDate.setHours(0, 0, 0, 0);
                return recordDate >= fromDate;
            });
        }

        if (filters.toDate) {
            const toDate = new Date(filters.toDate);
            // Para incluir todo el día 'toDate':
            toDate.setHours(23, 59, 59, 999);
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
        if (filters.entityIds && Array.isArray(filters.entityIds) && filters.entityIds.length > 0) {
            const entityIdSet = new Set(filters.entityIds); // Más eficiente para búsquedas
            records = records.filter(record => entityIdSet.has(record.entityId));
        }

        // Reutilizar lógica de filtrado de fecha
        if (filters.fromDate || filters.toDate) {
             // Pasamos los filtros de fecha a la función 'filter' que ya tiene la lógica
             // Nota: Esto es conceptual. Para reutilizar bien, la lógica de fecha debería
             // estar en una función separada o 'filter' debería aceptar un array inicial.
             // Por ahora, repetimos la lógica para claridad:
            if (filters.fromDate) {
                const fromDate = new Date(filters.fromDate);
                fromDate.setHours(0, 0, 0, 0);
                records = records.filter(record => {
                    const recordDate = new Date(record.timestamp);
                    recordDate.setHours(0, 0, 0, 0);
                    return recordDate >= fromDate;
                });
            }
            if (filters.toDate) {
                const toDate = new Date(filters.toDate);
                toDate.setHours(23, 59, 59, 999);
                records = records.filter(record => new Date(record.timestamp) <= toDate);
            }
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
        return [...records] // Crear copia para no mutar el original
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
        // Asumiendo que FieldModel y EntityModel están disponibles globalmente o importados
        const field = FieldModel.getById(fieldId);
        if (!field || field.type !== 'number') {
            console.error('generateReportMultiple: El campo debe ser numérico y existir.');
            return { error: 'El campo debe ser numérico y existir.' };
        }

        let entities = EntityModel.getAll().filter(entity =>
            entity.fields.includes(fieldId)
        );

        if (filters.entityIds && Array.isArray(filters.entityIds) && filters.entityIds.length > 0) {
            const entityIdSet = new Set(filters.entityIds);
            entities = entities.filter(entity => entityIdSet.has(entity.id));
        }

        if (entities.length === 0 && !horizontalFieldId) { // Si no hay eje horizontal, necesitamos entidades
             console.error('generateReportMultiple: No hay entidades aplicables.');
            return { error: 'No hay entidades que coincidan con los filtros y usen este campo' };
        }

        // Usamos filterMultiple para obtener los registros base
        const filteredRecords = this.filterMultiple(filters);

        // ---- Lógica para eje horizontal ----
        if (horizontalFieldId) {
            const horizontalField = FieldModel.getById(horizontalFieldId);
            if (!horizontalField) {
                console.error('generateReportMultiple: Campo horizontal no existe.');
                return { error: 'El campo seleccionado para el eje horizontal no existe' };
            }

            const reportData = {
                field: field.name,
                horizontalField: horizontalField.name,
                aggregation: aggregation,
                groups: [] // Cambiado de 'entities' a 'groups' para más claridad
            };

            // Agrupar por valor del campo horizontal
            const groupedByHorizontalValue = filteredRecords.reduce((acc, record) => {
                const hValue = record.data[horizontalFieldId];
                // Ignorar registros sin valor en el campo horizontal o sin valor en el campo a agregar
                if (hValue === undefined || record.data[fieldId] === undefined) {
                    return acc;
                }
                if (!acc[hValue]) {
                    acc[hValue] = [];
                }
                acc[hValue].push(parseFloat(record.data[fieldId]) || 0); // Almacena solo el valor numérico
                return acc;
            }, {});

            // Calcular agregación para cada grupo
            for (const value in groupedByHorizontalValue) {
                const values = groupedByHorizontalValue[value];
                let aggregatedValue = 0;
                if (values.length > 0) {
                    const sum = values.reduce((s, v) => s + v, 0);
                    if (aggregation === 'sum') {
                        aggregatedValue = sum;
                    } else if (aggregation === 'average') {
                        aggregatedValue = sum / values.length;
                    }
                }
                reportData.groups.push({
                    id: value, // El ID es el valor del campo horizontal
                    name: value, // El nombre también
                    value: aggregatedValue,
                    count: values.length
                });
            }
             // Ordenar grupos si es necesario (ej. si son fechas o números)
             // reportData.groups.sort(...);

            return reportData;
        }

        // ---- Lógica sin eje horizontal (agrupado por entidad) ----
        const reportData = {
            field: field.name,
            aggregation: aggregation,
            entities: []
        };

        entities.forEach(entity => {
            // Filtrar registros para esta entidad específica DENTRO de los ya filtrados por fecha/etc.
            const entityRecords = filteredRecords.filter(record =>
                record.entityId === entity.id &&
                record.data[fieldId] !== undefined // Asegurar que el campo exista en el registro
            );

            let aggregatedValue = 0;
            let count = 0;

            if (entityRecords.length > 0) {
                const values = entityRecords.map(record =>
                    parseFloat(record.data[fieldId]) || 0
                );
                count = values.length;
                const sum = values.reduce((s, v) => s + v, 0);

                if (aggregation === 'sum') {
                    aggregatedValue = sum;
                } else if (aggregation === 'average') {
                    aggregatedValue = sum / count;
                }
            }

            reportData.entities.push({
                id: entity.id,
                name: entity.name,
                value: aggregatedValue,
                count: count
            });
        });

        return reportData;
    },

    /**
     * Actualiza la fecha de un registro específico.
     * @param {string} id ID del registro a actualizar.
     * @param {string} newDate Nueva fecha en formato ISO string.
     * @returns {Object|null} El registro actualizado o null si no se encontró.
     */
    updateDate(id, newDate) {
        try {
            const data = StorageService.getData();
            if (!data || !data.records) return null;

            const recordIndex = data.records.findIndex(record => record.id === id);

            if (recordIndex === -1) {
                console.warn(`Registro con ID ${id} no encontrado para actualizar fecha.`);
                return null;
            }

            // Validar que newDate sea un formato de fecha válido antes de asignar
             try {
                 const dateObject = new Date(newDate);
                 if (isNaN(dateObject.getTime())) {
                     throw new Error('Formato de fecha inválido');
                 }
                 data.records[recordIndex].timestamp = dateObject.toISOString(); // Guardar siempre en ISO
             } catch(dateError) {
                 console.error(`Error al procesar la nueva fecha "${newDate}":`, dateError);
                 return null; // No actualizar si la fecha no es válida
             }

            StorageService.saveData(data);
            return data.records[recordIndex];

        } catch (error) {
            console.error('Error en RecordModel.updateDate:', error);
            return null;
        }
    },

    /**
     * Actualiza los datos y la fecha de un registro específico.
     * @param {string} id ID del registro a actualizar.
     * @param {Object} newData Nuevos datos para el campo 'data' del registro.
     * @param {string} newDate Nueva fecha en formato ISO string.
     * @returns {Object|null} El registro actualizado o null si no se encontró o hubo error.
     */
    updateRecord(id, newData, newDate) {
        try {
            const data = StorageService.getData();
            if (!data || !data.records) {
                 console.error('No se pudieron obtener los datos o registros del StorageService.');
                 return null;
            }

            const recordIndex = data.records.findIndex(record => record.id === id);

            if (recordIndex === -1) {
                console.warn(`Registro con ID ${id} no encontrado para actualizar.`);
                return null; // Registro no encontrado
            }

             // Validar y actualizar la fecha
            try {
                 const dateObject = new Date(newDate);
                 if (isNaN(dateObject.getTime())) {
                     throw new Error('Formato de fecha inválido');
                 }
                 data.records[recordIndex].timestamp = dateObject.toISOString(); // Guardar siempre en ISO
             } catch(dateError) {
                 console.error(`Error al procesar la nueva fecha "${newDate}" durante la actualización:`, dateError);
                 return null; // No actualizar si la fecha no es válida
             }

            // Actualizar los datos (asegurarse de que newData sea un objeto)
            if (typeof newData === 'object' && newData !== null) {
                 // Se podría hacer una fusión si se quisiera conservar datos antiguos no presentes en newData:
                 // data.records[recordIndex].data = { ...data.records[recordIndex].data, ...newData };
                 // O simplemente reemplazar:
                 data.records[recordIndex].data = { ...newData };
            } else {
                 console.warn(`Los nuevos datos proporcionados para el registro ${id} no son un objeto válido. Se mantendrán los datos originales.`);
                 // Opcionalmente, podrías decidir no actualizar nada si los datos no son válidos
                 // return null;
            }


            // Guardar los datos actualizados usando StorageService
            StorageService.saveData(data);

            // Devolver el registro actualizado
            return data.records[recordIndex];

        } catch (error) {
            console.error(`Error al actualizar el registro con ID ${id}:`, error);
            return null;
        }
    },

    /**
     * Elimina un registro por su ID.
     * @param {string} id ID del registro a eliminar.
     * @returns {boolean} true si se eliminó correctamente, false si no se encontró o hubo error.
     */
    delete(id) {
        try {
            const data = StorageService.getData();
            if (!data || !data.records) return false;

            const initialLength = data.records.length;
            data.records = data.records.filter(record => record.id !== id);

            // Comprobar si realmente se eliminó algo
            if (data.records.length < initialLength) {
                StorageService.saveData(data);
                return true;
            } else {
                console.warn(`Registro con ID ${id} no encontrado para eliminar.`);
                return false; // No se encontró el registro
            }
        } catch (error) {
            console.error(`Error al eliminar el registro con ID ${id}:`, error);
            return false;
        }
    }
};