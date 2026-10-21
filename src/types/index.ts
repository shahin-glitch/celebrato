export type OccasionType =
  | 'wedding'
  | 'engagement'
  | 'birthday'
  | 'anniversary'
  | 'college_fest'
  | 'community'
  | 'other';

export type CurrencyType = 'INR' | 'USD' | 'EUR';

export interface BudgetCategory {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  isProtected?: boolean; // Protect from cuts in Budget Rescue Mode
}

export interface EventBudget {
  currency: CurrencyType;
  total: number;
  originalTotal?: number;
  isRescued?: boolean;
  categories: BudgetCategory[];
}

export interface TimelineTask {
  id: string;
  title: string;
  dueDate: string;
  timeSlot?: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  completed: boolean;
  notes?: string;
}

export interface VendorChecklistItem {
  id: string;
  category: string;
  reason: string;
  estimatedMin: number;
  estimatedMax: number;
  bookingDeadline: string;
  questions: string[];
  status: 'not_started' | 'researching' | 'contacted' | 'shortlisted' | 'booked';
  assignedVendorName?: string;
  contactInfo?: string;
}

export interface EventRecommendation {
  id: string;
  title: string;
  description: string;
  estimatedSavings: number;
  type: 'low_cost' | 'premium_upgrade' | 'weather' | 'comfort' | 'cultural';
}

export interface Guest {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  group: string; // e.g. "College Council", "VIP", "Family", "Faculty", "Friends"
  rsvpStatus: 'attending' | 'pending' | 'declined';
  accompanyingGuests: number;
  dietary?: string;
  accessibilityNotes?: string;
  tableGroup?: string;
}

export interface EventPreferences {
  theme: string;
  colorPalette: string[];
  foodPreferences: string[];
  dietaryRequirements: string[];
  atmosphere: 'formal' | 'casual' | 'traditional' | 'modern' | 'mixed';
  indoorOutdoor: 'indoor' | 'outdoor' | 'hybrid';
  budgetPriority: 'lowest_cost' | 'balanced_value' | 'premium_experience';
  mustHaves: string[];
  avoid: string[];
  culturalPreferences?: string;
  accessibilityNeeds?: string;
}

export interface EventConcept {
  title: string;
  description: string;
  theme: string;
  colorPalette: string[];
  decorDirection: string;
  suggestedActivities: string[];
  menuDirection: string;
  reasoning: string;
  generatedBy: 'gemini' | 'deterministic';
}

export interface EventPlan {
  id: string;
  name: string;
  occasion: OccasionType;
  date: string;
  startTime: string;
  endTime?: string;
  location: string;
  venueStatus: 'booked' | 'not_booked' | 'undecided';
  guestCount: number;
  budget: EventBudget;
  preferences: EventPreferences;
  concept: EventConcept;
  timeline: TimelineTask[];
  vendorChecklist: VendorChecklistItem[];
  recommendations: EventRecommendation[];
  guests: Guest[];
  createdAt: string;
  updatedAt: string;
  coverColor?: string;
}

export interface VendorDirectoryItem {
  id: string;
  name: string;
  category: string;
  location: string;
  priceLevel: '$' | '$$' | '$$$' | '$$$$';
  rating: number;
  reviewsCount: number;
  description: string;
  services: string[];
  contactEmail: string;
  contactPhone: string;
  website: string;
  verifiedPartner: boolean;
  isSampleData: boolean;
  eventSuitability: OccasionType[];
}

export interface ThemeInspiration {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  colors: string[];
  decorSuggestions: string[];
  lightingIdeas: string[];
  venueStyling: string;
  suggestedDressCode: string;
  costLevel: 'Budget-Friendly' | 'Moderate' | 'Premium';
  affordableAlternative: string;
  iconName: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'deadline' | 'budget_warning' | 'task' | 'rsvp' | 'system';
  targetTab?: string;
  targetId?: string;
}

export interface RescueSuggestion {
  id: string;
  categoryName: string;
  title: string;
  description: string;
  proposedSavings: number;
  accepted: boolean;
  impactLevel: 'high' | 'medium' | 'low';
}
