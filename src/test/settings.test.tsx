import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SettingsModal } from '../components/settings/SettingsModal';
import { StorageService } from '../services/storage';

describe('SettingsModal Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <SettingsModal
        isOpen={false}
        onClose={vi.fn()}
        currency="INR"
        onCurrencyChange={vi.fn()}
        onResetDemo={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders settings fields and allows saving API key', () => {
    const setApiKeySpy = vi.spyOn(StorageService, 'setApiKey');

    render(
      <SettingsModal
        isOpen={true}
        onClose={vi.fn()}
        currency="INR"
        onCurrencyChange={vi.fn()}
        onResetDemo={vi.fn()}
      />
    );

    expect(screen.getByText('Settings & AI Engine')).toBeInTheDocument();

    const keyInput = screen.getByLabelText(/Google Gemini API Key/i);
    fireEvent.change(keyInput, { target: { value: 'AIzaSyTestKey123' } });

    const saveBtn = screen.getByRole('button', { name: /Save Key/i });
    fireEvent.click(saveBtn);

    expect(setApiKeySpy).toHaveBeenCalledWith('AIzaSyTestKey123');
    expect(screen.getByText('Saved!')).toBeInTheDocument();
  });

  it('triggers onCurrencyChange when clicking a currency option', () => {
    const onCurrencyChange = vi.fn();

    render(
      <SettingsModal
        isOpen={true}
        onClose={vi.fn()}
        currency="INR"
        onCurrencyChange={onCurrencyChange}
        onResetDemo={vi.fn()}
      />
    );

    const usdBtn = screen.getByRole('button', { name: /USD \(\$\)/i });
    fireEvent.click(usdBtn);

    expect(onCurrencyChange).toHaveBeenCalledWith('USD');
  });

  it('closes on Escape key press', () => {
    const onClose = vi.fn();

    render(
      <SettingsModal
        isOpen={true}
        onClose={onClose}
        currency="INR"
        onCurrencyChange={vi.fn()}
        onResetDemo={vi.fn()}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
