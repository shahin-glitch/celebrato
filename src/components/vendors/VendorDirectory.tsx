import React, { useState } from 'react';
import type { EventPlan, VendorDirectoryItem, VendorChecklistItem } from '../../types';
import { SAMPLE_VENDORS } from '../../services/sampleData';
import { generateId } from '../../utils/helpers';
import {
  Store,
  Search,
  Plus,
  Star,
  MapPin,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface VendorDirectoryProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
}

export const VendorDirectory: React.FC<VendorDirectoryProps> = ({
  event,
  onUpdateEvent,
}) => {
  const [activeTab, setActiveTab] = useState<'directory' | 'saved'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPrice, setSelectedPrice] = useState<string>('all');

  const categories = ['all', 'Sound & Audio', 'Catering', 'Decor & Floristry', 'Decor & Lighting', 'Bakery & Sweets', 'Photography & Film', 'Invitations & Favors'];

  const filteredVendors = SAMPLE_VENDORS.filter((v) => {
    if (selectedCategory !== 'all' && v.category !== selectedCategory) return false;
    if (selectedPrice !== 'all' && v.priceLevel !== selectedPrice) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleAddVendorToEvent = (vendor: VendorDirectoryItem) => {
    // Check if already in vendor checklist
    const exists = event.vendorChecklist.some(
      (vc) => vc.assignedVendorName === vendor.name
    );
    if (exists) return;

    const newChecklistItem: VendorChecklistItem = {
      id: generateId('vc'),
      category: vendor.category,
      reason: `Partnered service from directory: ${vendor.name}`,
      estimatedMin: 10000,
      estimatedMax: 20000,
      bookingDeadline: event.date,
      questions: [
        'Can you confirm team availability for our event date?',
        'What is your advance token deposit requirement?',
      ],
      status: 'shortlisted',
      assignedVendorName: vendor.name,
      contactInfo: `${vendor.contactEmail} | ${vendor.contactPhone}`,
    };

    onUpdateEvent({
      ...event,
      vendorChecklist: [...event.vendorChecklist, newChecklistItem],
    });
    setActiveTab('saved');
  };

  const handleUpdateChecklistStatus = (
    id: string,
    newStatus: VendorChecklistItem['status']
  ) => {
    const updated = event.vendorChecklist.map((vc) =>
      vc.id === id ? { ...vc, status: newStatus } : vc
    );
    onUpdateEvent({ ...event, vendorChecklist: updated });
  };

  return (
    <div className="space-y-6 pt-2 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 bg-white rounded-2xl neo-border neo-shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#FDF189] neo-border flex items-center justify-center text-[#171717]">
              <Store className="w-4 h-4 stroke-[2.2]" />
            </span>
            <h2 className="font-mono-code text-xl font-bold text-[#171717]">
              Vendor Discovery & Checklist
            </h2>
            <span className="font-mono-code text-[10px] font-bold bg-black/5 text-[#565656] px-2 py-0.5 rounded-full">
              Demo Partner Directory
            </span>
          </div>
          <p className="text-xs text-[#565656] mt-1">
            Browse verified local vendors for {event.location} or manage your event's booked vendors.
          </p>
        </div>

        {/* Tab switch between directory and saved */}
        <div className="flex items-center gap-2 bg-[#FCFBF7] p-1 rounded-xl neo-border">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3 py-1.5 rounded-lg font-mono-code text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-[#171717] text-white'
                : 'text-[#565656] hover:text-black'
            }`}
          >
            Directory ({SAMPLE_VENDORS.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3 py-1.5 rounded-lg font-mono-code text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-[#171717] text-white'
                : 'text-[#565656] hover:text-black'
            }`}
          >
            Saved to Event ({event.vendorChecklist.length})
          </button>
        </div>
      </div>

      {/* Directory Tab View */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-[#565656] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search vendor name, category, or city..."
                aria-label="Search vendor name, category, or city"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white pl-9 pr-3 py-2 rounded-xl neo-border text-xs focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <select
                value={selectedCategory}
                aria-label="Filter vendors by category"
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white px-3 py-2 rounded-xl neo-border text-xs font-mono-code font-bold focus:outline-none focus:ring-1 focus:ring-black"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'all' ? 'All Categories' : c}
                  </option>
                ))}
              </select>

              <select
                value={selectedPrice}
                aria-label="Filter vendors by price level"
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="bg-white px-3 py-2 rounded-xl neo-border text-xs font-mono-code font-bold focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="all">Any Price</option>
                <option value="$">$ (Budget)</option>
                <option value="$$">$$ (Moderate)</option>
                <option value="$$$">$$$ (Premium)</option>
                <option value="$$$$">$$$$ (Luxury)</option>
              </select>
            </div>
          </div>

          {/* Vendors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVendors.map((vendor) => {
              const isSaved = event.vendorChecklist.some(
                (vc) => vc.assignedVendorName === vendor.name
              );

              return (
                <div
                  key={vendor.id}
                  className="bg-white p-5 rounded-2xl neo-border neo-shadow-sm flex flex-col justify-between space-y-3 hover:-translate-y-0.5 transition-transform"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-[#171717]">
                            {vendor.name}
                          </h4>
                          {vendor.verifiedPartner && (
                            <span title="Verified Sample Partner">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            </span>
                          )}
                        </div>
                        <span className="font-mono-code text-[11px] text-[#565656]">
                          {vendor.category} • {vendor.priceLevel}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 bg-[#FDF189] px-2 py-0.5 rounded-lg border border-[#171717] font-mono-code text-xs font-bold">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{vendor.rating}</span>
                        <span className="text-[10px] text-[#565656]">
                          ({vendor.reviewsCount})
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#565656] mt-2 leading-relaxed">
                      {vendor.description}
                    </p>

                    <div className="flex items-center gap-1 text-[11px] text-[#565656] mt-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{vendor.location}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {vendor.services.map((s, idx) => (
                        <span
                          key={idx}
                          className="bg-black/5 text-[#171717] text-[10px] font-mono-code px-2 py-0.5 rounded"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-black/5 flex items-center justify-between">
                    <span className="font-mono-code text-[10px] text-[#565656]">
                      {vendor.contactEmail}
                    </span>
                    <button
                      onClick={() => handleAddVendorToEvent(vendor)}
                      disabled={isSaved}
                      aria-label={isSaved ? `${vendor.name} is added to checklist` : `Add ${vendor.name} to event`}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-mono-code text-xs font-bold transition-all cursor-pointer ${
                        isSaved
                          ? 'bg-[#C2F2B0] text-[#171717] border border-[#171717]'
                          : 'bg-[#171717] text-white hover:bg-[#2b2b2b]'
                      }`}
                    >
                      {isSaved ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Saved</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Event</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Saved Vendors Tab View */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {event.vendorChecklist.map((vc) => (
              <div
                key={vc.id}
                className="bg-white p-5 rounded-2xl neo-border neo-shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#171717]">
                    {vc.category}
                  </h4>
                  {/* Status Dropdown */}
                  <select
                    value={vc.status}
                    aria-label={`Status for ${vc.category}`}
                    onChange={(e) =>
                      handleUpdateChecklistStatus(vc.id, e.target.value as VendorChecklistItem['status'])
                    }
                    className="font-mono-code text-xs font-bold px-2 py-1 rounded-lg neo-border bg-[#FCFBF7] focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="researching">Researching</option>
                    <option value="contacted">Contacted</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="booked">Booked</option>
                  </select>
                </div>

                {vc.assignedVendorName ? (
                  <div className="p-3 bg-[#C2F2B0]/30 rounded-xl neo-border text-xs">
                    <span className="font-bold text-[#171717]">
                      {vc.assignedVendorName}
                    </span>
                    {vc.contactInfo && (
                      <p className="text-[11px] font-mono-code text-[#565656] mt-0.5">
                        {vc.contactInfo}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-[#565656]">
                    No specific vendor assigned yet. Explore directory to shortlist.
                  </p>
                )}

                <div className="flex items-center justify-between text-xs font-mono-code text-[#565656] pt-2 border-t border-black/5">
                  <span>
                    Est: {event.budget.currency} {vc.estimatedMin.toLocaleString()} -{' '}
                    {vc.estimatedMax.toLocaleString()}
                  </span>
                  <span>Deadline: {vc.bookingDeadline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
