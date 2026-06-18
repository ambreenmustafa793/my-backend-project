import { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Briefcase, BarChart3, Target, Users, FileText, Search, Menu, X } from 'lucide-react';
import ThreeBackground from './ThreeBackground';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/jobs', label: 'My Jobs', icon: Briefcase },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/prep', label: 'Interview Prep', icon: Target },
  { path: '/network', label: 'My Network', icon: Users },
  { path: '/documents', label: 'Documents', icon: FileText },
  { path: '/scanner', label: 'Job Scanner', icon: Search },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const showSidebar = sidebarOpen || !isMobile;

  return (
    <div className="min-h-screen bg-[#030307] relative">
      <ThreeBackground />

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-glass border-glow rounded-lg text-white"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-64 bg-glass border-r border-glow z-40 flex flex-col"
          >
            <div className="p-6 border-b border-glow">
              <h1 className="text-2xl font-bold gradient-text">Job Tracker</h1>
              <p className="text-gray-400 text-sm mt-1">Pro Edition</p>
            </div>

            <nav className="flex-1 py-6 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `sidebar-item flex items-center gap-3 px-6 py-3 text-gray-300 transition-all ${
                      isActive ? 'active text-white' : 'hover:text-white'
                    }`
                  }
                >
                  <item.icon size={20} className="text-violet-400" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="p-4 border-t border-glow">
              <div className="flex items-center gap-3 p-3 bg-glass rounded-lg">
                <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-bold">U</div>
                <div>
                  <p className="text-white font-medium text-sm">Welcome Back</p>
                  <p className="text-gray-400 text-xs">Job Seeker</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 z-30"
          />
        )}
      </AnimatePresence>

      <main className="lg:ml-64 min-h-screen relative z-10">
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
