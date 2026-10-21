import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIGeneratorService, type GeneratePlanInput } from '../services/aiGenerator';

const sampleInput: GeneratePlanInput = {
  occasion: 'wedding',
  name: 'Sharma-Verma Nuptials',
  date: '2026-12-25',
  startTime: '17:00',
  location: 'Jaipur, Rajasthan',
  guestCount: 300,
  budgetTotal: 2000000,
  currency: 'INR',
  budgetPriority: 'balanced_value',
  themePreference: 'Royal Rajputana',
  atmosphere: 'formal',
  indoorOutdoor: 'hybrid',
  foodPreferences: ['North Indian', 'Rajasthani Dal Baati'],
  dietaryRequirements: ['Vegetarian preferred'],
  mustHaves: ['Palace lighting', 'Live Shehnai'],
  avoid: ['Loud techno'],
};

describe('AI Generator Service & Fallback Behavior', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('generates a high-quality deterministic plan when no API key is provided', async () => {
    const result = await AIGeneratorService.generateEventPlan(sampleInput);

    expect(result.source).toBe('deterministic');
    expect(result.concept.title).toContain('Sharma-Verma Nuptials');
    expect(result.categories.length).toBeGreaterThan(0);

    // Sum of all categories MUST exactly equal budgetTotal
    const sumCategories = result.categories.reduce((sum, c) => sum + c.amount, 0);
    expect(sumCategories).toBe(sampleInput.budgetTotal);

    // Timeline tasks should be populated
    expect(result.timeline.length).toBeGreaterThanOrEqual(3);
    // Check that deadlines precede event date
    result.timeline.forEach((t) => {
      expect(t.dueDate <= sampleInput.date).toBe(true);
    });

    // Vendor checklist should be populated
    expect(result.vendorChecklist.length).toBeGreaterThan(0);
    // Recommendations should be populated
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it('gracefully falls back to deterministic plan when Gemini API call throws network error', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Mock global fetch to throw network error
    globalThis.fetch = vi.fn().mockRejectedValueOnce(new Error('Network offline or DNS error'));

    const result = await AIGeneratorService.generateEventPlan(sampleInput, 'dummy-key');

    expect(result.source).toBe('deterministic');
    const sumCategories = result.categories.reduce((sum, c) => sum + c.amount, 0);
    expect(sumCategories).toBe(sampleInput.budgetTotal);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Gemini API call failed, switching to local deterministic generator:'),
      expect.any(Error)
    );
  });

  it('gracefully falls back to deterministic plan when Gemini returns HTTP 500 error', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const result = await AIGeneratorService.generateEventPlan(sampleInput, 'dummy-key');

    expect(result.source).toBe('deterministic');
    const sum = result.categories.reduce((s, c) => s + c.amount, 0);
    expect(sum).toBe(sampleInput.budgetTotal);
  });

  it('gracefully falls back to deterministic plan when Gemini returns malformed JSON or empty body', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'NOT VALID JSON' }] } }],
      }),
    });

    const result = await AIGeneratorService.generateEventPlan(sampleInput, 'dummy-key');

    expect(result.source).toBe('deterministic');
    expect(result.categories.length).toBeGreaterThan(0);
  });

  it('normalizes Gemini response and strictly enforces budget total rebalancing', () => {
    // Suppose Gemini returned categories that sum to 1,800,000 instead of 2,000,000
    const rawGeminiOutput = {
      concept: {
        title: 'Gemini Palace Wedding',
        description: 'AI Generated Plan',
        theme: 'Heritage Splendor',
        colorPalette: ['#111', '#222', '#333'],
        decorDirection: 'Marigold and brass',
        suggestedActivities: ['Phera Ceremony'],
        menuDirection: 'Royal feast',
        reasoning: 'Calculated for guests',
      },
      categories: [
        { id: 'c1', name: 'Venue', amount: 1000000, percentage: 50, priority: 'high' },
        { id: 'c2', name: 'Catering', amount: 800000, percentage: 40, priority: 'high' },
      ], // sum = 1,800,000 (missing 200,000)
      timeline: [
        { id: 't1', title: 'Book Venue', dueDate: '2026-11-01', priority: 'high' },
      ],
      vendorChecklist: [
        { id: 'v1', category: 'Venue', estimatedMin: 900000, estimatedMax: 1100000 },
      ],
      recommendations: [
        { id: 'r1', title: 'Save on florals', estimatedSavings: 50000, type: 'low_cost' },
      ],
    };

    const normalized = AIGeneratorService.validateAndNormalizeGeminiOutput(
      rawGeminiOutput,
      sampleInput
    );

    // Sum must be adjusted to EXACTLY sampleInput.budgetTotal (2,000,000)
    const sum = normalized.categories.reduce((s, c) => s + c.amount, 0);
    expect(sum).toBe(sampleInput.budgetTotal);
    expect(normalized.concept.generatedBy).toBe('gemini');
  });

  it('falls back to deterministic plan when Gemini returns empty categories array', () => {
    const rawEmptyCategories = {
      concept: { title: 'No Categories' },
      categories: [],
    };

    const normalized = AIGeneratorService.validateAndNormalizeGeminiOutput(
      rawEmptyCategories,
      sampleInput
    );

    expect(normalized.categories.length).toBeGreaterThan(0);
    const sum = normalized.categories.reduce((s, c) => s + c.amount, 0);
    expect(sum).toBe(sampleInput.budgetTotal);
  });
});
