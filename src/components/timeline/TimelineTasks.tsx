import React, { useState } from 'react';
import type { EventPlan, TimelineTask } from '../../types';
import {
  CalendarCheck,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Clock,
  Filter,
  CheckSquare,
} from 'lucide-react';

interface TimelineTasksProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
}

export const TimelineTasks: React.FC<TimelineTasksProps> = ({
  event,
  onUpdateEvent,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState(event.date);
  const [newTimeSlot, setNewTimeSlot] = useState('11:00 AM');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newCategory, setNewCategory] = useState('Production');
  const [newNotes, setNewNotes] = useState('');

  const categories = Array.from(
    new Set(event.timeline.map((t) => t.category).filter(Boolean))
  );

  const toggleTask = (taskId: string) => {
    const updated = event.timeline.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    onUpdateEvent({ ...event, timeline: updated });
  };

  const deleteTask = (taskId: string) => {
    const updated = event.timeline.filter((t) => t.id !== taskId);
    onUpdateEvent({ ...event, timeline: updated });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TimelineTask = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      dueDate: newDueDate,
      timeSlot: newTimeSlot,
      priority: newPriority,
      category: newCategory,
      completed: false,
      notes: newNotes.trim(),
    };

    onUpdateEvent({
      ...event,
      timeline: [...event.timeline, newTask],
    });

    setNewTitle('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const filteredTasks = event.timeline.filter((t) => {
    if (filterStatus === 'pending' && t.completed) return false;
    if (filterStatus === 'completed' && !t.completed) return false;
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    return true;
  });

  const completedCount = event.timeline.filter((t) => t.completed).length;

  return (
    <div className="space-y-6 pt-2 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 bg-white rounded-2xl neo-border neo-shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#C2F2B0] neo-border flex items-center justify-center text-[#171717]">
              <CalendarCheck className="w-4 h-4 stroke-[2.2]" />
            </span>
            <h2 className="font-mono-code text-xl font-bold text-[#171717]">
              Timeline & Tasks Checklist
            </h2>
          </div>
          <p className="text-xs text-[#565656] mt-1">
            Track milestones, booking deadlines, and on-the-day running order for {event.name}.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#171717] text-white rounded-xl neo-shadow-sm font-mono-code text-xs font-bold hover:bg-[#2b2b2b] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Task</span>
        </button>
      </div>

      {/* Filter and Status Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-2">
          {(['all', 'pending', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl font-mono-code text-xs font-bold capitalize transition-colors cursor-pointer ${
                filterStatus === status
                  ? 'bg-[#171717] text-white neo-shadow-sm'
                  : 'bg-white text-[#565656] neo-border hover:bg-black/5'
              }`}
            >
              {status}
              {status === 'all' && ` (${event.timeline.length})`}
              {status === 'pending' && ` (${event.timeline.length - completedCount})`}
              {status === 'completed' && ` (${completedCount})`}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#565656]" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white font-mono-code text-xs font-bold px-2.5 py-1.5 rounded-lg neo-border focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl neo-border">
            <CheckSquare className="w-8 h-8 text-[#565656]/40 mx-auto mb-2" />
            <p className="font-mono-code text-sm text-[#565656]">No tasks match your filter.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-2xl neo-border transition-all flex items-start justify-between gap-3 ${
                task.completed
                  ? 'bg-[#C2F2B0]/30 border-black/20'
                  : 'bg-white neo-shadow-sm hover:-translate-y-0.5'
              }`}
            >
              <div
                onClick={() => toggleTask(task.id)}
                className="flex items-start gap-3 flex-1 cursor-pointer"
              >
                <div className="mt-0.5 shrink-0">
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#171717]" />
                  )}
                </div>
                <div>
                  <h4
                    className={`font-bold text-sm ${
                      task.completed ? 'line-through text-[#565656]' : 'text-[#171717]'
                    }`}
                  >
                    {task.title}
                  </h4>
                  {task.notes && (
                    <p className="text-xs text-[#565656] mt-0.5">{task.notes}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 font-mono-code text-[10px]">
                    <span className="bg-black/5 px-2 py-0.5 rounded text-[#171717]">
                      {task.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold ${
                        task.priority === 'high'
                          ? 'bg-red-100 text-red-800'
                          : task.priority === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-[#565656]'
                      }`}
                    >
                      {task.priority.toUpperCase()}
                    </span>
                    {task.timeSlot && (
                      <span className="flex items-center gap-1 text-[#565656]">
                        <Clock className="w-3 h-3" /> {task.timeSlot}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono-code text-xs text-[#565656]">
                  {task.dueDate}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-[#FCFBF7] w-full max-w-lg rounded-2xl neo-border neo-shadow-lg p-6 space-y-4">
            <h3 className="font-mono-code text-lg font-bold text-[#171717]">
              Add Custom Milestone Task
            </h3>
            <form onSubmit={handleAddTask} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#171717] block mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Confirm acoustic sound-check schedule"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white p-2.5 rounded-lg neo-border focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#171717] block mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-white p-2 rounded-lg neo-border focus:outline-none font-mono-code"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#171717] block mb-1">
                    Time Slot
                  </label>
                  <input
                    type="text"
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    className="w-full bg-white p-2 rounded-lg neo-border focus:outline-none font-mono-code"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#171717] block mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-white p-2 rounded-lg neo-border focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#171717] block mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-white p-2 rounded-lg neo-border focus:outline-none font-mono-code"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#171717] block mb-1">
                  Notes / Details
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional logistical notes or contacts..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-white p-2.5 rounded-lg neo-border focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-mono-code text-xs font-bold text-[#565656] hover:text-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#171717] text-white rounded-lg font-mono-code text-xs font-bold hover:bg-[#2b2b2b] cursor-pointer"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
