import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Calendar, 
  MessageSquare, 
  LineChart, 
  CheckCircle2, 
  Settings, 
  Flame, 
  Trophy,
  Plus,
  Search,
  Bell,
  Menu,
  X,
  Target,
  Zap,
  Clock,
  Medal
} from 'lucide-react'

// Components
import Planner from './components/Planner'
import AIChat from './components/AIChat'
import Habits from './components/Habits'
import Analytics from './components/Analytics'
import TimeTracker from './components/TimeTracker'
import Onboarding, { type UserProfile } from './components/Onboarding'
import BadgesPage, { type Badge, getDefaultBadges, updateBadgeProgress, BadgeUnlockPopup } from './components/Badges'

interface ScoreData {
  score: number;
  tasksCompleted: number;
  totalTasks: number;
  habitsCompleted: string[];
  gymSessions: number;
  dsaSessions: number;
  aiChats: number;
  lastUpdated: string;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'planner', label: 'Schedule', icon: Calendar },
  { id: 'chat', label: 'AI Coach', icon: MessageSquare },
  { id: 'habits', label: 'Habits', icon: CheckCircle2 },
  { id: 'badges', label: 'Medals', icon: Trophy },
  { id: 'tracker', label: 'Waste Tracker', icon: Clock },
  { id: 'analytics', label: 'Analytics', icon: LineChart },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [scoreData, setScoreData] = useState<ScoreData>({
    score: 0, tasksCompleted: 0, totalTasks: 10, habitsCompleted: [], gymSessions: 0, dsaSessions: 0, aiChats: 0, lastUpdated: ''
  })
  const [badges, setBadges] = useState<Badge[]>([])
  const [unlockedPopup, setUnlockedPopup] = useState<Badge | null>(null)

  // Load profile, score & badges from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('growthOS_profile')
    const savedScore = localStorage.getItem('growthOS_score')
    const savedBadges = localStorage.getItem('growthOS_badges')
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile))
      if (savedScore) {
        const parsed = JSON.parse(savedScore);
        setScoreData({
          ...parsed,
          gymSessions: parsed.gymSessions || 0,
          dsaSessions: parsed.dsaSessions || 0,
          aiChats: parsed.aiChats || 0
        });
      }
    } else {
      setShowOnboarding(true)
    }
    setBadges(savedBadges ? JSON.parse(savedBadges) : getDefaultBadges())
  }, [])

  // Save score whenever it changes
  useEffect(() => {
    if (scoreData.lastUpdated) {
      localStorage.setItem('growthOS_score', JSON.stringify(scoreData))
    }
  }, [scoreData])

  // Save badges whenever they change
  useEffect(() => {
    if (badges.length > 0) {
      localStorage.setItem('growthOS_badges', JSON.stringify(badges))
    }
  }, [badges])

  // Detect screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) setIsSidebarOpen(true)
      else setIsSidebarOpen(false)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleOnboardingComplete = (p: UserProfile) => {
    setProfile(p)
    setShowOnboarding(false)
    const savedScore = localStorage.getItem('growthOS_score')
    if (savedScore) setScoreData(JSON.parse(savedScore))
  }

  // Check badges after score or task changes
  const checkBadges = (stats: { score: number, tasksCompleted: number, gymSessions: number, dsaSessions: number, aiChats: number }) => {
    const combinedStats = {
      ...stats,
      streak: profile?.streak || 0,
    }
    const { badges: updatedBadges, newlyUnlocked } = updateBadgeProgress(badges, combinedStats)
    setBadges(updatedBadges)
    if (newlyUnlocked.length > 0) {
      setUnlockedPopup(newlyUnlocked[0])
    }
  }

  const completeTask = (taskTitle: string) => {
    setScoreData(prev => {
      const newCompleted = prev.tasksCompleted + 1
      const newScore = Math.min(100, prev.score + 8)
      
      const isGym = taskTitle.toLowerCase().includes('gym') || taskTitle.toLowerCase().includes('workout');
      const isDsa = taskTitle.toLowerCase().includes('dsa') || taskTitle.toLowerCase().includes('code');
      
      const newGym = prev.gymSessions + (isGym ? 1 : 0);
      const newDsa = prev.dsaSessions + (isDsa ? 1 : 0);

      const stats = {
        score: newScore,
        tasksCompleted: newCompleted,
        gymSessions: newGym,
        dsaSessions: newDsa,
        aiChats: prev.aiChats || 0
      };

      setTimeout(() => checkBadges(stats), 100)
      return { ...prev, tasksCompleted: newCompleted, score: newScore, gymSessions: newGym, dsaSessions: newDsa, lastUpdated: new Date().toDateString() }
    })
  }

  const handleHabitToggle = (habitTitle: string, isCompleted: boolean) => {
    if (!isCompleted) return; // Only award points when completing
    setScoreData(prev => {
      const newScore = Math.min(100, prev.score + 5);
      
      const isGym = habitTitle.toLowerCase().includes('gym') || habitTitle.toLowerCase().includes('workout');
      const isDsa = habitTitle.toLowerCase().includes('dsa') || habitTitle.toLowerCase().includes('code');
      
      const newGym = prev.gymSessions + (isGym ? 1 : 0);
      const newDsa = prev.dsaSessions + (isDsa ? 1 : 0);

      const stats = {
        score: newScore,
        tasksCompleted: prev.tasksCompleted,
        gymSessions: newGym,
        dsaSessions: newDsa,
        aiChats: prev.aiChats || 0
      };

      setTimeout(() => checkBadges(stats), 100)
      return { ...prev, score: newScore, gymSessions: newGym, dsaSessions: newDsa, lastUpdated: new Date().toDateString() }
    })
  }

  const handleNavClick = (id: string) => {
    setActiveTab(id)
    if (isMobile) setIsSidebarOpen(false)
  }

  // Show onboarding if no profile
  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'planner': return <Planner />;
      case 'chat': return <AIChat />;
      case 'habits': return <Habits onHabitToggle={handleHabitToggle} />;
      case 'analytics': return <Analytics />;
      case 'badges': return <BadgesPage />;
      case 'tracker': return <TimeTracker />;
      case 'dashboard':
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 relative z-10">
            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="glass-card p-4 md:p-6 md:col-span-2 flex flex-col justify-between bg-gradient-to-br from-purple-600/10 via-transparent to-transparent group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-300 tracking-wide">Daily Growth Score</h3>
                  <div className="text-4xl md:text-6xl font-black mt-2 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent drop-shadow-sm">
                    {scoreData.score} <span className="text-xl md:text-2xl text-purple-500">{scoreData.score > 50 ? `+${Math.round(scoreData.score * 0.14)}%` : 'New'}</span>
                  </div>
                  {profile && <p className="text-gray-400 text-xs mt-2 font-medium">Keep going, {profile.name}! 🔥</p>}
                </div>
                <div className="p-2 md:p-3 bg-purple-600/20 rounded-2xl border border-purple-500/20 shadow-[0_0_15px_rgba(147,51,234,0.3)] group-hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] transition-all">
                  <Trophy className="text-purple-400" size={20} />
                </div>
              </div>
              <div className="mt-6 md:mt-8">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Goal Progress</span>
                  <span>{scoreData.tasksCompleted}/{scoreData.totalTasks} tasks</span>
                </div>
                <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (scoreData.tasksCompleted / scoreData.totalTasks) * 100)}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-full shadow-[0_0_15px_rgba(139,92,246,0.5)]" 
                  />
                </div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="glass-card p-4 md:p-6 flex flex-col gap-4"
            >
              <h3 className="font-semibold mb-2 tracking-wide">Today's Focus</h3>
              <div className="space-y-3">
                {[
                  { title: 'Gym Workout', time: '08:00 AM' },
                  { title: 'DSA Practice', time: '10:00 AM' },
                ].map((task, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-colors group/task">
                    <button 
                      onClick={() => completeTask(task.title)}
                      className="w-5 h-5 rounded-full border-2 border-gray-500 hover:border-green-500 group-hover/task:border-gray-400 hover:bg-green-500/20 transition-all flex items-center justify-center shrink-0"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-200 group-hover/task:text-white transition-colors">{task.title}</p>
                      <p className="text-[10px] text-gray-500 font-medium">{task.time}</p>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => handleNavClick('planner')}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-white/20 text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/40 transition-all"
                >
                  <Plus size={18} />
                  <span className="font-medium text-sm">Add Task</span>
                </button>
              </div>
            </motion.div>

            {profile && (
              <motion.div 
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="glass-card p-4 md:p-6 md:col-span-2 bg-gradient-to-br from-blue-600/5 via-transparent to-transparent border-blue-500/10"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    <Target size={24} />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <h4 className="font-bold text-[11px] text-blue-400 uppercase tracking-[0.15em]">Your Mission</h4>
                    <p className="text-white text-base mt-1 font-medium leading-relaxed">{profile.goal}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {profile.focusAreas.map(area => (
                        <span key={area} className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Medal Cabinet Preview */}
            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="glass-card p-4 md:p-6 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent border-amber-500/10 group"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-semibold flex items-center gap-2 tracking-wide">
                  <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-500 group-hover:scale-110 transition-transform">
                    <Medal size={16} />
                  </div>
                  Medal Cabinet
                </h3>
                <button 
                  onClick={() => handleNavClick('badges')}
                  className="text-[10px] font-bold text-gray-400 hover:text-white uppercase tracking-[0.1em] px-2 py-1 rounded-md hover:bg-white/5 transition-colors"
                >
                  View All
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {badges.filter(b => b.unlocked).length > 0 ? (
                  badges.filter(b => b.unlocked).slice(0, 4).map(badge => (
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      key={badge.id} 
                      className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/30 flex items-center justify-center text-2xl shrink-0 shadow-lg" 
                      title={badge.title}
                    >
                      {badge.emoji}
                    </motion.div>
                  ))
                ) : (
                  <p className="text-[11px] text-gray-500 font-medium">No medals earned yet. Complete tasks to unlock!</p>
                )}
                {badges.filter(b => b.unlocked).length > 4 && (
                  <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-xs font-bold text-gray-400">
                    +{badges.filter(b => b.unlocked).length - 4}
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="glass-card p-4 md:p-6 md:col-span-2 bg-[#0a0a0c]/80 border-purple-500/20 relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-[50px]"></div>
               <div className="flex items-start gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-purple-600/20 flex items-center justify-center text-purple-400 shrink-0 border border-purple-500/20">
                    <Zap size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold tracking-wide">Growth Insight</h4>
                    <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                      {scoreData.score >= 70 
                        ? `"Amazing work${profile ? ', ' + profile.name : ''}! You're in the top 5% this week. Keep the momentum going!"` 
                        : scoreData.score >= 40 
                          ? `"Good progress${profile ? ', ' + profile.name : ''}! Complete a few more tasks to boost your score above 70."` 
                          : `"Let's get started${profile ? ', ' + profile.name : ''}! Complete your first tasks to start building momentum."`
                      }
                    </p>
                    <button 
                      onClick={() => handleNavClick('chat')}
                      className="mt-5 glass-button text-xs font-semibold tracking-wide"
                    >
                      Chat with Coach
                    </button>
                  </div>
               </div>
            </motion.div>
          </div>
        );
    }
  }

  return (
    <div className="flex h-screen bg-[#030305] text-white overflow-hidden font-sans relative">
      {/* Animated Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] animate-blob mix-blend-screen"></div>
        <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] rounded-full bg-blue-600/20 blur-[120px] animate-blob mix-blend-screen animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-indigo-600/15 blur-[120px] animate-blob mix-blend-screen animation-delay-4000"></div>
      </div>

      {/* Mobile Backdrop */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? 260 : (isMobile ? 0 : 80),
          x: isMobile && !isSidebarOpen ? -260 : 0
        }}
        className={`${
          isMobile 
            ? 'fixed left-0 top-0 bottom-0 z-40' 
            : 'relative'
        } glass-card ${isMobile ? 'm-0 rounded-none border-r border-white/10' : 'm-4'} border-r-0 flex flex-col transition-all duration-300 overflow-hidden`}
      >
        <div className="p-4 md:p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-black tracking-tighter bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent uppercase"
            >
              GrowthOS
            </motion.h1>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-3 md:px-4 space-y-1 md:space-y-2 mt-2 md:mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' 
                  : 'hover:bg-white/5 text-gray-500 border border-transparent'
              }`}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3 md:p-4">
          <div className="glass-card p-3 md:p-4 space-y-3 bg-gradient-to-t from-purple-600/5 to-transparent">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <Flame size={14} className="text-orange-500" />
              {isSidebarOpen && <span>Beast Mode</span>}
            </div>
            {isSidebarOpen && (
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-full w-[85%]" />
              </div>
            )}
            {isSidebarOpen && <p className="text-[10px] text-gray-500 text-center font-mono">Lv. 12 • 520 / 600 XP</p>}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-4 md:pt-6 relative">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="flex justify-between items-center mb-6 md:mb-10">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              {isMobile && (
                <button 
                  onClick={() => setIsSidebarOpen(true)} 
                  className="p-2 hover:bg-white/10 rounded-lg text-gray-400 mr-1"
                >
                  <Menu size={22} />
                </button>
              )}
              <div>
                <h2 className="text-xl md:text-3xl font-black">
                  {navItems.find(n => n.id === activeTab)?.label}
                </h2>
                <p className="text-gray-500 text-xs md:text-sm mt-0.5 md:mt-1 font-medium italic hidden sm:block">"Become better every single day."</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden lg:flex items-center gap-4 mr-4">
                <div className="flex flex-col items-end">
                   <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">Growth Points</span>
                   <span className="text-lg font-black text-purple-400">+1,240 XP</span>
                </div>
                <div className="h-10 w-[1px] bg-white/10" />
              </div>
              <button className="glass-button p-2 md:p-2.5 relative group">
                <Bell size={18} className="group-hover:rotate-12 transition-transform" />
                <span className="absolute top-1.5 right-1.5 md:top-2 md:right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#050505]" />
              </button>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 p-[2px]">
                 <div className="w-full h-full bg-[#050505] rounded-[9px] flex items-center justify-center font-bold text-xs">{profile ? profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : 'U'}</div>
              </div>
            </div>
          </header>

          {/* Sub-Page Content */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating Action */}
        <button 
          onClick={() => handleNavClick('chat')}
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-purple-600 flex items-center justify-center shadow-2xl shadow-purple-900/40 hover:scale-110 active:scale-95 transition-all z-50 neon-glow"
        >
          <Target className="text-white" size={20} />
        </button>
      </main>

      <BadgeUnlockPopup 
        badge={unlockedPopup} 
        onClose={() => setUnlockedPopup(null)} 
      />
    </div>
  )
}

