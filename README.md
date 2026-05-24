# 🧭 Zenith Focus — Student Productivity & Burnout Prevention Dashboard

Zenith Focus is a premium, high-fidelity single-page web dashboard designed specifically for students preparing for high-pressure exams. By tracking study habits, calculating fatigue parameters, and utilizing dynamic localized cognitive coaching suggestions, the app helps students achieve peak focus while shielding them from severe mental burnout.

---

## 🚀 Key Visual & Functional Features

1. **Dashboard Overview**:
   - **Focus Score (0-100)**: Dynamic performance index rewarded by active study cycles and docked by distracted actions or page visibility tab switches.
   - **Burnout Index (0-100)**: Continuous stress indicator analyzing work density, screen hours, and rest rhythms.
   - **Interactive SVG Gauges**: High-contrast, glowing circular indicators that dynamically change styling based on health status.
   - **Interactive Chart.js visualizers**: Dynamic doughnut chart of daily app time ratios.

2. **Pomodoro Timer Workspace**:
   - Immersive timer controls (Study, Short Break, Long Break).
   - **Ambient Audio Generator**: Synthesizes custom white noise, deep rainfall, or detuned binaural relaxation beats directly in the browser using the **Web Audio API** (requires zero external audio assets).
   - Visual countdown ring syncing to timer ticking.

3. **Focus Lab & Sensor Simulator**:
   - **Page Visibility Sensor**: Actively tracks if the student changes browser tabs or minimizes the window while studying, logging a "Tab-Blur Distraction" penalty.
   - **Autopilot Simulator**: Models a realistic student workflow, dynamically logging productive work, research notes, and random distractions over time.
   - **Manual Event Injector**: Tactile controls to simulate immediate study activity, chatting, or gaming to watch real-time graph updates.
   - **Dynamic Performance Log**: A real-time timeline scrolling feed of active focus status.

4. **Aura Cognitive Advisor (AI Coach)**:
   - Dynamic coach dialog box evaluating current dashboard stats to provide context-aware stress management advice.
   - Presets for exam stress guides, burnout prevention strategies, and personalized study routine generators.
   - **Interactive Guided Breathing Exercise**: Renders a gorgeous expanding/contracting breathing bubble directly inside the chat log to lead the student through a 1-minute box breathing relaxation break.

5. **Daily Performance Analytics**:
   - Summary statistics cards of total study hours, distractions, blurs, and cycles completed.
   - A detailed historic timeline of performance scores.
   - **High-Fidelity Printable Reports**: Complete with full print-specific media query CSS. Printing the page (`Ctrl + P` or `Print Report` button) automatically compiles a clean, professional, A4 white-paper-optimized format, excluding all dashboard interfaces, sidebar navigations, and buttons.

---

## 📂 Codebase Architecture

The project has a completely lightweight, modular, and dependency-free structure:

```text
c:\Users\karthikeyan\Desktop\health_app\
 ├── index.html       # Elegant glassmorphic structure, layouts, and DOM references
 ├── styles.css       # Premium CSS design system, variables, custom responsive frames, animations, and print overrides
 ├── app.js           # Main controller orchestrating Pomodoro state machines, LocalStorage, sensors, and Chart.js datasets
 ├── ai-engine.js     # Heuristic cognitive coaching NLP engine, subject strategies, and assessment builders
 └── package.json     # Optional developer server configuration (Vite)
```

---

## ⚡ Setup & Verification Instructions

### How to Run Locally

Since Zenith Focus is written in pure semantic HTML5, CSS3, and ES6 Javascript, **no installation or compilation is needed!** 

1. Navigate to the project directory: `c:\Users\karthikeyan\Desktop\health_app\`
2. Double-click **`index.html`** to open it immediately in any modern web browser (Chrome, Edge, Firefox, Safari).
3. Alternatively, if you have any lightweight local web server (e.g., Python's `http.server`, Live Server, or VS Code server extensions), run it in the root folder to serve files locally.
   - Example Python command: `python -m http.server 8000` (then open `http://localhost:8000`)

### Verification Guide

- **Verify Pomodoro Transitions**: Select "Short Break" or "Long Break". Change settings to `1` minute, click Play, and wait for the countdown to hit zero. Observe the synthetic chime sound playing, and the timer transitioning smoothly back to Study mode automatically!
- **Verify LocalStorage Persistence**: Adjust your study time or manual stress levels, select a custom subject (e.g. *Computer Science*), and refresh your browser. All metrics, configuration limits, selected subjects, and timeline charts restore perfectly from your last session!
- **Verify Tab Visibility Distraction**: Open the *Focus Lab* tab. Start the Study Timer, then click on a new browser tab. Wait 3 seconds and return. You will observe a warning toast notification showing a "Focus penalty" and a new log entry added in the performance log feed tracking the tab visibility blur!
- **Verify Guided Breathing Exercise**: Go to the *Aura Coach* tab. Click on **"Let's do a guided breathing exercises session"**. Watch the coach reply with a breathing module, and watch the circular breathing bubble expand ("Inhale") and contract ("Exhale") in a smooth 4s rhythm.
- **Verify Print Report**: Go to the *Daily Analytics* tab, click **"Print Performance Report"** (or hit `Ctrl + P`). The browser print preview will load an elegant high-contrast white document with structured cards, ready to print or save to PDF, with all dark menus and navigation buttons cleanly hidden.
