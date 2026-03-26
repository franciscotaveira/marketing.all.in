import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DollarSign, Briefcase, Activity, Trophy, TrendingUp, Clock, CheckCircle2, AlertCircle, Users, Code, Building, HeartPulse, Scale, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface Coworker {
  id: string;
  name: string;
  profession: string;
  category: 'Tech' | 'Business' | 'Healthcare' | 'Legal';
  status: 'idle' | 'working' | 'resting';
  earnings: number;
  tasksCompleted: number;
  currentTask?: string;
  avatar: string;
}

const INITIAL_COWORKERS: Coworker[] = [
  { id: '1', name: 'Alex.dev', profession: 'Software Engineer', category: 'Tech', status: 'idle', earnings: 1250, tasksCompleted: 14, avatar: '👨‍💻' },
  { id: '2', name: 'Sarah.data', profession: 'Data Scientist', category: 'Tech', status: 'idle', earnings: 2100, tasksCompleted: 8, avatar: '👩‍🔬' },
  { id: '3', name: 'Marcus.fin', profession: 'Financial Analyst', category: 'Business', status: 'idle', earnings: 3400, tasksCompleted: 22, avatar: '👨‍💼' },
  { id: '4', name: 'Elena.med', profession: 'Medical Researcher', category: 'Healthcare', status: 'idle', earnings: 4200, tasksCompleted: 5, avatar: '👩‍⚕️' },
  { id: '5', name: 'James.law', profession: 'Legal Advisor', category: 'Legal', status: 'idle', earnings: 5100, tasksCompleted: 11, avatar: '👨‍⚖️' },
  { id: '6', name: 'Nina.ops', profession: 'Operations Manager', category: 'Business', status: 'idle', earnings: 1800, tasksCompleted: 30, avatar: '👩‍💼' },
];

const TASKS = [
  { desc: 'Reviewing Pull Requests', pay: 150, category: 'Tech' },
  { desc: 'Optimizing Database Queries', pay: 300, category: 'Tech' },
  { desc: 'Analyzing Q3 Financials', pay: 450, category: 'Business' },
  { desc: 'Drafting Contract Clauses', pay: 500, category: 'Legal' },
  { desc: 'Synthesizing Clinical Trials', pay: 600, category: 'Healthcare' },
  { desc: 'Managing Supply Chain Logistics', pay: 250, category: 'Business' },
  { desc: 'Writing API Documentation', pay: 100, category: 'Tech' },
  { desc: 'Reviewing Compliance Policies', pay: 400, category: 'Legal' },
];

export const ClawWorkArena: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [coworkers, setCoworkers] = useState<Coworker[]>(INITIAL_COWORKERS);
  const [totalEarnings, setTotalEarnings] = useState(INITIAL_COWORKERS.reduce((acc, c) => acc + c.earnings, 0));
  const [logs, setLogs] = useState<{id: string, time: Date, msg: string, type: 'earn' | 'start' | 'info'}[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCoworkers(prev => {
        const next = [...prev];
        const idx = Math.floor(Math.random() * next.length);
        const worker = { ...next[idx] };

        if (worker.status === 'idle' || worker.status === 'resting') {
          const availableTasks = TASKS.filter(t => t.category === worker.category || Math.random() > 0.7);
          const task = availableTasks[Math.floor(Math.random() * availableTasks.length)];
          worker.status = 'working';
          worker.currentTask = task.desc;
          
          setLogs(l => [{ id: Math.random().toString(), time: new Date(), msg: `${worker.name} started: ${task.desc}`, type: 'start' as const }, ...l].slice(0, 50));
        } else if (worker.status === 'working') {
          const earned = Math.floor(Math.random() * 300) + 100;
          worker.status = Math.random() > 0.8 ? 'resting' : 'idle';
          worker.earnings += earned;
          worker.tasksCompleted += 1;
          worker.currentTask = undefined;
          
          setTotalEarnings(prevEarnings => prevEarnings + earned);
          setLogs(l => [{ id: Math.random().toString(), time: new Date(), msg: `${worker.name} earned $${earned} completing a task.`, type: 'earn' as const }, ...l].slice(0, 50));
        }

        next[idx] = worker;
        return next.sort((a, b) => b.earnings - a.earnings);
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'Tech': return <Code className="w-4 h-4" />;
      case 'Business': return <Building className="w-4 h-4" />;
      case 'Healthcare': return <HeartPulse className="w-4 h-4" />;
      case 'Legal': return <Scale className="w-4 h-4" />;
      default: return <Briefcase className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A] text-white rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-6 border-b border-white/10 bg-white/5 gap-4 md:gap-0">
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <Trophy className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black tracking-tight">ClawWork Arena</h2>
              <p className="text-[9px] md:text-xs text-white/50 font-medium tracking-widest uppercase">AI Coworker Survival & Earning Simulation</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors shrink-0">
            <span className="sr-only">Close</span>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
          <div className="text-left md:text-right">
            <p className="text-[9px] md:text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1">Total Network Earnings</p>
            <div className="text-2xl md:text-3xl font-black text-emerald-400 flex items-center gap-1">
              <DollarSign className="w-5 h-5 md:w-6 md:h-6" />
              {totalEarnings.toLocaleString()}
            </div>
          </div>
          <button onClick={onClose} className="hidden md:block p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
            <span className="sr-only">Close</span>
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6 overflow-y-auto md:overflow-hidden custom-scrollbar">
        <div className="col-span-1 md:col-span-2 flex flex-col gap-4 overflow-hidden min-h-[400px] md:min-h-0">
          <h3 className="text-sm font-bold text-white/70 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Top Earning Coworkers
          </h3>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
            <AnimatePresence>
              {coworkers.map((worker, index) => (
                <motion.div
                  key={worker.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 relative overflow-hidden group"
                >
                  <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1",
                    worker.status === 'working' ? "bg-blue-500" : worker.status === 'resting' ? "bg-amber-500" : "bg-white/20"
                  )} />
                  
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-8 text-center font-black text-white/20 text-xl">
                      #{index + 1}
                    </div>
                    
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-2xl shrink-0">
                      {worker.avatar}
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full sm:w-auto">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-white">{worker.name}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-bold uppercase tracking-wider text-white/60 flex items-center gap-1">
                        {getCategoryIcon(worker.category)}
                        {worker.profession}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs text-white/40">
                      <span className="flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3" /> {worker.tasksCompleted} tasks
                      </span>
                      {worker.status === 'working' && (
                        <span className="flex items-center gap-1 text-blue-400">
                          <Activity className="w-3 h-3 animate-pulse shrink-0" /> <span className="truncate max-w-[150px] sm:max-w-none">{worker.currentTask}</span>
                        </span>
                      )}
                      {worker.status === 'resting' && (
                        <span className="flex items-center gap-1 text-amber-400 shrink-0">
                          <Clock className="w-3 h-3" /> Resting...
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0 flex sm:block justify-between items-center sm:items-end border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
                    <div className="text-[10px] text-white/30 uppercase tracking-widest sm:hidden">Earned</div>
                    <div className="text-xl font-black text-emerald-400">${worker.earnings.toLocaleString()}</div>
                    <div className="text-[10px] text-white/30 uppercase tracking-widest hidden sm:block">Earned</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-col gap-4 overflow-hidden bg-black/40 rounded-2xl border border-white/5 p-4 min-h-[300px] md:min-h-0">
          <h3 className="text-sm font-bold text-white/70 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            Live Network Feed
          </h3>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
            <AnimatePresence>
              {logs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs flex gap-3 border-b border-white/5 pb-3 last:border-0"
                >
                  <span className="text-white/30 shrink-0 font-mono">
                    {log.time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className={cn(
                    "flex-1",
                    log.type === 'earn' ? "text-emerald-400 font-medium" : 
                    log.type === 'start' ? "text-blue-400" : "text-white/60"
                  )}>
                    {log.msg}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
