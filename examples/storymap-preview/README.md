Story Map Preview
=================

This is a small, self-contained preview showing a horizontal story map layout.

How to open
-----------

1. Open `examples/storymap-preview/index.html` directly in your browser (file://) or serve the folder using a local static server. For example, from the repository root:

```bash
# from project root
python -m http.server 8000
# then open http://localhost:8000/examples/storymap-preview/
```

What it shows
------------

- Horizontal columns for activities
- Cards stacked vertically with quick meta
- Click a card to open a right-side detail panel
- Export JSON and CSV buttons

This preview is intentionally minimal. If you want, I can:
- Commit an equivalent React component into `src/app/pages/StoryMapping.tsx` (progressive enhancement)
- Add an Auto-generate modal that reads `src/app/data/initial-requirements.ts` and `initial-epics.ts` to build the preview
