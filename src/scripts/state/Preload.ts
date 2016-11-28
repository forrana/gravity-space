module Gravity.State {
  export class Preload extends Phaser.State {
    private preloadBar:Phaser.Sprite;

    preload() {
        this.game.load.image('space', 'assets/images/space1024.jpg');
        this.game.load.image('spaceShip1', 'assets/images/space-ship-1.png');
        this.game.load.image('spaceShip2', 'assets/images/space-ship-2.png');
        this.game.load.image('planet', 'assets/images/planet.png');
        this.game.load.spritesheet('bullet', 'assets/sprites/rgblaser.png', 4, 4);

        this.preloadBar = this.add.sprite(290, 290, 'preload-bar');
        this.load.setPreloadSprite(this.preloadBar);
    }

    create() {
      this.game.state.start('main');
    }
  }
}
