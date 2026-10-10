/* ═══════════════════════════════════════════════════════
   NXT ARCADE — Main Logic
   Author: AL-AMIN
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ═══════════════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════════════ */
var STATE = {
  theme: 'dark',
  currentCategory: 'all',
  currentGame: null,
  scores: {},
  playtime: 0,
  sessionStart: Date.now()
};

var STORE_KEY = 'nxt_arcade_v1';

/* ═══════════════════════════════════════════════════════
   ১০টি গেমের তথ্য
   ═══════════════════════════════════════════════════════ */
var GAMES = [
  { id:'snake', name:'Snake', icon:'🐍', category:'arcade', gradient:'linear-gradient(135deg,#10b981,#059669)', desc:'Classic snake game' },
  { id:'racer', name:'Endless Racer', icon:'🏎️', category:'racing', gradient:'linear-gradient(135deg,#ec4899,#f43f5e)', desc:'Dodge traffic at speed' },
  { id:'ttt', name:'Tic Tac Toe', icon:'🎯', category:'board', gradient:'linear-gradient(135deg,#8b5cf6,#6366f1)', desc:'Beat the AI' },
  { id:'2048', name:'2048', icon:'🔢', category:'puzzle', gradient:'linear-gradient(135deg,#f59e0b,#ef4444)', desc:'Merge the numbers' },
  { id:'flappy', name:'Flappy Bird', icon:'🐦', category:'action', gradient:'linear-gradient(135deg,#06b6d4,#3b82f6)', desc:'Tap to fly' },
  { id:'memory', name:'Memory', icon:'🧠', category:'puzzle', gradient:'linear-gradient(135deg,#a855f7,#ec4899)', desc:'Match the cards' },
  { id:'pong', name:'Pong', icon:'🏓', category:'arcade', gradient:'linear-gradient(135deg,#f97316,#ef4444)', desc:'Classic paddle battle' },
  { id:'tetris', name:'Tetris', icon:'🧱', category:'arcade', gradient:'linear-gradient(135deg,#3b82f6,#8b5cf6)', desc:'Stack the blocks' },
  { id:'breakout', name:'Breakout', icon:'🎯', category:'arcade', gradient:'linear-gradient(135deg,#10b981,#06b6d4)', desc:'Break all the bricks' },
  { id:'connect4', name:'Connect Four', icon:'⚫', category:'board', gradient:'linear-gradient(135deg,#ef4444,#f59e0b)', desc:'Get four in a row' }
];

/* ═══════════════════════════════════════════════════════
   BOOT
   ═══════════════════════════════════════════════════════ */
(function() {
  loadState();
  applyTheme();
  animateSplash();
  runBootSequence();
  buildUI();
  startPlaytimeCounter();
  
  console.log('%c🎮 NXT ARCADE v1.0', 'color:#6366f1;font-family:monospace;font-size:20px;font-weight:bold');
  console.log('%c>> Player: AL-AMIN', 'color:#ec4899;font-family:monospace;font-size:14px');
  console.log('%c>> Games loaded: ' + GAMES.length, 'color:#10b981;font-family:monospace;font-size:12px');
})();

/* ═══════════════════════════════════════════════════════
   SPLASH ANIMATION
   ═══════════════════════════════════════════════════════ */
function animateSplash() {
  var titleEl = document.getElementById('splashTitle');
  if (!titleEl) return;
  var word = 'NXT ARCADE';
  word.split('').forEach(function(ch, i) {
    var span = document.createElement('span');
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    span.style.animationDelay = (i * 0.06 + 0.3) + 's';
    titleEl.appendChild(span);
  });
}

function runBootSequence() {
  var bar = document.getElementById('bootBar');
  var txt = document.getElementById('bootText');
  var messages = ['LOADING ASSETS...', 'INITIALIZING GAMES...', 'LOADING SCORES...', 'READY!'];
  var pct = 0;
  var idx = 0;

  var interval = setInterval(function() {
    pct += 5;
    if (bar) bar.style.width = pct + '%';
    if (pct % 25 === 0 && idx < messages.length) {
      if (txt) txt.textContent = messages[idx];
      idx++;
    }
    if (pct >= 100) {
      clearInterval(interval);
      setTimeout(function() {
        var splash = document.getElementById('splash');
        if (splash) {
          splash.classList.add('hide');
          setTimeout(function() { splash.remove(); }, 600);
        }
      }, 400);
    }
  }, 40);
}

/* ═══════════════════════════════════════════════════════
   STATE MANAGEMENT
   ═══════════════════════════════════════════════════════ */
function loadState() {
  try {
    var saved = localStorage.getItem(STORE_KEY);
    if (saved) {
      var d = JSON.parse(saved);
      if (d.theme) STATE.theme = d.theme;
      if (d.scores) STATE.scores = d.scores;
      if (d.playtime) STATE.playtime = d.playtime;
    }
  } catch(e) {}
}

function saveState() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      theme: STATE.theme,
      scores: STATE.scores,
      playtime: STATE.playtime
    }));
  } catch(e) {}
}

function startPlaytimeCounter() {
  setInterval(function() {
    STATE.playtime += 1;
    if (STATE.playtime % 30 === 0) saveState();
    updateHeroStats();
  }, 1000);
}

/* ═══════════════════════════════════════════════════════
   BUILD UI
   ═══════════════════════════════════════════════════════ */
function buildUI() {
  buildFeaturedScroll();
  buildGameGrid();
  buildLeaderboard();
  updateHeroStats();
}

function buildFeaturedScroll() {
  var el = document.getElementById('featuredScroll');
  if (!el) return;
  el.innerHTML = '';
  
  GAMES.slice(0, 5).forEach(function(game) {
    var card = document.createElement('div');
    card.className = 'featured-card';
    card.style.background = game.gradient;
    card.onclick = function() { openGame(game.id); };
    card.innerHTML =
      '<div class="featured-card-emoji">' + game.icon + '</div>' +
      '<div class="featured-card-content">' +
        '<div class="featured-card-title">' + game.name + '</div>' +
        '<div class="featured-card-sub">' + game.desc + '</div>' +
      '</div>' +
      '<div class="featured-card-play"><i class="fas fa-play"></i> PLAY</div>';
    el.appendChild(card);
  });
}

function buildGameGrid() {
  var el = document.getElementById('gameGrid');
  if (!el) return;
  el.innerHTML = '';
  
  GAMES.forEach(function(game) {
    var best = STATE.scores[game.id] || 0;
    var card = document.createElement('div');
    card.className = 'game-card';
    card.dataset.cat = game.category;
    card.dataset.name = game.name.toLowerCase();
    card.onclick = function() { openGame(game.id); };
    card.innerHTML =
      '<div class="game-card-thumb" style="background:' + game.gradient + '">' +
        game.icon +
      '</div>' +
      '<div class="game-card-info">' +
        '<div class="game-card-name">' + game.name + '</div>' +
        '<div class="game-card-meta">' +
          '<span class="game-card-cat">' + game.category + '</span>' +
          '<span class="game-card-score">Best: <b>' + best + '</b></span>' +
        '</div>' +
      '</div>' +
      '<div class="game-card-play"><i class="fas fa-play"></i> PLAY</div>';
    el.appendChild(card);
  });
  
  var count = document.getElementById('gameCount');
  if (count) count.textContent = GAMES.length + ' games';
}

function buildLeaderboard() {
  var el = document.getElementById('leaderboard');
  if (!el) return;
  el.innerHTML = '';
  
  var sorted = GAMES.map(function(g) {
    return { name: g.name, icon: g.icon, score: STATE.scores[g.id] || 0 };
  }).sort(function(a, b) { return b.score - a.score; });
  
  var medals = ['🥇', '🥈', '🥉'];
  
  sorted.slice(0, 5).forEach(function(g, idx) {
    var item = document.createElement('div');
    item.className = 'lb-item';
    item.innerHTML =
      '<div class="lb-rank">' + (idx < 3 ? medals[idx] : (idx+1)) + '</div>' +
      '<div class="lb-emoji">' + g.icon + '</div>' +
      '<div class="lb-name">' + g.name + '</div>' +
      '<div class="lb-score">' + g.score + '</div>';
    el.appendChild(item);
  });
}

function updateHeroStats() {
  var totalScore = 0;
  Object.keys(STATE.scores).forEach(function(k) {
    totalScore += STATE.scores[k] || 0;
  });
  
  var totalEl = document.getElementById('heroTotalScore');
  if (totalEl) totalEl.textContent = totalScore;
  
  var min = Math.floor(STATE.playtime / 60);
  var timeEl = document.getElementById('heroPlaytime');
  if (timeEl) timeEl.textContent = min + 'm';
  
  var gamesEl = document.getElementById('heroTotalGames');
  if (gamesEl) gamesEl.textContent = GAMES.length;
}

/* ═══════════════════════════════════════════════════════
   NAVIGATION
   ═══════════════════════════════════════════════════════ */
function goHome() {
  document.querySelectorAll('.game-screen').forEach(function(s) {
    s.classList.remove('active');
  });
  var home = document.getElementById('homeScreen');
  if (home) home.style.display = 'block';
  STATE.currentGame = null;
  buildGameGrid();
  buildLeaderboard();
  updateHeroStats();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openGame(id) {
  var home = document.getElementById('homeScreen');
  if (home) home.style.display = 'none';
  
  var screen = document.getElementById('game-' + id);
  if (!screen) return;
  
  screen.classList.add('active');
  STATE.currentGame = id;
  
  // Restart that game
  var restarter = {
    'snake': 'snakeRestart',
    'racer': 'racerRestart',
    'ttt': 'tttRestart',
    '2048': 'g2048Restart',
    'flappy': 'flappyRestart',
    'memory': 'memoryRestart',
    'pong': 'pongRestart',
    'tetris': 'tetrisRestart',
    'breakout': 'breakoutRestart',
    'connect4': 'c4Restart'
  }[id];
  
  if (restarter && typeof window[restarter] === 'function') {
    setTimeout(function() { window[restarter](); }, 100);
  }
  
  updateBottomNav();
}

function updateBottomNav() {
  document.querySelectorAll('.nav-btn').forEach(function(b) {
    b.classList.remove('active');
  });
  var homeBtn = document.querySelector('.nav-btn:first-child');
  if (homeBtn && !STATE.currentGame) homeBtn.classList.add('active');
}

/* ═══════════════════════════════════════════════════════
   SCORE MANAGEMENT
   ═══════════════════════════════════════════════════════ */
function saveScore(gameId, score) {
  if (!STATE.scores[gameId] || score > STATE.scores[gameId]) {
    STATE.scores[gameId] = score;
    saveState();
    return true;
  }
  return false;
}

function getScore(gameId) {
  return STATE.scores[gameId] || 0;
}

/* ═══════════════════════════════════════════════════════
   FILTER & SEARCH
   ═══════════════════════════════════════════════════════ */
function filterCat(cat) {
  STATE.currentCategory = cat;
  
  document.querySelectorAll('.cat-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.cat === cat);
  });
  
  document.querySelectorAll('.game-card').forEach(function(card) {
    if (cat === 'all' || card.dataset.cat === cat) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}

function searchGames(query) {
  var q = query.toLowerCase().trim();
  document.querySelectorAll('.game-card').forEach(function(card) {
    if (!q || card.dataset.name.indexOf(q) !== -1) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}

/* ═══════════════════════════════════════════════════════
   STATS & PROFILE
   ═══════════════════════════════════════════════════════ */
function showStats() {
  var totalScore = 0;
  var playedGames = 0;
  Object.keys(STATE.scores).forEach(function(k) {
    if (STATE.scores[k] > 0) {
      totalScore += STATE.scores[k];
      playedGames++;
    }
  });
  
  var min = Math.floor(STATE.playtime / 60);
  var sec = STATE.playtime % 60;
  
  showToast('📊 ' + playedGames + ' games played · ' + totalScore + ' total score · ' + min + 'm ' + sec + 's playtime');
}

function showProfile() {
  showToast('👤 Player: AL-AMIN · Level: ' + Math.floor((STATE.scores.snake || 0) / 10 + 1));
}

/* ═══════════════════════════════════════════════════════
   THEME
   ═══════════════════════════════════════════════════════ */
function toggleTheme() {
  STATE.theme = STATE.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
  saveState();
  showToast('Theme: ' + STATE.theme.toUpperCase());
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', STATE.theme);
  var icon = document.getElementById('themeIcon');
  if (icon) icon.className = STATE.theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}

/* ═══════════════════════════════════════════════════════
   TOAST
   ═══════════════════════════════════════════════════════ */
var TOAST_TIMER = null;
function showToast(msg, type) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast';
  if (type) t.classList.add(type);
  t.classList.add('show');
  clearTimeout(TOAST_TIMER);
  TOAST_TIMER = setTimeout(function() { t.classList.remove('show'); }, 3000);
}

/* ═══════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS
   ═══════════════════════════════════════════════════════ */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && STATE.currentGame) {
    goHome();
  }
});

/* ═══════════════════════════════════════════════════════
   END
   ═══════════════════════════════════════════════════════ */
