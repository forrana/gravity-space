module Gravity {
    export class PlayersManager {
        game: Game;
        map: Map;
        playersArray: Array<Player>;
        playersLimit: number;

        constructor(game: Game, map: Map) {
            this.game = game;
            this.map = map
            this.playersArray = [];
        }

        public addNewPlayer() {
            let newPlayer = new Player(this.game,
                                this.game.rnd.integerInRange(20, 1000),
                                this.game.rnd.integerInRange(20, 480),
                                this.map,
                                `spaceShip${this.playersArray.length + 1}`,
                                `keyScheme${this.playersArray.length + 1}`);

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
