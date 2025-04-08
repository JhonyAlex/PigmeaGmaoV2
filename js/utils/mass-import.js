/**
 * Utilidades para importación masiva de datos
 */
const MassImportUtils = {
    /**
     * Genera un archivo CSV de muestra basado en las entidades y campos existentes
     * @param {string} entityId ID de la entidad seleccionada (opcional)
     */
    generateSampleFile(entityId = null) {
        // Obtener entidades (una específica o todas)
        let entities = [];
        if (entityId) {
            const entity = EntityModel.getById(entityId);
            if (entity) entities = [entity];
        } else {
            entities = EntityModel.getAll();
        }
        
        if (entities.length === 0) {
            UIUtils.showAlert('No hay entidades configuradas para generar el archivo de muestra', 'warning');
            return;
        }
        
        // Crear cabeceras del CSV: Entidad, Fecha_y_Hora, y campos de la entidad seleccionada
        let headers = ['Entidad', 'Fecha_y_Hora'];
        let sampleRow = ['Nombre de la Entidad', formatDateForCSV(new Date())];
        
        // Si es una sola entidad, añadir sus campos
        if (entityId) {
            const entity = entities[0];
            const fields = FieldModel.getByIds(entity.fields);
            
            fields.forEach(field => {
                headers.push(field.name.replace(/,/g, ' '));
                
                // Generar un valor de ejemplo según el tipo de campo
                let sampleValue = '';
                if (field.type === 'number') {
                    sampleValue = '0';
                } else if (field.type === 'select' && field.options.length > 0) {
                    sampleValue = field.options[0];
                } else {
                    sampleValue = 'Valor de ejemplo';
                }
                
                sampleRow.push(sampleValue);
            });
        } else {
            // Si son todas las entidades, agregar todos los campos únicos
            const allFields = FieldModel.getAll();
            
            allFields.forEach(field => {
                if (!headers.includes(field.name)) {
                    headers.push(field.name.replace(/,/g, ' '));
                    
                    // Generar valor de ejemplo
                    let sampleValue = '';
                    if (field.type === 'number') {
                        sampleValue = '0';
                    } else if (field.type === 'select' && field.options.length > 0) {
                        sampleValue = field.options[0];
                    } else {
                        sampleValue = 'Valor de ejemplo';
                    }
                    
                    sampleRow.push(sampleValue);
                }
            });
        }
        
        // Crear segunda fila de ejemplo
        const sampleRow2 = [...sampleRow];
        sampleRow2[1] = formatDateForCSV(new Date(Date.now() - 86400000)); // Un día antes
        
        // Combinar cabeceras y filas
        const csvContent = [
            headers.join(','),
            sampleRow.join(','),
            sampleRow2.join(',')
        ].join('\n');
        
        // Crear blob y descargar archivo
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = entityId 
            ? `plantilla_${entities[0].name}_${new Date().toISOString().split('T')[0]}.csv` 
            : `plantilla_todas_entidades_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        
        // Limpiar
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    },
    
    /**
     * Analiza un archivo CSV o Excel para importación masiva
     * @param {File} file Archivo a procesar
     * @returns {Promise} Promesa con los datos procesados
     */
    parseImportFile(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('No se seleccionó ningún archivo'));
                return;
            }
            
            // Determinar tipo de archivo
            const fileExt = file.name.split('.').pop().toLowerCase();
            
            if (fileExt === 'csv') {
                // Procesar CSV
                this.parseCSV(file)
                    .then(resolve)
                    .catch(reject);
            } else if (['xlsx', 'xls'].includes(fileExt)) {
                // Procesar Excel
                this.parseExcel(file)
                    .then(resolve)
                    .catch(reject);
            } else {
                reject(new Error('Formato de archivo no soportado. Use CSV o Excel (.xlsx, .xls)'));
            }
        });
    },
    
    /**
     * Analiza un archivo CSV
     * @param {File} file Archivo CSV
     * @returns {Promise} Promesa con los datos procesados
     */
    parseCSV(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const csv = e.target.result;
                    
                    // Usar PapaParse si está disponible (añadir script en index.html)
                    if (typeof Papa !== 'undefined') {
                        Papa.parse(csv, {
                            header: true,
                            skipEmptyLines: true,
                            complete: (results) => {
                                resolve(this.processImportData(results.data));
                            },
                            error: (error) => {
                                reject(new Error('Error al analizar CSV: ' + error.message));
                            }
                        });
                    } else {
                        // Procesamiento básico sin Papa Parse
                        const lines = csv.split(/\\r\\n|\\n/);
                        const headers = lines[0].split(',');
                        
                        const data = [];
                        for (let i = 1; i < lines.length; i++) {
                            if (lines[i].trim() === '') continue;
                            
                            const values = lines[i].split(',');
                            const row = {};
                            
                            headers.forEach((header, j) => {
                                row[header.trim()] = values[j] ? values[j].trim() : '';
                            });
                            
                            data.push(row);
                        }
                        
                        resolve(this.processImportData(data));
                    }
                } catch (error) {
                    reject(new Error('Error al procesar el archivo CSV: ' + error.message));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Error al leer el archivo'));
            };
            
            reader.readAsText(file);
        });
    },
    
    /**
     * Analiza un archivo Excel
     * @param {File} file Archivo Excel
     * @returns {Promise} Promesa con los datos procesados
     */
    parseExcel(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = e.target.result;
                    
                    // Usar SheetJS si está disponible (añadir script en index.html)
                    if (typeof XLSX !== 'undefined') {
                        const workbook = XLSX.read(data, { type: 'binary' });
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];
                        
                        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                        
                        if (json.length < 2) {
                            reject(new Error('El archivo no contiene suficientes datos'));
                            return;
                        }
                        
                        const headers = json[0];
                        const rows = json.slice(1);
                        
                        const parsedData = rows.map(row => {
                            const item = {};
                            headers.forEach((header, index) => {
                                item[header] = row[index] !== undefined ? row[index] : '';
                            });
                            return item;
                        });
                        
                        resolve(this.processImportData(parsedData));
                    } else {
                        reject(new Error('La librería para procesar archivos Excel no está disponible. Intente con un archivo CSV.'));
                    }
                } catch (error) {
                    reject(new Error('Error al procesar el archivo Excel: ' + error.message));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Error al leer el archivo'));
            };
            
            reader.readAsBinaryString(file);
        });
    },
    
    /**
     * Procesa los datos importados y los valida contra las entidades y campos
     * @param {Array} data Datos importados
     * @returns {Object} Datos procesados con validación
     */
    processImportData(data) {
        if (!data || data.length === 0) {
            throw new Error('No hay datos para importar');
        }
        
        const entities = EntityModel.getAll();
        const allFields = FieldModel.getAll();
        
        // Verificar que tenemos las columnas requeridas
        const firstRow = data[0];
        if (!firstRow['Entidad'] || !firstRow['Fecha_y_Hora']) {
            throw new Error('El archivo debe contener las columnas "Entidad" y "Fecha_y_Hora"');
        }
        
        // Validar y procesar cada fila
        const processedData = [];
        const errors = [];
        
        data.forEach((row, index) => {
            const rowNum = index + 2; // +2 porque contamos desde 1 y hemos leído la cabecera
            
            // Verificar entidad
            const entityName = row['Entidad'];
            if (!entityName) {
                errors.push(`Fila ${rowNum}: Falta el nombre de la entidad`);
                return;
            }
            
            // Buscar entidad por nombre
            const entity = entities.find(e => e.name === entityName);
            if (!entity) {
                errors.push(`Fila ${rowNum}: La entidad "${entityName}" no existe`);
                return;
            }
            
            // Verificar fecha
            const dateStr = row['Fecha_y_Hora'];
            if (!dateStr) {
                errors.push(`Fila ${rowNum}: Falta la fecha y hora`);
                return;
            }
            
            let timestamp;
            try {
                timestamp = parseDate(dateStr);
            } catch (e) {
                errors.push(`Fila ${rowNum}: Formato de fecha inválido "${dateStr}"`);
                return;
            }
            
            // Mapear campos de la entidad
            const fieldsData = {};
            const entityFields = FieldModel.getByIds(entity.fields);
            
            entityFields.forEach(field => {
                // Buscar el valor del campo en la fila
                if (row[field.name] !== undefined) {
                    let value = row[field.name];
                    
                    // Validar según tipo
                    if (field.type === 'number') {
                        value = value.toString().trim();
                        if (value === '') {
                            if (field.required) {
                                errors.push(`Fila ${rowNum}: El campo numérico "${field.name}" es requerido`);
                                return;
                            }
                            value = null;
                        } else {
                            value = parseFloat(value);
                            if (isNaN(value)) {
                                errors.push(`Fila ${rowNum}: El valor "${row[field.name]}" no es un número válido para el campo "${field.name}"`);
                                return;
                            }
                        }
                    } else if (field.type === 'select') {
                        if (value && !field.options.includes(value)) {
                            errors.push(`Fila ${rowNum}: El valor "${value}" no es una opción válida para el campo "${field.name}"`);
                            return;
                        }
                    }
                    
                    // Campo requerido pero valor vacío
                    if (field.required && (value === '' || value === null)) {
                        errors.push(`Fila ${rowNum}: El campo "${field.name}" es requerido`);
                        return;
                    }
                    
                    fieldsData[field.id] = value;
                } else if (field.required) {
                    errors.push(`Fila ${rowNum}: Falta el campo requerido "${field.name}"`);
                    return;
                }
            });
            
            // Si llegamos aquí, la fila es válida
            processedData.push({
                entityId: entity.id,
                timestamp: timestamp,
                data: fieldsData,
                original: row
            });
        });
        
        return {
            valid: errors.length === 0,
            errors: errors,
            data: processedData,
            totalRows: data.length,
            validRows: processedData.length
        };
    },
    
    /**
     * Importa los datos validados como nuevos registros
     * @param {Array} data Datos validados para importar
     * @returns {Object} Resultado de la importación
     */
    importRecords(data) {
        if (!data || data.length === 0) {
            return { success: false, message: 'No hay datos para importar' };
        }
        
        try {
            // Crear registros uno por uno
            const importedRecords = [];
            
            data.forEach(item => {
                // Crear el registro con fecha personalizada
                const newRecord = RecordModel.create(item.entityId, item.data);
                if (newRecord) {
                    // Actualizar la fecha del registro
                    RecordModel.updateDate(newRecord.id, item.timestamp);
                    importedRecords.push(newRecord);
                }
            });
            
            return {
                success: true,
                message: `Se importaron correctamente ${importedRecords.length} registros`,
                records: importedRecords
            };
        } catch (error) {
            return {
                success: false,
                message: 'Error al importar registros: ' + error.message
            };
        }
    }
};

/**
 * Formatea una fecha para CSV
 * @param {Date} date Fecha a formatear
 * @returns {string} Fecha formateada
 */
function formatDateForCSV(date) {
    return date.toISOString().replace('T', ' ').split('.')[0];
}

/**
 * Analiza una cadena de fecha en varios formatos
 * @param {string} dateStr Cadena de fecha
 * @returns {string} Fecha ISO
 */
function parseDate(dateStr) {
    // Intentar diferentes formatos de fecha
    let date;
    
    // Formato ISO (YYYY-MM-DD HH:MM:SS) o (YYYY-MM-DDTHH:MM:SS)
    if (dateStr.includes('T') || dateStr.includes('-')) {
        date = new Date(dateStr);
    } else {
        // Formato DD/MM/YYYY HH:MM:SS
        const parts = dateStr.split(' ');
        if (parts.length === 2) {
            const dateParts = parts[0].split('/');
            if (dateParts.length === 3) {
                // Formato DD/MM/YYYY
                const day = parseInt(dateParts[0], 10);
                const month = parseInt(dateParts[1], 10) - 1;
                const year = parseInt(dateParts[2], 10);
                
                const timeParts = parts[1].split(':');
                const hour = parseInt(timeParts[0], 10) || 0;
                const minute = parseInt(timeParts[1], 10) || 0;
                const second = parseInt(timeParts[2], 10) || 0;
                
                date = new Date(year, month, day, hour, minute, second);
            }
        } else {
            // Intentar como fecha literal (ej. Mar 15 2023)
            date = new Date(dateStr);
        }
    }
    
    if (isNaN(date.getTime())) {
        throw new Error(`Formato de fecha inválido: ${dateStr}`);
    }
    
    return date.toISOString();
}