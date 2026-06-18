import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Link, DollarSign, Bell, ExternalLink, Sparkles, Briefcase, MapPin, Building2, Clock, X, Plus, Trash2, Loader2, RefreshCw } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { supabase } from '../lib/supabase';
import { fetchUsers } from '../lib/jsonplaceholder';

const salaryRanges = [
  { title: 'Junior Developer', min: 60000, max: 90000 },
  { title: 'Mid Developer', min: 90000, max: 130000 },
  { title: 'Senior Developer', min: 130000, max: 180000 },
  { title: 'Staff Engineer', min: 180000, max: 250000 },
  { title: 'Engineering Manager', min: 200000, max: 300000 },
];

const mockJobData = {
  title: 'Senior Software Engineer',
  company: 'TechCorp',
  location: 'San Francisco, CA (Remote)',
  salary: { min: 150000, max: 200000 },
  posted: '2 days ago',
  requirements: ['React', 'TypeScript', 'Node.js', 'AWS']
};

export default function JobScanner() {
  const [jobUrl, setJobUrl] = useState('');
  const [scannedJob, setScannedJob] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [savedJobsList, setSavedJobsList] = useState([]);
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [externalUsers, setExternalUsers] = useState([]);
  const [loadingExternal, setLoadingExternal] = useState(false);

  // Load saved scans from Supabase
  const loadScans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('job_scans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSavedJobsList((data || []).map(s => ({
        id: s.id,
        title: s.title,
        company: s.company,
        salary: s.salary_min && s.salary_max ? `$${s.salary_min / 1000}k-$${s.salary_max / 1000}k` : 'N/A',
        location: s.location || 'N/A',
        dateAdded: new Date(s.created_at).toLocaleDateString(),
      })));
    } catch (err) {
      console.error('Error loading scans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadScans(); }, []);

  const handleScan = () => {
    if (!jobUrl.trim()) { alert('Please enter a job URL'); return; }
    setIsScanning(true);
    setTimeout(() => {
      setScannedJob({ id: Date.now().toString(), ...mockJobData, url: jobUrl });
      setIsScanning(false);
    }, 1500);
  };

  // Add scanned job to Supabase
  const handleAddToJobs = async () => {
    if (!scannedJob) return;
    try {
      setSaving(true);

      // Save to job_scans
      const { error: scanError } = await supabase.from('job_scans').insert({
        title: scannedJob.title,
        company: scannedJob.company,
        salary_min: scannedJob.salary.min,
        salary_max: scannedJob.salary.max,
        location: scannedJob.location,
        requirements: scannedJob.requirements,
        original_url: scannedJob.url,
        posted: scannedJob.posted,
      });
      if (scanError) throw scanError;

      // Also add to jobs table
      await supabase.from('jobs').insert({
        company: scannedJob.company,
        title: scannedJob.title,
        salary: `$${scannedJob.salary.min / 1000}k-$${scannedJob.salary.max / 1000}k`,
        location: scannedJob.location,
        status: 'applied',
        priority: 'medium',
        url: scannedJob.url,
      });

      // Log activity
      await supabase.from('job_activities').insert({
        action: `Scanned and added ${scannedJob.title} at ${scannedJob.company}`,
        details: `From URL: ${scannedJob.url}`,
        type: 'applied',
      });

      alert(`Added "${scannedJob.title}" to your jobs and saved scan!`);
      setScannedJob(null);
      setJobUrl('');
      await loadScans();
    } catch (err) {
      console.error('Error adding scan:', err);
      alert('Failed to save scan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSavedJob = async (id) => {
    if (!confirm('Remove this scan?')) return;
    try {
      const { error } = await supabase.from('job_scans').delete().eq('id', id);
      if (error) throw error;
      await loadScans();
    } catch (err) { console.error('Error deleting scan:', err); }
  };

  // Fetch users from JSONPlaceholder as "company contacts"
  const fetchCompanyInfo = async () => {
    try {
      setLoadingExternal(true);
      const users = await fetchUsers();
      setExternalUsers(users.slice(0, 5));
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingExternal(false);
    }
  };

  const handleSearchJobs = () => {
    alert(`Searching for "${keywords}" in "${location}"...\n\nThis demo uses JSONPlaceholder API. In production, this would connect to real job APIs.`);
  };

  if (loading) {
    return (<div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]"><div className="text-center"><Loader2 className="animate-spin text-violet-400 mx-auto mb-4" size={48} /><p className="text-gray-400">Loading scans from Supabase...</p></div></div>);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Job Scanner</h1>
        <p className="text-gray-400">Scan jobs + save to Supabase + fetch from JSONPlaceholder</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-violet-500/20 border-glow"><p className="text-gray-400 text-sm">Jobs Scanned</p><p className="text-2xl font-bold text-white">{savedJobsList.length}</p></div>
        <div className="p-4 rounded-lg bg-cyan-500/20 border-glow"><p className="text-gray-400 text-sm">Data Source</p><p className="text-lg font-bold text-white">Supabase</p></div>
        <div className="p-4 rounded-lg bg-green-500/20 border-glow"><p className="text-gray-400 text-sm">External API</p><p className="text-lg font-bold text-white">JSONPlaceholder</p></div>
        <div className="p-4 rounded-lg bg-yellow-500/20 border-glow"><p className="text-gray-400 text-sm">Persistence</p><p className="text-lg font-bold text-green-400">Yes</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scanner */}
        <GlassCard className="lg:col-span-2" delay={0.1}>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Search className="text-violet-400" size={20} />Paste Job URL</h2>
          <div className="relative"><input type="url" value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} placeholder="Paste LinkedIn, Indeed, or any job posting URL..." className="input-field w-full px-4 py-4 pl-12 rounded-xl text-white" /><Link className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} /></div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleScan} disabled={isScanning || !jobUrl.trim()} className="btn-primary w-full mt-4 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {isScanning ? <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><Sparkles size={20} /></motion.div>Scanning...</> : <><Search size={20} />Scan Job Posting</>}
          </motion.button>

          {scannedJob && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-6 bg-glass rounded-xl border border-violet-500/30">
              <div className="flex items-start justify-between mb-4">
                <div><h3 className="text-xl font-bold text-white">{scannedJob.title}</h3><div className="flex flex-wrap items-center gap-4 mt-2 text-gray-400 text-sm"><span className="flex items-center gap-1"><Building2 size={14} />{scannedJob.company}</span><span className="flex items-center gap-1"><MapPin size={14} />{scannedJob.location}</span></div></div>
                <button onClick={() => { setScannedJob(null); setJobUrl(''); }} className="text-gray-500 hover:text-white"><X size={20} /></button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-glass rounded-lg"><div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><DollarSign size={14} />Estimated Salary</div><p className="text-2xl font-bold gradient-text">${scannedJob.salary.min / 1000}k - ${scannedJob.salary.max / 1000}k</p></div>
                <div className="p-4 bg-glass rounded-lg"><div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><Clock size={14} />Posted</div><p className="text-lg font-bold text-white">{scannedJob.posted}</p></div>
              </div>
              {scannedJob.requirements && (<div className="mb-4"><p className="text-gray-400 text-sm mb-2">Requirements Detected:</p><div className="flex flex-wrap gap-2">{scannedJob.requirements.map((req) => (<span key={req} className="px-2 py-1 bg-violet-500/20 rounded text-violet-300 text-xs">{req}</span>))}</div></div>)}
              <div className="flex gap-3">
                <a href={scannedJob.url} target="_blank" rel="noopener noreferrer" className="btn-secondary flex-1 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2"><ExternalLink size={18} />View Original</a>
                <button onClick={handleAddToJobs} disabled={saving} className="btn-primary flex-1 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50">{saving ? <><Loader2 className="animate-spin" size={18} />Saving...</> : <><Plus size={18} />Add to My Jobs</>}</button>
              </div>
            </motion.div>
          )}

          <div className="mt-6">
            <div className="flex items-center justify-between mb-4"><h3 className="text-white font-semibold flex items-center gap-2"><Briefcase className="text-violet-400" size={18} />Saved Scans ({savedJobsList.length})</h3><button onClick={loadScans} className="text-gray-400 hover:text-white"><RefreshCw size={16} /></button></div>
            <div className="space-y-2">
              {savedJobsList.map((job) => (
                <motion.div key={job.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between p-3 bg-glass rounded-lg border border-white/5">
                  <div className="flex items-center gap-3"><Building2 className="text-violet-400" size={18} /><div><p className="text-white text-sm font-medium">{job.title}</p><p className="text-gray-400 text-xs">{job.company} - {job.location}</p></div></div>
                  <div className="flex items-center gap-4"><span className="text-violet-400 text-sm">{job.salary}</span><button onClick={() => handleDeleteSavedJob(job.id)} className="text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={16} /></button></div>
                </motion.div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Search */}
          <GlassCard delay={0.2}>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Search className="text-cyan-400" size={20} />Quick Search</h2>
            <div className="space-y-3">
              <div><label className="text-gray-400 text-sm block mb-2">Keywords</label><input type="text" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="e.g., React Developer" className="input-field w-full px-3 py-2 rounded-lg text-white text-sm" /></div>
              <div><label className="text-gray-400 text-sm block mb-2">Location</label><input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g., Remote" className="input-field w-full px-3 py-2 rounded-lg text-white text-sm" /></div>
              <button onClick={handleSearchJobs} className="btn-secondary w-full py-2 rounded-lg text-white text-sm flex items-center justify-center gap-2"><Search size={16} />Search Jobs</button>
            </div>
          </GlassCard>

          {/* JSONPlaceholder Users */}
          <GlassCard delay={0.3}>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Building2 className="text-green-400" size={20} />Company Contacts (API)</h2>
            <button onClick={fetchCompanyInfo} disabled={loadingExternal} className="btn-secondary w-full py-2 rounded-lg text-white text-sm flex items-center justify-center gap-2 mb-4 disabled:opacity-50">
              {loadingExternal ? <Loader2 className="animate-spin" size={14} /> : <Search size={14} />}
              {loadingExternal ? 'Fetching...' : 'Fetch from JSONPlaceholder'}
            </button>
            <div className="space-y-2">
              {externalUsers.map((user) => (
                <div key={user.id} className="p-3 bg-glass rounded-lg">
                  <p className="text-white text-sm font-medium">{user.company.name}</p>
                  <p className="text-gray-400 text-xs">{user.name} - {user.email}</p>
                </div>
              ))}
              {externalUsers.length === 0 && <p className="text-gray-500 text-sm text-center">Click button to fetch company data</p>}
            </div>
          </GlassCard>

          {/* Salary Estimator */}
          <GlassCard delay={0.5}>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><DollarSign className="text-yellow-400" size={20} />Salary Estimator</h2>
            <div className="space-y-3">
              {salaryRanges.map((range, index) => (
                <motion.div key={range.title} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + index * 0.05 }} className="p-3 bg-glass rounded-lg">
                  <div className="flex items-center justify-between mb-2"><span className="text-white text-sm">{range.title}</span><span className="text-cyan-400 text-sm font-medium">${range.min / 1000}k-${range.max / 1000}k</span></div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${(range.max / 300000) * 100}%` }} transition={{ duration: 0.8, delay: 0.5 + index * 0.05 }} className="h-full gradient-bg rounded-full" /></div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
