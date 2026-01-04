src/constants.tsx
# AuraWave - AI Agent Instructions

## Project Overview
**AuraWave** (chefai.kz) is a modular web radio player with 3D visualization, AI metadata generation, and global station discovery. Recently refactored from a 509-line monolith into 29 modular files for better maintainability and AI-assisted development.

## Visualization System (NEW v2.0)

### Modular Provider Architecture
Система визуализации теперь полностью модульная через **Provider Pattern**:

**Core Files:**
- [src/services/visualizationProviders.ts](src/services/visualizationProviders.ts) - Registry всех провайдеров
- [src/hooks/useVisualizationProvider.ts](src/hooks/useVisualizationProvider.ts) - Хук для компонентов
- [src/components/UI/VisualizationSelector.tsx](src/components/UI/VisualizationSelector.tsx) - UI селектор

**Provider Types:**
- `threejs` - WebGL 3D визуализации (планеты, галактики, туманности)
- `css3d` - CSS 3D transforms (облака тегов, сферы)
- `d3` - D3.js графы (force-directed, деревья)
- `2d` - Простые layouts (grid, masonry, carousel)

**Adding New Visualization:**
1. Add enum ID to `VisualizationProvider`
2. Create class implementing `IVisualizationProvider`
3. Implement `calculateLayout()` with position algorithm
4. Register in `VisualizationRegistry` constructor
5. Add icon to `PROVIDER_ICONS` in VisualizationSelector

**Quick Reference:** See [AI_AGENT_QUICK_REF.md](AI_AGENT_QUICK_REF.md) for 5-min guide  
**Full Guide:** See [ADDING_VISUALIZATIONS.md](ADDING_VISUALIZATIONS.md) for complete docs

**Pattern**: Layout algorithm decoupled from rendering - провайдер возвращает Map<id, {x,y,z}>, компонент занимается рендером.

## Architecture Philosophy

### Context-Driven State Management
- **AudioContext** ([src/contexts/AudioContext.tsx](src/contexts/AudioContext.tsx)): Playback state, volume, history (50-item limit)
- **SettingsContext** ([src/contexts/SettingsContext.tsx](src/contexts/SettingsContext.tsx)): Themes, EQ (10-band), custom nodes, localStorage persistence
- **MetadataContext** ([src/contexts/MetadataContext.tsx](src/contexts/MetadataContext.tsx)): Track metadata, AI generation via Gemini API

**Pattern**: Hooks consume contexts via `useAudio()`, `useSettings()`, `useMetadata()` - never access contexts directly in components.

### Custom Hooks Pattern
Encapsulate business logic in hooks ([src/hooks/](src/hooks/)):
- **useAudioPlayer**: Play/pause/skip logic with shuffle mode support
- **useStreamDiscovery**: Radio Browser API search with 300ms debounce
- **useSystemLogs**: Centralized logging (max 100 entries with auto-rotation)

**When to create a new hook**: If logic needs `useState` + `useEffect` and is reused across 2+ components.

### Component Structure
All components < 150 lines. Organization:
- **UI/** - Atomic primitives (Button, IconButton) with variant system
- **Player/** - Playback controls, volume, track info
- **Panels/** - Left nav, right logs, module switcher
- **Modules/** - Feature panels (Discovery, Nodes, Themes, EQ, Logs)
- **Background/** - ShardCloud (3D tag visualization with D3)

**Styling convention**: Tailwind utility classes inline. Theme colors accessed via `theme.accent`, `theme.surface` from context.

## Critical Patterns

### Audio Engine Integration
`audioEngine` ([src/services/audioEngine.ts](src/services/audioEngine.ts)) is a singleton managing Web Audio API:
- **10-band EQ**: Always initialized, filters from 32Hz to 16kHz
- **Signal chain**: Source → Preamp → EQ Filters → Panner → Gain → Limiter → Analyser → Destination
- **Analyser settings**: FFT 1024, smoothing 0.8 for sharp visual response
- **Error handling**: Fallback to default settings on AudioContext failure

**Never**: Call `audioEngine.init()` multiple times - check `isReady` flag first.

### Environment Variables
API keys accessed via Vite's `process.env` injection ([vite.config.ts](vite.config.ts)):
```typescript
define: {
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
}
```
**Local dev**: Create `.env.local` with `GEMINI_API_KEY=your_key` (not tracked)
**Production**: Set in Vercel dashboard

### Gemini AI Metadata
[src/services/geminiService.ts](src/services/geminiService.ts) generates cyberpunk-themed metadata:
- **Model**: `gemini-3-flash-preview` with structured JSON output
- **Fallback**: Graceful degradation if API fails (no error thrown)
- **Usage**: Only for `Provider.GENERATIVE_AI` stations

### Data Persistence
Settings persisted to `localStorage` with key `aurawave_v27_settings`:
- **Auto-save**: On every settings update via `useEffect` in SettingsContext
- **Version suffix**: Increment version number when schema changes to avoid migration errors
- **Structure**: Full settings object serialized as JSON

## Development Workflows

### Running Locally
```bash
npm install          # Install dependencies
npm run dev          # Start dev server on :3000
npm run build        # Production build to dist/
npm run preview      # Preview production build
```

### Adding New Features
1. **New module**: Create in `src/components/Modules/`, add to `ModuleType` enum in ModuleSwitcher
2. **New provider**: Add to `Provider` enum, update `PROVIDERS` array in [src/constants.tsx](src/constants.tsx)
3. **New theme**: Add to `THEMES` array with required properties (bg, surface, text, accent, layout)
4. **New hook**: Place in `src/hooks/`, export from context if it consumes state

### File Size Limits
Keep files under 150 lines:
- **If component grows**: Extract sub-components or move logic to hooks
- **If hook grows**: Split into multiple hooks with single responsibility
- **If context grows**: Consider splitting state domains (already done for audio/settings/metadata)

## Common Pitfalls

### History Navigation
`handleTogglePlay` has `isNavigatingHistory` param:
- **true**: Don't mutate history array (just update index)
- **false**: Append to history and trim to last 49 entries
**Trigger**: Only in history prev/next buttons, not in normal playback

### Module Rotation State
3D rotation state (`rotation`, `moduleRotation`) lives in App.tsx:
- **Global rotation**: For main ShardCloud background
- **Module rotation**: For Discovery module's station cloud
- **Why separate**: Different drag contexts, independent interaction

### Stream Quality Filtering
`purgeBadSignals` in useStreamDiscovery filters stations by:
- **Bitrate** ≥ 96kbps
- **Successful connection** (votes > 0)
- **Homepage exists** (indicates active station)
**Duration**: ~2-5 seconds per station (sequential fetch)

### Theme Layout Types
Themes have `layout` property (MONOLITH, COCKPIT, DATAVIEW, CONTROL_PANEL):
- **Currently unused**: Prepared for future layout switching feature
- **Don't remove**: Part of theme schema, may break saved settings

## External APIs

### Radio Browser API
Endpoint: `https://de1.api.radio-browser.info/json/stations/search`
- **Parameters**: `name`, `limit`, `hidebroken=true`, `order=votes`
- **Rate limit**: None documented, use 300ms debounce on search input
- **CORS**: Enabled, no proxy needed

### Gemini API
Model: `gemini-3-flash-preview` via `@google/genai` package
- **Cost**: Free tier with quota limits
- **Response schema**: Structured JSON enforced via `responseSchema` parameter
- **Fallback**: App works without API key (static metadata)

## Deployment

### Vercel (Current)
- **Auto-deploy**: On push to main branch
- **Config**: [vercel.json](vercel.json) sets Vite framework, SPA rewrites
- **Domain**: chefai.kz with custom DNS
- **Env vars**: Set GEMINI_API_KEY in Vercel dashboard

### Build Output
- **Directory**: `dist/`
- **Assets**: Hashed filenames for cache busting
- **SPA**: All routes redirect to index.html

## Troubleshooting Reference

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues, or:
- **Audio not playing**: Check browser autoplay policy, user gesture required
- **EQ not working**: Verify AudioContext is initialized (`audioEngine.isReady`)
- **Settings not saving**: Check localStorage quota, clear if needed
- **Gemini fails**: Check API key, fallback metadata will be used

## Code Conventions

- **Component exports**: Named exports (`export const Component: React.FC`)
- **Prop interfaces**: Inline interfaces above component definition
- **Comments**: Russian for user-facing docs, English for technical inline comments
- **TypeScript**: Strict mode, no `any` except in external API responses
- **Naming**: PascalCase for components, camelCase for functions/variables, UPPER_SNAKE for constants

## When Adding AI-Generated Code

1. **Check imports**: Ensure Context hooks are imported from `/contexts/`, not relative paths
2. **Verify state flow**: State should flow Context → Hook → Component (unidirectional)
3. **Test localStorage**: New settings properties must be added to DEFAULT_SETTINGS
4. **Maintain file size**: Split if approaching 150 lines
5. **Update types**: Add new enums/interfaces to [src/types.ts](src/types.ts)
