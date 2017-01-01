module Gravity.State {
    export class Main extends Phaser.State {

        fpsText: Phaser.Text;
        constraint;
        planet;
        spaceShipCollisionGroup;
        bulletsCollisionGroup;
        planetCollisionGroup;
        manager: PlayersManager;

        create() {
            // Socket initialization
            this.game.socket = io();

            this.game.socket.on('connect', () => {
                console.info('Socket was connected');
                this.game.userId = new Date();
                this.manager.addNewPlayer();
                this.initializePlayersPhisic();
                this.game.socket.emit('add user', this.game.userId);
            });

            this.game.socket.on('user joined', (data) => {
                this.manager.addNewPlayer(data.username);
                this.initializePlayersPhisic();
            })

            this.game.socket.on('event', (data) => {
                this.game.networkPlayers = this.game.networkPlayers || {};
                this.game.networkPlayers[data.username] = this.game.networkPlayers[data.username] || [];
                this.game.networkPlayers[data.username].push(data.message.action);
            });

            this.game.socket.on('disconnect', () => {
                console.info('Socket was disconnected');
            });

            //Setting up phisics
            this.game.world.setBounds(0, 0, this.game.width, this.game.height);
            this.game.physics.startSystem(Phaser.Physics.P2JS);
            this.game.physics.p2.defaultRestitution = 0.8;
            this.game.physics.p2.setImpactEvents(true);

            this.spaceShipCollisionGroup = this.game.physics.p2.createCollisionGroup();
            this.bulletsCollisionGroup = this.game.physics.p2.createCollisionGroup();
            this.planetCollisionGroup = this.game.physics.p2.createCollisionGroup();
            this.game.physics.p2.updateBoundsCollisionGroup();

            let map = new Map(this.game, 0, 0, 1024, 576),
                planet = new Planet(this.game,
                                this.game.width/2,
                                this.game.height/2,
                                map
                            );

            this.manager = new PlayersManager(this.game, map);

            this.planet = planet;

            this.game.physics.p2.enable([...this.manager.players, planet]);

            this.manager.setCollisionGroup(  this.spaceShipCollisionGroup,
                                        this.bulletsCollisionGroup,
                                        [this.planetCollisionGroup]
                                    );

            this.planet.body.setCollisionGroup(this.planetCollisionGroup);
            this.planet.body.collides([ this.spaceShipCollisionGroup,
                                        this.bulletsCollisionGroup,
                                    ]);

            planet.body.static  = true;

            this.fpsText = this.game.add.text(
                20, 20, '', { font: '16px Arial', fill: '#ffffff' });
        }

        initializePlayersPhisic() {
            this.game.physics.p2.enable([...this.manager.players]);

            this.manager.setCollisionGroup(  this.spaceShipCollisionGroup,
                                        this.bulletsCollisionGroup,
                                        [this.planetCollisionGroup]
                                    );
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
                this.getGravitationForce(1e6, {dx, dy})); //5.5e6
        }

        update() {
            this.manager.players.forEach(
                player => this.updateBody(player)
            );
        }
    }
}
