import { db } from '../app.js';
import { collection, doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";

class StorageService {
    async setItem(key, value) {
        try {
            const collectionName = key.split('/')[0];
            const docId = key.split('/')[1];
            const docRef = doc(collection(db, collectionName), docId);
            await setDoc(docRef, value, { merge: true });
        } catch (error) {
            console.error("Error setting item in Firestore:", error);
            throw error;
        }
    }

    async getItem(key) {
        try {
            const collectionName = key.split('/')[0];
            const docId = key.split('/')[1];
            const docRef = doc(collection(db, collectionName), docId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data();
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error getting item from Firestore:", error);
            throw error;
        }
    }

    async removeItem(key) {
        try {
            const collectionName = key.split('/')[0];
            const docId = key.split('/')[1];
            const docRef = doc(collection(db, collectionName), docId);
            await deleteDoc(docRef);
        } catch (error) {
            console.error("Error removing item from Firestore:", error);
            throw error;
        }
    }

    async updateItem(key, updates) {
        try {
            const collectionName = key.split('/')[0];
            const docId = key.split('/')[1];
            const docRef = doc(collection(db, collectionName), docId);
            await updateDoc(docRef, updates);
        } catch (error) {
            console.error("Error updating item in Firestore:", error);
            throw error;
        }
    }
}

export default StorageService;