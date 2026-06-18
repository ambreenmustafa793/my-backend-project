import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, X, Linkedin, Mail, MessageSquare, Copy, Check, ExternalLink } from 'lucide-react';
import GlassCard from '../components/GlassCard';

interface Contact { id: string; name: string; role: string; company: string; linkedin: string; email: string; notes: string; lastContact: string; }

const initialContacts: Contact[] = [
  { id: '1', name: 'Sarah Johnson', role: 'Senior Recruiter', company: 'TechCorp', linkedin: 'https://linkedin.com/in/sarah-johnson', email: 'sarah@techcorp.com', notes: 'Met at tech meetup', lastContact: '3 days ago' },
  { id: '2', name: 'Mike Chen', role: 'Engineering Manager', company: 'StartupXYZ', linkedin: 'https://linkedin.com/in/mike-chen', email: 'mike@startupxyz.com', notes: 'Former colleague', lastContact: '1 week ago' },
];

const templates = [
  { name: 'Follow Up After Meeting', text: 'Hi [Name], Great meeting you at [Event]! I enjoyed our conversation about [Topic]. Let stay in touch - I would love to hear more about your work at [Company].' },
  { name: 'Connection Request', text: 'Hi [Name], I see we both work in [Industry]. I am currently exploring opportunities in [Field] and would love to connect and learn from your experience at [Company].' },
  { name: 'Thank You for Referral', text: 'Hi [Name], Thank you so much for the referral to [Company]! I have applied for the [Role] position and will keep you posted. Really appreciate your help!' },
  { name: 'Job Inquiry', text: 'Hi [Name], I noticed there is an opening for [Role] at [Company]. Would you be open to sharing some insights about the team culture and what the hiring manager is looking for?' },
];

const interactionHistory = [
  { contact: 'Sarah Johnson', action: 'Sent follow-up email', date: '3 days ago' },
  { contact: 'Mike Chen', action: 'Had coffee chat', date: '1 week ago' },
  { contact: 'Sarah Johnson', action: 'Connected on LinkedIn', date: '2 weeks ago' },
];

export default function Network() {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', role: '', company: '', linkedin: '', email: '', notes: '' });
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const handleAddContact = () => {
    if (!newContact.name) return;
    const contact: Contact = { id: Date.now().toString(), ...newContact, lastContact: 'Just now' };
    setContacts([...contacts, contact]);
    setNewContact({ name: '', role: '', company: '', linkedin: '', email: '', notes: '' });
    setIsModalOpen(false);
  };

  const handleDeleteContact = (id: string) => setContacts(contacts.filter((c) => c.id !== id));

  const handleCopyTemplate = (text: string, name: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(name);
    setTimeout(() => setCopiedTemplate(null), 2000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">My Network</h1>
          <p className="text-gray-400">Track your professional contacts</p>
        </div>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsModalOpen(true)} className="btn-primary px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2">
          <Plus size={20} /> Add Contact
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-2" delay={0.1}>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="text-violet-400" size={20} /> People I Know ({contacts.length})
          </h2>
          <div className="space-y-4">
            {contacts.map((contact, index) => (
              <motion.div key={contact.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + index * 0.1 }} className="p-4 bg-glass rounded-xl border border-white/5 hover:border-violet-500/30 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-lg">
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{contact.name}</h3>
                      <p className="text-gray-400 text-sm">{contact.role} at {contact.company}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteContact(contact.id)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"><X size={18} /></button>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {contact.linkedin && <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 rounded-lg text-blue-400 text-xs hover:bg-blue-500/30 transition-colors"><Linkedin size={12} />LinkedIn<ExternalLink size={10} /></a>}
                  {contact.email && <a href={`mailto:${contact.email}`} className="flex items-center gap-1 px-3 py-1.5 bg-violet-500/20 rounded-lg text-violet-400 text-xs hover:bg-violet-500/30 transition-colors"><Mail size={12} />Email</a>}
                </div>
                {contact.notes && <p className="text-gray-500 text-sm mb-2">{contact.notes}</p>}
                <p className="text-gray-600 text-xs">Last contact: {contact.lastContact}</p>
              </motion.div>
            ))}
            {contacts.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto text-gray-600 mb-4" size={48} />
                <p className="text-gray-500">No contacts yet. Add your first contact to get started!</p>
              </div>
            )}
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard delay={0.3}>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="text-cyan-400" size={20} /> Message Templates
            </h2>
            <div className="space-y-3">
              {templates.map((template, index) => (
                <motion.div key={template.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + index * 0.1 }} className="p-4 bg-glass rounded-lg border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium text-sm">{template.name}</span>
                    <button onClick={() => handleCopyTemplate(template.text, template.name)} className="flex items-center gap-1 text-gray-400 hover:text-violet-400 transition-colors">
                      {copiedTemplate === template.name ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed">{template.text}</p>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          <GlassCard delay={0.5}>
            <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {interactionHistory.map((item, index) => (
                <motion.div key={index} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + index * 0.1 }} className="flex items-start gap-3 p-3 bg-glass rounded-lg">
                  <div className="w-2 h-2 mt-2 rounded-full bg-violet-500 flex-shrink-0" />
                  <div>
                    <p className="text-white text-sm">{item.action}</p>
                    <p className="text-gray-500 text-xs">with {item.contact}</p>
                    <p className="text-gray-600 text-xs mt-1">{item.date}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={() => setIsModalOpen(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-glass border-glow rounded-2xl p-6 w-full max-w-md card-glow">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Add Contact</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm block mb-2">Name *</label>
                  <input type="text" value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" placeholder="e.g., John Smith" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">Role</label>
                    <input type="text" value={newContact.role} onChange={(e) => setNewContact({ ...newContact, role: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" placeholder="e.g., Engineer" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm block mb-2">Company</label>
                    <input type="text" value={newContact.company} onChange={(e) => setNewContact({ ...newContact, company: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" placeholder="e.g., TechCorp" />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-2">LinkedIn Profile</label>
                  <input type="text" value={newContact.linkedin} onChange={(e) => setNewContact({ ...newContact, linkedin: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" placeholder="https://linkedin.com/in/..." />
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-2">Email</label>
                  <input type="email" value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" placeholder="email@example.com" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm block mb-2">Notes</label>
                  <textarea value={newContact.notes} onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white resize-none" rows={2} placeholder="How do you know this person?" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1 py-3 rounded-lg text-white font-medium">Cancel</button>
                  <button onClick={handleAddContact} className="btn-primary flex-1 py-3 rounded-lg text-white font-medium">Add Contact</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
