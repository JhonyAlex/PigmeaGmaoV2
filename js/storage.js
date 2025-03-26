// js/storage.js
const Storage = (() => {
    const ENTITIES_KEY = 'appData_entities';
    const FIELDS_KEY = 'appData_fields';
    const REGISTRATIONS_KEY = 'appData_registrations';
    const SETTINGS_KEY = 'appData_settings';

    // --- Funciones Auxiliares ---
    const getData = (key, defaultValue = []) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error(`Error reading ${key} from localStorage:`, e);
            return defaultValue;
        }
    };

    const saveData = (key, data) => {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`Error saving ${key} to localStorage:`, e);
            // Podríamos añadir aquí una alerta al usuario si el localStorage está lleno
            alert('Error: No se pudo guardar la información. Posiblemente el almacenamiento está lleno.');
        }
    };

    // --- Entidades ---
    const getEntities = () => getData(ENTITIES_KEY);
    const saveEntity = (entity) => {
        const entities = getEntities();
        entities.push(entity);
        saveData(ENTITIES_KEY, entities);
    };
    const updateEntity = (updatedEntity) => {
        let entities = getEntities();
        entities = entities.map(e => e.id === updatedEntity.id ? updatedEntity : e);
        saveData(ENTITIES_KEY, entities);
    };
    const deleteEntity = (entityId) => {
        let entities = getEntities();
        entities = entities.filter(e => e.id !== entityId);
        saveData(ENTITIES_KEY, entities);
        // Opcional: Eliminar registros asociados a esta entidad
        // deleteRegistrationsByEntity(entityId);
    };
     const getEntityById = (entityId) => getEntities().find(e => e.id === entityId);


    // --- Campos Personalizados ---
    const getFields = () => getData(FIELDS_KEY);
    const saveField = (field) => {
        const fields = getFields();
        fields.push(field);
        saveData(FIELDS_KEY, fields);
    };
    const updateField = (updatedField) => { // Asumiendo que editar campos es necesario
        let fields = getFields();
        fields = fields.map(f => f.id === updatedField.id ? updatedField : f);
        saveData(FIELDS_KEY, fields);
    };
    const deleteField = (fieldId) => {
        let fields = getFields();
        fields = fields.filter(f => f.id !== fieldId);
        saveData(FIELDS_KEY, fields);
        // Importante: Desasociar este campo de todas las entidades
        const entities = getEntities();
        entities.forEach(entity => {
            entity.associatedFieldIds = entity.associatedFieldIds.filter(id => id !== fieldId);
        });
        saveData(ENTITIES_KEY, entities);
    };
    const getFieldById = (fieldId) => getFields().find(f => f.id === fieldId);
    const getFieldsByIds = (ids) => {
        const allFields = getFields();
        return ids.map(id => allFields.find(f => f.id === id)).filter(f => f); // Filtra nulos si algún ID no se encuentra
    };


    // --- Registros ---
    const getRegistrations = () => {
        const regs = getData(REGISTRATIONS_KEY);
        // Asegurar orden cronológico (más recientes primero)
        return regs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    };
    const saveRegistration = (registration) => {
        const registrations = getData(REGISTRATIONS_KEY); // Obtener sin ordenar aquí
        registrations.push(registration);
        saveData(REGISTRATIONS_KEY, registrations);
    };
     const deleteRegistration = (regId) => { // Necesario si permitimos borrar registros individuales
        let registrations = getData(REGISTRATIONS_KEY);
        registrations = registrations.filter(r => r.id !== regId);
        saveData(REGISTRATIONS_KEY, registrations);
    };
    // const deleteRegistrationsByEntity = (entityId) => { ... } // Implementar si es necesario


    // --- Configuración ---
    const getSettings = () => getData(SETTINGS_KEY, { title: 'Registro Genérico', description: 'Seleccione una entidad y complete los datos.' });
    const saveSettings = (settings) => {
        saveData(SETTINGS_KEY, settings);
    };

    // --- Import/Export ---
    const getAllData = () => ({
        entities: getEntities(),
        fields: getFields(),
        registrations: getData(REGISTRATIONS_KEY), // Exportar sin ordenar
        settings: getSettings()
    });

    const importAllData = (jsonData, overwrite = true) => {
        try {
            const data = JSON.parse(jsonData);
            // Validaciones básicas de estructura
            if (!data || typeof data !== 'object' || !Array.isArray(data.entities) || !Array.isArray(data.fields) || !Array.isArray(data.registrations) || typeof data.settings !== 'object') {
                throw new Error('Formato de archivo JSON inválido.');
            }

            if (overwrite) {
                saveData(ENTITIES_KEY, data.entities);
                saveData(FIELDS_KEY, data.fields);
                saveData(REGISTRATIONS_KEY, data.registrations);
                saveData(SETTINGS_KEY, data.settings);
            } else {
                // Lógica de fusión (más compleja, podría ser simplemente añadir sin duplicar IDs)
                // Por simplicidad, empezamos con overwrite.
                console.warn('La fusión de datos no está implementada, se sobrescribirá.');
                saveData(ENTITIES_KEY, data.entities);
                saveData(FIELDS_KEY, data.fields);
                saveData(REGISTRATIONS_KEY, data.registrations);
                saveData(SETTINGS_KEY, data.settings);
            }
            return true; // Éxito
        } catch (e) {
            console.error('Error al importar datos:', e);
            alert(`Error al importar: ${e.message}`);
            return false; // Fallo
        }
    };


    return {
        getEntities, saveEntity, updateEntity, deleteEntity, getEntityById,
        getFields, saveField, updateField, deleteField, getFieldById, getFieldsByIds,
        getRegistrations, saveRegistration, deleteRegistration,
        getSettings, saveSettings,
        getAllData, importAllData
    };
})();