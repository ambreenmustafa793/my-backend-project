import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, X, Linkedin, Mail, MessageSquare, Copy, Check, Phone, Edit2, Trash2, Star, Send, Loader2, RefreshCw, Globe } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { supabase } from '../lib/supabase';
import { fetchUsers, mapUserToContact } from '../lib/jsonplaceholder';

const templates = [
  { name: 'Follow Up After Meeting', text: 'Hi [Name],\n\nGreat meeting you at [Event]! I enjoyed our conversation about [Topic].\n\nBest,\n[Your Name]' },
  { name: 'Connection Request', text: 'Hi [Name],\n\nI see we both work in [Industry]. I would love to connect.\n\nBest regards,\n[Your Name]' },
  { name: 'Thank You for Referral', text: 'Hi [Name],\n\nThank you for the referral to [Company]! Really appreciate your help!\n\nBest,\n[Your Name]' },
  { name: 'Post-Interview Thank You', text: 'Hi [Name],\n\nThank you for the interview today. I am excited about the opportunity.\n\nBest,\n[Your Name]' },
];

export default function Network() {
  const [contacts, setContacts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [editContact, setEditContact] = useState(null);
  const [newContact, setNewContact] = useState({ name: '', role: '', company: '', linkedin: '', email: '', phone: '', notes: '', tags: '', isFavorite: false });
  const [copiedTemplate, setCopiedTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingExternal, setLoadingExternal] = useState(false);

  // Load contacts from Supabase + JSONPlaceholder
  const loadContacts = async () => {
    try {
      setLoading(true);

      // Fetch from Supabase
      const { data: dbContacts, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedDbContacts = (dbContacts || []).map(c => ({
        id: c.id,
        name: c.name,
        role: c.role || '',
        company: c.company || '',
        linkedin: c.linkedin || '',
        email: c.email || '',
        phone: c.phone || '',
        notes: c.notes || '',
        tags: Array.isArray(c.tags) ? c.tags : [],
        isFavorite: c.is_favorite || false,
        interactionHistory: Array.isArray(c.interaction_history) ? c.interaction_history : [],
        lastContact: c.last_contact || '',
        isExternal: false,
      }));

      setContacts(mappedDbContacts);
    } catch (err) {
      console.error('Error loading contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch external users from JSONPlaceholder
  const fetchExternalContacts = async () => {
    try {
      setLoadingExternal(true);
      const users = await fetchUsers();
      const mappedUsers = users.map(mapUserToContact);

      // Add them to display (not to database)
      setContacts(prev => {
        const existingIds = new Set(prev.map(c => c.id));
        const newOnes = mappedUsers.filter(u => !existingIds.has(u.id));
        return [...prev, ...newOnes];
      });
    } catch (err) {
      console.error('Error fetching external contacts:', err);
      alert('Failed to fetch contacts from JSONPlaceholder API');
    } finally {
      setLoadingExternal(false);
    }
  };

  useEffect(() => { loadContacts(); }, []);

  // Add contact to Supabase
  const handleAddContact = async () => {
    if (!newContact.name) { alert('Please enter a name'); return; }

    try {
      setSaving(true);
      const tags = newContact.tags.split(',').map(t => t.trim()).filter(t => t);

      const { data, error } = await supabase
        .from('contacts')
        .insert({
          name: newContact.name,
          role: newContact.role,
          company: newContact.company,
          linkedin: newContact.linkedin,
          email: newContact.email,
          phone: newContact.phone,
          notes: newContact.notes,
          tags: tags,
          is_favorite: newContact.isFavorite,
          interaction_history: [{ date: 'Just now', action: 'Added contact' }],
          last_contact: 'Just now',
        })
        .select()
        .single();

      if (error) throw error;

      setNewContact({ name: '', role: '', company: '', linkedin: '', email: '', phone: '', notes: '', tags: '', isFavorite: false });
      setIsModalOpen(false);
      await loadContacts();
    } catch (err) {
      console.error('Error adding contact:', err);
      alert('Failed to add contact.');
    } finally {
      setSaving(false);
    }
  };

  // Delete contact from Supabase
  const handleDeleteContact = async (id) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    try {
      // External contacts don't have a database record
      if (String(id).startsWith('jp-')) {
        setContacts(contacts.filter(c => c.id !== id));
        setIsDetailOpen(false);
        setSelectedContact(null);
        return;
      }

      const { error } = await supabase.from('contacts').delete().eq('id', id);
      if (error) throw error;
      setIsDetailOpen(false);
      setSelectedContact(null);
      await loadContacts();
    } catch (err) {
      console.error('Error deleting contact:', err);
      alert('Failed to delete contact.');
    }
  };

  // View contact
  const handleViewContact = (contact) => { setSelectedContact(contact); setIsDetailOpen(true); };

  // Edit contact
  const handleEditContact = (contact) => {
    setEditContact({ ...contact, tagsStr: contact.tags?.join(', ') || '' });
    setIsEditModalOpen(true);
    setIsDetailOpen(false);
  };

  // Save edited contact
  const handleSaveEdit = async () => {
    if (!editContact.name) { alert('Please enter a name'); return; }

    try {
      setSaving(true);
      const tags = editContact.tagsStr.split(',').map(t => t.trim()).filter(t => t);

      const { error } = await supabase
        .from('contacts')
        .update({
          name: editContact.name,
          role: editContact.role,
          company: editContact.company,
          email: editContact.email,
          phone: editContact.phone,
          linkedin: editContact.linkedin,
          notes: editContact.notes,
          tags: tags,
          is_favorite: editContact.isFavorite,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editContact.id);

      if (error) throw error;
      setIsEditModalOpen(false);
      setEditContact(null);
      await loadContacts();
    } catch (err) {
      console.error('Error updating contact:', err);
      alert('Failed to update contact.');
    } finally {
      setSaving(false);
    }
  };

  // Toggle favorite
  const toggleFavorite = async (id, currentVal) => {
    try {
      if (String(id).startsWith('jp-')) {
        setContacts(contacts.map(c => c.id === id ? { ...c, isFavorite: !currentVal } : c));
        return;
      }
      const { error } = await supabase.from('contacts').update({ is_favorite: !currentVal }).eq('id', id);
      if (error) throw error;
      await loadContacts();
    } catch (err) { console.error('Error toggling favorite:', err); }
  };

  // Add interaction
  const addInteraction = async (contactId, action) => {
    try {
      if (String(contactId).startsWith('jp-')) {
        setContacts(contacts.map(c => c.id === contactId ? { ...c, lastContact: 'Just now', interactionHistory: [{ date: 'Just now', action }, ...(c.interactionHistory || [])] } : c));
        return;
      }

      const contact = contacts.find(c => c.id === contactId);
      const newHistory = [{ date: 'Just now', action }, ...(contact?.interactionHistory || [])];
      const { error } = await supabase.from('contacts').update({
        interaction_history: newHistory,
        last_contact: 'Just now',
      }).eq('id', contactId);
      if (error) throw error;
      await loadContacts();
    } catch (err) { console.error('Error adding interaction:', err); }
  };

  // Email / LinkedIn / Phone
  const handleSendEmail = (email) => { if (email) window.location.href = `mailto:${email}`; };
  const handleOpenLinkedIn = (url) => { if (url) window.open(url, '_blank'); };
  const handleCall = (phone) => { if (phone) window.location.href = `tel:${phone}`; };

  // Copy template
  const handleCopyTemplate = (text, name) => { navigator.clipboard.writeText(text); setCopiedTemplate(name); setTimeout(() => setCopiedTemplate(null), 2000); };

  // Filter
  const allTags = [...new Set(contacts.flatMap(c => c.tags || []))];
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) || contact.company.toLowerCase().includes(searchTerm.toLowerCase()) || contact.role.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterTag === 'all') return matchesSearch;
    if (filterTag === 'favorites') return contact.isFavorite && matchesSearch;
    if (filterTag === 'external') return contact.isExternal && matchesSearch;
    return (contact.tags || []).includes(filterTag) && matchesSearch;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin text-violet-400 mx-auto mb-4" size={48} />
          <p className="text-gray-400">Loading contacts from Supabase...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">My Network</h1>
          <p className="text-gray-400">Supabase + JSONPlaceholder API</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={fetchExternalContacts} disabled={loadingExternal} className="btn-secondary px-4 py-3 rounded-xl text-white font-semibold flex items-center gap-2 disabled:opacity-50">
            {loadingExternal ? <Loader2 className="animate-spin" size={18} /> : <Globe size={18} />}
            {loadingExternal ? 'Fetching...' : 'Fetch from API'}
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsModalOpen(true)} className="btn-primary px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2">
            <Plus size={20} /> Add Contact
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg bg-violet-500/20 border-glow"><p className="text-gray-400 text-sm">Total Contacts</p><p className="text-2xl font-bold text-white">{contacts.length}</p></div>
        <div className="p-4 rounded-lg bg-cyan-500/20 border-glow"><p className="text-gray-400 text-sm">From API</p><p className="text-2xl font-bold text-white">{contacts.filter(c => c.isExternal).length}</p></div>
        <div className="p-4 rounded-lg bg-green-500/20 border-glow"><p className="text-gray-400 text-sm">In Database</p><p className="text-2xl font-bold text-white">{contacts.filter(c => !c.isExternal).length}</p></div>
        <div className="p-4 rounded-lg bg-yellow-500/20 border-glow"><p className="text-gray-400 text-sm">Favorites</p><p className="text-2xl font-bold text-white">{contacts.filter(c => c.isFavorite).length}</p></div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1"><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name, company, or role..." className="input-field w-full px-4 py-3 rounded-lg text-white" /></div>
        <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)} className="input-field px-4 py-3 rounded-lg text-white">
          <option value="all">All Contacts</option>
          <option value="favorites">Favorites</option>
          <option value="external">From API</option>
          {allTags.map((tag) => (<option key={tag} value={tag}>{tag}</option>))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contacts List */}
        <GlassCard className="lg:col-span-2" delay={0.1}>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Users className="text-violet-400" size={20} />People I Know ({filteredContacts.length})</h2>
          <div className="space-y-4">
            {filteredContacts.map((contact, index) => (
              <motion.div key={contact.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + index * 0.03 }} className="p-4 bg-glass rounded-xl border border-white/5 hover:border-violet-500/30 transition-all group cursor-pointer" onClick={() => handleViewContact(contact)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${contact.isExternal ? 'bg-cyan-600' : 'gradient-bg'} flex items-center justify-center text-white font-bold text-lg`}>
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-semibold">{contact.name}</h3>
                        {contact.isFavorite && <Star className="text-yellow-400 fill-yellow-400" size={14} />}
                        {contact.isExternal && <span className="text-xs px-1.5 py-0.5 bg-cyan-500/20 rounded text-cyan-400">API</span>}
                      </div>
                      <p className="text-gray-400 text-sm">{contact.role} at {contact.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); toggleFavorite(contact.id, contact.isFavorite); }} className={`p-2 rounded-lg transition-colors ${contact.isFavorite ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-600 hover:text-yellow-400'}`}><Star size={16} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteContact(contact.id); }} className="p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/20 transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {contact.linkedin && <button onClick={(e) => { e.stopPropagation(); handleOpenLinkedIn(contact.linkedin); }} className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 rounded-lg text-blue-400 text-xs hover:bg-blue-500/30 transition-colors"><Linkedin size={12} /> LinkedIn</button>}
                  {contact.email && <button onClick={(e) => { e.stopPropagation(); handleSendEmail(contact.email); }} className="flex items-center gap-1 px-3 py-1.5 bg-violet-500/20 rounded-lg text-violet-400 text-xs hover:bg-violet-500/30 transition-colors"><Mail size={12} /> Email</button>}
                  {contact.phone && <button onClick={(e) => { e.stopPropagation(); handleCall(contact.phone); }} className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 rounded-lg text-green-400 text-xs hover:bg-green-500/30 transition-colors"><Phone size={12} /> Call</button>}
                </div>
                {contact.tags && contact.tags.length > 0 && (<div className="flex flex-wrap gap-1">{contact.tags.map((tag) => (<span key={tag} className="px-2 py-0.5 bg-white/5 rounded text-gray-400 text-xs">{tag}</span>))}</div>)}
                <p className="text-gray-600 text-xs mt-2 flex items-center gap-1"><Clock size={12} /> Last contact: {contact.lastContact || 'N/A'}</p>
              </motion.div>
            ))}
            {filteredContacts.length === 0 && (<div className="text-center py-12"><Users className="mx-auto text-gray-600 mb-4" size={48} /><p className="text-gray-500">No contacts found</p></div>)}
          </div>
        </GlassCard>

        {/* Message Templates */}
        <GlassCard delay={0.3}>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><MessageSquare className="text-cyan-400" size={20} />Message Templates</h2>
          <div className="space-y-3">
            {templates.map((template) => (
              <div key={template.name} className="p-4 bg-glass rounded-lg border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium text-sm">{template.name}</span>
                  <button onClick={() => handleCopyTemplate(template.text, template.name)} className="flex items-center gap-1 text-gray-400 hover:text-violet-400 transition-colors">
                    {copiedTemplate === template.name ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    <span className="text-xs">{copiedTemplate === template.name ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-gray-500 text-xs line-clamp-2 whitespace-pre-line">{template.text}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Add Contact Modal */}
      <AnimatePresence>{isModalOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-glass border-glow rounded-2xl p-6 w-full max-w-lg card-glow max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold text-white">Add Contact</h2><button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button></div>
            <div className="space-y-4">
              <div><label className="text-gray-400 text-sm block mb-2">Name *</label><input type="text" value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" placeholder="e.g., John Smith" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-gray-400 text-sm block mb-2">Role</label><input type="text" value={newContact.role} onChange={(e) => setNewContact({ ...newContact, role: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" placeholder="e.g., Recruiter" /></div>
                <div><label className="text-gray-400 text-sm block mb-2">Company</label><input type="text" value={newContact.company} onChange={(e) => setNewContact({ ...newContact, company: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" placeholder="e.g., TechCorp" /></div>
              </div>
              <div><label className="text-gray-400 text-sm block mb-2">Email</label><input type="email" value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" placeholder="email@example.com" /></div>
              <div><label className="text-gray-400 text-sm block mb-2">Phone</label><input type="tel" value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" placeholder="+1 (555) 123-4567" /></div>
              <div><label className="text-gray-400 text-sm block mb-2">LinkedIn</label><input type="url" value={newContact.linkedin} onChange={(e) => setNewContact({ ...newContact, linkedin: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" placeholder="https://linkedin.com/in/..." /></div>
              <div><label className="text-gray-400 text-sm block mb-2">Tags (comma separated)</label><input type="text" value={newContact.tags} onChange={(e) => setNewContact({ ...newContact, tags: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" placeholder="e.g., Recruiter, Tech" /></div>
              <div><label className="text-gray-400 text-sm block mb-2">Notes</label><textarea value={newContact.notes} onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white resize-none" rows={3} /></div>
              <div className="flex items-center gap-2"><input type="checkbox" id="fav" checked={newContact.isFavorite} onChange={(e) => setNewContact({ ...newContact, isFavorite: e.target.checked })} className="w-4 h-4 rounded" /><label htmlFor="fav" className="text-gray-400 text-sm">Add to favorites</label></div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1 py-3 rounded-lg text-white font-medium">Cancel</button>
                <button onClick={handleAddContact} disabled={saving} className="btn-primary flex-1 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? <><Loader2 className="animate-spin" size={18} /> Saving...</> : 'Add Contact'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>

      {/* Contact Detail Modal */}
      <AnimatePresence>{isDetailOpen && selectedContact && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={() => setIsDetailOpen(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-glass border-glow rounded-2xl p-6 w-full max-w-lg card-glow max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold text-white">Contact Details</h2><button onClick={() => setIsDetailOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button></div>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full ${selectedContact.isExternal ? 'bg-cyan-600' : 'gradient-bg'} flex items-center justify-center text-white font-bold text-2xl`}>
                  {selectedContact.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold text-white">{selectedContact.name}</h3>
                    {selectedContact.isFavorite && <Star className="text-yellow-400 fill-yellow-400" size={18} />}
                    {selectedContact.isExternal && <span className="text-xs px-2 py-0.5 bg-cyan-500/20 rounded text-cyan-400">JSONPlaceholder</span>}
                  </div>
                  <p className="text-gray-400">{selectedContact.role} at {selectedContact.company}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {selectedContact.email && <button onClick={() => handleSendEmail(selectedContact.email)} className="flex flex-col items-center gap-2 p-4 bg-violet-500/20 rounded-lg hover:bg-violet-500/30 transition-colors"><Mail className="text-violet-400" size={24} /><span className="text-white text-sm">Email</span><span className="text-gray-400 text-xs truncate w-full text-center">{selectedContact.email}</span></button>}
                {selectedContact.linkedin && <button onClick={() => handleOpenLinkedIn(selectedContact.linkedin)} className="flex flex-col items-center gap-2 p-4 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors"><Linkedin className="text-blue-400" size={24} /><span className="text-white text-sm">LinkedIn</span><span className="text-gray-400 text-xs">Open</span></button>}
                {selectedContact.phone && <button onClick={() => handleCall(selectedContact.phone)} className="flex flex-col items-center gap-2 p-4 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition-colors"><Phone className="text-green-400" size={24} /><span className="text-white text-sm">Call</span><span className="text-gray-400 text-xs">{selectedContact.phone}</span></button>}
              </div>
              {selectedContact.tags && selectedContact.tags.length > 0 && <div><h4 className="text-gray-400 text-sm mb-2">Tags</h4><div className="flex flex-wrap gap-2">{selectedContact.tags.map((tag) => (<span key={tag} className="px-3 py-1 bg-violet-500/20 rounded-lg text-violet-300 text-sm">{tag}</span>))}</div></div>}
              {selectedContact.notes && <div><h4 className="text-gray-400 text-sm mb-2">Notes</h4><p className="text-white bg-glass p-3 rounded-lg">{selectedContact.notes}</p></div>}
              {selectedContact.interactionHistory && selectedContact.interactionHistory.length > 0 && <div><h4 className="text-gray-400 text-sm mb-2">Interaction History</h4><div className="space-y-2">{selectedContact.interactionHistory.map((interaction, index) => (<div key={index} className="flex items-center gap-3 p-3 bg-glass rounded-lg"><div className="w-2 h-2 rounded-full bg-violet-500" /><div className="flex-1"><p className="text-white text-sm">{interaction.action}</p><p className="text-gray-500 text-xs">{interaction.date}</p></div></div>))}</div></div>}
              {!selectedContact.isExternal && (<div><h4 className="text-gray-400 text-sm mb-2">Log New Interaction</h4><div className="grid grid-cols-2 gap-2">
                <button onClick={() => addInteraction(selectedContact.id, 'Sent email')} className="p-2 bg-violet-500/20 rounded-lg text-violet-400 text-sm hover:bg-violet-500/30 transition-colors flex items-center justify-center gap-2"><Send size={14} /> Emailed</button>
                <button onClick={() => addInteraction(selectedContact.id, 'Had a call')} className="p-2 bg-green-500/20 rounded-lg text-green-400 text-sm hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2"><Phone size={14} /> Called</button>
                <button onClick={() => addInteraction(selectedContact.id, 'Had a meeting')} className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400 text-sm hover:bg-cyan-500/30 transition-colors flex items-center justify-center gap-2"><Users size={14} /> Met</button>
                <button onClick={() => addInteraction(selectedContact.id, 'Connected on LinkedIn')} className="p-2 bg-blue-500/20 rounded-lg text-blue-400 text-sm hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2"><Linkedin size={14} /> LinkedIn</button>
              </div></div>)}
              <div className="flex gap-3 pt-2">
                {!selectedContact.isExternal && <button onClick={() => handleEditContact(selectedContact)} className="btn-secondary flex-1 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2"><Edit2 size={18} /> Edit</button>}
                <button onClick={() => handleDeleteContact(selectedContact.id)} className="flex-1 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 transition-colors"><Trash2 size={18} /> Delete</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>

      {/* Edit Contact Modal */}
      <AnimatePresence>{isEditModalOpen && editContact && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-glass border-glow rounded-2xl p-6 w-full max-w-lg card-glow max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6"><h2 className="text-xl font-bold text-white">Edit Contact</h2><button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button></div>
            <div className="space-y-4">
              <div><label className="text-gray-400 text-sm block mb-2">Name *</label><input type="text" value={editContact.name} onChange={(e) => setEditContact({ ...editContact, name: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-gray-400 text-sm block mb-2">Role</label><input type="text" value={editContact.role} onChange={(e) => setEditContact({ ...editContact, role: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" /></div>
                <div><label className="text-gray-400 text-sm block mb-2">Company</label><input type="text" value={editContact.company} onChange={(e) => setEditContact({ ...editContact, company: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" /></div>
              </div>
              <div><label className="text-gray-400 text-sm block mb-2">Email</label><input type="email" value={editContact.email} onChange={(e) => setEditContact({ ...editContact, email: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" /></div>
              <div><label className="text-gray-400 text-sm block mb-2">Phone</label><input type="tel" value={editContact.phone} onChange={(e) => setEditContact({ ...editContact, phone: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" /></div>
              <div><label className="text-gray-400 text-sm block mb-2">LinkedIn</label><input type="url" value={editContact.linkedin} onChange={(e) => setEditContact({ ...editContact, linkedin: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" /></div>
              <div><label className="text-gray-400 text-sm block mb-2">Tags</label><input type="text" value={editContact.tagsStr} onChange={(e) => setEditContact({ ...editContact, tagsStr: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white" /></div>
              <div><label className="text-gray-400 text-sm block mb-2">Notes</label><textarea value={editContact.notes} onChange={(e) => setEditContact({ ...editContact, notes: e.target.value })} className="input-field w-full px-4 py-3 rounded-lg text-white resize-none" rows={3} /></div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsEditModalOpen(false)} className="btn-secondary flex-1 py-3 rounded-lg text-white font-medium">Cancel</button>
                <button onClick={handleSaveEdit} disabled={saving} className="btn-primary flex-1 py-3 rounded-lg text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50">{saving ? <><Loader2 className="animate-spin" size={18} /> Saving...</> : 'Save Changes'}</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>
    </motion.div>
  );
}
