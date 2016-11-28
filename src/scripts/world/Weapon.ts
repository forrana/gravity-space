module Gravity {
    export class RGBLaster extends Phaser.Weapon {
        spaceShip;
        bullets;
        fireRate = 200;
        nextFire = 0;
        game;

        constructor(game: Phaser.Game, spriteSize: Number, spaceShip) {

            super(game, spriteSize, 'bullet');

            this.game = game;
            this.setBulletFrames(0, 80, true);
            this.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
            this.bullets = game.add.group();
            this.bullets.enableBody = true;
            this.bullets.physicsBodyType = Phaser.Physics.P2JS;
            this.bullets.createMultiple(8, 'bullet', 0, false);
            this.bullets.setAll('anchor.x', 0.5);
            this.bullets.setAll('anchor.y', 0.5);
            // this.bullets.setAll('body.fixedRotation', true);
            //  The speed at which the bullet is fired
            this.bulletSpeed = 400;
            //  Speed-up the rate of fire, allowing them to shoot 1 bullet every 50ms
            this.fireRate = 50;
            this.spaceShip = spaceShip;

            game.add.existing(this);
        }

        shoot() {
          if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0) {
            this.nextFire = this.game.time.now + this.fireRate;
            var bullet = this.bullets.getFirstExists(false);
            // bullet.reset(this.tankTurret.x + this.tankTurret.width / 2 * Math.cos(this.tankTurret.rotation - Phaser.Math.degToRad(90)),
            //   this.tankTurret.y + this.tankTurret.width / 2 * Math.sin(this.tankTurret.rotation - Phaser.Math.degToRad(90)));
            bullet.body.rotation = this.spaceShip.rotation;
            bullet.body.mass = 100;
            bullet.body.moveForward(500);

          }
        }

        update() {

        }

    }
}
