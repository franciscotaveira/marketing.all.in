import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Clock, 
  Calendar as CalendarIcon,
  CheckCircle2, 
  Circle,
  MoreVertical,
  Trash2,
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
    <div className="flex flex-col h-full bg-theme-main">
      {/* Header */}
      <div className="p-6 border-b border-theme-glass flex items-center justify-between bg-theme-glass/20">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter text-theme-primary flex items-center gap-3">
            <Target className="w-6 h-6 text-theme-orange" />
            Planejamento de Rotinas
          </h2>
          <p className="text-theme-secondary opacity-40 text-sm font-medium">Otimize seu tempo com blocos de foco.</p>
        </div>
        <button 
          onClick={() => setIsAddingRoutine(true)}
          className="flex items-center gap-2 px-4 py-2 bg-theme-orange rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:opacity-90 transition-all shadow-lg shadow-orange-500/20"
        >
          <Plus className="w-4 h-4" />
          Nova Rotina
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gradient-to-b from-white/[0.02] to-transparent">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-theme-glass border border-theme-glass rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-theme-orange/10 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-theme-orange" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-30">Total de Blocos</div>
                  <div className="text-xl font-black text-theme-primary">{routines.length}</div>
                </div>
              </div>
              <div className="bg-theme-glass border border-theme-glass rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-theme-blue/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-theme-blue" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-30">Horas Planejadas</div>
                  <div className="text-xl font-black text-theme-primary">--h</div>
                </div>
              </div>
              <div className="bg-theme-glass border border-theme-glass rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-theme-emerald/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-theme-emerald" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-30">Foco Semanal</div>
                  <div className="text-xl font-black text-theme-primary">85%</div>
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
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      const taskId = e.dataTransfer.getData('taskId');
                      if (taskId) handleTaskDrop(taskId, routine.id!);
                    }}
                    className="group bg-theme-glass border border-theme-glass rounded-3xl p-6 hover:border-theme-glass/80 hover:bg-theme-glass/80 transition-all relative overflow-hidden shadow-lg"
                  >
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-theme-glass flex flex-col items-center justify-center border border-theme-glass shadow-inner">
                          <span className="text-xs font-black text-theme-primary">{routine.startTime}</span>
                          <span className="text-[8px] font-bold text-theme-secondary opacity-20 uppercase tracking-widest">Início</span>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-black text-theme-primary group-hover:text-theme-orange transition-colors mb-2">{routine.title}</h3>
                          <div className="flex gap-1.5">
                            {DAYS_OF_WEEK.map((day) => (
                              <span 
                                key={day.id}
                                className={cn(
                                  "w-6 h-6 rounded-lg flex items-center justify-center text-[8px] font-black uppercase border",
                                  routine.days?.includes(day.id)
                                    ? "bg-theme-orange/10 border-theme-orange/20 text-theme-orange"
                                    : "bg-theme-glass border-theme-glass text-theme-secondary opacity-10"
                                )}
                              >
                                {day.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right mr-4">
                          <div className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-20 mb-1">Duração</div>
                          <div className="text-sm font-bold text-theme-secondary opacity-60 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            {routine.startTime} - {routine.endTime}
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteRoutine(routine.id!)}
                          className="p-3 hover:bg-red-500/10 rounded-2xl text-theme-secondary opacity-10 hover:text-red-400 hover:opacity-100 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Tarefas Vinculadas */}
                    <div className="mt-6 pt-6 border-t border-theme-glass">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-40">Tarefas Vinculadas</span>
                        <span className="text-[10px] font-black text-theme-orange bg-theme-orange/10 px-2 py-1 rounded-lg border border-theme-orange/20">
                          {tasks.filter(t => t.routineId === routine.id).length}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {tasks.filter(t => t.routineId === routine.id).map(task => (
                          <div key={task.id} className="flex items-center justify-between p-3 bg-theme-glass rounded-xl border border-theme-glass group/item">
                            <span className="text-xs font-bold text-theme-primary truncate flex-1">{task.title}</span>
                            <button 
                              onClick={() => handleUnlinkTask(task.id)}
                              className="ml-3 p-1.5 text-theme-secondary opacity-20 hover:text-red-400 hover:opacity-100 transition-all"
                            >
                              <Plus className="w-4 h-4 rotate-45" />
                            </button>
                          </div>
                        ))}
                        {tasks.filter(t => t.routineId === routine.id).length === 0 && (
                          <div className="py-4 text-center border-2 border-dashed border-theme-glass rounded-xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-20">Solte tarefas aqui</p>
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
            <div className="bg-theme-glass border border-theme-glass rounded-[2rem] p-8 shadow-xl flex flex-col h-[600px]">
              <h3 className="text-xl font-black uppercase tracking-tighter text-theme-primary mb-4 flex items-center gap-3">
                <LayoutGrid className="w-6 h-6 text-theme-orange" />
                Tarefas Pendentes
              </h3>
              <p className="text-theme-secondary opacity-40 text-xs mb-6">Arraste para vincular a uma rotina.</p>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {tasks.filter(t => !t.routineId).length === 0 ? (
                  <div className="text-center py-12 opacity-20">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-sm font-bold uppercase tracking-widest">Tudo em dia!</p>
                  </div>
                ) : (
                  tasks.filter(t => !t.routineId).map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
                      className="p-4 bg-theme-glass rounded-2xl border border-theme-glass cursor-grab active:cursor-grabbing hover:border-theme-orange/30 transition-all group/task shadow-sm hover:scale-[1.02]"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          task.priority === 'high' ? 'bg-rose-500' : 
                          task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                        )} />
                        <span className="text-[8px] font-black uppercase tracking-widest text-theme-secondary opacity-40">
                          {task.priority}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-theme-primary line-clamp-2 leading-tight group-hover/task:text-theme-orange transition-colors">
                        {task.title}
                      </h4>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-theme-glass border border-theme-glass rounded-[2rem] p-8 shadow-xl">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-40 mb-6">Consistência Semanal</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-60 mb-3">
                    <span>Execução de Rotinas</span>
                    <span className="text-theme-orange">85%</span>
                  </div>
                  <div className="h-2 bg-theme-glass rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '85%' }}
                      className="h-full bg-theme-orange shadow-[0_0_10px_rgba(249,115,22,0.5)]" 
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-60 mb-3">
                    <span>Foco em Prioridades</span>
                    <span className="text-theme-blue">62%</span>
                  </div>
                  <div className="h-2 bg-theme-glass rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '62%' }}
                      className="h-full bg-theme-blue shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
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
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-theme-main border border-theme-glass rounded-[2.5rem] p-10 shadow-2xl"
            >
              <h3 className="text-3xl font-black uppercase tracking-tighter text-theme-primary mb-8">Nova Rotina Estratégica</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-40 mb-3 block">Título da Rotina</label>
                    <input 
                      autoFocus
                      placeholder="Ex: Foco Profundo - Marketing"
                      value={newRoutine.title}
                      onChange={(e) => setNewRoutine({ ...newRoutine, title: e.target.value })}
                      className="w-full bg-theme-glass border border-theme-glass rounded-2xl px-5 py-4 text-theme-primary placeholder:text-theme-secondary/20 focus:outline-none focus:border-orange-500/50 transition-all font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-40 mb-3 block">Início</label>
                      <input 
                        type="time"
                        value={newRoutine.startTime}
                        onChange={(e) => setNewRoutine({ ...newRoutine, startTime: e.target.value })}
                        className="w-full bg-theme-glass border border-theme-glass rounded-2xl px-5 py-4 text-theme-primary focus:outline-none focus:border-orange-500/50 transition-all shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-40 mb-3 block">Fim</label>
                      <input 
                        type="time"
                        value={newRoutine.endTime}
                        onChange={(e) => setNewRoutine({ ...newRoutine, endTime: e.target.value })}
                        className="w-full bg-theme-glass border border-theme-glass rounded-2xl px-5 py-4 text-theme-primary focus:outline-none focus:border-orange-500/50 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-40 mb-3 block">Agente Responsável</label>
                    <select 
                      value={newRoutine.agentId}
                      onChange={(e) => setNewRoutine({ ...newRoutine, agentId: e.target.value })}
                      className="w-full bg-theme-glass border border-theme-glass rounded-2xl px-5 py-4 text-theme-primary focus:outline-none focus:border-orange-500/50 transition-all font-medium appearance-none"
                    >
                      {MARKETING_SKILLS.map(skill => (
                        <option key={skill.id} value={skill.id} className="bg-[#0A0A0A]">
                          {skill.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-40 mb-3 block">Dias da Semana</label>
                  <div className="grid grid-cols-4 gap-3">
                    {DAYS_OF_WEEK.map((day) => (
                      <button 
                        key={day.id}
                        onClick={() => toggleDay(day.id)}
                        className={cn(
                          "aspect-square rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest transition-all border",
                          newRoutine.days?.includes(day.id)
                            ? "bg-theme-orange border-theme-orange text-white shadow-lg shadow-orange-500/20"
                            : "bg-theme-glass border-theme-glass text-theme-secondary opacity-30 hover:bg-theme-glass/80 hover:opacity-100 shadow-sm"
                        )}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-12 pt-8 border-t border-theme-glass">
                <button 
                  onClick={() => setIsAddingRoutine(false)}
                  className="flex-1 px-8 py-4 bg-theme-glass rounded-2xl text-[10px] font-black uppercase tracking-widest text-theme-secondary opacity-60 hover:bg-theme-glass/80 hover:text-theme-primary transition-all shadow-sm"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleAddRoutine}
                  className="flex-1 px-8 py-4 bg-theme-orange rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:opacity-90 transition-all shadow-lg shadow-orange-500/20"
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
