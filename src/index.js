const Phaser = require('phaser');

const config = {
  parent: document.getElementById('phaser-root'),
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 }
    }
  },
  scene: {
    preload: preload,
    create: create
  }
};

const game = new Phaser.Game(config);
let graphics;

function preload () {
  this.load.image('chicken_room', 'assets/map_images/Chicken Room.jpg');
  this.load.image('soldier', 'assets/sprites/roman_foot_soldier.png');
}

function create () {

  const camera = this.cameras.main;
  const roomImage = this.add.sprite(config.width / 2, config.height / 2, 'chicken_room');
  graphics = this.add.graphics({ lineStyle: { width: 1, color: 0x00ff00 } });
  const grid = new Grid({ graphics, width: config.width, height:config.height });

  const coords = grid.getCellCenter(5, 5);
  const soldier = this.add.sprite(coords.x, coords.y, 'soldier');
  soldier.setScale(1.5, 1.5);

  grid.onGridChange(() => {
    const coords = grid.getCellCenterForCoordinates(soldier.x, soldier.y);
    soldier.setPosition(coords.x, coords.y);
  });

  window.addEventListener('wheel', (event) => {

    const zoomOut = event.deltaY > 0;

    const cameraZoomStep = 0.05;
    if (zoomOut) {
      roomImage.scaleX -= cameraZoomStep;
      roomImage.scaleY -= cameraZoomStep;
      //if (camera.zoom >= 0.1) {
      //  camera.zoom -= cameraZoomStep;
      //}
    }
    else {
      roomImage.scaleX += cameraZoomStep;
      roomImage.scaleY += cameraZoomStep;
      //if (camera.zoom <= 1.0) {
      //  camera.zoom += cameraZoomStep;
      //}
    }
  });

  this.input.on('pointerdown', (pointer) => {
    console.log(pointer.x, pointer.y);

    const coords = grid.getCellCenterForCoordinates(pointer.x, pointer.y);
    soldier.setPosition(coords.x, coords.y);
  });

  grid.draw();
  
}


class Grid {

  constructor({ graphics, width, height }) {
    this.graphics = graphics;
    this.gridLocked = true;
    this.spacing = 50;
    this.spacingStep = 1;
    this.startOffsetStep = 1;
    this.numPaddingCells = 2;
    this.padding = this.spacing * this.numPaddingCells;
    this.startX = -this.padding;
    this.startY = -this.padding;
    this.width = width;
    this.height = height;
    this.updateEndX();
    this.updateEndY();

    this.lines = [];

    const lockGridButton = document.getElementById('lock-grid-button');
    lockGridButton.addEventListener('click', (event) => {
      gridLocked = !gridLocked;

      if (gridLocked) {
        lockGridButton.value = "Unlock Grid";
      }
      else {
        lockGridButton.value = "Lock Grid";
      }
    });

    const gridSpacingIncreaseButton = document.getElementById('grid-spacing-increase-button');
    gridSpacingIncreaseButton.addEventListener('click', (event) => {

      this.spacing += this.spacingStep;
      this.draw();
    });

    const gridSpacingDecreaseButton = document.getElementById('grid-spacing-decrease-button');
    gridSpacingDecreaseButton.addEventListener('click', (event) => {

      this.spacing -= this.spacingStep;
      this.draw();
    });

    const gridLeftButton = document.getElementById('grid-left-button');
    gridLeftButton.addEventListener('click', (event) => {
      this.startX -= this.startOffsetStep;
      this.updateEndX();
      this.draw();
    });

    const gridRightButton = document.getElementById('grid-right-button');
    gridRightButton.addEventListener('click', (event) => {
      this.startX += this.startOffsetStep;
      this.updateEndX();
      this.draw();
    });

    const gridUpButton = document.getElementById('grid-up-button');
    gridUpButton.addEventListener('click', (event) => {
      this.startY -= this.startOffsetStep;
      this.offsetY -= this.startOffsetStep;
      this.updateEndY();
      this.draw();
    });

    const gridDownButton = document.getElementById('grid-down-button');
    gridDownButton.addEventListener('click', (event) => {
      this.startY += this.startOffsetStep;
      this.offsetY += this.startOffsetStep;
      this.updateEndY();
      this.draw();
    });
  }

  onGridChange(callback) {
    this.callback = callback;
  }

  getCellCenterForCoordinates(x, y) {

    const offsetX = (this.numPaddingCells * this.spacing) - Math.abs(this.startX);
    const offsetY = (this.numPaddingCells * this.spacing) - Math.abs(this.startY);

    console.log(offsetX, offsetY);

    const row = Math.floor((x - offsetX)/ this.spacing);
    const column = Math.floor((y - offsetY) / this.spacing);

    console.log(row, column);

    return this.getCellCenter(row, column);
  }

  getCellCenter(row, column) {
    const offsetX = (this.numPaddingCells * this.spacing) - Math.abs(this.startX);
    const offsetY = (this.numPaddingCells * this.spacing) - Math.abs(this.startY);

    const x0 = offsetX + (this.spacing / 2);
    const y0 = offsetY + (this.spacing / 2);

    const x = x0 + (row * this.spacing);
    const y = y0 + (column * this.spacing);

    return {
      x: x,
      y: y,
    };
  }

  updateEndX() {
      this.endX = this.startX + this.width + 2 * this.padding;
  }

  updateEndY() {
      this.endY = this.startY + this.height + 2 * this.padding;
  }

  draw() {
    const numVertical = (this.endX - this.startX) / this.spacing;
    const numHorizontal = (this.endY - this.startY) / this.spacing;

    this.graphics.clear();

    for (let i = 0; i < numVertical; i++) {
      const vline = new Phaser.Geom.Line(
        this.startX + i*this.spacing, this.startY,
        this.startX + i*this.spacing, this.endY);
      graphics.strokeLineShape(vline);

      for (let j = 0; j < numHorizontal; j++) {
        const hline = new Phaser.Geom.Line(
          this.startX, this.startY + j*this.spacing,
          this.endX, this.startY + j*this.spacing);
        graphics.strokeLineShape(hline);
      }
    }

    if (this.callback) {
      this.callback();
    }
  }

}
