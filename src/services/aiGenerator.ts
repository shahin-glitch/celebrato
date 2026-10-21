import type {
  OccasionType,
  BudgetCategory,
  TimelineTask,
  VendorChecklistItem,
  EventRecommendation,
  EventConcept,
  CurrencyType,
} from '../types';

export interface GeneratePlanInput {
  occasion: OccasionType;
  name: string;
  date: string;
  startTime: string;
  location: string;
  guestCount: number;
  budgetTotal: number;
  currency: CurrencyType;
  budgetPriority: 'lowest_cost' | 'balanced_value' | 'premium_experience';
  themePreference?: string;
  atmosphere?: 'formal' | 'casual' | 'traditional' | 'modern' | 'mixed';
  indoorOutdoor?: 'indoor' | 'outdoor' | 'hybrid';
  foodPreferences?: string[];
  dietaryRequirements?: string[];
  mustHaves?: string[];
  avoid?: string[];
  culturalPreferences?: string;
  accessibilityNeeds?: string;
}

export interface GeneratedAIResponse {
  concept: EventConcept;
  categories: BudgetCategory[];
  timeline: TimelineTask[];
  vendorChecklist: VendorChecklistItem[];
  recommendations: EventRecommendation[];
  source: 'gemini' | 'deterministic';
}

export const AIGeneratorService = {
  async generateEventPlan(
    input: GeneratePlanInput,
    apiKey?: string
  ): Promise<GeneratedAIResponse> {
    const key = apiKey?.trim();

    if (key) {
      try {
        const liveResult = await this.callGeminiAPI(input, key);
        if (liveResult) {
          return {
            ...liveResult,
            source: 'gemini',
          };
        }
      } catch (err) {
        console.warn('Gemini API call failed, switching to local deterministic generator:', err);
      }
    }

    // High quality deterministic fallback generator
    return {
      ...this.generateDeterministicPlan(input),
      source: 'deterministic',
    };
  },

  async callGeminiAPI(
    input: GeneratePlanInput,
    apiKey: string
  ): Promise<Omit<GeneratedAIResponse, 'source'> | null> {
    const systemPrompt = `You are Celebrato AI, an expert celebration and event planning architect.
Your task is to generate a comprehensive, highly realistic, mathematically consistent event plan.
Budget rules:
- Sum of all category amounts MUST exactly equal ${input.budgetTotal} ${input.currency}.
- Percentages must sum to 100%.
- Respect guest count (${input.guestCount}) and location (${input.location}).
- Do NOT invent fake verified business contact details.
- Provide actionable tasks with deadlines prior to ${input.date}.
Return ONLY valid JSON matching this exact structure:
{
  "concept": {
    "title": "string",
    "description": "string",
    "theme": "string",
    "colorPalette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
    "decorDirection": "string",
    "suggestedActivities": ["activity 1", "activity 2", "activity 3"],
    "menuDirection": "string",
    "reasoning": "string"
  },
  "categories": [
    {
      "id": "cat-1",
      "name": "string",
      "amount": 25000,
      "percentage": 25,
      "reason": "string",
      "priority": "high",
      "isProtected": false
    }
  ],
  "timeline": [
    {
      "id": "task-1",
      "title": "string",
      "dueDate": "YYYY-MM-DD",
      "timeSlot": "string",
      "priority": "high",
      "category": "string",
      "completed": false,
      "notes": "string"
    }
  ],
  "vendorChecklist": [
    {
      "id": "vc-1",
      "category": "string",
      "reason": "string",
      "estimatedMin": 20000,
      "estimatedMax": 25000,
      "bookingDeadline": "YYYY-MM-DD",
      "questions": ["question 1", "question 2"],
      "status": "not_started"
    }
  ],
  "recommendations": [
    {
      "id": "rec-1",
      "title": "string",
      "description": "string",
      "estimatedSavings": 5000,
      "type": "low_cost"
    }
  ]
}`;

    const userPrompt = `Event Request:
Occasion: ${input.occasion}
Event Name: ${input.name}
Date: ${input.date}
Location: ${input.location}
Guest Count: ${input.guestCount}
Budget: ${input.budgetTotal} ${input.currency}
Priority: ${input.budgetPriority}
Theme: ${input.themePreference || 'Modern Festive'}
Atmosphere: ${input.atmosphere || 'mixed'}
Setting: ${input.indoorOutdoor || 'hybrid'}
Food Preferences: ${(input.foodPreferences || []).join(', ') || 'Standard crowd favorites'}
Dietary Requirements: ${(input.dietaryRequirements || []).join(', ') || 'Standard'}
Must Haves: ${(input.mustHaves || []).join(', ') || 'Memorable atmosphere'}
Avoid: ${(input.avoid || []).join(', ') || 'Unnecessary delays'}
Cultural: ${input.culturalPreferences || 'Inclusive and respectful'}`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Gemini API HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini');

    const parsed = JSON.parse(text);
    return this.validateAndNormalizeGeminiOutput(parsed, input);
  },

  validateAndNormalizeGeminiOutput(
    parsed: any,
    input: GeneratePlanInput
  ): Omit<GeneratedAIResponse, 'source'> {
    // Validate and enforce budget totals strictly
    let categories: BudgetCategory[] = Array.isArray(parsed.categories)
      ? parsed.categories.map((c: any, i: number) => ({
          id: c.id || `cat-${i + 1}`,
          name: String(c.name || `Category ${i + 1}`),
          amount: Math.round(Number(c.amount) || 0),
          percentage: Number(c.percentage) || 0,
          reason: String(c.reason || ''),
          priority: ['high', 'medium', 'low'].includes(c.priority)
            ? c.priority
            : 'medium',
          isProtected: Boolean(c.isProtected),
        }))
      : [];

    if (categories.length === 0) {
      return this.generateDeterministicPlan(input);
    }

    // Rebalance amounts so they sum exactly to input.budgetTotal
    const rawSum = categories.reduce((sum, c) => sum + c.amount, 0);
    if (rawSum > 0 && rawSum !== input.budgetTotal) {
      let allocated = 0;
      categories.forEach((cat, idx) => {
        if (idx === categories.length - 1) {
          cat.amount = Math.max(0, input.budgetTotal - allocated);
        } else {
          cat.amount = Math.round((cat.amount / rawSum) * input.budgetTotal);
          allocated += cat.amount;
        }
        cat.percentage = Math.round((cat.amount / input.budgetTotal) * 100);
      });
    }

    const concept: EventConcept = {
      title: parsed.concept?.title || `${input.name} Blueprint`,
      description: parsed.concept?.description || `Personalized event plan for ${input.guestCount} guests.`,
      theme: parsed.concept?.theme || input.themePreference || 'Modern Celebration',
      colorPalette: Array.isArray(parsed.concept?.colorPalette) && parsed.concept.colorPalette.length >= 3
        ? parsed.concept.colorPalette.slice(0, 5)
        : ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C', '#F7FFF7'],
      decorDirection: parsed.concept?.decorDirection || 'Elegant ambient lighting and textured linens.',
      suggestedActivities: Array.isArray(parsed.concept?.suggestedActivities)
        ? parsed.concept.suggestedActivities
        : ['Welcome Reception', 'Signature Segment', 'Dinner & Socializing'],
      menuDirection: parsed.concept?.menuDirection || 'Curated buffet tailored to dietary preferences.',
      reasoning: parsed.concept?.reasoning || `Calculated for ${input.guestCount} attendees at ${input.location}.`,
      generatedBy: 'gemini',
    };

    const timeline: TimelineTask[] = Array.isArray(parsed.timeline)
      ? parsed.timeline.map((t: any, i: number) => ({
          id: t.id || `task-${i + 1}`,
          title: String(t.title || `Milestone ${i + 1}`),
          dueDate: t.dueDate || input.date,
          timeSlot: t.timeSlot || '10:00 AM',
          priority: ['high', 'medium', 'low'].includes(t.priority)
            ? t.priority
            : 'medium',
          category: t.category || 'General',
          completed: false,
          notes: t.notes || '',
        }))
      : [];

    const vendorChecklist: VendorChecklistItem[] = Array.isArray(parsed.vendorChecklist)
      ? parsed.vendorChecklist.map((v: any, i: number) => ({
          id: v.id || `vc-${i + 1}`,
          category: String(v.category || 'Vendor'),
          reason: String(v.reason || 'Crucial for event execution'),
          estimatedMin: Math.round(Number(v.estimatedMin) || 5000),
          estimatedMax: Math.round(Number(v.estimatedMax) || 10000),
          bookingDeadline: v.bookingDeadline || input.date,
          questions: Array.isArray(v.questions)
            ? v.questions
            : ['What is your cancellation and deposit policy?'],
          status: 'not_started',
        }))
      : [];

    const recommendations: EventRecommendation[] = Array.isArray(parsed.recommendations)
      ? parsed.recommendations.map((r: any, i: number) => ({
          id: r.id || `rec-${i + 1}`,
          title: String(r.title || 'Smart Tip'),
          description: String(r.description || ''),
          estimatedSavings: Number(r.estimatedSavings) || 0,
          type: ['low_cost', 'premium_upgrade', 'weather', 'comfort', 'cultural'].includes(r.type)
            ? r.type
            : 'low_cost',
        }))
      : [];

    return {
      concept,
      categories,
      timeline,
      vendorChecklist,
      recommendations,
    };
  },

  generateDeterministicPlan(input: GeneratePlanInput): Omit<GeneratedAIResponse, 'source'> {
    const total = input.budgetTotal;
    const isWedding = input.occasion === 'wedding' || input.occasion === 'engagement';
    const isFest = input.occasion === 'college_fest' || input.occasion === 'community';
    const isBirthday = input.occasion === 'birthday' || input.occasion === 'anniversary';

    // 1. Intelligent budget distribution weights based on occasion and priority
    let weights: { name: string; weight: number; reason: string; priority: 'high' | 'medium' | 'low'; isProtected?: boolean }[];

    if (isWedding) {
      weights = [
        { name: 'Palace or Resort Venue', weight: 0.32, reason: 'Atmosphere anchor, lawn and ceremonial pavilion', priority: 'high', isProtected: true },
        { name: 'Bespoke Banquet Catering', weight: 0.28, reason: `Fine dining & live counters for ${input.guestCount} guests`, priority: 'high', isProtected: true },
        { name: 'Floral & Mandap Styling', weight: 0.16, reason: 'Floral stage, photobooth, and ambient entrance draping', priority: 'medium', isProtected: false },
        { name: 'Cinematic Photo & Drone Film', weight: 0.11, reason: 'Lifetime visual archive, teasers, and high-res album', priority: 'high', isProtected: true },
        { name: 'Sangeet DJ, Sound & Lights', weight: 0.07, reason: 'Sound console, wireless mics, and dance floor lighting', priority: 'low', isProtected: false },
        { name: 'Hospitality & Contingency Reserve', weight: 0.06, reason: 'Emergency medical, transportation buffer, guest kits', priority: 'medium', isProtected: true },
      ];
    } else if (isFest) {
      weights = [
        { name: 'Stage, Truss & Concert Audio', weight: 0.28, reason: 'High-power PA, line arrays, mic kit for performers', priority: 'high', isProtected: true },
        { name: 'Campus Ground / Auditorium Venue', weight: 0.20, reason: 'Permissions, safety barricades, generator backup', priority: 'high', isProtected: true },
        { name: 'Street Food Court & Refreshments', weight: 0.22, reason: `Fast snacks and drinks for ${input.guestCount} attendees`, priority: 'medium', isProtected: false },
        { name: 'Festoon & Neon Stage Decor', weight: 0.14, reason: 'Festival fairy light canopy and photo spots', priority: 'medium', isProtected: false },
        { name: 'Badges, Wristbands & Trophies', weight: 0.08, reason: 'Access control and talent competition awards', priority: 'low', isProtected: false },
        { name: 'Logistics & Safety Contingency', weight: 0.08, reason: 'First aid, extra cabling, marshals gear', priority: 'high', isProtected: true },
      ];
    } else if (isBirthday) {
      weights = [
        { name: 'Private Rooftop or Banquet Space', weight: 0.34, reason: 'Reserved dining terrace and lounge setup', priority: 'high', isProtected: true },
        { name: 'Multi-Course Dinner & Custom Cake', weight: 0.32, reason: `Signature tiered cake and dinner for ${input.guestCount} guests`, priority: 'high', isProtected: true },
        { name: 'Theme Balloon Arch & Memory Wall', weight: 0.15, reason: 'Memory lane photo display and balloon garland', priority: 'medium', isProtected: false },
        { name: 'Candid Memory Photographer', weight: 0.11, reason: 'Capturing candid family hugs and toasts', priority: 'medium', isProtected: false },
        { name: 'Personalized Favors & Keepsakes', weight: 0.08, reason: 'Handmade favors for attendees', priority: 'low', isProtected: false },
      ];
    } else {
      weights = [
        { name: 'Venue Rental & Facilities', weight: 0.30, reason: 'Space booking and essential facility amenities', priority: 'high', isProtected: true },
        { name: 'Catering & Beverages', weight: 0.35, reason: `Buffet food and refreshments for ${input.guestCount} attendees`, priority: 'high', isProtected: true },
        { name: 'Theme Decor & Signage', weight: 0.15, reason: 'Entrance signage, table linens, and lighting', priority: 'medium', isProtected: false },
        { name: 'Photography & Audio/Visual', weight: 0.12, reason: 'Microphones, projector/sound, and photos', priority: 'medium', isProtected: false },
        { name: 'Logistics Reserve', weight: 0.08, reason: 'Buffer for last minute supplies', priority: 'low', isProtected: true },
      ];
    }

    // Allocate categories cleanly summing exactly to total
    let runningSum = 0;
    const categories: BudgetCategory[] = weights.map((w, idx) => {
      let amount: number;
      if (idx === weights.length - 1) {
        amount = Math.max(0, total - runningSum);
      } else {
        amount = Math.round(total * w.weight);
        runningSum += amount;
      }
      return {
        id: `cat-${idx + 1}`,
        name: w.name,
        amount,
        percentage: Math.round((amount / total) * 100),
        reason: w.reason,
        priority: w.priority,
        isProtected: w.isProtected,
      };
    });

    // 2. Timeline milestones calculated based on target event date
    const targetDate = new Date(input.date || '2026-12-01');
    const getShiftedDate = (daysBefore: number) => {
      const d = new Date(targetDate);
      d.setDate(d.getDate() - daysBefore);
      return d.toISOString().split('T')[0];
    };

    const timeline: TimelineTask[] = [
      {
        id: 'task-1',
        title: 'Lock in venue booking & sign deposit agreement',
        dueDate: getShiftedDate(30),
        timeSlot: '11:00 AM',
        priority: 'high',
        category: 'Venue',
        completed: true,
        notes: `Confirmed at ${input.location}`,
      },
      {
        id: 'task-2',
        title: `Dispatch invitations to ${input.guestCount} guests & open RSVP tracking`,
        dueDate: getShiftedDate(21),
        timeSlot: '02:00 PM',
        priority: 'high',
        category: 'Invitations',
        completed: true,
        notes: 'Track dietary preferences and headcount responses',
      },
      {
        id: 'task-3',
        title: 'Catering menu tasting & final headcount confirmation',
        dueDate: getShiftedDate(12),
        timeSlot: '01:30 PM',
        priority: 'high',
        category: 'Catering',
        completed: false,
        notes: `Verify ${(input.dietaryRequirements || ['dietary needs']).join(', ')}`,
      },
      {
        id: 'task-4',
        title: 'Walkthrough with decor and lighting styling team',
        dueDate: getShiftedDate(6),
        timeSlot: '04:00 PM',
        priority: 'medium',
        category: 'Decor',
        completed: false,
        notes: `Review ${input.themePreference || 'signature theme'} mockups`,
      },
      {
        id: 'task-5',
        title: 'Final run-of-show logistics & equipment soundcheck',
        dueDate: getShiftedDate(1),
        timeSlot: '05:00 PM',
        priority: 'high',
        category: 'Logistics',
        completed: false,
        notes: 'Verify power backup, microphone batteries, and stage timings',
      },
    ];

    // 3. Vendor checklist tailored to event
    const vendorChecklist: VendorChecklistItem[] = [
      {
        id: 'vc-1',
        category: isFest ? 'Stage Sound & Audio Engineer' : 'Catering & Beverages',
        reason: `Essential catering service for ${input.guestCount} attendees with diverse preferences`,
        estimatedMin: Math.round(total * 0.22),
        estimatedMax: Math.round(total * 0.30),
        bookingDeadline: getShiftedDate(18),
        questions: [
          'Can you accommodate live counter preparation speeds without bottlenecking?',
          'Are compostable biodegradable service plates provided?',
          'What is the deposit and rescheduling policy?',
        ],
        status: 'shortlisted',
        assignedVendorName: isFest ? 'Coastal Beats Audio & Lighting' : 'Swad Fast-Track Caterers',
      },
      {
        id: 'vc-2',
        category: 'Theme Styling & Lighting',
        reason: 'Transforms the physical space according to the selected aesthetic',
        estimatedMin: Math.round(total * 0.12),
        estimatedMax: Math.round(total * 0.16),
        bookingDeadline: getShiftedDate(14),
        questions: [
          'Do your lighting fixtures have silent dimmers suitable for photography?',
          'Who handles post-event dismantling and cleaning?',
        ],
        status: 'contacted',
      },
      {
        id: 'vc-3',
        category: 'Event Media & Photography',
        reason: 'Archiving milestone moments and delivering high-res social edits',
        estimatedMin: Math.round(total * 0.08),
        estimatedMax: Math.round(total * 0.12),
        bookingDeadline: getShiftedDate(16),
        questions: [
          'What is the delivery turnaround time for edited preview photos?',
          'Is an unedited raw footage drive provided?',
        ],
        status: 'researching',
      },
    ];

    // 4. Personalized event concept
    const paletteMap: Record<string, string[]> = {
      wedding: ['#800020', '#D4AF37', '#FFFDD0', '#E5A93B', '#FAF0CA'],
      college_fest: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C', '#F7FFF7'],
      birthday: ['#E6C229', '#F8B195', '#C06C84', '#6C5B7B', '#355C7D'],
      default: ['#2B2D42', '#8D99AE', '#EDF2F4', '#EF233C', '#FFFFFF'],
    };
    const palette =
      paletteMap[input.occasion] || paletteMap.default;

    const concept: EventConcept = {
      title: `${input.name}: Tailored Celebration Blueprint`,
      description: `A master plan engineered for ${input.guestCount} attendees in ${input.location}, striking a seamless balance between immersive guest experience and strict budget accountability of ${input.currency} ${input.budgetTotal.toLocaleString()}.`,
      theme: input.themePreference || (isFest ? 'Electric Sunset Carnival' : isWedding ? 'Royal Heritage Splendor' : 'Golden Jubilee Nostalgia'),
      colorPalette: palette,
      decorDirection: isFest
        ? 'Festoon light canopies, neon photo backdrops, and industrial bar-table clusters.'
        : isWedding
        ? 'Fragrant local florals, architectural wash lighting, and traditional brass deepams.'
        : 'Warm ambient fairy light curtain, personalized photo memory lane, and gold balloon garland.',
      suggestedActivities: isFest
        ? ['Dance & Band Showcase', 'Live Mocktail Jam', 'Student Talent Battle', 'Campus Memory Polaroid Wall']
        : isWedding
        ? ['Sunset Welcome Mocktails', 'Sangeet Choreography Segment', 'Phera Ceremony', 'Royal Banquet']
        : ['Memory Lane Video Screening', 'Acoustic Sing-along', 'Milestone Cake Cutting', 'Toast & Story Sharing'],
      menuDirection: `Dynamic multi-station buffet prioritizing ${(input.foodPreferences || ['crowd-pleasing dishes']).join(', ')} while strictly honoring ${(input.dietaryRequirements || ['vegetarian and allergen requirements']).join(', ')}.`,
      reasoning: `Cost model allocates approximately ${input.currency} ${Math.round(total / input.guestCount).toLocaleString()} per guest, safeguarding primary venue and hospitality while using smart decor hacks to avoid budget creep.`,
      generatedBy: 'deterministic',
    };

    // 5. Tailored recommendations & budget rescue options
    const recommendations: EventRecommendation[] = [
      {
        id: 'rec-1',
        title: 'Switch to Interactive WhatsApp QR Invites',
        description: `Eliminate physical printing and courier transit. Saves approximately ${input.currency} ${Math.round(total * 0.05).toLocaleString()} with immediate RSVP confirmations.`,
        estimatedSavings: Math.round(total * 0.05),
        type: 'low_cost',
      },
      {
        id: 'rec-2',
        title: 'Warm LED Festoon Canopies in Place of Cut Flowers',
        description: `Rental fairy light canopies cover 10x the physical square footage of cut flowers at less than half the cost, delivering stunning night photos.`,
        estimatedSavings: Math.round(total * 0.07),
        type: 'low_cost',
      },
      {
        id: 'rec-3',
        title: 'Weather Contingency: Transparent Awning Reserve',
        description: `For ${input.location}, outdoor evening dew or moisture can impact sound gear. Renting clear waterproof covers safeguards equipment with zero disruption.`,
        estimatedSavings: 0,
        type: 'weather',
      },
      {
        id: 'rec-4',
        title: 'Streamline Dessert Station to 3 Signature Crowd-Pleasers',
        description: `Focusing on 3 high-impact fresh hot desserts rather than 8 generic options reduces catering food waste and shaves 15% off confectionary billing.`,
        estimatedSavings: Math.round(total * 0.04),
        type: 'low_cost',
      },
    ];

    return {
      concept,
      categories,
      timeline,
      vendorChecklist,
      recommendations,
    };
  },
};
