import Phaser from 'phaser';
import { setUserHealth } from '../actions/index';
import { store } from '../reducers';

export class GameScene extends Phaser.Scene {
    private warrior!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private enemy: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[] = [];
    private dyingEnemyIndexes : number[] = [];
    private enemy_speed = 100;
    private bg!: Phaser.GameObjects.Image;
    private slashing: boolean = false;
    private isHurt: boolean = false;
    private numOfEnemies = 5;

    constructor (args: any) {
        super(args);
        setInterval(() => {
            console.log('interval: ', this.enemy.filter(e => e.active).length);
            if(this.enemy.filter(e => e.active).length < 10) {
                for (let i=0; i < this.numOfEnemies; i++){
                    this.enemy.push(enemyFactory(this.enemy_speed, this));
                }
            }
        }, 10 * 1000);
    }

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

        for (let x=0; x < this.numOfEnemies; x++) {
            setTimeout(() => {
                this.enemy.push(enemyFactory(this.enemy_speed, this));
            }, Math.random() * 10);
        }

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
            key: 'ouch',
            frames: [{ key: 'warrior', frame: 26 }],
            frameRate: 20,
        })

        this.anims.create({
            key: 'enemy_bounce',
            frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 3 }),
            frameRate: 4,
            repeat: -1
        });

        this.anims.create({
            key: 'enemy_die',
            frames: this.anims.generateFrameNumbers('enemy', { start: 14, end: 26 }),
            frameRate: 10,
        });

        this.anims.create({
            key: 'enemy_walk',
            frames: this.anims.generateFrameNumbers('enemy', { start: 27, end: 37 }),
            frameRate: 15,
        });

        this.anims.create({
            key: 'enemy_attack',
            frames: this.anims.generateFrameNumbers('enemy', { start: 3, end: 10 }),
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

        this.enemy.forEach((enemy) => {
            if (!enemy) return;
            if (enemy.x < this.physics.world.bounds.x + 200) {
                enemy?.setVelocity(this.enemy_speed + speedMultiplier());
                enemy?.resetFlip();
            }

            if (enemy.x > this.physics.world.bounds.width - 200) {
                enemy?.setVelocity(-this.enemy_speed + speedMultiplier());
                enemy?.setFlip(true, false);
            }
        })


        if (cursors.left.isDown)
        {
            this.warrior.setVelocityX(-speed);
            this.warrior.setFlip(true, false);
            this.warrior.body.setOffset(35, 0);
            playAnim && this.warrior.anims.play('left', true);
        }
        else if (cursors.right.isDown)
        {
            this.warrior.setVelocityX(speed);
            this.warrior.resetFlip();
            this.warrior.body.setOffset(20,0);
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
        this.enemy.forEach((enemy, index) => {
            const enemyBox = new Phaser.Geom.Rectangle(enemy.x, enemy.y, enemy.width, enemy.height);
            if (Phaser.Geom.Rectangle.Overlaps(warriorBox, enemyBox)) {
                if (this.slashing) {
                    enemy?.anims?.play('enemy_die', true);
                    this.dyingEnemyIndexes.push(index);
                    setTimeout(() => {
                        enemy?.destroy();
                    }, 700);
                } else {
                    if(!this.isHurt && !this.dyingEnemyIndexes.includes(index)) {
                        store.dispatch(setUserHealth());
                        this.isHurt = true;
                        enemy?.anims?.play('enemy_attack', true);
                        this.warrior.anims.play('ouch', true);
                        this.warrior.setVelocityY(-100);
                        setTimeout(() => {
                            this.isHurt = false;
                        }, 3 * 1000);
                    }
                }
            } else {
                enemy?.anims?.play('enemy_walk', true);
            }
        });

        this.physics.add.collider(this.warrior, this.enemy);
    }
  }

  const enemyFactory = (enemy_speed: number, that: any) => {
        const direction = Math.random() > 0.5 ? 'right' : 'left';
        const enemy = that.physics.add.sprite(randomInteger(400, 1200), that.bg.displayHeight, 'enemy');
        enemy.setCollideWorldBounds(true);
        enemy.setScale(2,2);
        enemy.setBounce(0.2);
        enemy.setBodySize(32, 32);
        enemy.body.setSize(enemy.body.width, enemy.body.height);
        enemy.body.immovable = true;
        enemy?.setVelocity(direction === 'right' ? enemy_speed + speedMultiplier() : -enemy_speed + speedMultiplier());
        if(direction === 'left') {
            enemy.setFlip(true, false);
        }
        return enemy;
  }

  function randomInteger(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const speedMultiplier = () => {
      return Math.random() * 10;
  }