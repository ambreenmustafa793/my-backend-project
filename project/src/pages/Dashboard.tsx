import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Briefcase, MessageCircle, Award, XCircle, TrendingUp, Clock, Target, Sparkles, Calendar, ChevronRight, Loader2, RefreshCw, Users, FileText, Activity } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { supabase } from '../lib/supabase';
import { fetchPosts, mapPostToActivity } from '../lib/jsonplaceholder';

export default function Dashboard() {
  const [stats, setStats] = useState([
    { label: 'Jobs Applied', value: 0, icon: Briefcase, color: 'from-violet-500 to-purple-600', change: 'Loading...' },
    { label: 'Talking to Them', value: 0, icon: MessageCircle, color: 'from-cyan-500 to-blue-600', change: 'Loading...' },
    { label: 'Got an Offer', value: 0, icon: Award, color: 'from-green-500 to-emerald-600', change: 'Loading...' },
    { label: 'Not Moving Forward', value: 0, icon: XCircle, color: 'from-red-500 to-rose-600', change: 'Loading...' },
  ]);
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      // Fetch jobs from Supabase
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;

      // Count by status
      const applied = jobs?.filter(j => j.status === 'applied').length || 0;
      const talking = jobs?.filter(j => j.status === 'talking').length || 0;
      const offer = jobs?.filter(j => j.status === 'offer').length || 0;
      const notMoving = jobs?.filter(j => j.status === 'not_moving').length || 0;

      setStats([
        { label: 'Jobs Applied', value: applied, icon: Briefcase, color: 'from-violet-500 to-purple-600', change: `${applied} total` },
        { label: 'Talking to Them', value: talking, icon: MessageCircle, color: 'from-cyan-500 to-blue-600', change: `${talking} active` },
        { label: 'Got an Offer', value: offer, icon: Award, color: 'from-green-500 to-emerald-600', change: offer > 0 ? `${offer} new!` : 'No offers yet' },
        { label: 'Not Moving Forward', value: notMoving, icon: XCircle, color: 'from-red-500 to-rose-600', change: 'Keep going!' },
      ]);

      // Fetch contacts count
      const { count: contactCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true });

      setContacts(contactCount || 0);

      // Fetch activities from Supabase
      const { data: dbActivities } = await supabase
        .from('job_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      // Also fetch from JSONPlaceholder for demo
      let jpActivities = [];
      try {
        const posts = await fetchPosts();
        jpActivities = posts.slice(0, 3).map(mapPostToActivity);
      } catch (e) {
        console.log('JSONPlaceholder unavailable');
      }

      // Combine activities
      const allActivities = [
        ...(dbActivities || []).map(a => ({
          action: a.action,
          time: formatTimeAgo(a.created_at),
          type: a.type || 'applied',
          details: a.details || ''
        })),
        ...jpActivities
      ];

      setActivities(allActivities);

    } catch (error) {
      console.error('Error loading dashboard:', error);
      // Fallback to empty state
      setActivities([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin text-violet-400 mx-auto mb-4" size={48} />
          <p className="text-gray-400">Loading your dashboard from backend...</p>
          <p className="text-gray-600 text-sm mt-2">Fetching data from Supabase + JSONPlaceholder</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">My Dashboard</h1>
          <p className="text-gray-400">Data loaded from Supabase backend + JSONPlaceholder API</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-secondary px-4 py-2 rounded-lg text-white flex items-center gap-2"
        >
          <RefreshCw className={refreshing ? 'animate-spin' : ''} size={16} />
          Refresh
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {stats.map((stat, index) => (
          <GlassCard key={stat.label} delay={index * 0.1}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                <stat.icon size={24} className="text-white" />
              </div>
              <TrendingUp className="text-green-400" size={20} />
            </div>
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="stat-number gradient-text"
            >
              {stat.value}
            </motion.span>
            <p className="text-gray-400 mt-2">{stat.label}</p>
            <p className="text-violet-400 text-sm mt-1">{stat.change}</p>
          </GlassCard>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <GlassCard className="lg:col-span-2" delay={0.4}>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="text-violet-400" size={20} />
            Recent Activity
            <span className="text-xs text-gray-600 ml-2">Supabase + JSONPlaceholder</span>
          </h2>
          <div className="space-y-4">
            {activities.length > 0 ? activities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-glass rounded-lg border border-white/5 hover:border-violet-500/30 transition-all cursor-pointer"
              >
                <div className={`w-3 h-3 rounded-full ${
                  activity.type === 'offer' ? 'bg-green-500' :
                  activity.type === 'interview' ? 'bg-cyan-500' :
                  activity.type === 'reply' ? 'bg-blue-500' : 'bg-violet-500'
                }`} />
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{activity.action}</p>
                  <p className="text-gray-400 text-xs">{activity.details}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-xs">{activity.time}</p>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No activity yet. Add some jobs to get started!</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <GlassCard delay={0.5}>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="text-cyan-400" size={20} />
              Backend Stats
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-glass rounded-lg flex items-center justify-between">
                <span className="text-gray-400 text-sm">Contacts</span>
                <span className="text-white font-bold">{contacts}</span>
              </div>
              <div className="p-3 bg-glass rounded-lg flex items-center justify-between">
                <span className="text-gray-400 text-sm">API Source</span>
                <span className="text-violet-400 text-sm">Supabase</span>
              </div>
              <div className="p-3 bg-glass rounded-lg flex items-center justify-between">
                <span className="text-gray-400 text-sm">External API</span>
                <span className="text-cyan-400 text-sm">JSONPlaceholder</span>
              </div>
              <div className="p-3 bg-glass rounded-lg flex items-center justify-between">
                <span className="text-gray-400 text-sm">Data Persistence</span>
                <span className="text-green-400 text-sm">Yes (Database)</span>
              </div>
            </div>
          </GlassCard>

          {/* Quick Tips */}
          <GlassCard delay={0.6}>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="text-yellow-400" size={20} />
              Quick Tips
            </h2>
            <div className="space-y-3">
              {[
                'Follow up within 48 hours after an interview',
                'Customize your resume for each application',
                'Connect with employees at target companies',
                'Practice your elevator pitch daily',
              ].map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-glass rounded-lg"
                >
                  <Target className="text-violet-400 flex-shrink-0 mt-0.5" size={16} />
                  <p className="text-gray-300 text-sm">{tip}</p>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Progress Bar */}
      <GlassCard className="mt-6" delay={0.8}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">Monthly Goal Progress</h3>
          <span className="text-violet-400 font-bold">
            {stats[0].value}/20
          </span>
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (stats[0].value / 20) * 100)}%` }}
            transition={{ duration: 1, delay: 1 }}
            className="h-full gradient-bg rounded-full"
          />
        </div>
        <p className="text-gray-500 text-sm mt-2">
          Applied to {stats[0].value} of 20 target jobs this month
        </p>
      </GlassCard>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Link to="/jobs">
          <GlassCard delay={0.9} className="cursor-pointer hover:border-violet-500/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">Add New Job</h3>
                <p className="text-gray-400 text-sm">Track a new application</p>
              </div>
              <ChevronRight className="text-violet-400" size={24} />
            </div>
          </GlassCard>
        </Link>

        <Link to="/prep">
          <GlassCard delay={1.0} className="cursor-pointer hover:border-cyan-500/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">Practice Interview</h3>
                <p className="text-gray-400 text-sm">Prepare for interviews</p>
              </div>
              <ChevronRight className="text-cyan-400" size={24} />
            </div>
          </GlassCard>
        </Link>

        <Link to="/scanner">
          <GlassCard delay={1.1} className="cursor-pointer hover:border-green-500/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">Scan Job URL</h3>
                <p className="text-gray-400 text-sm">Quick add from posting</p>
              </div>
              <ChevronRight className="text-green-400" size={24} />
            </div>
          </GlassCard>
        </Link>
      </div>
    </motion.div>
  );
}
