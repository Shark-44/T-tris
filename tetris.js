// Les Tétriminos avec leur name et rotation

const tetriminos =  [
    {
        name: "I",
        rotations: [
            [ [1,1,1,1] ],
            [ [1], [1], [1], [1] ]
        ],
        color: "cyan"
    },

    {
        name: "O",
        rotations: [
            [ [1,1],[1,1] ],
            [ [1,1],[1,1] ]
        ],
        color: "yellow"
    },

    {
        name: "T",
        rotations: [
            [ [1,1,1],[0,1,0] ],
            [ [0,1],[1,1], [0,1] ],
            [ [0,1,0],[1,1,1]],
            [ [1,0], [1,1],[1,0] ]
        ],
        color: "purple"
    },

    {
        name: "L",
        rotations: [
            [ [1,1,1],[1,0,0] ],
            [ [1,1],[0,1], [0,1] ],
            [ [0,0,1],[1,1,1]],
            [ [1,0], [1,0],[1,1] ]
        ],
        color: "orange"
    },

    {
        name: "J",
        rotations: [
            [ [1,1,1],[0,0,1] ],
            [ [0,1],[0,1], [1,1] ],
            [ [1,0,0],[1,1,1]],
            [ [1,1], [1,0],[1,0] ]
        ],
        color: "blue"
    },

    {
        name: "Z",
        rotations: [
            [ [1,1,0],[0,1,1] ],
            [ [0,1],[1,1], [1,0] ]
        ],
        color: "red"
    },

    {
        name: "S",
        rotations: [
            [ [0,1,1],[1,1,0] ],
            [ [1,0],[1,1], [0,1] ]
        ],
        color: "green"
    },
];

// Configuration du jeu
class TetrisConfig {
    constructor() {
        this.canvas = document.getElementById('tetrisCanvas');  // cible la partie html ou sera executé le jeu
        this.ctx = this.canvas.getContext('2d');  // permet de dessiner les blocs

        this.gridWidth = 10; // nbre de colonnes
        this.gridHeight = 20; // nbre de lignes
        this.blockSize = 30; // taille en px des blocs
        this.fps = 60; // frequence de rafraichissement du jeux
        this.dropInterval = 1000; // temps en milliseconds entre chaque chute (1 seconde)
        this.lastDropTime = 0;    // pour suivre le dernier moment où la pièce est tombée
    }
}

// Gestion des blocs
class Piece {
    constructor(tetrimino) {
        this.x = 3; // Position initiale horizontale
        this.y = 0; // Position initiale verticale
        this.rotations = tetrimino.rotations; // Toutes les rotations
        this.color = tetrimino.color; // Couleur de la pièce
        this.currentRotationIndex = 0; // Rotation actuelle
    }

    // Obtenir la forme actuelle
    get shape() {
        return this.rotations[this.currentRotationIndex];
    }

    // Passer à la rotation suivante
    rotate() {
        this.currentRotationIndex = (this.currentRotationIndex + 1) % this.rotations.length;
    }
}

// Gestion du jeu
class TetrisGame {
    constructor(config) {
        this.config = config;
        this.grid = [];
        this.currentPiece = null;
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.gameOverDisplayed = false;

        // Éléments du DOM pour le score et le niveau
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');

        // Vitesse initiale de chute
        this.baseDropInterval = 1000; // 1 seconde
        this.updateDropInterval();

        //prochaine piece
        this.nextPiece = null; 
        this.nextPieceCanvas = document.getElementById('nextPieceCanvas');
        this.nextPieceCtx = this.nextPieceCanvas.getContext('2d');
    }

    /* ---------------------------- Initialisation ---------------------------- */

    init() {
        // Initialisation de la grille
        this.createEmptyGrid();
        // Démarre la boucle de jeu
        this.gameLoop();
        // Affichage initial du score et du niveau
        this.updateDisplay();
    }

    createEmptyGrid() {
        for (let row = 0; row < this.config.gridHeight; row++) {
            this.grid.push(new Array(this.config.gridWidth).fill(0));
        }
    }

    resetGame() {
        this.grid = [];
        this.createEmptyGrid();
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.config.dropInterval = this.baseDropInterval;
        this.updateDisplay();
        this.gameLoop();
    }

    /* ------------------------------- Rendu ------------------------------- */

    draw() {
        this.config.ctx.clearRect(0, 0, this.config.canvas.width, this.config.canvas.height);
        this.drawGrid();
        this.drawCurrentPiece();

        if (this.gameOver) {
            this.drawGameOver();
        }
    }

    drawGrid() {
        for (let row = 0; row < this.config.gridHeight; row++) {
            for (let col = 0; col < this.config.gridWidth; col++) {
                if (this.grid[row][col] !== 0) {
                    this.config.ctx.fillStyle = this.grid[row][col];
                    this.config.ctx.fillRect(
                        col * this.config.blockSize,
                        row * this.config.blockSize,
                        this.config.blockSize,
                        this.config.blockSize
                    );
                }
            }
        }
    }

    drawCurrentPiece() {
        if (this.currentPiece) {
            const shape = this.currentPiece.shape;
            for (let row = 0; row < shape.length; row++) {
                for (let col = 0; col < shape[row].length; col++) {
                    if (shape[row][col] === 1) {
                        this.config.ctx.fillStyle = this.currentPiece.color;
                        this.config.ctx.fillRect(
                            (this.currentPiece.x + col) * this.config.blockSize,
                            (this.currentPiece.y + row) * this.config.blockSize,
                            this.config.blockSize,
                            this.config.blockSize
                        );
                    }
                }
            }
        }
    }

    drawGameOver() {
        this.config.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.config.ctx.fillRect(0, 0, this.config.canvas.width, this.config.canvas.height);

        this.config.ctx.fillStyle = 'white';
        this.config.ctx.font = 'bold 48px Arial';
        this.config.ctx.textAlign = 'center';
        this.config.ctx.fillText('GAME OVER', this.config.canvas.width / 2, this.config.canvas.height / 2 - 50);

        this.config.ctx.font = '24px Arial';
        this.config.ctx.fillText(`Score Final: ${this.score}`, this.config.canvas.width / 2, this.config.canvas.height / 2 + 10);

        this.config.ctx.font = '20px Arial';
        this.config.ctx.fillText('Appuyez sur ESPACE', this.config.canvas.width / 2, this.config.canvas.height / 2 + 50);
        this.config.ctx.fillText('pour recommencer', this.config.canvas.width / 2, this.config.canvas.height / 2 + 70);
        
    }

    drawNextPiece() {
        if (!this.nextPiece) return;

        const ctx = this.nextPieceCtx;
        const blockSize = 30; 
        const shape = this.nextPiece.shape;
    
        
        // Effacer le canvas précédent
        ctx.clearRect(0, 0, this.nextPieceCanvas.width, this.nextPieceCanvas.height);
        
        // Calculer les dimensions de la pièce
        const pieceWidth = shape[0].length * blockSize;
        const pieceHeight = shape.length * blockSize;
        
        // Calculer la position centrale
        const startX = blockSize;
        const startY = blockSize;
        
        // Dessiner la pièce
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] === 1) {
                    // Remplir le bloc
                    ctx.fillStyle = this.nextPiece.color;
                    ctx.fillRect(
                        startX + col * blockSize,
                        startY + row * blockSize,
                        blockSize,
                        blockSize
                    );
                    
                    // Ajouter une bordure noire
                    ctx.strokeStyle = 'black';
                    ctx.strokeRect(
                        startX + col * blockSize,
                        startY + row * blockSize,
                        blockSize,
                        blockSize
                    );
                }
            }
        }
    }
    

    /* ---------------------------- Logique du jeu ---------------------------- */
    // methode qui s'assure que les autres methodes de logique soient effetuées
    update() {
        const currentTime = Date.now();

        if (this.currentPiece) {
            if (currentTime - this.config.lastDropTime > this.config.dropInterval) {
                if (this.checkCollision(this.currentPiece, 0, 1)) {
                    this.addPieceToGrid();
                    this.spawnPiece();
                } else {
                    this.currentPiece.y++;
                }
                this.config.lastDropTime = currentTime;
            }
        } else {
            this.spawnPiece();
        }
    }
   // cadence le jeu
    gameLoop() {
        if (!this.gameOver) {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        }
    }
    // pour calculer fin de chute
    checkCollision(piece, offsetX = 0, offsetY = 0) {
        const shape = piece.shape;
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] === 1) {
                    const newX = piece.x + col + offsetX;
                    const newY = piece.y + row + offsetY;

                    if (
                        newX < 0 ||
                        newX >= this.config.gridWidth ||
                        newY >= this.config.gridHeight ||
                        (newY >= 0 && this.grid[newY][newX] !== 0)
                    ) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    //imbication des pieces tombées
    addPieceToGrid() {
        const shape = this.currentPiece.shape;
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] === 1) {
                    const gridY = this.currentPiece.y + row;
                    if (gridY < 0) {
                        this.gameOver = true;
                        return;
                    }
                    this.grid[gridY][this.currentPiece.x + col] = this.currentPiece.color;
                }
            }
        }
        this.clearLines();
    }
    // supprime une ligne complete
    clearLines() {
        let linesCleared = 0;

        for (let row = this.config.gridHeight - 1; row >= 0; row--) {
            const isLineComplete = this.grid[row].every(cell => cell !== 0);

            if (isLineComplete) {
                this.grid.splice(row, 1);
                this.grid.unshift(new Array(this.config.gridWidth).fill(0));
                linesCleared++;
                row++;
            }
        }

        if (linesCleared > 0) {
            this.updateScore(linesCleared);
        }

        return linesCleared;
    }
    // random d'une piece
    spawnPiece() {
        if (this.nextPiece === null) {
            // Première pièce du jeu
            const randomIndex = Math.floor(Math.random() * tetriminos.length);
            const randomTetrimino = tetriminos[randomIndex];
            this.currentPiece = new Piece(randomTetrimino);
        } else {
            // Utiliser la pièce suivante comme pièce courante
            this.currentPiece = this.nextPiece;
        }

        // Générer la nouvelle pièce suivante
        const randomIndex = Math.floor(Math.random() * tetriminos.length);
        const randomTetrimino = tetriminos[randomIndex];
        this.nextPiece = new Piece(randomTetrimino);

        // Afficher la prochaine pièce
        this.drawNextPiece();

        if (this.checkCollision(this.currentPiece)) {
            this.gameOver = true;
        }
    }

    /* ---------------------------- Gestion du score ---------------------------- */

    updateDropInterval() {
        this.config.dropInterval = this.baseDropInterval * Math.pow(0.9, this.level - 1);
    }

    updateScore(linesCleared) {
        const points = { 1: 100, 2: 300, 3: 500, 4: 800 };

        if (linesCleared > 0) {
            this.score += points[linesCleared] * this.level;

            const newLevel = Math.floor(this.score / 1000) + 1;
            if (newLevel !== this.level) {
                this.level = newLevel;
                this.updateDropInterval();
            }

            this.updateDisplay();
        }
    }

    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.levelElement.textContent = this.level;
    }

    /* ---------------------------- Gestion des entrées ---------------------------- */

 handleInput(event) {
        if (this.gameOver) {
            if (event.code === 'Space') {
                this.resetGame();
            }
            return;
        }

        if (this.currentPiece) {
            switch(event.key) {
                case 'ArrowLeft':
                    if (!this.checkCollision(this.currentPiece, -1, 0)) {
                        this.currentPiece.x--;
                    }
                    break;
                case 'ArrowRight':
                    if (!this.checkCollision(this.currentPiece, 1, 0)) {
                        this.currentPiece.x++;
                    }
                    break;
                case 'ArrowUp':
                    const currentIndex = this.currentRotationIndex;
                    this.currentPiece.rotate();
                    if (this.checkCollision(this.currentPiece, 0, 0)) {
                        this.currentPiece.currentRotationIndex = currentIndex;
                    }
                    break;
                case 'ArrowDown':
                    if (!this.checkCollision(this.currentPiece, 0, 1)) {
                        this.currentPiece.y++;
                    }
                    break;
            }
        }
    }
}




// Initialisation du jeu
window.onload = () => {
    const config = new TetrisConfig();
    const game = new TetrisGame(config);
    document.addEventListener('keydown', (event) => game.handleInput(event));
    game.init();
};

