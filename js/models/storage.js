/**
 * Servicio de almacenamiento que gestiona todas las operaciones con localStorage
 */
// import { getDatabase, ref, set, get, update, remove } from "firebase/database";
// import { initializeApp } from 'firebase/app'; // Asegúrate de que initializeApp esté importado

const { getDatabase, ref, set, get, update, remove } = firebase.database;
const { initializeApp } = firebase.app;

const firebaseConfig = {
    // ... tu configuración de Firebase aquí
    apiKey: "AIzaSyCiWtDTVTG3VTs6JfupUsFmL8S4JqpqCXA",
    authDomain: "pigmeaproduccion.firebaseapp.com",
    databaseURL: "https://pigmeaproduccion-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "pigmeaproduccion",
    storageBucket: "pigmeaproduccion.firebasestorage.app",
    messagingSenderId: "70067446729",
    appId: "1:70067446729:web:ef03131d039073dc49fe18"
};

const app = initializeApp(firebaseConfig);

const StorageService = {
    STORAGE_KEY: 'flexibleDataApp',
    db: getDatabase(), //  <---  Añade esto

    /**
     * Inicializa el almacenamiento con datos predeterminados si no existe
     */
    initializeStorage() {
        // Comentamos la inicialización de localStorage
        // if (!localStorage.getItem(this.STORAGE_KEY)) {
        //  const initialData = {
        //      config: {
        //          title: "Sistema de Registro de Datos",
        //          description: "Registre sus datos de manera flexible y personalizada"
        //      },
        //      entities: [],
        //      fields: [],
        //      records: []
        //  };
        //  localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initialData));
        // }
    
        // Inicializar la base de datos con datos predeterminados si no existen
        // (Esto es solo un ejemplo, puedes adaptarlo a tus necesidades)
        const dbRef = ref(this.db, 'appData');
        get(dbRef).then((snapshot) => {
            if (!snapshot.exists()) {
                const initialData = {
                    config: {
                        title: "Sistema de Registro de Datos",
                        description: "Registre sus datos de manera flexible y personalizada"
                    },
                    entities: [],
                    fields: [],
                    records: []
                };
                set(dbRef, initialData);
            }
        }).catch((error) => {
            console.error("Error al inicializar la base de datos:", error);
        });
    },

    /**
     * Obtiene todos los datos del almacenamiento
     * @returns {Object} Datos completos de la aplicación
     */
    getData() {
        // Modificamos para obtener datos de Realtime Database
        const dbRef = ref(this.db, 'appData');
        return get(dbRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    return snapshot.val();
                } else {
                    return {
                        config: {
                            title: "Sistema de Registro de Datos",
                            description: "Registre sus datos de manera flexible y personalizada"
                        },
                        entities: [],
                        fields: [],
                        records: []
                    }; // Devuelve estructura vacía si no hay datos
                }
            })
            .catch((error) => {
                console.error("Error al obtener los datos:", error);
                return null; // O una estructura de datos vacía, según tu lógica
            });
    },

    /**
     * Guarda los datos en el almacenamiento
     * @param {Object} data Datos completos a guardar
     */
    saveData(data) {
        // Modificamos para guardar datos en Realtime Database
        const dbRef = ref(this.db, 'appData');
        return set(dbRef, data)
            .then(() => {
                return true; // Indica éxito al guardar
            })
            .catch((error) => {
                console.error("Error al guardar los datos:", error);
                return false; // Indica fallo al guardar
            });
    },

    /**
     * Actualiza la configuración general
     * @param {Object} config Objeto con la configuración
     */
    updateConfig(config) {
        // Modificamos para actualizar datos en Realtime Database
        const data = this.getData();
        data.then(resolve => {
            if(resolve) {
                resolve.config = config;
                this.saveData(resolve);
            }
        })
    },

    /**
     * Obtiene la configuración actual
     * @returns {Object} Configuración de la aplicación
     */
    getConfig() {
        // Modificamos para obtener datos de Realtime Database
        return this.getData().then(resolve => {
            if(resolve){
                return resolve.config;
            }
        });
    },

    // Métodos de exportación e importación
    
    /**
     * Exporta todos los datos como cadena JSON
     * @returns {string} Datos en formato JSON
     */
    exportData() {
        // Modificamos para exportar datos de Realtime Database
        return this.getData().then(resolve => {
            if(resolve){
                return JSON.stringify(resolve, null, 2);
            }
        });
    },

    /**
     * Importa datos desde una cadena JSON
     * @param {string} jsonData Datos en formato JSON
     * @returns {boolean} Éxito de la importación
     */
    importData(jsonData) {
        // Modificamos para importar datos a Realtime Database
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

export default StorageService;