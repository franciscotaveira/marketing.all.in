import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Clock, 
  Calendar as CalendarIcon,
  CheckCircle2, 
  Circle,
  MoreVertical,
  Trash2,
  Bell,
  Settings2,
  Sparkles,
  Zap,
  ArrowRight,
  Target,
  Flame,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Routine, MarketingSkill } from '../types';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { MARKETING_SKILLS } from '../constants';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  orderBy,
  updateDoc,
  where
} from 'firebase/firestore';
import { cn } from '../lib/utils';
import { Task } from '../types';

const FREQUENCY_LABELS = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
};

const DAYS_OF_WEEK = [
  { id: 'mon', name: 'Seg', label: 'S' },
  { id: 'tue', name: 'Ter', label: 'T' },
  { id: 'wed', name: 'Qua', label: 'Q' },
  { id: 'thu', name: 'Qui', label: 'Q' },
  { id: 'fri', name: 'Sex', label: 'S' },
  { id: 'sat', name: 'Sáb', label: 'S' },
  { id: 'sun', name: 'Dom', label: 'D' },
];

export default function RoutinePlanner() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddingRoutine, setIsAddingRoutine] = useState(false);
  const [newRoutine, setNewRoutine] = useState<Partial<Routine>>({
    title: '',
    frequency: 'daily',
    days: [],
    startTime: '09:00',
    endTime: '10:00',
    agentId: 'productivity-strategist',
  });
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [isOverRoutineId, setIsOverRoutineId] = useState<string | null>(null);

  const pendingTasks = React.useMemo(() => tasks.filter(t => !t.routineId), [tasks]);
  const routineTasks = React.useMemo(() => {
    const map: Record<string, Task[]> = {};
    routines.forEach(r => {
      map[r.id!] = tasks.filter(t => t.routineId === r.id);
    });
    return map;
  }, [routines, tasks]);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Fetch Routines
    const qRoutines = query(
      collection(db, 'users', auth.currentUser.uid, 'routines'),
      orderBy('startTime', 'asc')
    );

    const unsubscribeRoutines = onSnapshot(qRoutines, (snapshot) => {
      const routineList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Routine[];
      setRoutines(routineList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'routines');
    });

    // Fetch Tasks (only pending ones)
    const qTasks = query(
      collection(db, 'users', auth.currentUser.uid, 'tasks'),
      where('status', 'in', ['todo', 'in-progress']),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeTasks = onSnapshot(qTasks, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(taskList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tasks');
    });

    return () => {
      unsubscribeRoutines();
      unsubscribeTasks();
    };
  }, []);

  const handleTaskDrop = async (taskId: string, routineId: string) => {
    if (!auth.currentUser) return;
    
    try {
      const taskRef = doc(db, 'users', auth.currentUser.uid, 'tasks', taskId);
      const routine = routines.find(r => r.id === routineId);
      
      if (routine) {
        await updateDoc(taskRef, {
          routineId: routineId,
          updatedAt: serverTimestamp()
        });
        // Feedback visual ou log
        console.log(`Tarefa ${taskId} vinculada à rotina ${routine.title}`);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'tasks');
    }
  };

  const handleUnlinkTask = async (taskId: string) => {
    if (!auth.currentUser) return;
    
    try {
      const taskRef = doc(db, 'users', auth.currentUser.uid, 'tasks', taskId);
      await updateDoc(taskRef, {
        routineId: null,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'tasks');
    }
  };

  const handleAddRoutine = async () => {
    if (!newRoutine.title?.trim() || !auth.currentUser) return;

    try {
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'routines'), {
        ...newRoutine,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setNewRoutine({
        title: '',
        frequency: 'daily',
        days: [],
        startTime: '09:00',
        endTime: '10:00',
        agentId: 'productivity-strategist',
      });
      setIsAddingRoutine(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'routines');
    }
  };

  const handleDeleteRoutine = async (id: string) => {
    if (!auth.currentUser) return;
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'routines', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'routines');
    }
  };

  const toggleDay = (dayId: string) => {
    const currentDays = newRoutine.days || [];
    if (currentDays.includes(dayId)) {
      setNewRoutine({ ...newRoutine, days: currentDays.filter(d => d !== dayId) });
    } else {
      setNewRoutine({ ...newRoutine, days: [...currentDays, dayId] });
    }
  };

  return (
    <div className="flex flex-col h-full bg-theme-surface border border-theme-glass rounded-3xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-theme-glass flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-theme-card/30">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-theme-primary flex items-center gap-3">
            <Target className="w-5 h-5 text-orange-500" />
            Planejamento de <span className="text-orange-500">Rotinas</span>
          </h2>
          <p className="text-theme-secondary text-[11px] font-medium uppercase tracking-wider">Otimize seu tempo com blocos de foco.</p>
        </div>
        <button 
          onClick={() => setIsAddingRoutine(true)}
          className="btn-orange w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Rotina</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gradient-to-b from-white/[0.02] to-transparent">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-theme-glass border border-theme-glass rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0 border border-orange-500/20">
                  <Flame className="w-5 h-5 text-orange-500" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-theme-secondary truncate">Total de Blocos</div>
                  <div className="text-lg font-bold text-theme-primary">{routines.length}</div>
                </div>
              </div>
              <div className="bg-theme-glass border border-theme-glass rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-theme-secondary truncate">Horas Planejadas</div>
                  <div className="text-lg font-bold text-theme-primary">--h</div>
                </div>
              </div>
              <div className="bg-theme-glass border border-theme-glass rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <Zap className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-theme-secondary truncate">Foco Semanal</div>
                  <div className="text-lg font-bold text-theme-primary">85%</div>
                </div>
              </div>
            </div>

            {/* Routine List */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {routines.map((routine) => (
                  <motion.div 
                    key={routine.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsOverRoutineId(routine.id!);
                    }}
                    onDragLeave={() => setIsOverRoutineId(null)}
                    onDrop={(e) => {
                      const taskId = e.dataTransfer.getData('taskId');
                      setIsOverRoutineId(null);
                      if (taskId) handleTaskDrop(taskId, routine.id!);
                    }}
                    className={cn(
                      "group bg-theme-glass border border-theme-glass rounded-3xl p-6 transition-all relative overflow-hidden shadow-sm",
                      isOverRoutineId === routine.id 
                        ? "border-orange-500 bg-orange-500/5 scale-[1.01]" 
                        : "hover:border-theme-glass/80 hover:bg-theme-glass/80"
                    )}
                  >
                    {isOverRoutineId === routine.id && (
                      <div className="absolute inset-0 border-2 border-dashed border-orange-500/20 rounded-3xl pointer-events-none animate-pulse" />
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-theme-glass flex flex-col items-center justify-center border border-theme-glass shadow-sm shrink-0">
                          <span className="text-xs sm:text-sm font-bold text-theme-primary">{routine.startTime}</span>
                          <span className="text-[8px] font-bold text-theme-secondary opacity-40 uppercase tracking-wider">Início</span>
                        </div>
                        
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base sm:text-lg font-bold text-theme-primary group-hover:text-orange-500 transition-colors truncate">{routine.title}</h3>
                            <span className="px-1.5 py-0.5 bg-orange-500/10 text-orange-500 text-[8px] font-black uppercase tracking-widest rounded border border-orange-500/20">
                              {FREQUENCY_LABELS[routine.frequency]}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 items-center">
                            {DAYS_OF_WEEK.map((day) => (
                              <span 
                                key={day.id}
                                className={cn(
                                  "w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center text-[8px] font-bold uppercase border",
                                  routine.days?.includes(day.id)
                                    ? "bg-orange-500/10 border-orange-500/20 text-orange-500"
                                    : "bg-theme-glass border-theme-glass text-theme-secondary opacity-20"
                                )}
                              >
                                {day.label}
                              </span>
                            ))}
                            {routine.agentId && (
                              <div className="ml-2 flex items-center gap-1.5 px-2 py-0.5 bg-theme-glass border border-theme-glass rounded-lg">
                                <div className="w-1.5 h-1.5 rounded-full bg-theme-blue" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-theme-secondary opacity-60">
                                  {MARKETING_SKILLS.find(s => s.id === routine.agentId)?.name || 'Agente'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-theme-glass">
                        <div className="text-left sm:text-right sm:mr-4">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-theme-secondary opacity-40 mb-1">Duração</div>
                          <div className="text-xs sm:text-sm font-medium text-theme-secondary flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            {routine.startTime} - {routine.endTime}
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteRoutine(routine.id!)}
                          className="p-2 sm:p-3 hover:bg-rose-500/10 rounded-2xl text-theme-secondary hover:text-rose-500 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Tarefas Vinculadas */}
                    <div className="mt-6 pt-6 border-t border-theme-glass">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-theme-secondary opacity-40">Tarefas Vinculadas</span>
                        <span className="text-[11px] font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded-lg border border-orange-500/20">
                          {tasks.filter(t => t.routineId === routine.id).length}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {(routineTasks[routine.id!] || []).map(task => (
                          <div key={task.id} className="flex items-center justify-between p-3 bg-theme-glass rounded-xl border border-theme-glass group/item hover:border-orange-500/20 transition-all">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className={cn(
                                "w-1.5 h-1.5 rounded-full shrink-0",
                                task.priority === 'high' ? 'bg-rose-500' : 
                                task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                              )} />
                              <span className="text-sm font-medium text-theme-primary truncate">{task.title}</span>
                              {task.reminderAt && <Bell className="w-3 h-3 text-orange-500 animate-pulse shrink-0" />}
                            </div>
                            <button 
                              onClick={() => handleUnlinkTask(task.id)}
                              className="ml-3 p-1.5 text-theme-secondary opacity-40 hover:text-rose-500 hover:opacity-100 transition-all"
                              title="Desvincular"
                            >
                              <Plus className="w-4 h-4 rotate-45" />
                            </button>
                          </div>
                        ))}
                        {(routineTasks[routine.id!] || []).length === 0 && (
                          <div className="py-4 text-center border-2 border-dashed border-theme-glass rounded-xl">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-theme-secondary opacity-20">Solte tarefas aqui para vincular</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {routines.length === 0 && !isAddingRoutine && (
                <div className="py-20 text-center border-2 border-dashed border-theme-glass rounded-[2rem]">
                  <div className="w-20 h-20 rounded-3xl bg-theme-glass flex items-center justify-center mx-auto mb-6 border border-theme-glass">
                    <CalendarIcon className="w-8 h-8 text-theme-secondary opacity-10" />
                  </div>
                  <h3 className="text-xl font-black text-theme-primary mb-2 uppercase tracking-tighter">Nenhuma rotina definida</h3>
                  <p className="text-theme-secondary opacity-40 max-w-xs mx-auto text-sm">Comece planejando seus blocos de foco para maximizar sua produtividade.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar de Tarefas Disponíveis */}
          <div className="space-y-6">
            <div className="bg-theme-glass border border-theme-glass rounded-3xl p-6 shadow-sm flex flex-col h-auto md:h-[600px]">
              <h3 className="text-base font-bold uppercase tracking-wider text-theme-primary mb-4 flex items-center gap-3">
                <LayoutGrid className="w-5 h-5 text-orange-500" />
                Tarefas Pendentes
              </h3>
              <p className="text-theme-secondary opacity-40 text-[11px] mb-6">Arraste para vincular a uma rotina.</p>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {pendingTasks.length === 0 ? (
                  <div className="text-center py-12 opacity-20">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest">Tudo em dia!</p>
                  </div>
                ) : (
                  pendingTasks.map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('taskId', task.id);
                        setDraggedTaskId(task.id);
                      }}
                      onDragEnd={() => setDraggedTaskId(null)}
                      className={cn(
                        "p-5 bg-theme-card border border-theme-glass rounded-2xl cursor-grab active:cursor-grabbing hover:border-orange-500/40 transition-all group/task shadow-md hover:scale-[1.01] hover:shadow-lg",
                        draggedTaskId === task.id && "opacity-40"
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2.5 h-2.5 rounded-full shadow-sm",
                            task.priority === 'high' ? 'bg-rose-500 shadow-rose-500/20' : 
                            task.priority === 'medium' ? 'bg-amber-500 shadow-amber-500/20' : 'bg-blue-500 shadow-blue-500/20'
                          )} />
                          <span className="text-[9px] font-black uppercase tracking-widest text-theme-secondary opacity-60">
                            {task.priority}
                          </span>
                        </div>
                        {task.reminderAt && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-orange-500/10 rounded-full border border-orange-500/20">
                            <Bell className="w-2.5 h-2.5 text-orange-500 animate-pulse" />
                            <span className="text-[8px] font-bold text-orange-500 uppercase">Alerta</span>
                          </div>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-theme-primary line-clamp-2 leading-tight group-hover/task:text-orange-500 transition-colors mb-2">
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-theme-glass/30">
                        <span className="text-[9px] font-mono text-theme-secondary opacity-50">#TASK-{task.id.slice(-4)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-theme-glass border border-theme-glass rounded-3xl p-6 shadow-sm">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-theme-secondary opacity-40 mb-6">Consistência Semanal</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-theme-secondary opacity-60 mb-3">
                    <span>Execução de Rotinas</span>
                    <span className="text-orange-500">85%</span>
                  </div>
                  <div className="h-1.5 bg-theme-glass rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '85%' }}
                      className="h-full bg-orange-500" 
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-theme-secondary opacity-60 mb-3">
                    <span>Foco em Prioridades</span>
                    <span className="text-blue-500">62%</span>
                  </div>
                  <div className="h-1.5 bg-theme-glass rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '62%' }}
                      className="h-full bg-blue-500" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Routine Modal */}
      <AnimatePresence>
        {isAddingRoutine && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingRoutine(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-theme-surface border border-theme-glass rounded-3xl p-8 shadow-2xl"
            >
              <h3 className="text-2xl font-bold tracking-tight text-theme-primary mb-8">Nova Rotina Estratégica</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-theme-secondary mb-2 block">Título da Rotina</label>
                    <input 
                      autoFocus
                      placeholder="Ex: Foco Profundo - Marketing"
                      value={newRoutine.title}
                      onChange={(e) => setNewRoutine({ ...newRoutine, title: e.target.value })}
                      className="w-full bg-theme-glass border border-theme-glass rounded-xl px-4 py-3 text-theme-primary placeholder:text-theme-secondary/20 focus:outline-none focus:border-orange-500/50 transition-all text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-theme-secondary mb-2 block">Frequência</label>
                    <div className="flex gap-2 bg-theme-glass/40 p-1 rounded-xl border border-theme-glass/60">
                      {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                        <button
                          key={freq}
                          onClick={() => setNewRoutine({ ...newRoutine, frequency: freq, days: freq === 'daily' ? DAYS_OF_WEEK.map(d => d.id) : [] })}
                          className={cn(
                            "flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                            newRoutine.frequency === freq 
                              ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                              : "text-theme-secondary opacity-40 hover:text-theme-primary hover:bg-theme-glass/50"
                          )}
                        >
                          {FREQUENCY_LABELS[freq]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-theme-secondary opacity-40 mb-2 block">Início</label>
                      <input 
                        type="time"
                        value={newRoutine.startTime}
                        onChange={(e) => setNewRoutine({ ...newRoutine, startTime: e.target.value })}
                        className="w-full bg-theme-glass border border-theme-glass rounded-xl px-4 py-3 text-theme-primary focus:outline-none focus:border-orange-500/50 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-theme-secondary opacity-40 mb-2 block">Fim</label>
                      <input 
                        type="time"
                        value={newRoutine.endTime}
                        onChange={(e) => setNewRoutine({ ...newRoutine, endTime: e.target.value })}
                        className="w-full bg-theme-glass border border-theme-glass rounded-xl px-4 py-3 text-theme-primary focus:outline-none focus:border-orange-500/50 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-theme-secondary mb-2 block">Agente Responsável</label>
                    <select 
                      value={newRoutine.agentId}
                      onChange={(e) => setNewRoutine({ ...newRoutine, agentId: e.target.value })}
                      className="w-full bg-theme-glass border border-theme-glass rounded-xl px-4 py-3 text-theme-primary focus:outline-none focus:border-orange-500/50 transition-all text-sm font-medium appearance-none"
                    >
                      {MARKETING_SKILLS.map(skill => (
                        <option key={skill.id} value={skill.id} className="bg-theme-surface">
                          {skill.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-theme-secondary opacity-40 mb-2 block">
                    {newRoutine.frequency === 'weekly' ? 'Dias da Semana' : 'Configuração de Repetição'}
                  </label>
                  
                  {newRoutine.frequency === 'weekly' ? (
                    <div className="grid grid-cols-4 gap-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <button 
                          key={day.id}
                          onClick={() => toggleDay(day.id)}
                          className={cn(
                            "aspect-square rounded-xl flex items-center justify-center text-[10px] font-bold uppercase tracking-wider transition-all border",
                            newRoutine.days?.includes(day.id)
                              ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                              : "bg-theme-glass border-theme-glass text-theme-secondary opacity-30 hover:bg-theme-glass/80 hover:opacity-100 shadow-sm"
                          )}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  ) : newRoutine.frequency === 'daily' ? (
                    <div className="p-4 bg-theme-glass/20 border border-theme-glass/40 rounded-2xl text-center">
                      <p className="text-[10px] text-theme-secondary opacity-60 uppercase font-black tracking-widest">Execução Diária</p>
                      <p className="text-xs text-theme-primary mt-1">Esta rotina será executada todos os dias nos horários definidos.</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-theme-glass/20 border border-theme-glass/40 rounded-2xl text-center">
                      <p className="text-[10px] text-theme-secondary opacity-60 uppercase font-black tracking-widest">Execução Mensal</p>
                      <p className="text-xs text-theme-primary mt-1">Esta rotina será executada uma vez por mês.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 mt-10 pt-6 border-t border-theme-glass">
                <button 
                  onClick={() => setIsAddingRoutine(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleAddRoutine}
                  className="btn-orange flex-1"
                >
                  Salvar Rotina
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
