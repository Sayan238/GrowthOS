import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Youtube, Ban, ArrowRight, Brain, AlertTriangle } from 'lucide-react';

export default function TimeTracker() {
  const [waste, setWaste] = useState({
    instagram: 45,
    reels: 30,
    youtube: 60
  });

  const totalWaste = (waste.instagram + waste.reels + waste.youtube) / 60;

  return (
    <div className="space-y-6">
      <div className="glass-card p-8 bg-gradient-to-br from-red-500/10 to-transparent border-red-500/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-red-500/20 rounded-2xl text-red-400">
            <Ban size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Time Waste Monitor</h2>
            <p className="text-gray-400 text-sm">Every minute scrolling is a minute not building.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: 'instagram', icon: Instagram, label: 'Instagram', color: 'text-pink-500' },
            { id: 'reels', icon: Youtube, label: 'Shorts/Reels', color: 'text-red-500' },
            { id: 'youtube', icon: Youtube, label: 'YouTube', color: 'text-red-400' },
          ].map((app) => (
             <div key={app.id} className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <app.icon className={app.color} size={20} />
                  <span className="text-[10px] text-gray-500">Manual Entry</span>
                </div>
                <p className="text-sm font-bold">{app.label}</p>
                <div className="flex items-center gap-2">
                   <input 
                      type="number" 
                      value={waste[app.id as keyof typeof waste]}
                      onChange={(e) => setWaste({...waste, [app.id]: parseInt(e.target.value) || 0})}
                      className="w-full bg-black/40 border border-white/10 rounded-lg py-1.5 px-3 text-sm"
                   />
                   <span className="text-xs text-gray-500">min</span>
                </div>
             </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-bold flex items-center gap-2 mb-4">
             <AlertTriangle size={18} className="text-yellow-500" />
             Impact Assessment
          </h3>
          <div className="space-y-4">
             <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Total Wasted Today</span>
                <span className="text-red-400 font-bold">{totalWaste.toFixed(1)} Hours</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Potential DSA Problems Solved</span>
                <span className="text-green-400 font-bold">{Math.floor(totalWaste * 2)} Problems</span>
             </div>
             <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Pages You Could Have Read</span>
                <span className="text-blue-400 font-bold">{Math.floor(totalWaste * 40)} Pages</span>
             </div>
          </div>
        </div>

        <div className="glass-card p-6 bg-purple-600/5 border-purple-500/20">
          <h3 className="font-bold flex items-center gap-2 mb-4">
             <Brain size={18} className="text-purple-400" />
             Aurora's Suggestion
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            "Sayan, you've spent 2.5 hours on entertainment today. If we convert just 30 minutes of that into ML 
            learning, you'd finish your Transformer model 2 days earlier! Ready to switch?"
          </p>
          <button className="mt-4 flex items-center gap-2 text-purple-400 text-sm font-bold hover:gap-3 transition-all">
            Open ML Learning Module <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
