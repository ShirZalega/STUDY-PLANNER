{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tqr\tx566\tqr\tx1133\tqr\tx1700\tqr\tx2267\tqr\tx2834\tqr\tx3401\tqr\tx3968\tqr\tx4535\tqr\tx5102\tqr\tx5669\tqr\tx6236\tqr\tx6803\pardirnatural\qr\partightenfactor0

\f0\fs24 \cf0 // --- View Navigation ---\
function switchTab(tabName) \{\
    document.getElementById('notebooksGridView').style.display = 'none';\
    document.getElementById('notebookDetailView').style.display = 'none';\
    document.getElementById('plannerView').style.display = 'none';\
    document.getElementById('analyticsView').style.display = 'none';\
    \
    document.getElementById('btnNotebooks').classList.remove('active');\
    document.getElementById('btnAnalytics').classList.remove('active');\
\
    if (tabName === 'notebooks') \{\
        document.getElementById('notebooksGridView').style.display = 'block';\
        document.getElementById('btnNotebooks').classList.add('active');\
        document.getElementById('appHeaderSection').style.display = 'block'; \
        renderNotebookGrid();\
    \} else if (tabName === 'analytics') \{\
        document.getElementById('analyticsView').style.display = 'grid'; \
        document.getElementById('btnAnalytics').classList.add('active');\
        document.getElementById('appHeaderSection').style.display = 'none'; \
        \
        if(!currentNotebookId) \{\
            const data = loadAllData(); \
            const keys = Object.keys(data.notebooks);\
            if(keys.length > 0) currentNotebookId = keys[0];\
        \}\
        populateAnalyticsDropdown();\
        initCalendarState();\
        updateAnalyticsData(); \
    \}\
\}\
\
function refreshCurrentView() \{\
    if(document.getElementById('notebooksGridView').style.display === 'block') renderNotebookGrid();\
    else if(document.getElementById('notebookDetailView').style.display === 'flex') openNotebook(currentNotebookId);\
    else if(document.getElementById('plannerView').style.display === 'grid') loadDayIntoPlanner(document.getElementById('activeDateKey').value);\
\}\
\
// --- Notebook Management ---\
function renderNotebookGrid() \{\
    const data = loadAllData();\
    const container = document.getElementById('notebookGridContainer');\
    container.innerHTML = '';\
    \
    Object.values(data.notebooks).forEach(nb => \{\
        const div = document.createElement('div');\
        div.className = 'notebook-card'; \
        div.onclick = () => openNotebook(nb.id);\
        div.innerHTML = `<div class="notebook-title">$\{nb.title\}</div><div>$\{nb.desc\}</div>`;\
        container.appendChild(div);\
    \});\
    \
    const addBtn = document.createElement('div');\
    addBtn.className = 'notebook-card add-notebook-card'; \
    addBtn.onclick = () => document.getElementById('newNotebookModal').style.display = 'flex';\
    addBtn.innerHTML = `<div style="font-size: 40px; font-weight:bold; margin-bottom:10px;">+</div><div style="font-weight:bold;">\uc0\u1497 \u1510 \u1497 \u1512 \u1514  \u1502 \u1495 \u1489 \u1512 \u1514  \u1495 \u1491 \u1513 \u1492 </div>`;\
    container.appendChild(addBtn);\
\}\
\
function submitNewNotebook() \{\
    const title = document.getElementById('nnTitle').value.trim();\
    const desc = document.getElementById('nnDesc').value.trim();\
\
    if(!title) \{ alert("\uc0\u1497 \u1513  \u1500 \u1492 \u1499 \u1504 \u1497 \u1505  \u1513 \u1501  \u1500 \u1502 \u1495 \u1489 \u1512 \u1514 !"); return; \}\
    \
    const newId = "nb_" + Date.now();\
    const data = loadAllData();\
    data.notebooks[newId] = \{ id: newId, title: title, desc: desc, categories: [], pages: \{\} \};\
    saveAllData(data); \
    triggerCloudSave();\
    \
    document.getElementById('nnTitle').value = ''; \
    document.getElementById('nnDesc').value = '';\
    document.getElementById('newNotebookModal').style.display = 'none';\
    renderNotebookGrid();\
\}\
\
function deleteCurrentNotebook() \{\
    if(!currentNotebookId) return;\
    if(confirm("\uc0\u1492 \u1488 \u1501  \u1488 \u1514  \u1489 \u1496 \u1493 \u1495 \u1492  \u1513 \u1488 \u1514  \u1512 \u1493 \u1510 \u1492  \u1500 \u1502 \u1495 \u1493 \u1511  \u1488 \u1514  \u1499 \u1500  \u1492 \u1502 \u1495 \u1489 \u1512 \u1514  \u1492 \u1494 \u1493 ? \u1500 \u1488  \u1504 \u1497 \u1514 \u1503  \u1497 \u1492 \u1497 \u1492  \u1500 \u1513 \u1495 \u1494 \u1512  \u1488 \u1493 \u1514 \u1492 !")) \{\
        const data = loadAllData();\
        delete data.notebooks[currentNotebookId];\
        saveAllData(data);\
        triggerCloudSave();\
        currentNotebookId = null;\
        switchTab('notebooks');\
    \}\
\}\
\
function deletePage(dateKey) \{\
    if(!currentNotebookId) return;\
    if(confirm(`\uc0\u1492 \u1488 \u1501  \u1500 \u1502 \u1495 \u1493 \u1511  \u1500 \u1510 \u1502 \u1497 \u1514 \u1493 \u1514  \u1488 \u1514  \u1492 \u1491 \u1507  \u1513 \u1500  \u1514 \u1488 \u1512 \u1497 \u1498  $\{dateKey\}?`)) \{\
        const data = loadAllData();\
        delete data.notebooks[currentNotebookId].pages[dateKey];\
        saveAllData(data);\
        triggerCloudSave();\
        openNotebook(currentNotebookId); \
    \}\
\}\
\
// --- Dynamic Categories Management ---\
function renderCategoryList(cats) \{\
    const container = document.getElementById('categoryListContainer');\
    container.innerHTML = '';\
    if (cats && cats.length > 0) \{\
        cats.forEach(cat => \{\
            if(cat.trim() !== '') createCatInput(cat);\
        \});\
    \}\
    // Render 2 empty inputs by default for easy addition\
    createCatInput('');\
    createCatInput('');\
\}\
\
function createCatInput(val) \{\
    const container = document.getElementById('categoryListContainer');\
    const li = document.createElement('li');\
    li.style.marginBottom = '8px';\
    const inp = document.createElement('input');\
    inp.type = 'text';\
    inp.className = 'cat-list-input';\
    inp.value = val;\
    inp.placeholder = '\uc0\u1513 \u1501  \u1492 \u1511 \u1493 \u1512 \u1505 /\u1504 \u1493 \u1513 \u1488 ...';\
    // Auto-save changes silently\
    inp.onchange = () => saveNotebookCategoriesSilently();\
    \
    li.appendChild(inp);\
    container.appendChild(li);\
\}\
\
function addCategoryRow() \{ \
    createCatInput(''); \
\}\
\
function saveNotebookCategoriesSilently() \{\
    if (!currentNotebookId) return;\
    const inputs = document.querySelectorAll('.cat-list-input');\
    const cats = Array.from(inputs).map(inp => inp.value.trim()).filter(val => val !== '');\
    const data = loadAllData();\
    data.notebooks[currentNotebookId].categories = cats;\
    saveAllData(data); \
    triggerCloudSave();\
\}\
\
function saveNotebookCategoriesBtn() \{\
    saveNotebookCategoriesSilently();\
    const feedback = document.getElementById('catSaveFeedback');\
    feedback.style.display = 'block';\
    setTimeout(() => \{ feedback.style.display = 'none'; \}, 2500);\
    const data = loadAllData();\
    renderCategoryList(data.notebooks[currentNotebookId].categories || []);\
\}\
\
// --- Daily Pages Management ---\
function openNotebook(nbId) \{\
    currentNotebookId = nbId;\
    const data = loadAllData(); \
    const nb = data.notebooks[nbId];\
    \
    document.getElementById('notebooksGridView').style.display = 'none';\
    document.getElementById('plannerView').style.display = 'none';\
    document.getElementById('analyticsView').style.display = 'none';\
    document.getElementById('notebookDetailView').style.display = 'flex'; \
    document.getElementById('appHeaderSection').style.display = 'block'; \
\
    document.getElementById('detailNotebookTitle').innerText = nb.title;\
    document.getElementById('detailNotebookDesc').innerText = nb.desc;\
    \
    renderCategoryList(nb.categories || []);\
\
    const container = document.getElementById('savedPagesContainer'); \
    container.innerHTML = ''; \
    const dates = Object.keys(nb.pages).sort((a, b) => new Date(b) - new Date(a)); \
\
    if (dates.length === 0) \{ \
        container.innerHTML = '<p style="text-align:center; color:#666;">\uc0\u1488 \u1497 \u1503  \u1506 \u1491 \u1497 \u1497 \u1503  \u1491 \u1508 \u1497 \u1501  \u1489 \u1502 \u1495 \u1489 \u1512 \u1514  \u1494 \u1493 .</p>'; \
        return; \
    \}\
    \
    dates.forEach(dateStr => \{\
        const dayData = nb.pages[dateStr]; \
        const totalH = (dayData.totalMinutes / 60).toFixed(1);\
        let [y, m, d] = dateStr.split('-').map(Number);\
        const dateObj = new Date(y, m - 1, d);\
        const niceDate = dateObj.toLocaleDateString('he-IL', \{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' \});\
        \
        const div = document.createElement('div'); \
        div.className = 'page-item'; \
        div.onclick = () => loadDayIntoPlanner(dateStr);\
        \
        div.innerHTML = `\
            <div style="display:flex; align-items:center; gap:10px;">\
                <span>\uc0\u55357 \u56517  $\{niceDate\}</span>\
                <span style="font-size:14px; font-weight:normal; color:#555;">(\uc0\u9201 \u65039  $\{totalH\}h)</span>\
            </div>\
            <button class="delete-page-btn" onclick="event.stopPropagation(); deletePage('$\{dateStr\}')" title="\uc0\u1502 \u1495 \u1511  \u1491 \u1507 ">\u55357 \u56785 \u65039 </button>\
        `;\
        container.appendChild(div);\
    \});\
\}\
\
function createNewPage() \{ \
    const today = new Date(); \
    const y = today.getFullYear();\
    const m = String(today.getMonth() + 1).padStart(2, '0');\
    const d = String(today.getDate()).padStart(2, '0');\
    loadDayIntoPlanner(`$\{y\}-$\{m\}-$\{d\}`); \
\}\
\
function loadDayIntoPlanner(dateKey) \{\
    const data = loadAllData(); \
    const nb = data.notebooks[currentNotebookId];\
    const pages = nb.pages;\
    \
    let notebookCategories = nb.categories || [];\
\
    // Load options into category selects\
    const catSelects = document.querySelectorAll('.sched-cat');\
    catSelects.forEach(select => \{\
        select.innerHTML = '<option value=""></option>'; \
        notebookCategories.forEach(cat => \{\
            const opt = document.createElement('option');\
            opt.value = cat; \
            opt.innerText = cat;\
            select.appendChild(opt);\
        \});\
    \});\
\
    document.getElementById('activeDateKey').value = dateKey;\
    let [y, m, d] = dateKey.split('-');\
    document.getElementById('currentPlannerDate').value = `$\{d\}/$\{m\}/$\{y\}`;\
    clearPlannerForm();\
    \
    if (pages[dateKey]) \{\
        const dayData = pages[dateKey];\
        populateArray('.sched-task', dayData.schedTasks); \
        populateArray('.sched-cat', dayData.schedCats);\
        populateArray('.todo-text', dayData.todoTexts); \
        populateArray('.top-three', dayData.topThrees);\
        populateArray('.start-time', dayData.startTimes); \
        populateArray('.finish-time', dayData.finishTimes);\
        populateArray('.notes-time', dayData.notesTimes); \
        \
        document.getElementById('rewardInput').value = dayData.reward || '';\
        document.getElementById('goalInput').value = dayData.goal || '';\
        \
        populateChecks('.todo-check', dayData.todoChecks); \
        populateChecks('.track-check', dayData.trackChecks);\
        \
        const breaks = document.querySelectorAll('.break-box');\
        (dayData.breaks || []).forEach((isCrossed, i) => \{ \
            if (isCrossed && breaks[i]) breaks[i].classList.add('crossed'); \
        \});\
        \
        document.querySelectorAll('.time-input').forEach(input => \{ \
            if(input.value !== "") input.type = "time"; \
        \});\
    \}\
    \
    calculateTotalTime(); \
    document.getElementById('notebookDetailView').style.display = 'none'; \
    document.getElementById('plannerView').style.display = 'grid';\
\}\
\
function clearPlannerForm() \{\
    document.querySelectorAll('.save-target').forEach(el => \{\
        if (el.type === 'checkbox') el.checked = false;\
        else if (el.classList.contains('break-box')) el.classList.remove('crossed');\
        else if (el.id !== 'currentPlannerDate') el.value = '';\
        \
        if (el.classList.contains('time-input')) el.type = 'text'; \
    \});\
\}\
\
function saveCurrentData() \{\
    const dateKey = document.getElementById('activeDateKey').value; \
    if (!dateKey || !currentNotebookId) return; \
    \
    const totalMins = calculateTotalTime();\
    const dayData = \{\
        schedTasks: getArrayValues('.sched-task'), \
        schedCats: getArrayValues('.sched-cat'), \
        todoTexts: getArrayValues('.todo-text'), \
        todoChecks: getCheckValues('.todo-check'),\
        topThrees: getArrayValues('.top-three'), \
        startTimes: getArrayValues('.start-time'), \
        finishTimes: getArrayValues('.finish-time'), \
        trackChecks: getCheckValues('.track-check'),\
        notesTimes: getArrayValues('.notes-time'), \
        reward: document.getElementById('rewardInput').value, \
        goal: document.getElementById('goalInput').value,\
        breaks: Array.from(document.querySelectorAll('.break-box')).map(b => b.classList.contains('crossed')), \
        totalMinutes: totalMins\
    \};\
    \
    const data = loadAllData(); \
    data.notebooks[currentNotebookId].pages[dateKey] = dayData;\
    saveAllData(data); \
    triggerCloudSave(); \
\}\
\
// --- DOM Extraction Helpers ---\
function getArrayValues(selector) \{ return Array.from(document.querySelectorAll(selector)).map(el => el.value); \}\
function getCheckValues(selector) \{ return Array.from(document.querySelectorAll(selector)).map(el => el.checked); \}\
\
function populateArray(selector, valuesArr) \{ \
    if (!valuesArr) return; \
    const elements = document.querySelectorAll(selector); \
    valuesArr.forEach((val, i) => \{ \
        if (elements[i]) \{ \
            // Add options dynamically if they don't exist in dropdown\
            if (elements[i].tagName === 'SELECT' && val) \{\
                let exists = Array.from(elements[i].options).some(opt => opt.value === val);\
                if (!exists) \{\
                    let newOpt = document.createElement('option');\
                    newOpt.value = val; \
                    newOpt.innerText = val;\
                    elements[i].appendChild(newOpt);\
                \}\
            \}\
            elements[i].value = val; \
        \} \
    \}); \
\}\
\
function populateChecks(selector, boolArr) \{ \
    if (!boolArr) return; \
    const elements = document.querySelectorAll(selector); \
    boolArr.forEach((val, i) => \{ \
        if (elements[i]) elements[i].checked = val; \
    \}); \
\}\
\
function toggleBreak(element) \{ \
    element.classList.toggle('crossed'); \
    saveCurrentData(); \
\}\
\
// --- Time Calculation ---\
function calculateTotalTime() \{\
    let totalMinutes = 0; \
    const startTimes = document.querySelectorAll('.start-time'); \
    const finishTimes = document.querySelectorAll('.finish-time');\
    \
    for (let i = 0; i < 10; i++) \{\
        const startVal = startTimes[i].value; \
        const finishVal = finishTimes[i].value;\
        if (startVal && finishVal) \{\
            const [startH, startM] = startVal.split(':').map(Number); \
            const [finishH, finishM] = finishVal.split(':').map(Number);\
            let startTotalMins = (startH * 60) + startM; \
            let finishTotalMins = (finishH * 60) + finishM;\
            if (finishTotalMins < startTotalMins) finishTotalMins += (24 * 60); // Handle overnight\
            totalMinutes += (finishTotalMins - startTotalMins);\
        \}\
    \}\
    const finalHours = Math.floor(totalMinutes / 60); \
    const finalMins = totalMinutes % 60;\
    document.getElementById('totalTime').value = `$\{String(finalHours).padStart(2, '0')\}:$\{String(finalMins).padStart(2, '0')\}`;\
    return totalMinutes; \
\}\
\
// --- Event Listeners & OnLoad Initialization ---\
window.onload = () => \{\
    // Initialize UX for time inputs\
    const timeInputs = document.querySelectorAll('.time-input');\
    timeInputs.forEach(input => \{\
        input.addEventListener('focus', function() \{ this.type = 'time'; \});\
        input.addEventListener('blur', function() \{ if (this.value === '') this.type = 'text'; \});\
        input.addEventListener('dblclick', function() \{\
            this.type = 'time'; \
            if (this.value === '') \{ \
                const now = new Date(); \
                this.value = `$\{String(now.getHours()).padStart(2, '0')\}:$\{String(now.getMinutes()).padStart(2, '0')\}`; \
                this.dispatchEvent(new Event('change')); \
            \}\
        \});\
    \});\
    \
    // Auto-fill start time based on previous finish time\
    const finishTimes = document.querySelectorAll('.finish-time'); \
    const startTimes = document.querySelectorAll('.start-time');\
    finishTimes.forEach((finishInput, index) => \{\
        finishInput.addEventListener('change', function() \{\
            if (this.value !== '' && index + 1 < startTimes.length) \{\
                if (startTimes[index + 1].value === '') \{ \
                    startTimes[index + 1].type = 'time'; \
                    startTimes[index + 1].value = this.value; \
                    startTimes[index + 1].dispatchEvent(new Event('change')); \
                \}\
            \}\
        \});\
    \});\
\
    initCloudSync(); \
    switchTab('notebooks'); \
\};}