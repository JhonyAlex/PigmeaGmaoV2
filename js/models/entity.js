import StorageService from '../models/storage.js';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../app.js';

const storageService = new StorageService();

class Entity {
    constructor(name, fields = [], id = null) {
        this.id = id || this.generateId();
        this.name = name;
        this.fields = fields;
    }

    generateId() {
        return 'entity_' + Date.now() + Math.random().toString(36).substr(2, 9);
    }

    static async get(id) {
        try {
            const entityData = await storageService.getItem(`entities/${id}`);
            if (entityData) {
                return new Entity(entityData.name, entityData.fields, id);
            }
            return null;
        } catch (error) {
            console.error('Error fetching entity:', error);
            return null;
        }
    }

    static async getAll() {
      try {
        const querySnapshot = await getDocs(collection(db, "entities"));
        const allEntities = querySnapshot.docs.map(doc => {
          return new Entity(doc.data().name, doc.data().fields, doc.id);
        });
        return allEntities;
      } catch (error) {
        console.error('Error fetching all entities:', error);
        return [];
      }
    }

    async save() {
        try {
            const entityData = { name: this.name, fields: this.fields };
            await storageService.setItem(`entities/${this.id}`, entityData);
            return true;
        } catch (error) {
            console.error('Error saving entity:', error);
            return false;
        }
    }

    async update(updates) {
        try {
            await storageService.updateItem(`entities/${this.id}`, updates);
            Object.assign(this, updates);
            return true;
        } catch (error) {
            console.error('Error updating entity:', error);
            return false;
        }
    }

    async delete() {
        try {
            //delete all records associated to the entity
            const allRecords = await storageService.getItem(`data/initialData`);
            if(allRecords){
              const recordsToDelete = allRecords.records.filter(record => record.entityId === this.id);
              recordsToDelete.forEach(async record => {
                await storageService.removeItem(`records/${record.id}`);
              });
            }
            await storageService.removeItem(`entities/${this.id}`);
            return true;
        } catch (error) {
            console.error('Error deleting entity:', error);
            return false;
        }
    }
}

export default Entity;