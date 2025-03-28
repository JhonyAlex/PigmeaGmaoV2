import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getDatabase, ref, set, get } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js';

const firebaseConfig = {
    apiKey: "AIzaSyCiWtDTVTG3VTs6JfupUsFmL8S4JqpqCXA",
    authDomain: "pigmeaproduccion.firebaseapp.com",
    databaseURL: "https://pigmeaproduccion-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "pigmeaproduccion",
    storageBucket: "pigmeaproduccion.firebasestorage.app",
    messagingSenderId: "70067446729",
    appId: "1:70067446729:web:ef03131d039073dc49fe18"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app); // Inicializa Firebase Storage

export class StorageService {
    constructor() {
        this.database = getDatabase(app); // Utiliza la instancia de app para el database
        this.storage = storage; // Almacena la instancia de storage
    }

    STORAGE_KEY = 'flexibleDataApp';
    db = this.database; // Utiliza la instancia de la base de datos de la inicialización

    initializeStorage() {
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
    }

    getData() {
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
                    };
                }
            })
            .catch((error) => {
                console.error("Error al obtener los datos:", error);
                return null;
            });
    }

    saveData(data) {
        const dbRef = ref(this.db, 'appData');
        return set(dbRef, data)
            .then(() => {
                return true;
            })
            .catch((error) => {
                console.error("Error al guardar los datos:", error);
                return false;
            });
    }

    updateConfig(config) {
        this.getData().then(resolve => {
            if (resolve) {
                resolve.config = config;
                this.saveData(resolve);
            }
        });
    }

    getConfig() {
        return this.getData().then(resolve => {
            if (resolve) {
                return resolve.config;
            }
        });
    }

    exportData() {
        return this.getData().then(resolve => {
            if (resolve) {
                return JSON.stringify(resolve, null, 2);
            }
        });
    }

    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);

            if (!data.config || !data.entities || !data.fields || !data.records) {
                throw new Error("Estructura de datos inválida");
            }

            return this.saveData(data); // Usa saveData para guardar en Firebase
        } catch (e) {
            console.error("Error al importar datos:", e);
            return false;
        }
    }
}

export default StorageService;