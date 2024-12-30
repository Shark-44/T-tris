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
       // Mettre à jour l'intervalle de chute en fonction du niveau
       updateDropInterval() {
        // La vitesse augmente de 10% par niveau
        this.config.dropInterval = this.baseDropInterval * Math.pow(0.9, this.level - 1);
    }
       // Mettre à jour le score
       updateScore(linesCleared) {
        // Points par ligne selon le nombre de lignes effacées simultanément
        const points = {
            1: 100,
            2: 300,
            3: 500,
            4: 800
        };
        
        if (linesCleared > 0) {
            // Calcul des points avec bonus de niveau
            this.score += points[linesCleared] * this.level;
            
            // Mise à jour du niveau (1 niveau tous les 1000 points)
            const newLevel = Math.floor(this.score / 1000) + 1;
            if (newLevel !== this.level) {
                this.level = newLevel;
                this.updateDropInterval();
            }
            
            // Mise à jour de l'affichage
            this.updateDisplay();
        }
    }
    // Mettre à jour l'affichage du score et du niveau
    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.levelElement.textContent = this.level;
    }

// init du jeu
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

    drawGameOver() {
        // Fond semi-transparent
        this.config.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.config.ctx.fillRect(0, 0, this.config.canvas.width, this.config.canvas.height);

        // Texte Game Over
        this.config.ctx.fillStyle = 'white';
        this.config.ctx.font = 'bold 48px Arial';
        this.config.ctx.textAlign = 'center';
        this.config.ctx.fillText('GAME OVER', this.config.canvas.width / 2, this.config.canvas.height / 2 - 50);

        // Score final
        this.config.ctx.font = '24px Arial';
        this.config.ctx.fillText(`Score Final: ${this.score}`, this.config.canvas.width / 2, this.config.canvas.height / 2 + 10);

        // Message pour recommencer
        this.config.ctx.font = '20px Arial';
        this.config.ctx.fillText('Appuyez sur ESPACE pour recommencer', this.config.canvas.width / 2, this.config.canvas.height / 2 + 50);
    }


    // Dessin de l'ensemble du jeu
    draw() {
        // Dessin du jeu
        this.config.ctx.clearRect(0, 0, this.config.canvas.width, this.config.canvas.height);
        this.drawGrid();
        this.drawCurrentPiece();
                
        if (this.gameOver) {
            this.drawGameOver();
        }
    }
    // Dessin de la grille
    drawGrid() {
        for (let row = 0; row < this.config.gridHeight; row++) { // parcours les lignes
            for (let col = 0; col < this.config.gridWidth; col++) { // parcours les colonnes
                if (this.grid[row][col] !== 0) { // Si la case est occupée
                    this.config.ctx.fillStyle = this.grid[row][col]; // Couleur du bloc
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

    clearLines() {
        let linesCleared = 0;
        
        // Parcourir la grille de bas en haut
        for (let row = this.config.gridHeight - 1; row >= 0; row--) {
            // Vérifier si la ligne est complète (tous les éléments non nuls)
            const isLineComplete = this.grid[row].every(cell => cell !== 0);
            
            if (isLineComplete) {
                // Supprimer la ligne complète
                this.grid.splice(row, 1);
                // Ajouter une nouvelle ligne vide en haut
                this.grid.unshift(new Array(this.config.gridWidth).fill(0));
                linesCleared++;
                row++; // Vérifier la même position à nouveau car les lignes ont descendu
            }
        }
        
        // Mettre à jour le score (optionnel)
        if (linesCleared > 0) {
            this.updateScore(linesCleared);
        }
        
        return linesCleared;
    }

      // Ajouter la pièce à la grille
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
        // Après avoir ajouté la pièce, vérifier les lignes complètes
        this.clearLines();
       // Vérifier si la pièce ajoutée dépasse la grille (Game Over)
        if (this.currentPiece.y < 0) {
            this.gameOver = true;
        }
    }

    spawnPiece() {
        const randomIndex = Math.floor(Math.random() * tetriminos.length);
        const randomTetrimino = tetriminos[randomIndex];
        this.currentPiece = new Piece(randomTetrimino);
        if (this.checkCollision(this.currentPiece)) {
            this.gameOver = true;
        }
    }

    
    // Réinitialiser le jeu
    resetGame() {
        this.grid = [];
        this.createEmptyGrid();
        this.currentPiece = null;
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.config.dropInterval = this.baseDropInterval;
        this.updateDisplay();
        this.gameLoop();
    }

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

