import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Building2, DollarSign, FileText, Trash2, GripVertical } from 'lucide-react';

interface Job { id: string; company: string; title: string; salary: string; notes: string; }

const initialJobs: Record<string, Job[]> = {
  applied: [
    { id: '1', company: 'TechCorp', title: 'Senior Developer', salary: '$120k-150k', notes: 'Applied via LinkedIn' },
    { id: '2', company: 'StartupXYZ', title: 'Full Stack Engineer', salary: '$100k-130k', notes: 'Referred by John' },
  ],
  talking: [{ id: '3', company: 'BigTech Inc', title: 'Staff Engineer', salary: '$180k-220k', notes: 'Phone screen scheduled' }],
  offer: [{ id: '4', company: 'InnovateLabs', title: 'Lead Developer', salary: '$160k', notes: 'Offer received' }],
  not_moving: [{ id: '5', company: 'OldCompany', title: 'Developer', salary: '$90k', notes: 'Position closed' }],
};

const columns = [
  { id: 'applied', title: 'Applied', color: 'border-violet-500' },
  { id: 'talking', title: 'Talking to Them', color: 'border-cyan-500' },
  { id: 'offer', title: 'Got an Offer', color: 'border-green-500' },
  { id: 'not_moving', title: 'Not Moving Forward', color: 'border-red-500' },
];

export default function Jobs() {
  const [jobs, setJobs] = useState(initialJobs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newJob, setNewJob] = useState({ company: '', title: '', salary: '', notes: '', status: 'applied' });
  const [draggedJob, setDraggedJob] = useState<{ job: Job; fromColumn: string } | null>(null);

  const handleAddJob = () => {
    if (!newJob.company || !newJob.title) return;
    const job: Job = { id: Date.now().toString(), company: newJob.company, title: newJob.title, salary: newJob.salary, notes: newJob.notes };
    setJobs((prev) => ({ ...prev, [newJob.status]: [...prev[newJob.status], job] }));
    setNewJob({ company: '', title: '', salary: '', notes: '', status: 'applied' });
    setIsModalOpen(false);
  };

  const handleDeleteJob = (columnId: string, jobId: string) => {
    setJobs((prev) => ({ ...prev, [columnId]: prev[columnId].filter((j) => j.id !== jobId) }));
  };

  const handleDragStart = (e: React.DragEvent, job: Job, fromColumn: string) => {
    setDraggedJob({ job, fromColumn });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, toColumn: string) => {
    e.preventDefault();
    if (!draggedJob) return;
    const { job, fromColumn } = draggedJob;
    if (fromColumn === toColumn) { setDraggedJob(null); return; }
    setJobs((prev) => ({ ...prev, [fromColumn]: prev[fromColumn].filter((j) => j.id !== job.id), [toColumn]: [...prev[toColumn], job] }));
    setDraggedJob(null);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">My Jobs</h1>
          <p className="text-gray-400">Track and manage your job applications</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsModalOpen(true)} className="btn-primary px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2">
          <Plus size={20} /> Add a Job
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {columns.map((column, colIndex) => (
          <motion.div key={column.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: colIndex * 0.1 }} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, column.id)} className="min-h-[200px]">
            <div className={`border-l-4 ${column.color} pl-4 mb-4`}>
              <h3 className="text-white font-semibold">{column.title}</h3>
              <p className="text-gray-500 text-sm">{jobs[column.id].length} jobs</p>
            </div>
            <div className="space-y-3">
              <AnimatePresence>
                {jobs[column.id].map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    draggable
                    onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, job, column.id)}
                    className="kanban-card bg-glass border-glow rounded-xl p-4 cursor-grab active:cursor-grabbing group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <GripVertical className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                        <Building2 className="text-violet-400" size={18} />
                        <h4 className="text-white font-medium">{job.company}</h4>
                      </div>
                      <button onClick={() => handleDeleteJob(column.id, job.id)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{job.title}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      {job.salary && <span className="flex items-center gap-1"><DollarSign size={12} />{job.salary}</span>}
                      {job.notes && <span className="flex items-center gap-1"><FileText size={12} />Notes</span>}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={() => setIsModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-glass border-glow rounded-2xl p-6 w-full max-w-md card-glow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Add a Job</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm block mb-2">Company Name</label>
                  <input type="text" value={newJob.company} onChange={(e) => setNewJob({ ...newJob, company: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" placeholder="e.g., TechCorp" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-2">Job Title</label>
                  <input type="text" value={newJob.title} onChange={(e) => setNewJob({ ...newJob, title: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" placeholder="e.g., Senior Developer" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-2">Salary Range</label>
                  <input type="text" value={newJob.salary} onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" placeholder="e.g., $120k-150k" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-2">Status</label>
                  <select value={newJob.status} onChange={(e) => setNewJob({ ...newJob, status: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white">
                    <option value="applied">Applied</option>
                    <option value="talking">Talking to Them</option>
                    <option value="offer">Got an Offer</option>
                    <option value="not_moving">Not Moving Forward</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-2">Notes</label>
                  <textarea value={newJob.notes} onChange={(e) => setNewJob({ ...newJob, notes: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white resize-none" rows={3} placeholder="Any additional notes..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1 py-3 rounded-lg text-white font-medium">Cancel</button>
                  <button onClick={handleAddJob} className="btn-primary flex-1 py-3 rounded-lg text-white font-medium">Add Job</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-center text-gray-500 text-sm mt-6">Drag and drop cards between columns to update status</p>
    </motion.div>
  );
}
