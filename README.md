# 📚 Smart Study Planner & Analytics Dashboard

A comprehensive, vanilla web application designed to help students track their study sessions, categorize subjects, and analyze their learning habits through a dynamic, data-driven dashboard.

## ✨ Key Features
* **Notebook Architecture:** Create and manage separate notebooks for different semesters or major topics.
* **Micro-Tracking:** Log specific start times, finish times, and study categories (subjects) down to the minute.
* **Smart Analytics Algorithm:** The app processes historical data to automatically calculate your optimal study habits, including "Ideal Session Length" and "Ideal Break Length".
* **Dynamic Consistency Calendar:** A living heatmap calendar that automatically populates based on logged study days.
* **Cloud Sync (Serverless Backend):** Seamlessly syncs data to a custom Google Apps Script backend (Google Sheets) via an automated queue system, ensuring no data is lost even without a traditional database.

## 🛠️ Technologies Used
* **Frontend:** HTML5, CSS3 (Custom responsive layout using CSS Grid and Flexbox).
* **Logic:** Vanilla JavaScript (ES6+). The project follows the **Separation of Concerns** principle with modularized logic.
* **Data Visualization:** Chart.js (with DataLabels plugin) for dynamic trend and category breakdown charts.
* **Backend / Database:** Google Apps Script (REST API) interacting with Google Sheets for free, secure cloud storage.

## 📁 Project Structure
The codebase is modularized for maintainability and scalability:

├── index.html        # DOM Structure & Views
├── style.css         # Styling & UI Design
├── README.md         # Project Documentation
└── js/
    ├── data.js       # Cloud sync, local storage, and data parsing
    ├── ui.js         # DOM manipulation, event listeners, and navigation
    └── analytics.js  # Data science logic, statistical aggregations, and Chart.js


## 💡 How It Works
1. Users create a new Notebook and define their current subjects/categories.
2. Daily study sessions are logged with specific timestamps.
3. The `analytics.js` engine filters data by Time (Day/Week/Month/All Time) and compares the duration of sessions vs. breaks to output a customized "Winning Strategy" for the user.
