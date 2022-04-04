import { DISTANCE } from '../constants';
import { MainScene } from '../scenes/MainScene';

export interface EnemyConfig {
  x: number;
  y: number;
}

export class Enemy {
  scene: MainScene;
  sprite: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;

  constructor(scene: MainScene, config: Partial<EnemyConfig> = {}) {
    this.scene = scene;
    const { enemiesGroup } = scene;

    const { x = 0, y = 0 } = config;
    this.sprite = enemiesGroup?.create(x, y, 'orc');
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setData('object', this);
    this.sprite.setCircle(32, 32, 32); // half sprite size
    this.sprite.debugShowBody = true;
  }

  restart() {}

  update(dt: number) {
    const { scene, sprite } = this;
    const { player } = scene;
    if (!player) return;
    const baseSpeed = 2; // TODO: move into game state w/mods
    const speed = baseSpeed * 60; //dt

    this.scene.physics.moveToObject(sprite, player.sprite, speed);
    const distance = Phaser.Math.Distance.Between(
      sprite.x,
      sprite.y,
      player.sprite.x,
      player.sprite.y
    );
    if (distance > DISTANCE.despawn) {
      this.sprite.x = 2 * player.sprite.x - this.sprite.x;
      this.sprite.y = 2 * player.sprite.y - this.sprite.y;
    }
    sprite.flipX = sprite.x > player.sprite.x;

    // const direction = Math.atan2(
    //   player.sprite.y - sprite.y,
    //   player.sprite.x - sprite.x
    // );
    // this.sprite?.setVelocityX(speed * Math.cos(direction));
    // this.sprite?.setVelocityY(speed * Math.sin(direction));

    sprite.setDepth(sprite.y);
  }

  destroy() {
    // Remove sprites from scene
    this.sprite?.destroy();
  }
}