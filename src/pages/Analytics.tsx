import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, Target, CheckCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const weeklyData = [
  { week: 'Week 1', applications: 5, responses: 2 },
  { week: 'Week 2', applications: 8, responses: 3 },
  { week: 'Week 3', applications: 6, responses: 4 },
  { week: 'Week 4', applications: 10, responses: 5 },
];

const statusData = [
  { name: 'Applied', value: 24, color: '#8A2BE2' },
  { name: 'Talking', value: 8, color: '#00BFFF' },
  { name: 'Offer', value: 2, color: '#10B981' },
  { name: 'Declined', value: 5, color: '#EF4444' },
];

const monthlyActivity = [
  { month: 'Jan', jobs: 12 },
  { month: 'Feb', jobs: 18 },
  { month: 'Mar', jobs: 15 },
  { month: 'Apr', jobs: 22 },
  { month: 'May', jobs: 20 },
  { month: 'Jun', jobs: 25 },
];

const responseTimes = [
  { company: 'TechCorp', days: 3 },
  { company: 'StartupXYZ', days: 7 },
  { company: 'BigTech', days: 2 },
  { company: 'InnovateLabs', days: 5 },
];

export default function Analytics() {
  const totalApplications = statusData.reduce((acc, curr) => acc + curr.value, 0);
  const responseRate = Math.round((15 / 39) * 100);
  const avgResponseTime = Math.round(responseTimes.reduce((acc, curr) => acc + curr.days, 0) / responseTimes.length);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-gray-400">See your job search trends and patterns</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <GlassCard delay={0.1}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg gradient-bg"><TrendingUp className="text-white" size={18} /></div>
            <span className="text-gray-400 text-sm">Response Rate</span>
          </div>
          <p className="stat-number gradient-text">{responseRate}%</p>
          <p className="text-gray-500 text-sm mt-1">of applications get replies</p>
        </GlassCard>

        <GlassCard delay={0.2}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-cyan-500/20"><Clock className="text-cyan-400" size={18} /></div>
            <span className="text-gray-400 text-sm">Avg Response Time</span>
          </div>
          <p className="stat-number text-cyan-400">{avgResponseTime}</p>
          <p className="text-gray-500 text-sm mt-1">days to get a reply</p>
        </GlassCard>

        <GlassCard delay={0.3}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-green-500/20"><CheckCircle className="text-green-400" size={18} /></div>
            <span className="text-gray-400 text-sm">Interview Rate</span>
          </div>
          <p className="stat-number text-green-400">30%</p>
          <p className="text-gray-500 text-sm mt-1">land interviews</p>
        </GlassCard>

        <GlassCard delay={0.4}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-violet-500/20"><Target className="text-violet-400" size={18} /></div>
            <span className="text-gray-400 text-sm">Total Applied</span>
          </div>
          <p className="stat-number text-violet-400">{totalApplications}</p>
          <p className="text-gray-500 text-sm mt-1">jobs this month</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <GlassCard delay={0.5}>
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Applications</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(138, 43, 226, 0.1)" />
                <XAxis dataKey="week" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip contentStyle={{ background: 'rgba(10, 10, 18, 0.9)', border: '1px solid rgba(138, 43, 226, 0.3)', borderRadius: '8px' }} />
                <Bar dataKey="applications" fill="#8A2BE2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="responses" fill="#00FFFF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-4 text-sm">
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-violet-500" /><span className="text-gray-400">Applications</span></span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-cyan-400" /><span className="text-gray-400">Responses</span></span>
          </div>
        </GlassCard>

        <GlassCard delay={0.6}>
          <h3 className="text-lg font-semibold text-white mb-4">Status Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                </Pie>
                <Tooltip contentStyle={{ background: 'rgba(10, 10, 18, 0.9)', border: '1px solid rgba(138, 43, 226, 0.3)', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {statusData.map((item) => (<span key={item.name} className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full" style={{ background: item.color }} /><span className="text-gray-400">{item.name}</span><span className="text-white font-medium">{item.value}</span></span>))}
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard delay={0.7}>
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(138, 43, 226, 0.1)" />
                <XAxis dataKey="month" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip contentStyle={{ background: 'rgba(10, 10, 18, 0.9)', border: '1px solid rgba(138, 43, 226, 0.3)', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="jobs" stroke="#8A2BE2" strokeWidth={3} dot={{ fill: '#00FFFF', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard delay={0.8}>
          <h3 className="text-lg font-semibold text-white mb-4">Company Response Speed</h3>
          <div className="space-y-4">
            {responseTimes.map((item, index) => (
              <motion.div key={item.company} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 + index * 0.1 }} className="p-4 bg-glass rounded-lg border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{item.company}</span>
                  <span className="text-cyan-400">{item.days} days</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(item.days / 10) * 100}%` }} transition={{ duration: 1, delay: 1 + index * 0.1 }} className="h-full gradient-bg rounded-full" />
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
