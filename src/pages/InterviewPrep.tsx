import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronDown, ChevronRight, Lightbulb, Calculator, Building2, DollarSign } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const interviewQuestions = [
  { id: 1, question: 'Tell me about yourself', category: 'Personal' },
  { id: 2, question: 'What are your greatest strengths?', category: 'Personal' },
  { id: 3, question: 'What is your biggest weakness?', category: 'Personal' },
  { id: 4, question: 'Why do you want to work here?', category: 'Company' },
  { id: 5, question: 'Where do you see yourself in 5 years?', category: 'Personal' },
  { id: 6, question: 'Tell me about a challenge you overcame', category: 'Behavioral' },
  { id: 7, question: 'How do you handle stress?', category: 'Behavioral' },
  { id: 8, question: 'Why are you leaving your current job?', category: 'Personal' },
  { id: 9, question: 'What salary do you expect?', category: 'Compensation' },
  { id: 10, question: 'Do you have any questions for us?', category: 'Company' },
];

export default function InterviewPrep() {
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
  const [researchNotes, setResearchNotes] = useState('');
  const [timerRunning, setTimerRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [offer1, setOffer1] = useState({ salary: 0, bonus: 0, equity: 0 });
  const [offer2, setOffer2] = useState({ salary: 0, bonus: 0, equity: 0 });

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerRunning) {
      interval = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const toggleQuestion = (id: number) => setExpandedQuestions((prev) => prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]);

  const totalOffer1 = offer1.salary + offer1.bonus + offer1.equity;
  const totalOffer2 = offer2.salary + offer2.bonus + offer2.equity;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Interview Prep</h1>
        <p className="text-gray-400">Practice questions and prepare for interviews</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <GlassCard delay={0.1}>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Play className="text-violet-400" size={20} /> Mock Interview Timer
          </h2>
          <div className="text-center py-8">
            <motion.div animate={timerRunning ? { scale: [1, 1.02, 1] } : {}} transition={{ repeat: Infinity, duration: 1 }} className="text-6xl font-bold gradient-text mb-8">
              {formatTime(time)}
            </motion.div>
            <div className="flex justify-center gap-4">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setTimerRunning(!timerRunning)} className="btn-primary px-8 py-3 rounded-xl text-white font-semibold flex items-center gap-2">
                {timerRunning ? <Pause size={20} /> : <Play size={20} />}
                {timerRunning ? 'Pause' : 'Start'}
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setTimerRunning(false); setTime(0); }} className="btn-secondary px-8 py-3 rounded-xl text-white font-semibold flex items-center gap-2">
                <RotateCcw size={20} /> Reset
              </motion.button>
            </div>
          </div>
          <div className="mt-6 p-4 bg-glass rounded-lg border border-violet-500/20">
            <p className="text-gray-400 text-sm flex items-center gap-2"><Lightbulb className="text-yellow-400" size={16} /> Tip: Practice speaking for 1-2 minutes per question</p>
          </div>
        </GlassCard>

        <GlassCard delay={0.2}>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Calculator className="text-cyan-400" size={20} /> Offer Compare Tool
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-glass rounded-lg border border-violet-500/30">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="text-violet-400" size={18} />
                <span className="text-white font-medium">Offer 1</span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-gray-400 text-xs block mb-1">Salary</label>
                  <input type="number" value={offer1.salary || ''} onChange={(e) => setOffer1({ ...offer1, salary: Number(e.target.value) })} className="input-field w-full px-3 py-2 rounded text-white text-sm" placeholder="0" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs block mb-1">Bonus</label>
                  <input type="number" value={offer1.bonus || ''} onChange={(e) => setOffer1({ ...offer1, bonus: Number(e.target.value) })} className="input-field w-full px-3 py-2 rounded text-white text-sm" placeholder="0" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs block mb-1">Equity (yearly value)</label>
                  <input type="number" value={offer1.equity || ''} onChange={(e) => setOffer1({ ...offer1, equity: Number(e.target.value) })} className="input-field w-full px-3 py-2 rounded text-white text-sm" placeholder="0" />
                </div>
                <div className="pt-2 border-t border-white/10">
                  <p className="text-gray-400 text-xs">Total</p>
                  <p className="text-2xl font-bold text-violet-400">${totalOffer1.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-glass rounded-lg border border-cyan-500/30">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="text-cyan-400" size={18} />
                <span className="text-white font-medium">Offer 2</span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-gray-400 text-xs block mb-1">Salary</label>
                  <input type="number" value={offer2.salary || ''} onChange={(e) => setOffer2({ ...offer2, salary: Number(e.target.value) })} className="input-field w-full px-3 py-2 rounded text-white text-sm" placeholder="0" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs block mb-1">Bonus</label>
                  <input type="number" value={offer2.bonus || ''} onChange={(e) => setOffer2({ ...offer2, bonus: Number(e.target.value) })} className="input-field w-full px-3 py-2 rounded text-white text-sm" placeholder="0" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs block mb-1">Equity (yearly value)</label>
                  <input type="number" value={offer2.equity || ''} onChange={(e) => setOffer2({ ...offer2, equity: Number(e.target.value) })} className="input-field w-full px-3 py-2 rounded text-white text-sm" placeholder="0" />
                </div>
                <div className="pt-2 border-t border-white/10">
                  <p className="text-gray-400 text-xs">Total</p>
                  <p className="text-2xl font-bold text-cyan-400">${totalOffer2.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
          {(totalOffer1 > 0 || totalOffer2 > 0) && (
            <div className="mt-4 p-4 bg-glass rounded-lg text-center">
              <p className="text-white">
                {totalOffer1 > totalOffer2 ? (<><span className="text-violet-400 font-bold">Offer 1</span> pays more by ${(totalOffer1 - totalOffer2).toLocaleString()}</>) : totalOffer2 > totalOffer1 ? (<><span className="text-cyan-400 font-bold">Offer 2</span> pays more by ${(totalOffer2 - totalOffer1).toLocaleString()}</>) : 'Both offers are equal'}
              </p>
            </div>
          )}
        </GlassCard>
      </div>

      <GlassCard delay={0.3}>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <DollarSign className="text-violet-400" size={20} /> Practice Questions
        </h2>
        <div className="space-y-2">
          {interviewQuestions.map((q, index) => (
            <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + index * 0.05 }} className="border border-white/5 rounded-lg overflow-hidden">
              <button onClick={() => toggleQuestion(q.id)} className="w-full p-4 flex items-center justify-between text-left bg-glass hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  {expandedQuestions.includes(q.id) ? <ChevronDown className="text-violet-400" size={18} /> : <ChevronRight className="text-violet-400" size={18} />}
                  <span className="text-white">{q.question}</span>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-violet-500/20 text-violet-300">{q.category}</span>
              </button>
              {expandedQuestions.includes(q.id) && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="p-4 bg-glass/50 border-t border-white/5">
                  <textarea placeholder="Type your answer here to practice..." className="input-field w-full px-4 py-3 rounded-lg text-white text-sm resize-none" rows={3} />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="mt-6" delay={0.5}>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Building2 className="text-cyan-400" size={20} /> Company Research Notes
        </h2>
        <textarea value={researchNotes} onChange={(e) => setResearchNotes(e.target.value)} placeholder="Write down key facts about the company: products, mission, recent news, culture..." className="input-field w-full px-4 py-3 rounded-lg text-white resize-none" rows={6} />
      </GlassCard>
    </motion.div>
  );
}
