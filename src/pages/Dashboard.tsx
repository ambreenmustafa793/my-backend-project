import { motion } from 'framer-motion';
import { Briefcase, MessageCircle, Award, XCircle, TrendingUp, Clock, Target, Sparkles } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const stats = [
  { label: 'Jobs Applied', value: 24, icon: Briefcase, color: 'from-violet-500 to-purple-600' },
  { label: 'Talking to Them', value: 8, icon: MessageCircle, color: 'from-cyan-500 to-blue-600' },
  { label: 'Got an Offer', value: 2, icon: Award, color: 'from-green-500 to-emerald-600' },
  { label: 'Not Moving Forward', value: 5, icon: XCircle, color: 'from-red-500 to-rose-600' },
];

const recentActivity = [
  { action: 'Applied to Senior Developer at TechCorp', time: '2 hours ago', type: 'applied' },
  { action: 'Got a reply from StartupXYZ', time: '5 hours ago', type: 'reply' },
  { action: 'Interview scheduled with BigTech', time: 'Yesterday', type: 'interview' },
  { action: 'Offer received from InnovateLabs', time: '2 days ago', type: 'offer' },
];

const tips = [
  'Follow up within 48 hours after an interview',
  'Customize your resume for each application',
  'Connect with employees at target companies',
  'Practice your elevator pitch daily',
];

function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, type: 'spring' }} className="stat-number gradient-text">
      {value}
    </motion.span>
  );
}

export default function Dashboard() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">My Dashboard</h1>
        <p className="text-gray-400">Track your job search progress at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {stats.map((stat, index) => (
          <GlassCard key={stat.label} delay={index * 0.1}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                <stat.icon size={24} className="text-white" />
              </div>
              <TrendingUp className="text-green-400" size={20} />
            </div>
            <AnimatedNumber value={stat.value} />
            <p className="text-gray-400 mt-2">{stat.label}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2" delay={0.4}>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="text-violet-400" size={20} />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + index * 0.1 }} className="flex items-center gap-4 p-3 bg-glass rounded-lg border border-white/5 hover:border-violet-500/30 transition-all">
                <div className={`w-2 h-2 rounded-full ${activity.type === 'offer' ? 'bg-green-500' : activity.type === 'interview' ? 'bg-cyan-500' : activity.type === 'reply' ? 'bg-blue-500' : 'bg-violet-500'}`} />
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.action}</p>
                  <p className="text-gray-500 text-xs">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        <GlassCard delay={0.5}>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="text-cyan-400" size={20} />
            Quick Tips
          </h2>
          <div className="space-y-3">
            {tips.map((tip, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + index * 0.1 }} className="flex items-start gap-3 p-3 bg-glass rounded-lg">
                <Target className="text-violet-400 flex-shrink-0 mt-0.5" size={16} />
                <p className="text-gray-300 text-sm">{tip}</p>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="mt-6" delay={0.6}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">Monthly Goal Progress</h3>
          <span className="text-violet-400 font-bold">75%</span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} transition={{ duration: 1, delay: 0.8 }} className="h-full gradient-bg rounded-full" />
        </div>
        <p className="text-gray-500 text-sm mt-2">Applied to 15 of 20 target jobs this month</p>
      </GlassCard>
    </motion.div>
  );
}
