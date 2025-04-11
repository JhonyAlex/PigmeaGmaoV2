/**
 * Modelo para la gestión de registros
 */
import StorageService from './storage.js';
import EntityModel from './entity.js'
import FieldModel from './field.js';

const storageService = new StorageService();

class Record {
  constructor(entityId, data, id = null, timestamp = null) {
    this.id = id || this.generateId();
    this.entityId = entityId;
    this.data = data;
    this.timestamp = timestamp || new Date().toISOString();
  }

  generateId() {
    return 'record_' + Date.now() + Math.random().toString(36).substr(2, 9);
  }

  static async get(id) {
    try {
      const recordData = await storageService.getItem(`records/${id}`);
      if (recordData) {
        return new Record(recordData.entityId, recordData.data, id, recordData.timestamp);
      }
      return null;
    } catch (error) {
      console.error('Error fetching record:', error);
      return null;
    }
  }

  static async getAll() {
    try {
      //Simulando que busca todos los registros
      const initialData = await storageService.getItem('data/initialData');
      if(initialData){
        const allRecords = [];
        for (const recordData of initialData.records){
          allRecords.push(new Record(recordData.entityId, recordData.data, recordData.id, recordData.timestamp));
        }
        return allRecords
      }else{
        return [];
      }
    } catch (error) {
      console.error('Error fetching all records:', error);
      return [];
    }
  }

  async save() {
    try {
      const recordData = { entityId: this.entityId, data: this.data, timestamp: this.timestamp };
      await storageService.setItem(`records/${this.id}`, recordData);
      return true;
    } catch (error) {
      console.error('Error saving record:', error);
      return false;
    }
  }

  async update(updates) {
    try {
      await storageService.updateItem(`records/${this.id}`, updates);
      Object.assign(this, updates);
      return true;
    } catch (error) {
      console.error('Error updating record:', error);
      return false;
    }
  }

  async delete() {
    try {
      await storageService.removeItem(`records/${this.id}`);
      return true;
    } catch (error) {
      console.error('Error deleting record:', error);
      return false;
    }
  }

  static async deleteById(id) {
    try {
      await storageService.removeItem(`records/${id}`);
      return true;
    } catch (error) {
      console.error('Error deleting record:', error);
      return false;
    }
  }
  static async updateById(id, newData, newDate){
    try{
      await storageService.updateItem(`records/${id}`, {
        data: newData,
        timestamp: newDate
      })
      return true
    }catch (error) {
      console.error('Error updating record:', error);
      return false;
    }
  }

  static async create(entityId, formData) {
    const newRecord = new Record(entityId, formData);
    await newRecord.save();
    return newRecord;
  }

  static RecordModel = {
    
    /**
     * Obtiene un registro por su ID
     * @param {string} id ID del registro
     * @returns {Object|null} Registro encontrado o null
     */
    getById(id) {
      return Record.get(id);
    },
    

    
    /**
     * Filtra registros según criterios (una sola entidad)
     * @param {Object} filters Criterios de filtrado
     * @returns {Array} Registros filtrados
     */
    filter(filters = {}) {
        let records = Record.getAll();
        
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
        let records = Record.getAll();
        
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
        const records = Record.getAll();
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
    async generateReportMultiple(fieldId, aggregation = 'sum', filters = {}, horizontalFieldId = '') {
        // Obtenemos el campo para asegurarnos que es numérico
        const field = FieldModel.getById(fieldId);
        if (!field || field.type !== 'number') {
            return { error: 'El campo debe ser numérico' };
        }
        
        // Obtenemos las entidades que usan este campo
        let entities = (await EntityModel.getAll()).filter(entity => 
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
        entities.forEach(async entity => {
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
    async updateDate(id, newDate) {
        const record = await Record.get(id);

        if (!record) {
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
      return Record.deleteById(id)
    },
    create(entityId, formData){
      return Record.create(entityId,formData)
    },
    getAll(){ return Record.getAll() }
    ,

    /**
     * Actualiza un registro completo
     * @param {string} id ID del registro
     * @param {Object} newData Nuevos valores para los campos del registro
     * @param {string} newDate Nueva fecha (en formato ISO)
     * @returns {boolean} true si se actualizó correctamente, false si no
     */
    update(id, newData, newDate) { 
      return Record.updateById(id, newData, newDate);
     }
};

  
  export default Record;

}
