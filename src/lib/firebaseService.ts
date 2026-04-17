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
  Timestamp,
  updateDoc,
  deleteDoc,
  limit,
  startAfter
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { BrainMemory, Message, KnowledgeItem, ChatSession, MarketingSkill } from '../types';
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

  async updateMemory(id: string, memory: Partial<Omit<BrainMemory, 'id' | 'createdAt' | 'embedding'>>) {
    if (!auth.currentUser) return { error: 'User not authenticated' };
    const path = `users/${auth.currentUser.uid}/brainMemories/${id}`;
    
    try {
      const dataToUpdate: any = { ...memory };
      
      if (memory.content) {
        dataToUpdate.embedding = await generateEmbedding(memory.content);
      }
      
      await updateDoc(doc(db, path), dataToUpdate);
      return { error: null };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      return { error };
    }
  },

  async deleteMemory(id: string) {
    if (!auth.currentUser) return { error: 'User not authenticated' };
    const path = `users/${auth.currentUser.uid}/brainMemories/${id}`;
    try {
      await deleteDoc(doc(db, path));
      return { error: null };
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      return { error };
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

  async getMessages(chatId: string, lastVisible?: any, limitCount = 20) {
    if (!auth.currentUser) return { data: [], lastVisible: null, error: 'User not authenticated' };
    const path = `users/${auth.currentUser.uid}/chats/${chatId}/messages`;
    try {
      let q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(limitCount));
      
      if (lastVisible) {
        q = query(collection(db, path), orderBy('createdAt', 'desc'), startAfter(lastVisible), limit(limitCount));
      }
      
      const snapshot = await getDocs(q);
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString()
      })).reverse() as unknown as Message[];
      
      return { data: messages, lastVisible: lastDoc, error: null };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return { data: [], lastVisible: null, error };
    }
  },

  async deleteAllChats() {
    if (!auth.currentUser) return { error: 'User not authenticated' };
    const path = `users/${auth.currentUser.uid}/chats`;
    try {
      const snapshot = await getDocs(collection(db, path));
      const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, path, d.id)));
      await Promise.all(deletePromises);
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
  },

  // Custom Agents
  async saveCustomAgent(agent: Omit<MarketingSkill, 'id'>) {
    if (!auth.currentUser) return { error: 'User not authenticated' };
    const path = `users/${auth.currentUser.uid}/customAgents`;
    try {
      const cleanAgent = JSON.parse(JSON.stringify(agent));
      const docRef = await addDoc(collection(db, path), {
        ...cleanAgent,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { data: { ...cleanAgent, id: docRef.id }, error: null };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      return { data: null, error };
    }
  },

  async getCustomAgents() {
    if (!auth.currentUser) return { data: [], error: 'User not authenticated' };
    const path = `users/${auth.currentUser.uid}/customAgents`;
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const agents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString()
      })) as unknown as MarketingSkill[];
      return { data: agents, error: null };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return { data: [], error };
    }
  },

  async updateCustomAgent(agentId: string, data: Partial<MarketingSkill>) {
    if (!auth.currentUser) return { error: 'User not authenticated' };
    const path = `users/${auth.currentUser.uid}/customAgents/${agentId}`;
    try {
      const cleanData = JSON.parse(JSON.stringify(data));
      await setDoc(doc(db, path), { ...cleanData, updatedAt: serverTimestamp() }, { merge: true });
      return { error: null };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      return { error };
    }
  },

  async deleteCustomAgent(agentId: string) {
    if (!auth.currentUser) return { error: 'User not authenticated' };
    const path = `users/${auth.currentUser.uid}/customAgents/${agentId}`;
    try {
      await deleteDoc(doc(db, path));
      return { error: null };
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      return { error };
    }
  }
};
