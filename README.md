# Vitavyn

**A premium, local-first health operating system designed for clinical accuracy and calm user experience.**

Vitavyn bridges the gap between complex medical tracking and elegant, non-judgmental design. It allows users to meticulously track medications, chronic conditions, and universal health measurements without the clutter of traditional health apps.

## Overview

Traditional health apps often use guilt-based language or rigid, incomplete medical databases. Vitavyn is built differently. It utilizes a hybrid architecture featuring a local seed dictionary of the most common chronic conditions, combined with infinite flexibility for users to create custom measurements and clinical relationships on the fly. 

## Key Features

* **Advanced Medication Management:** Granular control over medication forms, dose units, and dynamic clinical time windows (e.g., Morning 06:00 to 11:59).
* **Smart Condition Autocomplete:** A lightweight, built-in clinical dictionary that auto-suggests relevant tracking metrics for common conditions (e.g., suggesting HbA1c and Blood Glucose for Diabetes).
* **Universal Measurement Architecture:** A decoupled database where vitals like Blood Pressure and Weight exist independently but can be filtered through the lens of specific chronic conditions.
* **Non-Judgmental UX:** Actions focus on objective logging (e.g., "Record dose" instead of "Take pill") to support mental well-being in chronic illness management.
* **Privacy by Design:** Built with a local-first architecture ensuring sensitive health data is processed and stored securely.

## Tech Stack

* **Frontend:** React, TypeScript, Tailwind CSS
* **UI Components:** shadcn/ui, Radix UI, Lucide React Icons
* **Data & State:** IndexedDB (Local-first), Supabase, TanStack Query
* **Tooling:** Vite, Lovable AI

## Development & Installation

Prefer working locally? You need Node.js and npm installed on your machine.

1. **Clone the repository:**
   `git clone https://github.com/yourusername/vitavyn.git`

2. **Navigate to the directory:**
   `cd vitavyn`

3. **Install dependencies:**
   `npm install`

4. **Start the development server:**
   `npm run dev`

## Design Philosophy

Vitavyn follows strict UI/UX guidelines to ensure a premium feel:
* **Minimalism:** No emojis, utilizing crisp SVG line iconography.
* **Density:** Intelligent use of CSS Grid and Flexbox to maximize data scannability without vertical bloat on mobile devices.
* **Progressive Disclosure:** Hiding complex administrative fields behind smooth expand/collapse components.

## Authors

* **Md Shakhawat Hossain** - UX/UI Design & Engineering

## License

This project is proprietary and confidential. All rights reserved.
