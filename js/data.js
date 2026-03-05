// --- Global Variables & Cloud Configuration ---
const CLOUD_URL = 'https://script.google.com/macros/s/AKfycbzgAd_QvMdP4lD5x_tiXxV1cQwKaDrMrJ9zHFd9abmHUKfdnd_2m7hRtThHyhXGXPUi/exec';
const STORAGE_KEY = 'studyApp_NotebookData';
let syncTimer;
let currentNotebookId = null;

// --- Local Storage Management ---
function loadAllData() { 
    const data = localStorage.getItem(STORAGE_KEY); 
    return data ? JSON.parse(data) : { notebooks: {} }; 
}

function saveAllData(dataObj) { 
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataObj)); 
}

// --- Date Formatting Helper ---
function getFormattedDate(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// --- HUGE PDF + ICS PARSED DATABASE (Semester B 2025) ---
const mySemesterData = [
    {d:"2025-03-17", s:[["15:15","16:00","תרגול ליניארית 1"],["16:00","18:15","תרגול ליניארית 1"],["18:15","19:00","תרגול ליניארית 1"],["19:15","19:30","תרגול ליניארית 1"]]},
    {d:"2025-03-19", s:[["08:00","10:00","הרצאה ליניארית 1"],["10:00","12:00","תרגול סי"],["12:00","14:00","תרגול סי"],["14:00","15:00","תרגול סי"],["15:00","17:00","תרגול סי"]]},
    {d:"2025-03-20", s:[["12:00","13:30","הרצאה ליניארית 1"],["14:00","15:00","הרצאה סי"],["15:00","16:00","הרצאה סי"],["16:00","17:00","הרצאה ליניארית 1"],["17:00","18:00","הרצאה ליניארית 1"]]},
    {d:"2025-03-23", s:[["08:30","09:15","תרגול סי"],["09:15","10:00","תרגול סי"],["10:00","11:00","תרגול סי"],["11:00","11:30","תרגול סי"],["11:30","12:00","תרגול סי"],["12:00","13:30","תרגול סי"],["13:30","14:00","תרגול סי"],["14:00","15:30","תרגול סי"]]},
    {d:"2025-03-24", s:[["10:45","11:30","תרגול ליניארית 1"],["11:30","12:30","תרגול ליניארית 1"],["12:30","13:30","תרגול ליניארית 1"],["14:00","16:00","הרצאה סי"],["16:00","18:00","הרצאה סי"],["18:00","19:30","תרגול ליניארית 1"]]},
    {d:"2025-03-25", s:[["10:00","10:45","הרצאה ליניארית 1"],["11:00","11:45","הרצאה ליניארית 1"],["12:30","13:30","תרגול סי"],["14:00","15:00","תרגול סי"],["15:00","16:00","הרצאה ליניארית 1"],["16:00","17:00","הרצאה ליניארית 1"],["17:00","18:00","תרגול סי"]]},
    {d:"2025-03-26", s:[["10:00","10:45","הרצאה ליניארית 1"],["11:00","11:45","הרצאה ליניארית 1"],["12:00","13:00","תרגול סי"],["13:00","13:30","תרגול סי"],["14:00","15:00","הרצאה ליניארית 1"],["15:00","16:00","הרצאה ליניארית 1"],["16:00","17:00","תרגול סי"],["17:00","18:00","תרגול ליניארית 1"],["18:00","19:00","תרגול ליניארית 1"],["19:00","20:00","תרגול סי"]]},
    {d:"2025-03-27", s:[["09:15","11:00","תרגול סי"],["11:00","12:00","תרגול סי"],["12:00","14:00","הרצאה ליניארית 1"],["14:00","16:00","הרצאה ליניארית 1"],["17:00","18:30","תרגול סי"],["18:30","19:00","תרגול סי"]]},
    {d:"2025-03-30", s:[["08:30","10:00","תרגול סי"],["10:00","11:30","תרגול סי"],["11:30","12:30","תרגול סי"],["13:00","15:00","תרגול סי"],["15:00","16:00","תרגול ליניארית 1"],["16:00","17:00","תרגול ליניארית 1"]]},
    {d:"2025-03-31", s:[["11:00","12:30","תרגול סי"],["12:30","13:30","תרגול סי"],["14:00","14:45","תרגול סי"],["15:00","15:45","הרצאה ליניארית 1"],["16:00","17:00","הרצאה ליניארית 1"],["18:30","19:30","תרגול סי"]]},
    {d:"2025-04-01", s:[["12:00","13:00","ליניארית 1"],["13:00","14:00","ליניארית 1"],["14:00","15:00","ליניארית 1"],["15:00","16:00","ליניארית 1"],["16:00","17:30","ליניארית 1"],["18:00","19:00","ליניארית 1"],["19:00","20:00","ליניארית 1"],["20:00","21:00","ליניארית 1"]]},
    {d:"2025-04-02", s:[["09:00","10:00","סי"],["10:00","11:00","סי"],["11:00","12:00","סי"],["12:00","13:00","סי"],["13:00","14:00","סי"],["14:00","15:00","סי"],["15:00","16:00","סי"],["16:00","17:00","סי"],["17:00","19:00","סי"]]},
    {d:"2025-04-03", s:[["12:00","13:00","ליניארית 1"],["13:00","14:00","ליניארית 1"],["15:00","16:00","ליניארית 1"],["16:00","17:00","ליניארית 1"],["17:00","18:00","ליניארית 1"]]},
    {d:"2025-04-06", s:[["13:00","14:00","הרצאה סי"],["14:00","15:00","הרצאה סי"],["15:00","16:00","הרצאה סי"],["16:00","17:00","הרצאה סי"],["17:00","18:00","הרצאה סי"]]},
    {d:"2025-04-07", s:[["10:30","11:30","ליניארית 1"],["12:00","13:00","ליניארית 1"],["14:00","14:45","ליניארית 1"],["15:00","15:45","ליניארית 1"],["16:00","16:45","ליניארית 1"],["17:00","17:45","ליניארית 1"],["19:00","20:00","ליניארית 1"]]},
    {d:"2025-04-08", s:[["10:00","10:45","תרגול סי"],["11:00","11:45","תרגול סי"],["12:30","13:30","תהליכים קוגניטיביים"],["13:30","14:00","תהליכים קוגניטיביים"],["16:00","17:00","ליניארית 1"],["17:00","19:00","ליניארית 1"]]},
    {d:"2025-04-09", s:[["09:00","10:00","ליניארית 1"],["10:00","11:00","ליניארית 1"],["11:00","12:00","ליניארית 1"],["12:00","13:30","ליניארית 1"],["14:00","15:00","תרגול סי"],["15:00","16:00","תרגול סי"],["16:30","17:30","תרגול סי"]]},
    {d:"2025-04-10", s:[["12:00","13:00","תהליכים קוגניטיביים"],["13:00","14:00","תהליכים קוגניטיביים"],["15:00","16:00","תהליכים קוגניטיביים"],["16:00","17:00","תהליכים קוגניטיביים"]]},
    {d:"2025-04-14", s:[["12:00","13:00","ליניארית 1"],["13:00","13:50","ליניארית 1"],["14:00","15:30","ליניארית 1"],["16:30","18:00","ליניארית 1"],["18:00","19:00","ליניארית 1"]]},
    {d:"2025-04-15", s:[["10:30","11:30","תרגול סי"],["11:30","12:30","תרגול סי"],["13:00","15:00","תרגול סי"],["16:00","17:00","תרגול סי"],["18:00","19:00","תרגול סי"]]},
    {d:"2025-04-16", s:[["10:30","11:30","תרגול סי"],["11:30","12:30","תרגול סי"],["13:00","14:00","תרגול סי"],["14:00","15:30","תרגול סי"]]},
    {d:"2025-04-17", s:[["09:00","10:00","תרגול סי"],["10:00","11:00","תרגול סי"],["11:00","12:00","ליניארית 1"],["12:00","12:30","ליניארית 1"],["13:30","15:00","תרגול סי"],["16:00","18:00","תרגול סי"]]}
];

// --- Import Historical Data Function ---
function importMassive2025Data() {
    let data = loadAllData();
    const newId = "nb_sem_b_2025_" + Date.now();
    let pagesObj = {};
    
    mySemesterData.forEach(day => {
        let stArr = ["", "", "", "", "", "", "", "", "", ""];
        let ftArr = ["", "", "", "", "", "", "", "", "", ""];
        let catsArr = ["", "", "", "", "", "", "", "", "", ""];
        let totalMins = 0;
        
        day.s.forEach((session, idx) => {
            if(idx < 10) {
                stArr[idx] = session[0]; 
                ftArr[idx] = session[1]; 
                catsArr[idx] = session[2];
                let [sh, sm] = session[0].split(':').map(Number);
                let [fh, fm] = session[1].split(':').map(Number);
                let mins = (fh*60+fm) - (sh*60+sm);
                if(mins < 0) mins += 24*60; // Handle overnight edge cases
                totalMins += mins;
            }
        });
        
        pagesObj[day.d] = {
            startTimes: stArr, finishTimes: ftArr, schedCats: catsArr,
            schedTasks: ["", "", "", "", "", "", "", "", "", ""], todoTexts: ["", "", "", "", ""],
            todoChecks: [false, false, false, false, false], topThrees: ["", "", ""],
            trackChecks: [false,false,false,false,false,false,false,false,false,false],
            notesTimes: ["", "", "", ""], reward: "", goal: "", breaks: [], totalMinutes: totalMins
        };
    });

    data.notebooks[newId] = {
        id: newId, title: "סמסטר ב' 2025 - מסד מלא", desc: "נשאב מה-PDF והיומן",
        categories: ["תרגול סי", "הרצאה סי", "סי", "ליניארית 1", "תרגול ליניארית 1", "הרצאה ליניארית 1", "תהליכים קוגניטיביים"],
        pages: pagesObj
    };
    
    saveAllData(data); triggerCloudSave();
    currentNotebookId = newId;
    switchTab('analytics');
    setAnalyticsFilter('all'); 
}

// --- Cloud Sync API Handlers ---
async function initCloudSync() {
    try {
        document.getElementById('syncStatus').innerText = '☁️ Syncing from Google Drive...';
        const response = await fetch(CLOUD_URL);
        const cloudData = await response.json();
        if(cloudData["ALL_NOTEBOOKS"]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudData["ALL_NOTEBOOKS"])); }
        document.getElementById('syncStatus').innerText = '☁️ Synced & Up to Date';
        if(typeof refreshCurrentView === 'function') refreshCurrentView();
    } catch (error) {
        document.getElementById('syncStatus').innerText = '☁️ Offline Mode (Local Data Only)';
        if(typeof refreshCurrentView === 'function') refreshCurrentView();
    }
}

async function triggerCloudSave() {
    clearTimeout(syncTimer);
    document.getElementById('syncStatus').innerText = '☁️ Pending save...';
    syncTimer = setTimeout(async () => {
        try {
            document.getElementById('syncStatus').innerText = '☁️ Saving to Drive...';
            await fetch(CLOUD_URL, { 
                method: 'POST', 
                headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
                body: JSON.stringify({ dateKey: "ALL_NOTEBOOKS", dayData: loadAllData() }) 
            });
            document.getElementById('syncStatus').innerText = '☁️ Saved to Drive';
        } catch (error) {
            document.getElementById('syncStatus').innerText = '☁️ Saved Locally (Cloud Error)';
        }
    }, 2000); // Debounce to prevent API spamming
}
