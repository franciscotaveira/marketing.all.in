import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MoreVertical, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Circle,
  Calendar as CalendarIcon,
  Filter,
  Search,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Calendar,
  Trash2,
  Edit2,
  Flag,
  ArrowRight,
  X,
  Bell,
  Tag,
  Loader2,
  TrendingUp,
  TrendingDown,
  Image as ImageIcon,
  User,
  Brain,
  Check,
  Activity,
  Bot,
  Target,
  Settings,
  Zap,
  PauseCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, BrainMemory, MarketingSkill, InteractionLog } from '../types';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { firebaseService } from '../lib/firebaseService';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  orderBy,
  Timestamp,
  where,
  limit
} from 'firebase/firestore';
import { orchestrateRequest } from '../services/orchestrator';
import { MARKETING_SKILLS } from '../constants';
import { cn } from '../lib/utils';
import { ConfirmationModal } from './ConfirmationModal';

const PRIORITY_COLORS = {
  low: 'text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-sm',
  medium: 'text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-sm',
  high: 'text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-sm',
};

const PRIORITY_ICONS = {
  low: TrendingDown,
  medium: Activity,
  high: TrendingUp,
};

const STATUS_COLUMNS = [
  { id: 'prospect', name: 'Leads / Prospecção', icon: Target, color: 'text-blue-500' },
  { id: 'setup', name: 'Onboarding & n8n', icon: Settings, color: 'text-yellow-500' },
  { id: 'active', name: 'SDR Ativo', icon: Zap, color: 'text-emerald-500' },
  { id: 'paused', name: 'Pausado / Churn', icon: PauseCircle, color: 'text-rose-500' },
];

const INITIAL_NEW_TASK = { 
  title: '', 
  description: '', 
  priority: 'medium' as 'low' | 'medium' | 'high', 
  dueDate: '',
  tags: '',
  reminderAt: '',
  image: '',
  assignedTo: ''
};

interface TaskBoardProps {
  allSkills?: MarketingSkill[];
}

export default function TaskBoard({ allSkills = [] }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddingTask, setIsAddingTask] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTask, setNewTask] = useState(INITIAL_NEW_TASK);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignedSearchQuery, setAssignedSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'prospect' | 'setup' | 'active' | 'paused' | 'todo' | 'in-progress' | 'done'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'overdue'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'priority' | 'dueDate' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [savingToBrain, setSavingToBrain] = useState<string | null>(null);
  const [savedToBrain, setSavedToBrain] = useState<string[]>([]);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<{
    analysis: string;
    prioritizedTasks: { id: string; reason: string }[];
  } | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<string[]>([]);
  const [settingReminderTask, setSettingReminderTask] = useState<Task | null>(null);
  const [reminderDateTime, setReminderDateTime] = useState('');
  const [editModalTab, setEditModalTab] = useState<'details' | 'history'>('details');
  const [handoffMessage, setHandoffMessage] = useState('');
  
  const handleSendInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask || !handoffMessage.trim()) return;
    
    const newInteraction: InteractionLog = {
      id: Math.random().toString(36).substring(2),
      role: 'human',
      message: handoffMessage.trim(),
      timestamp: new Date()
    };

    setEditingTask({
      ...editingTask,
      interactions: [...(editingTask.interactions || []), newInteraction]
    });
    setHandoffMessage('');
  };

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const handleSetReminder = async () => {
    if (!settingReminderTask || !reminderDateTime || !auth.currentUser) return;

    try {
      const taskRef = doc(db, 'users', auth.currentUser.uid, 'tasks', settingReminderTask.id);
      await updateDoc(taskRef, {
        reminderAt: Timestamp.fromDate(new Date(reminderDateTime)),
        updatedAt: serverTimestamp()
      });
      setSettingReminderTask(null);
      setReminderDateTime('');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'tasks');
    }
  };

  const handleRemoveReminder = async (taskId: string) => {
    if (!auth.currentUser) return;

    try {
      const taskRef = doc(db, 'users', auth.currentUser.uid, 'tasks', taskId);
      await updateDoc(taskRef, {
        reminderAt: null,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'tasks');
    }
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'tasks'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(taskList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tasks');
    });

    return () => unsubscribe();
  }, []);

  const handleAddTask = async (status: string) => {
    if (!newTask.title.trim() || !auth.currentUser || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const tagsArray = newTask.tags.split(',').map(t => t.trim()).filter(t => t !== '');
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'tasks'), {
        title: newTask.title,
        description: newTask.description,
        status,
        priority: newTask.priority,
        tags: tagsArray,
        image: newTask.image || null,
        assignedTo: newTask.assignedTo || null,
        reminderAt: newTask.reminderAt ? Timestamp.fromDate(new Date(newTask.reminderAt)) : null,
        dueDate: newTask.dueDate ? Timestamp.fromDate(new Date(newTask.dueDate)) : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setNewTask(INITIAL_NEW_TASK);
      setIsAddingTask(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tasks');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limit file size to 1MB (Firestore limit is 1MB per doc, so base64 should be less)
      if (file.size > 800000) {
        alert("A imagem é muito grande. O limite é de 800KB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isEditing && editingTask) {
          setEditingTask({ ...editingTask, image: base64String });
        } else {
          setNewTask({ ...newTask, image: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveToBrain = async (task: Task) => {
    if (savingToBrain) return;
    setSavingToBrain(task.id);
    try {
      const memory: Omit<BrainMemory, 'id' | 'createdAt' | 'embedding'> = {
        agentId: task.assignedTo || 'general',
        title: `Tarefa Sináptica: ${task.title}`,
        content: `Contexto da Tarefa: ${task.title}\nDescrição: ${task.description || 'Sem descrição'}\nStatus Final: ${task.status}\nPrioridade: ${task.priority}\nTags: ${task.tags?.join(', ') || 'Nenhuma'}\nData de Conclusão: ${new Date().toLocaleString()}`,
        tags: [...(task.tags || []), 'task-memory', 'synaptic-brain', 'auto-learned'],
      };
      await firebaseService.saveMemory(memory);
      setSavedToBrain(prev => [...prev, task.id]);
      setTimeout(() => setSavedToBrain(prev => prev.filter(id => id !== task.id)), 3000);
    } catch (error) {
      console.error("Failed to save to brain:", error);
    } finally {
      setSavingToBrain(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault(); // Necessary to allow drop
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're actually leaving the column, not just moving between children
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    const taskId = e.dataTransfer.getData('taskId') || draggedTaskId;
    if (!taskId) return;

    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== newStatus) {
      await handleUpdateStatus(taskId, newStatus);
    }
    setDraggedTaskId(null);
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!auth.currentUser || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid, 'tasks', taskId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      setEditingTask(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'tasks');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    if (!auth.currentUser) return;
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid, 'tasks', taskId), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'tasks');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!auth.currentUser) return;
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'tasks', taskId));
      setTaskToDelete(null);
      if (editingTask?.id === taskId) setEditingTask(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'tasks');
    }
  };

  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<{
    taskId: string;
    suggestion: string;
    action: 'update_status' | 'add_subtask' | 'none';
    actionDetails?: any;
  } | null>(null);

  const handleApplySuggestion = async () => {
    if (!aiSuggestion || !auth.currentUser) return;
    
    try {
      const taskRef = doc(db, 'users', auth.currentUser.uid, 'tasks', aiSuggestion.taskId);
      
      if (aiSuggestion.action === 'update_status') {
        await updateDoc(taskRef, {
          status: aiSuggestion.actionDetails.newStatus,
          updatedAt: serverTimestamp()
        });
      } else if (aiSuggestion.action === 'add_subtask') {
        const task = tasks.find(t => t.id === aiSuggestion.taskId);
        if (task) {
          await updateDoc(taskRef, {
            description: (task.description ? task.description + '\n\n' : '') + `[IA] Próximo passo: ${aiSuggestion.actionDetails.subtaskTitle}`,
            updatedAt: serverTimestamp()
          });
        }
      }
      setAiSuggestion(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'tasks');
    }
  };

  const handleAIMagic = async (task: Task) => {
    if (!auth.currentUser) return;
    setIsAnalyzing(task.id);
    setAiSuggestion(null);
    
    try {
      const prompt = `
        Analise esta tarefa no Kanban:
        Título: ${task.title}
        Descrição: ${task.description || 'Sem descrição'}
        Status Atual: ${task.status}
        Prioridade: ${task.priority}
        
        Sua missão: Sugira a próxima ação ideal.
        Retorne APENAS um JSON no formato:
        {
          "suggestion": "Texto curto da sugestão (máx 2 frases)",
          "action": "update_status" | "add_subtask" | "none",
          "actionDetails": {
            "newStatus": "todo" | "in-progress" | "done",
            "subtaskTitle": "Título do sub-passo"
          }
        }
      `;

      const result = await orchestrateRequest(
        prompt,
        'productivity-strategist',
        'gemini-3-flash-preview',
        'Você é um assistente de produtividade que ajuda a mover tarefas no Kanban.',
        false,
        false,
        () => {},
        MARKETING_SKILLS
      );

      try {
        const parsed = JSON.parse(result.response.replace(/```json\n?|\n?```/g, '').trim());
        setAiSuggestion({
          taskId: task.id,
          ...parsed
        });
      } catch (e) {
        console.error("Failed to parse AI suggestion JSON", e);
      }

    } catch (error) {
      console.error('Error in AI Magic:', error);
    } finally {
      setIsAnalyzing(null);
    }
  };

  const handleOptimizeTasks = async () => {
    const pendingTasks = tasks.filter(t => t.status !== 'done');
    if (pendingTasks.length === 0 || !auth.currentUser) return;

    setIsOptimizing(true);
    setOptimizationResult(null);
    
    try {
      const taskData = pendingTasks.map(t => ({
        id: t.id,
        title: t.title,
        priority: t.priority,
        dueDate: t.dueDate ? (t.dueDate instanceof Timestamp ? t.dueDate.toDate().toLocaleDateString() : new Date(t.dueDate).toLocaleDateString()) : 'Sem prazo'
      }));

      const prompt = `
        Como um Estrategista de Produtividade, analise estas tarefas pendentes e sugira a melhor ordem de priorização baseada na criticidade (prioridade) e proximidade do prazo (dueDate).
        
        Tarefas:
        ${JSON.stringify(taskData, null, 2)}
        
        Retorne APENAS um JSON no formato:
        {
          "analysis": "Uma breve explicação da lógica de priorização usada.",
          "prioritizedTasks": [
            { "id": "id_da_tarefa", "reason": "Por que esta tarefa está nesta posição?" }
          ]
        }
      `;

      const result = await orchestrateRequest(
        prompt,
        'productivity-strategist',
        'gemini-3-flash-preview',
        'Você é um mestre em produtividade e gestão de tempo.',
        false,
        false,
        () => {},
        MARKETING_SKILLS
      );

      const parsed = JSON.parse(result.response.replace(/```json\n?|\n?```/g, '').trim());
      setOptimizationResult(parsed);
    } catch (error) {
      console.error('Error optimizing tasks:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const renderAISuggestion = (taskId: string) => {
    if (aiSuggestion?.taskId !== taskId) return null;
    return (
      <motion.div 
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="mt-3 p-3 bg-theme-orange/10 border border-theme-orange/20 rounded-xl"
      >
        <div className="flex items-start gap-2">
          <Bot className="w-4 h-4 text-theme-orange mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-theme-primary font-medium mb-2">{aiSuggestion.suggestion}</p>
            <div className="flex items-center gap-2">
              {aiSuggestion.action !== 'none' && (
                <button
                  onClick={handleApplySuggestion}
                  className="px-3 py-1 bg-theme-orange text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:opacity-90 transition-all shadow-lg shadow-orange-500/20"
                >
                  Aplicar
                </button>
              )}
              <button
                onClick={() => setAiSuggestion(null)}
                className="px-3 py-1 bg-theme-glass text-theme-secondary text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-theme-glass/80 transition-all"
              >
                Dispensar
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const filteredTasks = tasks
    .filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      
      let matchesDate = true;
      if (dateFilter !== 'all') {
        if (!t.dueDate) {
          matchesDate = false;
        } else {
          const dueDate = t.dueDate instanceof Timestamp ? t.dueDate.toDate() : new Date(t.dueDate);
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          const endOfDay = new Date(now);
          endOfDay.setHours(23, 59, 59, 999);
          
          if (dateFilter === 'today') {
            matchesDate = dueDate >= now && dueDate <= endOfDay;
          } else if (dateFilter === 'week') {
            const endOfWeek = new Date(now);
            endOfWeek.setDate(now.getDate() + 7);
            matchesDate = dueDate >= now && dueDate <= endOfWeek;
          } else if (dateFilter === 'overdue') {
            matchesDate = dueDate < now && t.status !== 'done';
          }
        }
      }
      
      const matchesAssigned = !assignedSearchQuery || 
        t.assignedTo?.toLowerCase().includes(assignedSearchQuery.toLowerCase());
      
      return matchesSearch && matchesPriority && matchesStatus && matchesDate && matchesAssigned;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'priority') {
        const priorityMap = { high: 3, medium: 2, low: 1 };
        comparison = priorityMap[a.priority] - priorityMap[b.priority];
      } else if (sortBy === 'dueDate') {
        const dateA = a.dueDate ? (a.dueDate instanceof Timestamp ? a.dueDate.toMillis() : new Date(a.dueDate).getTime()) : Infinity;
        const dateB = b.dueDate ? (b.dueDate instanceof Timestamp ? b.dueDate.toMillis() : new Date(b.dueDate).getTime()) : Infinity;
        comparison = dateA - dateB;
      } else if (sortBy === 'status') {
        const statusMap = { todo: 1, 'in-progress': 2, done: 3 };
        comparison = statusMap[a.status as keyof typeof statusMap] - statusMap[b.status as keyof typeof statusMap];
      } else {
        const dateA = a.createdAt ? (a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : new Date(a.createdAt).getTime()) : 0;
        const dateB = b.createdAt ? (b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : new Date(b.createdAt).getTime()) : 0;
        comparison = dateA - dateB;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const isOverdue = (dueDate: any) => {
    if (!dueDate) return false;
    const date = dueDate instanceof Timestamp ? dueDate.toDate() : new Date(dueDate);
    return date < new Date();
  };

  const isUpcoming = (dueDate: any) => {
    if (!dueDate) return false;
    const date = dueDate instanceof Timestamp ? dueDate.toDate() : new Date(dueDate);
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return date > now && date < tomorrow;
  };

  return (
    <div className="flex flex-col h-full bg-theme-surface border border-theme-glass rounded-3xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-theme-glass flex flex-col md:flex-row md:items-center justify-between gap-4 bg-theme-card/30">
        <div className="space-y-1">
          <h2 className="text-xl font-black tracking-tighter text-theme-primary flex items-center gap-3 uppercase italic">
            <LayoutGrid className="w-5 h-5 text-blue-500" />
            Gestão de <span className="text-blue-500">Clientes (SDR)</span>
          </h2>
          <p className="text-theme-secondary text-[10px] font-black uppercase tracking-[0.15em] opacity-40">Pipeline de Vendas e Integração WhatsApp.</p>
        </div>

        <div className="flex flex-wrap items-center justify-start md:justify-end gap-3 w-full md:w-auto">
          <div className="relative group w-full sm:w-auto flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-secondary group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text"
              placeholder="Buscar clientes por nome ou nicho..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 py-2.5 bg-theme-card border border-theme-glass rounded-xl text-sm text-theme-primary placeholder:text-theme-secondary/60 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all w-full sm:w-64 shadow-inner"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-theme-glass rounded-full text-theme-secondary opacity-40 hover:opacity-100 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="relative group w-full sm:w-auto flex-1 sm:flex-none">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-secondary opacity-30 group-focus-within:text-theme-blue transition-colors" />
            <select 
              value={assignedSearchQuery}
              onChange={(e) => setAssignedSearchQuery(e.target.value)}
              className="pl-10 pr-10 py-2.5 bg-theme-glass/40 border border-theme-glass/60 rounded-xl text-sm text-theme-primary focus:outline-none focus:border-theme-blue focus:bg-theme-glass/80 transition-all w-full sm:w-48 shadow-inner appearance-none cursor-pointer"
            >
              <option value="">Filtrar por SDR</option>
              {allSkills.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-secondary opacity-30 pointer-events-none" />
            {assignedSearchQuery && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setAssignedSearchQuery('');
                }}
                className="absolute right-8 top-1/2 -translate-y-1/2 p-0.5 hover:bg-theme-glass rounded-full text-theme-secondary opacity-50 hover:opacity-100 transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center bg-theme-glass border border-theme-glass rounded-xl p-1 w-full sm:w-auto justify-center gap-1">
            <button 
              onClick={() => setViewMode('kanban')}
              className={cn(
                "p-1.5 rounded-lg transition-all flex-1 sm:flex-none flex justify-center",
                viewMode === 'kanban' ? "bg-blue-500 text-white shadow-sm" : "text-theme-secondary hover:text-theme-primary hover:bg-theme-glass"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "p-1.5 rounded-lg transition-all flex-1 sm:flex-none flex justify-center",
                viewMode === 'list' ? "bg-blue-500 text-white shadow-sm" : "text-theme-secondary hover:text-theme-primary hover:bg-theme-glass"
              )}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={handleOptimizeTasks}
            disabled={isOptimizing || tasks.filter(t => t.status !== 'done' && t.status !== 'active').length === 0}
            className="btn-orange w-full sm:w-auto"
            title="Sugerir melhor ordem de setup de clientes"
          >
            {isOptimizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
            <span>Otimizar Setup Pendente</span>
          </button>

          <button 
            onClick={() => {
              setNewTask(INITIAL_NEW_TASK);
              setIsAddingTask('prospect');
              setViewMode('kanban');
            }}
            className="btn-primary w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Cliente</span>
          </button>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-1 px-3 py-1.5 bg-theme-glass border border-theme-glass rounded-xl flex-1 sm:flex-none justify-center shadow-sm">
              <Filter className="w-3.5 h-3.5 text-theme-secondary opacity-60" />
              <select 
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-theme-secondary focus:outline-none cursor-pointer hover:text-theme-primary transition-colors max-w-[80px] sm:max-w-none"
              >
                <option value="all" className="bg-theme-surface text-theme-primary">Prioridade: Todas</option>
                <option value="low" className="bg-theme-surface text-theme-primary">Baixa</option>
                <option value="medium" className="bg-theme-surface text-theme-primary">Média</option>
                <option value="high" className="bg-theme-surface text-theme-primary">Alta</option>
              </select>
            </div>

            <div className="flex items-center gap-1 px-3 py-1.5 bg-theme-glass border border-theme-glass rounded-xl flex-1 sm:flex-none justify-center shadow-sm">
              <Activity className="w-3.5 h-3.5 text-theme-secondary opacity-60" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-theme-secondary focus:outline-none cursor-pointer hover:text-theme-primary transition-colors max-w-[80px] sm:max-w-none"
              >
                <option value="all" className="bg-theme-surface text-theme-primary">Status: Todos</option>
                <option value="prospect" className="bg-theme-surface text-theme-primary">Prospecção</option>
                <option value="setup" className="bg-theme-surface text-theme-primary">Setup n8n</option>
                <option value="active" className="bg-theme-surface text-theme-primary">SDR Ativo</option>
                <option value="paused" className="bg-theme-surface text-theme-primary">Pausado</option>
              </select>
            </div>

            <div className="flex items-center gap-1 px-3 py-1.5 bg-theme-glass border border-theme-glass rounded-xl flex-1 sm:flex-none justify-center shadow-sm">
              <CalendarIcon className="w-3.5 h-3.5 text-theme-secondary opacity-60" />
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-theme-secondary focus:outline-none cursor-pointer hover:text-theme-primary transition-colors max-w-[80px] sm:max-w-none"
              >
                <option value="all" className="bg-theme-surface text-theme-primary">Data: Todas</option>
                <option value="today" className="bg-theme-surface text-theme-primary">Hoje</option>
                <option value="week" className="bg-theme-surface text-theme-primary">Esta Semana</option>
                <option value="overdue" className="bg-theme-surface text-theme-primary">Atrasados</option>
              </select>
            </div>

            <div className="flex items-center gap-1 px-3 py-1.5 bg-theme-glass border border-theme-glass rounded-xl flex-1 sm:flex-none justify-center shadow-sm">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-[10px] font-bold uppercase tracking-wider text-theme-secondary focus:outline-none cursor-pointer hover:text-theme-primary transition-colors max-w-[80px] sm:max-w-none"
              >
                <option value="createdAt" className="bg-theme-surface text-theme-primary">Criação</option>
                <option value="dueDate" className="bg-theme-surface text-theme-primary">Prazo</option>
                <option value="priority" className="bg-theme-surface text-theme-primary">Prioridade</option>
                <option value="status" className="bg-theme-surface text-theme-primary">Status</option>
              </select>
              <button 
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1 hover:bg-theme-glass rounded text-theme-secondary hover:text-theme-primary transition-all"
              >
                {sortOrder === 'asc' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {(priorityFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all' || searchQuery !== '' || assignedSearchQuery !== '') && (
              <button 
                onClick={() => {
                  setPriorityFilter('all');
                  setStatusFilter('all');
                  setDateFilter('all');
                  setSearchQuery('');
                  setAssignedSearchQuery('');
                }}
                className="chip bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500/20"
                title="Limpar Filtros"
              >
                <X className="w-3.5 h-3.5" />
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard CRM Metrics */}
      <div className="bg-theme-glass/5 px-6 py-4 border-b border-theme-glass grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Leads */}
        <div className="bg-theme-glass/20 border border-theme-glass/40 rounded-2xl p-4 flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-60 mb-1">Total de Leads</span>
          <span className="text-2xl font-bold text-theme-primary">{tasks.filter(t => t.status === 'prospect').length}</span>
        </div>
        {/* Setup */}
        <div className="bg-theme-glass/20 border border-theme-glass/40 rounded-2xl p-4 flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-60 mb-1">Em Setup</span>
          <span className="text-2xl font-bold text-yellow-500">{tasks.filter(t => t.status === 'setup').length}</span>
        </div>
        {/* SDR Ativo */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 opacity-80 mb-1">Atendimentos Ativos</span>
          <span className="text-2xl font-bold text-emerald-500">{tasks.filter(t => t.status === 'active').length}</span>
        </div>
        {/* Conversion */}
        <div className="bg-theme-glass/20 border border-theme-glass/40 rounded-2xl p-4 flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-60 mb-1">Taxa de Conversão</span>
          <span className="text-2xl font-bold text-blue-500">
            {tasks.length > 0 
              ? Math.round((tasks.filter(t => t.status === 'active').length / tasks.filter(t => t.status !== 'paused').length) * 100) || 0
              : 0}%
          </span>
        </div>
      </div>

      {/* Optimization Result Modal */}
      <AnimatePresence>
        {optimizationResult && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-theme-surface border border-theme-glass rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-theme-glass flex items-center justify-between bg-theme-surface/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-theme-orange/10 flex items-center justify-center relative">
                    <Bot className="w-5 h-5 text-theme-orange" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border-2 border-theme-surface shadow-sm">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-theme-primary flex items-center gap-2">
                      Otimização de Prioridades
                      <span className="px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[8px] font-black text-blue-500 uppercase tracking-widest">Google AI</span>
                    </h3>
                    <p className="text-[10px] text-theme-secondary uppercase tracking-widest font-black">Sugestão da Inteligência Artificial</p>
                  </div>
                </div>
                <button 
                  onClick={() => setOptimizationResult(null)}
                  className="p-2 hover:bg-theme-glass rounded-full text-theme-secondary transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="p-4 bg-theme-blue/5 border border-theme-blue/20 rounded-2xl">
                  <p className="text-xs text-theme-secondary leading-relaxed italic">"{optimizationResult.analysis}"</p>
                </div>

                <div className="space-y-3">
                  {optimizationResult.prioritizedTasks.map((item, index) => {
                    const task = tasks.find(t => t.id === item.id);
                    if (!task) return null;
                    return (
                      <div key={item.id} className="flex items-start gap-4 p-4 bg-theme-glass border border-theme-glass rounded-2xl group hover:border-theme-orange/30 transition-all">
                        <div className="w-8 h-8 rounded-lg bg-theme-surface border border-theme-glass flex items-center justify-center text-xs font-bold text-theme-secondary shrink-0 group-hover:bg-theme-orange group-hover:text-white transition-all">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-bold text-theme-primary truncate">{task.title}</h4>
                            <div className="flex items-center gap-1.5">
                              <span className={cn(
                                "px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border",
                                task.priority === 'high' ? "text-rose-500 border-rose-500/20 bg-rose-500/5" : 
                                task.priority === 'medium' ? "text-amber-500 border-amber-500/20 bg-amber-500/5" : 
                                "text-blue-500 border-blue-500/20 bg-blue-500/5"
                              )}>
                                {task.priority}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border border-theme-glass text-theme-secondary opacity-60">
                                {STATUS_COLUMNS.find(c => c.id === task.status)?.name}
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] text-theme-secondary leading-relaxed">{item.reason}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 border-t border-theme-glass bg-theme-surface/50 flex justify-end gap-3">
                <button 
                  onClick={() => setOptimizationResult(null)}
                  className="btn-secondary px-6"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kanban Board */}
      {viewMode === 'kanban' ? (
        <div className="flex-1 overflow-x-auto p-6 custom-scrollbar bg-gradient-to-b from-theme-glass/10 to-transparent">
          <div className="flex gap-6 h-full min-w-max">
            {STATUS_COLUMNS.filter(col => statusFilter === 'all' || col.id === statusFilter).map((col) => (
              <div 
                key={col.id} 
                className={cn(
                  "w-80 flex flex-col gap-4 rounded-3xl transition-all duration-300 relative",
                  draggedTaskId && tasks.find(t => t.id === draggedTaskId)?.status !== col.id 
                    ? "bg-theme-blue/5 border-2 border-dashed border-theme-blue/20" 
                    : "border-2 border-transparent",
                  dragOverColumn === col.id && "bg-theme-blue/10 border-theme-blue/40 scale-[1.02] shadow-2xl z-10"
                )}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
              >
            <div className="flex items-center justify-between px-3 py-2 bg-theme-glass/20 rounded-2xl border border-theme-glass/40 mb-2">
                  <div className="flex items-center gap-3">
                    <col.icon className={cn("w-4 h-4", col.color)} />
                    <span className="text-[11px] font-semibold tracking-tight text-theme-primary">{col.name}</span>
                    <span className="px-1.5 py-0.5 bg-theme-blue/10 border border-theme-blue/20 rounded-md text-[10px] font-medium text-theme-blue">
                      {filteredTasks.filter(t => t.status === col.id).length}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      setNewTask(INITIAL_NEW_TASK);
                      setIsAddingTask(col.id);
                    }}
                    className="p-1.5 hover:bg-theme-blue/10 rounded-xl text-theme-blue transition-all group border border-transparent hover:border-theme-blue/30"
                    title="Adicionar Cliente Rápido"
                  >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  </button>
                </div>

                <div className="flex-1 flex flex-col gap-3">
                  <AnimatePresence mode="popLayout">
                    {isAddingTask === col.id && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-theme-main/60 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-4 shadow-2xl"
                      >
                        <input 
                          autoFocus
                          placeholder="Nome do Cliente ou Projeto..."
                          value={newTask.title}
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddTask(col.id)}
                          className="w-full bg-theme-glass/20 border border-theme-glass/40 rounded-xl px-3 py-2 text-sm text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 mb-2 font-medium transition-all"
                        />
                        <textarea 
                          placeholder="Nicho, links, contexto (opcional)..."
                          value={newTask.description}
                          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                          className="w-full bg-theme-glass/20 border border-theme-glass/40 rounded-xl px-3 py-2 text-xs text-theme-secondary placeholder:text-theme-secondary/50 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 mb-4 resize-none min-h-[80px] transition-all"
                        />
                        
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Flag className="w-3.5 h-3.5 text-theme-secondary" />
                            <div className="flex gap-1 bg-theme-glass/40 p-1 rounded-xl border border-theme-glass/60 w-full">
                              {['low', 'medium', 'high'].map((p) => {
                                const Icon = PRIORITY_ICONS[p as keyof typeof PRIORITY_ICONS];
                                return (
                                  <button
                                    key={p}
                                    onClick={() => setNewTask({ ...newTask, priority: p as any })}
                                    className={cn(
                                      "flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5",
                                      newTask.priority === p 
                                        ? PRIORITY_COLORS[p as keyof typeof PRIORITY_COLORS]
                                        : "text-theme-secondary opacity-40 hover:text-theme-primary hover:bg-theme-glass/50"
                                    )}
                                  >
                                    <Icon className="w-3 h-3" />
                                    {p}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-3.5 h-3.5 text-theme-secondary" />
                            <input 
                              type="date"
                              value={newTask.dueDate}
                              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                              className="bg-theme-glass border border-theme-glass rounded-lg px-2 py-1 text-[10px] text-theme-secondary focus:outline-none focus:border-blue-500/50 font-mono"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-theme-secondary" />
                            <input 
                              placeholder="Atribuir a..."
                              value={newTask.assignedTo}
                              onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                              className="bg-theme-glass border border-theme-glass rounded-lg px-2 py-1 text-[10px] text-theme-secondary focus:outline-none focus:border-blue-500/50 flex-1"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <Bell className="w-3.5 h-3.5 text-theme-secondary" />
                            <div className="flex-1 flex items-center bg-theme-glass border border-theme-glass rounded-lg px-2 overflow-hidden focus-within:border-blue-500/50">
                              <span className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-60 mr-2">Lembrete:</span>
                              <input 
                                type="datetime-local"
                                value={newTask.reminderAt}
                                onChange={(e) => setNewTask({ ...newTask, reminderAt: e.target.value })}
                                className="bg-transparent py-1 text-[10px] text-theme-primary focus:outline-none font-mono flex-1"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5 text-theme-secondary" />
                            <input 
                              placeholder="Tags (separadas por vírgula)"
                              value={newTask.tags}
                              onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                              className="flex-1 bg-theme-glass border border-theme-glass rounded-lg px-2 py-1 text-[10px] text-theme-secondary focus:outline-none focus:border-blue-500/50"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-3.5 h-3.5 text-theme-secondary" />
                            <label className="flex-1 cursor-pointer">
                              <div className="bg-theme-glass border border-theme-glass rounded-lg px-2 py-1 text-[10px] text-theme-secondary hover:border-blue-500/50 transition-all flex items-center justify-between">
                                <span className="truncate">{newTask.image ? 'Imagem selecionada' : 'Anexar imagem'}</span>
                                {newTask.image && (
                                  <button 
                                    onClick={(e) => { e.preventDefault(); setNewTask({ ...newTask, image: '' }); }}
                                    className="p-0.5 hover:bg-red-500/10 rounded text-red-500"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                )}
                              </div>
                              <input 
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e)}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-6">
                          <button 
                            onClick={() => setIsAddingTask(null)}
                            className="btn-secondary px-4 py-2 w-full sm:w-auto"
                          >
                            Cancelar
                          </button>
                          <button 
                            onClick={() => handleAddTask(col.id)}
                            disabled={isSubmitting}
                            className="btn-primary px-4 py-2 w-full sm:w-auto"
                          >
                            {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Criar Tarefa'}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {filteredTasks
                      .filter(t => t.status === col.id)
                      .map((task) => (
                        <motion.div 
                          key={task.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={cn(
                            "group bg-theme-card border border-theme-glass rounded-2xl p-5 hover:border-theme-secondary/30 hover:bg-theme-glass transition-all cursor-grab active:cursor-grabbing relative overflow-hidden shadow-lg",
                            draggedTaskId === task.id && "opacity-40 grayscale-[0.5]",
                            isOverdue(task.dueDate) && task.status !== 'done' && "border-theme-rose/50 bg-theme-rose/5 shadow-[0_0_20px_rgba(244,63,94,0.15)]"
                          )}
                          draggable
                          onDragStart={(e: any) => handleDragStart(e, task.id)}
                          onDragEnd={(e: any) => handleDragEnd(e)}
                        >
                          {isOverdue(task.dueDate) && task.status !== 'done' && (
                            <div className="absolute top-0 left-0 w-1 h-full bg-theme-rose shadow-[0_0_10px_rgba(244,63,94,0.5)] z-10" />
                          )}
                          {isUpcoming(task.dueDate) && task.status !== 'done' && (
                            <div className="absolute top-0 left-0 w-1 h-full bg-theme-yellow shadow-[0_0_10px_rgba(250,204,21,0.5)] z-10" />
                          )}
                          
                          {/* Priority Indicator Bar */}
                          <div className={cn(
                            "absolute top-0 right-0 w-1 h-full z-10 opacity-50",
                            task.priority === 'high' ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]" : 
                            task.priority === 'medium' ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]" : 
                            "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                          )} />
                          
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => setEditingTask(task)}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <select
                                  value={task.priority}
                                  onChange={(e) => handleUpdateTask(task.id, { priority: e.target.value as any })}
                                  onClick={(e) => e.stopPropagation()}
                                  className={cn(
                                    "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border focus:outline-none cursor-pointer transition-all",
                                    task.priority === 'high' ? "text-rose-500 border-rose-500/20 bg-rose-500/5" : 
                                    task.priority === 'medium' ? "text-amber-500 border-amber-500/20 bg-amber-500/5" : 
                                    "text-blue-500 border-blue-500/20 bg-blue-500/5"
                                  )}
                                >
                                  <option value="low">Baixa</option>
                                  <option value="medium">Média</option>
                                  <option value="high">Alta</option>
                                </select>
                              </div>
                              <h3 className={cn(
                                "text-sm font-bold leading-tight group-hover:text-theme-primary transition-colors",
                                task.status === 'done' ? "text-theme-secondary line-through" : "text-theme-primary"
                              )}>
                                {task.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTaskExpansion(task.id);
                                }}
                                className={cn(
                                  "p-1.5 rounded-lg transition-all active:scale-95 hover:bg-theme-glass/50",
                                  expandedTasks.includes(task.id) ? "text-theme-blue" : "text-theme-secondary"
                                )}
                                title={expandedTasks.includes(task.id) ? "Recolher" : "Expandir"}
                              >
                                {expandedTasks.includes(task.id) ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                              <button 
                                onClick={() => handleSaveToBrain(task)}
                                disabled={savingToBrain === task.id || savedToBrain.includes(task.id)}
                                className={cn(
                                  "p-1.5 rounded-lg transition-all active:scale-95",
                                  savedToBrain.includes(task.id) 
                                    ? "bg-green-500/20 text-green-400" 
                                    : "hover:bg-blue-500/10 text-theme-secondary hover:text-blue-400"
                                )}
                              >
                                {savingToBrain === task.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : savedToBrain.includes(task.id) ? (
                                  <Check className="w-3.5 h-3.5" />
                                ) : (
                                  <Brain className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingTask(task);
                                }}
                                className="p-1.5 hover:bg-blue-500/10 rounded-lg text-theme-secondary hover:text-blue-400 transition-all active:scale-95"
                                title="Editar Tarefa"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => setTaskToDelete(task.id)}
                                className="p-1.5 hover:bg-red-500/10 rounded-lg text-theme-secondary hover:text-red-400 transition-all active:scale-95"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <AnimatePresence>
                            {expandedTasks.includes(task.id) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="pt-2 pb-3 space-y-3 border-t border-theme-glass/30 mt-2">
                                  {task.description && (
                                    <div className="space-y-1">
                                      <span className="text-[8px] font-black uppercase tracking-widest text-theme-secondary opacity-50">Descrição</span>
                                      <p className="text-[10px] text-theme-secondary leading-relaxed whitespace-pre-wrap">{task.description}</p>
                                    </div>
                                  )}
                                  
                                  {task.image && (
                                    <div className="rounded-xl overflow-hidden border border-theme-glass/20 bg-theme-glass/10">
                                      <img 
                                        src={task.image} 
                                        alt={task.title} 
                                        className="w-full h-32 object-cover"
                                        referrerPolicy="no-referrer"
                                      />
                                    </div>
                                  )}

                                  <div className="grid grid-cols-2 gap-3">
                                    {task.assignedTo && (
                                      <div className="space-y-1">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-theme-secondary opacity-50">Responsável</span>
                                        <div className="flex items-center gap-1.5">
                                          <div className="w-4 h-4 rounded-full bg-theme-blue/10 flex items-center justify-center">
                                            <User className="w-2.5 h-2.5 text-theme-blue" />
                                          </div>
                                          <span className="text-[10px] text-theme-primary font-medium">{task.assignedTo}</span>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {task.tags && task.tags.length > 0 && (
                                      <div className="space-y-1">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-theme-secondary opacity-50">Tags</span>
                                        <div className="flex flex-wrap gap-1">
                                          {task.tags.map((tag, i) => (
                                            <span key={i} className="px-1.5 py-0.5 bg-theme-glass border border-theme-glass rounded text-[8px] font-black uppercase tracking-widest text-theme-secondary">
                                              {tag}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="flex items-end justify-between gap-3 mt-2">
                            <div className="flex flex-wrap items-center gap-2 flex-1">
                              <div className={cn(
                                "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border shadow-sm flex items-center gap-1",
                                PRIORITY_COLORS[task.priority]
                              )}>
                                {task.priority === 'high' && <TrendingUp className="w-2.5 h-2.5" />}
                                {task.priority === 'medium' && <Activity className="w-2.5 h-2.5" />}
                                {task.priority === 'low' && <TrendingDown className="w-2.5 h-2.5" />}
                                {task.priority}
                              </div>
                              {task.dueDate && (
                                <div className={cn(
                                  "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest font-mono px-1.5 py-0.5 rounded",
                                  isOverdue(task.dueDate) && task.status !== 'active' && task.status !== 'paused' ? "text-theme-rose bg-theme-rose/10 border border-theme-rose/20" : 
                                  isUpcoming(task.dueDate) && task.status !== 'active' && task.status !== 'paused' ? "text-theme-yellow bg-theme-yellow/10 border border-theme-yellow/20" :
                                  "text-theme-secondary"
                                )}>
                                  <Clock className="w-3 h-3" />
                                  {task.dueDate instanceof Timestamp ? task.dueDate.toDate().toLocaleDateString() : new Date(task.dueDate).toLocaleDateString()}
                                  {isOverdue(task.dueDate) && task.status !== 'active' && task.status !== 'paused' && <AlertCircle className="w-2.5 h-2.5 ml-0.5 animate-pulse" />}
                                </div>
                              )}
                              {task.status !== 'active' && task.status !== 'paused' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSettingReminderTask(task);
                                    if (task.reminderAt) {
                                      const date = task.reminderAt instanceof Timestamp ? task.reminderAt.toDate() : new Date(task.reminderAt);
                                      setReminderDateTime(date.toISOString().slice(0, 16));
                                    } else {
                                      setReminderDateTime('');
                                    }
                                  }}
                                  className={cn(
                                    "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest font-mono transition-all",
                                    task.reminderAt 
                                      ? "text-theme-blue bg-theme-blue/10 px-1.5 py-0.5 rounded border border-theme-blue/20" 
                                      : "text-theme-secondary opacity-40 hover:opacity-100 hover:text-theme-blue"
                                  )}
                                  title={task.reminderAt ? "Editar Lembrete" : "Definir Lembrete"}
                                >
                                  <Bell className="w-3 h-3" />
                                  {task.reminderAt ? (
                                    task.reminderAt instanceof Timestamp ? task.reminderAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(task.reminderAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  ) : (
                                    "Lembrete"
                                  )}
                                </button>
                              )}
                              {task.assignedTo && (
                                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-theme-blue bg-theme-blue/10 border border-theme-blue/20 px-1.5 py-0.5 rounded">
                                  <User className="w-3 h-3" />
                                  {task.assignedTo}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleAIMagic(task)}
                                disabled={isAnalyzing === task.id}
                                className={cn(
                                  "p-1.5 bg-theme-glass rounded-lg text-theme-purple opacity-50 hover:opacity-100 hover:bg-theme-purple/10 transition-all shadow-inner active:scale-95",
                                  isAnalyzing === task.id && "animate-pulse opacity-100"
                                )}
                              >
                                {isAnalyzing === task.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
                              </button>
                              {col.id !== 'active' && col.id !== 'paused' && (
                                <button 
                                  onClick={() => handleUpdateStatus(task.id, 'active')}
                                  className="p-1.5 bg-theme-glass rounded-lg text-theme-secondary hover:text-theme-blue hover:bg-theme-blue/10 transition-all shadow-inner active:scale-95"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                          {renderAISuggestion(task.id)}
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gradient-to-b from-theme-glass/10 to-transparent">
          <div className="max-w-5xl mx-auto space-y-2">
            {filteredTasks.map(task => (
              <React.Fragment key={task.id}>
                <motion.div 
                  layout
                  className={cn(
                    "flex flex-col md:flex-row md:items-center justify-between p-4 bg-theme-glass border border-theme-glass rounded-2xl hover:bg-theme-glass/80 transition-all group gap-4",
                    isOverdue(task.dueDate) && task.status !== 'active' && task.status !== 'paused' && "border-theme-rose/50 bg-theme-rose/5 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
                  )}
                >
                <div className="flex flex-wrap md:flex-nowrap items-center gap-4 flex-1">
                  <button 
                    onClick={() => handleUpdateStatus(task.id, task.status === 'active' ? 'prospect' : 'active')}
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                      task.status === 'active' ? "bg-theme-emerald border-theme-emerald text-white" : "border-theme-glass hover:border-theme-blue"
                    )}
                  >
                    {task.status === 'active' && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => setEditingTask(task)}
                  >
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTaskExpansion(task.id);
                        }}
                        className={cn(
                          "p-1 rounded-lg transition-all active:scale-95 hover:bg-theme-glass/50",
                          expandedTasks.includes(task.id) ? "text-theme-blue" : "text-theme-secondary"
                        )}
                        title={expandedTasks.includes(task.id) ? "Recolher" : "Expandir"}
                      >
                        {expandedTasks.includes(task.id) ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                      <h3 className={cn(
                        "text-sm font-bold",
                        task.status === 'active' ? "text-theme-emerald" : "text-theme-primary"
                      )}>
                        {task.title}
                      </h3>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border opacity-60",
                        STATUS_COLUMNS.find(c => c.id === task.status)?.color.replace('text-', 'border-').replace('opacity-50', 'opacity-20')
                      )}>
                        {STATUS_COLUMNS.find(c => c.id === task.status)?.name}
                      </span>
                    </div>
                    
                    <AnimatePresence>
                      {expandedTasks.includes(task.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-3 pb-1 space-y-3 border-t border-theme-glass/30 mt-3">
                            {task.description && (
                              <div className="space-y-1">
                                <span className="text-[8px] font-black uppercase tracking-widest text-theme-secondary opacity-50">Descrição</span>
                                <p className="text-[10px] text-theme-secondary leading-relaxed whitespace-pre-wrap">{task.description}</p>
                              </div>
                            )}
                            
                            {task.image && (
                              <div className="rounded-lg overflow-hidden border border-theme-glass/20 w-32 h-20 bg-theme-glass/10">
                                <img 
                                  src={task.image} 
                                  alt={task.title} 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}

                            <div className="flex flex-wrap items-center gap-4">
                              {task.assignedTo && (
                                <div className="space-y-1">
                                  <span className="text-[8px] font-black uppercase tracking-widest text-theme-secondary opacity-50">Responsável</span>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-4 h-4 rounded-full bg-theme-blue/10 flex items-center justify-center">
                                      <User className="w-2.5 h-2.5 text-theme-blue" />
                                    </div>
                                    <span className="text-[10px] text-theme-primary font-medium">{task.assignedTo}</span>
                                  </div>
                                </div>
                              )}
                              
                              {task.tags && task.tags.length > 0 && (
                                <div className="space-y-1">
                                  <span className="text-[8px] font-black uppercase tracking-widest text-theme-secondary opacity-50">Tags</span>
                                  <div className="flex flex-wrap gap-1">
                                    {task.tags.map((tag, i) => (
                                      <span key={i} className="px-1.5 py-0.5 bg-theme-glass border border-theme-glass rounded text-[8px] font-black uppercase tracking-widest text-theme-secondary">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border flex items-center gap-1",
                    PRIORITY_COLORS[task.priority]
                  )}>
                    {task.priority === 'high' && <TrendingUp className="w-2.5 h-2.5" />}
                    {task.priority === 'medium' && <Activity className="w-2.5 h-2.5" />}
                    {task.priority === 'low' && <TrendingDown className="w-2.5 h-2.5" />}
                    {task.priority}
                  </div>
                  {task.dueDate && (
                    <div className={cn(
                      "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest font-mono px-1.5 py-0.5 rounded",
                      isOverdue(task.dueDate) && task.status !== 'active' && task.status !== 'paused' ? "text-theme-rose bg-theme-rose/10 border border-theme-rose/20" : 
                      isUpcoming(task.dueDate) && task.status !== 'active' && task.status !== 'paused' ? "text-theme-yellow bg-theme-yellow/10 border border-theme-yellow/20" :
                      "text-theme-secondary opacity-30"
                    )}>
                      <Clock className="w-3 h-3" />
                      {task.dueDate instanceof Timestamp ? task.dueDate.toDate().toLocaleDateString() : new Date(task.dueDate).toLocaleDateString()}
                      {isOverdue(task.dueDate) && task.status !== 'active' && task.status !== 'paused' && <AlertCircle className="w-2.5 h-2.5 ml-0.5 animate-pulse" />}
                    </div>
                  )}
                  {task.status !== 'active' && task.status !== 'paused' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSettingReminderTask(task);
                        if (task.reminderAt) {
                          const date = task.reminderAt instanceof Timestamp ? task.reminderAt.toDate() : new Date(task.reminderAt);
                          setReminderDateTime(date.toISOString().slice(0, 16));
                        } else {
                          setReminderDateTime('');
                        }
                      }}
                      className={cn(
                        "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest font-mono transition-all",
                        task.reminderAt 
                          ? "text-theme-blue bg-theme-blue/10 px-1.5 py-0.5 rounded border border-theme-blue/20" 
                          : "text-theme-secondary opacity-40 hover:opacity-100 hover:text-theme-blue"
                      )}
                      title={task.reminderAt ? "Editar Lembrete" : "Definir Lembrete"}
                    >
                      <Bell className="w-3 h-3" />
                      {task.reminderAt ? (
                        task.reminderAt instanceof Timestamp ? task.reminderAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(task.reminderAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      ) : (
                        "Lembrete"
                      )}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <select
                    value={task.priority}
                    onChange={(e) => handleUpdateTask(task.id, { priority: e.target.value as any })}
                    className={cn(
                      "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border focus:outline-none cursor-pointer transition-all",
                      task.priority === 'high' ? "text-rose-500 border-rose-500/20 bg-rose-500/5" : 
                      task.priority === 'medium' ? "text-amber-500 border-amber-500/20 bg-amber-500/5" : 
                      "text-blue-500 border-blue-500/20 bg-blue-500/5"
                    )}
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                  <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity justify-end md:justify-start">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTask(task);
                    }}
                    className="p-2 hover:bg-blue-500/10 rounded-xl text-theme-secondary opacity-50 md:opacity-20 hover:text-blue-400 hover:opacity-100 transition-all"
                    title="Editar Cliente"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setTaskToDelete(task.id)}
                    className="p-2 hover:bg-red-500/10 rounded-xl text-theme-secondary opacity-50 md:opacity-20 hover:text-red-400 hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
              {renderAISuggestion(task.id)}
            </React.Fragment>
          ))}
        </div>
      </div>
    )}

      {/* Edit Task Modal */}
      <AnimatePresence>
        {editingTask && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-theme-main border border-theme-glass rounded-[32px] p-8 shadow-2xl overflow-hidden relative"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-theme-blue via-theme-purple to-theme-rose" />
              
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-black uppercase tracking-tighter text-theme-primary italic">Editar <span className="text-theme-blue">Cliente</span></h2>
                <button onClick={() => setEditingTask(null)} className="p-2 hover:bg-theme-glass rounded-full transition-all">
                  <X className="w-6 h-6 text-theme-secondary" />
                </button>
              </div>

              <div className="flex gap-4 mb-6 border-b border-theme-glass">
                <button
                  onClick={() => setEditModalTab('details')}
                  className={cn(
                    "pb-2 text-xs font-black uppercase tracking-widest transition-all",
                    editModalTab === 'details' ? "text-theme-blue border-b-2 border-theme-blue" : "text-theme-secondary opacity-60 hover:opacity-100"
                  )}
                >
                  Detalhes
                </button>
                <button
                  onClick={() => setEditModalTab('history')}
                  className={cn(
                    "pb-2 text-xs font-black uppercase tracking-widest transition-all",
                    editModalTab === 'history' ? "text-theme-blue border-b-2 border-theme-blue" : "text-theme-secondary opacity-60 hover:opacity-100"
                  )}
                >
                  Histórico de Interações
                </button>
              </div>

              {editModalTab === 'details' ? (
                <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary px-1">Nome do Cliente ou Projeto</label>
                  <input 
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    className="w-full bg-theme-glass/40 backdrop-blur-md border border-theme-glass/60 rounded-2xl px-4 py-3 text-theme-primary font-bold focus:outline-none focus:border-theme-blue/50 focus:ring-1 focus:ring-theme-blue/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary px-1">Nicho, Escopo e Detalhes</label>
                  <textarea 
                    value={editingTask.description || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    className="w-full bg-theme-glass/40 backdrop-blur-md border border-theme-glass/60 rounded-2xl px-4 py-3 text-theme-primary text-sm focus:outline-none focus:border-theme-blue/50 focus:ring-1 focus:ring-theme-blue/20 min-h-[120px] resize-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary px-1">Tags (separadas por vírgula)</label>
                  <input 
                    value={editingTask.tags?.join(', ') || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, tags: e.target.value.split(',').map(t => t.trim()) })}
                    className="w-full bg-theme-glass/40 backdrop-blur-md border border-theme-glass/60 rounded-2xl px-4 py-3 text-theme-primary text-sm focus:outline-none focus:border-theme-blue/50 focus:ring-1 focus:ring-theme-blue/20 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-40 px-1">Prioridade</label>
                          <div className="flex gap-1 bg-theme-glass/40 p-1 rounded-xl border border-theme-glass/60">
                            {['low', 'medium', 'high'].map((p) => {
                              const Icon = PRIORITY_ICONS[p as keyof typeof PRIORITY_ICONS];
                              return (
                                <button
                                  key={p}
                                  onClick={() => setEditingTask({ ...editingTask, priority: p as any })}
                                  className={cn(
                                    "flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5",
                                    editingTask.priority === p 
                                      ? PRIORITY_COLORS[p as keyof typeof PRIORITY_COLORS]
                                      : "text-theme-secondary opacity-40 hover:text-theme-primary hover:bg-theme-glass/50"
                                  )}
                                >
                                  <Icon className="w-3 h-3" />
                                  {p}
                                </button>
                              );
                            })}
                          </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary px-1">Prazo</label>
                    <input 
                      type="date"
                      value={editingTask.dueDate ? (editingTask.dueDate instanceof Timestamp ? editingTask.dueDate.toDate().toISOString().split('T')[0] : new Date(editingTask.dueDate).toISOString().split('T')[0]) : ''}
                      onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                      className="w-full bg-theme-glass border border-theme-glass rounded-xl px-4 py-2 text-sm text-theme-primary focus:outline-none focus:border-theme-blue/50 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary px-1 block">Notificação (Lembrete)</label>
                    <div className="flex items-center gap-2 bg-theme-glass border border-theme-glass rounded-xl px-4 overflow-hidden focus-within:border-theme-blue/50">
                      <Bell className="w-4 h-4 text-theme-secondary opacity-60" />
                      <input 
                        type="datetime-local"
                        value={editingTask.reminderAt ? (editingTask.reminderAt instanceof Timestamp ? editingTask.reminderAt.toDate().toISOString().slice(0, 16) : new Date(editingTask.reminderAt).toISOString().slice(0, 16)) : ''}
                        onChange={(e) => setEditingTask({ ...editingTask, reminderAt: e.target.value })}
                        className="w-full bg-transparent py-2 text-sm text-theme-primary focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary px-1">Imagem em Anexo</label>
                    <label className="cursor-pointer block">
                      <div className="w-full bg-theme-glass border border-theme-glass rounded-xl px-4 py-2 text-xs text-theme-secondary opacity-60 hover:border-theme-blue/50 transition-all flex items-center justify-between">
                        <span className="truncate">{editingTask.image ? 'Imagem selecionada' : 'Anexar imagem'}</span>
                        <ImageIcon className="w-3.5 h-3.5" />
                      </div>
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, true)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {editingTask.image && (
                  <div className="relative group rounded-2xl overflow-hidden border border-theme-glass/40 max-h-48 bg-theme-glass/10">
                    <img 
                      src={editingTask.image} 
                      alt="Anexo" 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                    <button 
                      onClick={() => setEditingTask({ ...editingTask, image: undefined })}
                      className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary px-1">Agente SDR Atribuído</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-secondary opacity-50" />
                        <select 
                          value={editingTask.assignedTo || ''}
                          onChange={(e) => setEditingTask({ ...editingTask, assignedTo: e.target.value })}
                          className="w-full bg-theme-glass border border-theme-glass rounded-xl pl-10 pr-4 py-2 text-sm text-theme-primary focus:outline-none focus:border-theme-blue/50 appearance-none cursor-pointer"
                        >
                          <option value="">Sem atribuição</option>
                          {allSkills.map(skill => (
                            <option key={skill.id} value={skill.id}>{skill.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-secondary opacity-50 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary px-1">Status</label>
                      <div className="flex gap-1 bg-theme-glass p-1 rounded-xl border border-theme-glass">
                        {STATUS_COLUMNS.map((col) => (
                          <button
                            key={col.id}
                            onClick={() => setEditingTask({ ...editingTask, status: col.id as any })}
                            className={cn(
                              "flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                              editingTask.status === col.id 
                                ? "bg-theme-blue text-white shadow-lg"
                                : "text-theme-secondary opacity-40 hover:text-theme-primary"
                            )}
                          >
                            {col.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-40 px-1">Prioridade</label>
                      <div className="flex gap-1 bg-theme-glass p-1 rounded-xl border border-theme-glass">
                        {Object.entries(PRIORITY_ICONS).map(([p, Icon]) => (
                          <button
                            key={p}
                            onClick={() => setEditingTask({ ...editingTask, priority: p as any })}
                            className={cn(
                              "flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5",
                              editingTask.priority === p 
                                ? PRIORITY_COLORS[p as keyof typeof PRIORITY_COLORS]
                                : "text-theme-secondary opacity-40 hover:text-theme-primary"
                            )}
                          >
                            <Icon className="w-3 h-3" />
                            {p === 'low' ? 'Baixa' : p === 'medium' ? 'Média' : 'Alta'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-[400px] bg-theme-glass/10 rounded-2xl border border-theme-glass overflow-hidden shadow-inner">
                  {/* Chat Logs List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar flex flex-col">
                    {!editingTask.interactions || editingTask.interactions.length === 0 ? (
                      <div className="m-auto flex flex-col items-center justify-center text-center opacity-40">
                        <Bot className="w-10 h-10 mb-3 text-theme-secondary" />
                        <p className="text-xs font-medium uppercase tracking-widest">Nenhuma Interação</p>
                        <p className="text-[10px] mt-1 max-w-[200px] leading-relaxed">O SDR ainda não iniciou a qualificação deste lead.</p>
                      </div>
                    ) : (
                      editingTask.interactions.map((interaction) => (
                        <div 
                          key={interaction.id} 
                          className={cn(
                            "max-w-[85%] rounded-2xl p-3 text-sm",
                            interaction.role === 'human' 
                              ? "bg-theme-blue/20 text-theme-primary ml-auto border border-theme-blue/30 rounded-tr-sm" 
                              : interaction.role === 'lead'
                                ? "bg-theme-glass text-theme-primary mr-auto border border-theme-glass/40 rounded-tl-sm"
                                : "bg-theme-orange/10 text-theme-orange mr-auto border border-theme-orange/20 rounded-tl-sm"
                          )}
                        >
                          <div className="flex items-center gap-1.5 mb-1.5 opacity-60">
                            {interaction.role === 'human' ? <User className="w-3 h-3" /> : interaction.role === 'lead' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                            <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                              {interaction.role === 'human' ? 'Você (SDR Local)' : interaction.role === 'lead' ? 'Lead' : 'SDR Inteligência'}
                              <span className="opacity-50">•</span>
                              <span className="opacity-70">
                                {interaction.timestamp 
                                  ? (typeof interaction.timestamp.toDate === 'function' ? interaction.timestamp.toDate() : new Date(interaction.timestamp)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                                  : ''}
                              </span>
                            </span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{interaction.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {/* Text Input for Handoff */}
                  <div className="p-3 bg-theme-surface/60 backdrop-blur-sm border-t border-theme-glass">
                    <form onSubmit={handleSendInteraction} className="flex gap-2">
                      <input 
                        type="text"
                        value={handoffMessage}
                        onChange={(e) => setHandoffMessage(e.target.value)}
                        placeholder="Enviar mensagem para o Lead (Assumir Atendimento)..."
                        className="flex-1 bg-theme-card/50 border border-theme-glass/50 rounded-xl px-4 py-2.5 text-sm text-theme-primary placeholder:text-theme-secondary/50 focus:outline-none focus:border-theme-blue/50 focus:ring-1 focus:ring-theme-blue/20 transition-all font-medium"
                      />
                      <button 
                        type="submit"
                        disabled={!handoffMessage.trim()}
                        className="btn-primary p-2.5 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed group"
                        title="Enviar e Assumir (Handoff)"
                      >
                        <svg className="w-4 h-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between mt-10 gap-4">
                <button 
                  onClick={() => setTaskToDelete(editingTask.id)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-theme-rose hover:bg-theme-rose/10 rounded-xl transition-all font-black uppercase tracking-widest text-[10px] group order-2 sm:order-1"
                >
                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Excluir Cliente
                </button>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto order-1 sm:order-2">
                  <button 
                    onClick={() => setEditingTask(null)}
                    className="btn-secondary w-full sm:w-auto"
                  >
                    Descartar
                  </button>
                  <button 
                    onClick={() => handleUpdateTask(editingTask.id, editingTask)}
                    disabled={isSubmitting}
                    className="btn-primary px-8 w-full sm:w-auto"
                  >
                    {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Salvar Alterações'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {/* Reminder Modal */}
        {settingReminderTask && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-theme-main border border-theme-glass rounded-[32px] p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-theme-blue" />
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-theme-blue/10 rounded-full flex items-center justify-center mb-2">
                  <Bell className="w-8 h-8 text-theme-blue" />
                </div>
                
                <h2 className="text-2xl font-black uppercase tracking-tighter text-theme-primary italic">
                  Definir <span className="text-theme-blue">Lembrete</span>
                </h2>
                
                <p className="text-theme-secondary opacity-60 text-sm leading-relaxed">
                  Escolha quando deseja ser notificado sobre esta tarefa.
                </p>

                <div className="w-full space-y-2 mt-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-40 px-1 block text-left">Data e Hora</label>
                  <input 
                    type="datetime-local"
                    value={reminderDateTime}
                    onChange={(e) => setReminderDateTime(e.target.value)}
                    className="w-full bg-theme-glass border border-theme-glass rounded-2xl px-4 py-3 text-theme-primary font-bold focus:outline-none focus:border-theme-blue/50 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-8">
                <button 
                  onClick={handleSetReminder}
                  disabled={!reminderDateTime}
                  className="w-full py-4 bg-theme-blue text-white font-black uppercase tracking-widest rounded-2xl hover:bg-theme-blue/90 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Salvar Lembrete
                </button>
                {settingReminderTask.reminderAt && (
                  <button 
                    onClick={() => {
                      handleRemoveReminder(settingReminderTask.id);
                      setSettingReminderTask(null);
                    }}
                    className="w-full py-4 bg-theme-rose/10 text-theme-rose font-black uppercase tracking-widest rounded-2xl hover:bg-theme-rose/20 transition-all active:scale-[0.98]"
                  >
                    Remover Lembrete
                  </button>
                )}
                <button 
                  onClick={() => setSettingReminderTask(null)}
                  className="w-full py-4 bg-theme-glass text-theme-secondary font-black uppercase tracking-widest rounded-2xl hover:bg-theme-glass/80 transition-all active:scale-[0.98]"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Confirmation Modal for Deletion */}
        <ConfirmationModal
          isOpen={!!taskToDelete}
          onClose={() => setTaskToDelete(null)}
          onConfirm={() => taskToDelete && handleDeleteTask(taskToDelete)}
          title="Confirmar Exclusão"
          message="Tem certeza que deseja excluir as informações deste cliente? Esta ação não pode ser desfeita e removerá todos os dados do board permanentemente."
          confirmText="Excluir"
          cancelText="Cancelar"
          variant="danger"
        />
      </AnimatePresence>
    </div>
  );
}
