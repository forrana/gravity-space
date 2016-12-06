module Gravity.State {
  export class Boot extends Phaser.State {
    preload() {
      this.load.image('preload-bar', 'assets/images/preloader.gif');
    }

    create() {
      this.game.stage.backgroundColor = 0xFFFFFF;

      this.input.maxPointers = 1;
      this.stage.disableVisibilityChange = true;

      // Socket initialization
      this.game.socket = io();

      this.game.socket.on('connect', () => {
          console.info('Socket was connected');
          this.game.userId = new Date();
          this.game.socket.emit('add user', this.game.userId);
      });

      this.game.socket.on('event', () => {
          console.info(data);
      });
      
      this.game.socket.on('disconnect', () => {
          console.info('Socket was disconnected');
      });

      this.game.state.start('preload');
    }
  }
}
