import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
    private warrior!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private enemy!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private enemy_speed = 100;
    private bg!: Phaser.GameObjects.Image;
    private slashing: boolean = false;

    public preload () {
        this.load.spritesheet('warrior',
            'assets/Warrior_Sheet-Effect.png',
            { frameWidth: 69, frameHeight: 44 }
        );
        this.load.spritesheet('enemy',
            'assets/Skeleton_enemy.png',
            { frameWidth: 64, frameHeight: 64 }
        );

        this.load.image('background', 'assets/bg.png');
    }

    public create() {

        this.bg = this.add.image(0, 0, "background").setOrigin(0, 0);

        this.warrior = this.physics.add.sprite(100, this.bg.displayHeight, 'warrior');
        this.warrior.setScale(2.2,2.2);
        this.warrior.setBounce(0.2);
        this.warrior.setCollideWorldBounds(true);
        this.warrior.body.setSize(this.warrior.body.width / 4, this.warrior.body.height);
        this.warrior.body.setOffset(20, 0);

        this.enemy = this.physics.add.sprite(400, this.bg.displayHeight, 'enemy');
        this.enemy.setCollideWorldBounds(true);
        this.enemy.setScale(2,2);
        this.enemy.setBounce(0.2);
        this.enemy.setBodySize(32, 32);
        this.enemy.body.setSize(this.enemy.body.width, this.enemy.body.height);
        this.enemy.body.immovable = true;
        this.enemy.setVelocity(this.enemy_speed);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('warrior', { start: 7, end: 12 }),
            frameRate: 20,
            repeat: -1,
        });
        
        this.anims.create({
            key: 'turn',
            frames: this.anims.generateFrameNumbers('warrior', { start: 3, end: 5 }),
            frameRate: 7,
            repeat: 10
        });
        
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('warrior', { start: 7, end: 12 }),
            frameRate: 20,
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('warrior', { start: 42, end: 48 }),
            frameRate: 4,
        });

        this.anims.create({
            key: 'falling',
            frames: this.anims.generateFrameNumbers('warrior', { start: 44, end: 48 }),
            frameRate: 4,
        });

        this.anims.create({
            key: 'slash',
            frames: this.anims.generateFrameNumbers('warrior', { start: 19, end: 22 }),
            frameRate: 20,
        });

        this.anims.create({
            key: 'enemy_bounce',
            frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 3 }),
            frameRate: 4,
            repeat: -1
        });

        this.anims.create({
            key: 'enemy_die',
            frames: this.anims.generateFrameNumbers('enemy', { start: 14, end: 26 }),
            frameRate: 15,
        });

        this.anims.create({
            key: 'enemy_walk',
            frames: this.anims.generateFrameNumbers('enemy', { start: 27, end: 37 }),
            frameRate: 15,
        });

        this.cameras.main.setBounds(0, -200, this.bg.displayWidth, this.bg.displayHeight);
        this.physics.world.setBounds(-50, -this.bg.displayHeight * .2, this.bg.displayWidth + 100, this.bg.displayHeight);
        this.cameras.main.startFollow(this.warrior);
    }

    public update() {
        const cursors = this.input.keyboard.createCursorKeys();
        const speed = 300;
        const jumpRate = 200;
        const onGround = this.warrior.body.y > this.bg.displayHeight - 325;
        const playAnim = onGround && !this.slashing;

        if (this.enemy.x < this.physics.world.bounds.x + 200) {
            this.enemy.setVelocity(this.enemy_speed);
            this.enemy.resetFlip();
        }

        if (this.enemy.x > this.physics.world.bounds.width - 200) {
            this.enemy.setVelocity(-this.enemy_speed);
            this.enemy.setFlip(true, false);
        }

        if (cursors.left.isDown)
        {
            this.warrior.setVelocityX(-speed);
            this.warrior.setFlip(true, false);
            playAnim && this.warrior.anims.play('left', true);
        }
        else if (cursors.right.isDown)
        {
            this.warrior.setVelocityX(speed);
            this.warrior.resetFlip();
            playAnim && this.warrior.anims.play('right', true);
        }
        else
        {
            this.warrior.setVelocityX(0);
            playAnim && !this.slashing && this.warrior.anims.play('turn', true);
        }

        if (cursors.up.isDown && playAnim)
        {
            this.warrior.setVelocityY(-jumpRate);
            this.warrior.anims.play('jump', true);
        }

        if (Phaser.Input.Keyboard.JustUp(cursors.space)) {
            this.warrior.anims.play('slash', true);
            this.slashing = true;
            setTimeout(() => {
                this.slashing = false;
                this.warrior.anims.play('falling', true);
            }, 200);
        }

        const warriorBox = new Phaser.Geom.Rectangle(this.warrior.x, this.warrior.y, this.warrior.width, this.warrior.height);
        const enemyBox = new Phaser.Geom.Rectangle(this.enemy.x, this.enemy.y, this.enemy.width, this.enemy.height);

        if (Phaser.Geom.Rectangle.Overlaps(warriorBox, enemyBox)) {
            if (this.slashing) {
                this.enemy?.anims?.play('enemy_die', true);
                setTimeout(() => {
                    this.enemy?.destroy();
                }, 700)
            }
        } else {
            this.enemy?.anims?.play('enemy_walk', true);
        }

        this.physics.add.collider(this.warrior, this.enemy);
    }
  }