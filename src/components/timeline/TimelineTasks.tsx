import React, { useState, useEffect } from 'react';
import type { EventPlan, TimelineTask } from '../../types';
import { generateId } from '../../utils/helpers';
import {
  CalendarCheck,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Clock,
  Filter,
  CheckSquare,
  X,
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
  const [newPriority, setNewPriority] = useState<TimelineTask['priority']>('medium');
  const [newCategory, setNewCategory] = useState('Production');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    if (!showAddModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal]);

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
      id: generateId('task'),
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
          aria-label="Add Custom Task"
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
              aria-label="Filter tasks by category"
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white font-mono-code text-xs font-bold px-2.5 py-1.5 rounded-lg neo-border focus:outline-none focus:ring-1 focus:ring-black"
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
                role="checkbox"
                aria-checked={task.completed}
                tabIndex={0}
                aria-label={`Mark task ${task.title} as ${task.completed ? 'pending' : 'completed'}`}
                onClick={() => toggleTask(task.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleTask(task.id);
                  }
                }}
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
                  aria-label={`Delete task ${task.title}`}
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
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-task-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-[#FCFBF7] w-full max-w-lg rounded-2xl neo-border neo-shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/10">
              <h3 id="add-task-modal-title" className="font-mono-code text-lg font-bold text-[#171717]">
                Add Custom Milestone Task
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Close add task modal"
                className="p-1 hover:bg-black/10 rounded-full cursor-pointer text-[#171717]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4 text-xs">
              <div>
                <label htmlFor="task-title" className="font-bold text-[#171717] block mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  id="task-title"
                  required
                  placeholder="e.g. Confirm acoustic sound-check schedule"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white p-2.5 rounded-lg neo-border focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="task-due-date" className="font-bold text-[#171717] block mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="task-due-date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-white p-2 rounded-lg neo-border focus:outline-none font-mono-code focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label htmlFor="task-time-slot" className="font-bold text-[#171717] block mb-1">
                    Time Slot
                  </label>
                  <input
                    type="text"
                    id="task-time-slot"
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    className="w-full bg-white p-2 rounded-lg neo-border focus:outline-none font-mono-code focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="task-category" className="font-bold text-[#171717] block mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    id="task-category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-white p-2 rounded-lg neo-border focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label htmlFor="task-priority" className="font-bold text-[#171717] block mb-1">
                    Priority
                  </label>
                  <select
                    id="task-priority"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TimelineTask['priority'])}
                    className="w-full bg-white p-2 rounded-lg neo-border focus:outline-none font-mono-code"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="task-notes" className="font-bold text-[#171717] block mb-1">
                  Notes / Details
                </label>
                <textarea
                  id="task-notes"
                  rows={2}
                  placeholder="Optional logistical notes or contacts..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-white p-2.5 rounded-lg neo-border focus:outline-none focus:ring-1 focus:ring-black"
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
