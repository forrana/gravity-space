module Gravity.State {
  export class Update extends Phaser.State {
    private preloadBar:Phaser.Sprite;

    preload() {
      this.preloadBar = this.add.sprite(290, 290, 'preload-bar');
      this.load.setPreloadSprite(this.preloadBar);
    }

    update() {
      this.game.state.update();
      console.log();
    }
  }
}
