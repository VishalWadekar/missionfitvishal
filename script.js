(function () {
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

  function computeDay(startDate) {
    var start = new Date(startDate + 'T00:00:00');
    var today = new Date();
    var startMid = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    var todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    var diffDays = Math.round((todayMid - startMid) / 86400000);
    var day = diffDays + 1;
    return Math.min(100, Math.max(1, day));
  }

  function renderStats(day) {
    document.getElementById('streak-pct').textContent = day + '% complete';
    document.getElementById('progress-fill').style.width = day + '%';
    document.getElementById('checklist-day').textContent = day;
  }

  function renderSugarFree(streak) {
    var el = document.getElementById('stat-sugarfree');
    el.textContent = (streak === null || streak === undefined) ? '—' : streak;
  }

  function renderWeight(w) {
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

  function renderStreakGrid(day) {
    var grid = document.getElementById('streak-grid');
    var frag = document.createDocumentFragment();
    for (var i = 0; i < 100; i++) {
      var n = i + 1;
      var past = i < day - 1;
      var current = i === day - 1;
      var sq = document.createElement('div');
      sq.className = 'streak-sq ' + (current ? 'current' : past ? 'past' : 'future');
      sq.title = 'Day ' + n;
      sq.textContent = n;
      frag.appendChild(sq);
    }
    grid.appendChild(frag);
  }

  function renderHabits(habitValues) {
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

      var name = document.createElement('div');
      name.className = 'habit-name';
      name.textContent = def.name;

      var valueEl = document.createElement('div');
      valueEl.className = 'habit-value';
      valueEl.textContent = value;

      var target = document.createElement('div');
      target.className = 'habit-target';
      target.textContent = '/ ' + def.target + ' ' + def.unit;

      row.appendChild(check);
      row.appendChild(name);
      row.appendChild(valueEl);
      row.appendChild(target);
      container.appendChild(row);
    });

    document.getElementById('checklist-count').textContent = doneCount + '/' + HABIT_DEFS.length + ' done';
  }

  function animateHeroNumbers(day, igFollowers, igViews, igViewsSuffix) {
    var dayEl = document.getElementById('stat-day');
    var dayText = dayEl.firstChild;
    var followersEl = document.getElementById('stat-followers');
    var viewsEl = document.getElementById('stat-views');
    var suffix = igViewsSuffix || '';
    var t0 = performance.now();
    var dur = 1800;

    function tick(now) {
      var p = Math.min(1, (now - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      dayText.textContent = Math.round(day * e);
      followersEl.textContent = Math.round(igFollowers * e).toLocaleString('en-US');
      viewsEl.textContent = Math.round(igViews * e).toLocaleString('en-US') + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function init(data) {
    var day = computeDay(data.challengeStartDate);
    renderStats(day);
    renderSugarFree(data.sugarFreeStreak);
    renderStreakGrid(day);
    renderWeight(data.weight);
    renderHabits(data.habitValues || []);
    animateHeroNumbers(day, data.igFollowers, data.igViews, data.igViewsSuffix);
  }

  document.addEventListener('DOMContentLoaded', function () {
    fetch('data.json')
      .then(function (res) { return res.json(); })
      .then(init)
      .catch(function (err) {
        console.error('Failed to load data.json', err);
      });
  });
})();
