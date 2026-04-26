import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, GripVertical } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  time: string;
  color: string;
}

const SortableItem = ({ task, onEdit }: { task: Task, onEdit: (t: Task) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="glass-card p-4 flex items-center gap-4 group hover:border-white/20 transition-all mb-3"
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-500 hover:text-white">
        <GripVertical size={18} />
      </button>
      <div className={`w-1 h-10 rounded-full ${task.color}`} />
      <div className="flex-1">
        <h4 className="font-medium text-sm">{task.title}</h4>
        <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
          <Clock size={10} />
          <span>{task.time}</span>
        </div>
      </div>
      <button 
        onClick={() => onEdit(task)} 
        className="text-xs text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        Edit
      </button>
    </div>
  );
};

export default function Planner() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Morning Gym Session', time: '07:00 AM - 08:30 AM', color: 'bg-purple-500' },
    { id: '2', title: 'DSA Practice: Trees', time: '10:00 AM - 12:00 PM', color: 'bg-blue-500' },
    { id: '3', title: 'ML Course: Transformers', time: '02:00 PM - 04:00 PM', color: 'bg-cyan-500' },
    { id: '4', title: 'Content Creation: Reels', time: '05:00 PM - 06:30 PM', color: 'bg-pink-500' },
    { id: '5', title: 'Deep Work: Project GrowthOS', time: '08:00 PM - 10:00 PM', color: 'bg-indigo-500' },
  ]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({ title: '', time: '', color: 'bg-purple-500' });

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/sync-schedule`, { tasks });
      alert(`✅ Synced! ${res.data.synced} upcoming reminders scheduled on WhatsApp.`);
    } catch {
      alert('Failed to sync. Is the backend running?');
    }
    setIsSyncing(false);
  };

  const handleAdd = () => {
    setEditingTask(null);
    setFormData({ title: '', time: '', color: 'bg-purple-500' });
    setIsModalOpen(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({ title: task.title, time: task.time, color: task.color });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.time) return;
    
    let savedTask: Task;
    if (editingTask) {
      savedTask = { ...editingTask, ...formData };
      setTasks(tasks.map(t => t.id === editingTask.id ? savedTask : t));
    } else {
      savedTask = { id: Date.now().toString(), ...formData };
      setTasks([...tasks, savedTask]);
    }
    setIsModalOpen(false);

    // Auto-schedule WhatsApp reminder for this task
    try {
      await axios.post(`${API_BASE_URL}/api/schedule-reminder`, {
        id: savedTask.id,
        title: savedTask.title,
        time: savedTask.time
      });
    } catch (e) {
      console.log('Could not schedule reminder:', e);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Daily Planner</h2>
          <p className="text-gray-400 text-sm">Optimize your day with drag-and-drop schedule blocks.</p>
        </div>
        <button onClick={handleSync} disabled={isSyncing} className="glass-button flex items-center gap-2 disabled:opacity-50">
          <Clock size={18} className={isSyncing ? "animate-spin" : ""} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Calendar'}</span>
        </button>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableItem key={task.id} task={task} onEdit={handleEdit} />
          ))}
        </SortableContext>
      </DndContext>

      <button onClick={handleAdd} className="w-full mt-4 p-4 rounded-2xl border border-dashed border-white/10 text-gray-500 hover:text-white transition-all flex items-center justify-center gap-2">
        <span>+ Add New Block</span>
      </button>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-6 w-full max-w-md bg-[#0a0a0c] border border-white/10 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-white">
              {editingTask ? 'Edit Block' : 'Add New Block'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Task Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-500 text-white" 
                  placeholder="e.g. Read a book"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Time Slot</label>
                <input 
                  type="text" 
                  value={formData.time} 
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-500 text-white" 
                  placeholder="e.g. 08:00 AM - 09:00 AM"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Color Code</label>
                <select 
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-500 text-white appearance-none"
                >
                  <option className="bg-[#0a0a0c]" value="bg-purple-500">Purple</option>
                  <option className="bg-[#0a0a0c]" value="bg-blue-500">Blue</option>
                  <option className="bg-[#0a0a0c]" value="bg-cyan-500">Cyan</option>
                  <option className="bg-[#0a0a0c]" value="bg-pink-500">Pink</option>
                  <option className="bg-[#0a0a0c]" value="bg-indigo-500">Indigo</option>
                  <option className="bg-[#0a0a0c]" value="bg-green-500">Green</option>
                  <option className="bg-[#0a0a0c]" value="bg-orange-500">Orange</option>
                  <option className="bg-[#0a0a0c]" value="bg-red-500">Red</option>
                </select>
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
                  Save Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
