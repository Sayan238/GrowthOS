import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Flame, Calendar as CalIcon, Plus, X, Pencil, Trash2 } from 'lucide-react';

interface Habit {
  id: string;
  title: string;
  emoji: string;
  streak: number;
}

const defaultHabits: Habit[] = [
  { id: '1', title: 'Wake at 5 AM', emoji: '🌅', streak: 12 },
  { id: '2', title: 'Daily Workout', emoji: '💪', streak: 7 },
  { id: '4', title: 'No Social Media', emoji: '🚫', streak: 3 },
  { id: '5', title: 'Journaling', emoji: '✍️', streak: 21 },
];

const emojiOptions = ['🌅','💪','📚','🚫','✍️','🧘','💻','🏃','🎯','🔥','💧','🥗','😴','🎶','🧠'];

interface HabitsProps {
  onHabitToggle?: (title: string, isCompleted: boolean) => void;
}

export default function Habits({ onHabitToggle }: HabitsProps) {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const savedHabits = localStorage.getItem('growthOS_habits');
    return savedHabits ? JSON.parse(savedHabits) : defaultHabits;
  });
  
  const [completedToday, setCompletedToday] = useState<string[]>(() => {
    const savedCompleted = localStorage.getItem('growthOS_completed_habits');
    const lastDate = localStorage.getItem('growthOS_habits_date');
    const today = new Date().toDateString();
    
    if (savedCompleted && lastDate === today) {
      return JSON.parse(savedCompleted);
    }
    return [];
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [formData, setFormData] = useState({ title: '', emoji: '🎯', streak: 0 });

  // Save to localStorage whenever habits or completedToday changes
  React.useEffect(() => {
    if (habits.length > 0) {
      localStorage.setItem('growthOS_habits', JSON.stringify(habits));
    }
    localStorage.setItem('growthOS_completed_habits', JSON.stringify(completedToday));
    localStorage.setItem('growthOS_habits_date', new Date().toDateString());
  }, [habits, completedToday]);

  const toggleHabit = (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    setCompletedToday(prev => {
      const isCompleted = prev.includes(id);
      const next = isCompleted ? prev.filter(h => h !== id) : [...prev, id];
      
      if (onHabitToggle) {
        onHabitToggle(habit.title, !isCompleted);
      }
      
      // Update streak
      setHabits(currentHabits => currentHabits.map(h => {
        if (h.id === id) {
          return { ...h, streak: isCompleted ? Math.max(0, h.streak - 1) : h.streak + 1 };
        }
        return h;
      }));

      return next;
    });
  };

  const handleAdd = () => {
    setEditingHabit(null);
    setFormData({ title: '', emoji: '🎯', streak: 0 });
    setIsModalOpen(true);
  };

  const handleEdit = (e: React.MouseEvent, habit: Habit) => {
    e.stopPropagation();
    setEditingHabit(habit);
    setFormData({ title: habit.title, emoji: habit.emoji, streak: habit.streak });
    setIsModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHabits(habits.filter(h => h.id !== id));
    setCompletedToday(prev => prev.filter(h => h !== id));
  };

  const handleSave = () => {
    if (!formData.title.trim()) return;
    if (editingHabit) {
      setHabits(habits.map(h => h.id === editingHabit.id ? { ...h, ...formData } : h));
    } else {
      setHabits([...habits, { id: Date.now().toString(), ...formData }]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent drop-shadow-sm">Habit Laboratory</h2>
          <p className="text-gray-400 text-sm mt-1 font-medium">Consistency is the bridge between goals and accomplishment.</p>
        </div>
        <div className="flex gap-4">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="glass-card px-5 py-2.5 flex items-center gap-2 border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent shadow-[0_0_15px_rgba(249,115,22,0.15)]"
          >
            <Flame className="text-orange-500" size={20} />
            <span className="font-bold tracking-wide">14 Day Streak</span>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {habits.map((habit) => (
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            key={habit.id}
            className={`glass-card p-6 relative overflow-hidden group cursor-pointer border ${
              completedToday.includes(habit.id) 
                ? 'border-green-500/40 bg-green-500/[0.05] shadow-[0_0_20px_rgba(34,197,94,0.15)]' 
                : 'border-white/10 hover:border-white/20'
            }`}
            onClick={() => toggleHabit(habit.id)}
          >
            <div className="flex justify-between items-start mb-5 relative z-10">
              <div className="text-4xl drop-shadow-lg filter group-hover:scale-110 transition-transform duration-300">{habit.emoji}</div>
              <div className="flex items-center gap-2">
                {/* Edit & Delete buttons — visible on hover */}
                <button
                  onClick={(e) => handleEdit(e, habit)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-300"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={(e) => handleDelete(e, habit.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 border border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-300"
                >
                  <Trash2 size={14} />
                </button>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 shadow-inner ${
                  completedToday.includes(habit.id) 
                    ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]' 
                    : 'bg-white/5 text-gray-400 border border-white/10 group-hover:bg-white/10 group-hover:text-white'
                }`}>
                  {completedToday.includes(habit.id) ? <Check size={22} className="animate-in zoom-in duration-300" /> : <Plus size={20} />}
                </div>
              </div>
            </div>
            
            <h3 className="font-bold text-xl mb-2 text-gray-100 group-hover:text-white transition-colors relative z-10">{habit.title}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-400 font-medium relative z-10">
              <Flame size={16} className={completedToday.includes(habit.id) ? 'text-orange-500 filter drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]' : 'text-gray-500'} />
              <span className={completedToday.includes(habit.id) ? 'text-orange-400/90' : ''}>{habit.streak} day streak</span>
            </div>

            {completedToday.includes(habit.id) && (
              <motion.div 
                initial={{ scale: 0, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                className="absolute -right-10 -bottom-10 w-40 h-40 bg-green-500/20 blur-[50px] rounded-full z-0 pointer-events-none" 
              />
            )}
          </motion.div>
        ))}

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAdd}
          className="glass-card p-6 border-dashed border-white/20 flex flex-col items-center justify-center gap-3 text-gray-500 hover:text-white hover:border-white/50 hover:bg-white/[0.02] transition-all min-h-[180px] group"
        >
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/20 group-hover:border-white/50 flex items-center justify-center group-hover:bg-white/10 transition-all duration-300">
            <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
          </div>
          <span className="text-base font-semibold tracking-wide">Create New Habit</span>
        </motion.button>
      </div>

      {/* Mini Calendar View */}
      <div className="glass-card p-6 mt-8">
        <div className="flex items-center gap-2 mb-6">
          <CalIcon size={20} className="text-purple-500" />
          <h3 className="font-bold">Consistency Map</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 30 }).map((_, i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-[3px] transition-all duration-500 ${
                Math.random() > 0.4 ? 'bg-purple-500/60 shadow-[0_0_8px_rgba(139,92,246,0.3)]' : 'bg-white/5'
              } hover:scale-125 cursor-help`}
              title={`Day ${i+1}: Completed`}
            />
          ))}
        </div>
        <div className="mt-4 flex items-center gap-4 text-[10px] text-gray-500">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-white/5" /> Less</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500" /> More</div>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-6 w-full max-w-md bg-[#0a0a0c] border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-white">
                {editingHabit ? 'Edit Habit' : 'Create New Habit'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Habit Name</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-500 text-white" 
                  placeholder="e.g. Meditate for 10 minutes"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-2 block">Pick an Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {emojiOptions.map((em) => (
                    <button
                      key={em}
                      onClick={() => setFormData({...formData, emoji: em})}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                        formData.emoji === em 
                          ? 'bg-purple-600/30 border-2 border-purple-500 scale-110' 
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Starting Streak (days)</label>
                <input 
                  type="number" 
                  min="0"
                  value={formData.streak} 
                  onChange={(e) => setFormData({...formData, streak: Number(e.target.value)})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-500 text-white" 
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-medium transition-colors text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave} 
                  className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors shadow-lg shadow-purple-500/25"
                >
                  {editingHabit ? 'Save Changes' : 'Create Habit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
