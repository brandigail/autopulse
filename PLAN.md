# AutoPulse: Build Plan

- [x] 1. Scaffold the project (stack in `CLAUDE.md`), strict `tsconfig`, lint, `netlify.toml`, `.env.example`; first working commit
- [x] 2. Dexie schema and `types/`
- [x] 3. App shell, bottom navigation, theme
- [x] 4. Vehicle CRUD and switcher
- [x] 5. Service log CRUD
- [x] 6. Fuel log CRUD
- [x] 7. Efficiency and cost-per-distance calculations with unit tests
- [x] 8. Fuel trend chart
- [x] 9. Reminder rules and due/overdue engine
- [x] 10. Dashboard with due items and summary stats
- [x] 11. Seed demo vehicle data
- [x] 12. PWA manifest, icons, offline shell and update-prompt banner
- [x] 13. Mobile polish at 375px
- [x] 14. Quality gate: `npm run build`, lint and `tsc --noEmit` all pass; no console errors; core flow tested at 375px and desktop (25 browser checks, 35 unit tests)
- [x] 15. README: pitch, features, stack, architecture notes, screenshot placeholders, run steps, 3-bullet "what to demo to a recruiter", Phase 2 list
- [ ] 16. Deploy to Netlify, verify the public URL end to end (deferred: deploys happen together after every project is built)
- [x] 17. Push to GitHub (live URL in `README.md` and root `LINKS.md` stays TBD until step 16)
