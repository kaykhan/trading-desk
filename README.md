# Trading Desk

Desktop game foundation built with Electron, React, and Vite.

## Scripts

- `npm run dev` starts Vite and launches Electron once the renderer is ready.
- `npm run build` builds the renderer into `dist` and compiles Electron into `dist-electron`.
- `npm run start` builds everything and opens Electron against the built renderer.
- `npm run lint` runs ESLint across the project.
- `npm run typecheck` runs TypeScript checks for both renderer and Electron code.

## Project structure

- `electron/main.ts` creates the desktop window and registers IPC handlers.
- `electron/preload.ts` exposes a safe bridge to the renderer.
- `src/App.tsx` contains the starter game shell UI.
- `src/App.css` and `src/index.css` define the initial visual direction.
- `shared/game.ts` holds shared renderer/main process TypeScript contracts.

## Next build steps

- Replace the placeholder scene with your actual gameplay surface or canvas.
- Add more IPC endpoints for save data, settings, audio, or file access.
- Introduce a game state layer once core systems start to grow.
