import React, { useState, useEffect } from 'react';
import type { EventPlan, Guest } from '../../types';
import { generateId } from '../../utils/helpers';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Trash2,
  Download,
  Utensils,
  X,
} from 'lucide-react';

interface GuestManagerProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
}

export const GuestManager: React.FC<GuestManagerProps> = ({
  event,
  onUpdateEvent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [rsvpFilter, setRsvpFilter] = useState<'all' | 'attending' | 'pending' | 'declined'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New guest form state
  const [name, setName] = useState('');
  const [group, setGroup] = useState('General Attendees');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [accompanying, setAccompanying] = useState<number>(0);
  const [rsvpStatus, setRsvpStatus] = useState<Guest['rsvpStatus']>('attending');
  const [dietary, setDietary] = useState('No restrictions');
  const [tableGroup, setTableGroup] = useState('');

  useEffect(() => {
    if (!showAddModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal]);

  const attendingCount = event.guests
    .filter((g) => g.rsvpStatus === 'attending')
    .reduce((sum, g) => sum + 1 + (g.accompanyingGuests || 0), 0);

  const pendingCount = event.guests
    .filter((g) => g.rsvpStatus === 'pending')
    .reduce((sum, g) => sum + 1 + (g.accompanyingGuests || 0), 0);

  const declinedCount = event.guests
    .filter((g) => g.rsvpStatus === 'declined')
    .reduce((sum, g) => sum + 1 + (g.accompanyingGuests || 0), 0);

  const cateringCapacity = event.guestCount;
  const capacityPercent = Math.min(100, Math.round((attendingCount / cateringCapacity) * 100));

  const filteredGuests = event.guests.filter((g) => {
    if (rsvpFilter !== 'all' && g.rsvpStatus !== rsvpFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        g.name.toLowerCase().includes(q) ||
        g.group.toLowerCase().includes(q) ||
        (g.tableGroup && g.tableGroup.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newGuest: Guest = {
      id: generateId('gst'),
      name: name.trim(),
      group: group.trim() || 'General',
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      accompanyingGuests: accompanying,
      rsvpStatus,
      dietary: dietary.trim() || undefined,
      tableGroup: tableGroup.trim() || undefined,
    };

    onUpdateEvent({
      ...event,
      guests: [newGuest, ...event.guests],
    });

    setName('');
    setEmail('');
    setPhone('');
    setAccompanying(0);
    setShowAddModal(false);
  };

  const handleDeleteGuest = (id: string) => {
    onUpdateEvent({
      ...event,
      guests: event.guests.filter((g) => g.id !== id),
    });
  };

  const handleUpdateStatus = (id: string, status: Guest['rsvpStatus']) => {
    onUpdateEvent({
      ...event,
      guests: event.guests.map((g) => (g.id === id ? { ...g, rsvpStatus: status } : g)),
    });
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Group', 'RSVP Status', 'Accompanying', 'Dietary', 'Table/Notes', 'Phone', 'Email'];
    const rows = event.guests.map((g) => [
      `"${g.name.replace(/"/g, '""')}"`,
      `"${g.group}"`,
      g.rsvpStatus,
      g.accompanyingGuests,
      `"${g.dietary || ''}"`,
      `"${g.tableGroup || ''}"`,
      `"${g.phone || ''}"`,
      `"${g.email || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${event.name.replace(/\s+/g, '_')}_GuestList.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pt-2 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 bg-white rounded-2xl neo-border neo-shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#C2F2B0] neo-border flex items-center justify-center text-[#171717]">
              <Users className="w-4 h-4 stroke-[2.2]" />
            </span>
            <h2 className="font-mono-code text-xl font-bold text-[#171717]">
              Guest List & RSVP Manager
            </h2>
          </div>
          <p className="text-xs text-[#565656] mt-1">
            Manage invitations, seating clusters, and dietary requirements for {event.name}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            aria-label="Export guest list as CSV"
            className="flex items-center gap-1.5 px-3 py-2 bg-white text-[#171717] rounded-xl neo-border font-mono-code text-xs font-bold hover:bg-black/5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            aria-label="Add Guest"
            className="flex items-center gap-1.5 px-4 py-2 bg-[#171717] text-white rounded-xl neo-shadow-sm font-mono-code text-xs font-bold hover:bg-[#2b2b2b] cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Guest</span>
          </button>
        </div>
      </div>

      {/* RSVP Stats and Catering Meter */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono-code">
        <div className="bg-[#C2F2B0] p-4 rounded-xl neo-border flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-[#171717] shrink-0" />
          <div>
            <div className="text-xl font-bold text-[#171717]">{attendingCount}</div>
            <div className="text-[11px] text-[#171717]/80">Attending RSVPs</div>
          </div>
        </div>

        <div className="bg-[#FDF189] p-4 rounded-xl neo-border flex items-center gap-3">
          <Clock className="w-6 h-6 text-[#171717] shrink-0" />
          <div>
            <div className="text-xl font-bold text-[#171717]">{pendingCount}</div>
            <div className="text-[11px] text-[#171717]/80">Pending Acknowledgment</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl neo-border flex items-center gap-3">
          <XCircle className="w-6 h-6 text-[#565656] shrink-0" />
          <div>
            <div className="text-xl font-bold text-[#171717]">{declinedCount}</div>
            <div className="text-[11px] text-[#565656]">Declined</div>
          </div>
        </div>

        <div className="bg-[#FCFBF7] p-4 rounded-xl neo-border flex flex-col justify-center">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-[#565656]">Catering Cap</span>
            <span className="font-bold">
              {attendingCount} / {cateringCapacity}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={capacityPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Catering capacity usage: ${capacityPercent}%`}
            className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden"
          >
            <div
              className={`h-full rounded-full ${
                capacityPercent > 90 ? 'bg-amber-500' : 'bg-[#171717]'
              }`}
              style={{ width: `${capacityPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#565656] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, group, or table..."
            aria-label="Search guests by name, group, or table"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white pl-9 pr-3 py-2 rounded-xl neo-border text-xs focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'attending', 'pending', 'declined'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setRsvpFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-mono-code text-xs font-bold capitalize transition-colors cursor-pointer ${
                rsvpFilter === st
                  ? 'bg-[#171717] text-white neo-shadow-sm'
                  : 'bg-white text-[#565656] neo-border hover:bg-black/5'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Guest Cards / Table */}
      <div className="bg-white rounded-2xl neo-border neo-shadow-sm overflow-hidden">
        <div className="divide-y divide-black/5">
          {filteredGuests.map((guest) => (
            <div
              key={guest.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-black/[0.01] transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FDF189] neo-border flex items-center justify-center font-mono-code font-bold text-xs shrink-0 mt-0.5">
                  {guest.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#171717]">
                      {guest.name}
                    </span>
                    {guest.accompanyingGuests > 0 && (
                      <span className="font-mono-code text-[10px] bg-black/5 px-2 py-0.5 rounded-full text-[#565656]">
                        +{guest.accompanyingGuests} guests
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[#565656] flex-wrap">
                    <span className="bg-black/5 px-2 py-0.5 rounded text-[#171717] font-mono-code text-[11px]">
                      {guest.group}
                    </span>
                    {guest.tableGroup && (
                      <span>Table: <strong>{guest.tableGroup}</strong></span>
                    )}
                    {guest.dietary && (
                      <span className="flex items-center gap-1 text-emerald-800">
                        <Utensils className="w-3 h-3" /> {guest.dietary}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <select
                  value={guest.rsvpStatus}
                  aria-label={`RSVP status for ${guest.name}`}
                  onChange={(e) =>
                    handleUpdateStatus(guest.id, e.target.value as Guest['rsvpStatus'])
                  }
                  className={`font-mono-code text-xs font-bold px-2.5 py-1 rounded-lg neo-border focus:outline-none cursor-pointer ${
                    guest.rsvpStatus === 'attending'
                      ? 'bg-[#C2F2B0] text-[#171717]'
                      : guest.rsvpStatus === 'pending'
                      ? 'bg-[#FDF189] text-[#171717]'
                      : 'bg-gray-100 text-[#565656]'
                  }`}
                >
                  <option value="attending">Attending</option>
                  <option value="pending">Pending</option>
                  <option value="declined">Declined</option>
                </select>

                <button
                  onClick={() => handleDeleteGuest(guest.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 cursor-pointer"
                  title="Remove Guest"
                  aria-label={`Delete guest ${guest.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Guest Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-guest-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-[#FCFBF7] w-full max-w-lg rounded-2xl neo-border neo-shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/10">
              <h3 id="add-guest-modal-title" className="font-mono-code text-lg font-bold text-[#171717]">
                Add Guest / Group
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Close add guest modal"
                className="p-1 hover:bg-black/10 rounded-full cursor-pointer text-[#171717]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddGuest} className="space-y-4 text-xs">
              <div>
                <label htmlFor="guest-name" className="font-bold text-[#171717] block mb-1">
                  Full Name or Group Title
                </label>
                <input
                  type="text"
                  id="guest-name"
                  required
                  placeholder="e.g. Maya Krishnan & Family"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white p-2.5 rounded-lg neo-border focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="guest-group" className="font-bold text-[#171717] block mb-1">
                    Group / Affiliation
                  </label>
                  <input
                    type="text"
                    id="guest-group"
                    value={group}
                    onChange={(e) => setGroup(e.target.value)}
                    placeholder="e.g. VIP Performers"
                    className="w-full bg-white p-2 rounded-lg neo-border focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label htmlFor="guest-accompanying" className="font-bold text-[#171717] block mb-1">
                    Accompanying (+guests)
                  </label>
                  <input
                    type="number"
                    id="guest-accompanying"
                    min="0"
                    value={accompanying}
                    onChange={(e) => setAccompanying(Number(e.target.value))}
                    className="w-full bg-white p-2 rounded-lg neo-border focus:outline-none font-mono-code focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="guest-rsvp-status" className="font-bold text-[#171717] block mb-1">
                  RSVP Status
                </label>
                <select
                  id="guest-rsvp-status"
                  value={rsvpStatus}
                  onChange={(e) => setRsvpStatus(e.target.value as Guest['rsvpStatus'])}
                  className="w-full bg-white p-2 rounded-lg neo-border focus:outline-none font-mono-code text-xs font-bold"
                >
                  <option value="attending">Attending (Confirmed)</option>
                  <option value="pending">Pending (Awaiting Reply)</option>
                  <option value="declined">Declined</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="guest-dietary" className="font-bold text-[#171717] block mb-1">
                    Dietary Requirements
                  </label>
                  <input
                    type="text"
                    id="guest-dietary"
                    value={dietary}
                    onChange={(e) => setDietary(e.target.value)}
                    className="w-full bg-white p-2 rounded-lg neo-border focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label htmlFor="guest-table" className="font-bold text-[#171717] block mb-1">
                    Seating / Table
                  </label>
                  <input
                    type="text"
                    id="guest-table"
                    value={tableGroup}
                    onChange={(e) => setTableGroup(e.target.value)}
                    placeholder="e.g. Front Row 2"
                    className="w-full bg-white p-2 rounded-lg neo-border focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-mono-code text-xs font-bold text-[#565656] hover:text-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#171717] text-white rounded-lg font-mono-code text-xs font-bold hover:bg-[#2b2b2b] cursor-pointer"
                >
                  Save Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
