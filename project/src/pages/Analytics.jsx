import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, Clock, Target, CheckCircle, Award, Briefcase, BarChart2, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import GlassCard from '../components/GlassCard';

// Chart data
const weeklyData = [
  { week: 'Week 1', applications: 5, responses: 2, interviews: 1 },
  { week: 'Week 2', applications: 8, responses: 3, interviews: 2 },
  { week: 'Week 3', applications: 6, responses: 4, interviews: 1 },
  { week: 'Week 4', applications: 10, responses: 5, interviews: 3 },
];

const statusData = [
  { name: 'Applied', value: 24, color: '#8A2BE2' },
  { name: 'Talking', value: 8, color: '#00BFFF' },
  { name: 'Offer', value: 2, color: '#10B981' },
  { name: 'Declined', value: 5, color: '#EF4444' },
];

const monthlyActivity = [
  { month: 'Jan', jobs: 12, responses: 5 },
  { month: 'Feb', jobs: 18, responses: 8 },
  { month: 'Mar', jobs: 15, responses: 6 },
  { month: 'Apr', jobs: 22, responses: 10 },
  { month: 'May', jobs: 20, responses: 9 },
  { month: 'Jun', jobs: 25, responses: 12 },
];

const responseTimes = [
  { company: 'TechCorp', days: 3 },
  { company: 'StartupXYZ', days: 7 },
  { company: 'BigTech', days: 2 },
  { company: 'InnovateLabs', days: 5 },
  { company: 'DataFlow', days: 4 },
];

const companyStats = [
  { company: 'TechCorp', applications: 3, responses: 2, interviews: 1 },
  { company: 'StartupXYZ', applications: 2, responses: 1, interviews: 1 },
  { company: 'BigTech', applications: 4, responses: 2, interviews: 2 },
  { company: 'InnovateLabs', applications: 1, responses: 1, interviews: 1 },
];

const sourcesData = [
  { name: 'LinkedIn', value: 45, color: '#0A66C2' },
  { name: 'Indeed', value: 25, color: '#2557A7' },
  { name: 'Referral', value: 15, color: '#10B981' },
  { name: 'Direct', value: 15, color: '#8A2BE2' },
];

export default function Analytics() {
  const totalApplications = statusData.reduce((acc, curr) => acc + curr.value, 0);
  const responseRate = Math.round((15 / 39) * 100);
  const avgResponseTime = Math.round(responseTimes.reduce((acc, curr) => acc + curr.days, 0) / responseTimes.length);
  const interviewRate = Math.round((8 / 39) * 100);

  // Weekly totals
  const weeklyApps = weeklyData.reduce((acc, curr) => acc + curr.applications, 0);
  const weeklyResponses = weeklyData.reduce((acc, curr) => acc + curr.responses, 0);
  const weeklyInterviews = weeklyData.reduce((acc, curr) => acc + curr.interviews, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-gray-400">See your job search trends and patterns</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <GlassCard delay={0.1}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg gradient-bg"><TrendingUp className="text-white" size={18} /></div>
            <span className="text-gray-400 text-sm">Response Rate</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="stat-number gradient-text">{responseRate}%</p>
            <span className="text-green-400 text-sm flex items-center"><ArrowUpRight size={14} /> +5%</span>
          </div>
          <p className="text-gray-500 text-sm mt-1">of applications get replies</p>
        </GlassCard>

        <GlassCard delay={0.2}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-cyan-500/20"><Clock className="text-cyan-400" size={18} /></div>
            <span className="text-gray-400 text-sm">Avg Response Time</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="stat-number text-cyan-400">{avgResponseTime}</p>
            <span className="text-gray-500 text-sm">days</span>
            <span className="text-red-400 text-sm flex items-center"><ArrowDownRight size={14} /> -1 day</span>
          </div>
          <p className="text-gray-500 text-sm mt-1">to get a reply</p>
        </GlassCard>

        <GlassCard delay={0.3}>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-green-500/20"><CheckCircle className="text-green-400" size={18} /></div>
            <span className="text-gray-400 text-sm">Interview Rate</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="stat-number text-green-400">{interviewRate}%</p>
            <span className="text-green-400 text-sm flex items-center"><ArrowUpRight size={14} /> +2%</span>
          </div>
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

      {/* Weekly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <GlassCard delay={0.45}>
          <div className="flex items-center gap-3">
            <Briefcase className="text-violet-400" size={20} />
            <div>
              <p className="text-gray-400 text-sm">This Month Applications</p>
              <p className="text-2xl font-bold text-white">{weeklyApps}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard delay={0.5}>
          <div className="flex items-center gap-3">
            <BarChart2 className="text-cyan-400" size={20} />
            <div>
              <p className="text-gray-400 text-sm">This Month Responses</p>
              <p className="text-2xl font-bold text-white">{weeklyResponses}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard delay={0.55}>
          <div className="flex items-center gap-3">
            <Award className="text-green-400" size={20} />
            <div>
              <p className="text-gray-400 text-sm">This Month Interviews</p>
              <p className="text-2xl font-bold text-white">{weeklyInterviews}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Applications Over Time */}
        <GlassCard delay={0.6}>
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(138, 43, 226, 0.1)" />
                <XAxis dataKey="week" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(10, 10, 18, 0.9)',
                    border: '1px solid rgba(138, 43, 226, 0.3)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="applications" fill="#8A2BE2" radius={[4, 4, 0, 0]} name="Applications" />
                <Bar dataKey="responses" fill="#00FFFF" radius={[4, 4, 0, 0]} name="Responses" />
                <Bar dataKey="interviews" fill="#10B981" radius={[4, 4, 0, 0]} name="Interviews" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-4 text-sm flex-wrap">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-violet-500" />
              <span className="text-gray-400">Applications</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-400" />
              <span className="text-gray-400">Responses</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-gray-400">Interviews</span>
            </span>
          </div>
        </GlassCard>

        {/* Status Distribution */}
        <GlassCard delay={0.7}>
          <h3 className="text-lg font-semibold text-white mb-4">Pipeline Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(10, 10, 18, 0.9)',
                    border: '1px solid rgba(138, 43, 226, 0.3)',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {statusData.map((item) => (
              <span key={item.name} className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                <span className="text-gray-400">{item.name}</span>
                <span className="text-white font-medium ml-auto">{item.value}</span>
              </span>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* More Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Trend */}
        <GlassCard delay={0.8}>
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(138, 43, 226, 0.1)" />
                <XAxis dataKey="month" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(10, 10, 18, 0.9)',
                    border: '1px solid rgba(138, 43, 226, 0.3)',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="jobs"
                  stroke="#8A2BE2"
                  fill="rgba(138, 43, 226, 0.3)"
                  strokeWidth={2}
                  name="Jobs Applied"
                />
                <Area
                  type="monotone"
                  dataKey="responses"
                  stroke="#00FFFF"
                  fill="rgba(0, 255, 255, 0.2)"
                  strokeWidth={2}
                  name="Responses"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Application Sources */}
        <GlassCard delay={0.9}>
          <h3 className="text-lg font-semibold text-white mb-4">Application Sources</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourcesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {sourcesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(10, 10, 18, 0.9)',
                    border: '1px solid rgba(138, 43, 226, 0.3)',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [`${value}%`, 'Percentage']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {sourcesData.map((item) => (
              <span key={item.name} className="flex items-center gap-2 text-sm">
                <span className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                <span className="text-gray-400">{item.name}</span>
                <span className="text-white font-medium ml-auto">{item.value}%</span>
              </span>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Response Times and Company Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Times */}
        <GlassCard delay={1.0}>
          <h3 className="text-lg font-semibold text-white mb-4">Company Response Speed</h3>
          <div className="space-y-4">
            {responseTimes.map((item, index) => (
              <motion.div
                key={item.company}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 + index * 0.1 }}
                className="p-4 bg-glass rounded-lg border border-white/5"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{item.company}</span>
                  <span className={`text-sm ${item.days <= 3 ? 'text-green-400' : item.days <= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {item.days} days
                  </span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(10, 100 - (item.days / 10) * 100)}%` }}
                    transition={{ duration: 1, delay: 1.2 + index * 0.1 }}
                    className={`h-full rounded-full ${item.days <= 3 ? 'bg-green-500' : item.days <= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  />
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  {item.days <= 3 ? 'Fast response!' : item.days <= 5 ? 'Average speed' : 'Slow response'}
                </p>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        {/* Company Application Stats */}
        <GlassCard delay={1.2}>
          <h3 className="text-lg font-semibold text-white mb-4">Top Companies</h3>
          <div className="space-y-3">
            {companyStats.map((item, index) => (
              <motion.div
                key={item.company}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + index * 0.1 }}
                className="p-4 bg-glass rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{item.company}</span>
                  <span className="text-violet-400 text-sm">{item.applications} apps</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <p className="text-gray-400">Applied</p>
                    <p className="text-white font-bold">{item.applications}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400">Responses</p>
                    <p className="text-cyan-400 font-bold">{item.responses}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400">Interviews</p>
                    <p className="text-green-400 font-bold">{item.interviews}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
