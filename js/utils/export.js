/**
 * Utilidades para importación y exportación de datos
 */
const ExportUtils = {
    /**
     * Exporta los datos de la aplicación a un archivo JSON
     */
    exportToFile() {
        const data = StorageService.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `app_data_export_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        
        // Limpiar
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    },
    
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
};