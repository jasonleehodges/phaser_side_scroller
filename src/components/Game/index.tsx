import React, { memo } from 'react';

import { GameScene } from '../../scenes/mainScene';
import Phaser from 'phaser';

const config = {
  parent: 'game',
  type: Phaser.AUTO,
  width: 1000,
  height: 700,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 },
      // debug: true
    },
  },
  scene: GameScene
};
new Phaser.Game(config);

export const Game = memo(() => {

  return (<div></div>)

});