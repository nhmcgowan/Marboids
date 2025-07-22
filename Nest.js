import { MainMenu, Win, Bestiary, Rewards, GameOver } from "./Menus.js";
import { Util } from "./util.js";
import { Player } from "./Entities.js";

export class Nest extends Phaser.Scene {
  constructor() {
    {
      super({
        key: "Nest",
        physics: {
          arcade: {
            debug: false,
          },
          matter: {
            debug: false,
          },
        },
      });
    }
    this.utility = new Util(this);
  }

  init(data) {
    //Data is being passed by nestCongig in MainMenu
    //Bounty Score:
    this.score = 0;
    //amount of enemies possible on screen:
    this.strength = 15;
    //total enemies to defeat:
    this.nestSize = data.nestSize;
    //Interval between enemy spawn events (milliseconds):
    this.scaler = 2500;
    //Amount of enemies on screen:
    this.activeEnemies = 1;
    //threat level, number of high threat enemies on screen
    this.threat = 0;
    //
  }

  preload() {
    //Convert this into JSON load statement
    this.load.image("backGround", "./assets/background.png");
    this.load.image("enemyBlue", "./assets/enemyBlue.png");
    this.load.image("enemyGreen", "./assets/enemyGreen.png");
    this.load.image("enemyOrange", "./assets/enemyOrange.png");
    this.load.image("orangeDead", "./assets/orangeDead-1.png");
    this.load.image("sword", "./assets/sword.png");
    this.load.image("enemyYellow", "./assets/enemyYellow.png");
    this.load.image("yellowDead", "./assets/yellowDead.png");
    this.load.image("enemyGray", "./assets/enemyGray.png");
    this.load.image("grayDamaged", "./assets/grayDamaged.png");
    this.load.image("enemyPurple", "./assets/enemyPurple.png");
    this.load.image("purpleProjectile", "./assets/purpleProjectile.png");
    this.load.image("enemyAqua", "./assets/enemyAqua.png");
    this.load.image("enemyAqua-attack", "./assets/enemyAqua-attack.png");
  }

  create() {
    this.score = 0;
    this.player = new Player(this, 400, 300);
    this.enemies = this.physics.add.group();
    this.utility.attackListener();
    this.hitboxes = this.physics.add.group();
    this.utility.colliders();
    this.utility.spawnTimer();
    this.utility.endingEvents();
    this.utility.ui();
  }

  update() {
    this.utility.uiUpdate();
    this.utility.playerUpdate();
    this.utility.entityCleanUp();
    this.activeEnemies = this.enemies.countActive(true);
  }
}

const config = {
  type: Phaser.AUTO,
  backgroundColor: "#1d2021",
  scene: [MainMenu, Nest, Win, Bestiary, Rewards, GameOver],
  scale: {
    mode: Phaser.Scale.FIT,
    width: 1000,
    height: 750,
    max: {
      width: 1000,
      height: 750,
    },
  },
};
new Phaser.Game(config);
