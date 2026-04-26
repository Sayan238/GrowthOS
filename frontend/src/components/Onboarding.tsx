import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Rocket, Target, Brain, Flame, Trophy } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export interface UserProfile {
  name: string;
  goal: string;
  focusAreas: string[];
  dailyHours: number;
  currentLevel: string;
  streak: number;
}

const focusOptions = [
  { id: 'dsa', label: 'DSA / Coding', emoji: '💻' },
  { id: 'ml', label: 'Machine Learning', emoji: '🤖' },
  { id: 'gym', label: 'Gym / Fitness', emoji: '💪' },
  { id: 'reading', label: 'Reading', emoji: '📚' },
  { id: 'content', label: 'Content Creation', emoji: '🎬' },
  { id: 'meditation', label: 'Meditation', emoji: '🧘' },
  { id: 'projects', label: 'Side Projects', emoji: '🚀' },
  { id: 'study', label: 'College Study', emoji: '🎓' },
];

const levelOptions = [
  { id: 'beginner', label: 'Just Starting', desc: 'I want to build discipline from scratch', emoji: '🌱' },
  { id: 'intermediate', label: 'Somewhat Consistent', desc: 'I do some things daily but need structure', emoji: '🔥' },
  { id: 'advanced', label: 'Beast Mode', desc: 'I grind daily but want to optimize further', emoji: '⚡' },
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    goal: '',
    focusAreas: [],
    dailyHours: 4,
    currentLevel: '',
    streak: 0,
  });

  const toggleFocus = (id: string) => {
    setProfile(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(id)
        ? prev.focusAreas.filter(f => f !== id)
        : [...prev.focusAreas, id]
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 0: return profile.name.trim().length > 0;
      case 1: return profile.goal.trim().length > 0;
      case 2: return profile.focusAreas.length > 0;
      case 3: return profile.dailyHours > 0;
      case 4: return profile.currentLevel !== '';
      default: return true;
    }
  };

  const handleFinish = () => {
    const baseScore = profile.currentLevel === 'beginner' ? 30 : profile.currentLevel === 'intermediate' ? 55 : 75;
    const finalProfile = { ...profile, streak: 0 };
    localStorage.setItem('growthOS_profile', JSON.stringify(finalProfile));
    localStorage.setItem('growthOS_score', JSON.stringify({
      score: baseScore,
      tasksCompleted: 0,
      totalTasks: profile.focusAreas.length * 2,
      habitsCompleted: [],
      lastUpdated: new Date().toDateString(),
    }));
    onComplete(finalProfile);
  };

  const steps = [
    // Step 0: Name
    <div key="name" className="space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-purple-600/20 flex items-center justify-center mx-auto">
        <Rocket className="text-purple-400" size={32} />
      </div>
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-black">Welcome to GrowthOS</h2>
        <p className="text-gray-400 text-sm mt-2">Let's set up your personal growth engine.</p>
      </div>
      <div>
        <label className="text-xs text-gray-400 mb-2 block">What should I call you?</label>
        <input
          type="text"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg outline-none focus:border-purple-500 text-white"
          placeholder="Enter your name..."
          autoFocus
        />
      </div>
    </div>,

    // Step 1: Goal
    <div key="goal" className="space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center mx-auto">
        <Target className="text-blue-400" size={32} />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-black">What's your biggest goal?</h2>
        <p className="text-gray-400 text-sm mt-2">This helps Aurora personalize your coaching.</p>
      </div>
      <div>
        <textarea
          value={profile.goal}
          onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500 text-white min-h-[100px] resize-none"
          placeholder="e.g. Crack FAANG interviews, Build 6-pack abs, Launch a SaaS product..."
        />
      </div>
    </div>,

    // Step 2: Focus Areas
    <div key="focus" className="space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-cyan-600/20 flex items-center justify-center mx-auto">
        <Brain className="text-cyan-400" size={32} />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-black">Pick your focus areas</h2>
        <p className="text-gray-400 text-sm mt-2">Select all that you want to improve in.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {focusOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => toggleFocus(opt.id)}
            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
              profile.focusAreas.includes(opt.id)
                ? 'border-purple-500 bg-purple-600/20 text-white'
                : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            <span className="text-xl">{opt.emoji}</span>
            <span className="text-sm font-medium">{opt.label}</span>
          </button>
        ))}
      </div>
    </div>,

    // Step 3: Daily Hours
    <div key="hours" className="space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-orange-600/20 flex items-center justify-center mx-auto">
        <Flame className="text-orange-400" size={32} />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-black">Daily commitment</h2>
        <p className="text-gray-400 text-sm mt-2">How many productive hours can you commit daily?</p>
      </div>
      <div className="text-center">
        <div className="text-6xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          {profile.dailyHours}h
        </div>
        <input
          type="range"
          min="1"
          max="12"
          value={profile.dailyHours}
          onChange={(e) => setProfile({ ...profile, dailyHours: parseInt(e.target.value) })}
          className="w-full mt-4 accent-purple-500"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1 hour</span>
          <span>12 hours</span>
        </div>
      </div>
    </div>,

    // Step 4: Current Level
    <div key="level" className="space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-green-600/20 flex items-center justify-center mx-auto">
        <Trophy className="text-green-400" size={32} />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-black">Where are you right now?</h2>
        <p className="text-gray-400 text-sm mt-2">Be honest — this sets your starting baseline.</p>
      </div>
      <div className="space-y-3">
        {levelOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setProfile({ ...profile, currentLevel: opt.id })}
            className={`w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-all ${
              profile.currentLevel === opt.id
                ? 'border-purple-500 bg-purple-600/20'
                : 'border-white/10 bg-white/5 hover:bg-white/10'
            }`}
          >
            <span className="text-2xl">{opt.emoji}</span>
            <div>
              <p className="font-bold text-sm">{opt.label}</p>
              <p className="text-xs text-gray-500">{opt.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>,
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              i <= step ? 'bg-purple-500' : 'bg-white/10'
            }`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft size={16} /> Back
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              onClick={() => canProceed() && setStep(step + 1)}
              disabled={!canProceed()}
              className="flex-1 px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!canProceed()}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-30 text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
            >
              Launch GrowthOS 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
