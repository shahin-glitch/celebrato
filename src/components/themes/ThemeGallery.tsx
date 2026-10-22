import React from 'react';
import type { EventPlan, ThemeInspiration } from '../../types';
import { THEME_GALLERY } from '../../services/sampleData';
import {
  Palette,
  Check,
  Sparkles,
  Shirt,
  Lamp,
  Lightbulb,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ThemeGalleryProps {
  event: EventPlan;
  onUpdateEvent: (updated: EventPlan) => void;
}

export const ThemeGallery: React.FC<ThemeGalleryProps> = ({
  event,
  onUpdateEvent,
}) => {
  const currentThemeTitle = event.concept.theme;

  const handleApplyTheme = (theme: ThemeInspiration) => {
    onUpdateEvent({
      ...event,
      concept: {
        ...event.concept,
        theme: theme.title,
        colorPalette: theme.colors,
        decorDirection: `${theme.venueStyling}. ${theme.decorSuggestions.join('. ')}`,
      },
      preferences: {
        ...event.preferences,
        theme: theme.title,
        colorPalette: theme.colors,
      },
    });

    try {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6 pt-2 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 bg-white rounded-2xl neo-border neo-shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#E8DCF8] neo-border flex items-center justify-center text-[#171717]">
              <Palette className="w-4 h-4 stroke-[2.2]" />
            </span>
            <h2 className="font-mono-code text-xl font-bold text-[#171717]">
              Theme & Inspiration Studio
            </h2>
          </div>
          <p className="text-xs text-[#565656] mt-1">
            Curated aesthetics tailored to celebration scale with affordable alternatives and color swatches.
          </p>
        </div>

        <div className="font-mono-code text-xs bg-[#FDF189] px-3 py-1.5 rounded-xl neo-border">
          Active Theme: <strong>{currentThemeTitle}</strong>
        </div>
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {THEME_GALLERY.map((theme) => {
          const isCurrent =
            currentThemeTitle.toLowerCase() === theme.title.toLowerCase();

          return (
            <div
              key={theme.id}
              className={`p-5 rounded-2xl neo-border neo-shadow-sm flex flex-col justify-between space-y-4 transition-all ${
                isCurrent
                  ? 'bg-[#FCFBF7] border-2 border-[#171717] ring-2 ring-[#FFD95A]'
                  : 'bg-white hover:-translate-y-1'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-mono-code font-bold text-base text-[#171717]">
                      {theme.title}
                    </h3>
                    <p className="text-xs text-[#565656]">{theme.subtitle}</p>
                  </div>
                  <span
                    className={`font-mono-code text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border shrink-0 ${
                      theme.costLevel === 'Budget-Friendly'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : theme.costLevel === 'Moderate'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-purple-100 text-purple-800 border-purple-300'
                    }`}
                  >
                    {theme.costLevel}
                  </span>
                </div>

                {/* Color Swatches */}
                <div className="flex items-center gap-1.5">
                  {theme.colors.map((c, i) => (
                    <div
                      key={i}
                      title={c}
                      aria-label={`Color swatch ${c}`}
                      className="w-7 h-7 rounded-lg border border-[#171717] shadow-xs"
                      style={{ backgroundColor: c }}
                    ></div>
                  ))}
                </div>

                <p className="text-xs text-[#565656] leading-relaxed">
                  {theme.description}
                </p>

                {/* Decor & Lighting highlights */}
                <div className="space-y-2 text-xs pt-2 border-t border-black/5 font-mono-code">
                  <div className="flex items-center gap-1.5 text-[#171717]">
                    <Lamp className="w-3.5 h-3.5 text-[#565656]" />
                    <span>{theme.lightingIdeas.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#171717]">
                    <Shirt className="w-3.5 h-3.5 text-[#565656]" />
                    <span>Dress: {theme.suggestedDressCode}</span>
                  </div>
                </div>

                {/* Affordable Interpretation */}
                <div className="p-3 bg-[#C2F2B0]/30 rounded-xl neo-border text-xs">
                  <span className="font-bold flex items-center gap-1 text-[#171717]">
                    <Lightbulb className="w-3.5 h-3.5 text-emerald-800" /> Budget Hack:
                  </span>
                  <p className="text-[11px] text-[#171717]/85 mt-1">
                    {theme.affordableAlternative}
                  </p>
                </div>
              </div>

              {/* Apply Action */}
              <button
                onClick={() => handleApplyTheme(theme)}
                disabled={isCurrent}
                aria-label={
                  isCurrent
                    ? `Theme ${theme.title} is currently active`
                    : `Apply theme ${theme.title} to event`
                }
                className={`w-full py-2.5 rounded-xl font-mono-code text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isCurrent
                    ? 'bg-[#171717] text-[#C2F2B0]'
                    : 'bg-[#FDF189] text-[#171717] neo-border hover:bg-[#F5E25E]'
                }`}
              >
                {isCurrent ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Theme Applied</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Apply Theme to Event</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
