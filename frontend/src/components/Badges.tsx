import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Flame, Zap, Shield, Crown, Gem, Medal, Target, Brain, Dumbbell, Code, X } from 'lucide-react';

export interface Badge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  icon: any;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  condition: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0-100
  requirement: number;
  current: number;
}

const tierColors = {
  bronze:   { bg: 'from-amber-900/40 to-amber-700/20', border: 'border-amber-600/40', text: 'text-amber-400', glow: 'shadow-amber-500/20' },
  silver:   { bg: 'from-gray-400/30 to-gray-300/10', border: 'border-gray-400/40', text: 'text-gray-300', glow: 'shadow-gray-400/20' },
  gold:     { bg: 'from-yellow-600/40 to-yellow-400/10', border: 'border-yellow-500/50', text: 'text-yellow-400', glow: 'shadow-yellow-500/30' },
  platinum: { bg: 'from-cyan-500/30 to-blue-400/10', border: 'border-cyan-400/50', text: 'text-cyan-300', glow: 'shadow-cyan-500/30' },
  diamond:  { bg: 'from-purple-500/40 to-pink-400/10', border: 'border-purple-400/60', text: 'text-purple-300', glow: 'shadow-purple-500/40' },
};

const tierLabels = { bronze: '🥉 Bronze', silver: '🥈 Silver', gold: '🥇 Gold', platinum: '💎 Platinum', diamond: '👑 Diamond' };

export function getDefaultBadges(): Badge[] {
  return [
    {
      id: 'first_task', title: 'First Step', description: 'Complete your very first task',
      emoji: '🎯', icon: Target, tier: 'bronze', condition: 'Complete 1 task',
      unlocked: false, progress: 0, requirement: 1, current: 0,
    },
    {
      id: 'five_tasks', title: 'Getting Serious', description: 'Complete 5 tasks total',
      emoji: '⚡', icon: Zap, tier: 'bronze', condition: 'Complete 5 tasks',
      unlocked: false, progress: 0, requirement: 5, current: 0,
    },
    {
      id: 'ten_tasks', title: 'Task Warrior', description: 'Complete 10 tasks — real discipline!',
      emoji: '🛡️', icon: Shield, tier: 'silver', condition: 'Complete 10 tasks',
      unlocked: false, progress: 0, requirement: 10, current: 0,
    },
    {
      id: 'twentyfive_tasks', title: 'Unstoppable', description: 'Complete 25 tasks. You are a machine!',
      emoji: '🔥', icon: Flame, tier: 'gold', condition: 'Complete 25 tasks',
      unlocked: false, progress: 0, requirement: 25, current: 0,
    },
    {
      id: 'fifty_tasks', title: 'Legend', description: 'Complete 50 tasks. Absolute legend!',
      emoji: '👑', icon: Crown, tier: 'platinum', condition: 'Complete 50 tasks',
      unlocked: false, progress: 0, requirement: 50, current: 0,
    },
    {
      id: 'hundred_tasks', title: 'Diamond Grinder', description: '100 tasks completed. Unreal!',
      emoji: '💎', icon: Gem, tier: 'diamond', condition: 'Complete 100 tasks',
      unlocked: false, progress: 0, requirement: 100, current: 0,
    },
    {
      id: 'streak_3', title: 'Warming Up', description: 'Maintain a 3-day streak',
      emoji: '🔥', icon: Flame, tier: 'bronze', condition: '3 day streak',
      unlocked: false, progress: 0, requirement: 3, current: 0,
    },
    {
      id: 'streak_7', title: 'Full Week Warrior', description: '7 days straight — no breaks!',
      emoji: '⭐', icon: Star, tier: 'silver', condition: '7 day streak',
      unlocked: false, progress: 0, requirement: 7, current: 0,
    },
    {
      id: 'streak_10', title: 'Beast Mode', description: '10-day streak. You are a BEAST!',
      emoji: '🏆', icon: Trophy, tier: 'gold', condition: '10 day streak',
      unlocked: false, progress: 0, requirement: 10, current: 0,
    },
    {
      id: 'streak_30', title: 'Iron Discipline', description: '30-day streak. Iron will forged!',
      emoji: '💎', icon: Gem, tier: 'diamond', condition: '30 day streak',
      unlocked: false, progress: 0, requirement: 30, current: 0,
    },
    {
      id: 'gym_5', title: 'Gym Rat', description: 'Complete 5 gym sessions',
      emoji: '💪', icon: Dumbbell, tier: 'silver', condition: '5 gym sessions',
      unlocked: false, progress: 0, requirement: 5, current: 0,
    },
    {
      id: 'dsa_10', title: 'Code Ninja', description: 'Do 10 DSA/coding sessions',
      emoji: '💻', icon: Code, tier: 'gold', condition: '10 coding sessions',
      unlocked: false, progress: 0, requirement: 10, current: 0,
    },
    {
      id: 'score_70', title: 'Rising Star', description: 'Reach a growth score of 70+',
      emoji: '🌟', icon: Star, tier: 'silver', condition: 'Score 70+',
      unlocked: false, progress: 0, requirement: 70, current: 0,
    },
    {
      id: 'score_90', title: 'Elite Performer', description: 'Reach a growth score of 90+',
      emoji: '🏅', icon: Medal, tier: 'platinum', condition: 'Score 90+',
      unlocked: false, progress: 0, requirement: 90, current: 0,
    },
    {
      id: 'brain', title: 'Growth Mindset', description: 'Chat with Coach Aurora 5 times',
      emoji: '🧠', icon: Brain, tier: 'bronze', condition: '5 AI chats',
      unlocked: false, progress: 0, requirement: 5, current: 0,
    },
  ];
}

export function updateBadgeProgress(badges: Badge[], stats: { tasksCompleted: number, streak: number, score: number, gymSessions: number, dsaSessions: number, aiChats: number }): { badges: Badge[], newlyUnlocked: Badge[] } {
  const newlyUnlocked: Badge[] = [];
  
  const updated = badges.map(badge => {
    let current = 0;
    
    if (badge.id === 'first_task' || badge.id === 'five_tasks' || badge.id === 'ten_tasks' || badge.id === 'twentyfive_tasks' || badge.id === 'fifty_tasks' || badge.id === 'hundred_tasks') {
      current = stats.tasksCompleted;
    } else if (badge.id.startsWith('streak_')) {
      current = stats.streak;
    } else if (badge.id === 'gym_5') {
      current = stats.gymSessions;
    } else if (badge.id === 'dsa_10') {
      current = stats.dsaSessions;
    } else if (badge.id === 'score_70' || badge.id === 'score_90') {
      current = stats.score;
    } else if (badge.id === 'brain') {
      current = stats.aiChats;
    }
    
    const progress = Math.min(100, (current / badge.requirement) * 100);
    const wasUnlocked = badge.unlocked;
    const isNowUnlocked = current >= badge.requirement;
    
    if (isNowUnlocked && !wasUnlocked) {
      newlyUnlocked.push({ ...badge, unlocked: true, unlockedAt: new Date().toISOString(), progress: 100, current });
    }
    
    return { ...badge, current, progress, unlocked: isNowUnlocked || wasUnlocked, unlockedAt: isNowUnlocked && !wasUnlocked ? new Date().toISOString() : badge.unlockedAt };
  });
  
  return { badges: updated, newlyUnlocked };
}

// Popup notification for newly unlocked badge
export function BadgeUnlockPopup({ badge, onClose }: { badge: Badge | null, onClose: () => void }) {
  if (!badge) return null;
  const colors = tierColors[badge.tier];
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100]"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 15 }}
          className={`glass-card p-8 max-w-sm w-full mx-4 text-center bg-gradient-to-b ${colors.bg} border ${colors.border} shadow-2xl ${colors.glow}`}
          onClick={e => e.stopPropagation()}
        >
          <motion.div
            initial={{ rotate: -20, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-6xl mb-4"
          >
            {badge.emoji}
          </motion.div>
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">🎉 Badge Unlocked!</p>
            <h2 className={`text-2xl font-black ${colors.text}`}>{badge.title}</h2>
            <p className="text-gray-400 text-sm mt-2">{badge.description}</p>
            <div className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold ${colors.text} bg-white/5 border ${colors.border}`}>
              {tierLabels[badge.tier]}
            </div>
          </motion.div>
          
          <button
            onClick={onClose}
            className="mt-6 w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-bold transition-colors"
          >
            Awesome! 🔥
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Full badges display page
export default function Badges() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  
  useEffect(() => {
    const saved = localStorage.getItem('growthOS_badges');
    if (saved) {
      setBadges(JSON.parse(saved));
    } else {
      setBadges(getDefaultBadges());
    }
  }, []);
  
  const unlockedCount = badges.filter(b => b.unlocked).length;
  const filteredBadges = badges.filter(b => {
    if (filter === 'unlocked') return b.unlocked;
    if (filter === 'locked') return !b.unlocked;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold">Medal Cabinet</h2>
          <p className="text-gray-400 text-sm">Collect badges by completing tasks and building streaks.</p>
        </div>
        <div className="flex gap-3">
          <div className="glass-card px-4 py-2 flex items-center gap-2">
            <Trophy className="text-yellow-500" size={18} />
            <span className="font-bold text-sm">{unlockedCount}/{badges.length} Earned</span>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'unlocked', 'locked'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              filter === f 
                ? 'bg-purple-600/30 text-purple-400 border border-purple-500/30' 
                : 'bg-white/5 text-gray-500 border border-white/5 hover:bg-white/10'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Badges grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => {
          const colors = tierColors[badge.tier];
          return (
            <motion.div
              key={badge.id}
              whileHover={{ y: -3 }}
              className={`glass-card p-5 relative overflow-hidden transition-all ${
                badge.unlocked ? `bg-gradient-to-br ${colors.bg} border ${colors.border}` : 'opacity-60'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className={`text-3xl ${badge.unlocked ? '' : 'grayscale opacity-40'}`}>
                  {badge.emoji}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.text} bg-white/5 border ${colors.border}`}>
                  {tierLabels[badge.tier]}
                </span>
              </div>
              
              <h3 className={`font-bold text-sm mb-0.5 ${badge.unlocked ? colors.text : 'text-gray-500'}`}>
                {badge.title}
              </h3>
              <p className="text-xs text-gray-500 mb-3">{badge.description}</p>
              
              {/* Progress bar */}
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${badge.progress}%` }}
                  transition={{ duration: 0.8 }}
                  className={`h-full rounded-full ${badge.unlocked ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gray-600'}`}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>{badge.current}/{badge.requirement}</span>
                <span>{badge.unlocked ? '✅ Earned' : `${Math.round(badge.progress)}%`}</span>
              </div>

              {/* Glow effect for unlocked */}
              {badge.unlocked && (
                <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full blur-2xl opacity-30 bg-gradient-to-br ${colors.bg}`} />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
