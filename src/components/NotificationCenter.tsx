import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Check, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  Clock,
  Trash2,
  BellOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Notification } from '../types';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  updateDoc, 
  deleteDoc, 
  doc, 
  orderBy,
  limit,
  where,
  addDoc,
  serverTimestamp,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { cn } from '../lib/utils';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'notifications'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      setNotifications(notificationList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notifications');
    });

    return () => unsubscribe();
  }, []);

  // Logic to check for overdue tasks
  useEffect(() => {
    if (!auth.currentUser) return;

    const checkTasks = async () => {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const tasksRef = collection(db, 'users', auth.currentUser!.uid, 'tasks');
      const q = query(tasksRef, where('status', '!=', 'done'));
      
      try {
        const snapshot = await getDocs(q);
        for (const docSnap of snapshot.docs) {
          const task = docSnap.data();
          if (!task.dueDate) continue;

          const dueDate = task.dueDate instanceof Timestamp ? task.dueDate.toDate() : new Date(task.dueDate);
          
          // Skip if task is done
          if (task.status === 'done') continue;

          // Overdue Check
          if (dueDate < now) {
            const notifQ = query(
              collection(db, 'users', auth.currentUser!.uid, 'notifications'),
              where('metadata.taskId', '==', docSnap.id),
              where('type', '==', 'warning'),
              where('read', '==', false)
            );
            const notifSnapshot = await getDocs(notifQ);
            
            if (notifSnapshot.empty) {
              await addDoc(collection(db, 'users', auth.currentUser!.uid, 'notifications'), {
                title: '🚨 Tarefa Atrasada',
                message: `A tarefa "${task.title}" ultrapassou o prazo de vencimento!`,
                type: 'warning',
                read: false,
                createdAt: serverTimestamp(),
                metadata: { 
                  taskId: docSnap.id,
                  dueDate: dueDate.toISOString()
                }
              });
            }
          } 
          // Upcoming Check (within 24h)
          else if (dueDate < tomorrow) {
            const notifQ = query(
              collection(db, 'users', auth.currentUser!.uid, 'notifications'),
              where('metadata.taskId', '==', docSnap.id),
              where('type', '==', 'info'),
              where('read', '==', false)
            );
            const notifSnapshot = await getDocs(notifQ);
            
            if (notifSnapshot.empty) {
              await addDoc(collection(db, 'users', auth.currentUser!.uid, 'notifications'), {
                title: '⏳ Vencimento Próximo',
                message: `A tarefa "${task.title}" vence em menos de 24 horas.`,
                type: 'info',
                read: false,
                createdAt: serverTimestamp(),
                metadata: { 
                  taskId: docSnap.id,
                  dueDate: dueDate.toISOString()
                }
              });
            }
          }

          // Reminder Check
          if (task.reminderAt) {
            const reminderAt = task.reminderAt instanceof Timestamp ? task.reminderAt.toDate() : new Date(task.reminderAt);
            if (reminderAt <= now) {
              const notifQ = query(
                collection(db, 'users', auth.currentUser!.uid, 'notifications'),
                where('metadata.taskId', '==', docSnap.id),
                where('metadata.notifType', '==', 'reminder'),
                where('read', '==', false)
              );
              const notifSnapshot = await getDocs(notifQ);
              
              if (notifSnapshot.empty) {
                await addDoc(collection(db, 'users', auth.currentUser!.uid, 'notifications'), {
                  title: '🔔 Lembrete de Tarefa',
                  message: `Lembrete para: "${task.title}"`,
                  type: 'task',
                  read: false,
                  createdAt: serverTimestamp(),
                  metadata: { 
                    taskId: docSnap.id,
                    notifType: 'reminder',
                    reminderAt: reminderAt.toISOString()
                  }
                });
              }
            }
          }
        }
      } catch (error) {
        console.error("Error checking tasks:", error);
      }
    };

    const interval = setInterval(checkTasks, 1000 * 60 * 5); // Check every 5 minutes
    checkTasks(); // Initial check

    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    if (!auth.currentUser) return;
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid, 'notifications', id), {
        read: true
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'notifications');
    }
  };

  const deleteNotification = async (id: string) => {
    if (!auth.currentUser) return;
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'notifications', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'notifications');
    }
  };

  const markAllAsRead = async () => {
    if (!auth.currentUser) return;
    const unread = notifications.filter(n => !n.read);
    try {
      await Promise.all(unread.map(n => 
        updateDoc(doc(db, 'users', auth.currentUser!.uid, 'notifications', n.id), { read: true })
      ));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'notifications');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertCircle className="w-4 h-4 text-theme-yellow" />;
      case 'error': return <X className="w-4 h-4 text-theme-rose" />;
      case 'success': return <CheckCircle2 className="w-4 h-4 text-theme-emerald" />;
      case 'task': return <Clock className="w-4 h-4 text-theme-blue" />;
      default: return <Info className="w-4 h-4 text-theme-blue" />;
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-theme-glass/20 border border-theme-glass/40 rounded-xl transition-all group shadow-inner active:scale-90"
      >
        <Bell className={cn(
          "w-5 h-5 transition-all",
          unreadCount > 0 ? "text-theme-blue animate-pulse" : "text-theme-secondary group-hover:text-theme-primary"
        )} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-theme-rose rounded-full border-2 border-theme-card" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 md:w-96 bg-theme-card backdrop-blur-3xl border border-theme-glass rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-theme-glass flex items-center justify-between bg-theme-glass">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-theme-primary">Notificações</h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-theme-blue rounded text-[10px] font-bold text-white shadow-lg shadow-blue-500/20">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="px-3 py-1.5 bg-theme-blue/10 border border-theme-blue/20 rounded-lg text-[9px] font-black uppercase tracking-widest text-theme-blue hover:bg-theme-blue/20 transition-all shadow-inner active:scale-95"
                    >
                      Ler tudo
                    </button>
                  )}
                  <button onClick={() => setIsOpen(false)} className="text-theme-secondary hover:text-theme-primary transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-theme-glass">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        className={cn(
                          "p-4 flex gap-3 transition-colors group relative",
                          notif.read ? "opacity-40" : "bg-theme-blue/5"
                        )}
                      >
                        <div className="mt-0.5 shrink-0">{getIcon(notif.type)}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-theme-primary mb-1 group-hover:text-theme-blue transition-colors">{notif.title}</h4>
                          <p className="text-[11px] text-theme-secondary leading-relaxed">{notif.message}</p>
                          <span className="text-[9px] text-theme-secondary mt-2 block font-mono opacity-50">
                            {notif.createdAt?.toDate().toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notif.read && (
                            <button 
                              onClick={() => markAsRead(notif.id)}
                              className="p-1.5 hover:bg-theme-glass rounded-lg text-theme-blue transition-all"
                              title="Marcar como lida"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button 
                            onClick={() => deleteNotification(notif.id)}
                            className="p-1.5 hover:bg-theme-rose/10 rounded-lg text-theme-secondary hover:text-theme-rose transition-all"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-theme-glass rounded-2xl flex items-center justify-center mb-4 border border-theme-glass">
                      <BellOff className="w-8 h-8 text-theme-secondary opacity-20" />
                    </div>
                    <p className="text-xs text-theme-secondary font-medium uppercase tracking-widest">Nenhuma notificação</p>
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 bg-theme-glass border-t border-theme-glass text-center">
                  <button className="theme-button-secondary w-full py-2">
                    Ver histórico completo
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
