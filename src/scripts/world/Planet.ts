module Gravity {
    export class Planet extends Phaser.Sprite {

        constructor(game: Phaser.Game, x: number, y: number, map: Gravity.Map) {
            super(game, x, y, 'planet', 0);

            this.scale.setTo(0.5, 0.5);

            game.add.existing(this);
        }
    }
}
