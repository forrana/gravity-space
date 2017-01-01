module Gravity {
    class HitPoints {
        currentHitPoints: integer;
        maxHitPoints: integer;
        isAlive: boolean

        constructor(maxHitPoints: integer = 50) {
            this.maxHitPoints = maxHitPoints;
            this.currentHitPoints = maxHitPoints;
            this.isAlive = true;
        }

        hit (damageAmounte: integer = 1) {
            this.isAlive ? this.currentHitPoints -= damageAmounte :
                            this.currentHitPoints = 0;
            if (this.currentHitPoints <= 0) this.isAlive = false;
        }
    }

    class ThrustEngine {
        currentThrust: integer;
        maxThrust: integer;

        constructor(maxThrust: integer = 500, currentThrust: integer = 20) {
            this.maxThrust = maxThrust;
            this.currentThrust = currentThrust;
        }

        changeThrust (thrustDiff: integer) {
            this.currentThrust += thrustDiff;
            if (this.currentThrust >= this.maxThrust) {
                this.currentThrust = this.maxThrust;
            } else if (this.currentThrust <= -1 * this.maxThrust) {
                this.currentThrust = -1 * this.maxThrust;
            }
        }
    }

    export class Player extends Phaser.Sprite {
        map : Gravity.Map;
        weapon;
        keyScheme;
        keyScheme1;
        keyScheme2;
        networkScheme;
        bullets;
        hitPoints: HitPoints;
        thrustEngine: ThrustEngine;
        userId;
        defaultControlles;
        isNetworkGame;

        constructor(game: Phaser.Game,
                    x: number,
                    y: number,
                    map: Gravity.Map,
                    model: string,
                    keyScheme: string,
                    userId: string
                    ) {

            super(game, x, y, model);

            this.isNetworkGame = true;
            this.userId = userId;
            this.scale.setTo(0.3, 0.3);
            this.map = map;
            this.anchor.set(0.5);

            this.hitPoints = new HitPoints();
            this.thrustEngine = new ThrustEngine(500, 20);

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
            this.thrustEngine.changeThrust(-2.5);
            this.weapon.fireAngle = this.body.angle - 90;
            this.weapon.fire();
        }

        sendMessageToServer(name, param) {
            this.isNetworkGame &&
            this.game.socket.emit('event', {
                    userId: this.game.userId,
                    action: {
                        name,
                        param
                    }
                }
            );
        }

        keyControlls(keyScheme) {
            keyScheme = keyScheme || this.keyScheme1;
            if (keyScheme.left.isDown) {
                this.body.rotateLeft(100);
                this.sendMessageToServer('turn', 'left');
            }
            else if (keyScheme.right.isDown) {
                this.body.rotateRight(100);
                this.sendMessageToServer('turn', 'right');
            }
            else {
                this.body.setZeroRotation();
            }

            if (keyScheme.forward.isDown) {
                this.thrustEngine.changeThrust(25);
                this.sendMessageToServer('thrust', this.thrustEngine.currentThrust);
            }
            else if (keyScheme.backward.isDown) {
                this.thrustEngine.changeThrust(-25);
                this.sendMessageToServer('thrust', this.thrustEngine.currentThrust);
            }

            if (keyScheme.shoot.isDown)
            {
                this.shoot();
                this.sendMessageToServer('shoot', 1);
            }
        }

        networkControls() {
            if (this.game.networkPlayers && this.game.networkPlayers[this.userId].length > 0) {
                this.virtualController(this.game.networkPlayers[this.userId].pop());
            }
        }

        virtualController(command) {
            switch(command.name) {
                case 'turn':
                    switch(command.param) {
                        case 'right': this.body.rotateRight(100); break;
                        case 'left': this.body.rotateLeft(100); break;
                    }
                    break;
                case 'thrust': this.thrustEngine.currentThrust = command.param; break;
                case 'shoot': this.shoot(); break;
            }
            // this.body.setZeroRotation();
        }

        defaultControlles = _.throttle(this.keyControlls.bind(this), 100, { 'trailing': false });

        update() {
            if (this.thrustEngine.currentThrust > 0) {
                this.body.thrust(this.thrustEngine.currentThrust);
                this.thrustEngine.changeThrust(-1);
            } else {
                this.body.reverse(Math.abs(this.thrustEngine.currentThrust));
                this.thrustEngine.changeThrust(1);
            }

            switch(this.keyScheme) {
                case 'keyScheme1': this.defaultControlles(); break;
                case 'keyScheme2': this.keyControlls(this.keyScheme2); break;
                case 'networkScheme': this.networkControls(); break;
            }
            this.game.world.wrap(this, 16);
        }

        damage() {
            console.warn('Hit!!!', this.hitPoints.isAlive);
            if(this.hitPoints.isAlive) {
                this.hitPoints.hit();
            } else {
                this.hitPoints = new HitPoints();
                this.reset(this.game.rnd.integerInRange(20, 1000), this.game.rnd.integerInRange(20, 480));
            }
            return false;
        }
    }
}
