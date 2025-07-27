import { MainMenu, Win, Bestiary, Rewards, GameOver } from "./Menus.js";
import { Util } from "./Util.js";
import { Player } from "./Entities.js";
import { CRTPipeline } from "./CRTPipeline.js";

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
  }

  init(data) {
    //Data is being passed by nestCongig() in scene.MainMenu
    //Bounty Score:
    this.score = 0;
    //amount of enemies possible on screen:
    this.strength = 15;
    //total enemies to defeat:
    this.nestSize = data.nestSize;
    //Interval between enemy spawn events (milliseconds):
    this.scaler = 2000;
    //Amount of enemies on screen:
    this.activeEnemies = 1;
    //threat level, number of high threat enemies on screen
    this.threat = 0;
    //
  }

  preload() {
    //Convert this into JSON load statement
    //this.load.audio("music", "./assets/music.mp3");
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
  }

  create() {
    this.cameras.main.setPostPipeline("crt");
    this.utility = new Util(this);
    this.utility.ui();
    //this.bgMusic = this.sound.add("music", { loop: true, volume: 1 });
    //this.bgMusic.play();
    /*this.fpsText = this.add.text(875, 0, "0", {
      fontSize: "30px",
      fontFamily: "VT323, monospace",
      fill: "#24c50a",
    });*/
    this.score = 0;
    this.player = new Player(this, 400, 300);
    this.enemies = this.physics.add.group();
    this.utility.attackListener();
    this.hitboxes = this.physics.add.group();
    this.utility.colliders();
    this.utility.spawnTimer();
    this.utility.endingEvents();
  }

  update() {
    this.utility.uiUpdate();
    this.utility.playerUpdate();
    this.utility.entityCleanUp();
    this.activeEnemies = this.enemies.countActive(true);
    //this.fpsText.setText("fps:" + Math.floor(this.game.loop.actualFps));
  }
}

export class Launch extends Phaser.Scene {
  constructor() {
    super({
      key: "Launch",
    });
    this.ready = false;
  }

  preload() {
    this.load.image("Logo", "./assets/rivalLogo3.png");
    this.load.script(
      "webfont",
      "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
    );
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

  update() {}
}

const config = {
  type: Phaser.WEBGL,
  backgroundColor: "#1280a4ff",
  scene: [Launch, MainMenu, Nest, Win, Bestiary, Rewards, GameOver],
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
  },
};
new Phaser.Game(config);
