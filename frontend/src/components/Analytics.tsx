import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { TrendingUp, Activity, Clock, Zap } from 'lucide-react';

const growthData = [
  { name: 'Mon', score: 65, waste: 4 },
  { name: 'Tue', score: 72, waste: 3 },
  { name: 'Wed', score: 85, waste: 2 },
  { name: 'Thu', score: 78, waste: 5 },
  { name: 'Fri', score: 90, waste: 1.5 },
  { name: 'Sat', score: 95, waste: 1.2 },
  { name: 'Sun', score: 88, waste: 2.5 },
];

const habitStats = [
  { name: 'Completed', value: 75, color: '#8b5cf6' },
  { name: 'Missed', value: 25, color: '#ef4444' },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        {[
          { label: 'Weekly Growth', value: '+24%', icon: TrendingUp, color: 'text-green-500' },
          { label: 'Focus Hours', value: '42.5h', icon: Zap, color: 'text-yellow-500' },
          { label: 'Habit Consistency', value: '88%', icon: Activity, color: 'text-purple-500' },
          { label: 'Avg Waste Time', value: '1.2h', icon: Clock, color: 'text-blue-500' },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 flex flex-col gap-2">
            <stat.icon className={stat.color} size={20} />
            <span className="text-gray-400 text-xs font-medium">{stat.label}</span>
            <span className="text-2xl font-bold">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Trends */}
        <div className="glass-card p-6">
          <h3 className="font-bold mb-6">Growth Score Trends</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1c', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="score" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time Waste report */}
        <div className="glass-card p-6">
          <h3 className="font-bold mb-6">Productive Replacement Potential</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1c', border: '1px solid #ffffff10', borderRadius: '12px' }}
                />
                <Bar dataKey="waste" radius={[4, 4, 0, 0]}>
                   {growthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.waste > 3 ? '#ef4444' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-gray-500 text-xs mt-4 text-center italic">
            Tip: You wasted most time on Thursday. Aurora recommends switching Reels for 15 mins of reading.
          </p>
        </div>
      </div>
    </div>
  );
}
