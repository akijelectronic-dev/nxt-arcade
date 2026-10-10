/* ═══════════════════════════════════════════════════════
   NXT ARCADE — Games Logic (10 Games)
   Author: AL-AMIN
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ═══════════════════════════════════════════════════════════════
   1. SNAKE
   ═══════════════════════════════════════════════════════════════ */
var snakeGame = {
  canvas: null, ctx: null,
  snake: [], dir: 'right', nextDir: 'right',
  food: {x:0,y:0}, grid: 20, cell: 20,
  score: 0, speed: 120, running: false, paused: false,
  loop: null
};

function snakeRestart() {
  var canvas = document.getElementById('snakeCanvas');
  if (!canvas) return;
  snakeGame.canvas = canvas;
  snakeGame.ctx = canvas.getContext('2d');
  snakeGame.grid = 20;
  snakeGame.cell = canvas.width / snakeGame.grid;
  snakeGame.snake = [{x:10,y:10},{x:9,y:10},{x:8,y:10}];
  snakeGame.dir = 'right';
  snakeGame.nextDir = 'right';
  snakeGame.score = 0;
  snakeGame.speed = 120;
  snakeGame.running = true;
  snakeGame.paused = false;
  
  document.getElementById('snake-score').textContent = '0';
  document.getElementById('snake-best').textContent = getScore('snake');
  document.getElementById('snakeOverlay').classList.remove('active');
  
  snakeSpawnFood();
  if (snakeGame.loop) clearInterval(snakeGame.loop);
  snakeGame.loop = setInterval(snakeTick, snakeGame.speed);
}

function snakeSpawnFood() {
  var g = snakeGame.grid;
  do {
    snakeGame.food = {
      x: Math.floor(Math.random() * g),
      y: Math.floor(Math.random() * g)
    };
  } while (snakeGame.snake.some(function(s) { return s.x === snakeGame.food.x && s.y === snakeGame.food.y; }));
}

function snakeTick() {
  if (!snakeGame.running || snakeGame.paused) return;
  
  snakeGame.dir = snakeGame.nextDir;
  var head = {x: snakeGame.snake[0].x, y: snakeGame.snake[0].y};
  
  if (snakeGame.dir === 'right') head.x++;
  else if (snakeGame.dir === 'left') head.x--;
  else if (snakeGame.dir === 'up') head.y--;
  else if (snakeGame.dir === 'down') head.y++;
  
  // Wall collision
  if (head.x < 0 || head.x >= snakeGame.grid || head.y < 0 || head.y >= snakeGame.grid) {
    return snakeGameOver();
  }
  
  // Self collision
  if (snakeGame.snake.some(function(s) { return s.x === head.x && s.y === head.y; })) {
    return snakeGameOver();
  }
  
  snakeGame.snake.unshift(head);
  
  if (head.x === snakeGame.food.x && head.y === snakeGame.food.y) {
    snakeGame.score += 10;
    document.getElementById('snake-score').textContent = snakeGame.score;
    snakeSpawnFood();
    // Speed up every 50 points
    if (snakeGame.score % 50 === 0) {
      snakeGame.speed = Math.max(50, snakeGame.speed - 10);
      clearInterval(snakeGame.loop);
      snakeGame.loop = setInterval(snakeTick, snakeGame.speed);
    }
  } else {
    snakeGame.snake.pop();
  }
  
  snakeDraw();
}

function snakeDraw() {
  var ctx = snakeGame.ctx;
  var cell = snakeGame.cell;
  var g = snakeGame.grid;
  
  // Background
  ctx.fillStyle = '#0a1020';
  ctx.fillRect(0, 0, snakeGame.canvas.width, snakeGame.canvas.height);
  
  // Grid
  ctx.strokeStyle = 'rgba(99,102,241,.1)';
  ctx.lineWidth = 1;
  for (var i = 0; i <= g; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cell, 0);
    ctx.lineTo(i * cell, snakeGame.canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * cell);
    ctx.lineTo(snakeGame.canvas.width, i * cell);
    ctx.stroke();
  }
  
  // Food
  var fx = snakeGame.food.x * cell + cell/2;
  var fy = snakeGame.food.y * cell + cell/2;
  ctx.fillStyle = '#ec4899';
  ctx.shadowColor = '#ec4899';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(fx, fy, cell/2 - 2, 0, Math.PI*2);
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Snake
  snakeGame.snake.forEach(function(seg, idx) {
    var x = seg.x * cell;
    var y = seg.y * cell;
    if (idx === 0) {
      ctx.fillStyle = '#10b981';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 15;
    } else {
      ctx.fillStyle = 'rgba(16,185,129,' + (1 - idx/(snakeGame.snake.length*1.5)) + ')';
      ctx.shadowBlur = 0;
    }
    ctx.beginPath();
    ctx.roundRect(x + 1, y + 1, cell - 2, cell - 2, 4);
    ctx.fill();
  });
  ctx.shadowBlur = 0;
}

function snakeTurn(dir) {
  var opp = {up:'down', down:'up', left:'right', right:'left'};
  if (dir !== opp[snakeGame.dir]) {
    snakeGame.nextDir = dir;
  }
}

function snakeTogglePause() {
  snakeGame.paused = !snakeGame.paused;
  showToast(snakeGame.paused ? 'Paused' : 'Resumed');
}

function snakeGameOver() {
  snakeGame.running = false;
  clearInterval(snakeGame.loop);
  var isNew = saveScore('snake', snakeGame.score);
  document.getElementById('snakeFinalScore').textContent = snakeGame.score;
  document.getElementById('snakeOverlay').classList.add('active');
  document.getElementById('snake-best').textContent = getScore('snake');
  if (isNew) showToast('🏆 New High Score!', 'success');
}

document.addEventListener('keydown', function(e) {
  if (STATE.currentGame !== 'snake') return;
  if (e.key === 'ArrowUp' || e.key === 'w') snakeTurn('up');
  if (e.key === 'ArrowDown' || e.key === 's') snakeTurn('down');
  if (e.key === 'ArrowLeft' || e.key === 'a') snakeTurn('left');
  if (e.key === 'ArrowRight' || e.key === 'd') snakeTurn('right');
  if (e.key === ' ') { e.preventDefault(); snakeTogglePause(); }
});

/* ═══════════════════════════════════════════════════════════════
   2. ENDLESS RACER
   ═══════════════════════════════════════════════════════════════ */
var racerGame = {
  canvas: null, ctx: null,
  playerX: 200, playerY: 400, playerW: 36, playerH: 64,
  speed: 5, score: 0, running: false, paused: false,
  enemies: [], roadOffset: 0, loop: null, spawnTimer: 0
};

function racerRestart() {
  var canvas = document.getElementById('racerCanvas');
  if (!canvas) return;
  racerGame.canvas = canvas;
  racerGame.ctx = canvas.getContext('2d');
  racerGame.playerX = canvas.width / 2 - racerGame.playerW / 2;
  racerGame.playerY = canvas.height - 100;
  racerGame.speed = 5;
  racerGame.score = 0;
  racerGame.running = true;
  racerGame.paused = false;
  racerGame.enemies = [];
  racerGame.roadOffset = 0;
  racerGame.spawnTimer = 0;
  
  document.getElementById('racer-score').textContent = '0';
  document.getElementById('racer-speed').textContent = '0';
  document.getElementById('racerOverlay').classList.remove('active');
  
  if (racerGame.loop) clearInterval(racerGame.loop);
  racerGame.loop = setInterval(racerTick, 30);
}

function racerTick() {
  if (!racerGame.running || racerGame.paused) return;
  
  racerGame.score += 1;
  racerGame.roadOffset = (racerGame.roadOffset + racerGame.speed) % 60;
  
  if (racerGame.score % 100 === 0) racerGame.speed += 0.5;
  
  document.getElementById('racer-score').textContent = racerGame.score;
  document.getElementById('racer-speed').textContent = Math.floor(racerGame.speed * 30);
  
  // Spawn enemies
  racerGame.spawnTimer++;
  if (racerGame.spawnTimer > Math.max(20, 60 - racerGame.speed * 2)) {
    racerGame.spawnTimer = 0;
    var lanes = 4;
    var lane = Math.floor(Math.random() * lanes);
    var laneW = racerGame.canvas.width / lanes;
    racerGame.enemies.push({
      x: lane * laneW + laneW/2 - 18,
      y: -80,
      w: 36, h: 60,
      color: ['#f59e0b','#ec4899','#06b6d4','#8b5cf6'][Math.floor(Math.random()*4)]
    });
  }
  
  // Move enemies
  racerGame.enemies.forEach(function(e) { e.y += racerGame.speed * 1.5; });
  racerGame.enemies = racerGame.enemies.filter(function(e) { return e.y < racerGame.canvas.height + 100; });
  
  // Collision
  for (var i = 0; i < racerGame.enemies.length; i++) {
    var e = racerGame.enemies[i];
    if (racerGame.playerX < e.x + e.w &&
        racerGame.playerX + racerGame.playerW > e.x &&
        racerGame.playerY < e.y + e.h &&
        racerGame.playerY + racerGame.playerH > e.y) {
      return racerGameOver();
    }
  }
  
  racerDraw();
}

function racerDraw() {
  var ctx = racerGame.ctx;
  var c = racerGame.canvas;
  
  // Road
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, c.width, c.height);
  
  // Lane lines
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 3;
  ctx.setLineDash([30, 30]);
  ctx.lineDashOffset = -racerGame.roadOffset;
  for (var i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(i * c.width / 4, 0);
    ctx.lineTo(i * c.width / 4, c.height);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  
  // Enemies
  racerGame.enemies.forEach(function(e) {
    ctx.fillStyle = e.color;
    ctx.beginPath();
    ctx.roundRect(e.x, e.y, e.w, e.h, 8);
    ctx.fill();
    // Windshield
    ctx.fillStyle = 'rgba(255,255,255,.3)';
    ctx.beginPath();
    ctx.roundRect(e.x + 4, e.y + 10, e.w - 8, 15, 4);
    ctx.fill();
  });
  
  // Player car
  ctx.fillStyle = '#10b981';
  ctx.shadowColor = '#10b981';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.roundRect(racerGame.playerX, racerGame.playerY, racerGame.playerW, racerGame.playerH, 8);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Windshield
  ctx.fillStyle = 'rgba(255,255,255,.4)';
  ctx.beginPath();
  ctx.roundRect(racerGame.playerX + 4, racerGame.playerY + 12, racerGame.playerW - 8, 18, 4);
  ctx.fill();
}

function racerMove(dir) {
  if (!racerGame.running || racerGame.paused) return;
  var step = 40;
  if (dir === 'left') racerGame.playerX = Math.max(10, racerGame.playerX - step);
  if (dir === 'right') racerGame.playerX = Math.min(racerGame.canvas.width - racerGame.playerW - 10, racerGame.playerX + step);
  racerDraw();
}

function racerTogglePause() {
  racerGame.paused = !racerGame.paused;
  showToast(racerGame.paused ? 'Paused' : 'Resumed');
}

function racerGameOver() {
  racerGame.running = false;
  clearInterval(racerGame.loop);
  var isNew = saveScore('racer', racerGame.score);
  document.getElementById('racerFinalScore').textContent = racerGame.score;
  document.getElementById('racerOverlay').classList.add('active');
  if (isNew) showToast('🏆 New High Score!', 'success');
}

document.addEventListener('keydown', function(e) {
  if (STATE.currentGame !== 'racer') return;
  if (e.key === 'ArrowLeft' || e.key === 'a') racerMove('left');
  if (e.key === 'ArrowRight' || e.key === 'd') racerMove('right');
  if (e.key === ' ') { e.preventDefault(); racerTogglePause(); }
});

/* ═══════════════════════════════════════════════════════════════
   3. TIC TAC TOE
   ═══════════════════════════════════════════════════════════════ */
var tttState = {
  board: ['','','','','','','','',''],
  playerTurn: true,
  gameOver: false,
  difficulty: 'hard',
  wins: 0,
  losses: 0
};

function tttRestart() {
  tttState.board = ['','','','','','','','',''];
  tttState.playerTurn = true;
  tttState.gameOver = false;
  document.querySelectorAll('.ttt-cell').forEach(function(c) {
    c.textContent = '';
    c.className = 'ttt-cell';
  });
  document.getElementById('tttStatus').textContent = 'Your Turn (X)';
  document.getElementById('tttStatus').className = 'ttt-status';
}

function tttSetDiff(diff) {
  tttState.difficulty = diff;
  document.querySelectorAll('.diff-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.diff === diff);
  });
  tttRestart();
}

function tttPlay(idx) {
  if (tttState.gameOver || !tttState.playerTurn || tttState.board[idx]) return;
  
  tttState.board[idx] = 'X';
  tttRender();
  
  if (tttCheckWin('X')) {
    tttState.gameOver = true;
    tttState.wins++;
    document.getElementById('ttt-wins').textContent = tttState.wins;
    document.getElementById('tttStatus').textContent = '🎉 You Win!';
    document.getElementById('tttStatus').className = 'ttt-status win';
    return;
  }
  
  if (tttState.board.every(function(c){ return c; })) {
    tttState.gameOver = true;
    document.getElementById('tttStatus').textContent = 'Draw!';
    return;
  }
  
  tttState.playerTurn = false;
  document.getElementById('tttStatus').textContent = 'AI Thinking...';
  setTimeout(tttAIMove, 400);
}

function tttAIMove() {
  if (tttState.gameOver) return;
  
  var move;
  if (tttState.difficulty === 'easy') {
    move = tttRandomMove();
  } else {
    move = tttBestMove();
  }
  
  if (move === -1) return;
  
  tttState.board[move] = 'O';
  tttRender();
  
  if (tttCheckWin('O')) {
    tttState.gameOver = true;
    tttState.losses++;
    document.getElementById('ttt-losses').textContent = tttState.losses;
    document.getElementById('tttStatus').textContent = '😞 AI Wins!';
    document.getElementById('tttStatus').className = 'ttt-status lose';
    return;
  }
  
  if (tttState.board.every(function(c){ return c; })) {
    tttState.gameOver = true;
    document.getElementById('tttStatus').textContent = 'Draw!';
    return;
  }
  
  tttState.playerTurn = true;
  document.getElementById('tttStatus').textContent = 'Your Turn (X)';
}

function tttRandomMove() {
  var empty = [];
  tttState.board.forEach(function(v, i) { if (!v) empty.push(i); });
  return empty.length ? empty[Math.floor(Math.random() * empty.length)] : -1;
}

function tttBestMove() {
  var bestScore = -Infinity;
  var bestMove = -1;
  for (var i = 0; i < 9; i++) {
    if (!tttState.board[i]) {
      tttState.board[i] = 'O';
      var score = tttMinimax(tttState.board, 0, false);
      tttState.board[i] = '';
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

function tttMinimax(board, depth, isMax) {
  var result = tttCheckWinState(board);
  if (result === 'O') return 10 - depth;
  if (result === 'X') return depth - 10;
  if (board.every(function(c){ return c; })) return 0;
  
  if (isMax) {
    var best = -Infinity;
    for (var i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O';
        best = Math.max(best, tttMinimax(board, depth + 1, false));
        board[i] = '';
      }
    }
    return best;
  } else {
    var best2 = Infinity;
    for (var j = 0; j < 9; j++) {
      if (!board[j]) {
        board[j] = 'X';
        best2 = Math.min(best2, tttMinimax(board, depth + 1, true));
        board[j] = '';
      }
    }
    return best2;
  }
}

function tttCheckWin(p) {
  return tttCheckWinState(tttState.board) === p;
}

function tttCheckWinState(board) {
  var lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (var i = 0; i < lines.length; i++) {
    var l = lines[i];
    if (board[l[0]] && board[l[0]] === board[l[1]] && board[l[1]] === board[l[2]]) {
      return board[l[0]];
    }
  }
  return null;
}

function tttRender() {
  document.querySelectorAll('.ttt-cell').forEach(function(cell, i) {
    var v = tttState.board[i];
    cell.textContent = v;
    cell.className = 'ttt-cell' + (v ? ' filled ' + v.toLowerCase() : '');
  });
}

/* ═══════════════════════════════════════════════════════════════
   4. 2048
   ═══════════════════════════════════════════════════════════════ */
var g2048State = {
  board: [],
  score: 0
};

function g2048Restart() {
  g2048State.board = [];
  for (var i = 0; i < 16; i++) g2048State.board.push(0);
  g2048State.score = 0;
  g2048AddTile();
  g2048AddTile();
  document.getElementById('g2048-score').textContent = '0';
  document.getElementById('g2048-best').textContent = getScore('2048');
  g2048Render();
}

function g2048AddTile() {
  var empty = [];
  g2048State.board.forEach(function(v, i) { if (!v) empty.push(i); });
  if (!empty.length) return;
  var idx = empty[Math.floor(Math.random() * empty.length)];
  g2048State.board[idx] = Math.random() > 0.9 ? 4 : 2;
}

function g2048Move(dir) {
  var b = g2048State.board;
  var moved = false;
  var size = 4;
  
  function getRow(i) {
    var row = [];
    for (var j = 0; j < size; j++) {
      if (dir === 'left') row.push(b[i*size + j]);
      else if (dir === 'right') row.push(b[i*size + (size-1-j)]);
      else if (dir === 'up') row.push(b[j*size + i]);
      else if (dir === 'down') row.push(b[(size-1-j)*size + i]);
    }
    return row;
  }
  
  function setRow(i, row) {
    for (var j = 0; j < size; j++) {
      if (dir === 'left') b[i*size + j] = row[j];
      else if (dir === 'right') b[i*size + (size-1-j)] = row[j];
      else if (dir === 'up') b[j*size + i] = row[j];
      else if (dir === 'down') b[(size-1-j)*size + i] = row[j];
    }
  }
  
  function merge(row) {
    var result = row.filter(function(v) { return v; });
    for (var i = 0; i < result.length - 1; i++) {
      if (result[i] === result[i+1]) {
        result[i] *= 2;
        g2048State.score += result[i];
        result.splice(i+1, 1);
      }
    }
    while (result.length < size) result.push(0);
    return result;
  }
  
  for (var i = 0; i < size; i++) {
    var orig = getRow(i);
    var merged = merge(orig);
    if (orig.join(',') !== merged.join(',')) moved = true;
    setRow(i, merged);
  }
  
  if (moved) {
    g2048AddTile();
    document.getElementById('g2048-score').textContent = g2048State.score;
    g2048Render();
    if (g2048State.score > getScore('2048')) {
      saveScore('2048', g2048State.score);
      document.getElementById('g2048-best').textContent = g2048State.score;
    }
  }
}

function g2048Render() {
  var grid = document.getElementById('g2048Grid');
  if (!grid) return;
  if (!grid.children.length) {
    for (var i = 0; i < 16; i++) {
      var cell = document.createElement('div');
      cell.className = 'g2048-cell';
      grid.appendChild(cell);
    }
  }
  for (var j = 0; j < 16; j++) {
    var v = g2048State.board[j];
    var cellEl = grid.children[j];
    cellEl.textContent = v || '';
    cellEl.setAttribute('data-val', v || '');
  }
}

document.addEventListener('keydown', function(e) {
  if (STATE.currentGame !== '2048') return;
  if (e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); g2048Move('up'); }
  if (e.key === 'ArrowDown' || e.key === 's') { e.preventDefault(); g2048Move('down'); }
  if (e.key === 'ArrowLeft' || e.key === 'a') { e.preventDefault(); g2048Move('left'); }
  if (e.key === 'ArrowRight' || e.key === 'd') { e.preventDefault(); g2048Move('right'); }
});

/* ═══════════════════════════════════════════════════════════════
   5. FLAPPY BIRD
   ═══════════════════════════════════════════════════════════════ */
var flappyGame = {
  canvas: null, ctx: null,
  bird: {x:80, y:250, vy:0, w:32, h:26},
  pipes: [], score: 0, best: 0,
  gravity: 0.5, jump: -8,
  running: false, loop: null, frame: 0
};

function flappyRestart() {
  var c = document.getElementById('flappyCanvas');
  if (!c) return;
  flappyGame.canvas = c;
  flappyGame.ctx = c.getContext('2d');
  flappyGame.bird = {x:80, y:250, vy:0, w:32, h:26};
  flappyGame.pipes = [];
  flappyGame.score = 0;
  flappyGame.frame = 0;
  flappyGame.running = true;
  document.getElementById('flappy-score').textContent = '0';
  document.getElementById('flappy-best').textContent = getScore('flappy');
  document.getElementById('flappyOverlay').classList.remove('active');
  if (flappyGame.loop) clearInterval(flappyGame.loop);
  flappyGame.loop = setInterval(flappyTick, 25);
}

function flappyJump() {
  if (!flappyGame.running) { flappyRestart(); return; }
  flappyGame.bird.vy = flappyGame.jump;
}

function flappyTick() {
  if (!flappyGame.running) return;
  flappyGame.frame++;
  
  flappyGame.bird.vy += flappyGame.gravity;
  flappyGame.bird.y += flappyGame.bird.vy;
  
  // Ceiling/floor
  if (flappyGame.bird.y < 0) { flappyGame.bird.y = 0; flappyGame.bird.vy = 0; }
  if (flappyGame.bird.y + flappyGame.bird.h > flappyGame.canvas.height) {
    return flappyGameOver();
  }
  
  // Spawn pipes
  if (flappyGame.frame % 90 === 0) {
    var gap = 140;
    var top = 50 + Math.random() * (flappyGame.canvas.height - gap - 100);
    flappyGame.pipes.push({x: flappyGame.canvas.width, top: top, gap: gap, w: 60, scored: false});
  }
  
  // Move pipes
  flappyGame.pipes.forEach(function(p) { p.x -= 2.5; });
  flappyGame.pipes = flappyGame.pipes.filter(function(p) { return p.x + p.w > 0; });
  
  // Collision + score
  for (var i = 0; i < flappyGame.pipes.length; i++) {
    var p = flappyGame.pipes[i];
    var b = flappyGame.bird;
    if (b.x < p.x + p.w && b.x + b.w > p.x) {
      if (b.y < p.top || b.y + b.h > p.top + p.gap) {
        return flappyGameOver();
      }
    }
    if (!p.scored && p.x + p.w < b.x) {
      p.scored = true;
      flappyGame.score++;
      document.getElementById('flappy-score').textContent = flappyGame.score;
    }
  }
  
  flappyDraw();
}

function flappyDraw() {
  var ctx = flappyGame.ctx;
  var c = flappyGame.canvas;
  
  // Sky gradient
  var grad = ctx.createLinearGradient(0, 0, 0, c.height);
  grad.addColorStop(0, '#06b6d4');
  grad.addColorStop(1, '#3b82f6');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, c.width, c.height);
  
  // Pipes
  flappyGame.pipes.forEach(function(p) {
    ctx.fillStyle = '#10b981';
    ctx.shadowColor = '#059669';
    ctx.shadowBlur = 15;
    ctx.fillRect(p.x, 0, p.w, p.top);
    ctx.fillRect(p.x, p.top + p.gap, p.w, c.height - p.top - p.gap);
    ctx.shadowBlur = 0;
  });
  
  // Bird
  var b = flappyGame.bird;
  ctx.fillStyle = '#fbbf24';
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(b.x + b.w/2, b.y + b.h/2, b.w/2, 0, Math.PI*2);
  ctx.fill();
  ctx.shadowBlur = 0;
  // Eye
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(b.x + b.w/2 + 6, b.y + b.h/2 - 4, 3, 0, Math.PI*2);
  ctx.fill();
  // Beak
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.moveTo(b.x + b.w - 2, b.y + b.h/2);
  ctx.lineTo(b.x + b.w + 10, b.y + b.h/2 + 3);
  ctx.lineTo(b.x + b.w - 2, b.y + b.h/2 + 6);
  ctx.closePath();
  ctx.fill();
}

function flappyGameOver() {
  flappyGame.running = false;
  clearInterval(flappyGame.loop);
  var isNew = saveScore('flappy', flappyGame.score);
  document.getElementById('flappyFinalScore').textContent = flappyGame.score;
  document.getElementById('flappyOverlay').classList.add('active');
  if (isNew) showToast('🏆 New High Score!', 'success');
}

document.addEventListener('keydown', function(e) {
  if (STATE.currentGame !== 'flappy') return;
  if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); flappyJump(); }
});

/* ═══════════════════════════════════════════════════════════════
   6. MEMORY GAME
   ═══════════════════════════════════════════════════════════════ */
var memoryState = {
  cards: [], flipped: [], matched: 0,
  moves: 0, timer: 0, interval: null, running: false
};

var MEMORY_EMOJIS = ['🍎','🍌','🍇','🍓','🍒','🍑','🥝','🍍'];

function memoryRestart() {
  memoryState.cards = [];
  memoryState.flipped = [];
  memoryState.matched = 0;
  memoryState.moves = 0;
  memoryState.timer = 0;
  memoryState.running = true;
  
  var deck = MEMORY_EMOJIS.concat(MEMORY_EMOJIS);
  deck.sort(function() { return Math.random() - 0.5; });
  memoryState.cards = deck;
  
  document.getElementById('memory-moves').textContent = '0';
  document.getElementById('memory-time').textContent = '0s';
  
  var grid = document.getElementById('memoryGrid');
  grid.innerHTML = '';
  deck.forEach(function(emoji, i) {
    var card = document.createElement('div');
    card.className = 'memory-card';
    card.dataset.idx = i;
    card.textContent = emoji;
    card.onclick = function() { memoryFlip(i); };
    grid.appendChild(card);
  });
  
  if (memoryState.interval) clearInterval(memoryState.interval);
  memoryState.interval = setInterval(function() {
    if (!memoryState.running) return;
    memoryState.timer++;
    document.getElementById('memory-time').textContent = memoryState.timer + 's';
  }, 1000);
}

function memoryFlip(idx) {
  if (!memoryState.running) return;
  if (memoryState.flipped.indexOf(idx) !== -1) return;
  if (memoryState.flipped.length >= 2) return;
  
  var card = document.querySelector('.memory-card[data-idx="' + idx + '"]');
  if (!card || card.classList.contains('matched')) return;
  
  card.classList.add('flipped');
  memoryState.flipped.push(idx);
  
  if (memoryState.flipped.length === 2) {
    memoryState.moves++;
    document.getElementById('memory-moves').textContent = memoryState.moves;
    
    var a = memoryState.flipped[0];
    var b = memoryState.flipped[1];
    
    if (memoryState.cards[a] === memoryState.cards[b]) {
      document.querySelector('.memory-card[data-idx="' + a + '"]').classList.add('matched');
      document.querySelector('.memory-card[data-idx="' + b + '"]').classList.add('matched');
      memoryState.matched++;
      memoryState.flipped = [];
      
      if (memoryState.matched === MEMORY_EMOJIS.length) {
        memoryState.running = false;
        clearInterval(memoryState.interval);
        saveScore('memory', Math.max(0, 1000 - memoryState.moves * 10));
        showToast('🎉 Completed in ' + memoryState.moves + ' moves!', 'success');
      }
    } else {
      setTimeout(function() {
        document.querySelector('.memory-card[data-idx="' + a + '"]').classList.remove('flipped');
        document.querySelector('.memory-card[data-idx="' + b + '"]').classList.remove('flipped');
        memoryState.flipped = [];
      }, 700);
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   7. PONG
   ═══════════════════════════════════════════════════════════════ */
var pongGame = {
  canvas: null, ctx: null,
  playerY: 200, cpuY: 200,
  ballX: 200, ballY: 250, ballVX: 4, ballVY: 4,
  paddleH: 80, paddleW: 12,
  playerScore: 0, cpuScore: 0,
  running: false, loop: null
};

function pongRestart() {
  var c = document.getElementById('pongCanvas');
  if (!c) return;
  pongGame.canvas = c;
  pongGame.ctx = c.getContext('2d');
  pongGame.playerY = c.height/2 - pongGame.paddleH/2;
  pongGame.cpuY = c.height/2 - pongGame.paddleH/2;
  pongGame.playerScore = 0;
  pongGame.cpuScore = 0;
  pongGame.running = true;
  document.getElementById('pong-player').textContent = '0';
  document.getElementById('pong-cpu').textContent = '0';
  document.getElementById('pongOverlay').classList.remove('active');
  pongResetBall(1);
  if (pongGame.loop) clearInterval(pongGame.loop);
  pongGame.loop = setInterval(pongTick, 20);
}

function pongResetBall(dir) {
  pongGame.ballX = pongGame.canvas.width / 2;
  pongGame.ballY = pongGame.canvas.height / 2;
  pongGame.ballVX = dir * 4;
  pongGame.ballVY = (Math.random() > 0.5 ? 1 : -1) * 4;
}

function pongTick() {
  if (!pongGame.running) return;
  var c = pongGame.canvas;
  
  // Ball
  pongGame.ballX += pongGame.ballVX;
  pongGame.ballY += pongGame.ballVY;
  
  if (pongGame.ballY < 8 || pongGame.ballY > c.height - 8) pongGame.ballVY *= -1;
  
  // Player paddle
  if (pongGame.ballX < 20 + pongGame.paddleW &&
      pongGame.ballY > pongGame.playerY &&
      pongGame.ballY < pongGame.playerY + pongGame.paddleH &&
      pongGame.ballVX < 0) {
    pongGame.ballVX *= -1.05;
    pongGame.ballX = 20 + pongGame.paddleW;
  }
  
  // CPU paddle
  if (pongGame.ballX > c.width - 20 - pongGame.paddleW &&
      pongGame.ballY > pongGame.cpuY &&
      pongGame.ballY < pongGame.cpuY + pongGame.paddleH &&
      pongGame.ballVX > 0) {
    pongGame.ballVX *= -1.05;
    pongGame.ballX = c.width - 20 - pongGame.paddleW;
  }
  
  // Score
  if (pongGame.ballX < 0) {
    pongGame.cpuScore++;
    document.getElementById('pong-cpu').textContent = pongGame.cpuScore;
    if (pongGame.cpuScore >= 5) return pongEnd('CPU WINS!');
    pongResetBall(1);
  }
  if (pongGame.ballX > c.width) {
    pongGame.playerScore++;
    document.getElementById('pong-player').textContent = pongGame.playerScore;
    if (pongGame.playerScore >= 5) return pongEnd('YOU WIN!');
    pongResetBall(-1);
  }
  
  // CPU AI
  var cpuTarget = pongGame.ballY - pongGame.paddleH/2;
  if (pongGame.cpuY < cpuTarget) pongGame.cpuY += 3;
  else if (pongGame.cpuY > cpuTarget) pongGame.cpuY -= 3;
  pongGame.cpuY = Math.max(0, Math.min(c.height - pongGame.paddleH, pongGame.cpuY));
  
  pongDraw();
}

function pongDraw() {
  var ctx = pongGame.ctx;
  var c = pongGame.canvas;
  
  ctx.fillStyle = '#0a1020';
  ctx.fillRect(0, 0, c.width, c.height);
  
  // Center line
  ctx.setLineDash([8, 8]);
  ctx.strokeStyle = 'rgba(255,255,255,.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(c.width/2, 0);
  ctx.lineTo(c.width/2, c.height);
  ctx.stroke();
  ctx.setLineDash([]);
  
  // Paddles
  ctx.fillStyle = '#10b981';
  ctx.shadowColor = '#10b981';
  ctx.shadowBlur = 15;
  ctx.fillRect(20, pongGame.playerY, pongGame.paddleW, pongGame.paddleH);
  ctx.fillStyle = '#ec4899';
  ctx.shadowColor = '#ec4899';
  ctx.fillRect(c.width - 20 - pongGame.paddleW, pongGame.cpuY, pongGame.paddleW, pongGame.paddleH);
  
  // Ball
  ctx.fillStyle = '#fbbf24';
  ctx.shadowColor = '#fbbf24';
  ctx.shadowBlur = 25;
  ctx.beginPath();
  ctx.arc(pongGame.ballX, pongGame.ballY, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function pongMove(dir) {
  if (!pongGame.running) return;
  var step = 40;
  if (dir === 'up') pongGame.playerY = Math.max(0, pongGame.playerY - step);
  if (dir === 'down') pongGame.playerY = Math.min(pongGame.canvas.height - pongGame.paddleH, pongGame.playerY + step);
}

function pongEnd(msg) {
  pongGame.running = false;
  clearInterval(pongGame.loop);
  document.getElementById('pongResult').textContent = msg;
  document.getElementById('pongOverlay').classList.add('active');
  saveScore('pong', pongGame.playerScore * 100);
}

document.addEventListener('keydown', function(e) {
  if (STATE.currentGame !== 'pong') return;
  if (e.key === 'ArrowUp' || e.key === 'w') pongMove('up');
  if (e.key === 'ArrowDown' || e.key === 's') pongMove('down');
});

/* ═══════════════════════════════════════════════════════════════
   8. TETRIS
   ═══════════════════════════════════════════════════════════════ */
var tetrisGame = {
  canvas: null, ctx: null, nextCanvas: null, nextCtx: null,
  board: [], cols: 10, rows: 20, cell: 30,
  current: null, next: null,
  score: 0, lines: 0, level: 1,
  running: false, paused: false,
  loop: null, dropTimer: 0, dropSpeed: 30
};

var TETRIS_SHAPES = [
  [[1,1,1,1]], // I
  [[1,1],[1,1]], // O
  [[0,1,0],[1,1,1]], // T
  [[1,0,0],[1,1,1]], // J
  [[0,0,1],[1,1,1]], // L
  [[0,1,1],[1,1,0]], // S
  [[1,1,0],[0,1,1]]  // Z
];

var TETRIS_COLORS = ['#06b6d4','#fbbf24','#a855f7','#3b82f6','#f97316','#10b981','#ec4899'];

function tetrisRestart() {
  var c = document.getElementById('tetrisCanvas');
  var nc = document.getElementById('tetrisNext');
  if (!c) return;
  tetrisGame.canvas = c;
  tetrisGame.ctx = c.getContext('2d');
  tetrisGame.nextCanvas = nc;
  tetrisGame.nextCtx = nc.getContext('2d');
  tetrisGame.board = [];
  for (var i = 0; i < tetrisGame.rows; i++) tetrisGame.board.push(new Array(tetrisGame.cols).fill(0));
  tetrisGame.score = 0;
  tetrisGame.lines = 0;
  tetrisGame.level = 1;
  tetrisGame.running = true;
  tetrisGame.paused = false;
  tetrisGame.dropTimer = 0;
  tetrisGame.dropSpeed = 30;
  
  document.getElementById('tetris-score').textContent = '0';
  document.getElementById('tetris-lines').textContent = '0';
  document.getElementById('tetrisOverlay').classList.remove('active');
  
  tetrisSpawn();
  if (tetrisGame.loop) clearInterval(tetrisGame.loop);
  tetrisGame.loop = setInterval(tetrisTick, 30);
}

function tetrisSpawn() {
  var shapeIdx = Math.floor(Math.random() * TETRIS_SHAPES.length);
  var shape = TETRIS_SHAPES[shapeIdx].map(function(r){ return r.slice(); });
  tetrisGame.current = {
    shape: shape,
    color: TETRIS_COLORS[shapeIdx],
    x: Math.floor(tetrisGame.cols / 2) - Math.floor(shape[0].length / 2),
    y: 0
  };
  if (tetrisGame.next) {
    tetrisGame.current = tetrisGame.next;
    tetrisGame.current.x = Math.floor(tetrisGame.cols / 2) - Math.floor(tetrisGame.current.shape[0].length / 2);
    tetrisGame.current.y = 0;
  }
  var nShape = TETRIS_SHAPES[Math.floor(Math.random() * TETRIS_SHAPES.length)];
  var nIdx = Math.floor(Math.random() * TETRIS_SHAPES.length);
  tetrisGame.next = {
    shape: TETRIS_SHAPES[nIdx].map(function(r){ return r.slice(); }),
    color: TETRIS_COLORS[nIdx]
  };
  tetrisDrawNext();
  
  if (tetrisCollision()) tetrisEnd();
}

function tetrisTick() {
  if (!tetrisGame.running || tetrisGame.paused) return;
  tetrisGame.dropTimer++;
  if (tetrisGame.dropTimer >= tetrisGame.dropSpeed) {
    tetrisGame.dropTimer = 0;
    tetrisMove('down');
  }
  tetrisDraw();
}

function tetrisMove(dir) {
  if (!tetrisGame.current) return;
  if (dir === 'left') { tetrisGame.current.x--; if (tetrisCollision()) tetrisGame.current.x++; }
  else if (dir === 'right') { tetrisGame.current.x++; if (tetrisCollision()) tetrisGame.current.x--; }
  else if (dir === 'down') {
    tetrisGame.current.y++;
    if (tetrisCollision()) {
      tetrisGame.current.y--;
      tetrisLock();
    }
  }
  tetrisDraw();
}

function tetrisRotate() {
  if (!tetrisGame.current) return;
  var shape = tetrisGame.current.shape;
  var rotated = shape[0].map(function(_, i) {
    return shape.map(function(row) { return row[i]; }).reverse();
  });
  var old = tetrisGame.current.shape;
  tetrisGame.current.shape = rotated;
  if (tetrisCollision()) tetrisGame.current.shape = old;
  tetrisDraw();
}

function tetrisCollision() {
  var c = tetrisGame.current;
  if (!c) return false;
  for (var y = 0; y < c.shape.length; y++) {
    for (var x = 0; x < c.shape[y].length; x++) {
      if (c.shape[y][x]) {
        var bx = c.x + x;
        var by = c.y + y;
        if (bx < 0 || bx >= tetrisGame.cols || by >= tetrisGame.rows) return true;
        if (by >= 0 && tetrisGame.board[by][bx]) return true;
      }
    }
  }
  return false;
}

function tetrisLock() {
  var c = tetrisGame.current;
  for (var y = 0; y < c.shape.length; y++) {
    for (var x = 0; x < c.shape[y].length; x++) {
      if (c.shape[y][x]) {
        var by = c.y + y;
        var bx = c.x + x;
        if (by >= 0) tetrisGame.board[by][bx] = c.color;
      }
    }
  }
  
  // Clear lines
  var cleared = 0;
  for (var i = tetrisGame.rows - 1; i >= 0; i--) {
    if (tetrisGame.board[i].every(function(v) { return v; })) {
      tetrisGame.board.splice(i, 1);
      tetrisGame.board.unshift(new Array(tetrisGame.cols).fill(0));
      cleared++;
      i++;
    }
  }
  
  if (cleared) {
    tetrisGame.lines += cleared;
    tetrisGame.score += [0, 100, 300, 500, 800][cleared] * tetrisGame.level;
    document.getElementById('tetris-score').textContent = tetrisGame.score;
    document.getElementById('tetris-lines').textContent = tetrisGame.lines;
    if (tetrisGame.lines % 10 === 0) {
      tetrisGame.level++;
      tetrisGame.dropSpeed = Math.max(5, 30 - tetrisGame.level * 2);
    }
  }
  
  tetrisSpawn();
}

function tetrisDraw() {
  var ctx = tetrisGame.ctx;
  var c = tetrisGame.canvas;
  var cell = tetrisGame.cell;
  
  ctx.fillStyle = '#0a1020';
  ctx.fillRect(0, 0, c.width, c.height);
  
  // Board
  for (var y = 0; y < tetrisGame.rows; y++) {
    for (var x = 0; x < tetrisGame.cols; x++) {
      if (tetrisGame.board[y][x]) {
        ctx.fillStyle = tetrisGame.board[y][x];
        ctx.fillRect(x * cell, y * cell, cell - 1, cell - 1);
        ctx.strokeStyle = 'rgba(255,255,255,.3)';
        ctx.strokeRect(x * cell, y * cell, cell - 1, cell - 1);
      }
    }
  }
  
  // Current
  if (tetrisGame.current) {
    var cur = tetrisGame.current;
    ctx.fillStyle = cur.color;
    ctx.shadowColor = cur.color;
    ctx.shadowBlur = 10;
    for (var cy = 0; cy < cur.shape.length; cy++) {
      for (var cx = 0; cx < cur.shape[cy].length; cx++) {
        if (cur.shape[cy][cx]) {
          ctx.fillRect((cur.x + cx) * cell, (cur.y + cy) * cell, cell - 1, cell - 1);
        }
      }
    }
    ctx.shadowBlur = 0;
  }
}

function tetrisDrawNext() {
  var ctx = tetrisGame.nextCtx;
  if (!ctx || !tetrisGame.next) return;
  ctx.fillStyle = '#0a1020';
  ctx.fillRect(0, 0, tetrisGame.nextCanvas.width, tetrisGame.nextCanvas.height);
  var shape = tetrisGame.next.shape;
  var cell = 20;
  var ox = (tetrisGame.nextCanvas.width - shape[0].length * cell) / 2;
  var oy = (tetrisGame.nextCanvas.height - shape.length * cell) / 2;
  ctx.fillStyle = tetrisGame.next.color;
  for (var y = 0; y < shape.length; y++) {
    for (var x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        ctx.fillRect(ox + x * cell, oy + y * cell, cell - 2, cell - 2);
      }
    }
  }
}

function tetrisEnd() {
  tetrisGame.running = false;
  clearInterval(tetrisGame.loop);
  var isNew = saveScore('tetris', tetrisGame.score);
  document.getElementById('tetrisFinalScore').textContent = tetrisGame.score;
  document.getElementById('tetrisOverlay').classList.add('active');
  if (isNew) showToast('🏆 New High Score!', 'success');
}

document.addEventListener('keydown', function(e) {
  if (STATE.currentGame !== 'tetris') return;
  if (e.key === 'ArrowLeft' || e.key === 'a') tetrisMove('left');
  if (e.key === 'ArrowRight' || e.key === 'd') tetrisMove('right');
  if (e.key === 'ArrowDown' || e.key === 's') tetrisMove('down');
  if (e.key === 'ArrowUp' || e.key === 'w') tetrisRotate();
  if (e.key === ' ') { e.preventDefault(); tetrisGame.paused = !tetrisGame.paused; }
});

/* ═══════════════════════════════════════════════════════════════
   9. BREAKOUT
   ═══════════════════════════════════════════════════════════════ */
var breakoutGame = {
  canvas: null, ctx: null,
  paddleX: 160, paddleW: 80, paddleH: 12,
  ballX: 200, ballY: 300, ballVX: 4, ballVY: -4,
  ballR: 8,
  bricks: [], score: 0, lives: 3,
  running: false, loop: null
};

function breakoutRestart() {
  var c = document.getElementById('breakoutCanvas');
  if (!c) return;
  breakoutGame.canvas = c;
  breakoutGame.ctx = c.getContext('2d');
  breakoutGame.paddleX = c.width/2 - breakoutGame.paddleW/2;
  breakoutGame.ballX = c.width/2;
  breakoutGame.ballY = c.height - 60;
  breakoutGame.ballVX = 4;
  breakoutGame.ballVY = -4;
  breakoutGame.score = 0;
  breakoutGame.lives = 3;
  breakoutGame.running = true;
  
  document.getElementById('breakout-score').textContent = '0';
  document.getElementById('breakout-lives').textContent = '3';
  document.getElementById('breakoutOverlay').classList.remove('active');
  
  // Bricks
  breakoutGame.bricks = [];
  var rows = 5, cols = 8;
  var brickW = (c.width - 40) / cols;
  var brickH = 24;
  for (var r = 0; r < rows; r++) {
    for (var col = 0; col < cols; col++) {
      breakoutGame.bricks.push({
        x: 20 + col * brickW,
        y: 60 + r * (brickH + 6),
        w: brickW - 4,
        h: brickH,
        color: ['#ef4444','#f97316','#fbbf24','#10b981','#3b82f6'][r],
        alive: true
      });
    }
  }
  
  if (breakoutGame.loop) clearInterval(breakoutGame.loop);
  breakoutGame.loop = setInterval(breakoutTick, 20);
}

function breakoutTick() {
  if (!breakoutGame.running) return;
  var c = breakoutGame.canvas;
  
  breakoutGame.ballX += breakoutGame.ballVX;
  breakoutGame.ballY += breakoutGame.ballVY;
  
  if (breakoutGame.ballX < breakoutGame.ballR || breakoutGame.ballX > c.width - breakoutGame.ballR) breakoutGame.ballVX *= -1;
  if (breakoutGame.ballY < breakoutGame.ballR) breakoutGame.ballVY *= -1;
  
  // Paddle
  if (breakoutGame.ballY > c.height - 40 - breakoutGame.ballR &&
      breakoutGame.ballX > breakoutGame.paddleX &&
      breakoutGame.ballX < breakoutGame.paddleX + breakoutGame.paddleW &&
      breakoutGame.ballVY > 0) {
    breakoutGame.ballVY *= -1;
    var hit = (breakoutGame.ballX - (breakoutGame.paddleX + breakoutGame.paddleW/2)) / (breakoutGame.paddleW/2);
    breakoutGame.ballVX = hit * 6;
  }
  
  // Bricks
  for (var i = 0; i < breakoutGame.bricks.length; i++) {
    var b = breakoutGame.bricks[i];
    if (!b.alive) continue;
    if (breakoutGame.ballX > b.x && breakoutGame.ballX < b.x + b.w &&
        breakoutGame.ballY > b.y && breakoutGame.ballY < b.y + b.h) {
      b.alive = false;
      breakoutGame.ballVY *= -1;
      breakoutGame.score += 10;
      document.getElementById('breakout-score').textContent = breakoutGame.score;
      break;
    }
  }
  
  // Dead ball
  if (breakoutGame.ballY > c.height) {
    breakoutGame.lives--;
    document.getElementById('breakout-lives').textContent = breakoutGame.lives;
    if (breakoutGame.lives <= 0) return breakoutEnd('GAME OVER');
    breakoutGame.ballX = c.width/2;
    breakoutGame.ballY = c.height - 60;
    breakoutGame.ballVX = 4;
    breakoutGame.ballVY = -4;
  }
  
  // Win
  if (!breakoutGame.bricks.some(function(b) { return b.alive; })) {
    return breakoutEnd('YOU WIN!');
  }
  
  breakoutDraw();
}

function breakoutDraw() {
  var ctx = breakoutGame.ctx;
  var c = breakoutGame.canvas;
  ctx.fillStyle = '#0a1020';
  ctx.fillRect(0, 0, c.width, c.height);
  
  // Bricks
  breakoutGame.bricks.forEach(function(b) {
    if (b.alive) {
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 8;
      ctx.fillRect(b.x, b.y, b.w, b.h);
    }
  });
  ctx.shadowBlur = 0;
  
  // Paddle
  ctx.fillStyle = '#10b981';
  ctx.shadowColor = '#10b981';
  ctx.shadowBlur = 15;
  ctx.fillRect(breakoutGame.paddleX, c.height - 40, breakoutGame.paddleW, breakoutGame.paddleH);
  
  // Ball
  ctx.fillStyle = '#fbbf24';
  ctx.shadowColor = '#fbbf24';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(breakoutGame.ballX, breakoutGame.ballY, breakoutGame.ballR, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function breakoutMove(dir) {
  if (!breakoutGame.running) return;
  var step = 40;
  if (dir === 'left') breakoutGame.paddleX = Math.max(0, breakoutGame.paddleX - step);
  if (dir === 'right') breakoutGame.paddleX = Math.min(breakoutGame.canvas.width - breakoutGame.paddleW, breakoutGame.paddleX + step);
}

function breakoutEnd(msg) {
  breakoutGame.running = false;
  clearInterval(breakoutGame.loop);
  var isNew = saveScore('breakout', breakoutGame.score);
  document.getElementById('breakoutResult').textContent = msg;
  document.getElementById('breakoutFinalScore').textContent = breakoutGame.score;
  document.getElementById('breakoutOverlay').classList.add('active');
  if (isNew) showToast('🏆 New High Score!', 'success');
}

document.addEventListener('keydown', function(e) {
  if (STATE.currentGame !== 'breakout') return;
  if (e.key === 'ArrowLeft' || e.key === 'a') breakoutMove('left');
  if (e.key === 'ArrowRight' || e.key === 'd') breakoutMove('right');
});

/* ═══════════════════════════════════════════════════════════════
   10. CONNECT FOUR
   ═══════════════════════════════════════════════════════════════ */
var c4State = {
  board: [], rows: 6, cols: 7,
  playerTurn: true, gameOver: false,
  wins: 0, losses: 0
};

function c4Restart() {
  c4State.board = [];
  for (var r = 0; r < c4State.rows; r++) {
    c4State.board.push(new Array(c4State.cols).fill(0));
  }
  c4State.playerTurn = true;
  c4State.gameOver = false;
  
  document.getElementById('c4Status').textContent = 'Your Turn (Red)';
  c4Render();
}

function c4Render() {
  var el = document.getElementById('c4Board');
  if (!el) return;
  el.innerHTML = '';
  for (var r = 0; r < c4State.rows; r++) {
    for (var c = 0; c < c4State.cols; c++) {
      var cell = document.createElement('div');
      cell.className = 'c4-cell';
      var v = c4State.board[r][c];
      if (v === 1) cell.classList.add('red');
      if (v === 2) cell.classList.add('yellow');
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.onclick = (function(col) { return function() { c4Drop(col); }; })(c);
      el.appendChild(cell);
    }
  }
}

function c4Drop(col) {
  if (c4State.gameOver || !c4State.playerTurn) return;
  var r = -1;
  for (var i = c4State.rows - 1; i >= 0; i--) {
    if (c4State.board[i][col] === 0) { r = i; break; }
  }
  if (r === -1) return;
  
  c4State.board[r][col] = 1;
  c4Render();
  
  if (c4CheckWin(1)) {
    c4State.gameOver = true;
    c4State.wins++;
    document.getElementById('c4-wins').textContent = c4State.wins;
    document.getElementById('c4Status').textContent = '🎉 You Win!';
    saveScore('connect4', c4State.wins * 100);
    return;
  }
  
  if (c4IsFull()) {
    c4State.gameOver = true;
    document.getElementById('c4Status').textContent = 'Draw!';
    return;
  }
  
  c4State.playerTurn = false;
  document.getElementById('c4Status').textContent = 'AI Thinking...';
  setTimeout(c4AIMove, 500);
}

function c4AIMove() {
  if (c4State.gameOver) return;
  
  var bestCol = -1;
  // Try to win
  for (var c = 0; c < c4State.cols; c++) {
    var r = c4GetRow(c);
    if (r !== -1) {
      c4State.board[r][c] = 2;
      if (c4CheckWin(2)) { bestCol = c; c4State.board[r][c] = 0; break; }
      c4State.board[r][c] = 0;
    }
  }
  // Block player
  if (bestCol === -1) {
    for (var c2 = 0; c2 < c4State.cols; c2++) {
      var r2 = c4GetRow(c2);
      if (r2 !== -1) {
        c4State.board[r2][c2] = 1;
        if (c4CheckWin(1)) { bestCol = c2; c4State.board[r2][c2] = 0; break; }
        c4State.board[r2][c2] = 0;
      }
    }
  }
  // Random
  if (bestCol === -1) {
    var available = [];
    for (var c3 = 0; c3 < c4State.cols; c3++) {
      if (c4GetRow(c3) !== -1) available.push(c3);
    }
    bestCol = available[Math.floor(Math.random() * available.length)];
  }
  
  if (bestCol === -1) return;
  
  var r3 = c4GetRow(bestCol);
  c4State.board[r3][bestCol] = 2;
  c4Render();
  
  if (c4CheckWin(2)) {
    c4State.gameOver = true;
    c4State.losses++;
    document.getElementById('c4-losses').textContent = c4State.losses;
    document.getElementById('c4Status').textContent = '😞 AI Wins!';
    return;
  }
  
  if (c4IsFull()) {
    c4State.gameOver = true;
    document.getElementById('c4Status').textContent = 'Draw!';
    return;
  }
  
  c4State.playerTurn = true;
  document.getElementById('c4Status').textContent = 'Your Turn (Red)';
}

function c4GetRow(col) {
  for (var i = c4State.rows - 1; i >= 0; i--) {
    if (c4State.board[i][col] === 0) return i;
  }
  return -1;
}

function c4IsFull() {
  for (var c = 0; c < c4State.cols; c++) {
    if (c4State.board[0][c] === 0) return false;
  }
  return true;
}

function c4CheckWin(p) {
  var b = c4State.board;
  // Horizontal
  for (var r = 0; r < c4State.rows; r++) {
    for (var c = 0; c <= c4State.cols - 4; c++) {
      if (b[r][c] === p && b[r][c+1] === p && b[r][c+2] === p && b[r][c+3] === p) return true;
    }
  }
  // Vertical
  for (var r2 = 0; r2 <= c4State.rows - 4; r2++) {
    for (var c2 = 0; c2 < c4State.cols; c2++) {
      if (b[r2][c2] === p && b[r2+1][c2] === p && b[r2+2][c2] === p && b[r2+3][c2] === p) return true;
    }
  }
  // Diagonal \
  for (var r3 = 0; r3 <= c4State.rows - 4; r3++) {
    for (var c3 = 0; c3 <= c4State.cols - 4; c3++) {
      if (b[r3][c3] === p && b[r3+1][c3+1] === p && b[r3+2][c3+2] === p && b[r3+3][c3+3] === p) return true;
    }
  }
  // Diagonal /
  for (var r4 = 3; r4 < c4State.rows; r4++) {
    for (var c4 = 0; c4 <= c4State.cols - 4; c4++) {
      if (b[r4][c4] === p && b[r4-1][c4+1] === p && b[r4-2][c4+2] === p && b[r4-3][c4+3] === p) return true;
    }
  }
  return false;
}

/* ═══════════════════════════════════════════════════════════════
   INIT canvas roundRect polyfill
   ═══════════════════════════════════════════════════════════════ */
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y, x + w, y, r);
    this.closePath();
    return this;
  };
}

/* ═══════════════════════════════════════════════════════════════
   END
   ═══════════════════════════════════════════════════════════════ */
