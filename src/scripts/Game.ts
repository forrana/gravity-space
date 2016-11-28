/// <reference path="definitions/phaser.comments.d.ts"/>

module Gravity {
  export class Game extends Phaser.Game {
    constructor() {
      super({
        width: 1024,
        height: 576,
        transparent: false,
        enableDebug: true
      });

      this.state.add('boot', State.Boot);
      this.state.add('preload', State.Preload);
      this.state.add('main', State.Main);
      this.state.add('update', State.Update);

      this.state.start('boot');
    }
  }
}
