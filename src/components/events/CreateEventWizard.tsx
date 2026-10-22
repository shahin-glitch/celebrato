import React, { useState, useEffect } from 'react';
import type { EventPlan, OccasionType, CurrencyType, EventPreferences } from '../../types';
import { AIGeneratorService } from '../../services/aiGenerator';
import { StorageService } from '../../services/storage';
import { generateId } from '../../utils/helpers';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  HeartHandshake,
  Cake,
  GraduationCap,
  Music,
  PartyPopper,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CreateEventWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (newEvent: EventPlan) => void;
}

export const CreateEventWizard: React.FC<CreateEventWizardProps> = ({
  isOpen,
  onClose,
  onEventCreated,
}) => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form State
  const [occasion, setOccasion] = useState<OccasionType>('college_fest');
  const [name, setName] = useState('Campus Cultural Night 2026');
  const [date, setDate] = useState('2026-11-20');
  const [startTime, setStartTime] = useState('17:30');
  const [endTime, setEndTime] = useState('22:30');
  const [location, setLocation] = useState('Mangalore, Karnataka');
  const [venueStatus, setVenueStatus] = useState<EventPlan['venueStatus']>('booked');

  const [guestCount, setGuestCount] = useState<number>(250);
  const [indoorOutdoor, setIndoorOutdoor] = useState<'indoor' | 'outdoor' | 'hybrid'>('hybrid');
  const [atmosphere, setAtmosphere] = useState<'formal' | 'casual' | 'traditional' | 'modern' | 'mixed'>('casual');

  const [budgetTotal, setBudgetTotal] = useState<number>(100000);
  const [currency, setCurrency] = useState<CurrencyType>('INR');
  const [budgetPriority, setBudgetPriority] = useState<EventPreferences['budgetPriority']>('balanced_value');

  const [themePreference, setThemePreference] = useState('Electric Sunset Carnival');
  const [foodPreferences, setFoodPreferences] = useState('Street Food Stalls, Live Chaat, Beverages');
  const [dietaryRequirements, setDietaryRequirements] = useState('Vegetarian separated, nut-free labels');
  const [mustHaves, setMustHaves] = useState('Line-array stage sound, festival light canopy');
  const [avoid, setAvoid] = useState('Long formal speeches, expensive sit-down banquet tables');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const occasionOptions: { id: OccasionType; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
    { id: 'college_fest', label: 'College Fest', icon: GraduationCap, desc: 'Student cultural nights & tech fests' },
    { id: 'wedding', label: 'Wedding', icon: HeartHandshake, desc: 'Multi-day nuptials & royal celebrations' },
    { id: 'birthday', label: 'Birthday', icon: Cake, desc: 'Milestone jubilee & intimate birthday gatherings' },
    { id: 'engagement', label: 'Engagement', icon: Sparkles, desc: 'Ring ceremonies & family banquets' },
    { id: 'anniversary', label: 'Anniversary', icon: PartyPopper, desc: 'Golden & silver jubilee milestones' },
    { id: 'community', label: 'Community Event', icon: Music, desc: 'Local festivals & cultural gatherings' },
  ];

  const handleCreate = async () => {
    setIsGenerating(true);
    const apiKey = StorageService.getApiKey();

    try {
      const generated = await AIGeneratorService.generateEventPlan(
        {
          occasion,
          name,
          date,
          startTime,
          location,
          guestCount,
          budgetTotal,
          currency,
          budgetPriority,
          themePreference,
          atmosphere,
          indoorOutdoor,
          foodPreferences: foodPreferences.split(',').map((s) => s.trim()).filter(Boolean),
          dietaryRequirements: dietaryRequirements.split(',').map((s) => s.trim()).filter(Boolean),
          mustHaves: mustHaves.split(',').map((s) => s.trim()).filter(Boolean),
          avoid: avoid.split(',').map((s) => s.trim()).filter(Boolean),
        },
        apiKey
      );

      const newPlan: EventPlan = {
        id: generateId('event'),
        name,
        occasion,
        date,
        startTime,
        endTime,
        location,
        venueStatus,
        guestCount,
        coverColor: '#FDF189',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        budget: {
          currency,
          total: budgetTotal,
          originalTotal: budgetTotal,
          isRescued: false,
          categories: generated.categories,
        },
        preferences: {
          theme: themePreference,
          colorPalette: generated.concept.colorPalette,
          foodPreferences: foodPreferences.split(',').map((s) => s.trim()),
          dietaryRequirements: dietaryRequirements.split(',').map((s) => s.trim()),
          atmosphere,
          indoorOutdoor,
          budgetPriority,
          mustHaves: mustHaves.split(',').map((s) => s.trim()),
          avoid: avoid.split(',').map((s) => s.trim()),
        },
        concept: generated.concept,
        timeline: generated.timeline,
        vendorChecklist: generated.vendorChecklist,
        recommendations: generated.recommendations,
        guests: [
          {
            id: 'gst-1',
            name: 'Organizing Committee Lead',
            group: 'Core Team',
            rsvpStatus: 'attending',
            accompanyingGuests: 2,
            dietary: 'Standard',
          },
        ],
      };

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      onEventCreated(newPlan);
      onClose();
    } catch (err) {
      console.error('Error generating plan:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-wizard-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="bg-[#FCFBF7] w-full max-w-2xl rounded-[24px] neo-border neo-shadow-lg overflow-hidden flex flex-col my-8">
        {/* Header with Step Indicator */}
        <div className="bg-[#C2F2B0] p-5 neo-border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white neo-border neo-shadow-sm flex items-center justify-center font-mono-code font-bold text-sm text-[#171717]">
              {step}/6
            </div>
            <div>
              <h2 id="create-wizard-title" className="font-mono-code text-lg font-bold text-[#171717]">
                Create Celebration Blueprint
              </h2>
              <p className="text-xs text-[#171717]/80">
                Step {step}:{' '}
                {step === 1 && 'Select Occasion'}
                {step === 2 && 'Basic Details'}
                {step === 3 && 'Audience & Atmosphere'}
                {step === 4 && 'Budget & Priority'}
                {step === 5 && 'Personalization & Theme'}
                {step === 6 && 'Review & Generate'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close celebration wizard"
            className="p-2 hover:bg-black/10 rounded-full transition-colors cursor-pointer text-[#171717]"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Wizard Steps Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh] text-xs">
          {/* STEP 1: OCCASION */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-mono-code text-base font-bold text-[#171717]">
                What occasion are we celebrating?
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {occasionOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = occasion === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      aria-label={`Select ${opt.label}`}
                      onClick={() => setOccasion(opt.id)}
                      className={`p-4 rounded-xl neo-border flex flex-col items-center text-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FDF189] neo-shadow-sm scale-102 border-[#171717]'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-6 h-6 stroke-[2]" />
                      <span className="font-bold text-xs text-[#171717]">
                        {opt.label}
                      </span>
                      <span className="text-[10px] text-[#565656]">
                        {opt.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: BASIC DETAILS */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-mono-code text-base font-bold text-[#171717]">
                Name, Date & Location
              </h3>
              <div>
                <label htmlFor="wizard-event-name" className="font-bold text-[#171717] block mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  id="wizard-event-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white p-2.5 rounded-lg neo-border focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="wizard-event-date" className="font-bold text-[#171717] block mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    id="wizard-event-date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white p-2 rounded-lg neo-border focus:outline-none font-mono-code focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label htmlFor="wizard-start-time" className="font-bold text-[#171717] block mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    id="wizard-start-time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-white p-2 rounded-lg neo-border focus:outline-none font-mono-code focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label htmlFor="wizard-end-time" className="font-bold text-[#171717] block mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    id="wizard-end-time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-white p-2 rounded-lg neo-border focus:outline-none font-mono-code focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="wizard-location" className="font-bold text-[#171717] block mb-1">
                    City / Venue Location
                  </label>
                  <input
                    type="text"
                    id="wizard-location"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-white p-2.5 rounded-lg neo-border focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label htmlFor="wizard-venue-status" className="font-bold text-[#171717] block mb-1">
                    Venue Booking Status
                  </label>
                  <select
                    id="wizard-venue-status"
                    value={venueStatus}
                    onChange={(e) => setVenueStatus(e.target.value as EventPlan['venueStatus'])}
                    className="w-full bg-white p-2.5 rounded-lg neo-border focus:outline-none font-mono-code"
                  >
                    <option value="booked">Already Booked</option>
                    <option value="not_booked">Not Booked Yet</option>
                    <option value="undecided">Undecided / Scouting</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: AUDIENCE & SETTING */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-mono-code text-base font-bold text-[#171717]">
                Audience & Atmosphere
              </h3>

              <div>
                <label htmlFor="wizard-guest-count" className="font-bold text-[#171717] block mb-1">
                  Expected Guest Headcount
                </label>
                <input
                  type="number"
                  id="wizard-guest-count"
                  min="5"
                  max="10000"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full bg-white p-2.5 rounded-lg neo-border focus:outline-none font-mono-code font-bold text-sm focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="font-bold text-[#171717] block mb-1">
                  Physical Setting
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['indoor', 'outdoor', 'hybrid'] as const).map((setting) => (
                    <button
                      key={setting}
                      type="button"
                      aria-label={`Setting: ${setting}`}
                      onClick={() => setIndoorOutdoor(setting)}
                      className={`p-3 rounded-lg neo-border font-mono-code text-xs font-bold capitalize cursor-pointer ${
                        indoorOutdoor === setting
                          ? 'bg-[#C2F2B0] text-[#171717] neo-shadow-sm'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {setting}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-[#171717] block mb-1">
                  Desired Atmosphere
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(['formal', 'casual', 'traditional', 'modern', 'mixed'] as const).map((atm) => (
                    <button
                      key={atm}
                      type="button"
                      aria-label={`Atmosphere: ${atm}`}
                      onClick={() => setAtmosphere(atm)}
                      className={`p-2 rounded-lg neo-border font-mono-code text-xs font-bold capitalize cursor-pointer ${
                        atmosphere === atm
                          ? 'bg-[#FDF189] text-[#171717] neo-shadow-sm'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {atm}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: BUDGET */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-mono-code text-base font-bold text-[#171717]">
                Budget & Priorities
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label htmlFor="wizard-budget-total" className="font-bold text-[#171717] block mb-1">
                    Total Target Budget
                  </label>
                  <input
                    type="number"
                    id="wizard-budget-total"
                    min="1000"
                    step="5000"
                    value={budgetTotal}
                    onChange={(e) => setBudgetTotal(Math.max(1000, Number(e.target.value)))}
                    className="w-full bg-white p-2.5 rounded-lg neo-border focus:outline-none font-mono-code font-bold text-base focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label htmlFor="wizard-currency" className="font-bold text-[#171717] block mb-1">
                    Currency
                  </label>
                  <select
                    id="wizard-currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyType)}
                    className="w-full bg-white p-2.5 rounded-lg neo-border focus:outline-none font-mono-code font-bold"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#171717] block mb-1">
                  Budget Priority Strategy
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'lowest_cost', label: 'Lowest Cost', desc: 'Maximizes thrift & DIY hacks' },
                    { id: 'balanced_value', label: 'Balanced Value', desc: 'Equal weight to experience & cost' },
                    { id: 'premium_experience', label: 'Premium Experience', desc: 'Uncompromised luxury & VIP touch' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      aria-label={`Priority: ${p.label}`}
                      onClick={() => setBudgetPriority(p.id as EventPreferences['budgetPriority'])}
                      className={`p-3 rounded-xl neo-border text-left cursor-pointer transition-all ${
                        budgetPriority === p.id
                          ? 'bg-[#F4BCE8] neo-shadow-sm border-[#171717]'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-mono-code font-bold text-xs text-[#171717]">
                        {p.label}
                      </div>
                      <p className="text-[10px] text-[#565656] mt-0.5">{p.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: PERSONALIZATION */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="font-mono-code text-base font-bold text-[#171717]">
                Personalization & Highlights
              </h3>

              <div>
                <label htmlFor="wizard-theme-preference" className="font-bold text-[#171717] block mb-1">
                  Preferred Theme or Aesthetic Concept
                </label>
                <input
                  type="text"
                  id="wizard-theme-preference"
                  value={themePreference}
                  onChange={(e) => setThemePreference(e.target.value)}
                  placeholder="e.g. Electric Sunset Carnival, Minimalist Sage & Ivory"
                  className="w-full bg-white p-2.5 rounded-lg neo-border focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="wizard-food-preferences" className="font-bold text-[#171717] block mb-1">
                    Food Preferences
                  </label>
                  <input
                    type="text"
                    id="wizard-food-preferences"
                    value={foodPreferences}
                    onChange={(e) => setFoodPreferences(e.target.value)}
                    placeholder="e.g. Street food stalls, Dosa counter"
                    className="w-full bg-white p-2 rounded-lg neo-border focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label htmlFor="wizard-dietary-requirements" className="font-bold text-[#171717] block mb-1">
                    Dietary Requirements
                  </label>
                  <input
                    type="text"
                    id="wizard-dietary-requirements"
                    value={dietaryRequirements}
                    onChange={(e) => setDietaryRequirements(e.target.value)}
                    placeholder="e.g. Strict veg separation, Jain options"
                    className="w-full bg-white p-2 rounded-lg neo-border focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="wizard-must-haves" className="font-bold text-[#171717] block mb-1">
                    Must-Have Activities
                  </label>
                  <input
                    type="text"
                    id="wizard-must-haves"
                    value={mustHaves}
                    onChange={(e) => setMustHaves(e.target.value)}
                    placeholder="e.g. Band performance, photo wall"
                    className="w-full bg-white p-2 rounded-lg neo-border focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label htmlFor="wizard-avoid" className="font-bold text-[#171717] block mb-1">
                    Things to Avoid
                  </label>
                  <input
                    type="text"
                    id="wizard-avoid"
                    value={avoid}
                    onChange={(e) => setAvoid(e.target.value)}
                    placeholder="e.g. Long speeches, plastic cutlery"
                    className="w-full bg-white p-2 rounded-lg neo-border focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: REVIEW */}
          {step === 6 && (
            <div className="space-y-4">
              <h3 className="font-mono-code text-base font-bold text-[#171717]">
                Ready to Generate Blueprint
              </h3>

              <div className="p-4 bg-white rounded-xl neo-border space-y-2 font-mono-code text-xs">
                <div className="flex justify-between">
                  <span className="text-[#565656]">Event:</span>
                  <span className="font-bold">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#565656]">Occasion:</span>
                  <span className="font-bold capitalize">{occasion.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#565656]">Date & City:</span>
                  <span className="font-bold">{date} • {location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#565656]">Guests:</span>
                  <span className="font-bold">{guestCount} people</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#565656]">Budget:</span>
                  <span className="font-bold">{currency} {budgetTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#565656]">Theme:</span>
                  <span className="font-bold">{themePreference}</span>
                </div>
              </div>

              <div className="p-3 bg-[#FDF189] rounded-xl neo-border flex items-center gap-2 text-xs text-[#171717]">
                <Sparkles className="w-4 h-4 shrink-0 text-[#171717]" />
                <span>
                  Celebrato will now compute a balanced budget allocation, timeline milestones, vendor checklist, and recommendations.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-white neo-border-t flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1 px-4 py-2 text-xs font-mono-code font-bold text-[#565656] hover:text-black cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div></div>
          )}

          {step < 6 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#171717] text-white rounded-xl neo-shadow-sm font-mono-code text-xs font-bold hover:bg-[#2b2b2b] cursor-pointer"
            >
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#171717] text-[#C2F2B0] rounded-xl neo-shadow-sm font-mono-code text-xs font-bold hover:bg-[#2b2b2b] cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-[#FFD95A]" />
              <span>{isGenerating ? 'Synthesizing Blueprint...' : 'Generate AI Plan'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
