<!-- Game.vue -->
<template>
 <div class ="body-container">
 <div class="style-container">
  <div class="title-container">
    CYBERPONG
</div>  
  <div class="score-container">
      <div class="left-score">{{ leftScore }}</div>
      <div class="right-score">{{ rightScore }}</div>
    </div>
    <br>
    <div class="game-container">
      <div ref="stageContainer"></div>
    </div>
    <br>
    <br>
    <p>Player 1 : W = up, S = down </p>
    <p>Player 2 : Keyup = up, Keydown = down</p> 
</div>
</div>
</template>

<script>
import { Stage, Layer, Rect,Circle } from 'konva';

export default {
  name: 'Game',
  data() {
    return {
      stage: null,
      ball: null,
      leftPaddle: null,
      rightPaddle: null,
      ballSpeedX: 2,
      ballSpeedY: 2,
      keys: {},
      paddleSpeed: 4,
      leftScore: 0,
      rightScore: 0,
      ballSpeedIncrease: 0.5,
    };
  },
  mounted() {
    this.$nextTick(() => {
    this.initGame();
  });
  
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  },
  methods: {
    initGame() {
      this.stage = new Stage({
        container: this.$refs.stageContainer,
        width: 500,
        height: 300,
      });

      const layer = new Layer();
      this.stage.add(layer);

      this.ball = new Circle({  // Utilisation de Circle
      x: this.stage.width() / 2,
      y: this.stage.height() / 2,
      radius: 5,
      fill: '#0affd1',
      shadowColor: '#0affd1',
      shadowBlur: 10,
      shadowOffset: { x: 0, y: 0 },
      shadowOpacity: 0.6
});
layer.add(this.ball);

this.leftPaddle = new Rect({
  x: 10,
  y: this.stage.height() / 2 - 30,
  width: 10,
  height: 60,
  fillLinearGradientStartPoint: { x: 0, y: 0 },
  fillLinearGradientEndPoint: { x: 0, y: 60 },
  fillLinearGradientColorStops: [0, '#9f00c5', 1, '#0affd1'],
  shadowColor: '#ff2079',
  shadowBlur: 10,
  shadowOffset: { x: 0, y: 0 },
  shadowOpacity: 0.6
});
layer.add(this.leftPaddle);

this.rightPaddle = new Rect({
  x: this.stage.width() - 20,
  y: this.stage.height() / 2 - 30,
  width: 10,
  height: 60,
  fillLinearGradientStartPoint: { x: 0, y: 0 },
  fillLinearGradientEndPoint: { x: 0, y: 60 },
  fillLinearGradientColorStops: [0, '#0affd1', 1, '#9f00c5'],
  shadowColor: '#0affd1',
  shadowBlur: 10,
  shadowOffset: { x: 0, y: 0 },
  shadowOpacity: 0.6
});
layer.add(this.rightPaddle);

      layer.draw();

      this.gameLoop();
    },
    resetGame() {
      // Augmente le score du joueur correspondant
     if (this.ball.x() <= 0) {
        this.rightScore += 1; // Le joueur de droite marque un point
      } else if (this.ball.x() + this.ball.radius() >= this.stage.width()) {
        this.leftScore += 1; // Le joueur de gauche marque un point
      }
      // Réinitialise la position de la balle
      this.ball.x(this.stage.width() / 2 - 5);
      this.ball.y(this.stage.height() / 2 - 5);
      this.ballSpeedX = 2; 
      this.ballSpeedY = 2;

      // Réinitialise la position des palettes
      this.leftPaddle.y(this.stage.height() / 2 - 30);
      this.rightPaddle.y(this.stage.height() / 2 - 30);
    },
    gameLoop() {
      window.requestAnimationFrame(this.gameLoop);

      this.ball.x(this.ball.x() + this.ballSpeedX);
      this.ball.y(this.ball.y() + this.ballSpeedY);

        // Collision avec les bords supérieur et inférieur
      if (this.ball.y() <= 0 || this.ball.y() >= this.stage.height() - this.ball.height()) {
          this.ballSpeedY = -this.ballSpeedY;
      }
      // Collision avec les bords gauche et droit
      if (this.ball.x() <= 0 || this.ball.x() + this.ball.radius() >= this.stage.width()) {
      this.resetGame();
      }
    // Collision avec la palette de gauche
    if (
      this.ball.x() <= this.leftPaddle.x() + this.leftPaddle.width() &&
      this.ball.y() + this.ball.radius() >= this.leftPaddle.y() &&
      this.ball.y() <= this.leftPaddle.y() + this.leftPaddle.height() &&
      this.ballSpeedX < 0
    ) {
      this.ballSpeedX = -this.ballSpeedX;
      this.increaseBallSpeed(); 
      const deltaY = this.ball.y() - (this.leftPaddle.y() + this.leftPaddle.height() / 2);
      this.ballSpeedY = deltaY * 0.10;
      this.ball.x(this.leftPaddle.x() + this.leftPaddle.width() + this.ball.radius()); // Ligne ajustée
    }
    // Collision avec la palette de droite
    if (
      this.ball.x() + this.ball.radius() * 2 >= this.rightPaddle.x() &&
      this.ball.y() + this.ball.radius() >= this.rightPaddle.y() &&
      this.ball.y() <= this.rightPaddle.y() + this.rightPaddle.height() &&
      this.ballSpeedX > 0
    ) {
      this.ballSpeedX = -this.ballSpeedX;
      this.increaseBallSpeed();
      const deltaY = this.ball.y() - (this.rightPaddle.y() + this.rightPaddle.height() / 2);
      this.ballSpeedY = deltaY * 0.10;
      this.ball.x(this.rightPaddle.x() - this.ball.radius()); // Ligne ajustée
    }

      
      if (this.keys['ArrowUp'] && this.rightPaddle.y() > 0) {
    this.rightPaddle.y(this.rightPaddle.y() - this.paddleSpeed);
      }
      if (this.keys['ArrowDown'] && this.rightPaddle.y() < this.stage.height() - 60) {
        this.rightPaddle.y(this.rightPaddle.y() + this.paddleSpeed);
      }
      if (this.keys['w'] && this.leftPaddle.y() > 0) {
        this.leftPaddle.y(this.leftPaddle.y() - this.paddleSpeed);
      }
      if (this.keys['s'] && this.leftPaddle.y() < this.stage.height() - 60) {
        this.leftPaddle.y(this.leftPaddle.y() + this.paddleSpeed);
      }

      this.stage.draw();
    },
    increaseBallSpeed() {
      this.ballSpeedX = this.ballSpeedX + (this.ballSpeedX > 0 ? this.ballSpeedIncrease : -this.ballSpeedIncrease);
      this.ballSpeedY = this.ballSpeedY + (this.ballSpeedY > 0 ? this.ballSpeedIncrease : -this.ballSpeedIncrease);
    },
    handleKeyDown(event) {
    this.keys[event.key] = true;
    },
    handleKeyUp(event) {
    this.keys[event.key] = false;
    },
    beforeDestroy() {
  window.removeEventListener('keydown', this.handleKeyDown);
  window.removeEventListener('keyup', this.handleKeyUp);
    },
    quitGame() {
      this.$emit('quit-game'); // Informer le composant parent que l'utilisateur veut quitter le jeu.
    },
  },
};
</script>

<style>
@import '~/assets/css/game.css';
</style>