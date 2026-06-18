import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Building2, DollarSign, FileText, Trash2, GripVertical, Eye, Edit2, Calendar, MapPin, ExternalLink, Clock, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { supabase } from '../lib/supabase';

const columns = [
  { id: 'applied', title: 'Applied', color: 'border-violet-500', bgColor: 'bg-violet-500/20' },
  { id: 'talking', title: 'Talking to Them', color: 'border-cyan-500', bgColor: 'bg-cyan-500/20' },
  { id: 'offer', title: 'Got an Offer', color: 'border-green-500', bgColor: 'bg-green-500/20' },
  { id: 'not_moving', title: 'Not Moving Forward', color: 'border-red-500', bgColor: 'bg-red-500/20' },
];

export default function Jobs() {
  const [jobs, setJobs] = useState({ applied: [], talking: [], offer: [], not_moving: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [editJob, setEditJob] = useState(null);
  const [newJob, setNewJob] = useState({ company: '', title: '', salary: '', notes: '', status: 'applied', location: '', url: '', priority: 'medium' });
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Load jobs from Supabase
  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const grouped = { applied: [], talking: [], offer: [], not_moving: [] };
      (data || []).forEach(job => {
        const status = job.status || 'applied';
        if (grouped[status]) {
          grouped[status].push({
            ...job,
            priority: job.priority || 'medium',
            dateApplied: formatTimeAgo(job.created_at),
          });
        }
      });

      setJobs(grouped);
    } catch (err) {
      console.error('Error loading jobs:', err);
      setError('Failed to load jobs from database');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  useEffect(() => { loadJobs(); }, []);

  // Add new job to Supabase
  const handleAddJob = async () => {
    if (!newJob.company || !newJob.title) {
      alert('Please fill in Company and Job Title');
      return;
    }

    try {
      setSaving(true);
      const { data, error: insertError } = await supabase
        .from('jobs')
        .insert({
          company: newJob.company,
          title: newJob.title,
          salary: newJob.salary,
          notes: newJob.notes,
          status: newJob.status,
          priority: newJob.priority,
          location: newJob.location,
          url: newJob.url,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Also log activity
      await supabase.from('job_activities').insert({
        action: `Applied to ${newJob.title} at ${newJob.company}`,
        details: `Status: ${newJob.status}`,
        type: 'applied',
      });

      // Refresh jobs
      await loadJobs();

      setNewJob({ company: '', title: '', salary: '', notes: '', status: 'applied', location: '', url: '', priority: 'medium' });
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error adding job:', err);
      alert('Failed to add job. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Delete job from Supabase
  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (deleteError) throw deleteError;
      setIsDetailOpen(false);
      setSelectedJob(null);
      await loadJobs();
    } catch (err) {
      console.error('Error deleting job:', err);
      alert('Failed to delete job.');
    }
  };

  // View job detail
  const handleViewJob = (job, columnId) => {
    setSelectedJob({ ...job, status: columnId });
    setIsDetailOpen(true);
  };

  // Edit job
  const handleEditJob = (job, columnId) => {
    setEditJob({ ...job, status: columnId });
    setIsEditModalOpen(true);
    setIsDetailOpen(false);
  };

  // Save edited job
  const handleSaveEdit = async () => {
    if (!editJob.company || !editJob.title) {
      alert('Please fill in Company and Job Title');
      return;
    }

    try {
      setSaving(true);
      const { error: updateError } = await supabase
        .from('jobs')
        .update({
          company: editJob.company,
          title: editJob.title,
          salary: editJob.salary,
          notes: editJob.notes,
          status: editJob.status,
          priority: editJob.priority,
          location: editJob.location,
          url: editJob.url,
          next_step: editJob.next_step || '',
          deadline: editJob.deadline || '',
          reason: editJob.reason || '',
          updated_at: new Date().toISOString(),
        })
        .eq('id', editJob.id);

      if (updateError) throw updateError;

      // Log activity if status changed
      await supabase.from('job_activities').insert({
        action: `Updated ${editJob.title} at ${editJob.company}`,
        details: `Status: ${editJob.status}`,
        type: editJob.status === 'offer' ? 'offer' : editJob.status === 'talking' ? 'reply' : 'applied',
      });

      setIsEditModalOpen(false);
      setEditJob(null);
      await loadJobs();
    } catch (err) {
      console.error('Error updating job:', err);
      alert('Failed to update job.');
    } finally {
      setSaving(false);
    }
  };

  // Move job status
  const moveJobToStatus = async (job, newStatus) => {
    try {
      const { error: updateError } = await supabase
        .from('jobs')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', job.id);

      if (updateError) throw updateError;

      await supabase.from('job_activities').insert({
        action: `Moved ${job.title} to ${newStatus.replace('_', ' ')}`,
        details: `Company: ${job.company}`,
        type: newStatus === 'offer' ? 'offer' : newStatus === 'talking' ? 'reply' : 'applied',
      });

      setIsDetailOpen(false);
      setSelectedJob(null);
      await loadJobs();
    } catch (err) {
      console.error('Error moving job:', err);
      alert('Failed to update job status.');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, job, fromColumn) => {
    e.dataTransfer.setData('jobId', job.id);
    e.dataTransfer.setData('fromColumn', fromColumn);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, toColumn) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('jobId');
    const fromColumn = e.dataTransfer.getData('fromColumn');
    if (fromColumn === toColumn || !jobId) return;

    await moveJobToStatus({ id: jobId, title: 'Job', company: '' }, toColumn);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin text-violet-400 mx-auto mb-4" size={48} />
          <p className="text-gray-400">Loading jobs from Supabase database...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">My Jobs</h1>
          <p className="text-gray-400">Data saved to Supabase database</p>
        </div>
        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={loadJobs} className="btn-secondary px-4 py-3 rounded-xl text-white font-semibold flex items-center gap-2">
            <RefreshCw size={18} /> Refresh
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsModalOpen(true)} className="btn-primary px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2">
            <Plus size={20} /> Add a Job
          </motion.button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by company or title..." className="input-field w-full px-4 py-3 rounded-lg text-white" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field px-4 py-3 rounded-lg text-white">
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {columns.map((col) => (
          <div key={col.id} className={`p-4 rounded-lg ${col.bgColor} border-glow`}>
            <p className="text-gray-400 text-sm">{col.title}</p>
            <p className="text-2xl font-bold text-white">{jobs[col.id].length}</p>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {columns.map((column, colIndex) => (
          <motion.div key={column.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: colIndex * 0.1 }} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, column.id)} className="min-h-[300px]">
            <div className={`border-l-4 ${column.color} pl-4 mb-4`}>
              <h3 className="text-white font-semibold">{column.title}</h3>
              <p className="text-gray-500 text-sm">{jobs[column.id].length} jobs</p>
            </div>
            <div className="space-y-3 min-h-[200px]">
              <AnimatePresence>
                {jobs[column.id]
                  .filter((job) => {
                    const matchesSearch = job.company.toLowerCase().includes(searchTerm.toLowerCase()) || job.title.toLowerCase().includes(searchTerm.toLowerCase());
                    if (filter === 'all') return matchesSearch;
                    return job.priority === filter && matchesSearch;
                  })
                  .map((job, index) => (
                    <motion.div key={job.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} draggable onDragStart={(e) => handleDragStart(e, job, column.id)} className="kanban-card bg-glass border-glow rounded-xl p-4 cursor-grab active:cursor-grabbing group">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          <GripVertical className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                          <div className={`w-2 h-2 rounded-full ${job.priority === 'high' ? 'bg-red-500' : job.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'}`} />
                          <Building2 className="text-violet-400 flex-shrink-0" size={18} />
                          <h4 className="text-white font-medium truncate">{job.company}</h4>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mb-2 pl-6">{job.title}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-3 pl-6">
                        {job.salary && <span className="flex items-center gap-1"><DollarSign size={12} />{job.salary}</span>}
                        {job.location && <span className="flex items-center gap-1"><MapPin size={12} />{job.location.split(',')[0]}</span>}
                      </div>
                      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                        <button onClick={() => handleViewJob(job, column.id)} className="flex-1 py-2 rounded-lg text-violet-400 text-xs flex items-center justify-center gap-1 hover:bg-violet-500/20 transition-colors">
                          <Eye size={14} /> View
                        </button>
                        <button onClick={() => handleEditJob(job, column.id)} className="flex-1 py-2 rounded-lg text-cyan-400 text-xs flex items-center justify-center gap-1 hover:bg-cyan-500/20 transition-colors">
                          <Edit2 size={14} /> Edit
                        </button>
                        <button onClick={() => handleDeleteJob(job.id)} className="flex-1 py-2 rounded-lg text-red-400 text-xs flex items-center justify-center gap-1 hover:bg-red-500/20 transition-colors">
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-center text-gray-500 text-sm mt-6">Drag and drop cards between columns to update status</p>

      {/* Add Job Modal */}
      <AnimatePresence>{isModalOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-glass border-glow rounded-2xl p-6 w-full max-w-lg card-glow max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add a Job</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-gray-400 text-sm block mb-2">Company Name *</label><input type="text" value={newJob.company} onChange={(e) => setNewJob({ ...newJob, company: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" placeholder="e.g., TechCorp" /></div>
                <div><label className="text-gray-400 text-sm block mb-2">Job Title *</label><input type="text" value={newJob.title} onChange={(e) => setNewJob({ ...newJob, title: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" placeholder="e.g., Senior Developer" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-gray-400 text-sm block mb-2">Salary Range</label><input type="text" value={newJob.salary} onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" placeholder="e.g., $120k-150k" /></div>
                <div><label className="text-gray-400 text-sm block mb-2">Location</label><input type="text" value={newJob.location} onChange={(e) => setNewJob({ ...newJob, location: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" placeholder="e.g., San Francisco, CA" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-gray-400 text-sm block mb-2">Status</label><select value={newJob.status} onChange={(e) => setNewJob({ ...newJob, status: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white"><option value="applied">Applied</option><option value="talking">Talking to Them</option><option value="offer">Got an Offer</option><option value="not_moving">Not Moving Forward</option></select></div>
                <div><label className="text-gray-400 text-sm block mb-2">Priority</label><select value={newJob.priority} onChange={(e) => setNewJob({ ...newJob, priority: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white"><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
              </div>
              <div><label className="text-gray-400 text-sm block mb-2">Job Posting URL</label><input type="url" value={newJob.url} onChange={(e) => setNewJob({ ...newJob, url: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" placeholder="https://..." /></div>
              <div><label className="text-gray-400 text-sm block mb-2">Notes</label><textarea value={newJob.notes} onChange={(e) => setNewJob({ ...newJob, notes: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white resize-none" rows={3} placeholder="Any additional notes..." /></div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1 py-3 rounded-lg text-white font-medium">Cancel</button>
                <button onClick={handleAddJob} disabled={saving} className="btn-primary flex-1 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <><Loader2 className="animate-spin" size={18} /> Saving...</> : 'Add Job'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>

      {/* Job Detail Modal */}
      <AnimatePresence>{isDetailOpen && selectedJob && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={() => setIsDetailOpen(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-glass border-glow rounded-2xl p-6 w-full max-w-lg card-glow max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Job Details</h2>
              <button onClick={() => setIsDetailOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg gradient-bg flex items-center justify-center"><Building2 className="text-white" size={24} /></div>
                <div><h3 className="text-2xl font-bold text-white">{selectedJob.company}</h3><p className="text-gray-400">{selectedJob.title}</p></div>
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm ${selectedJob.status === 'offer' ? 'bg-green-500/20 text-green-400' : selectedJob.status === 'talking' ? 'bg-cyan-500/20 text-cyan-400' : selectedJob.status === 'applied' ? 'bg-violet-500/20 text-violet-400' : 'bg-red-500/20 text-red-400'}`}>
                {columns.find(c => c.id === selectedJob.status)?.title}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {selectedJob.salary && <div className="p-4 bg-glass rounded-lg"><div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><DollarSign size={14} />Salary</div><p className="text-white font-semibold">{selectedJob.salary}</p></div>}
                {selectedJob.location && <div className="p-4 bg-glass rounded-lg"><div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><MapPin size={14} />Location</div><p className="text-white font-semibold">{selectedJob.location}</p></div>}
                <div className="p-4 bg-glass rounded-lg"><div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><Calendar size={14} />Applied</div><p className="text-white font-semibold">{selectedJob.dateApplied}</p></div>
                <div className="p-4 bg-glass rounded-lg"><div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><AlertCircle size={14} />Priority</div><p className={`font-semibold ${selectedJob.priority === 'high' ? 'text-red-400' : selectedJob.priority === 'medium' ? 'text-yellow-400' : 'text-gray-400'}`}>{selectedJob.priority?.toUpperCase()}</p></div>
              </div>
              {selectedJob.notes && <div><h4 className="text-gray-400 text-sm mb-2 flex items-center gap-2"><FileText size={14} />Notes</h4><div className="p-4 bg-glass rounded-lg"><p className="text-white">{selectedJob.notes}</p></div></div>}
              {selectedJob.url && <a href={selectedJob.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 p-3 bg-violet-500/20 rounded-lg text-violet-400 hover:bg-violet-500/30 transition-colors"><ExternalLink size={18} />View Job Posting</a>}
              <div><h4 className="text-gray-400 text-sm mb-3">Move to:</h4><div className="grid grid-cols-2 gap-2">{columns.filter(c => c.id !== selectedJob.status).map((col) => (<button key={col.id} onClick={() => moveJobToStatus(selectedJob, col.id)} className={`p-2 rounded-lg ${col.bgColor} text-white text-sm hover:opacity-80 transition-opacity`}>{col.title}</button>))}</div></div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => handleEditJob(selectedJob, selectedJob.status)} className="btn-secondary flex-1 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2"><Edit2 size={18} /> Edit</button>
                <button onClick={() => handleDeleteJob(selectedJob.id)} className="flex-1 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 transition-colors"><Trash2 size={18} /> Delete</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>

      {/* Edit Job Modal */}
      <AnimatePresence>{isEditModalOpen && editJob && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-glass border-glow rounded-2xl p-6 w-full max-w-lg card-glow max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Job</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-gray-400 text-sm block mb-2">Company Name *</label><input type="text" value={editJob.company} onChange={(e) => setEditJob({ ...editJob, company: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" /></div>
                <div><label className="text-gray-400 text-sm block mb-2">Job Title *</label><input type="text" value={editJob.title} onChange={(e) => setEditJob({ ...editJob, title: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-gray-400 text-sm block mb-2">Salary Range</label><input type="text" value={editJob.salary || ''} onChange={(e) => setEditJob({ ...editJob, salary: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" /></div>
                <div><label className="text-gray-400 text-sm block mb-2">Location</label><input type="text" value={editJob.location || ''} onChange={(e) => setEditJob({ ...editJob, location: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-gray-400 text-sm block mb-2">Status</label><select value={editJob.status} onChange={(e) => setEditJob({ ...editJob, status: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white"><option value="applied">Applied</option><option value="talking">Talking to Them</option><option value="offer">Got an Offer</option><option value="not_moving">Not Moving Forward</option></select></div>
                <div><label className="text-gray-400 text-sm block mb-2">Priority</label><select value={editJob.priority || 'medium'} onChange={(e) => setEditJob({ ...editJob, priority: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white"><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
              </div>
              <div><label className="text-gray-400 text-sm block mb-2">Job Posting URL</label><input type="url" value={editJob.url || ''} onChange={(e) => setEditJob({ ...editJob, url: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" /></div>
              <div><label className="text-gray-400 text-sm block mb-2">Notes</label><textarea value={editJob.notes || ''} onChange={(e) => setEditJob({ ...editJob, notes: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white resize-none" rows={4} /></div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsEditModalOpen(false)} className="btn-secondary flex-1 py-3 rounded-lg text-white font-medium">Cancel</button>
                <button onClick={handleSaveEdit} disabled={saving} className="btn-primary flex-1 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <><Loader2 className="animate-spin" size={18} /> Saving...</> : 'Save Changes'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>
    </motion.div>
  );
}
