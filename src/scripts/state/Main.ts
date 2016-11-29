module Gravity.State {
    export class Main extends Phaser.State {

        fpsText: Phaser.Text;
        spaceShip1: Player;
        spaceShip2: Player;
        constraint;
        planet;
        fireButton;
        weapon;
        spaceShipCollisionGroup1;
        spaceShipCollisionGroup2;
        bulletsCollisionGroup;
        bulletsCollisionGroup1;
        bulletsCollisionGroup2;
        planetCollisionGroup;

        create() {
            this.game.world.setBounds(0, 0, this.game.width, this.game.height);
            this.game.physics.startSystem(Phaser.Physics.P2JS);
            this.game.physics.p2.defaultRestitution = 0.8;
            this.game.physics.p2.setImpactEvents(true);
            this.spaceShipCollisionGroup1 = this.game.physics.p2.createCollisionGroup();
            this.spaceShipCollisionGroup2 = this.game.physics.p2.createCollisionGroup();
            this.bulletsCollisionGroup = this.game.physics.p2.createCollisionGroup();
            this.bulletsCollisionGroup1 = this.game.physics.p2.createCollisionGroup();
            this.bulletsCollisionGroup2 = this.game.physics.p2.createCollisionGroup();
            this.planetCollisionGroup = this.game.physics.p2.createCollisionGroup();
            this.game.physics.p2.updateBoundsCollisionGroup();

            let map = new Map(this.game, 0, 0, 1024, 576),
                planet = new Planet(this.game,
                                this.game.width/2,
                                this.game.height/2,
                                map
                            ),
                spaceShip1 = new Player(this.game, 10, 10, map, 'spaceShip1', 'keyScheme1'),
                spaceShip2 = new Player(this.game, 1000, 500, map, 'spaceShip2', 'keyScheme2');

            this.spaceShip1 = spaceShip1;
            this.spaceShip2 = spaceShip2;

            this.planet = planet;
            //this.weapon = weapon;

            this.game.physics.p2.enable([spaceShip1, spaceShip2, planet]);

            spaceShip1.body.setCollisionGroup(this.spaceShipCollisionGroup1);
            spaceShip2.body.setCollisionGroup(this.spaceShipCollisionGroup2);
            this.planet.body.setCollisionGroup(this.planetCollisionGroup);
            this.planet.body.collides([ this.spaceShipCollisionGroup1,
                                        this.spaceShipCollisionGroup2,
                                        this.bulletsCollisionGroup1,
                                        this.bulletsCollisionGroup2,
                                    ]);

            spaceShip1.bullets.forEach((bullet) => {
              bullet.body.setCollisionGroup(this.bulletsCollisionGroup1);
              bullet.body.collides(
                  [this.spaceShipCollisionGroup2, this.planetCollisionGroup, this.bulletsCollisionGroup2],
                  bullet.kill,
                  bullet
              );
            });

            spaceShip2.bullets.forEach((bullet) => {
              bullet.body.setCollisionGroup(this.bulletsCollisionGroup2);
              bullet.body.collides(
                  [this.spaceShipCollisionGroup1, this.planetCollisionGroup, this.bulletsCollisionGroup1],
                  bullet.kill,
                  bullet
              );
            });

            spaceShip1.body.collides(
                [this.bulletsCollisionGroup2, this.spaceShipCollisionGroup2, this.planetCollisionGroup],
                this.spaceShip1.damage,
                this.spaceShip1
            );

            spaceShip2.body.collides(
                [this.bulletsCollisionGroup1, this.spaceShipCollisionGroup1, this.planetCollisionGroup],
                this.spaceShip2.damage,
                this.spaceShip2
            );

            // spaceShip1.setCollisionGroups(
            //     this.spaceShipCollisionGroup1,
            //     this.bulletsCollisionGroup
            // );
            //
            // spaceShip2.setCollisionGroups(
            //     this.spaceShipCollisionGroup,
            //     this.bulletsCollisionGroup
            // );


            planet.body.static  = true;

            this.fpsText = this.game.add.text(
                20, 20, '', { font: '16px Arial', fill: '#ffffff' });
        }

        accelerateToObject(obj1, obj2, speed) {
            if (typeof speed === 'undefined') { speed = 60; }
            var angle = Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x);
            obj1.body.force.x = Math.cos(angle) * speed;    // accelerateToObject
            obj1.body.force.y = Math.sin(angle) * speed;
        }

        getGravitationForce(mass, point) {
            let destantion = Math.sqrt(
                                point.dx*point.dx +
                                point.dy*point.dy);
            return mass / (destantion*destantion);
        }

        updateBody(ast_) {
                var dx = ast_.x - this.planet.x;
                var dy = ast_.y - this.planet.y;

                this.accelerateToObject(ast_, this.planet,
                this.getGravitationForce(4e6, {dx, dy})); //5.5e6
        }

        update() {
            this.updateBody(this.spaceShip1);
            this.updateBody(this.spaceShip2);
        }
    }
}
