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
  GripVertical,
  Calendar,
  Trash2,
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
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, BrainMemory } from '../types';
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
  Timestamp
} from 'firebase/firestore';
import { cn } from '../lib/utils';

const PRIORITY_COLORS = {
  low: 'text-theme-blue bg-theme-blue/10 border-theme-blue/20',
  medium: 'text-theme-yellow bg-theme-yellow/10 border-theme-yellow/20',
  high: 'text-theme-rose bg-theme-rose/10 border-theme-rose/20',
};

const STATUS_COLUMNS = [
  { id: 'todo', name: 'A Fazer', icon: Circle, color: 'text-theme-secondary opacity-50' },
  { id: 'in-progress', name: 'Em Progresso', icon: Clock, color: 'text-theme-blue' },
  { id: 'done', name: 'Concluído', icon: CheckCircle2, color: 'text-theme-emerald' },
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

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddingTask, setIsAddingTask] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTask, setNewTask] = useState(INITIAL_NEW_TASK);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignedSearchQuery, setAssignedSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'in-progress' | 'done'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'overdue'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'priority' | 'dueDate' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [savingToBrain, setSavingToBrain] = useState<string | null>(null);
  const [savedToBrain, setSavedToBrain] = useState<string[]>([]);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

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
    setDraggedTaskId(taskId);
    // Visual feedback for dragging
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.4';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedTaskId(null);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow drop
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
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
    <div className="flex flex-col h-full bg-theme-main/40 backdrop-blur-3xl border border-theme-glass rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-theme-glass flex flex-col md:flex-row md:items-center justify-between gap-4 bg-theme-glass/20">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-theme-primary flex items-center gap-3 italic">
            <LayoutGrid className="w-6 h-6 text-theme-blue" />
            Gestão de <span className="text-theme-blue">Operações</span>
          </h2>
          <p className="text-theme-secondary opacity-40 text-[10px] font-black uppercase tracking-widest mt-1">Centralize suas tarefas e rotinas estratégicas.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-secondary opacity-30 group-focus-within:text-theme-blue transition-colors" />
            <input 
              type="text"
              placeholder="Buscar tarefas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 py-2 bg-theme-glass border border-theme-glass rounded-xl text-sm text-theme-primary placeholder:text-theme-secondary/20 focus:outline-none focus:border-theme-blue/50 focus:bg-theme-glass/80 transition-all w-64 shadow-inner"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-theme-glass rounded-full text-theme-secondary opacity-30 hover:opacity-100 transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-secondary opacity-30 group-focus-within:text-theme-blue transition-colors" />
            <input 
              type="text"
              placeholder="Responsável..."
              value={assignedSearchQuery}
              onChange={(e) => setAssignedSearchQuery(e.target.value)}
              className="pl-10 pr-10 py-2 bg-theme-glass border border-theme-glass rounded-xl text-sm text-theme-primary placeholder:text-theme-secondary/20 focus:outline-none focus:border-theme-blue/50 focus:bg-theme-glass/80 transition-all w-48 shadow-inner"
            />
            {assignedSearchQuery && (
              <button 
                onClick={() => setAssignedSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-theme-glass rounded-full text-theme-secondary opacity-30 hover:opacity-100 transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center bg-theme-glass border border-theme-glass rounded-xl p-1">
            <button 
              onClick={() => setViewMode('kanban')}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                viewMode === 'kanban' ? "bg-theme-blue text-white shadow-lg shadow-blue-500/20" : "text-theme-secondary opacity-40 hover:text-theme-primary hover:opacity-100"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                viewMode === 'list' ? "bg-theme-blue text-white shadow-lg shadow-blue-500/20" : "text-theme-secondary opacity-40 hover:text-theme-primary hover:opacity-100"
              )}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={() => {
              setNewTask(INITIAL_NEW_TASK);
              setIsAddingTask('todo');
              setViewMode('kanban');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-theme-blue hover:bg-theme-blue/80 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Tarefa</span>
          </button>

          <div className="flex flex-wrap items-center gap-2 bg-theme-glass border border-theme-glass rounded-xl p-1">
            <div className="flex items-center gap-1 px-2 border-r border-theme-glass/20">
              <Filter className="w-3 h-3 text-theme-secondary opacity-40" />
              <select 
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="bg-transparent text-[9px] font-black uppercase tracking-widest text-theme-secondary focus:outline-none cursor-pointer hover:text-theme-primary transition-colors"
              >
                <option value="all" className="bg-[#0A0A0A]">Prioridade: Todas</option>
                <option value="low" className="bg-[#0A0A0A]">Baixa</option>
                <option value="medium" className="bg-[#0A0A0A]">Média</option>
                <option value="high" className="bg-[#0A0A0A]">Alta</option>
              </select>
            </div>

            <div className="flex items-center gap-1 px-2 border-r border-theme-glass/20">
              <Activity className="w-3 h-3 text-theme-secondary opacity-40" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-transparent text-[9px] font-black uppercase tracking-widest text-theme-secondary focus:outline-none cursor-pointer hover:text-theme-primary transition-colors"
              >
                <option value="all" className="bg-[#0A0A0A]">Status: Todos</option>
                <option value="todo" className="bg-[#0A0A0A]">A Fazer</option>
                <option value="in-progress" className="bg-[#0A0A0A]">Em Progresso</option>
                <option value="done" className="bg-[#0A0A0A]">Concluído</option>
              </select>
            </div>

            <div className="flex items-center gap-1 px-2 border-r border-theme-glass/20">
              <CalendarIcon className="w-3 h-3 text-theme-secondary opacity-40" />
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="bg-transparent text-[9px] font-black uppercase tracking-widest text-theme-secondary focus:outline-none cursor-pointer hover:text-theme-primary transition-colors"
              >
                <option value="all" className="bg-[#0A0A0A]">Data: Todas</option>
                <option value="today" className="bg-[#0A0A0A]">Hoje</option>
                <option value="week" className="bg-[#0A0A0A]">Esta Semana</option>
                <option value="overdue" className="bg-[#0A0A0A]">Atrasadas</option>
              </select>
            </div>

            <div className="flex items-center gap-1 px-2">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-[9px] font-black uppercase tracking-widest text-theme-secondary focus:outline-none cursor-pointer hover:text-theme-primary transition-colors"
              >
                <option value="createdAt" className="bg-[#0A0A0A]">Criação</option>
                <option value="dueDate" className="bg-[#0A0A0A]">Prazo</option>
                <option value="priority" className="bg-[#0A0A0A]">Prioridade</option>
                <option value="status" className="bg-[#0A0A0A]">Status</option>
              </select>
              <button 
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1 hover:bg-theme-glass rounded text-theme-secondary opacity-40 hover:opacity-100 transition-all"
              >
                {sortOrder === 'asc' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
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
                className="flex items-center gap-1 px-2 py-1 bg-theme-rose/10 hover:bg-theme-rose/20 text-theme-rose rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
              >
                <X className="w-3 h-3" />
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      {viewMode === 'kanban' ? (
        <div className="flex-1 overflow-x-auto p-6 custom-scrollbar bg-gradient-to-b from-theme-glass/10 to-transparent">
          <div className="flex gap-6 h-full min-w-max">
            {STATUS_COLUMNS.filter(col => statusFilter === 'all' || col.id === statusFilter).map((col) => (
              <div 
                key={col.id} 
                className={cn(
                  "w-80 flex flex-col gap-4 rounded-3xl transition-colors duration-200",
                  draggedTaskId && tasks.find(t => t.id === draggedTaskId)?.status !== col.id 
                    ? "bg-theme-blue/5 border-2 border-dashed border-theme-blue/20" 
                    : "border-2 border-transparent"
                )}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
              >
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <col.icon className={cn("w-4 h-4", col.color)} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-theme-secondary opacity-70">{col.name}</span>
                    <span className="px-1.5 py-0.5 bg-theme-glass rounded text-[10px] font-bold text-theme-blue shadow-lg">
                      {filteredTasks.filter(t => t.status === col.id).length}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      setNewTask(INITIAL_NEW_TASK);
                      setIsAddingTask(col.id);
                    }}
                    className="p-1.5 hover:bg-theme-glass rounded-lg text-theme-secondary opacity-30 hover:text-theme-primary hover:opacity-100 transition-all group"
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
                          placeholder="Título da tarefa..."
                          value={newTask.title}
                          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddTask(col.id)}
                          className="w-full bg-theme-glass/20 border border-theme-glass/40 rounded-xl px-3 py-2 text-sm text-theme-primary placeholder:text-theme-secondary/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 mb-2 font-bold transition-all"
                        />
                        <textarea 
                          placeholder="Descrição (opcional)..."
                          value={newTask.description}
                          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                          className="w-full bg-theme-glass/20 border border-theme-glass/40 rounded-xl px-3 py-2 text-xs text-theme-secondary placeholder:text-theme-secondary/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 mb-4 resize-none min-h-[80px] transition-all"
                        />
                        
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Flag className="w-3.5 h-3.5 text-theme-secondary opacity-20" />
                            <div className="flex gap-1">
                              {['low', 'medium', 'high'].map((p) => (
                                <button
                                  key={p}
                                  onClick={() => setNewTask({ ...newTask, priority: p as any })}
                                  className={cn(
                                    "px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border transition-all",
                                    newTask.priority === p 
                                      ? PRIORITY_COLORS[p as keyof typeof PRIORITY_COLORS]
                                      : "bg-theme-glass border-theme-glass text-theme-secondary opacity-20 hover:bg-theme-glass/80 hover:opacity-100"
                                  )}
                                >
                                  {p}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-3.5 h-3.5 text-theme-secondary opacity-20" />
                            <input 
                              type="date"
                              value={newTask.dueDate}
                              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                              className="bg-theme-glass border border-theme-glass rounded-lg px-2 py-1 text-[10px] text-theme-secondary opacity-60 focus:outline-none focus:border-blue-500/50 font-mono"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-theme-secondary opacity-20" />
                            <input 
                              placeholder="Atribuir a..."
                              value={newTask.assignedTo}
                              onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                              className="bg-theme-glass border border-theme-glass rounded-lg px-2 py-1 text-[10px] text-theme-secondary opacity-60 focus:outline-none focus:border-blue-500/50 flex-1"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <Bell className="w-3.5 h-3.5 text-theme-secondary opacity-20" />
                            <input 
                              type="datetime-local"
                              value={newTask.reminderAt}
                              onChange={(e) => setNewTask({ ...newTask, reminderAt: e.target.value })}
                              className="bg-theme-glass border border-theme-glass rounded-lg px-2 py-1 text-[10px] text-theme-secondary opacity-60 focus:outline-none focus:border-blue-500/50 font-mono"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5 text-theme-secondary opacity-20" />
                            <input 
                              placeholder="Tags (separadas por vírgula)"
                              value={newTask.tags}
                              onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                              className="flex-1 bg-theme-glass border border-theme-glass rounded-lg px-2 py-1 text-[10px] text-theme-secondary opacity-60 focus:outline-none focus:border-blue-500/50"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-3.5 h-3.5 text-theme-secondary opacity-20" />
                            <label className="flex-1 cursor-pointer">
                              <div className="bg-theme-glass border border-theme-glass rounded-lg px-2 py-1 text-[10px] text-theme-secondary opacity-60 hover:border-blue-500/50 transition-all flex items-center justify-between">
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

                        <div className="flex items-center justify-end gap-3 mt-6">
                          <button 
                            onClick={() => setIsAddingTask(null)}
                            className="theme-button-secondary px-4 py-2"
                          >
                            Cancelar
                          </button>
                          <button 
                            onClick={() => handleAddTask(col.id)}
                            disabled={isSubmitting}
                            className="theme-button-primary px-4 py-2"
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
                            "group bg-theme-glass border border-theme-glass rounded-2xl p-4 hover:border-theme-glass/80 hover:bg-theme-glass/80 transition-all cursor-grab active:cursor-grabbing relative overflow-hidden shadow-xl",
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
                          
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => setEditingTask(task)}
                            >
                              <h3 className={cn(
                                "text-sm font-bold leading-tight group-hover:text-theme-primary transition-colors",
                                task.status === 'done' ? "text-theme-secondary opacity-20 line-through" : "text-theme-primary opacity-90"
                              )}>
                                {task.title}
                              </h3>
                              {task.description && (
                                <p className="text-[10px] text-theme-secondary opacity-40 mt-1 line-clamp-2">{task.description}</p>
                              )}
                              {task.image && (
                                <div className="mt-3 rounded-xl overflow-hidden border border-theme-glass/20 bg-theme-glass/10">
                                  <img 
                                    src={task.image} 
                                    alt={task.title} 
                                    className="w-full h-32 object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              )}
                              {task.tags && task.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {task.tags.map((tag, i) => (
                                    <span key={i} className="px-1.5 py-0.5 bg-theme-glass border border-theme-glass rounded text-[8px] font-black uppercase tracking-widest text-theme-secondary opacity-60">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleSaveToBrain(task)}
                                disabled={savingToBrain === task.id || savedToBrain.includes(task.id)}
                                className={cn(
                                  "p-1.5 rounded-lg transition-all active:scale-95",
                                  savedToBrain.includes(task.id) 
                                    ? "bg-green-500/20 text-green-400" 
                                    : "hover:bg-blue-500/10 text-theme-secondary opacity-20 hover:text-blue-400 hover:opacity-100"
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
                                onClick={() => setTaskToDelete(task.id)}
                                className="p-1.5 hover:bg-red-500/10 rounded-lg text-theme-secondary opacity-20 hover:text-red-400 hover:opacity-100 transition-all active:scale-95"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border shadow-sm",
                                PRIORITY_COLORS[task.priority]
                              )}>
                                {task.priority}
                              </div>
                              {task.dueDate && (
                                <div className={cn(
                                  "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest font-mono px-1.5 py-0.5 rounded",
                                  isOverdue(task.dueDate) && task.status !== 'done' ? "text-theme-rose bg-theme-rose/10 border border-theme-rose/20" : 
                                  isUpcoming(task.dueDate) && task.status !== 'done' ? "text-theme-yellow bg-theme-yellow/10 border border-theme-yellow/20" :
                                  "text-theme-secondary opacity-30"
                                )}>
                                  <Clock className="w-3 h-3" />
                                  {task.dueDate instanceof Timestamp ? task.dueDate.toDate().toLocaleDateString() : new Date(task.dueDate).toLocaleDateString()}
                                  {isOverdue(task.dueDate) && task.status !== 'done' && <AlertCircle className="w-2.5 h-2.5 ml-0.5 animate-pulse" />}
                                </div>
                              )}
                              {task.reminderAt && (
                                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest font-mono text-theme-blue">
                                  <Bell className="w-3 h-3" />
                                  {task.reminderAt instanceof Timestamp ? task.reminderAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(task.reminderAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              )}
                              {task.assignedTo && (
                                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-theme-blue bg-theme-blue/10 border border-theme-blue/20 px-1.5 py-0.5 rounded">
                                  <User className="w-3 h-3" />
                                  {task.assignedTo}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {col.id !== 'done' && (
                                <button 
                                  onClick={() => handleUpdateStatus(task.id, col.id === 'todo' ? 'in-progress' : 'done')}
                                  className="p-1.5 bg-theme-glass rounded-lg text-theme-secondary opacity-30 hover:text-theme-blue hover:bg-theme-blue/10 hover:opacity-100 transition-all shadow-inner active:scale-95"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
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
              <motion.div 
                key={task.id}
                layout
                className={cn(
                  "flex items-center justify-between p-4 bg-theme-glass border border-theme-glass rounded-2xl hover:bg-theme-glass/80 transition-all group",
                  isOverdue(task.dueDate) && task.status !== 'done' && "border-theme-rose/50 bg-theme-rose/5 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
                )}
              >
                <div className="flex items-center gap-4 flex-1">
                  <button 
                    onClick={() => handleUpdateStatus(task.id, task.status === 'done' ? 'todo' : 'done')}
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                      task.status === 'done' ? "bg-theme-emerald border-theme-emerald text-white" : "border-theme-glass hover:border-theme-blue"
                    )}
                  >
                    {task.status === 'done' && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => setEditingTask(task)}
                  >
                    <div className="flex items-center gap-2">
                      <h3 className={cn(
                        "text-sm font-bold",
                        task.status === 'done' ? "text-theme-secondary opacity-20 line-through" : "text-theme-primary"
                      )}>
                        {task.title}
                      </h3>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border opacity-40",
                        STATUS_COLUMNS.find(c => c.id === task.status)?.color.replace('text-', 'border-').replace('opacity-50', 'opacity-20')
                      )}>
                        {STATUS_COLUMNS.find(c => c.id === task.status)?.name}
                      </span>
                    </div>
                    {task.image && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-theme-glass/20 w-24 h-16 bg-theme-glass/10">
                        <img 
                          src={task.image} 
                          alt={task.title} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {task.tags.map((tag, i) => (
                          <span key={i} className="px-1 py-0.5 bg-theme-glass border border-theme-glass rounded text-[7px] font-black uppercase tracking-widest text-theme-secondary opacity-40">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {task.assignedTo && (
                      <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-theme-blue bg-theme-blue/10 border border-theme-blue/20 px-1.5 py-0.5 rounded">
                        <User className="w-2.5 h-2.5" />
                        {task.assignedTo}
                      </div>
                    )}
                  </div>
                  <div className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
                    PRIORITY_COLORS[task.priority]
                  )}>
                    {task.priority}
                  </div>
                  {task.dueDate && (
                    <div className={cn(
                      "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest font-mono px-1.5 py-0.5 rounded",
                      isOverdue(task.dueDate) && task.status !== 'done' ? "text-theme-rose bg-theme-rose/10 border border-theme-rose/20" : 
                      isUpcoming(task.dueDate) && task.status !== 'done' ? "text-theme-yellow bg-theme-yellow/10 border border-theme-yellow/20" :
                      "text-theme-secondary opacity-30"
                    )}>
                      <Clock className="w-3 h-3" />
                      {task.dueDate instanceof Timestamp ? task.dueDate.toDate().toLocaleDateString() : new Date(task.dueDate).toLocaleDateString()}
                      {isOverdue(task.dueDate) && task.status !== 'done' && <AlertCircle className="w-2.5 h-2.5 ml-0.5 animate-pulse" />}
                    </div>
                  )}
                  {task.reminderAt && (
                    <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest font-mono text-theme-blue">
                      <Bell className="w-3 h-3" />
                      {task.reminderAt instanceof Timestamp ? task.reminderAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(task.reminderAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setTaskToDelete(task.id)}
                    className="p-2 hover:bg-red-500/10 rounded-xl text-theme-secondary opacity-20 hover:text-red-400 hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
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
              
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black uppercase tracking-tighter text-theme-primary italic">Editar <span className="text-theme-blue">Tarefa</span></h2>
                <button onClick={() => setEditingTask(null)} className="p-2 hover:bg-theme-glass rounded-full transition-all">
                  <X className="w-6 h-6 text-theme-secondary" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-40 px-1">Título</label>
                  <input 
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    className="w-full bg-theme-glass/40 backdrop-blur-md border border-theme-glass/60 rounded-2xl px-4 py-3 text-theme-primary font-bold focus:outline-none focus:border-theme-blue/50 focus:ring-1 focus:ring-theme-blue/20 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-40 px-1">Descrição</label>
                  <textarea 
                    value={editingTask.description || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    className="w-full bg-theme-glass/40 backdrop-blur-md border border-theme-glass/60 rounded-2xl px-4 py-3 text-theme-primary text-sm focus:outline-none focus:border-theme-blue/50 focus:ring-1 focus:ring-theme-blue/20 min-h-[120px] resize-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-40 px-1">Tags (separadas por vírgula)</label>
                  <input 
                    value={editingTask.tags?.join(', ') || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, tags: e.target.value.split(',').map(t => t.trim()) })}
                    className="w-full bg-theme-glass/40 backdrop-blur-md border border-theme-glass/60 rounded-2xl px-4 py-3 text-theme-primary text-sm focus:outline-none focus:border-theme-blue/50 focus:ring-1 focus:ring-theme-blue/20 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-40 px-1">Prioridade</label>
                    <div className="flex gap-1 bg-theme-glass p-1 rounded-xl border border-theme-glass">
                      {['low', 'medium', 'high'].map((p) => (
                        <button
                          key={p}
                          onClick={() => setEditingTask({ ...editingTask, priority: p as any })}
                          className={cn(
                            "flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                            editingTask.priority === p 
                              ? PRIORITY_COLORS[p as keyof typeof PRIORITY_COLORS]
                              : "text-theme-secondary opacity-40 hover:text-theme-primary"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-40 px-1">Prazo</label>
                    <input 
                      type="date"
                      value={editingTask.dueDate ? (editingTask.dueDate instanceof Timestamp ? editingTask.dueDate.toDate().toISOString().split('T')[0] : new Date(editingTask.dueDate).toISOString().split('T')[0]) : ''}
                      onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                      className="w-full bg-theme-glass border border-theme-glass rounded-xl px-4 py-2 text-sm text-theme-primary focus:outline-none focus:border-theme-blue/50 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-40 px-1">Notificação (Lembrete)</label>
                    <input 
                      type="datetime-local"
                      value={editingTask.reminderAt ? (editingTask.reminderAt instanceof Timestamp ? editingTask.reminderAt.toDate().toISOString().slice(0, 16) : new Date(editingTask.reminderAt).toISOString().slice(0, 16)) : ''}
                      onChange={(e) => setEditingTask({ ...editingTask, reminderAt: e.target.value })}
                      className="w-full bg-theme-glass border border-theme-glass rounded-xl px-4 py-2 text-sm text-theme-primary focus:outline-none focus:border-theme-blue/50 font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-40 px-1">Imagem em Anexo</label>
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

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-40 px-1">Atribuído a</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-secondary opacity-30" />
                      <input 
                        placeholder="Nome ou ID do usuário..."
                        value={editingTask.assignedTo || ''}
                        onChange={(e) => setEditingTask({ ...editingTask, assignedTo: e.target.value })}
                        className="w-full bg-theme-glass border border-theme-glass rounded-xl pl-10 pr-4 py-2 text-sm text-theme-primary focus:outline-none focus:border-theme-blue/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-40 px-1">Status</label>
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
                </div>
              </div>

              <div className="flex items-center justify-between mt-10">
                <button 
                  onClick={() => setTaskToDelete(editingTask.id)}
                  className="flex items-center gap-2 px-4 py-2 text-theme-rose hover:bg-theme-rose/10 rounded-xl transition-all font-black uppercase tracking-widest text-[10px] group"
                >
                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Excluir Tarefa
                </button>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setEditingTask(null)}
                    className="theme-button-secondary"
                  >
                    Descartar
                  </button>
                  <button 
                    onClick={() => handleUpdateTask(editingTask.id, editingTask)}
                    disabled={isSubmitting}
                    className="theme-button-primary px-8"
                  >
                    {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Salvar Alterações'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {taskToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-theme-main border border-theme-glass rounded-[32px] p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-theme-rose" />
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-theme-rose/10 rounded-full flex items-center justify-center mb-2">
                  <Trash2 className="w-8 h-8 text-theme-rose" />
                </div>
                
                <h2 className="text-2xl font-black uppercase tracking-tighter text-theme-primary italic">
                  Confirmar <span className="text-theme-rose">Exclusão</span>
                </h2>
                
                <p className="text-theme-secondary opacity-60 text-sm leading-relaxed">
                  Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita e removerá todos os dados permanentemente.
                </p>
              </div>

              <div className="flex flex-col gap-3 mt-8">
                <button 
                  onClick={() => handleDeleteTask(taskToDelete)}
                  className="w-full py-4 bg-theme-rose text-white font-black uppercase tracking-widest rounded-2xl hover:bg-theme-rose/90 transition-all shadow-lg shadow-rose-500/20 active:scale-[0.98]"
                >
                  Excluir
                </button>
                <button 
                  onClick={() => setTaskToDelete(null)}
                  className="w-full py-4 bg-theme-glass text-theme-secondary font-black uppercase tracking-widest rounded-2xl hover:bg-theme-glass/80 transition-all active:scale-[0.98]"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
