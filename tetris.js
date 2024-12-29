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
        this.gameOver = false;
    }

// methode de collision 
    checkCollision(piece, offsetX = 0, offsetY = 0) {
        const shape = piece.shape;
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] === 1) {
                    const newX = piece.x + col + offsetX;
                    const newY = piece.y + row + offsetY;

                    // Vérifier si la pièce est hors de la grille ou en collision
                    if (
                        newX < 0 || 
                        newX >= this.config.gridWidth || 
                        newY >= this.config.gridHeight || 
                        (newY >= 0 && this.grid[newY][newX] !== 0)
                    ) {
                        return true; // Collision détectée
                    }
                }
            }
        }
        return false; // Pas de collision
    }
// init du jeu
    init() {
        // Initialisation de la grille
        this.createEmptyGrid();
        // Démarre la boucle de jeu
        this.gameLoop();
    }

    createEmptyGrid() {
        for (let row = 0; row < this.config.gridHeight; row++) {
            this.grid.push(new Array(this.config.gridWidth).fill(0)); // Une ligne de cases vides
        }
    }

    gameLoop() {
        if (!this.gameOver) {
            this.update();
            this.draw(); //redessine le jeu
            requestAnimationFrame(() => this.gameLoop());
        }
    }
    // Mise à jour du jeu
    update() {
        const currentTime = Date.now();
        
        if (this.currentPiece) {
            // On ne fait descendre la pièce que si assez de temps s'est écoulé
            if (currentTime - this.config.lastDropTime > this.config.dropInterval) {
                // Vérifier la collision avant de déplacer la pièce
                if (this.checkCollision(this.currentPiece, 0, 1)) {
                    this.addPieceToGrid();
                    this.spawnPiece();
                } else {
                    this.currentPiece.y++; // Fait descendre la pièce
                }
                this.config.lastDropTime = currentTime; // Met à jour le temps de la dernière chute
            }
        } else {
            this.spawnPiece();
        }
    }

    // Dessin de l'ensemble du jeu
    draw() {
        // Dessin du jeu
        this.config.ctx.clearRect(0, 0, this.config.canvas.width, this.config.canvas.height);
        this.drawGrid();
        this.drawCurrentPiece();
    }
    // Dessin de la grille
    drawGrid() {
        for (let row = 0; row < this.config.gridHeight; row++) {
            for (let col = 0; col < this.config.gridWidth; col++) {
                if (this.grid[row][col] !== 0) { // Si la case est occupée
                    this.config.ctx.fillStyle = this.grid[row][col]; // Couleur de la pièce
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
    
// Piece en cours de chute
    drawCurrentPiece() {
        if (this.currentPiece) {
            const shape = this.currentPiece.shape; // Récupère la forme de la pièce
            for (let row = 0; row < shape.length; row++) {
                for (let col = 0; col < shape[row].length; col++) {
                    if (shape[row][col] === 1) { // Si une case de la forme est occupée
                        this.config.ctx.fillStyle = this.currentPiece.color; // Couleur de la pièce
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
      // Ajouter la pièce à la grille
      addPieceToGrid() {
        const shape = this.currentPiece.shape;
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] === 1) {
                    this.grid[this.currentPiece.y + row][this.currentPiece.x + col] = this.currentPiece.color;
                }
            }
        }
    }
    spawnPiece() {
        const randomIndex = Math.floor(Math.random() * tetriminos.length);
        const randomTetrimino = tetriminos[randomIndex];
        this.currentPiece = new Piece(randomTetrimino);
    }
    handleInput(event) {
        if (!this.gameOver && this.currentPiece) {
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
                    // Sauvegardez l'index de rotation actuel
                    const currentIndex = this.currentPiece.currentRotationIndex;
                    this.currentPiece.rotate();
                    // Si la rotation cause une collision, revenez en arrière
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

