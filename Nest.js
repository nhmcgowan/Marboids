import {
  MainMenu,
  Win,
  Bestiary,
  Rewards,
  GameOver,
  Challenge,
} from "./Menus.js";
import { Util } from "./Util.js";
import { Player } from "./Entities.js";
import { CRTPipeline } from "./CRTPipeline.js";
import { ShatterPipeline } from "./ShatterPipeline.js";
import { AchievementManager, Achievements } from "./Achievements.js";

export class Nest extends Phaser.Scene {
  constructor() {
    {
      super({
        key: "Nest",
        physics: {
          arcade: {
            debug: true,
          },
          matter: {
            debug: false,
          },
        },
      });
    }
  }

  init(data) {
    //Data is being passed by nestCongig() in scene.MainMenu
    //Bounty Score:
    this.score = 0;
    //amount of enemies possible on screen:
    this.strength = 18;
    //total enemies to defeat:
    this.nestSize = data.nestSize;
    this.initSize = data.nestSize;
    //Spawn system:
    this.lastSpawn = 0;
    this.spawnDelay = 5000;
    //Amount of enemies on screen:
    this.activeEnemies = 1;
  }

  create() {
    this.utility = new Util(this);
    this.Achievements = new AchievementManager(this);
    this.input.mouse.disableContextMenu();
    this.cameras.main.setPostPipeline("crt");
    this.deadSound = this.sound.add("dead");
    this.dodgeSound = this.sound.add("dodge");
    this.dodgeSound.setVolume(1);
    this.utility.ui();
    const startRate = this.game.bgMusic.rate;
    this.tweens.add({
      targets: { rate: startRate },
      rate: 1,
      duration: 1000,
      onUpdate: (tween) => {
        this.game.bgMusic.setRate(tween.getValue());
      },
    });
    this.fpsText = this.add.text(875, 0, "0", {
      fontSize: "30px",
      fontFamily: "VT323, monospace",
      fill: "#24c50a",
    });
    this.player = new Player(this, 400, 300);
    this.enemies = this.physics.add.group();
    this.utility.attackListener();
    this.hitboxes = this.physics.add.group();
    this.utility.colliders();
    this.utility.endingEvents();
  }

  update(time) {
    this.utility.uiUpdate();
    this.utility.playerUpdate();
    this.utility.enemyUpdate();
    this.utility.entityCleanUp();
    this.activeEnemies = this.enemies.countActive(true);
    this.fpsText.setText("fps:" + Math.floor(this.game.loop.actualFps));
    this.utility.spawnTimer(time);
  }
}

export class Launch extends Phaser.Scene {
  constructor() {
    super({
      key: "Launch",
    });
  }

  preload() {
    // Create loading bar graphics
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const barWidth = 300;
    const barHeight = 15;
    const barX = width / 2 - barWidth / 2;
    const barY = height / 2 - barHeight / 2;
    const progressBar = this.add.graphics();
    progressBar.setPostPipeline("crt");

    // Listen to progress event
    this.load.on("progress", (value) => {
      progressBar.clear();
      progressBar.fillStyle(0x24c50a, 1);
      progressBar.fillRect(barX, barY, barWidth * value, barHeight);
    });
    // Remove bar when complete
    this.load.on("complete", () => {
      progressBar.destroy();
    });

    this.load.image("Logo", "./assets/rivalLogo3.png");
    this.load.script(
      "webfont",
      "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
    );
    this.load.image("cursor", "./assets/cursor.png");
    this.load.audio("music", "./assets/music.mp3");
    this.load.audio("dodge", "./assets/dodge.mp3");
    this.load.audio("dead", "./assets/scoreSound.mp3");
    this.load.image("aquaHitbox", "./assets/aquaHitbox.png");
    this.load.image("vectoidBlueAttack", "./assets/vectoidBlueAttack.png");
    this.load.image("player", "./assets/player.png");
    this.load.image("vectoidBlue", "./assets/vectoidBlue.png");
    this.load.image("vectoidGreen", "./assets/vectoidGreen.png");
    this.load.image("vectoidOrange", "./assets/vectoidOrange.png");
    this.load.image("orangeDead", "./assets/orangeDead.png");
    this.load.image("sword", "./assets/sword.png");
    this.load.image("vectoidYellow", "./assets/vectoidYellow.png");
    this.load.image("yellowDead", "./assets/yellowDead.png");
    this.load.image("vectoidGray", "./assets/vectoidGray.png");
    this.load.image("grayDamaged", "./assets/grayDamaged.png");
    this.load.image("vectoidPurple", "./assets/vectoidPurple.png");
    this.load.image("purpleProjectile", "./assets/purpleProjectile.png");
    this.load.image("vectoidAqua", "./assets/vectoidAqua.png");
    this.load.image("vectoidOlive", "./assets/vectoidOlive.png");
    this.load.image("nukeIcon", "./assets/nukeIcon.png");
    this.load.image("vectoidBluev2", "./assets/vectoidBluev2.png");
    this.load.image("skull", "./assets/skull.png");
  }

  create() {
    const click = this.add
      .image(600, 375, "Logo")
      .setScale(3)
      .setDepth(10)
      .setInteractive();
    click.setAlpha(0);
    click.on("pointerdown", () => {
      this.scene.start("MainMenu");
    });
    this.cameras.main.setPostPipeline("crt");
    const logo = this.add
      .image(500, 175, "Logo")
      .setOrigin(0.5, 0.5)
      .setScale(0.8)
      .setInteractive();

    logo.on("pointerdown", () => {
      this.scene.start("MainMenu");
    });

    WebFont.load({
      google: {
        families: ["VT323"],
      },
      active: () => {
        const logoText = this.add
          .text(500, 500, "   RIVAL   \ninteractive", {
            fontSize: "80px",
            fontFamily: "VT323, monospace",
            fill: "#24c50a",
          })
          .setOrigin(0.5, 0.5);
        this.add.text(700, 300, "Click to Start");
      },
    });
  }
}

const config = {
  type: Phaser.WEBGL,
  backgroundColor: "#1280a4ff",
  scene: [
    Launch,
    MainMenu,
    Nest,
    Win,
    Bestiary,
    Rewards,
    GameOver,
    Challenge,
    Achievements,
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    width: 1000,
    height: 750,
    max: {
      width: 1000,
      height: 750,
    },
  },
  pipeline: {
    crt: CRTPipeline,
    shatter: ShatterPipeline,
  },
};
const Game = new Phaser.Game(config);
