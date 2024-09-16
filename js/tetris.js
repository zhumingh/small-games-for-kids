const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20, 20);

// 创建矩阵
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

// 创建方块
function createPiece(type) {
    switch (type) {
        case 'T': return [[0, 0, 0],[1, 1, 1],[0, 1, 0]];
        case 'O': return [[2, 2],[2, 2]];
        case 'L': return [[0, 0, 3],[3, 3, 3],[0, 0, 0]];
        case 'J': return [[4, 0, 0],[4, 4, 4],[0, 0, 0]];
        case 'I': return [[0, 5, 0, 0],[0, 5, 0, 0],[0, 5, 0, 0],[0, 5, 0, 0]];
        case 'S': return [[0, 6, 6],[6, 6, 0],[0, 0, 0]];
        case 'Z': return [[7, 7, 0],[0, 7, 7],[0, 0, 0]];
    }
}

// 碰撞检测
function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

// 合并到场地
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// 清除满行
function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length -1; y >= 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        arena.splice(y, 1);
        arena.unshift(new Array(arena[0].length).fill(0));
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

// 旋转矩阵
function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [ matrix[x][y], matrix[y][x] ] = [ matrix[y][x], matrix[x][y] ];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

// 玩家控制
function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerRotate(dir) {
    rotate(player.matrix, dir);
    const pos = player.pos.x;
    let offset = 1;
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

// 重置玩家
function playerReset() {
    const pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);

    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        dropInterval = 1000; // 重置下降速度
        updateScore();
    }
}

// 绘制函数
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                                 y + offset.y,
                                 1, 1);
            }
        });
    });
}

function draw() {
    context.fillStyle = '#111';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

// 游戏更新
let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

// 更新分数
function updateScore() {
    document.getElementById('score').innerText = `分数：${player.score}`;
    
    // 根据分数调整下降速度
    const level = Math.floor(player.score / 10) + 1;
    dropInterval = Math.max(200, 1000 - (level - 1) * 100); // 最快200毫秒一次
}

// 颜色数组
const colors = [
    null,
    '#ff0d72',
    '#0dc2ff',
    '#0dff72',
    '#f538ff',
    '#ff8e0d',
    '#ffe138',
    '#3877ff',
];

// 场地
const arena = createMatrix(12, 20);

// 玩家对象
const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};

// 键盘事件监听
const keys = {};

document.addEventListener('keydown', event => {
    if (keys[event.key]) return;
    keys[event.key] = true;

    if (event.key === 'ArrowLeft') {
        playerMove(-1);
    } else if (event.key === 'ArrowRight') {
        playerMove(1);
    } else if (event.key === 'ArrowDown') {
        playerHardDrop();
    } else if (event.key === 'ArrowUp') {
        playerRotate(1);
    } else if (event.key === 'z' || event.key === 'Z') {
        playerRotate(-1);
    } else if (event.key === 'x' || event.key === 'X') {
        playerRotate(1);
    } else if (event.key === 'Escape') {
        togglePause(); // 需要实现这个函数
    }
});

document.addEventListener('keyup', event => {
    keys[event.key] = false;
});

// 硬降功能
async function playerHardDrop() {
    while (true) {
        if (collide(arena, { ...player, pos: { ...player.pos, y: player.pos.y + 1 } })) {
            break;
        }
        player.pos.y++;
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    // 不需要回退，因为最后一次移动没有执行
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
    dropCounter = 0;
}

// 软降功能
function playerSoftDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

// 初始化游戏
playerReset();
updateScore();
update();
