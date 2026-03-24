import { defineConfig } from 'vite'
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
    // Dev-only middleware to allow the frontend to save epics/user stories to disk
    {
      name: 'save-epics-middleware',
      configureServer(server) {
        server.middlewares.use('/api/save-epics', (req, res, next) => {
          if (req.method !== 'POST') return next();
          let body = '';
          req.on('data', (chunk) => (body += chunk));
          req.on('end', () => {
            try {
              const payload = JSON.parse(body || '{}');
              const epics = payload.epics || [];
              const userStories = payload.userStories || [];
              const storyMap = payload.storyMap || [];
              const storyJam = payload.storyJam || { nodes: [], edges: [] };

              const outPath = path.resolve(__dirname, 'src', 'app', 'data', 'initial-epics.ts');
              let content = `export const initialEpics = ${JSON.stringify(epics, null, 2)};

export const initialUserStories = ${JSON.stringify(userStories, null, 2)};
`;

              if (storyMap && Array.isArray(storyMap)) {
                content += `\nexport const initialStoryMap = ${JSON.stringify(storyMap, null, 2)};\n`;
                // Also write a dedicated file for the story map to keep things modular
                const smPath = path.resolve(__dirname, 'src', 'app', 'data', 'initial-storymap.ts');
                fs.writeFileSync(smPath, `import { StoryMap } from \"../types/storymap\";\n\nexport const initialStoryMap: StoryMap = ${JSON.stringify(storyMap, null, 2)};\n`, 'utf8');
              }

              // Persist the freeform StoryJam board if provided
              if (storyJam && typeof storyJam === 'object') {
                const sjPath = path.resolve(__dirname, 'src', 'app', 'data', 'initial-storyjam.ts');
                fs.writeFileSync(sjPath, `import { StoryJam } from \"../types/storyjam\";\n\nexport const initialStoryJam: StoryJam = ${JSON.stringify(storyJam, null, 2)};\n`, 'utf8');
              }

              // Backup as JSON for safety
              const backupDir = path.resolve(__dirname, 'scripts', 'backups');
              fs.mkdirSync(backupDir, { recursive: true });
              const ts = new Date().toISOString().replace(/[:.]/g, '-');
              const backupPath = path.join(backupDir, `initial-epics-backup-${ts}.json`);
              fs.writeFileSync(backupPath, JSON.stringify({ epics, userStories, storyMap, storyJam }, null, 2), 'utf8');

              fs.writeFileSync(outPath, content, 'utf8');

              res.setHeader('content-type', 'application/json');
              res.end(JSON.stringify({ ok: true, outPath, backupPath }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ ok: false, error: String(err) }));
            }
          });
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

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
