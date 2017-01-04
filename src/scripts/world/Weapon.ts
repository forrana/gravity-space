module Gravity {
    export class RGBLaster extends Phaser.Weapon {
        spaceShip;
        bullets;
        fireRate: number = 200;
        nextFire: number = 0;
        game: Phaser.Game;

        constructor(spriteSize, spaceShip, game) {

            super(spriteSize, spaceShip);

            this.game = game;
            this.setBulletFrames(0, 80, true);
            this.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
            this.bullets = game.add.group();
            this.bullets.enableBody = true;
            this.bullets.physicsBodyType = Phaser.Physics.P2JS;
            this.bullets.createMultiple(1000, 'bullet', 0, false);
            this.bullets.setAll('anchor.x', 0.5);
            this.bullets.setAll('anchor.y', 0.5);
            //  The speed at which the bullet is fired
            this.bulletSpeed = 400;
            //  The speed at which the bullet is fired
            //  Speed-up the rate of fire, allowing them to shoot 1 bullet every 50ms
            this.fireRate = 10;
            this.trackSprite(spaceShip, 0, 0, false);
            this.bulletRotateToVelocity = true;
            //  Speed-up the rate of fire, allowing them to shoot 1 bullet every 50ms
            this.spaceShip = spaceShip;
        }
    };

    Phaser.Weapon.prototype.fire = function (from, x, y) {

        if (this.game.time.now < this._nextFire || (this.fireLimit > 0 && this.shots === this.fireLimit))
        {
            return false;
        }

        var speed = this.bulletSpeed;

        //  Apply +- speed variance
        if (this.bulletSpeedVariance !== 0)
        {
            speed += Phaser.Math.between(-this.bulletSpeedVariance, this.bulletSpeedVariance);
        }

        if (this.trackedSprite)
        {
            if (this.trackRotation)
            {
                this._rotatedPoint.set(this.trackedSprite.world.x + this.trackOffset.x, this.trackedSprite.world.y + this.trackOffset.y);
                this._rotatedPoint.rotate(this.trackedSprite.world.x, this.trackedSprite.world.y, this.trackedSprite.rotation + this.game.math.degToRad(0));

                if (this.fireFrom.width > 1)
                {
                    this.fireFrom.centerOn(this._rotatedPoint.x, this._rotatedPoint.y);
                }
                else
                {
                    this.fireFrom.x = this._rotatedPoint.x;
                    this.fireFrom.y = this._rotatedPoint.y;
                }
            }
            else
            {
                if (this.fireFrom.width > 1)
                {
                    this.fireFrom.centerOn(this.trackedSprite.world.x + this.trackOffset.x, this.trackedSprite.world.y + this.trackOffset.y);
                }
                else
                {
                    this.fireFrom.x = this.trackedSprite.world.x + this.trackOffset.x;
                    this.fireFrom.y = this.trackedSprite.world.y + this.trackOffset.y;
                }
            }

            if (this.bulletInheritSpriteSpeed)
            {
                speed += this.trackedSprite.body.speed;
            }
        }
        else if (this.trackedPointer)
        {
            if (this.fireFrom.width > 1)
            {
                this.fireFrom.centerOn(this.trackedPointer.world.x + this.trackOffset.x, this.trackedPointer.world.y + this.trackOffset.y);
            }
            else
            {
                this.fireFrom.x = this.trackedPointer.world.x + this.trackOffset.x;
                this.fireFrom.y = this.trackedPointer.world.y + this.trackOffset.y;
            }
        }

        var fromX = (this.fireFrom.width > 1) ? this.fireFrom.randomX : this.fireFrom.x;
        var fromY = (this.fireFrom.height > 1) ? this.fireFrom.randomY : this.fireFrom.y;

        var angle = (this.trackRotation) ? this.trackedSprite.angle : this.fireAngle; // this.fireAngle; // this.trackedSprite.angle

        //  The position (in world space) to fire the bullet towards, if set
        if (x !== undefined && y !== undefined)
        {
            angle = this.game.math.radToDeg(Math.atan2(y - fromY, x - fromX));
        }

        //  Apply +- angle variance
        if (this.bulletAngleVariance !== 0)
        {
            angle += Phaser.Math.between(-this.bulletAngleVariance, this.bulletAngleVariance);
        }

        var moveX = 0;
        var moveY = 0;

        //  Avoid sin/cos for right-angled shots
        if (angle === 0 || angle === 180)
        {
            moveX = Math.cos(this.game.math.degToRad(angle)) * speed;
        }
        else if (angle === 90 || angle === 270)
        {
            moveY = Math.sin(this.game.math.degToRad(angle)) * speed;
        }
        else
        {
            moveX = Math.cos(this.game.math.degToRad(angle)) * speed;
            moveY = Math.sin(this.game.math.degToRad(angle)) * speed ;
        }

        fromX = fromX + 20*Math.cos(this.game.math.degToRad(angle));
        fromY = fromY + 20*Math.sin(this.game.math.degToRad(angle));

        var bullet = null;

        if (this.autoExpandBulletsGroup)
        {
            bullet = this.bullets.getFirstExists(false, true, fromX, fromY, this.bulletKey, this.bulletFrame);

            bullet.data.bulletManager = this;
        }
        else
        {
            bullet = this.bullets.getFirstExists(false);
        }

        if (bullet)
        {
            bullet.reset(fromX, fromY);

            bullet.data.fromX = fromX;
            bullet.data.fromY = fromY;
            bullet.data.killType = this.bulletKillType;
            bullet.data.killDistance = this.bulletKillDistance;
            bullet.data.rotateToVelocity = this.bulletRotateToVelocity;

            if (this.bulletKillType === Phaser.Weapon.KILL_LIFESPAN)
            {
                bullet.lifespan = this.bulletLifespan;
            }

            bullet.angle = angle + this.bulletAngleOffset;

            //  Frames and Animations
            if (this.bulletAnimation !== '')
            {
                if (bullet.animations.getAnimation(this.bulletAnimation) === null)
                {
                    var anim = this.anims[this.bulletAnimation];

                    bullet.animations.add(anim.name, anim.frames, anim.frameRate, anim.loop, anim.useNumericIndex);
                }

                bullet.animations.play(this.bulletAnimation);
            }
            else
            {
                if (this.bulletFrameCycle)
                {
                    bullet.frame = this.bulletFrames[this.bulletFrameIndex];

                    this.bulletFrameIndex++;

                    if (this.bulletFrameIndex >= this.bulletFrames.length)
                    {
                        this.bulletFrameIndex = 0;
                    }
                }
                else if (this.bulletFrameRandom)
                {
                    bullet.frame = this.bulletFrames[Math.floor(Math.random() * this.bulletFrames.length)];
                }
            }

            if (bullet.data.bodyDirty)
            {
                if (this._data.customBody)
                {
                    bullet.body.setSize(this._data.width, this._data.height, this._data.offsetX, this._data.offsetY);
                }

                bullet.body.collideWorldBounds = this.bulletCollideWorldBounds;

                bullet.data.bodyDirty = false;
            }

            bullet.body.velocity.x = moveX;
            bullet.body.velocity.y = moveY;
            bullet.body.gravity.set(this.bulletGravity.x, this.bulletGravity.y);

            if (this.bulletSpeedVariance !== 0)
            {
                var rate = this.fireRate;

                rate += Phaser.Math.between(-this.fireRateVariance, this.fireRateVariance);

                if (rate < 0)
                {
                    rate = 0;
                }

                this._nextFire = this.game.time.now + rate;
            }
            else
            {
                this._nextFire = this.game.time.now + this.fireRate;
            }

            this.shots++;

            this.onFire.dispatch(bullet, this, speed);

            if (this.fireLimit > 0 && this.shots === this.fireLimit)
            {
                this.onFireLimit.dispatch(this, this.fireLimit);
            }
        }
        return bullet;
    };
}
