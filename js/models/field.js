import StorageService from '../models/storage.js';

const storageService = new StorageService();

class Field {
    constructor(name, type, entityId, id = null, options = [], required = false, useForRecordsTable = false, isColumn3 = false, isColumn4 = false, isColumn5 = false, useForComparativeReports = false, isHorizontalAxis = false, isCompareField = false) {
        this.id = id || this.generateId();
        this.name = name;
        this.type = type;
        this.entityId = entityId;
        this.options = options;
        this.required = required;
        this.useForRecordsTable = useForRecordsTable;
        this.isColumn3 = isColumn3;
        this.isColumn4 = isColumn4;
        this.isColumn5 = isColumn5;
        this.useForComparativeReports = useForComparativeReports;
        this.isHorizontalAxis = isHorizontalAxis;
        this.isCompareField = isCompareField;
    }

    generateId() {
        return 'field_' + Date.now() + Math.random().toString(36).substr(2, 9);
    }

    static async get(id) {
        try {
            const fieldData = await storageService.getItem(`fields/${id}`);
            if (fieldData) {
                return new Field(
                    fieldData.name,
                    fieldData.type,
                    fieldData.entityId,
                    id,
                    fieldData.options,
                    fieldData.required,
                    fieldData.useForRecordsTable,
                    fieldData.isColumn3,
                    fieldData.isColumn4,
                    fieldData.isColumn5,
                    fieldData.useForComparativeReports,
                    fieldData.isHorizontalAxis,
                    fieldData.isCompareField
                );
            }
            return null;
        } catch (error) {
            console.error('Error fetching field:', error);
            return null;
        }
    }

    static async getAll() {
        try {
            const initialData = await storageService.getItem(`data/initialData`);
            if(!initialData || !initialData.fields){
                return [];
            }
            const allFields = [];
            for (const fieldId of initialData.fields) {
                const fieldData = await storageService.getItem(`fields/${fieldId}`);
                if (fieldData) {
                    allFields.push(new Field(
                        fieldData.name,
                        fieldData.type,
                        fieldData.entityId,
                        fieldId,
                        fieldData.options,
                        fieldData.required,
                        fieldData.useForRecordsTable,
                        fieldData.isColumn3,
                        fieldData.isColumn4,
                        fieldData.isColumn5,
                        fieldData.useForComparativeReports,
                        fieldData.isHorizontalAxis,
                        fieldData.isCompareField
                    ));
                }
            }
            return allFields;
        } catch (error) {
            console.error('Error fetching all fields:', error);
            return [];
        }
    }

    async save() {
        try {
            const fieldData = { 
                name: this.name, 
                type: this.type, 
                entityId: this.entityId,
                options: this.options,
                required: this.required,
                useForRecordsTable: this.useForRecordsTable,
                isColumn3: this.isColumn3,
                isColumn4: this.isColumn4,
                isColumn5: this.isColumn5,
                useForComparativeReports: this.useForComparativeReports,
                isHorizontalAxis: this.isHorizontalAxis,
                isCompareField: this.isCompareField
            };
            await storageService.setItem(`fields/${this.id}`, fieldData);

            let data = await storageService.getItem(`data/initialData`);
            if (!data.fields.includes(this.id)){
                data.fields.push(this.id);
            }
            await storageService.setItem(`data/initialData`, data);

            return true;
        } catch (error) {
            console.error('Error saving field:', error);
            return false;
        }
    }

    async update(updates) {
        try {
            await storageService.updateItem(`fields/${this.id}`, updates);
            Object.assign(this, updates);
            return true;
        } catch (error) {
            console.error('Error updating field:', error);
            return false;
        }
    }

    async delete() {
        try {
            await storageService.removeItem(`fields/${this.id}`);

            let data = await storageService.getItem(`data/initialData`);
            data.fields = data.fields.filter(fieldId => fieldId !== this.id);
            await storageService.setItem(`data/initialData`, data);

            return true;
        } catch (error) {
            console.error('Error deleting field:', error);
            return false;
        }
    }
}

export default Field;