// --- Chart.js Initialization & Global Variables ---
Chart.register(ChartDataLabels);

let trendChartObj = null; 
let pieChartObj = null;
let globalChartData = []; // Store hours/sessions for toggling
let currentAnalyticsFilter = 'all'; 
let filterRefDate = new Date(); 
let currentPieView = 'detail'; 
let calRenderYear = null;
let calRenderMonth = null;

// --- Time Navigation & Filtering ---
function setAnalyticsFilter(type) {
    currentAnalyticsFilter = type;
    document.querySelectorAll('.time-filter-btn').forEach(btn => btn.classList.remove('active'));
    if(type==='day') document.getElementById('fltDay').classList.add('active');
    if(type==='week') document.getElementById('fltWeek').classList.add('active');
    if(type==='month') document.getElementById('fltMonth').classList.add('active');
    if(type==='all') document.getElementById('fltAll').classList.add('active');
    filterRefDate = new Date(); 
    updateAnalyticsData();
}

function navigateTime(dir) {
    if (currentAnalyticsFilter === 'all') return;
    if (currentAnalyticsFilter === 'day') { filterRefDate.setDate(filterRefDate.getDate() + dir); } 
    else if (currentAnalyticsFilter === 'week') { filterRefDate.setDate(filterRefDate.getDate() + (dir * 7)); } 
    else if (currentAnalyticsFilter === 'month') { filterRefDate.setMonth(filterRefDate.getMonth() + dir); }
    updateAnalyticsData();
}

function populateAnalyticsDropdown() {
    const select = document.getElementById('analyticsNotebookSelect');
    const data = loadAllData();
    select.innerHTML = '';
    Object.values(data.notebooks).forEach(nb => {
        const opt = document.createElement('option');
        opt.value = nb.id; opt.innerText = nb.title;
        if(nb.id === currentNotebookId) opt.selected = true;
        select.appendChild(opt);
    });
}

function changeAnalyticsNotebook() {
    currentNotebookId = document.getElementById('analyticsNotebookSelect').value;
    initCalendarState();
    updateAnalyticsData(); 
}

function parseTimeMin(t) { if(!t) return 0; let [h,m] = t.split(':'); return parseInt(h)*60 + parseInt(m); }
function formatTime(m) {
    if(isNaN(m) || m === null) return "N/A";
    let h = Math.floor(m/60) % 24; let mins = Math.floor(m%60);
    return `${String(h).padStart(2,'0')}:${String(mins).padStart(2,'0')}`;
}

function initCalendarState() {
    if(!currentNotebookId) return;
    const data = loadAllData();
    const pages = data.notebooks[currentNotebookId].pages || {};
    const allDates = Object.keys(pages).sort();
    if(allDates.length > 0) {
        let [y, m, d] = allDates[allDates.length-1].split('-');
        calRenderYear = parseInt(y); calRenderMonth = parseInt(m) - 1;
    } else {
        let td = new Date(); calRenderYear = td.getFullYear(); calRenderMonth = td.getMonth();
    }
    renderDynamicCalendar();
}

function changeCalendarMonth(dir) {
    if(calRenderYear === null) return;
    calRenderMonth += dir;
    if(calRenderMonth > 11) { calRenderMonth = 0; calRenderYear++; }
    if(calRenderMonth < 0) { calRenderMonth = 11; calRenderYear--; }
    renderDynamicCalendar();
}

function renderDynamicCalendar() {
    if(!currentNotebookId) return;
    const pagesData = loadAllData().notebooks[currentNotebookId].pages || {};
    const grid = document.getElementById('dynamicCalendarGrid');
    grid.innerHTML = '';
    const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    daysOfWeek.forEach(d => {
        const el = document.createElement('div');
        el.className = 'calendar-cell calendar-header'; el.innerText = d; grid.appendChild(el);
    });
    const hebrewMonths = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
    document.getElementById('calendarMonthLabel').innerText = hebrewMonths[calRenderMonth] + " " + calRenderYear;
    const firstDay = new Date(calRenderYear, calRenderMonth, 1).getDay();
    const daysInMonth = new Date(calRenderYear, calRenderMonth + 1, 0).getDate();
    for(let i=0; i<firstDay; i++) {
        const el = document.createElement('div'); el.className = 'calendar-cell calendar-empty'; grid.appendChild(el);
    }
    for(let d=1; d<=daysInMonth; d++) {
        const el = document.createElement('div');
        el.className = 'calendar-cell calendar-day'; el.innerText = d;
        const dateStr = `${calRenderYear}-${String(calRenderMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        if(pagesData[dateStr] && pagesData[dateStr].totalMinutes > 0) { el.classList.add('crossed'); }
        grid.appendChild(el);
    }
}

function getMacroCategory(cat) {
    if (!cat) return "";
    let cleanCat = cat.replace("ליניאירית", "ליניארית");
    let wordsToRemove = ["תרגול", "הרצאה", "מעבדה", "השלמה", "חזרה", "מטלה", "מבחן", "בוחן"];
    wordsToRemove.forEach(w => { cleanCat = cleanCat.replace(w, ""); });
    cleanCat = cleanCat.replace(/^[- ]+|[- ]+$/g, "").replace(/\s+/g, " ").trim();
    return cleanCat || cat;
}

// --- Main Analytics Engine ---
function updateAnalyticsData() {
    if(!currentNotebookId) return;
    const data = loadAllData(); 
    const nb = data.notebooks[currentNotebookId];
    const pages = nb.pages; 
    const allDates = Object.keys(pages).sort(); 
    
    let startD = new Date(filterRefDate); let endD = new Date(filterRefDate);
    startD.setHours(0,0,0,0); endD.setHours(23,59,59,999);
    
    if (currentAnalyticsFilter === 'day') {
        document.getElementById('analyticsDateLabel').innerText = startD.toLocaleDateString('he-IL');
    } else if (currentAnalyticsFilter === 'week') {
        let day = startD.getDay(); startD.setDate(startD.getDate() - day); endD.setDate(startD.getDate() + 6);
        document.getElementById('analyticsDateLabel').innerText = startD.toLocaleDateString('he-IL') + " - " + endD.toLocaleDateString('he-IL');
    } else if (currentAnalyticsFilter === 'month') {
        startD.setDate(1); endD = new Date(startD.getFullYear(), startD.getMonth() + 1, 0); endD.setHours(23,59,59,999);
        const months = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
        document.getElementById('analyticsDateLabel').innerText = months[startD.getMonth()] + " " + startD.getFullYear();
    } else { document.getElementById('analyticsDateLabel').innerText = "כל הזמנים"; }

    const filteredDates = allDates.filter(dateStr => {
        if(currentAnalyticsFilter === 'all') return true;
        let [y, m, d] = dateStr.split('-').map(Number); let currentD = new Date(y, m-1, d);
        return currentD >= startD && currentD <= endD;
    });

    if(filteredDates.length === 0) {
        document.getElementById('statTotalHours').innerText = "0.0"; document.getElementById('statDailyAvg').innerText = "0.0";
        document.getElementById('statTotalSessions').innerText = "0"; document.getElementById('statBestDay').innerText = "N/A";
        document.getElementById('statTotalSpan').innerText = "0"; document.getElementById('statActiveDays').innerText = "0"; document.getElementById('statRestDays').innerText = "0";
        document.getElementById('inAvgRange').innerText = "00:00 - 00:00";
        updateTrendChart([], []); updatePieChart({}); return;
    }

    // Consistency Calcs
    const dateObjects = filteredDates.map(d => new Date(d));
    const firstStudyDate = new Date(Math.min(...dateObjects));
    const lastStudyDate = new Date(Math.max(...dateObjects));
    const totalDaysSpan = Math.ceil((lastStudyDate - firstStudyDate) / (1000 * 60 * 60 * 24)) + 1;
    document.getElementById('statTotalSpan').innerText = totalDaysSpan;
    document.getElementById('statActiveDays').innerText = filteredDates.length;
    document.getElementById('statRestDays').innerText = totalDaysSpan - filteredDates.length;

    let totalMinsFiltered = 0; let totalSessionsFiltered = 0; 
    let dayAverages = { 'Sunday':[], 'Monday':[], 'Tuesday':[], 'Wednesday':[], 'Thursday':[], 'Friday':[], 'Saturday':[] };
    const rawCategoryCounts = {}; 
    let allDaysProcessed = [];

    // Aggregators for Bar Chart
    let barLabels = [];
    let barValues = [];

    if (currentAnalyticsFilter === 'all') {
        // Group by MONTH
        let monthMap = {};
        const monthsHe = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
        filteredDates.forEach(dStr => {
            let m = parseInt(dStr.split('-')[1]) - 1;
            let label = monthsHe[m];
            monthMap[label] = (monthMap[label] || 0) + (pages[dStr].totalMinutes / 60);
        });
        barLabels = Object.keys(monthMap);
        barValues = Object.values(monthMap).map(v => v.toFixed(1));
    } else if (currentAnalyticsFilter === 'month') {
        // Group by WEEK OF MONTH
        let weekMap = {};
        filteredDates.forEach(dStr => {
            let d = new Date(dStr);
            let firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
            let weekNo = Math.ceil((d.getDate() + firstDay.getDay()) / 7);
            let label = `שבוע ${weekNo}`;
            weekMap[label] = (weekMap[label] || 0) + (pages[dStr].totalMinutes / 60);
        });
        barLabels = Object.keys(weekMap);
        barValues = Object.values(weekMap).map(v => v.toFixed(1));
    } else {
        // DEFAULT: Group by Day (for Week/Day view)
        filteredDates.forEach(dStr => {
            let label = new Date(dStr).toLocaleDateString('he-IL', {weekday: 'short'});
            barLabels.push(label);
            barValues.push((pages[dStr].totalMinutes / 60).toFixed(1));
        });
    }

    filteredDates.forEach(dateStr => {
        const dayData = pages[dateStr];
        let [y, m, d] = dateStr.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        totalMinsFiltered += dayData.totalMinutes;
        let sessionsMins = []; let dayEarliest = Infinity; let dayLatest = -Infinity;
        let firstStartTime = null; let prevFinish = null;

        for(let i=0; i<10; i++) {
            if(dayData.startTimes[i] && dayData.finishTimes[i]) {
                let start = parseTimeMin(dayData.startTimes[i]); let finish = parseTimeMin(dayData.finishTimes[i]);
                sessionsMins.push(finish - start);
                if (start < dayEarliest) dayEarliest = start;
                if (finish > dayLatest) dayLatest = finish;
                if(firstStartTime === null) firstStartTime = start;
            }
        }
        totalSessionsFiltered += sessionsMins.length;
        dayAverages[dateObj.toLocaleDateString('en-US', { weekday: 'long' })].push(dayData.totalMinutes);
        
        if(dayData.schedCats) {
            dayData.schedCats.forEach((cat, idx) => {
                if(cat && dayData.startTimes[idx] && dayData.finishTimes[idx]) {
                    let normalizedCat = cat.replace("השלמה", "תרגול").replace("ליניאירית", "ליניארית");
                    let diff = parseTimeMin(dayData.finishTimes[idx]) - parseTimeMin(dayData.startTimes[idx]);
                    rawCategoryCounts[normalizedCat] = (rawCategoryCounts[normalizedCat] || 0) + diff;
                }
            });
        }
        allDaysProcessed.push({ totalMins: dayData.totalMinutes, startHour: firstStartTime, dayStart: dayEarliest, dayEnd: dayLatest });
    });

    document.getElementById('statTotalHours').innerText = (totalMinsFiltered / 60).toFixed(1);
    document.getElementById('statDailyAvg').innerText = (totalMinsFiltered / 60 / filteredDates.length).toFixed(1);
    document.getElementById('statTotalSessions').innerText = totalSessionsFiltered;
    
    // Insights calcs (Ideal session, etc - reuse logic)
    let sumDayStart = 0, sumDayEnd = 0;
    allDaysProcessed.forEach(d => { sumDayStart += d.dayStart; sumDayEnd += d.dayEnd; });
    document.getElementById('inAvgRange').innerText = `${formatTime(sumDayStart/allDaysProcessed.length)} - ${formatTime(sumDayEnd/allDaysProcessed.length)}`;

    updateTrendChart(barLabels, barValues); 
    
    let finalPieData = {};
    if (currentPieView === 'detail') { finalPieData = rawCategoryCounts; } 
    else { Object.keys(rawCategoryCounts).forEach(cat => { let macro = getMacroCategory(cat); finalPieData[macro] = (finalPieData[macro] || 0) + rawCategoryCounts[cat]; }); }
    updatePieChart(finalPieData);
}

function updateTrendChart(labels, values) {
    const ctxBar = document.getElementById('trendBarChart').getContext('2d');
    if(trendChartObj) trendChartObj.destroy(); 
    trendChartObj = new Chart(ctxBar, { 
        type: 'bar', 
        data: { 
            labels: labels, 
            datasets: [{ label: 'Study Hours', data: values, backgroundColor: '#fdf1a9', borderColor: '#000000', borderWidth: 2 }] 
        }, 
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { datalabels: { anchor: 'end', align: 'top', color: '#000', font: { weight: 'bold' } } } 
        } 
    });
}

function updatePieChart(categoryCounts) {
    const ctxPie = document.getElementById('categoryPieChart').getContext('2d');
    if(pieChartObj) pieChartObj.destroy();
    
    // תצוגת שם + מספר עגול בלבד ללא סוגריים או סימנים
    const labels = Object.keys(categoryCounts).map(cat => {
        const hours = Math.round(categoryCounts[cat] / 60);
        return `${cat} ${hours}`;
    });
    
    const data = Object.values(categoryCounts);
    if(data.length === 0) { labels.push('אין נתונים'); data.push(1); }
    
    pieChartObj = new Chart(ctxPie, { 
        type: 'doughnut', 
        data: { labels: labels, datasets: [{ data: data, backgroundColor: ['#000000', '#fdf1a9', '#888888', '#e0e0e0', '#333333', '#cccccc'], borderWidth: 1 }] }, 
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { 
                legend: { position: 'right' }, 
                datalabels: { 
                    color: '#fff', 
                    font: { weight: 'bold' }, 
                    formatter: (value, ctx) => { 
                        if (labels[0] === 'אין נתונים') return ''; 
                        let sum = 0; let dataArr = ctx.chart.data.datasets[0].data; 
                        dataArr.map(d => { sum += d; }); 
                        return (value*100 / sum).toFixed(0)+"%"; 
                    } 
                } 
            } 
        } 
    });
}

function togglePieChart(mode) {
    currentPieView = mode;
    document.getElementById('btnPieDetail').classList.remove('active'); document.getElementById('btnPieMacro').classList.remove('active');
    if(mode === 'detail') document.getElementById('btnPieDetail').classList.add('active'); else document.getElementById('btnPieMacro').classList.add('active');
    updateAnalyticsData(); 
}
