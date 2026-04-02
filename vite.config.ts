import { defineConfig } from 'vitest/config'
import path from 'path'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    // Dev-only middleware to persist all data contexts to disk
    {
      name: 'save-data-middleware',
      configureServer(server) {
        // ── helpers ──────────────────────────────────────────────────────────
        const dataDir = path.resolve(__dirname, 'src', 'app', 'data');
        const backupDir = path.resolve(__dirname, 'scripts', 'backups');

        function writeDataFile(filename: string, content: string) {
          fs.mkdirSync(dataDir, { recursive: true });
          fs.writeFileSync(path.join(dataDir, filename), content, 'utf8');
        }

        function writeBackup(name: string, payload: unknown) {
          fs.mkdirSync(backupDir, { recursive: true });
          const ts = new Date().toISOString().replace(/[:.]/g, '-');
          const backupPath = path.join(backupDir, `${name}-backup-${ts}.json`);
          fs.writeFileSync(backupPath, JSON.stringify(payload, null, 2), 'utf8');
          // Keep only the most recent 30 backups for this name prefix
          const all = fs.readdirSync(backupDir)
            .filter((f) => f.startsWith(`${name}-backup-`))
            .sort();
          if (all.length > 30) {
            all.slice(0, all.length - 30).forEach((f) =>
              fs.unlinkSync(path.join(backupDir, f))
            );
          }
          return backupPath;
        }

        function readBody(req: import('http').IncomingMessage): Promise<string> {
          return new Promise((resolve) => {
            let body = '';
            req.on('data', (chunk: Buffer) => (body += chunk));
            req.on('end', () => resolve(body));
          });
        }

        function jsonMiddleware(
          route: string,
          handler: (payload: Record<string, unknown>, res: import('http').ServerResponse) => void
        ) {
          server.middlewares.use(route, async (req, res, next) => {
            if (req.method !== 'POST') return next();
            try {
              const body = await readBody(req);
              const payload = JSON.parse(body || '{}') as Record<string, unknown>;
              res.setHeader('content-type', 'application/json');
              handler(payload, res);
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ ok: false, error: String(err) }));
            }
          });
        }

        // ── /api/save-epics (existing — preserved) ────────────────────────
        jsonMiddleware('/api/save-epics', (payload, res) => {
          const epics = payload.epics ?? [];
          const userStories = payload.userStories ?? [];
          const storyMap = payload.storyMap ?? [];
          const storyJam = payload.storyJam ?? { nodes: [], edges: [] };

          let content = `export const initialEpics = ${JSON.stringify(epics, null, 2)};\n\nexport const initialUserStories = ${JSON.stringify(userStories, null, 2)};\n`;

          if (Array.isArray(storyMap)) {
            content += `\nexport const initialStoryMap = ${JSON.stringify(storyMap, null, 2)};\n`;
            writeDataFile('initial-storymap.ts', `import { StoryMap } from "../types/storymap";\n\nexport const initialStoryMap: StoryMap = ${JSON.stringify(storyMap, null, 2)};\n`);
          }
          if (storyJam && typeof storyJam === 'object') {
            writeDataFile('initial-storyjam.ts', `import { StoryJam } from "../types/storyjam";\n\nexport const initialStoryJam: StoryJam = ${JSON.stringify(storyJam, null, 2)};\n`);
          }

          const outPath = path.join(dataDir, 'initial-epics.ts');
          fs.writeFileSync(outPath, content, 'utf8');
          const backupPath = writeBackup('epics', { epics, userStories, storyMap, storyJam });
          res.end(JSON.stringify({ ok: true, outPath, backupPath }));
        });

        // ── /api/save-requirements ────────────────────────────────────────
        jsonMiddleware('/api/save-requirements', (payload, res) => {
          const requirements = payload.requirements ?? [];
          const content = `import { Requirement } from "../types/requirement";\n\nexport const initialRequirements: Requirement[] = ${JSON.stringify(requirements, null, 2)};\n`;
          writeDataFile('initial-requirements.ts', content);
          const backupPath = writeBackup('requirements', { requirements });
          res.end(JSON.stringify({ ok: true, backupPath }));
        });

        // ── /api/save-frameworks ──────────────────────────────────────────
        jsonMiddleware('/api/save-frameworks', (payload, res) => {
          const frameworks = payload.frameworks ?? [];
          const content = `import { Framework } from "../types/framework";\n\nexport const initialFrameworks: Framework[] = ${JSON.stringify(frameworks, null, 2)};\n`;
          writeDataFile('initial-frameworks.ts', content);
          const backupPath = writeBackup('frameworks', { frameworks });
          res.end(JSON.stringify({ ok: true, backupPath }));
        });

        // ── /api/save-vendors ─────────────────────────────────────────────
        jsonMiddleware('/api/save-vendors', (payload, res) => {
          const vendorData = payload.vendorData ?? {};
          const content = `import { VendorAppData } from "../types/vendor";\n\nexport const initialVendorData: VendorAppData = ${JSON.stringify(vendorData, null, 2)};\n`;
          writeDataFile('initial-vendors.ts', content);
          const backupPath = writeBackup('vendors', { vendorData });
          res.end(JSON.stringify({ ok: true, backupPath }));
        });

        // ── /api/save-workstreams ─────────────────────────────────────────
        jsonMiddleware('/api/save-workstreams', (payload, res) => {
          const workstreams = payload.workstreams ?? [];
          const content = `import { Workstream } from "../types/workstream";\n\nexport const initialWorkstreams: Workstream[] = ${JSON.stringify(workstreams, null, 2)};\n`;
          writeDataFile('initial-workstreams.ts', content);
          const backupPath = writeBackup('workstreams', { workstreams });
          res.end(JSON.stringify({ ok: true, backupPath }));
        });

        // ── /api/save-all ─────────────────────────────────────────────────
        // Single endpoint for the auto-save scheduler — accepts all contexts
        // in one payload and writes each data file + a unified backup.
        jsonMiddleware('/api/save-all', (payload, res) => {
          const results: Record<string, string> = {};

          if (payload.requirements !== undefined) {
            const content = `import { Requirement } from "../types/requirement";\n\nexport const initialRequirements: Requirement[] = ${JSON.stringify(payload.requirements, null, 2)};\n`;
            writeDataFile('initial-requirements.ts', content);
          }
          if (payload.frameworks !== undefined) {
            const content = `import { Framework } from "../types/framework";\n\nexport const initialFrameworks: Framework[] = ${JSON.stringify(payload.frameworks, null, 2)};\n`;
            writeDataFile('initial-frameworks.ts', content);
          }
          if (payload.epics !== undefined || payload.userStories !== undefined) {
            const epics = payload.epics ?? [];
            const userStories = payload.userStories ?? [];
            const storyMap = payload.storyMap ?? [];
            const storyJam = payload.storyJam ?? { nodes: [], edges: [] };
            const content = `export const initialEpics = ${JSON.stringify(epics, null, 2)};\n\nexport const initialUserStories = ${JSON.stringify(userStories, null, 2)};\n`;
            writeDataFile('initial-epics.ts', content);
            if (Array.isArray(storyMap)) {
              writeDataFile('initial-storymap.ts', `import { StoryMap } from "../types/storymap";\n\nexport const initialStoryMap: StoryMap = ${JSON.stringify(storyMap, null, 2)};\n`);
            }
            if (storyJam && typeof storyJam === 'object') {
              writeDataFile('initial-storyjam.ts', `import { StoryJam } from "../types/storyjam";\n\nexport const initialStoryJam: StoryJam = ${JSON.stringify(storyJam, null, 2)};\n`);
            }
          }
          if (payload.vendorData !== undefined) {
            const content = `import { VendorAppData } from "../types/vendor";\n\nexport const initialVendorData: VendorAppData = ${JSON.stringify(payload.vendorData, null, 2)};\n`;
            writeDataFile('initial-vendors.ts', content);
          }
          if (payload.workstreams !== undefined) {
            const content = `import { Workstream } from "../types/workstream";\n\nexport const initialWorkstreams: Workstream[] = ${JSON.stringify(payload.workstreams, null, 2)};\n`;
            writeDataFile('initial-workstreams.ts', content);
          }

          results.backupPath = writeBackup('save-all', payload);
          res.end(JSON.stringify({ ok: true, ...results }));
        });
      },
    },
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    watch: {
      // The save-data-middleware writes initial-*.ts files on every context
      // change. Without this, Vite HMR would detect those writes and trigger
      // a full-reload loop, breaking E2E tests and disrupting local dev.
      ignored: ['**/src/app/data/initial-*.ts', '**/scripts/backups/**'],
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  test: {
    include: ['src/__tests__/**/*.test.ts', 'src/__tests__/**/*.test.tsx'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      // Only measure coverage over files that have actual logic (not pure type defs or seed data)
      include: ['src/app/utils/**', 'src/app/hooks/**'],
      exclude: [
        'src/app/components/ui/**',  // shadcn-generated primitives
        'src/app/data/**',           // static seed data files
        'e2e/**',
        'src/__tests__/**',
      ],
      thresholds: {
        // Baseline thresholds — CI fails if coverage regresses below these.
        // Raise to 80/70/80 once issues #41–#43 (context + utility tests) land.
        lines:      45,
        branches:   50,
        functions:  30,
        statements: 45,
      },
    },
  },
})
