import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronDown, ChevronRight, Lightbulb, Calculator, Building2, DollarSign, Clock, Award, Target, Plus, X, Trash2, Edit2, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { supabase } from '../lib/supabase';
import { fetchTodos } from '../lib/jsonplaceholder';

const categories = ['All', 'Personal', 'Behavioral', 'Company', 'Compensation'];

const defaultQuestions = [
  { question: 'Tell me about yourself', category: 'Personal', tip: 'Keep it under 2 minutes. Focus on relevant experience.' },
  { question: 'What are your greatest strengths?', category: 'Personal', tip: 'Choose 2-3 relevant strengths with examples.' },
  { question: 'What is your biggest weakness?', category: 'Personal', tip: 'Be honest but show how you are improving.' },
  { question: 'Why do you want to work here?', category: 'Company', tip: 'Research the company and connect to your goals.' },
  { question: 'Where do you see yourself in 5 years?', category: 'Personal', tip: 'Show ambition but be realistic.' },
  { question: 'Tell me about a challenge you overcame', category: 'Behavioral', tip: 'Use STAR method: Situation, Task, Action, Result.' },
  { question: 'How do you handle stress?', category: 'Behavioral', tip: 'Give specific examples of stress management.' },
  { question: 'Why are you leaving your current job?', category: 'Personal', tip: 'Be positive, focus on growth opportunities.' },
  { question: 'What salary do you expect?', category: 'Compensation', tip: 'Research market rates and give a range.' },
  { question: 'Do you have any questions for us?', category: 'Company', tip: 'Always have thoughtful questions prepared.' },
];

export default function InterviewPrep() {
  const [expandedQuestions, setExpandedQuestions] = useState([]);
  const [timerRunning, setTimerRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [timerMode, setTimerMode] = useState('stopwatch');
  const [countdownTime, setCountdownTime] = useState(60);
  const [offer1, setOffer1] = useState({ company: '', salary: 0, bonus: 0, equity: 0, benefits: 0 });
  const [offer2, setOffer2] = useState({ company: '', salary: 0, bonus: 0, equity: 0, benefits: 0 });
  const [questions, setQuestions] = useState([]);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ question: '', category: 'Behavioral', tip: '' });
  const [filterCategory, setFilterCategory] = useState('All');
  const [showPracticedOnly, setShowPracticedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [researchNotes, setResearchNotes] = useState([]);
  const [newResearch, setNewResearch] = useState({ company_name: '', position: '', notes: '' });
  const [externalTodos, setExternalTodos] = useState([]);

  // Load questions from Supabase + seed defaults
  const loadQuestions = async () => {
    try {
      setLoading(true);

      // Fetch existing questions
      const { data: dbQuestions, error } = await supabase
        .from('interview_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // If no questions exist, seed defaults
      if (!dbQuestions || dbQuestions.length === 0) {
        const inserts = defaultQuestions.map(q => ({
          question: q.question,
          category: q.category,
          tip: q.tip,
          practiced: false,
        }));

        const { data: seeded, error: seedError } = await supabase
          .from('interview_questions')
          .insert(inserts)
          .select();

        if (seedError) throw seedError;
        setQuestions(seeded || []);
      } else {
        setQuestions(dbQuestions);
      }

      // Fetch research notes
      const { data: notes } = await supabase.from('research_notes').select('*').order('updated_at', { ascending: false });
      setResearchNotes(notes || []);

      // Fetch todos from JSONPlaceholder
      try {
        const todos = await fetchTodos();
        setExternalTodos(todos);
      } catch (e) { console.log('JSONPlaceholder unavailable'); }

    } catch (err) {
      console.error('Error loading questions:', err);
      setQuestions(defaultQuestions.map((q, i) => ({ id: i + 1, ...q, practiced: false })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadQuestions(); }, []);

  // Timer
  useEffect(() => {
    let interval;
    if (timerRunning) {
      interval = setInterval(() => {
        setTime(t => {
          if (timerMode === 'countdown') { if (t <= 0) { setTimerRunning(false); return 0; } return t - 1; }
          return t + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerMode]);

  const formatTime = (seconds) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

  const toggleQuestion = (id) => setExpandedQuestions(prev => prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]);

  const togglePracticed = async (id, currentVal) => {
    try {
      const { error } = await supabase.from('interview_questions').update({ practiced: !currentVal }).eq('id', id);
      if (error) throw error;
      setQuestions(questions.map(q => q.id === id ? { ...q, practiced: !currentVal } : q));
    } catch (err) { console.error('Error updating question:', err); }
  };

  const deleteQuestion = async (id) => {
    if (!confirm('Delete this question?')) return;
    try {
      const { error } = await supabase.from('interview_questions').delete().eq('id', id);
      if (error) throw error;
      setQuestions(questions.filter(q => q.id !== id));
    } catch (err) { console.error('Error deleting question:', err); }
  };

  const addQuestion = async () => {
    if (!newQuestion.question) return;
    try {
      setSaving(true);
      const { data, error } = await supabase.from('interview_questions').insert({
        question: newQuestion.question,
        category: newQuestion.category,
        tip: newQuestion.tip,
        practiced: false,
      }).select().single();
      if (error) throw error;
      setQuestions([data, ...questions]);
      setNewQuestion({ question: '', category: 'Behavioral', tip: '' });
      setIsAddQuestionOpen(false);
    } catch (err) { console.error('Error adding question:', err); }
    finally { setSaving(false); }
  };

  // Save research notes
  const saveResearch = async () => {
    if (!newResearch.company_name) { alert('Please enter a company name'); return; }
    try {
      setSaving(true);
      const { data, error } = await supabase.from('research_notes').insert({
        company_name: newResearch.company_name,
        position: newResearch.position,
        notes: newResearch.notes,
      }).select().single();
      if (error) throw error;
      setResearchNotes([data, ...researchNotes]);
      setNewResearch({ company_name: '', position: '', notes: '' });
      alert('Research saved to database!');
    } catch (err) { console.error('Error saving research:', err); alert('Failed to save.'); }
    finally { setSaving(false); }
  };

  const totalOffer1 = offer1.salary + offer1.bonus + offer1.equity + offer1.benefits;
  const totalOffer2 = offer2.salary + offer2.bonus + offer2.equity + offer2.benefits;
  const practicedCount = questions.filter(q => q.practiced).length;

  const filteredQuestions = questions.filter(q => {
    if (filterCategory !== 'All' && q.category !== filterCategory) return false;
    if (showPracticedOnly && !q.practiced) return false;
    return true;
  });

  if (loading) {
    return (<div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]"><div className="text-center"><Loader2 className="animate-spin text-violet-400 mx-auto mb-4" size={48} /><p className="text-gray-400">Loading from Supabase + JSONPlaceholder...</p></div></div>);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Interview Prep</h1>
        <p className="text-gray-400">Questions saved to Supabase + Todos from JSONPlaceholder</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-violet-500/20 border-glow"><p className="text-gray-400 text-sm">Questions</p><p className="text-2xl font-bold text-white">{questions.length}</p></div>
        <div className="p-4 rounded-lg bg-green-500/20 border-glow"><p className="text-gray-400 text-sm">Practiced</p><p className="text-2xl font-bold text-green-400">{practicedCount}</p></div>
        <div className="p-4 rounded-lg bg-cyan-500/20 border-glow"><p className="text-gray-400 text-sm">Practice Rate</p><p className="text-2xl font-bold text-cyan-400">{Math.round((practicedCount / questions.length) * 100)}%</p></div>
        <div className="p-4 rounded-lg bg-yellow-500/20 border-glow"><p className="text-gray-400 text-sm">External Todos</p><p className="text-2xl font-bold text-white">{externalTodos.length}</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Timer */}
        <GlassCard delay={0.1}>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Clock className="text-violet-400" size={20} />Interview Timer</h2>
          <div className="flex gap-2 mb-6">
            <button onClick={() => { setTimerMode('stopwatch'); setTimerRunning(false); setTime(0); }} className={`flex-1 py-2 rounded-lg text-sm font-medium ${timerMode === 'stopwatch' ? 'bg-violet-500/30 text-violet-400' : 'bg-white/5 text-gray-400'}`}>Stopwatch</button>
            <button onClick={() => { setTimerMode('countdown'); setTimerRunning(false); setTime(countdownTime); }} className={`flex-1 py-2 rounded-lg text-sm font-medium ${timerMode === 'countdown' ? 'bg-violet-500/30 text-violet-400' : 'bg-white/5 text-gray-400'}`}>Countdown</button>
          </div>
          {timerMode === 'countdown' && (<div className="mb-4"><label className="text-gray-400 text-sm block mb-2">Minutes</label><input type="number" value={countdownTime / 60} onChange={(e) => setCountdownTime(Number(e.target.value) * 60)} className="input-field w-full px-4 py-2 rounded-lg text-white" min={1} max={60} /></div>)}
          <div className="text-center py-8">
            <div className={`text-6xl font-bold mb-8 ${timerMode === 'countdown' && time <= 10 ? 'text-red-400' : 'gradient-text'}`}>{formatTime(time)}</div>
            <div className="flex justify-center gap-4">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setTimerRunning(!timerRunning)} className="btn-primary px-8 py-3 rounded-xl text-white font-semibold flex items-center gap-2">{timerRunning ? <Pause size={20} /> : <Play size={20} />}{timerRunning ? 'Pause' : 'Start'}</motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setTimerRunning(false); setTime(timerMode === 'countdown' ? countdownTime : 0); }} className="btn-secondary px-8 py-3 rounded-xl text-white font-semibold flex items-center gap-2"><RotateCcw size={20} />Reset</motion.button>
            </div>
          </div>
        </GlassCard>

        {/* Salary Calculator */}
        <GlassCard delay={0.2}>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Calculator className="text-cyan-400" size={20} />Offer Compare Tool</h2>
          <div className="space-y-6">
            <div className="p-4 bg-glass rounded-lg border border-violet-500/30">
              <div className="flex items-center gap-2 mb-4"><Building2 className="text-violet-400" size={18} /><input type="text" value={offer1.company} onChange={(e) => setOffer1({ ...offer1, company: e.target.value })} className="bg-transparent text-white font-medium outline-none" placeholder="Company 1" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-gray-400 text-xs block mb-1">Base</label><input type="number" value={offer1.salary || ''} onChange={(e) => setOffer1({ ...offer1, salary: Number(e.target.value) })} className="input-field w-full px-3 py-2 rounded text-white text-sm" placeholder="0" /></div>
                <div><label className="text-gray-400 text-xs block mb-1">Bonus</label><input type="number" value={offer1.bonus || ''} onChange={(e) => setOffer1({ ...offer1, bonus: Number(e.target.value) })} className="input-field w-full px-3 py-2 rounded text-white text-sm" placeholder="0" /></div>
                <div><label className="text-gray-400 text-xs block mb-1">Equity</label><input type="number" value={offer1.equity || ''} onChange={(e) => setOffer1({ ...offer1, equity: Number(e.target.value) })} className="input-field w-full px-3 py-2 rounded text-white text-sm" placeholder="0" /></div>
                <div><label className="text-gray-400 text-xs block mb-1">Benefits</label><input type="number" value={offer1.benefits || ''} onChange={(e) => setOffer1({ ...offer1, benefits: Number(e.target.value) })} className="input-field w-full px-3 py-2 rounded text-white text-sm" placeholder="0" /></div>
              </div>
              <div className="pt-3 mt-3 border-t border-white/10"><p className="text-2xl font-bold text-violet-400">${totalOffer1.toLocaleString()}<span className="text-xs text-gray-500 ml-2">/yr</span></p></div>
            </div>
            <div className="p-4 bg-glass rounded-lg border border-cyan-500/30">
              <div className="flex items-center gap-2 mb-4"><Building2 className="text-cyan-400" size={18} /><input type="text" value={offer2.company} onChange={(e) => setOffer2({ ...offer2, company: e.target.value })} className="bg-transparent text-white font-medium outline-none" placeholder="Company 2" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-gray-400 text-xs block mb-1">Base</label><input type="number" value={offer2.salary || ''} onChange={(e) => setOffer2({ ...offer2, salary: Number(e.target.value) })} className="input-field w-full px-3 py-2 rounded text-white text-sm" placeholder="0" /></div>
                <div><label className="text-gray-400 text-xs block mb-1">Bonus</label><input type="number" value={offer2.bonus || ''} onChange={(e) => setOffer2({ ...offer2, bonus: Number(e.target.value) })} className="input-field w-full px-3 py-2 rounded text-white text-sm" placeholder="0" /></div>
                <div><label className="text-gray-400 text-xs block mb-1">Equity</label><input type="number" value={offer2.equity || ''} onChange={(e) => setOffer2({ ...offer2, equity: Number(e.target.value) })} className="input-field w-full px-3 py-2 rounded text-white text-sm" placeholder="0" /></div>
                <div><label className="text-gray-400 text-xs block mb-1">Benefits</label><input type="number" value={offer2.benefits || ''} onChange={(e) => setOffer2({ ...offer2, benefits: Number(e.target.value) })} className="input-field w-full px-3 py-2 rounded text-white text-sm" placeholder="0" /></div>
              </div>
              <div className="pt-3 mt-3 border-t border-white/10"><p className="text-2xl font-bold text-cyan-400">${totalOffer2.toLocaleString()}<span className="text-xs text-gray-500 ml-2">/yr</span></p></div>
            </div>
            {(totalOffer1 > 0 || totalOffer2 > 0) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-glass rounded-lg text-center border border-white/10">
                {totalOffer1 > totalOffer2 ? <><p className="text-white text-lg"><span className="text-violet-400 font-bold">{offer1.company || 'Offer 1'}</span> pays more by</p><p className="text-2xl font-bold text-green-400 mt-2">${(totalOffer1 - totalOffer2).toLocaleString()}</p></> : totalOffer2 > totalOffer1 ? <><p className="text-white text-lg"><span className="text-cyan-400 font-bold">{offer2.company || 'Offer 2'}</span> pays more by</p><p className="text-2xl font-bold text-green-400 mt-2">${(totalOffer2 - totalOffer1).toLocaleString()}</p></> : <p className="text-white text-lg flex items-center justify-center gap-2"><CheckCircle className="text-green-400" size={24} />Both offers are equal</p>}
              </motion.div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Questions */}
      <GlassCard delay={0.3}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><Target className="text-violet-400" size={20} />Practice Questions (Supabase)</h2>
          <button onClick={() => setIsAddQuestionOpen(true)} className="btn-secondary px-4 py-2 rounded-lg text-white text-sm flex items-center gap-2"><Plus size={16} />Add Question</button>
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (<button key={cat} onClick={() => setFilterCategory(cat)} className={`px-4 py-2 rounded-lg text-sm transition-colors ${filterCategory === cat ? 'bg-violet-500/30 text-violet-400' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>{cat}</button>))}
          <label className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg text-gray-400 text-sm cursor-pointer"><input type="checkbox" checked={showPracticedOnly} onChange={(e) => setShowPracticedOnly(e.target.checked)} className="rounded" />Practiced Only</label>
        </div>
        <div className="space-y-2">
          {filteredQuestions.map((q) => (
            <div key={q.id} className="border border-white/5 rounded-lg overflow-hidden">
              <div className="flex items-center gap-3 p-4 bg-glass hover:bg-white/5 transition-colors">
                <button onClick={() => togglePracticed(q.id, q.practiced)} className={`p-1 rounded ${q.practiced ? 'text-green-400' : 'text-gray-600'}`}><CheckCircle size={20} /></button>
                <button onClick={() => toggleQuestion(q.id)} className="flex-1 flex items-center justify-between text-left">
                  <div className="flex items-center gap-3">{expandedQuestions.includes(q.id) ? <ChevronDown className="text-violet-400" size={18} /> : <ChevronRight className="text-violet-400" size={18} />}<span className={`text-white ${q.practiced ? 'line-through text-gray-400' : ''}`}>{q.question}</span></div>
                  <span className="text-xs px-2 py-1 rounded bg-violet-500/20 text-violet-300">{q.category}</span>
                </button>
                <button onClick={() => deleteQuestion(q.id)} className="p-2 text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
              </div>
              {expandedQuestions.includes(q.id) && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="p-4 bg-glass/50 border-t border-white/5">
                  <p className="text-gray-300 text-sm mb-3"><strong className="text-gray-400">Tip:</strong> {q.tip}</p>
                  <textarea placeholder="Type your answer here to practice..." className="input-field w-full px-4 py-3 rounded-lg text-white text-sm resize-none" rows={3} />
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* JSONPlaceholder Todos */}
      <GlassCard className="mt-6" delay={0.4}>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Clock className="text-cyan-400" size={20} />External Todos (JSONPlaceholder API)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {externalTodos.map((todo) => (
            <div key={todo.id} className="p-3 bg-glass rounded-lg flex items-center gap-3">
              <div className={`w-5 h-5 rounded border ${todo.completed ? 'bg-green-500 border-green-500' : 'border-gray-600'} flex items-center justify-center`}>{todo.completed && <CheckCircle size={12} className="text-white" />}</div>
              <span className={`text-sm ${todo.completed ? 'text-gray-500 line-through' : 'text-white'}`}>{todo.title}</span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Company Research */}
      <GlassCard className="mt-6" delay={0.5}>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Building2 className="text-cyan-400" size={20} />Company Research Notes (Supabase)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-gray-400 text-sm block mb-2">Company Name</label><input type="text" value={newResearch.company_name} onChange={(e) => setNewResearch({ ...newResearch, company_name: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" placeholder="e.g., TechCorp" /></div>
          <div><label className="text-gray-400 text-sm block mb-2">Position</label><input type="text" value={newResearch.position} onChange={(e) => setNewResearch({ ...newResearch, position: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" placeholder="e.g., Senior Developer" /></div>
        </div>
        <div className="mt-4"><label className="text-gray-400 text-sm block mb-2">Notes</label><textarea value={newResearch.notes} onChange={(e) => setNewResearch({ ...newResearch, notes: e.target.value })} placeholder="Key facts: products, mission, culture..." className="input-field w-full px-4 py-3 rounded-lg text-white resize-none" rows={4} /></div>
        <button onClick={saveResearch} disabled={saving} className="btn-primary mt-4 px-6 py-2 rounded-lg text-white text-sm flex items-center gap-2 disabled:opacity-50">{saving ? <><Loader2 className="animate-spin" size={14} /> Saving...</> : 'Save Research'}</button>

        {/* Saved research */}
        {researchNotes.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-gray-400 text-sm">Saved Research:</h3>
            {researchNotes.map((note) => (
              <div key={note.id} className="p-4 bg-glass rounded-lg border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">{note.company_name}</h4>
                  <span className="text-gray-500 text-xs">{note.position}</span>
                </div>
                <p className="text-gray-400 text-sm">{note.notes}</p>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Add Question Modal */}
      <AnimatePresence>{isAddQuestionOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={() => setIsAddQuestionOpen(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-glass border-glow rounded-2xl p-6 w-full max-w-md card-glow">
            <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold text-white">Add Question</h2><button onClick={() => setIsAddQuestionOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button></div>
            <div className="space-y-4">
              <div><label className="text-gray-400 text-sm block mb-2">Question</label><input type="text" value={newQuestion.question} onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" placeholder="e.g., What is your leadership style?" /></div>
              <div><label className="text-gray-400 text-sm block mb-2">Category</label><select value={newQuestion.category} onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white">{categories.filter(c => c !== 'All').map((cat) => (<option key={cat} value={cat}>{cat}</option>))}</select></div>
              <div><label className="text-gray-400 text-sm block mb-2">Tip</label><textarea value={newQuestion.tip} onChange={(e) => setNewQuestion({ ...newQuestion, tip: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white resize-none" rows={2} placeholder="Advice for answering..." /></div>
              <div className="flex gap-3 pt-2"><button onClick={() => setIsAddQuestionOpen(false)} className="btn-secondary flex-1 py-3 rounded-lg text-white font-medium">Cancel</button><button onClick={addQuestion} disabled={saving} className="btn-primary flex-1 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50">{saving ? <><Loader2 className="animate-spin" size={18} /> Saving...</> : 'Add'}</button></div>
            </div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>
    </motion.div>
  );
}
