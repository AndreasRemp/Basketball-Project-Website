# Shootalyze, marketing site

Landing page for Shootalyze, a computer-vision tool that measures basketball
shooting mechanics from a single phone video.

Film one shot from the side, and the pipeline returns release angle, entry
angle, release height, elbow and knee angles through the motion, the isolated
release frame, plotted charts, and a written coaching note.

The numbers, charts and feedback text shown on the page are real output from the
pipeline for one real shot. They are not sample data.

## Stack

Plain static HTML, CSS and JavaScript. No build step, no framework, no
dependencies, nothing to install.

```
index.html     markup, all sections
styles.css     design tokens in :root, then section blocks
app.js         waitlist link, demo rendering, scroll behaviour, menu, accordion
assets/img     logo, release frame, matplotlib angle charts
assets/video   annotated demo clip
CLAUDE.md      conventions and gotchas for anyone (or any agent) editing this
```

## Running it locally

The page needs a server context. The video and the entire demo section are
rendered by JavaScript, so opening `index.html` from the filesystem will not
show them correctly.

Any static server works:

```bash
python -m http.server 8000
# then open http://127.0.0.1:8000
```

Or use the Live Server / Live Preview extension in VS Code.

## Editing notes

Read `CLAUDE.md` before changing the design. It documents the token system and a
few non-obvious traps, including:

- The gradient headline uses `background-clip:text`, which needs its padding
  hack or descenders get clipped.
- The angle charts are matplotlib renders on white, inverted in CSS to sit on
  the dark theme. A chart rendered any other way will break under that filter.
- Anchor targets need `scroll-margin-top` to clear the sticky header.

## Status

Pre-launch. The pipeline works and a mobile version is in testing. The page
links to a waitlist form for early access.
