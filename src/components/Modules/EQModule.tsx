/**
 * EQModule.tsx
 * 
 * Модуль эквалайзера
 * - 10 полос частот (32Hz - 16kHz)
 * - Preamp (предусилитель)
 * - Stereo Width (стерео ширина)
 * - Случайные пресеты
 */

import React, { useMemo } from 'react';
import { Sliders, Sparkles, RotateCcw } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';
import { useIconSize } from '../../hocs/withDisplaySettings';
import { generateRandomColor } from '../../utils/colorUtils';
import { audioEngine } from '../../services/audioEngine';
import { EQBand } from '../../types';

const EQ_BANDS: EQBand[] = ['32', '64', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];

const EQ_PRESETS = {
  'Bass Boost': { '32': 8, '64': 6, '125': 4, '250': 0, '500': -2, '1k': -2, '2k': 0, '4k': 2, '8k': 4, '16k': 4 },
  'Treble Boost': { '32': -4, '64': -2, '125': 0, '250': 2, '500': 4, '1k': 6, '2k': 8, '4k': 8, '8k': 6, '16k': 4 },
  'Vocal': { '32': -2, '64': -1, '125': 0, '250': 2, '500': 4, '1k': 6, '2k': 6, '4k': 4, '8k': 2, '16k': 0 },
  'Club': { '32': 6, '64': 4, '125': 2, '250': 0, '500': 0, '1k': 0, '2k': 0, '4k': 2, '8k': 4, '16k': 6 },
  'Classical': { '32': -2, '64': -2, '125': 0, '250': 2, '500': 2, '1k': 0, '2k': -2, '4k': -2, '8k': 0, '16k': 2 },
  'Flat': { '32': 0, '64': 0, '125': 0, '250': 0, '500': 0, '1k': 0, '2k': 0, '4k': 0, '8k': 0, '16k': 0 }
};

interface EQModuleProps {
  // Пока оставляем пустым
}

export const EQModule: React.FC<EQModuleProps> = () => {
  const { settings, theme, updateSettings } = useSettings();
  const iconSize = useIconSize();
  
  const moduleColor = useMemo(() => 
    settings.display?.randomColors ? generateRandomColor() : theme.accent,
  [settings.display?.randomColors, theme.accent]);
  
  const handleBandChange = (band: EQBand, value: number) => {
    const newBands = { ...settings.equalizer.bands, [band]: value };
    updateSettings({
      equalizer: { ...settings.equalizer, bands: newBands }
    });
    
    // Применяем к audioEngine
    if (audioEngine.isReady) {
      audioEngine.setEQBand(band, value);
    }
  };
  
  const handlePreampChange = (value: number) => {
    updateSettings({
      equalizer: { ...settings.equalizer, preamp: value }
    });
    if (audioEngine.isReady) {
      audioEngine.setPreamp(value);
    }
  };
  
  const handleStereoWidthChange = (value: number) => {
    updateSettings({
      equalizer: { ...settings.equalizer, stereoWidth: value }
    });
    if (audioEngine.isReady) {
      audioEngine.setStereoWidth(value);
    }
  };
  
  const applyPreset = (presetName: string) => {
    const preset = EQ_PRESETS[presetName as keyof typeof EQ_PRESETS];
    if (preset) {
      updateSettings({
        equalizer: { ...settings.equalizer, bands: preset }
      });
      
      if (audioEngine.isReady) {
        Object.entries(preset).forEach(([band, value]) => {
          audioEngine.setEQBand(band as EQBand, value);
        });
      }
    }
  };
  
  const randomPreset = () => {
    const presetNames = Object.keys(EQ_PRESETS);
    const randomName = presetNames[Math.floor(Math.random() * presetNames.length)];
    applyPreset(randomName);
  };
  
  const resetEQ = () => {
    applyPreset('Flat');
  };
  
  return (
    <div className="flex-1 flex flex-col p-8 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Sliders size={iconSize * 1.5} style={{ color: moduleColor }} />
          <h2 className="text-3xl font-black uppercase" style={{ color: theme.text }}>
            10-Band Equalizer
          </h2>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={resetEQ}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase transition-all hover:scale-110"
            style={{
              backgroundColor: theme.surface,
              color: theme.text,
              border: `2px solid ${theme.text}22`
            }}
          >
            <RotateCcw size={iconSize} />
            Reset
          </button>
          
          <button
            onClick={randomPreset}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase transition-all hover:scale-110"
            style={{
              backgroundColor: moduleColor,
              color: theme.isLight ? '#000' : '#fff'
            }}
          >
            <Sparkles size={iconSize} />
            Random
          </button>
        </div>
      </div>
      
      {/* Presets */}
      <div className="mb-8">
        <h3 className="text-sm font-black uppercase opacity-50 mb-4" style={{ color: theme.text }}>
          Quick Presets
        </h3>
        <div className="flex flex-wrap gap-3">
          {Object.keys(EQ_PRESETS).map(presetName => (
            <button
              key={presetName}
              onClick={() => applyPreset(presetName)}
              className="px-5 py-2 rounded-xl font-bold uppercase text-sm transition-all hover:scale-105"
              style={{
                backgroundColor: theme.surface,
                color: theme.text,
                border: `1px solid ${theme.text}22`
              }}
            >
              {presetName}
            </button>
          ))}
        </div>
      </div>
      
      {/* EQ Bands */}
      <div className="flex gap-6 mb-8">
        {EQ_BANDS.map(band => {
          const value = settings.equalizer.bands[band];
          
          return (
            <div key={band} className="flex-1 flex flex-col items-center">
              <div className="flex-1 relative w-12 rounded-full overflow-hidden"
                   style={{ 
                     backgroundColor: theme.surface,
                     height: '300px',
                     border: `2px solid ${theme.text}11`
                   }}>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="0.5"
                  value={value}
                  onChange={(e) => handleBandChange(band, parseFloat(e.target.value))}
                  className="absolute w-full h-full appearance-none"
                  style={{
                    writingMode: 'bt-lr',
                    WebkitAppearance: 'slider-vertical',
                    background: `linear-gradient(to top, ${moduleColor} ${((value + 12) / 24) * 100}%, transparent ${((value + 12) / 24) * 100}%)`
                  }}
                />
              </div>
              
              <div className="mt-4 text-center">
                <div className="text-lg font-black uppercase" style={{ color: theme.text }}>
                  {band}
                </div>
                <div className="text-sm font-bold" style={{ color: moduleColor }}>
                  {value > 0 ? '+' : ''}{value.toFixed(1)} dB
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Preamp & Stereo Width */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-sm font-black uppercase opacity-50 mb-3" style={{ color: theme.text }}>
            Preamp Gain
          </h3>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={settings.equalizer.preamp}
            onChange={(e) => handlePreampChange(parseFloat(e.target.value))}
            className="w-full h-4 rounded-full appearance-none"
            style={{
              background: `linear-gradient(to right, ${moduleColor} ${(settings.equalizer.preamp / 2) * 100}%, ${theme.surface} ${(settings.equalizer.preamp / 2) * 100}%)`
            }}
          />
          <div className="text-xl font-bold mt-2" style={{ color: moduleColor }}>
            {settings.equalizer.preamp.toFixed(1)}x
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-black uppercase opacity-50 mb-3" style={{ color: theme.text }}>
            Stereo Width
          </h3>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={settings.equalizer.stereoWidth}
            onChange={(e) => handleStereoWidthChange(parseFloat(e.target.value))}
            className="w-full h-4 rounded-full appearance-none"
            style={{
              background: `linear-gradient(to right, ${moduleColor} ${(settings.equalizer.stereoWidth / 2) * 100}%, ${theme.surface} ${(settings.equalizer.stereoWidth / 2) * 100}%)`
            }}
          />
          <div className="text-xl font-bold mt-2" style={{ color: moduleColor }}>
            {settings.equalizer.stereoWidth.toFixed(1)}x
          </div>
        </div>
      </div>
    </div>
  );
};
