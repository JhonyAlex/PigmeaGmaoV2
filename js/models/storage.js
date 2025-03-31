/**
 * Servicio de almacenamiento que gestiona todas las operaciones con IndexedDB
 */
const StorageService = {
    DB_NAME: 'flexibleDataApp',
    DB_VERSION: 1,
    STORES: ['config', 'entities', 'fields', 'records'],
    db: null,

    /**
     * Inicializa la base de datos IndexedDB
     * @returns {Promise} Promesa que se resuelve cuando la base de datos está lista
     */
    initializeStorage() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                resolve(this.db);
                return;
            }

            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Crear los almacenes de objetos (stores) si no existen
                this.STORES.forEach(storeName => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        // Para el almacén 'config' no necesitamos key path ya que solo tendremos un objeto
                        if (storeName === 'config') {
                            db.createObjectStore(storeName);
                        } else {
                            // Para los demás almacenes, usamos 'id' como clave
                            db.createObjectStore(storeName, { keyPath: 'id' });
                        }
                    }
                });
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                
                // Inicializar con datos predeterminados si están vacíos
                this.initializeDefaultData().then(() => {
                    resolve(this.db);
                });
            };

            request.onerror = (event) => {
                console.error("Error al abrir la base de datos:", event.target.error);
                reject(event.target.error);
            };
        });
    },

    /**
     * Inicializa los datos predeterminados si los almacenes están vacíos
     * @returns {Promise} Promesa que se resuelve cuando se han comprobado/inicializado los datos
     */
    async initializeDefaultData() {
        try {
            // Verificar si ya existe configuración
            const config = await this.getConfig();
            if (!config) {
                // Configuración inicial
                const initialConfig = {
                    title: "Sistema de Registro de Datos",
                    description: "Registre sus datos de manera flexible y personalizada"
                };
                await this.updateConfig(initialConfig);
            }

            // Las entidades, campos y registros pueden estar vacíos al inicio
        } catch (error) {
            console.error('Error al inicializar datos:', error);
        }
    },

    /**
     * Realiza una transacción en un almacén específico
     * @param {string} storeName Nombre del almacén
     * @param {string} mode Modo de la transacción ('readonly' o 'readwrite')
     * @returns {IDBObjectStore} Referencia al almacén
     */
    getStore(storeName, mode = 'readonly') {
        const transaction = this.db.transaction(storeName, mode);
        return transaction.objectStore(storeName);
    },

    /**
     * Obtiene todos los datos de un almacén
     * @param {string} storeName Nombre del almacén
     * @returns {Promise<Array>} Promesa que se resuelve con los datos
     */
    getAllFromStore(storeName) {
        return new Promise((resolve, reject) => {
            const store = this.getStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    },

    /**
     * Obtiene un elemento específico de un almacén
     * @param {string} storeName Nombre del almacén
     * @param {string|number} key Clave del elemento
     * @returns {Promise<Object>} Promesa que se resuelve con el elemento
     */
    getFromStore(storeName, key) {
        return new Promise((resolve, reject) => {
            const store = this.getStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject(event.target.error);
        });
    },

    /**
     * Agrega o actualiza un elemento en un almacén
     * @param {string} storeName Nombre del almacén
     * @param {Object} data Datos a guardar
     * @param {string|number} key Clave (solo para 'config')
     * @returns {Promise<Object>} Promesa que se resuelve con el elemento guardado
     */
    saveToStore(storeName, data, key = null) {
        return new Promise((resolve, reject) => {
            const store = this.getStore(storeName, 'readwrite');
            let request;

            if (key !== null) {
                request = store.put(data, key); // Para almacenes como 'config' sin keyPath
            } else {
                request = store.put(data); // Para almacenes con keyPath
            }

            request.onsuccess = () => resolve(data);
            request.onerror = (event) => reject(event.target.error);
        });
    },

    /**
     * Elimina un elemento de un almacén
     * @param {string} storeName Nombre del almacén
     * @param {string|number} key Clave del elemento
     * @returns {Promise<boolean>} Promesa que se resuelve con true si se eliminó
     */
    deleteFromStore(storeName, key) {
        return new Promise((resolve, reject) => {
            const store = this.getStore(storeName, 'readwrite');
            const request = store.delete(key);

            request.onsuccess = () => resolve(true);
            request.onerror = (event) => reject(event.target.error);
        });
    },

    /**
     * Limpia todos los datos de un almacén
     * @param {string} storeName Nombre del almacén
     * @returns {Promise<boolean>} Promesa que se resuelve con true si se limpió
     */
    clearStore(storeName) {
        return new Promise((resolve, reject) => {
            const store = this.getStore(storeName, 'readwrite');
            const request = store.clear();

            request.onsuccess = () => resolve(true);
            request.onerror = (event) => reject(event.target.error);
        });
    },

    /**
     * Obtiene todos los datos de la aplicación
     * @returns {Promise<Object>} Promesa que se resuelve con todos los datos
     */
    async getData() {
        await this.initializeStorage();
        
        const data = {};
        for (const storeName of this.STORES) {
            if (storeName === 'config') {
                data[storeName] = await this.getFromStore(storeName, 'appConfig');
            } else {
                data[storeName] = await this.getAllFromStore(storeName);
            }
        }
        
        return data;
    },

    /**
     * Actualiza la configuración general
     * @param {Object} config Objeto con la configuración
     * @returns {Promise<Object>} Promesa que se resuelve con la configuración guardada
     */
    async updateConfig(config) {
        await this.initializeStorage();
        return this.saveToStore('config', config, 'appConfig');
    },

    /**
     * Obtiene la configuración actual
     * @returns {Promise<Object>} Promesa que se resuelve con la configuración
     */
    async getConfig() {
        await this.initializeStorage();
        return this.getFromStore('config', 'appConfig');
    },

    /**
     * Exporta todos los datos como cadena JSON
     * @returns {Promise<string>} Promesa que se resuelve con los datos en formato JSON
     */
    async exportData() {
        const data = await this.getData();
        return JSON.stringify(data, null, 2);
    },

    /**
     * Importa datos desde una cadena JSON
     * @param {string} jsonData Datos en formato JSON
     * @returns {Promise<boolean>} Promesa que se resuelve con true si fue exitoso
     */
    async importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // Validar estructura básica de datos
            if (!data.config || !data.entities || !data.fields || !data.records) {
                throw new Error("Estructura de datos inválida");
            }
            
            await this.initializeStorage();
            
            // Limpiar todos los almacenes
            for (const storeName of this.STORES) {
                await this.clearStore(storeName);
            }
            
            // Guardar configuración
            await this.updateConfig(data.config);
            
            // Guardar entidades, campos y registros
            for (const entity of data.entities) {
                await this.saveToStore('entities', entity);
            }
            
            for (const field of data.fields) {
                await this.saveToStore('fields', field);
            }
            
            for (const record of data.records) {
                await this.saveToStore('records', record);
            }
            
            return true;
        } catch (e) {
            console.error("Error al importar datos:", e);
            return false;
        }
    }
};