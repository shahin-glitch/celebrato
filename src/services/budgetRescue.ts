import type { BudgetCategory, RescueSuggestion } from '../types';

/**
 * Generates initial budget rescue suggestions based on available categories.
 */
export function generateRescueSuggestions(categories: BudgetCategory[]): RescueSuggestion[] {
  const list: RescueSuggestion[] = [];

  // Check for decor category
  const decorCat = categories.find(
    (c) =>
      c.name.toLowerCase().includes('decor') ||
      c.name.toLowerCase().includes('lighting')
  );
  if (decorCat) {
    list.push({
      id: 'sug-decor',
      categoryName: decorCat.name,
      title: 'Switch from elaborate florals to high-lumen festoon & LED canopies',
      description:
        'Warm fairy lights cover huge visual areas at a fraction of cut floral costs while maintaining spectacular photography aesthetics.',
      proposedSavings: Math.round(decorCat.amount * 0.4),
      accepted: true,
      impactLevel: 'medium',
    });
  }

  // Check for invitations/favors/merch
  const favorsCat = categories.find(
    (c) =>
      c.name.toLowerCase().includes('favors') ||
      c.name.toLowerCase().includes('merch') ||
      c.name.toLowerCase().includes('invitations')
  );
  if (favorsCat) {
    list.push({
      id: 'sug-favors',
      categoryName: favorsCat.name,
      title: 'Adopt digital WhatsApp video passes over printed kits',
      description:
        'Eliminate custom printing, packaging, and courier delivery while making attendee verification instant at the entrance.',
      proposedSavings: Math.round(favorsCat.amount * 0.6),
      accepted: true,
      impactLevel: 'low',
    });
  }

  // Check for catering/refreshments
  const cateringCat = categories.find(
    (c) =>
      c.name.toLowerCase().includes('catering') ||
      c.name.toLowerCase().includes('food') ||
      c.name.toLowerCase().includes('refreshment')
  );
  if (cateringCat) {
    list.push({
      id: 'sug-food',
      categoryName: cateringCat.name,
      title: 'Streamline menu variety to signature crowd-pleasing live stations',
      description:
        'Focusing on 3 high-demand hot items rather than 7 generic buffet dishes prevents food wastage and reduces chef headcount charges.',
      proposedSavings: Math.round(cateringCat.amount * 0.25),
      accepted: true,
      impactLevel: 'medium',
    });
  }

  // Check for photo/video
  const photoCat = categories.find(
    (c) =>
      c.name.toLowerCase().includes('photo') ||
      c.name.toLowerCase().includes('video') ||
      c.name.toLowerCase().includes('media')
  );
  if (photoCat) {
    list.push({
      id: 'sug-photo',
      categoryName: photoCat.name,
      title: 'Digital-only cloud gallery delivery instead of hardbound albums',
      description:
        'Fast cloud gallery delivery saves lab print charges and album binding while letting guests download instantly on mobile.',
      proposedSavings: Math.round(photoCat.amount * 0.35),
      accepted: true,
      impactLevel: 'low',
    });
  }

  // Check for entertainment/misc
  const entertainCat = categories.find(
    (c) =>
      c.name.toLowerCase().includes('dj') ||
      c.name.toLowerCase().includes('audio') ||
      c.name.toLowerCase().includes('sound')
  );
  if (entertainCat && !entertainCat.isProtected) {
    list.push({
      id: 'sug-sound',
      categoryName: entertainCat.name,
      title: 'Curate student performers and DJ set instead of external live band',
      description:
        'Highlight campus talent and high-energy playlist sets to keep energy peaked without external rider and hospitality costs.',
      proposedSavings: Math.round(entertainCat.amount * 0.2),
      accepted: false,
      impactLevel: 'medium',
    });
  }

  return list;
}

/**
 * Rebalances categories to strictly match target budget, respecting protected categories
 * and accepted trade-off suggestions.
 */
export function calculateRebalancedCategories(
  categories: BudgetCategory[],
  target: number,
  currentSuggestions: RescueSuggestion[],
  protectedIds: string[]
): BudgetCategory[] {
  const protectedCats = categories.filter((c) => protectedIds.includes(c.id));
  const nonProtectedCats = categories.filter((c) => !protectedIds.includes(c.id));

  const protectedSum = protectedCats.reduce((sum, c) => sum + c.amount, 0);

  // If protected categories alone exceed or equal target, scale them down proportionally and zero out unprotected
  if (protectedSum >= target && nonProtectedCats.length > 0) {
    const scale = target / (protectedSum || 1);
    let running = 0;
    return categories.map((c, i) => {
      if (i === categories.length - 1) {
        const rem = Math.max(0, target - running);
        return { ...c, amount: rem, percentage: target > 0 ? Math.round((rem / target) * 100) : 0 };
      }
      if (protectedIds.includes(c.id)) {
        const amt = Math.round(c.amount * scale);
        running += amt;
        return { ...c, amount: amt, percentage: target > 0 ? Math.round((amt / target) * 100) : 0 };
      }
      return { ...c, amount: 0, percentage: 0 };
    });
  }

  // Normal case: protected categories remain intact, non-protected absorb the reduction
  const targetNonProtected = Math.max(0, target - protectedSum);

  // Apply specific cuts from accepted suggestions first
  const intermediateUnprotected = nonProtectedCats.map((cat) => {
    const sug = currentSuggestions.find((s) => s.categoryName === cat.name && s.accepted);
    const cut = sug ? sug.proposedSavings : 0;
    return {
      cat,
      interAmount: Math.max(500, cat.amount - cut),
    };
  });

  const interSum = intermediateUnprotected.reduce((sum, item) => sum + item.interAmount, 0);

  // Scale intermediate amounts so their sum matches targetNonProtected exactly
  let runningNonProtected = 0;
  const rebalancedMap = new Map<string, number>();

  intermediateUnprotected.forEach((item, idx) => {
    if (idx === intermediateUnprotected.length - 1) {
      const remainder = Math.max(0, targetNonProtected - runningNonProtected);
      rebalancedMap.set(item.cat.id, remainder);
    } else {
      const ratio = interSum > 0 ? item.interAmount / interSum : 1 / intermediateUnprotected.length;
      const amt = Math.max(0, Math.round(targetNonProtected * ratio));
      runningNonProtected += amt;
      rebalancedMap.set(item.cat.id, amt);
    }
  });

  // Assemble all categories maintaining original order
  const result = categories.map((cat) => {
    if (protectedIds.includes(cat.id)) {
      return {
        ...cat,
        percentage: target > 0 ? Math.round((cat.amount / target) * 100) : 0,
      };
    }
    const newAmt = rebalancedMap.get(cat.id) ?? 0;
    return {
      ...cat,
      amount: newAmt,
      percentage: target > 0 ? Math.round((newAmt / target) * 100) : 0,
    };
  });

  // Final verification: ensure sum is EXACTLY target
  const currentSum = result.reduce((sum, c) => sum + c.amount, 0);
  const discrepancy = target - currentSum;
  if (discrepancy !== 0) {
    const adjustableIdx = result.findIndex(
      (c) => !protectedIds.includes(c.id) && c.amount + discrepancy >= 0
    );
    const idxToFix = adjustableIdx >= 0 ? adjustableIdx : 0;
    result[idxToFix].amount = Math.max(0, result[idxToFix].amount + discrepancy);
    result[idxToFix].percentage = target > 0 ? Math.round((result[idxToFix].amount / target) * 100) : 0;
  }

  return result;
}
