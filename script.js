(function () {
  // Edit these values to keep the challenge up to date.
  var CONFIG = {
    challengeStartDate: '2026-06-01', // Day 1 of the challenge
    igFollowers: 1450,
    igViews: 369000, // reel views, last 30 days
    weight: {
      start: 92.1,
      startLabel: 'Start · Jun 1',
      current: 86.35,
      currentLabel: 'Latest · Jun 30',
      targetMin: 76,
      targetMax: 78
    }
  };

  var HABIT_DEFS = [
    { name: 'Daily walk', target: 6, unit: 'km', step: 0.5 },
    { name: 'Pushups', target: 50, unit: 'reps', step: 5 },
    { name: 'Surya Namaskar', target: 20, unit: 'reps', step: 5 },
    { name: 'Diamond pushups', target: 20, unit: 'reps', step: 5 },
    { name: 'Skipping', target: 200, unit: 'reps', step: 20 },
    { name: 'Stretching', target: 10, unit: 'min', step: 5 },
    { name: 'Mountain climbers', target: 30, unit: 'reps', step: 5 },
    { name: 'Squats', target: 10, unit: 'reps', step: 5 }
  ];

  function computeDay() {
    var start = new Date(CONFIG.challengeStartDate + 'T00:00:00');
    var today = new Date();
    var startMid = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    var todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    var diffDays = Math.round((todayMid - startMid) / 86400000);
    var day = diffDays + 1;
    return Math.min(100, Math.max(1, day));
  }

  var DAY = computeDay();
  var STORAGE_KEY = 'hundo-habits-v3-d' + DAY;

  function loadHabits() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved) && saved.length === HABIT_DEFS.length) return saved;
    } catch (e) {}
    return HABIT_DEFS.map(function () { return 0; });
  }

  function saveHabits(values) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
    } catch (e) {}
  }

  var habitValues = loadHabits();

  function renderStats() {
    document.getElementById('streak-pct').textContent = DAY + '% complete';
    document.getElementById('progress-fill').style.width = DAY + '%';
    document.getElementById('checklist-day').textContent = DAY;
  }

  function renderWeight() {
    var w = CONFIG.weight;
    var targetMid = (w.targetMin + w.targetMax) / 2;
    var totalToLose = w.start - targetMid;
    var lostSoFar = w.start - w.current;
    var pct = totalToLose > 0 ? Math.round((lostSoFar / totalToLose) * 100) : 0;
    pct = Math.max(0, Math.min(100, pct));

    document.getElementById('weight-pct').textContent = pct + '% to goal';
    document.getElementById('weight-fill').style.width = pct + '%';
    document.getElementById('weight-start').textContent = w.start + ' kg';
    document.getElementById('weight-start-label').textContent = w.startLabel;
    document.getElementById('weight-current').textContent = w.current + ' kg';
    document.getElementById('weight-current-label').textContent = w.currentLabel;
    document.getElementById('weight-target').textContent = w.targetMin + '–' + w.targetMax + ' kg';
  }

  function renderStreakGrid() {
    var grid = document.getElementById('streak-grid');
    var frag = document.createDocumentFragment();
    for (var i = 0; i < 100; i++) {
      var n = i + 1;
      var past = i < DAY - 1;
      var current = i === DAY - 1;
      var sq = document.createElement('div');
      sq.className = 'streak-sq ' + (current ? 'current' : past ? 'past' : 'future');
      sq.title = 'Day ' + n;
      sq.textContent = n;
      frag.appendChild(sq);
    }
    grid.appendChild(frag);
  }

  function toggleHabit(i) {
    var def = HABIT_DEFS[i];
    var next = habitValues.slice();
    next[i] = (habitValues[i] || 0) >= def.target ? 0 : def.target;
    habitValues = next;
    saveHabits(next);
    renderHabits();
  }

  function onHabitInput(i, e) {
    var n = parseFloat(e.target.value);
    var next = habitValues.slice();
    next[i] = isNaN(n) || n < 0 ? 0 : n;
    habitValues = next;
    saveHabits(next);
    renderHabits();
  }

  function renderHabits() {
    var container = document.getElementById('habit-grid');
    container.innerHTML = '';
    var doneCount = 0;

    HABIT_DEFS.forEach(function (def, i) {
      var value = habitValues[i] || 0;
      var full = value >= def.target;
      var partial = value > 0 && value < def.target;
      if (full) doneCount++;

      var row = document.createElement('div');
      row.className = 'habit' + (full ? ' full' : partial ? ' partial' : '');

      var check = document.createElement('div');
      check.className = 'habit-check';
      check.textContent = full ? '✓' : partial ? '!' : '';
      check.addEventListener('click', function () { toggleHabit(i); });

      var name = document.createElement('div');
      name.className = 'habit-name';
      name.textContent = def.name;
      name.addEventListener('click', function () { toggleHabit(i); });

      var input = document.createElement('input');
      input.type = 'number';
      input.className = 'habit-input';
      input.min = '0';
      input.step = String(def.step);
      input.value = value;
      input.addEventListener('click', function (e) { e.stopPropagation(); });
      input.addEventListener('change', function (e) { onHabitInput(i, e); });

      var target = document.createElement('div');
      target.className = 'habit-target';
      target.textContent = '/ ' + def.target + ' ' + def.unit;

      row.appendChild(check);
      row.appendChild(name);
      row.appendChild(input);
      row.appendChild(target);
      container.appendChild(row);
    });

    document.getElementById('checklist-count').textContent = doneCount + '/' + HABIT_DEFS.length + ' done';
  }

  function animateHeroNumbers() {
    var dayEl = document.getElementById('stat-day');
    var dayText = dayEl.firstChild;
    var followersEl = document.getElementById('stat-followers');
    var viewsEl = document.getElementById('stat-views');
    var t0 = performance.now();
    var dur = 1800;

    function tick(now) {
      var p = Math.min(1, (now - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      dayText.textContent = Math.round(DAY * e);
      followersEl.textContent = Math.round(CONFIG.igFollowers * e).toLocaleString('en-US');
      viewsEl.textContent = Math.round(CONFIG.igViews * e).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function init() {
    renderStats();
    renderStreakGrid();
    renderWeight();
    renderHabits();
    animateHeroNumbers();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
