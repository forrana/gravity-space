module Gravity {
    export class Player extends Phaser.Sprite {

        map : Gravity.Map;
        weapon;
        keyScheme;
        keyScheme1;
        keyScheme2;
        bullets;
        hitPoints;
        alive;
        currentThrust;
        maxThrust;

        constructor(game: Phaser.Game,
                    x: number,
                    y: number,
                    map: Gravity.Map,
                    model: string,
                    keyScheme: string
                    ) {

            super(game, x, y, model);

            this.scale.setTo(0.3, 0.3);
            this.map = map;
            this.anchor.set(0.5);

            this.hitPoints = {current: 20, max: 20};
            this.alive = true;

            this.currentThrust = 20;
            this.maxThrust = 500;

            this.keyScheme = keyScheme;
            this.weapon = new RGBLaster(this.game, this, this.game);
            this.bullets = this.weapon.bullets;

            let cursors = game.input.keyboard.createCursorKeys(),
                fireButton = this.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR),
                fireButton1 = this.game.input.keyboard.addKey(Phaser.KeyCode.SHIFT),
                leftKey = this.game.input.keyboard.addKey(Phaser.KeyCode.A),
                rightKey = this.game.input.keyboard.addKey(Phaser.KeyCode.D),
                forward = this.game.input.keyboard.addKey(Phaser.KeyCode.W),
                backward = this.game.input.keyboard.addKey(Phaser.KeyCode.S);

            this.keyScheme1 = {
                left: cursors.left,
                right: cursors.right,
                forward: cursors.up,
                backward: cursors.down,
                shoot: fireButton
            }

            this.keyScheme2 = {
                left: leftKey,
                right: rightKey,
                forward: forward,
                backward: backward,
                shoot: fireButton1
            }

            game.add.existing(this);
        }

        shoot() {
            this.currentThrust-=2.5
            this.weapon.fireAngle = this.body.angle - 90;
            this.weapon.fire();
        }

        keyControlls(keyScheme) {
            if (keyScheme.left.isDown) {
                this.body.rotateLeft(100);
            }
            else if (keyScheme.right.isDown) {
                this.body.rotateRight(100);
            }
            else {
                this.body.setZeroRotation();
            }

            if (keyScheme.forward.isDown) {
                this.currentThrust < this.maxThrust ?
                    this.currentThrust+=2.5 : this.currentThrust += 0;
                    console.log(this.currentThrust);
            }
            else if (keyScheme.backward.isDown) {
                this.currentThrust > this.maxThrust*-1 ?
                    this.currentThrust-=2.5 : this.currentThrust += 0;
                    console.log(this.currentThrust);
            }

            if (keyScheme.shoot.isDown)
            {
                this.shoot();
            }
        }

        update() {
            if (this.currentThrust > 0){
                this.body.thrust(this.currentThrust);
                this.currentThrust -= 1;
            } else {
                this.body.reverse(Math.abs(this.currentThrust));
                this.currentThrust += 1;
            }


            switch(this.keyScheme){
                case 'keyScheme1': this.keyControlls(this.keyScheme1); break;
                case 'keyScheme2': this.keyControlls(this.keyScheme2); break;
                default: this.keyControlls(this.keyScheme1); break;
            }
            this.game.world.wrap(this, 16);
        }

        damage() {
            console.warn('Hit!!!', this.hitPoints);
            if(this.hitPoints.current > 0) {
                this.hitPoints.current -= 1;
            } else {
                this.hitPoints.current = this.hitPoints.max;
                this.reset(this.game.rnd.integerInRange(20, 1000), this.game.rnd.integerInRange(20, 480));
            }
            return false;
        }
    }
}
