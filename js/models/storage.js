/**
 * Servicio de almacenamiento que gestiona todas las operaciones con localStorage
 */
const StorageService = {
    STORAGE_KEY: 'flexibleDataApp',
    
    /**
     * Inicializa el almacenamiento con datos predeterminados si no existe
     */
    initializeStorage() {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
            const initialData = {
                config: {
                    title: "Sistema de Registro de Datos",
                    description: "Registre sus datos de manera flexible y personalizada",
                    entityName: "Entidad",
                    navbarTitle: "Sistema de Registro Flexible"
                },
                entities: [],
                fields: [],
                records: []
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initialData));
        }
    },
    
    /**
     * Obtiene todos los datos del almacenamiento
     * @returns {Object} Datos completos de la aplicación
     */
    getData() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY));
    },
    
    /**
     * Guarda los datos en el almacenamiento
     * @param {Object} data Datos completos a guardar
     */
    saveData(data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    },
    
    /**
     * Actualiza la configuración general
     * @param {Object} config Objeto con la configuración
     */
    updateConfig(config) {
        const data = this.getData();
        data.config = config;
        this.saveData(data);
    },
    
    /**
     * Obtiene la configuración actual
     * @returns {Object} Configuración de la aplicación
     */
    getConfig() {
        return this.getData().config;
    },
    
    // Métodos de exportación e importación
    
    /**
     * Exporta todos los datos como cadena JSON
     * @returns {string} Datos en formato JSON
     */
    exportData() {
        return JSON.stringify(this.getData(), null, 2);
    },
    
    /**
     * Importa datos desde una cadena JSON
     * @param {string} jsonData Datos en formato JSON
     * @returns {boolean} Éxito de la importación
     */
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // Validar estructura básica de datos
            if (!data.config || !data.entities || !data.fields || !data.records) {
                throw new Error("Estructura de datos inválida");
            }
            
            // Guardar datos importados
            localStorage.setItem(this.STORAGE_KEY, jsonData);
            return true;
        } catch (e) {
            console.error("Error al importar datos:", e);
            return false;
        }
    }
};