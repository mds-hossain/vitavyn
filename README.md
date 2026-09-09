# Vitavyn

**Live App:** [vitavyn.lovable.app](https://vitavyn.lovable.app)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

**A premium, local-first health operating system designed for clinical accuracy and calm user experience.**

Vitavyn bridges the gap between complex medical tracking and elegant, non-judgmental design. It allows users to meticulously track medications, chronic conditions, and universal health measurements without the clutter of traditional health apps.

*Note: This project is being actively developed in collaboration with [Lovable](https://lovable.dev) to explore and push the boundaries of AI-assisted software engineering and agentic workflows.*

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
   ```sh
   git clone [https://github.com/mds-hossain/vitavyn.git](https://github.com/mds-hossain/vitavyn.git)
