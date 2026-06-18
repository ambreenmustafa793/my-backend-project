import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, FileCheck, Plus, X, Copy, Check, Tag, BarChart2, Upload, Eye, Edit2, Trash2, Search, File, Clock, Loader2, RefreshCw } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { supabase } from '../lib/supabase';

const coverLetterTemplates = [
  { id: '1', name: 'Standard Application', preview: 'Dear Hiring Manager, I am excited to apply for...', fullText: 'Dear Hiring Manager,\n\nI am excited to apply for the [Position] role at [Company]. With my background in [Field], I believe I would be a great fit for your team.\n\nBest regards,\n[Your Name]' },
  { id: '2', name: 'Startup Pitch', preview: 'Hi [Name], I have been following [Company]...', fullText: 'Hi [Name],\n\nI have been following [Company] for a while and I am thrilled to apply for the [Position] role.\n\nBest,\n[Your Name]' },
  { id: '3', name: 'Referral Mention', preview: 'Dear [Name], [Referrer] suggested I reach out...', fullText: 'Dear [Name],\n\n[Referrer] suggested I reach out about the [Position] role at [Company].\n\nBest regards,\n[Your Name]' },
  { id: '4', name: 'Career Change', preview: 'Dear Hiring Manager, I am writing to express...', fullText: 'Dear Hiring Manager,\n\nI am writing to express my interest in the [Position] role at [Company]. After [Number] years in [Previous Field], I am excited to transition.\n\nBest regards,\n[Your Name]' },
];

export default function Documents() {
  const [resumes, setResumes] = useState([]);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [isResumeDetailOpen, setIsResumeDetailOpen] = useState(false);
  const [isEditResumeOpen, setIsEditResumeOpen] = useState(false);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [editResume, setEditResume] = useState(null);
  const [newResume, setNewResume] = useState({ name: '', keywords: '', content: '', version: 'v1' });
  const [copiedLetter, setCopiedLetter] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [keywordScore, setKeywordScore] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load resumes from Supabase
  const loadResumes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map(r => ({
        id: r.id,
        name: r.name,
        keywords: Array.isArray(r.keywords) ? r.keywords : [],
        content: r.content || '',
        lastModified: formatTimeAgo(r.updated_at),
        created: formatTimeAgo(r.created_at),
        version: r.version || 'v1',
      }));

      setResumes(mapped);
    } catch (err) {
      console.error('Error loading resumes:', err);
      // Try documents table as fallback
      try {
        const { data: docs } = await supabase.from('documents').select('*').eq('type', 'resume').order('created_at', { ascending: false });
        const mapped = (docs || []).map(r => ({
          id: r.id,
          name: r.name,
          keywords: Array.isArray(r.keywords) ? r.keywords : [],
          content: r.content || '',
          lastModified: formatTimeAgo(r.created_at),
          created: formatTimeAgo(r.created_at),
          version: 'v1',
        }));
        setResumes(mapped);
      } catch (e2) { console.error('Fallback also failed:', e2); }
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

  useEffect(() => { loadResumes(); }, []);

  // Add resume to Supabase
  const handleAddResume = async () => {
    if (!newResume.name) { alert('Please enter a resume name'); return; }
    try {
      setSaving(true);
      const keywords = newResume.keywords.split(',').map(k => k.trim()).filter(k => k);

      const { error } = await supabase.from('resumes').insert({
        name: newResume.name,
        keywords: keywords.length > 0 ? keywords : null,
        content: newResume.content,
        version: newResume.version,
      });

      if (error) throw error;
      setNewResume({ name: '', keywords: '', content: '', version: 'v1' });
      setIsResumeModalOpen(false);
      await loadResumes();
    } catch (err) {
      console.error('Error adding resume:', err);
      alert('Failed to add resume.');
    } finally {
      setSaving(false);
    }
  };

  // Delete resume
  const handleDeleteResume = async (id) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      const { error } = await supabase.from('resumes').delete().eq('id', id);
      if (error) throw error;
      setIsResumeDetailOpen(false);
      setSelectedResume(null);
      await loadResumes();
    } catch (err) { console.error('Error deleting resume:', err); alert('Failed to delete.'); }
  };

  // View resume
  const handleViewResume = (resume) => { setSelectedResume(resume); setIsResumeDetailOpen(true); };

  // Edit resume
  const handleEditResume = (resume) => {
    setEditResume({ ...resume, keywordsStr: resume.keywords?.join(', ') || '' });
    setIsEditResumeOpen(true);
    setIsResumeDetailOpen(false);
  };

  // Save edited resume
  const handleSaveResume = async () => {
    if (!editResume.name) { alert('Please enter a resume name'); return; }
    try {
      setSaving(true);
      const keywords = editResume.keywordsStr.split(',').map(k => k.trim()).filter(k => k);
      const { error } = await supabase.from('resumes').update({
        name: editResume.name,
        keywords: keywords.length > 0 ? keywords : null,
        content: editResume.content,
        updated_at: new Date().toISOString(),
      }).eq('id', editResume.id);
      if (error) throw error;
      setIsEditResumeOpen(false);
      setEditResume(null);
      await loadResumes();
    } catch (err) { console.error('Error updating resume:', err); alert('Failed to update.'); }
    finally { setSaving(false); }
  };

  // Upload file simulation
  const handleUploadFile = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx,.txt';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          setSaving(true);
          const { error } = await supabase.from('resumes').insert({
            name: file.name.replace(/\.[^/.]+$/, ''),
            keywords: [],
            content: 'Uploaded file content would appear here...',
            version: 'v1',
          });
          if (error) throw error;
          await loadResumes();
        } catch (err) { console.error('Upload failed:', err); alert('Failed to upload.'); }
        finally { setSaving(false); }
      }
    };
    fileInput.click();
  };

  // Copy cover letter
  const handleCopyLetter = (text, name) => { navigator.clipboard.writeText(text); setCopiedLetter(name); setTimeout(() => setCopiedLetter(null), 2000); };
  const handleViewLetter = (letter) => { setSelectedLetter(letter); setIsLetterModalOpen(true); };

  // Keyword score
  const calculateKeywordScore = () => {
    if (!jobDescription.trim()) { alert('Please paste a job description first'); return; }
    const jdLower = jobDescription.toLowerCase();
    const allKeywords = ['JavaScript', 'React', 'Python', 'AWS', 'Docker', 'Git', 'SQL', 'Agile', 'REST API', 'TypeScript', 'Node.js', 'Vue', 'Angular', 'MongoDB', 'PostgreSQL'];
    const found = allKeywords.filter(k => jdLower.includes(k.toLowerCase()));
    const resumeKeywords = ['React', 'JavaScript', 'Python', 'AWS', 'Git', 'Agile'];
    const matchCount = resumeKeywords.filter(k => found.includes(k)).length;
    const score = Math.round((matchCount / resumeKeywords.length) * 100);
    const missing = resumeKeywords.filter(k => !found.includes(k));
    setKeywordScore({ score, found, missing });
  };

  const filteredResumes = resumes.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase())));

  if (loading) {
    return (<div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]"><div className="text-center"><Loader2 className="animate-spin text-violet-400 mx-auto mb-4" size={48} /><p className="text-gray-400">Loading documents from Supabase...</p></div></div>);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Documents</h1>
        <p className="text-gray-400">Resumes saved to Supabase database</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-violet-500/20 border-glow"><p className="text-gray-400 text-sm">Resume Versions</p><p className="text-2xl font-bold text-white">{resumes.length}</p></div>
        <div className="p-4 rounded-lg bg-cyan-500/20 border-glow"><p className="text-gray-400 text-sm">Cover Templates</p><p className="text-2xl font-bold text-white">{coverLetterTemplates.length}</p></div>
        <div className="p-4 rounded-lg bg-green-500/20 border-glow"><p className="text-gray-400 text-sm">Unique Keywords</p><p className="text-2xl font-bold text-white">{[...new Set(resumes.flatMap(r => r.keywords))].length}</p></div>
        <div className="p-4 rounded-lg bg-yellow-500/20 border-glow"><p className="text-gray-400 text-sm">Data Source</p><p className="text-lg font-bold text-white">Supabase</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Resumes */}
        <GlassCard delay={0.1}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><FileCheck className="text-violet-400" size={20} />My Resumes</h2>
            <div className="flex gap-2">
              <button onClick={loadResumes} className="btn-secondary px-3 py-2 rounded-lg text-white text-sm flex items-center gap-1"><RefreshCw size={14} /></button>
              <button onClick={handleUploadFile} disabled={saving} className="btn-secondary px-4 py-2 rounded-lg text-white text-sm flex items-center gap-2 disabled:opacity-50"><Upload size={16} />{saving ? 'Uploading...' : 'Upload'}</button>
              <button onClick={() => setIsResumeModalOpen(true)} className="btn-primary px-4 py-2 rounded-lg text-white text-sm flex items-center gap-2"><Plus size={16} />Add Resume</button>
            </div>
          </div>
          <div className="mb-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} /><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search resumes..." className="input-field w-full pl-10 py-2 rounded-lg text-white text-sm" /></div></div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {filteredResumes.map((resume, index) => (
              <motion.div key={resume.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + index * 0.05 }} className="p-4 bg-glass rounded-xl border border-white/5 hover:border-violet-500/30 transition-all group cursor-pointer" onClick={() => handleViewResume(resume)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg gradient-bg"><FileText className="text-white" size={18} /></div>
                    <div><h3 className="text-white font-medium">{resume.name}</h3><div className="flex items-center gap-2 text-gray-500 text-xs mt-1"><Clock size={10} />{resume.lastModified}<span className="ml-2 px-2 py-0.5 bg-white/10 rounded">{resume.version}</span></div></div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); handleEditResume(resume); }} className="p-2 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition-colors"><Edit2 size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteResume(resume.id); }} className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
                {resume.keywords.length > 0 && (<div className="flex flex-wrap gap-1">{resume.keywords.slice(0, 5).map((keyword) => (<span key={keyword} className="px-2 py-0.5 bg-violet-500/20 rounded text-violet-300 text-xs">{keyword}</span>))}{resume.keywords.length > 5 && <span className="px-2 py-0.5 bg-white/5 rounded text-gray-400 text-xs">+{resume.keywords.length - 5} more</span>}</div>)}
              </motion.div>
            ))}
            {filteredResumes.length === 0 && (<div className="text-center py-8"><File className="mx-auto text-gray-600 mb-4" size={48} /><p className="text-gray-500">No resumes found</p></div>)}
          </div>
        </GlassCard>

        {/* Cover Letters */}
        <GlassCard delay={0.3}>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><FileText className="text-cyan-400" size={20} />Cover Letter Templates</h2>
          <div className="space-y-3 max-h-[450px] overflow-y-auto">
            {coverLetterTemplates.map((letter) => (
              <div key={letter.id} className="p-4 bg-glass rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all group cursor-pointer" onClick={() => handleViewLetter(letter)}>
                <div className="flex items-center justify-between mb-2"><h3 className="text-white font-medium">{letter.name}</h3><div className="flex items-center gap-2"><button onClick={(e) => { e.stopPropagation(); handleCopyLetter(letter.fullText, letter.name); }} className="text-gray-400 hover:text-cyan-400 transition-colors">{copiedLetter === letter.name ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}</button></div></div>
                <p className="text-gray-500 text-sm line-clamp-2">{letter.preview}</p>
                <button onClick={(e) => { e.stopPropagation(); handleViewLetter(letter); }} className="mt-3 text-cyan-400 text-xs flex items-center gap-1 hover:underline"><Eye size={12} />View Full Template</button>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Keyword Score */}
      <GlassCard delay={0.5}>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><BarChart2 className="text-green-400" size={20} />Check My Resume Keywords</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div><label className="text-gray-400 text-sm block mb-2">Paste Job Description Here</label><textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Copy and paste the job description..." className="input-field w-full px-4 py-3 rounded-lg text-white resize-none" rows={10} /><motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={calculateKeywordScore} className="btn-primary w-full mt-4 py-3 rounded-lg text-white font-semibold">Check My Resume</motion.button></div>
          <div className="flex items-center justify-center">
            {keywordScore ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center w-full">
                <div className="relative w-40 h-40 mx-auto mb-6"><svg className="w-full h-full transform -rotate-90"><circle cx="80" cy="80" r="70" stroke="#1a1a2e" strokeWidth="12" fill="none" /><motion.circle cx="80" cy="80" r="70" stroke="url(#gradient)" strokeWidth="12" fill="none" strokeLinecap="round" strokeDasharray={`${keywordScore.score * 4.4} 440`} initial={{ strokeDasharray: '0 440' }} animate={{ strokeDasharray: `${keywordScore.score * 4.4} 440` }} transition={{ duration: 1 }} /><defs><linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#8A2BE2" /><stop offset="100%" stopColor="#00FFFF" /></linearGradient></defs></svg><div className="absolute inset-0 flex items-center justify-center"><span className="text-4xl font-bold gradient-text">{keywordScore.score}%</span></div></div>
                <div className="space-y-4 text-left">
                  <div><p className="text-gray-400 text-sm mb-2 flex items-center gap-2"><Check className="text-green-400" size={14} />Found:</p><div className="flex flex-wrap gap-2">{keywordScore.found.slice(0, 10).map((k) => (<span key={k} className="px-2 py-1 bg-green-500/20 rounded text-green-300 text-xs">{k}</span>))}</div></div>
                  {keywordScore.missing.length > 0 && (<div><p className="text-gray-400 text-sm mb-2 flex items-center gap-2"><X className="text-red-400" size={14} />Missing:</p><div className="flex flex-wrap gap-2">{keywordScore.missing.map((k) => (<span key={k} className="px-2 py-1 bg-red-500/20 rounded text-red-300 text-xs">{k}</span>))}</div></div>)}
                </div>
              </motion.div>
            ) : (<div className="text-center"><Tag className="mx-auto text-gray-600 mb-4" size={48} /><p className="text-gray-500">Paste a job description to check your keyword match</p></div>)}
          </div>
        </div>
      </GlassCard>

      {/* Add Resume Modal */}
      <AnimatePresence>{isResumeModalOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={() => setIsResumeModalOpen(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-glass border-glow rounded-2xl p-6 w-full max-w-lg card-glow max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold text-white">Add New Resume</h2><button onClick={() => setIsResumeModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button></div>
            <div className="space-y-4">
              <div><label className="text-gray-400 text-sm block mb-2">Resume Name *</label><input type="text" value={newResume.name} onChange={(e) => setNewResume({ ...newResume, name: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" placeholder="e.g., Frontend Developer Resume" /></div>
              <div><label className="text-gray-400 text-sm block mb-2">Version</label><select value={newResume.version} onChange={(e) => setNewResume({ ...newResume, version: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white"><option value="v1">Version 1</option><option value="v2">Version 2</option><option value="v3">Version 3</option></select></div>
              <div><label className="text-gray-400 text-sm block mb-2">Keywords (comma separated)</label><input type="text" value={newResume.keywords} onChange={(e) => setNewResume({ ...newResume, keywords: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" placeholder="e.g., React, TypeScript, Node.js" /></div>
              <div><label className="text-gray-400 text-sm block mb-2">Resume Content</label><textarea value={newResume.content} onChange={(e) => setNewResume({ ...newResume, content: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white resize-none" rows={6} placeholder="Paste or type your resume content..." /></div>
              <div className="flex gap-3 pt-2"><button onClick={() => setIsResumeModalOpen(false)} className="btn-secondary flex-1 py-3 rounded-lg text-white font-medium">Cancel</button><button onClick={handleAddResume} disabled={saving} className="btn-primary flex-1 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50">{saving ? <><Loader2 className="animate-spin" size={18} /> Saving...</> : 'Add Resume'}</button></div>
            </div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>

      {/* Resume Detail Modal */}
      <AnimatePresence>{isResumeDetailOpen && selectedResume && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={() => setIsResumeDetailOpen(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-glass border-glow rounded-2xl p-6 w-full max-w-2xl card-glow max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6"><div><h2 className="text-xl font-bold text-white">{selectedResume.name}</h2><p className="text-gray-400 text-sm">{selectedResume.version} - {selectedResume.lastModified}</p></div><button onClick={() => setIsResumeDetailOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button></div>
            {selectedResume.keywords && selectedResume.keywords.length > 0 && <div className="mb-6"><h4 className="text-gray-400 text-sm mb-2">Keywords</h4><div className="flex flex-wrap gap-2">{selectedResume.keywords.map((k) => (<span key={k} className="px-3 py-1 bg-violet-500/20 rounded-lg text-violet-300 text-sm">{k}</span>))}</div></div>}
            <div className="mb-6"><h4 className="text-gray-400 text-sm mb-2">Content Preview</h4><div className="p-4 bg-glass rounded-lg border border-white/5 whitespace-pre-wrap text-white text-sm">{selectedResume.content || 'No content available'}</div></div>
            <div className="flex gap-3"><button onClick={() => handleEditResume(selectedResume)} className="btn-secondary flex-1 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2"><Edit2 size={18} /> Edit</button><button onClick={() => handleDeleteResume(selectedResume.id)} className="flex-1 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 transition-colors"><Trash2 size={18} /> Delete</button></div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>

      {/* Edit Resume Modal */}
      <AnimatePresence>{isEditResumeOpen && editResume && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={() => setIsEditResumeOpen(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-glass border-glow rounded-2xl p-6 w-full max-w-lg card-glow max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold text-white">Edit Resume</h2><button onClick={() => setIsEditResumeOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button></div>
            <div className="space-y-4">
              <div><label className="text-gray-400 text-sm block mb-2">Resume Name *</label><input type="text" value={editResume.name} onChange={(e) => setEditResume({ ...editResume, name: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" /></div>
              <div><label className="text-gray-400 text-sm block mb-2">Keywords</label><input type="text" value={editResume.keywordsStr} onChange={(e) => setEditResume({ ...editResume, keywordsStr: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" /></div>
              <div><label className="text-gray-400 text-sm block mb-2">Content</label><textarea value={editResume.content} onChange={(e) => setEditResume({ ...editResume, content: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white resize-none" rows={6} /></div>
              <div className="flex gap-3 pt-2"><button onClick={() => setIsEditResumeOpen(false)} className="btn-secondary flex-1 py-3 rounded-lg text-white font-medium">Cancel</button><button onClick={handleSaveResume} disabled={saving} className="btn-primary flex-1 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50">{saving ? <><Loader2 className="animate-spin" size={18} /> Saving...</> : 'Save Changes'}</button></div>
            </div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>

      {/* Cover Letter Modal */}
      <AnimatePresence>{isLetterModalOpen && selectedLetter && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={() => setIsLetterModalOpen(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-glass border-glow rounded-2xl p-6 w-full max-w-2xl card-glow max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6"><div><h2 className="text-xl font-bold text-white">{selectedLetter.name}</h2><p className="text-gray-400 text-sm">Cover Letter Template</p></div><button onClick={() => setIsLetterModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button></div>
            <div className="p-4 bg-glass rounded-lg border border-white/5 whitespace-pre-wrap text-white text-sm mb-6">{selectedLetter.fullText}</div>
            <button onClick={() => handleCopyLetter(selectedLetter.fullText, selectedLetter.name)} className="btn-primary w-full py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2">{copiedLetter === selectedLetter.name ? <Check size={18} /> : <Copy size={18} />}{copiedLetter === selectedLetter.name ? 'Copied!' : 'Copy to Clipboard'}</button>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>
    </motion.div>
  );
}
