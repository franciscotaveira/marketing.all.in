import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  doc, 
  setDoc, 
  getDoc,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { BrainMemory, Message, BrandProfile, KnowledgeItem, ChatSession } from '../types';
import { generateEmbedding, cosineSimilarity } from '../services/embeddingService';

export const firebaseService = {
  // Brain Memories
  async saveMemory(memory: Omit<BrainMemory, 'id' | 'createdAt' | 'embedding'>) {
    if (!auth.currentUser) return { error: 'User not authenticated' };
    const path = `users/${auth.currentUser.uid}/brainMemories`;
    
    // Gerar embedding
    const embedding = await generateEmbedding(memory.content);
    
    try {
      const cleanMemory = JSON.parse(JSON.stringify(memory));
      const docRef = await addDoc(collection(db, path), {
        ...cleanMemory,
        embedding,
        createdAt: serverTimestamp()
      });
      return { data: { ...cleanMemory, id: docRef.id, embedding }, error: null };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      return { data: null, error };
    }
  },

  async getMemories(agentId?: string) {
    if (!auth.currentUser) return { data: [], error: 'User not authenticated' };
    const path = `users/${auth.currentUser.uid}/brainMemories`;
    try {
      let q = query(collection(db, path), orderBy('createdAt', 'desc'));
      if (agentId) {
        q = query(collection(db, path), where('agentId', '==', agentId), orderBy('createdAt', 'desc'));
      }
      const snapshot = await getDocs(q);
      const memories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString()
      })) as unknown as BrainMemory[];
      return { data: memories, error: null };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return { data: [], error };
    }
  },

  async getRelevantMemories(queryText: string, agentId?: string, limit = 5) {
    if (!auth.currentUser) return { data: [], error: 'User not authenticated' };
    
    // 1. Gerar embedding da consulta
    const queryEmbedding = await generateEmbedding(queryText);
    
    const path = `users/${auth.currentUser.uid}/brainMemories`;
    try {
      // 2. Buscar memórias (limitado para não estourar memória no cliente)
      let q = query(collection(db, path));
      if (agentId) {
        q = query(collection(db, path), where('agentId', '==', agentId));
      }
      const snapshot = await getDocs(q);
      
      // 3. Calcular similaridade no lado do cliente (para protótipo)
      const memories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString()
      })) as unknown as BrainMemory[];
      
      const scoredMemories = memories
        .filter(m => m.embedding)
        .map(m => ({
          ...m,
          similarity: cosineSimilarity(queryEmbedding, m.embedding!)
        }))
        .sort((a, b) => b.similarity - a.similarity);
        
      return { data: scoredMemories.slice(0, limit), error: null };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return { data: [], error };
    }
  },

  // Chats
  async createChat(title: string) {
    if (!auth.currentUser) return { error: 'User not authenticated' };
    const path = `users/${auth.currentUser.uid}/chats`;
    try {
      const docRef = await addDoc(collection(db, path), {
        title,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { data: { id: docRef.id, title, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, error: null };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      return { data: null, error };
    }
  },

  async getChats() {
    if (!auth.currentUser) return { data: [], error: 'User not authenticated' };
    const path = `users/${auth.currentUser.uid}/chats`;
    try {
      const q = query(collection(db, path), orderBy('updatedAt', 'desc'));
      const snapshot = await getDocs(q);
      const chats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        updatedAt: (doc.data().updatedAt as Timestamp)?.toDate().toISOString() || new Date().toISOString()
      })) as ChatSession[];
      return { data: chats, error: null };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return { data: [], error };
    }
  },

  async updateChat(chatId: string, data: Partial<ChatSession>) {
    if (!auth.currentUser) return { error: 'User not authenticated' };
    const path = `users/${auth.currentUser.uid}/chats/${chatId}`;
    try {
      await setDoc(doc(db, path), { ...data, updatedAt: serverTimestamp() }, { merge: true });
      return { error: null };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      return { error };
    }
  },

  async deleteChat(chatId: string) {
    if (!auth.currentUser) return { error: 'User not authenticated' };
    const path = `users/${auth.currentUser.uid}/chats/${chatId}`;
    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, path));
      return { error: null };
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      return { error };
    }
  },

  // Messages
  async saveMessage(chatId: string, message: Omit<Message, 'createdAt'>) {
    if (!auth.currentUser) return { error: 'User not authenticated' };
    const path = `users/${auth.currentUser.uid}/chats/${chatId}/messages`;
    try {
      // Remove undefined values to prevent Firestore errors
      const cleanMessage = JSON.parse(JSON.stringify(message));
      
      const docRef = await addDoc(collection(db, path), {
        ...cleanMessage,
        createdAt: serverTimestamp()
      });
      return { data: { ...cleanMessage, id: docRef.id }, error: null };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      return { data: null, error };
    }
  },

  async getMessages(chatId: string) {
    if (!auth.currentUser) return { data: [], error: 'User not authenticated' };
    const path = `users/${auth.currentUser.uid}/chats/${chatId}/messages`;
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'asc'));
      const snapshot = await getDocs(q);
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString()
      })) as unknown as Message[];
      return { data: messages, error: null };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return { data: [], error };
    }
  },

  // Brand Profiles
  async saveBrandProfile(profile: BrandProfile) {
    if (!auth.currentUser) return { error: 'User not authenticated' };
    
    // Use the provided ID or generate a new one
    const profileId = profile.id || crypto.randomUUID();
    const path = `users/${auth.currentUser.uid}/brandProfiles/${profileId}`;
    
    try {
      const cleanProfile = JSON.parse(JSON.stringify({ ...profile, id: profileId }));
      await setDoc(doc(db, path), cleanProfile);
      return { data: cleanProfile, error: null };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      return { data: null, error };
    }
  },

  async getBrandProfiles() {
    if (!auth.currentUser) return { data: [], error: 'User not authenticated' };
    const path = `users/${auth.currentUser.uid}/brandProfiles`;
    try {
      const snapshot = await getDocs(collection(db, path));
      const profiles = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as BrandProfile[];
      return { data: profiles, error: null };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return { data: [], error };
    }
  },

  async deleteBrandProfile(profileId: string) {
    if (!auth.currentUser) return { error: 'User not authenticated' };
    const path = `users/${auth.currentUser.uid}/brandProfiles/${profileId}`;
    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, path));
      return { error: null };
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      return { error };
    }
  },

  // Knowledge Base
  async saveKnowledge(knowledge: Omit<KnowledgeItem, 'id' | 'createdAt'>) {
    if (!auth.currentUser) return { error: 'User not authenticated' };
    const path = `users/${auth.currentUser.uid}/knowledgeBase`;
    try {
      const cleanKnowledge = JSON.parse(JSON.stringify(knowledge));
      const docRef = await addDoc(collection(db, path), {
        ...cleanKnowledge,
        createdAt: serverTimestamp()
      });
      return { data: { ...cleanKnowledge, id: docRef.id }, error: null };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      return { data: null, error };
    }
  },

  async getKnowledge() {
    if (!auth.currentUser) return { data: [], error: 'User not authenticated' };
    const path = `users/${auth.currentUser.uid}/knowledgeBase`;
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const knowledge = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString()
      })) as unknown as KnowledgeItem[];
      return { data: knowledge, error: null };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return { data: [], error };
    }
  }
};
