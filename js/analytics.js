{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tqr\tx566\tqr\tx1133\tqr\tx1700\tqr\tx2267\tqr\tx2834\tqr\tx3401\tqr\tx3968\tqr\tx4535\tqr\tx5102\tqr\tx5669\tqr\tx6236\tqr\tx6803\pardirnatural\qr\partightenfactor0

\f0\fs24 \cf0 // --- Chart.js Initialization & Global Variables ---\
Chart.register(ChartDataLabels);\
\
let trendChartObj = null; \
let pieChartObj = null;\
let globalChartHours = []; \
let globalChartSessions = [];\
let currentAnalyticsFilter = 'all'; \
let filterRefDate = new Date(); \
let currentPieView = 'detail'; \
let calRenderYear = null;\
let calRenderMonth = null;\
\
// --- Time Navigation & Filtering ---\
function setAnalyticsFilter(type) \{\
    currentAnalyticsFilter = type;\
    document.querySelectorAll('.time-filter-btn').forEach(btn => btn.classList.remove('active'));\
    if(type==='day') document.getElementById('fltDay').classList.add('active');\
    if(type==='week') document.getElementById('fltWeek').classList.add('active');\
    if(type==='month') document.getElementById('fltMonth').classList.add('active');\
    if(type==='all') document.getElementById('fltAll').classList.add('active');\
    \
    filterRefDate = new Date(); // Reset reference date to today\
    updateAnalyticsData();\
\}\
\
function navigateTime(dir) \{\
    if (currentAnalyticsFilter === 'all') return;\
    if (currentAnalyticsFilter === 'day') \{ \
        filterRefDate.setDate(filterRefDate.getDate() + dir); \
    \} \
    else if (currentAnalyticsFilter === 'week') \{ \
        filterRefDate.setDate(filterRefDate.getDate() + (dir * 7)); \
    \} \
    else if (currentAnalyticsFilter === 'month') \{ \
        filterRefDate.setMonth(filterRefDate.getMonth() + dir); \
    \}\
    updateAnalyticsData();\
\}\
\
// --- Notebook Selection Dropdown ---\
function populateAnalyticsDropdown() \{\
    const select = document.getElementById('analyticsNotebookSelect');\
    const data = loadAllData();\
    select.innerHTML = '';\
    Object.values(data.notebooks).forEach(nb => \{\
        const opt = document.createElement('option');\
        opt.value = nb.id; opt.innerText = nb.title;\
        if(nb.id === currentNotebookId) opt.selected = true;\
        select.appendChild(opt);\
    \});\
\}\
\
function changeAnalyticsNotebook() \{\
    currentNotebookId = document.getElementById('analyticsNotebookSelect').value;\
    initCalendarState();\
    updateAnalyticsData(); \
\}\
\
// --- Time Parsing Helpers ---\
function parseTimeMin(t) \{ \
    if(!t) return 0; \
    let [h,m] = t.split(':'); \
    return parseInt(h)*60 + parseInt(m); \
\}\
\
function formatTime(m) \{\
    if(isNaN(m) || m === null) return "N/A";\
    let h = Math.floor(m/60); let mins = Math.floor(m%60);\
    return `$\{String(h).padStart(2,'0')\}:$\{String(mins).padStart(2,'0')\}`;\
\}\
\
// --- Dynamic Calendar Rendering ---\
function initCalendarState() \{\
    if(!currentNotebookId) return;\
    const data = loadAllData();\
    const pages = data.notebooks[currentNotebookId].pages || \{\};\
    const allDates = Object.keys(pages).sort();\
    \
    if(allDates.length > 0) \{\
        let [y, m, d] = allDates[allDates.length-1].split('-');\
        calRenderYear = parseInt(y); \
        calRenderMonth = parseInt(m) - 1;\
    \} else \{\
        let td = new Date(); \
        calRenderYear = td.getFullYear(); \
        calRenderMonth = td.getMonth();\
    \}\
    renderDynamicCalendar();\
\}\
\
function changeCalendarMonth(dir) \{\
    if(calRenderYear === null) return;\
    calRenderMonth += dir;\
    if(calRenderMonth > 11) \{ calRenderMonth = 0; calRenderYear++; \}\
    if(calRenderMonth < 0) \{ calRenderMonth = 11; calRenderYear--; \}\
    renderDynamicCalendar();\
\}\
\
function renderDynamicCalendar() \{\
    if(!currentNotebookId) return;\
    const pagesData = loadAllData().notebooks[currentNotebookId].pages || \{\};\
    const grid = document.getElementById('dynamicCalendarGrid');\
    grid.innerHTML = '';\
    \
    const daysOfWeek = ['\uc0\u1512 \u1488 \u1513 \u1493 \u1503 ', '\u1513 \u1504 \u1497 ', '\u1513 \u1500 \u1497 \u1513 \u1497 ', '\u1512 \u1489 \u1497 \u1506 \u1497 ', '\u1495 \u1502 \u1497 \u1513 \u1497 ', '\u1513 \u1497 \u1513 \u1497 ', '\u1513 \u1489 \u1514 '];\
    daysOfWeek.forEach(d => \{\
        const el = document.createElement('div');\
        el.className = 'calendar-cell calendar-header'; \
        el.innerText = d; \
        grid.appendChild(el);\
    \});\
\
    const hebrewMonths = ["\uc0\u1497 \u1504 \u1493 \u1488 \u1512 ", "\u1508 \u1489 \u1512 \u1493 \u1488 \u1512 ", "\u1502 \u1512 \u1509 ", "\u1488 \u1508 \u1512 \u1497 \u1500 ", "\u1502 \u1488 \u1497 ", "\u1497 \u1493 \u1504 \u1497 ", "\u1497 \u1493 \u1500 \u1497 ", "\u1488 \u1493 \u1490 \u1493 \u1505 \u1496 ", "\u1505 \u1508 \u1496 \u1502 \u1489 \u1512 ", "\u1488 \u1493 \u1511 \u1496 \u1493 \u1489 \u1512 ", "\u1504 \u1493 \u1489 \u1502 \u1489 \u1512 ", "\u1491 \u1510 \u1502 \u1489 \u1512 "];\
    document.getElementById('calendarMonthLabel').innerText = hebrewMonths[calRenderMonth] + " " + calRenderYear;\
\
    const firstDay = new Date(calRenderYear, calRenderMonth, 1).getDay();\
    const daysInMonth = new Date(calRenderYear, calRenderMonth + 1, 0).getDate();\
\
    // Fill empty cells before the 1st of the month\
    for(let i=0; i<firstDay; i++) \{\
        const el = document.createElement('div'); \
        el.className = 'calendar-cell calendar-empty'; \
        grid.appendChild(el);\
    \}\
\
    // Render active days\
    for(let d=1; d<=daysInMonth; d++) \{\
        const el = document.createElement('div');\
        el.className = 'calendar-cell calendar-day'; \
        el.innerText = d;\
        const dateStr = `$\{calRenderYear\}-$\{String(calRenderMonth+1).padStart(2,'0')\}-$\{String(d).padStart(2,'0')\}`;\
        if(pagesData[dateStr] && pagesData[dateStr].totalMinutes > 0) \{ \
            el.classList.add('crossed'); \
        \}\
        grid.appendChild(el);\
    \}\
\}\
\
// --- Data Grouping Engine (Macro Categories) ---\
function getMacroCategory(cat) \{\
    if (!cat) return "";\
    let wordsToRemove = ["\uc0\u1514 \u1512 \u1490 \u1493 \u1500 ", "\u1492 \u1512 \u1510 \u1488 \u1492 ", "\u1502 \u1506 \u1489 \u1491 \u1492 ", "\u1492 \u1513 \u1500 \u1502 \u1492 ", "\u1495 \u1494 \u1512 \u1492 ", "\u1502 \u1496 \u1500 \u1492 ", "\u1502 \u1489 \u1495 \u1503 ", "\u1489 \u1493 \u1495 \u1503 "];\
    let cleanCat = cat;\
    wordsToRemove.forEach(w => \{ cleanCat = cleanCat.replace(w, ""); \});\
    cleanCat = cleanCat.replace(/^[- ]+|[- ]+$/g, "").replace(/\\s+/g, " ").trim();\
    return cleanCat || cat;\
\}\
\
function renderCharts() \{ \
    updateAnalyticsData(); \
\}\
\
// --- Main Analytics Engine ---\
function updateAnalyticsData() \{\
    if(!currentNotebookId) return;\
\
    const data = loadAllData(); \
    const nb = data.notebooks[currentNotebookId];\
    const pages = nb.pages; \
    const allDates = Object.keys(pages).sort(); \
    \
    // Generate Date Boundaries based on filter reference date\
    let startD = new Date(filterRefDate); \
    let endD = new Date(filterRefDate);\
    startD.setHours(0,0,0,0); \
    endD.setHours(23,59,59,999);\
    \
    let labelText = "";\
    const hebrewMonths = ["\uc0\u1497 \u1504 \u1493 \u1488 \u1512 ", "\u1508 \u1489 \u1512 \u1493 \u1488 \u1512 ", "\u1502 \u1512 \u1509 ", "\u1488 \u1508 \u1512 \u1497 \u1500 ", "\u1502 \u1488 \u1497 ", "\u1497 \u1493 \u1504 \u1497 ", "\u1497 \u1493 \u1500 \u1497 ", "\u1488 \u1493 \u1490 \u1493 \u1505 \u1496 ", "\u1505 \u1508 \u1496 \u1502 \u1489 \u1512 ", "\u1488 \u1493 \u1511 \u1496 \u1493 \u1489 \u1512 ", "\u1504 \u1493 \u1489 \u1502 \u1489 \u1512 ", "\u1491 \u1510 \u1502 \u1489 \u1512 "];\
    \
    if (currentAnalyticsFilter === 'day') \{\
        labelText = startD.toLocaleDateString('he-IL');\
    \} else if (currentAnalyticsFilter === 'week') \{\
        let day = startD.getDay(); \
        startD.setDate(startD.getDate() - day); \
        endD.setDate(startD.getDate() + 6);\
        labelText = startD.toLocaleDateString('he-IL') + " - " + endD.toLocaleDateString('he-IL');\
    \} else if (currentAnalyticsFilter === 'month') \{\
        startD.setDate(1); \
        endD = new Date(startD.getFullYear(), startD.getMonth() + 1, 0); \
        endD.setHours(23,59,59,999);\
        labelText = hebrewMonths[startD.getMonth()] + " " + startD.getFullYear();\
    \} else \{ \
        labelText = "\uc0\u1499 \u1500  \u1492 \u1494 \u1502 \u1504 \u1497 \u1501 "; \
    \}\
    document.getElementById('analyticsDateLabel').innerText = labelText;\
\
    const filteredDates = allDates.filter(dateStr => \{\
        if(currentAnalyticsFilter === 'all') return true;\
        let [y, m, d] = dateStr.split('-').map(Number); \
        let currentD = new Date(y, m-1, d);\
        return currentD >= startD && currentD <= endD;\
    \});\
\
    // Handle empty state\
    if(filteredDates.length === 0) \{\
        document.getElementById('statTotalHours').innerText = "0.0"; \
        document.getElementById('statDailyAvg').innerText = "0.0";\
        document.getElementById('statTotalSessions').innerText = "0"; \
        document.getElementById('statBestDay').innerText = "N/A";\
        document.getElementById('inBestDay').innerText = "\uc0\u1495 \u1505 \u1512  \u1502 \u1497 \u1491 \u1506 "; \
        document.getElementById('inIdealSession').innerText = "N/A";\
        document.getElementById('inIdealBreak').innerText = "N/A"; \
        document.getElementById('inIdealStart').innerText = "N/A";\
        document.getElementById('inStrategy').innerText = "\uc0\u1497 \u1513  \u1500 \u1492 \u1494 \u1497 \u1503  \u1497 \u1493 \u1514 \u1512  \u1497 \u1502 \u1497  \u1500 \u1502 \u1497 \u1491 \u1492  \u1489 \u1496 \u1493 \u1493 \u1495  \u1494 \u1502 \u1503  \u1494 \u1492  \u1499 \u1491 \u1497  \u1513 \u1492 \u1488 \u1500 \u1490 \u1493 \u1512 \u1497 \u1514 \u1501  \u1497 \u1493 \u1499 \u1500  \u1500 \u1489 \u1504 \u1493 \u1514  \u1488 \u1505 \u1496 \u1512 \u1496 \u1490 \u1497 \u1492 .";\
        updateTrendChart([], [], []); updatePieChart(\{\}); return;\
    \}\
\
    let totalMinsFiltered = 0; \
    let totalSessionsFiltered = 0; \
    let dayAverages = \{ 'Sunday':[], 'Monday':[], 'Tuesday':[], 'Wednesday':[], 'Thursday':[], 'Friday':[], 'Saturday':[] \};\
    \
    const chartLabels = []; \
    const chartHours = []; \
    const chartSessions = []; \
    const rawCategoryCounts = \{\}; \
    let allDaysProcessed = [];\
\
    // Process data for the selected timeframe\
    filteredDates.forEach(dateStr => \{\
        const dayData = pages[dateStr];\
        let [y, m, d] = dateStr.split('-').map(Number); \
        const dateObj = new Date(y, m - 1, d);\
        const dayName = dateObj.toLocaleDateString('en-US', \{ weekday: 'long' \});\
        const dayNameHe = dateObj.toLocaleDateString('he-IL', \{ weekday: 'short' \});\
        \
        totalMinsFiltered += dayData.totalMinutes;\
        let sessionsMins = []; \
        let breaksMins = []; \
        let firstStartTime = null; \
        let prevFinish = null;\
\
        for(let i=0; i<10; i++) \{\
            if(dayData.startTimes[i] && dayData.finishTimes[i]) \{\
                let start = parseTimeMin(dayData.startTimes[i]); \
                let finish = parseTimeMin(dayData.finishTimes[i]);\
                let dur = finish - start; \
                if(dur < 0) dur += 24*60;\
                sessionsMins.push(dur);\
                \
                if(prevFinish !== null) \{ \
                    let brk = start - prevFinish; \
                    if(brk < 0) brk += 24*60; \
                    breaksMins.push(brk); \
                \}\
                prevFinish = finish; \
                if(firstStartTime === null) firstStartTime = start;\
            \}\
        \}\
\
        let daySessionsCount = sessionsMins.length; \
        totalSessionsFiltered += daySessionsCount;\
        dayAverages[dayName].push(dayData.totalMinutes);\
        \
        if(dayData.schedCats) \{\
            dayData.schedCats.forEach((cat, idx) => \{\
                if(cat && dayData.startTimes[idx] && dayData.finishTimes[idx]) \{\
                    let st = parseTimeMin(dayData.startTimes[idx]); \
                    let ft = parseTimeMin(dayData.finishTimes[idx]);\
                    let diff = ft - st; \
                    if(diff < 0) diff += 24*60;\
                    rawCategoryCounts[cat] = (rawCategoryCounts[cat] || 0) + diff;\
                \}\
            \});\
        \}\
        \
        chartLabels.push(dayNameHe); \
        chartHours.push((dayData.totalMinutes / 60).toFixed(1)); \
        chartSessions.push(daySessionsCount);\
        \
        allDaysProcessed.push(\{ \
            dayNameEn: dayName, totalMins: dayData.totalMinutes, \
            sessionCount: daySessionsCount, \
            avgSessLen: daySessionsCount > 0 ? (dayData.totalMinutes / daySessionsCount) : 0, \
            avgBreakLen: breaksMins.length > 0 ? (breaksMins.reduce((a,b)=>a+b,0) / breaksMins.length) : 0, \
            startHour: firstStartTime \
        \});\
    \});\
\
    // Update Top Row Statistics\
    document.getElementById('statTotalHours').innerText = (totalMinsFiltered / 60).toFixed(1);\
    document.getElementById('statDailyAvg').innerText = (totalMinsFiltered / 60 / filteredDates.length).toFixed(1);\
    document.getElementById('statTotalSessions').innerText = totalSessionsFiltered;\
\
    let bestDayEn = "N/A"; \
    let bestAvg = -1;\
    for (const [day, arr] of Object.entries(dayAverages)) \{\
        if(arr.length > 0) \{ \
            let avg = arr.reduce((a, b) => a + b, 0) / arr.length; \
            if(avg > bestAvg) \{ bestAvg = avg; bestDayEn = day; \} \
        \}\
    \}\
    \
    // Translate best day to Hebrew\
    const enToHe = \{"Sunday":"\uc0\u1497 \u1493 \u1501  \u1512 \u1488 \u1513 \u1493 \u1503 ", "Monday":"\u1497 \u1493 \u1501  \u1513 \u1504 \u1497 ", "Tuesday":"\u1497 \u1493 \u1501  \u1513 \u1500 \u1497 \u1513 \u1497 ", "Wednesday":"\u1497 \u1493 \u1501  \u1512 \u1489 \u1497 \u1506 \u1497 ", "Thursday":"\u1497 \u1493 \u1501  \u1495 \u1502 \u1497 \u1513 \u1497 ", "Friday":"\u1497 \u1493 \u1501  \u1513 \u1497 \u1513 \u1497 ", "Saturday":"\u1513 \u1489 \u1514 "\};\
    let bestDayHe = bestDayEn !== "N/A" ? enToHe[bestDayEn] : "N/A";\
    document.getElementById('statBestDay').innerText = bestDayHe.replace("\uc0\u1497 \u1493 \u1501  ", "");\
\
    // --- Generate Winning Strategy ---\
    allDaysProcessed.sort((a,b) => b.totalMins - a.totalMins);\
    let topDaysCount = Math.max(1, Math.ceil(allDaysProcessed.length / 2)); \
    let topDays = allDaysProcessed.slice(0, topDaysCount);\
    \
    let sumSess = 0, sumBreak = 0, sumCount = 0, sumStart = 0;\
    topDays.forEach(d => \{ \
        sumSess += d.avgSessLen; sumBreak += d.avgBreakLen; \
        sumCount += d.sessionCount; sumStart += d.startHour; \
    \});\
    \
    let idealSess = Math.round(sumSess / topDaysCount); \
    let idealBreak = Math.round(sumBreak / topDaysCount);\
    let idealCount = Math.round(sumCount / topDaysCount); \
    let idealStart = sumStart / topDaysCount;\
\
    document.getElementById('inBestDay').innerText = bestDayHe;\
    document.getElementById('inIdealSession').innerText = (isNaN(idealSess) || idealSess===0) ? "N/A" : idealSess + " \uc0\u1491 \u1511 \u1493 \u1514 ";\
    document.getElementById('inIdealBreak').innerText = (isNaN(idealBreak) || idealBreak===0) ? "N/A" : idealBreak + " \uc0\u1491 \u1511 \u1493 \u1514 ";\
    document.getElementById('inIdealStart').innerText = formatTime(idealStart);\
\
    if(idealSess > 0) \{ \
        document.getElementById('inStrategy').innerText = `\uc0\u1499 \u1491 \u1497  \u1500 \u1502 \u1511 \u1505 \u1501  \u1513 \u1506 \u1493 \u1514  \u1500 \u1502 \u1497 \u1491 \u1492 , \u1492 \u1504 \u1514 \u1493 \u1504 \u1497 \u1501  \u1502 \u1512 \u1488 \u1497 \u1501  \u1513 \u1488 \u1514  \u1506 \u1493 \u1489 \u1491 \u1514  \u1492 \u1499 \u1497  \u1496 \u1493 \u1489  \u1499 \u1513 \u1488 \u1514  \u1502 \u1495 \u1500 \u1511 \u1514  \u1488 \u1514  \u1492 \u1500 \u1502 \u1497 \u1491 \u1492  \u1500 \u1499 -$\{idealCount\} \u1505 \u1513 \u1504 \u1497 \u1501  \u1513 \u1500  $\{idealSess\} \u1491 \u1511 \u1493 \u1514 . \u1514 \u1513 \u1514 \u1491 \u1500 \u1497  \u1500 \u1492 \u1511 \u1508 \u1497 \u1491  \u1506 \u1500  \u1492 \u1508 \u1505 \u1511 \u1493 \u1514  \u1489 \u1488 \u1493 \u1512 \u1498  \u1513 \u1500  $\{idealBreak\} \u1491 \u1511 \u1493 \u1514  \u1499 \u1491 \u1497  \u1500 \u1513 \u1502 \u1493 \u1512  \u1506 \u1500  \u1488 \u1504 \u1512 \u1490 \u1497 \u1492 !`; \
    \} else \{ \
        document.getElementById('inStrategy').innerText = `\uc0\u1488 \u1497 \u1503  \u1502 \u1505 \u1508 \u1497 \u1511  \u1504 \u1514 \u1493 \u1504 \u1497 \u1501  \u1506 \u1500  \u1513 \u1506 \u1493 \u1514  \u1505 \u1513 \u1504 \u1497 \u1501  \u1502 \u1508 \u1493 \u1512 \u1496 \u1493 \u1514 .`; \
    \}\
\
    // Limit Bar chart to 7 days for readability unless viewing 'week'\
    let recentLabels = chartLabels; \
    let recentHours = chartHours; \
    let recentSessions = chartSessions;\
    if(chartLabels.length > 7 && currentAnalyticsFilter !== 'week') \{ \
        recentLabels = chartLabels.slice(-7); \
        recentHours = chartHours.slice(-7); \
        recentSessions = chartSessions.slice(-7); \
    \}\
    updateTrendChart(recentLabels, recentHours, recentSessions); \
    \
    // Toggle Data for Pie Chart\
    let finalPieData = \{\};\
    if (currentPieView === 'detail') \{ \
        finalPieData = rawCategoryCounts; \
    \} else \{ \
        Object.keys(rawCategoryCounts).forEach(cat => \{ \
            let macro = getMacroCategory(cat); \
            finalPieData[macro] = (finalPieData[macro] || 0) + rawCategoryCounts[cat]; \
        \}); \
    \}\
    updatePieChart(finalPieData);\
\}\
\
function togglePieChart(mode) \{\
    currentPieView = mode;\
    document.getElementById('btnPieDetail').classList.remove('active'); \
    document.getElementById('btnPieMacro').classList.remove('active');\
    if(mode === 'detail') \{\
        document.getElementById('btnPieDetail').classList.add('active'); \
    \} else \{\
        document.getElementById('btnPieMacro').classList.add('active');\
    \}\
    updateAnalyticsData(); \
\}\
\
// --- Chart.js Rendering ---\
function updateTrendChart(labels, hoursData, sessionsData) \{\
    globalChartHours = hoursData; \
    globalChartSessions = sessionsData;\
    const ctxBar = document.getElementById('trendBarChart').getContext('2d');\
    \
    if(trendChartObj) trendChartObj.destroy(); \
    \
    trendChartObj = new Chart(ctxBar, \{ \
        type: 'bar', \
        data: \{ \
            labels: labels, \
            datasets: [\{ \
                label: 'Study Hours', \
                data: hoursData, \
                backgroundColor: '#fdf1a9', \
                borderColor: '#000000', \
                borderWidth: 2 \
            \}] \
        \}, \
        options: \{ \
            responsive: true, \
            maintainAspectRatio: false, \
            scales: \{ y: \{ beginAtZero: true, suggestedMax: Math.max(...hoursData, 2) + 2 \} \}, \
            plugins: \{ datalabels: \{ anchor: 'end', align: 'top', color: '#000', font: \{ weight: 'bold', size: 14 \} \} \} \
        \} \
    \});\
    \
    document.getElementById('btnHours').classList.add('active'); \
    document.getElementById('btnSessions').classList.remove('active');\
\}\
\
function toggleChart(type) \{\
    if(!trendChartObj) return;\
    const btnHours = document.getElementById('btnHours'); \
    const btnSessions = document.getElementById('btnSessions');\
    \
    if (type === 'hours') \{ \
        trendChartObj.data.datasets[0].data = globalChartHours; \
        trendChartObj.data.datasets[0].label = 'Study Hours'; \
        btnHours.classList.add('active'); \
        btnSessions.classList.remove('active'); \
        trendChartObj.options.scales.y.suggestedMax = Math.max(...globalChartHours, 2) + 2; \
    \} else \{ \
        trendChartObj.data.datasets[0].data = globalChartSessions; \
        trendChartObj.data.datasets[0].label = 'Number of Sessions'; \
        btnSessions.classList.add('active'); \
        btnHours.classList.remove('active'); \
        trendChartObj.options.scales.y.suggestedMax = Math.max(...globalChartSessions, 2) + 2; \
    \}\
    trendChartObj.update();\
\}\
\
function updatePieChart(categoryCounts) \{\
    const ctxPie = document.getElementById('categoryPieChart').getContext('2d');\
    if(pieChartObj) pieChartObj.destroy();\
    \
    const labels = Object.keys(categoryCounts); \
    const data = Object.values(categoryCounts);\
    \
    if(data.length === 0) \{ \
        labels.push('\uc0\u1488 \u1497 \u1503  \u1504 \u1514 \u1493 \u1504 \u1497 \u1501 '); \
        data.push(1); \
    \}\
    \
    pieChartObj = new Chart(ctxPie, \{ \
        type: 'doughnut', \
        data: \{ \
            labels: labels, \
            datasets: [\{ \
                data: data, \
                backgroundColor: ['#000000', '#fdf1a9', '#888888', '#e0e0e0', '#333333', '#cccccc'], \
                borderWidth: 1 \
            \}] \
        \}, \
        options: \{ \
            responsive: true, \
            maintainAspectRatio: false, \
            plugins: \{ \
                legend: \{ position: 'right' \}, \
                datalabels: \{ \
                    color: '#fff', \
                    font: \{ weight: 'bold' \}, \
                    formatter: (value, ctx) => \{ \
                        if (labels[0] === '\uc0\u1488 \u1497 \u1503  \u1504 \u1514 \u1493 \u1504 \u1497 \u1501 ') return ''; \
                        let sum = 0; \
                        let dataArr = ctx.chart.data.datasets[0].data; \
                        dataArr.map(d => \{ sum += d; \}); \
                        return (value*100 / sum).toFixed(0)+"%"; \
                    \}\
                \} \
            \} \
        \} \
    \});\
\}}