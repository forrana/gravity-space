module Gravity {
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

        if (from)
        {
            if (this.fireFrom.width > 1)
            {
                this.fireFrom.centerOn(from.x, from.y);
            }
            else
            {
                this.fireFrom.x = from.x;
                this.fireFrom.y = from.y;
            }
        }
        else if (this.trackedSprite)
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

        var angle = (this.trackRotation) ? this.trackedSprite.angle + this.fireAngle : this.fireAngle;

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
            moveY = Math.sin(this.game.math.degToRad(angle)) * speed;
        }

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


    export class Player extends Phaser.Sprite {

        cursors;
        fireButton;
        map : Gravity.Map;
        weapon;
        fireButton1;
        leftKey;
        rightKey;
        forward;
        backward;
        keyScheme;
        playerCollisionGroup;
        weaponCollisionGroup;
        bullets;
        hitPoints;
        alive;

        constructor(game: Phaser.Game,
                    x: number,
                    y: number,
                    map: Gravity.Map,
                    model: string,
                    keyScheme: string
                    ) {

            super(game, x, y, model);
            this.keyScheme = keyScheme;
            // this.weapon = new RGBLaster(this.game, 40);
            this.scale.setTo(0.3, 0.3);
            this.map = map;
            this.anchor.set(0.5);

        //    this.health = new Phaser.Component.Health();
            this.hitPoints = {current: 20, max: 20};
            // this.health.alive = true;
            // this.health.kill = () => {
            //     this.health = new Phaser.Component.Health();
            //     this.health.setHealth(49);
            //     this.health.alive = true;
            //
            //     this.reset(game.rnd.integerInRange(20, 1000), game.rnd.integerInRange(20, 480));
            //
            //     return true;
            // }
            this.alive = true;

            this.weapon = this.game.add.weapon(40, 'bullet');
            this.weapon.offsetX = 0;
            this.weapon.offsetY = 0;
            this.weapon.setBulletFrames(0, 80, true);
            this.weapon.bulletAngleOffset = -90;
            this.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
            //  The speed at which the bullet is fired
            this.weapon.bulletSpeed = 400;
            //  Speed-up the rate of fire, allowing them to shoot 1 bullet every 50ms
            this.weapon.fireRate = 50;
            this.weapon.trackSprite(this, 0, 0, false);
            this.weapon.bulletKillDistance = 100;
            this.weapon.bulletRotateToVelocity = true;

            this.bullets = game.add.group();
            this.bullets.enableBody = true;
            this.bullets.physicsBodyType = Phaser.Physics.P2JS;
            this.bullets.createMultiple(1000, 'bullet', 0, false);
            this.bullets.setAll('anchor.x', 0);
            this.bullets.setAll('anchor.y', 0);

            this.weapon.bullets = this.bullets;
            // this.bullets.setAll('body.fixedRotation', true);
            //  The speed at which the bullet is fired

            this.cursors = game.input.keyboard.createCursorKeys();
            this.fireButton = this.game.input.keyboard.addKey(Phaser.KeyCode.SPACEBAR);
            this.fireButton1 = this.game.input.keyboard.addKey(Phaser.KeyCode.SHIFT);
            this.leftKey = this.game.input.keyboard.addKey(Phaser.KeyCode.A);
            this.rightKey = this.game.input.keyboard.addKey(Phaser.KeyCode.D);
            this.forward = this.game.input.keyboard.addKey(Phaser.KeyCode.W);
            this.backward = this.game.input.keyboard.addKey(Phaser.KeyCode.S);

            game.add.existing(this);
        }

        setCollisionGroups (playerCollisionGroup, weaponCollisionGroup) {
            this.playerCollisionGroup = playerCollisionGroup;
            this.weaponCollisionGroup = weaponCollisionGroup;
            this.bullets.setAll('setCollisionGroup', this.weaponCollisionGroup);
        }

        screenWrap (sprite) {
            if (sprite.x < 0)
            {
                sprite.x = this.game.width;
            }
            else if (sprite.x > this.game.width)
            {
                sprite.x = 0;
            }

            if (sprite.y < 0)
            {
                sprite.y = this.game.height;
            }
            else if (sprite.y > this.game.height)
            {
                sprite.y = 0;
            }
        }

        keyScheme1() {
            if (this.cursors.left.isDown) {
                this.body.rotateLeft(100);
            }
            else if (this.cursors.right.isDown) {
                this.body.rotateRight(100);
            }
            else {
                this.body.setZeroRotation();
            }

            if (this.cursors.up.isDown) {
                this.body.thrust(400);
            }
            else if (this.cursors.down.isDown) {
                this.body.reverse(400);
            }

            if (this.fireButton.isDown)
            {
                this.body.reverse(200);
                this.weapon.fireAngle = this.body.angle - 90;
                this.weapon.fire();
                //null, this.body.x*Math.sin(this.body.angle),
                // this.body.y*Math.con(this.body.angle)
            }
        }
        keyScheme2(){
            if (this.leftKey.isDown) {
                this.body.rotateLeft(100);
            }
            else if (this.rightKey.isDown) {
                this.body.rotateRight(100);
            }
            else {
                this.body.setZeroRotation();
            }

            if (this.forward.isDown) {
                this.body.thrust(400);
            }
            else if (this.backward.isDown) {
                this.body.reverse(400);
            }

            if (this.fireButton1.isDown)
            {
                this.body.reverse(100);
                this.weapon.fireAngle = this.body.angle - 90;
                this.weapon.fire();
            }
        }

        update() {
            switch(this.keyScheme){
                case 'keyScheme1': this.keyScheme1(); break;
                case 'keyScheme2': this.keyScheme2(); break;
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
