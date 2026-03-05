{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tqr\tx566\tqr\tx1133\tqr\tx1700\tqr\tx2267\tqr\tx2834\tqr\tx3401\tqr\tx3968\tqr\tx4535\tqr\tx5102\tqr\tx5669\tqr\tx6236\tqr\tx6803\pardirnatural\qr\partightenfactor0

\f0\fs24 \cf0 # \uc0\u55357 \u56538  Smart Study Planner & Analytics Dashboard\
\
A comprehensive, vanilla web application designed to help students track their study sessions, categorize subjects, and analyze their learning habits through a dynamic, data-driven dashboard.\
\
## \uc0\u10024  Key Features\
* **Notebook Architecture:** Create and manage separate notebooks for different semesters or major topics.\
* **Micro-Tracking:** Log specific start times, finish times, and study categories (subjects) down to the minute.\
* **Smart Analytics Algorithm:** The app processes historical data to automatically calculate your optimal study habits, including "Ideal Session Length" and "Ideal Break Length".\
* **Dynamic Consistency Calendar:** A living heatmap calendar that automatically populates based on logged study days.\
* **Cloud Sync (Serverless Backend):** Seamlessly syncs data to a custom Google Apps Script backend (Google Sheets) via an automated queue system, ensuring no data is lost even without a traditional database.\
\
## \uc0\u55357 \u57056 \u65039  Technologies Used\
* **Frontend:** HTML5, CSS3 (Custom responsive layout using CSS Grid and Flexbox).\
* **Logic:** Vanilla JavaScript (ES6+). The project follows the **Separation of Concerns** principle with modularized logic.\
* **Data Visualization:** Chart.js (with DataLabels plugin) for dynamic trend and category breakdown charts.\
* **Backend / Database:** Google Apps Script (REST API) interacting with Google Sheets for free, secure cloud storage.\
\
## \uc0\u55357 \u56513  Project Structure\
The codebase is modularized for maintainability and scalability:\
```text\
\uc0\u9500 \u9472 \u9472  index.html        # DOM Structure & Views\
\uc0\u9500 \u9472 \u9472  style.css         # Styling & UI Design\
\uc0\u9500 \u9472 \u9472  README.md         # Project Documentation\
\uc0\u9492 \u9472 \u9472  js/\
    \uc0\u9500 \u9472 \u9472  data.js       # Cloud sync, local storage, and data parsing\
    \uc0\u9500 \u9472 \u9472  ui.js         # DOM manipulation, event listeners, and navigation\
    \uc0\u9492 \u9472 \u9472  analytics.js  # Data science logic, statistical aggregations, and Chart.js}