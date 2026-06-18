import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Link, DollarSign, Bell, ExternalLink, Sparkles, Briefcase, MapPin, Building2, Clock, X } from 'lucide-react';
import GlassCard from '../components/GlassCard';

interface ScannedJob { id: string; title: string; company: string; location: string; salary: { min: number; max: number }; url: string; posted: string; }

const mockJobData: ScannedJob = { id: '1', title: 'Senior Software Engineer', company: 'TechCorp', location: 'San Francisco, CA (Remote)', salary: { min: 150000, max: 200000 }, url: 'https://linkedin.com/jobs/view/123456', posted: '2 days ago' };

const salaryRanges = [
  { title: 'Junior Developer', min: 60000, max: 90000 },
  { title: 'Mid Developer', min: 90000, max: 130000 },
  { title: 'Senior Developer', min: 130000, max: 180000 },
  { title: 'Staff Engineer', min: 180000, max: 250000 },
  { title: 'Engineering Manager', min: 200000, max: 300000 },
];

export default function JobScanner() {
  const [jobUrl, setJobUrl] = useState('');
  const [scannedJob, setScannedJob] = useState<ScannedJob | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [dailyAlertsEnabled, setDailyAlertsEnabled] = useState(false);
  const [alertsEmail, setAlertsEmail] = useState('');

  const handleScan = () => {
    if (!jobUrl.trim()) return;
    setIsScanning(true);
    setTimeout(() => { setScannedJob({ ...mockJobData, url: jobUrl }); setIsScanning(false); }, 1500);
  };

  const handleAddToJobs = () => {
    if (!scannedJob) return;
    alert(`Added "${scannedJob.title}" at ${scannedJob.company} to your jobs list!`);
    setScannedJob(null);
    setJobUrl('');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Job Scanner</h1>
        <p className="text-gray-400">Quick-add jobs from any job posting URL</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2" delay={0.1}>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Search className="text-violet-400" size={20} /> Paste Job URL
          </h2>
          <div className="relative">
            <input type="url" value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} placeholder="Paste LinkedIn, Indeed, or any job posting URL..." className="input-field w-full px-4 py-4 pl-12 rounded-xl text-white" />
            <Link className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleScan} disabled={isScanning || !jobUrl.trim()} className="btn-primary w-full mt-4 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {isScanning ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><Sparkles size={20} /></motion.div>
                Scanning...
              </>
            ) : (
              <><Search size={20} />Scan Job Posting</>
            )}
          </motion.button>

          {scannedJob && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-6 bg-glass rounded-xl border border-violet-500/30">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{scannedJob.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-gray-400">
                    <span className="flex items-center gap-1"><Building2 size={14} />{scannedJob.company}</span>
                    <span className="flex items-center gap-1"><MapPin size={14} />{scannedJob.location}</span>
                  </div>
                </div>
                <button onClick={() => setScannedJob(null)} className="text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-glass rounded-lg">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><DollarSign size={14} />Estimated Salary</div>
                  <p className="text-2xl font-bold gradient-text">${scannedJob.salary.min / 1000}k - ${scannedJob.salary.max / 1000}k</p>
                </div>
                <div className="p-4 bg-glass rounded-lg">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1"><Clock size={14} />Posted</div>
                  <p className="text-lg font-bold text-white">{scannedJob.posted}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <a href={scannedJob.url} target="_blank" rel="noopener noreferrer" className="btn-secondary flex-1 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2"><ExternalLink size={18} />View Original</a>
                <button onClick={handleAddToJobs} className="btn-primary flex-1 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2"><Briefcase size={18} />Add to My Jobs</button>
              </div>
            </motion.div>
          )}
        </GlassCard>

        <div className="space-y-6">
          <GlassCard delay={0.2}>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="text-cyan-400" size={20} /> Salary Estimator
            </h2>
            <div className="space-y-3">
              {salaryRanges.map((range, index) => (
                <motion.div key={range.title} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.05 }} className="p-3 bg-glass rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white text-sm">{range.title}</span>
                    <span className="text-cyan-400 text-sm font-medium">${range.min / 1000}k - ${range.max / 1000}k</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(range.max / 300000) * 100}%` }} transition={{ duration: 0.8, delay: 0.5 + index * 0.05 }} className="h-full gradient-bg rounded-full" />
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          <GlassCard delay={0.4}>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Bell className="text-green-400" size={20} /> Daily Job Alerts
            </h2>
            <div className="flex items-center justify-between p-4 bg-glass rounded-lg mb-4">
              <div>
                <p className="text-white font-medium">Enable Alerts</p>
                <p className="text-gray-500 text-sm">Get daily job recommendations</p>
              </div>
              <button onClick={() => setDailyAlertsEnabled(!dailyAlertsEnabled)} className={`w-14 h-8 rounded-full transition-all ${dailyAlertsEnabled ? 'bg-green-500' : 'bg-gray-700'}`}>
                <motion.div animate={{ x: dailyAlertsEnabled ? 24 : 4 }} className="w-6 h-6 bg-white rounded-full shadow-lg" />
              </button>
            </div>
            {dailyAlertsEnabled && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <label className="text-gray-400 text-sm block mb-2">Send alerts to:</label>
                <input type="email" value={alertsEmail} onChange={(e) => setAlertsEmail(e.target.value)} placeholder="your@email.com" className="input-field w-full px-4 py-3 rounded-lg text-white mb-3" />
                <button className="btn-primary w-full py-3 rounded-lg text-white font-medium">Save Settings</button>
              </motion.div>
            )}
            <div className="mt-4 p-3 bg-violet-500/10 rounded-lg border border-violet-500/20">
              <p className="text-violet-300 text-xs">This is a demo feature. In a real app, this would connect to job search APIs.</p>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}
