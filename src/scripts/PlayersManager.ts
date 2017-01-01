module Gravity {
    export class PlayersManager {
        game: Game;
        map: Map;
        playersArray: Array<Player>;
        playersIds: Set<String>;
        playersLimit: number;

        constructor(game: Game, map: Map) {
            this.game = game;
            this.map = map
            this.playersArray = [];
            this.playersIds = new Set();
        }

        public addNewPlayer(playerId: String) {
            playerId = playerId || 'currentPlayer';
            if(this.playersIds.has(playerId)) return;
            let newPlayer = new Player(
                                this.game,
                                this.game.rnd.integerInRange(20, 1000),
                                this.game.rnd.integerInRange(20, 480),
                                this.map,
                                playerId !== 'currentPlayer' ? 'spaceShip2' : 'spaceShip1',
                                playerId !== 'currentPlayer' ? 'networkScheme' : 'keyScheme1',
                                playerId
                            );
            this.playersIds.add(playerId);
            this.playersArray.push(newPlayer);
        }

        public setCollisionGroup(   playerCollisionGroup: any,
                                    bulletsCollisionGroup: any,
                                    otherCollisionGroups: Array<any>
                                ) {
            this.playersArray.forEach(
                player => {
                    // Setting up collision group
                    player.body.setCollisionGroup(playerCollisionGroup);
                    // Setting up bullets collision groups
                    player.bullets.forEach((bullet) => {
                      bullet.body.setCollisionGroup(bulletsCollisionGroup);
                      bullet.body.collides(
                          [     playerCollisionGroup,
                                bulletsCollisionGroup,
                                ...otherCollisionGroups
                          ],
                          bullet.kill,
                          bullet
                      );
                    });
                    //Setting up reaction on collisions
                    player.body.collides(
                        [bulletsCollisionGroup, playerCollisionGroup, ...otherCollisionGroups],
                        player.damage,
                        player
                    );

                }
            )
        }

        public get players():Array<Player> {
            return this.playersArray;
        }
    }
}
