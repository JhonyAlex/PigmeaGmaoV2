import StorageService from '../models/storage.js';
import Entity from '../models/entity.js';
import Field from '../models/field.js';
import Record from '../models/record.js';

const storageService = new StorageService();

async function exportData(format = 'json') {
    try {
        const entities = await Entity.getAll();
        const fields = await Field.getAll();
        const records = await Record.getAll();
        const data = {
            entities: await Promise.all(entities.map(async e => {
                const entityData = await e.constructor.get(e.id);
                return { id: e.id, name: e.name, fields: entityData ? entityData.fields : [] };
            })),
            fields: await Promise.all(fields.map(async f => {
                const fieldData = await f.constructor.get(f.id);
                return { id: f.id, name: f.name, type: f.type, entityId: fieldData ? fieldData.entityId : null };
            })),
            records: await Promise.all(records.map(async r => {
                const recordData = await r.constructor.get(r.id);
                return { id: r.id, entityId: recordData ? recordData.entityId : null, data: recordData ? recordData.data : {} };
            }))
        };
        if (format === 'csv') {
            return convertToCSV(data);
        } else {
            return JSON.stringify(data, null, 2);
        }
    } catch (error) {
        console.error('Error exporting data:', error);
        return null;
    }
}

function convertToCSV(data) {
    if (!data.records || data.records.length === 0) {
        return '';
    }
    const headers = Object.keys(data.records[0].data);
    const csvRows = [];
    csvRows.push(headers.join(','));
    for (const record of data.records) {
        const values = headers.map(header => JSON.stringify(record.data[header]));
        csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
}

export { exportData };


const ExportUtils = {
    /**
     * Importa datos desde un archivo JSON seleccionado
     * @param {File} file Archivo a importar
     * @returns {Promise} Promesa con el resultado de la operación
     */
    importFromFile(file) {
        return new Promise((resolve, reject) => {
            if (!file || file.type !== 'application/json') {
                reject(new Error('El archivo debe ser de tipo JSON'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(event) {
                try {
                    const jsonData = event.target.result;
                    const parsedData = JSON.parse(jsonData);
                    
                    // Validar estructura de datos
                    if (!ValidationUtils.validateImportData(parsedData)) {
                        reject(new Error('El formato del archivo no es válido'));
                        return;
                    }
                    
                    // Realizar la importación
                    if (StorageService.importData(jsonData)) {
                        resolve('Datos importados correctamente');
                    } else {
                        reject(new Error('Error al importar los datos'));
                    }
                } catch (error) {
                    reject(new Error('Error al procesar el archivo: ' + error.message));
                }
            };
            
            reader.onerror = function() {
                reject(new Error('Error al leer el archivo'));
            };
            
            reader.readAsText(file);
        });
    }