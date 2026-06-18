import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, FileCheck, Plus, X, Copy, Check, Tag, BarChart2, Upload } from 'lucide-react';
import GlassCard from '../components/GlassCard';

interface ResumeVersion { id: string; name: string; lastModified: string; keywords: string[]; }
interface CoverLetter { id: string; name: string; preview: string; }

const initialResumes: ResumeVersion[] = [
  { id: '1', name: 'Software Engineer - General', lastModified: '3 days ago', keywords: ['React', 'TypeScript', 'Node.js', 'AWS'] },
  { id: '2', name: 'Frontend Specialist', lastModified: '1 week ago', keywords: ['React', 'Vue', 'CSS', 'UI/UX'] },
  { id: '3', name: 'Full Stack Developer', lastModified: '2 weeks ago', keywords: ['Python', 'Django', 'React', 'PostgreSQL'] },
];

const coverLetterTemplates: CoverLetter[] = [
  { id: '1', name: 'Standard Application', preview: 'Dear Hiring Manager, I am excited to apply for the [Position] role at [Company]...' },
  { id: '2', name: 'Startup Pitch', preview: 'Hi [Name], I have been following [Company] for a while and I am thrilled to apply...' },
  { id: '3', name: 'Referral Mention', preview: 'Dear [Name], [Referrer Name] suggested I reach out about the [Position] role...' },
];

const commonKeywords = {
  skills: ['JavaScript', 'React', 'Python', 'AWS', 'Docker', 'Git', 'SQL', 'Agile', 'REST API', 'TypeScript'],
  roles: ['Senior', 'Lead', 'Full Stack', 'Backend', 'Frontend', 'DevOps', 'Architect'],
  soft: ['Leadership', 'Communication', 'Team Player', 'Problem Solving', 'Mentorship'],
};

export default function Documents() {
  const [resumes] = useState(initialResumes);
  const [jobDescription, setJobDescription] = useState('');
  const [keywordScore, setKeywordScore] = useState<{ score: number; found: string[]; missing: string[] } | null>(null);
  const [copiedLetter, setCopiedLetter] = useState<string | null>(null);

  const calculateKeywordScore = () => {
    if (!jobDescription.trim()) return;
    const jdLower = jobDescription.toLowerCase();
    const allKeywords = [...commonKeywords.skills, ...commonKeywords.roles, ...commonKeywords.soft];
    const found: string[] = [];
    const missing: string[] = [];

    allKeywords.forEach((keyword) => {
      if (jdLower.includes(keyword.toLowerCase())) found.push(keyword);
    });

    const resumeKeywords = ['React', 'JavaScript', 'Python', 'AWS', 'Team Player', 'Problem Solving'];
    resumeKeywords.forEach((keyword) => {
      if (!found.includes(keyword)) missing.push(keyword);
    });

    const uniqueJdKeywords = [...new Set(found)];
    const matchCount = resumeKeywords.filter((k) => uniqueJdKeywords.includes(k)).length;
    const score = Math.round((matchCount / resumeKeywords.length) * 100);
    setKeywordScore({ score, found: uniqueJdKeywords, missing: missing.slice(0, 5) });
  };

  const handleCopyLetter = (preview: string, name: string) => {
    navigator.clipboard.writeText(preview);
    setCopiedLetter(name);
    setTimeout(() => setCopiedLetter(null), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Documents</h1>
        <p className="text-gray-400">Organize your resumes and cover letters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <GlassCard delay={0.1}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileCheck className="text-violet-400" size={20} /> My Resumes
            </h2>
            <button className="btn-secondary px-4 py-2 rounded-lg text-white text-sm flex items-center gap-2"><Plus size={16} />Add Resume</button>
          </div>
          <div className="space-y-3">
            {resumes.map((resume, index) => (
              <motion.div key={resume.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + index * 0.1 }} className="p-4 bg-glass rounded-xl border border-white/5 hover:border-violet-500/30 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg gradient-bg"><FileText className="text-white" size={18} /></div>
                    <div>
                      <h3 className="text-white font-medium">{resume.name}</h3>
                      <p className="text-gray-500 text-xs">Modified {resume.lastModified}</p>
                    </div>
                  </div>
                  <button className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><X size={18} /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resume.keywords.map((keyword) => (<span key={keyword} className="px-2 py-1 bg-violet-500/20 rounded text-violet-300 text-xs">{keyword}</span>))}
                </div>
              </motion.div>
            ))}
            <button className="w-full p-4 border-2 border-dashed border-gray-700 rounded-xl text-gray-500 hover:border-violet-500/50 hover:text-violet-400 transition-all flex items-center justify-center gap-2">
              <Upload size={18} /><span>Upload another version</span>
            </button>
          </div>
        </GlassCard>

        <GlassCard delay={0.3}>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <FileText className="text-cyan-400" size={20} /> Cover Letter Templates
          </h2>
          <div className="space-y-3">
            {coverLetterTemplates.map((letter, index) => (
              <motion.div key={letter.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + index * 0.1 }} className="p-4 bg-glass rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-medium">{letter.name}</h3>
                  <button onClick={() => handleCopyLetter(letter.preview, letter.name)} className="flex items-center gap-1 text-gray-400 hover:text-cyan-400 transition-colors text-sm">
                    {copiedLetter === letter.name ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    <span>Copy</span>
                  </button>
                </div>
                <p className="text-gray-500 text-sm line-clamp-2">{letter.preview}</p>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard delay={0.5}>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <BarChart2 className="text-green-400" size={20} /> Check My Resume Keywords
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="text-gray-400 text-sm block mb-2">Paste Job Description Here</label>
            <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Copy and paste the job description to see how well your resume matches the keywords..." className="input-field w-full px-4 py-3 rounded-lg text-white resize-none" rows={8} />
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={calculateKeywordScore} className="btn-primary w-full mt-4 py-3 rounded-lg text-white font-semibold">Check My Resume</motion.button>
          </div>
          <div className="flex items-center justify-center">
            {keywordScore ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className="relative w-40 h-40 mx-auto mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="#1a1a2e" strokeWidth="12" fill="none" />
                    <motion.circle cx="80" cy="80" r="70" stroke="url(#gradient)" strokeWidth="12" fill="none" strokeLinecap="round" strokeDasharray={`${keywordScore.score * 4.4} 440`} initial={{ strokeDasharray: '0 440' }} animate={{ strokeDasharray: `${keywordScore.score * 4.4} 440` }} transition={{ duration: 1 }} />
                    <defs><linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#8A2BE2" /><stop offset="100%" stopColor="#00FFFF" /></linearGradient></defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-bold gradient-text">{keywordScore.score}%</span>
                  </div>
                </div>
                <div className="space-y-4 text-left">
                  <div>
                    <p className="text-gray-400 text-sm mb-2 flex items-center gap-2"><Check className="text-green-400" size={14} />Found in your resume:</p>
                    <div className="flex flex-wrap gap-2">
                      {keywordScore.found.slice(0, 8).map((keyword) => (<span key={keyword} className="px-2 py-1 bg-green-500/20 rounded text-green-300 text-xs">{keyword}</span>))}
                    </div>
                  </div>
                  {keywordScore.missing.length > 0 && (
                    <div>
                      <p className="text-gray-400 text-sm mb-2 flex items-center gap-2"><X className="text-red-400" size={14} />Missing keywords:</p>
                      <div className="flex flex-wrap gap-2">
                        {keywordScore.missing.map((keyword) => (<span key={keyword} className="px-2 py-1 bg-red-500/20 rounded text-red-300 text-xs">{keyword}</span>))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="text-center">
                <Tag className="mx-auto text-gray-600 mb-4" size={48} />
                <p className="text-gray-500">Paste a job description to check your keyword match</p>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
