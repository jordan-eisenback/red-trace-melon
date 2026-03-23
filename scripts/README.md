# Scripts directory

This folder contains a mixture of utility scripts (source) and generated output files (artifacts) used during data recovery, mapping proposals, and diagnostics.

Which files are source (keep):
- *.cjs, *.js, *.ts (script implementations used to import, propose, dedupe, and validate)

Which files are generated/artifacts (ignored by .gitignore and safe to remove from git):
- JSON previews: `proposed-apply-*.json`, `proposed-single-dryrun.json`, `proposed-*.json`, `issues-*.json`, `validator-snapshot.json` (these are outputs of script runs)
- CSV exports: `capability-diagnostic.csv`, `proposed-mappings*.csv`, `mappings.csv`, etc.
- Text logs: `propose-mappings-output.txt`, `auto-fix-output*.txt`, `auto-dedupe-output.txt`, etc.

How to regenerate
- Most of these files are produced by running the corresponding script. Examples:
  - npm run <script> or node scripts/propose-mappings.cjs
  - node scripts/generate-capability-diagnostic.cjs
  - node scripts/import-csv-to-epics.cjs

Backups
- The scripts create backups under `scripts/backups/` when they write important data files. Those backups are also ignored for future commits.

If you need any of the removed artifacts restored, re-run the producing script and the artifact will be recreated.
