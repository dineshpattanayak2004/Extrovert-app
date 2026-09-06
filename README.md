# Extroverts - Signup Wizard

A high-fidelity, front-end replication of a mobile app's signup flow, rebuilt as a fully responsive web application. Built as part of a **Frontend Engineering Assessment** - replicating the signup wizard of [Extroverts - Party, Hangout, Vibe](https://play.google.com/store/apps/details?id=com.pro.nubpack).

The wizard guides a new user through email verification and profile creation in four steps, with real-time validation, contextual error handling, global toast alerts, simulated loading states, and cross-field dependent dropdowns.

## Features

### Landing Page
- Animated gradient hero with floating color orbs
- Clear call-to-action into the signup flow

### Terms & Conditions
- Scrollable terms document with a mandatory agreement checkbox
- "I Agree" stays disabled until the checkbox is ticked

### 4-Step Signup Wizard

| Step | Purpose |
|------|---------|
| 1. Email | Email collection with live format validation |
| 2. OTP | 6-digit segmented code entry, resend timer, attempt tracking |
| 3. Profile | Name, age (18+ enforced), pronoun selection chips |
| 4. Community | Phone number, state/city/college cascading selects |

### Validation & Error Handling
- Real-time validation on both **blur** and **change** events
- Contextual error messages beneath every field
- Global **toast alerts** (success / error / info) for submission outcomes
- Character limits with live counters (email 100, name 50)
- Numeric-only inputs for age and phone
- Whitespace-only submissions are rejected

### User Experience
- Button **spinners** during simulated submissions (prevents duplicate entries)
- Segmented **OTP input** with auto-advance, backspace navigation, paste support and a 30s resend countdown
- Age gate: users under 18 are clearly blocked with a contextual message
- **Cascading dropdowns**: state filters available cities, city filters available colleges
- **Quick review panel** on the final step - tap any item to jump back and edit
- Back navigation via button and clickable progress indicator
- Success screen with confetti animation on completion
- Fully responsive across mobile, tablet and desktop viewports

## Tech Stack

- [React 19](https://react.dev/) - UI (hooks only, no external state library)
- [Vite](https://vite.dev/) - build tool and dev server
- Vanilla CSS - custom design system with CSS variables, no UI framework
- [Poppins](https://fonts.google.com/specimen/Poppins) - typeface

## Getting Started

```bash
# install dependencies
npm install

# start the dev server
npm run dev
```

Then open http://localhost:5173

```bash
# production build
npm run build

# lint the codebase
npm run lint
```

## Demo Notes

This is a **front-end only** exercise, so email delivery and OTP verification are simulated:

- A demo banner on the OTP step shows the simulated verification code
- Wrong codes trigger error toasts and an attempt counter (5 max)
- Resending generates a fresh code and restarts the countdown
- Every "submission" simulates a network round-trip (1.2s) with button spinners

Swapping these simulations for real API calls would only require replacing the `setTimeout` blocks in `goNext` / `handleResend` with fetch calls.

## Screenshots

<!-- Add screenshots/gifs of the landing page, wizard steps and success screen here -->

