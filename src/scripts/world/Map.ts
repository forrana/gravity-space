module Gravity {
    export class Map extends Phaser.TileSprite {

        constructor(game: Phaser.Game, x: number, y: number,
                    screenWidth: number, screenHeight: number) {

            super(game, x, y, screenWidth, screenHeight, 'space');

            this.fixedToCamera = true;

            game.add.existing(this);
        }

        update() {

        }

    }
}
