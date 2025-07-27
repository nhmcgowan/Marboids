import { MenuUtil } from "./MenuUtil.js";
import { CRTPipeline } from "./CRTPipeline.js";

export class MainMenu extends Phaser.Scene {
  constructor() {
    super({
      key: "MainMenu",
      physics: {
        arcade: {
          debug: false,
        },
      },
    });
    this.util = new MenuUtil(this);
  }

  init() {
    const savedData = localStorage.getItem("marboidsSave");
    if (savedData) {
      const data = JSON.parse(savedData);
      this.savedData = data; // Store the whole object for later use
      for (const key in data) {
        this.registry.set(key, data[key]);
      }
    } else {
      this.savedData = {}; // Or null, if you prefer
    }
  }

  preload() {
    this.load.script(
      "webfont",
      "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
    );
    this.load.image("cursor", "./assets/cursor.png")
  }

  debug(target = []) {
    const debugGraphics = this.add.graphics();
    debugGraphics.lineStyle(2, 0xff0000, 1); // Red outline
    const bounds = target.getBounds();
    debugGraphics.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    debugGraphics.fillStyle(0x00ff00, 1);
    debugGraphics.fillCircle(target.x, target.y, 2);
  }

  create() {
    this.input.setDefaultCursor("url(assets/cursor.png), pointer");
    this.cameras.main.setPostPipeline("crt");

    this.popup = false;
    WebFont.load({
      google: {
        families: ["VT323"],
      },
      active: () => {
        // Add text after font is loaded
        this.title1 = this.add.text(400, 100, "Vectoid", {
          fontFamily: "VT323, monospace",
          fontSize: "80px",
          fill: "#24c50a",
        });

        this.title2 = this.add
          .text(this.title1.x + 258, 115, "arena", {
            fontSize: "32px",
            fontFamily: "VT323, monospace",
            fontStyle: "italic",
            fill: "#24c50a",
          })
          .setOrigin(0.5, 0.5);
        this.tweens.add({
          targets: this.title2,
          scale: 1.2,
          duration: 200,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });

        this.play = this.add
          .text(600, 300, "Play", {
            fontSize: "48px",
            fontFamily: "VT323, monospace",

            fill: "#24c50a",
          })
          .setInteractive();
        this.play.on("pointerdown", () => {
          if (this.popup === false) {
            this.modeConfig();
          } else {
            this.closeConfig();
          }
        });

        this.bestiary = this.add
          .text(600, 400, "Bestiary", {
            fontSize: "48px",
            fontFamily: "VT323, monospace",
            fill: "#24c50a",
          })
          .setInteractive();
        this.bestiary.on("pointerdown", () => {
          this.scene.start("Bestiary");
        });

        this.rewards = this.add
          .text(600, 600, "Rewards", {
            fontSize: "48px",
            fontFamily: "VT323, monospace",
            fill: "#24c50a",
          })
          .setInteractive();
        this.rewards.on("pointerdown", () => {
          this.scene.start("Rewards");
        });

        this.achievements = this.add
          .text(600, 500, "Achievements", {
            fontSize: "48px",
            fontFamily: "VT323, monospace",

            fill: "#24c50a",
          })
          .setInteractive();
        this.achievements.on("pointerdown", () => {
          this.scene.start("Achievements");
        });

        //hoverAnims:
        this.util.addMenuHoverTween(this.play, this.play.y);
        this.util.addMenuHoverTween(this.bestiary, this.bestiary.y);
        this.util.addMenuHoverTween(this.rewards, this.rewards.y);
        this.util.addMenuHoverTween(this.achievements, this.achievements.y);
        this.statsBar();

        this.info = this.add
          .text(375, 500, "", {
            fontSize: "30px",
            fontFamily: "VT323, monospace",

            fill: "#24c50a",
          })
          .setOrigin(0.5, 0.5);
        this.info.visible = false;
      },
    });
  }

  statsBar() {
    const totalDeaths = this.registry.get("totalDeaths") || 0;
    const highScore = this.registry.get("highScore") || 0;
    const wins = this.registry.get("wins") || 0;
    const bounty = this.registry.get("currency") || 0;
    this.hiScore = this.add.text(150, 200, `High Score: ${highScore}`, {
      fontSize: "32px",
      fontFamily: "VT323, monospace",
      fill: "#24c50a",
    });

    this.deaths = this.add.text(-50, 200, `Deaths: ${totalDeaths}`, {
      fontSize: "32px",
      fontFamily: "VT323, monospace",
      fill: "#24c50a",
    });

    this.wins = this.add.text(-210, 200, `Wins: ${wins}`, {
      fontSize: "32px",
      fontFamily: "VT323, monospace",
      fill: "#24c50a",
    });

    this.bounty = this.add.text(-410, 200, `Bounty: ${bounty}`, {
      fontSize: "32px",
      fontFamily: "VT323, monospace",
      fill: "#24c50a",
    });

    this.statsArr = [this.hiScore, this.deaths, this.wins, this.bounty];

    this.util.scrollBar(this.statsArr);
  }

  update() {
    if (!this.statsArr) return;
    this.util.scrollBarUpdate(this.statsArr);
  }

  closeConfig() {
    if (this.config) {
      this.config.destroy();
      this.config = false;
    }
    if (this.modeconFig) {
      this.modeconFig.destroy();
      this.modeconFig = false;
      this.popup = false;
    }
  }

  modeConfig() {
    this.popup = true;
    this.modeconFig = this.add.container(300, 375);
    const skirmish = this.add
      .text(0, -50, "Skirmish", {
        fontSize: "30px",
        fontFamily: "VT323, monospace",
        fill: "#24c50a",
      })
      .setInteractive();
    skirmish.on("pointerdown", () => {
      this.nestConfig();
      this.modeconFig.destroy();
      this.info.visible = false;
    });
    skirmish.on("pointerover", () => {
      this.info.setText("Single Bounty Run");
      this.info.visible = true;
    });
    skirmish.on("pointerout", () => {
      this.info.visible = false;
    });

    const endless = this.add
      .text(0, -0, "Endless", {
        fontSize: "30px",
        fontFamily: "VT323, monospace",
        fill: "#24c50a",
      })
      .setInteractive();
    endless.on("pointerdown", () => {
      this.scene.start("Nest", { nestSize: 10000 });
    });
    endless.on("pointerover", () => {
      this.info.setText("Good Luck");
      this.info.visible = true;
    });
    endless.on("pointerout", () => {
      this.info.visible = false;
    });

    const challenge = this.add
      .text(0, 50, "Challenges", {
        fontSize: "30px",
        fontFamily: "VT323, monospace",
        fill: "#24c50a",
      })
      .setInteractive();
    challenge.on("pointerdown", () => {
      this.scene.start("challenge");
    });
    challenge.on("pointerover", () => {
      this.info.setText("Opens the Challenges Menu");
      this.info.visible = true;
    });
    challenge.on("pointerout", () => {
      this.info.visible = false;
    });

    this.modeconFig.add([skirmish, endless, challenge]);

    this.modeconFig.list.forEach((child) => {
      this.util.addMenuHoverTween(child);
    });
  }

  nestConfig() {
    this.config = this.add.container(300, 375);
    const easy = this.add
      .text(0, -50, "Easy", {
        fontSize: "30px",
        fontFamily: "VT323, monospace",
        fill: "#24c50a",
      })
      .setInteractive();
    easy.on("pointerdown", () => {
      this.scene.start("Nest", { nestSize: 150 });
    });
    easy.on("pointerover", () => {
      this.info.setText("150");
      this.info.visible = true;
    });
    easy.on("pointerout", () => {
      this.info.visible = false;
    });
    const med = this.add
      .text(0, 0, "Medium", {
        fontSize: "30px",
        fontFamily: "VT323, monospace",
        fill: "#24c50a",
      })
      .setInteractive();
    med.on("pointerdown", () => {
      this.scene.start("Nest", { nestSize: 250 });
    });
    med.on("pointerover", () => {
      this.info.setText("250");
      this.info.visible = true;
    });
    med.on("pointerout", () => {
      this.info.visible = false;
    });

    const hard = this.add
      .text(0, 50, "Hard", {
        fontSize: "30px",
        fontFamily: "VT323, monospace",
        fill: "#24c50a",
      })
      .setInteractive();
    hard.on("pointerdown", () => {
      this.scene.start("Nest", { nestSize: 500 });
    });
    hard.on("pointerover", () => {
      this.info.setText("500");
      this.info.visible = true;
    });
    hard.on("pointerout", () => {
      this.info.visible = false;
    });

    this.config.add([easy, med, hard]);

    this.config.list.forEach((child) => {
      this.util.addMenuHoverTween(child);
    });
  }

  nestConfigInfo() {
    const easyInfo = this.add
      .text(250, 500, "This is some infomation about easy mode")
      .setOrigin(0.5, 0.5);
    easyInfo.visible = false;
  }
}

export class Win extends Phaser.Scene {
  constructor() {
    super({
      key: "Win",
    });
    this.util = new MenuUtil(this);
  }

  create() {
    this.cameras.main.setPostPipeline("crt");
    const winText = this.add
      .text(500, 250, "Nest Destroyed", {
        fontSize: "80px",
        fontFamily: "Consolas, 'Courier New', monospace",

        fill: "#24c50a",
      })
      .setOrigin(0.5, 0.5);

    this.tweens.add({
      targets: winText,
      y: winText.y - 20,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    const menu = this.add
      .text(500, 500, "Main Menu", {
        fontSize: "30px",
        fontFamily: "VT323, monospace",
        fill: "#24c50a",
      })
      .setOrigin(0.5, 0.5)
      .setInteractive();
    menu.on("pointerdown", () => {
      this.scene.start("MainMenu");
    });
    const finalScore = this.registry.get("finalScore");
    this.add
      .text(500, 400, `Final Score: ${finalScore}`, {
        fontSize: "30px",
        fontFamily: "VT323, monospace",
        fill: "#24c50a",
      })
      .setOrigin(0.5, 0.5);
  }
}

export class Bestiary extends Phaser.Scene {
  constructor() {
    super({
      key: "Bestiary",
    });
  }

  create() {
    this.cameras.main.setPostPipeline("crt");
    this.add
      .text(500, 500, "-Bumper-", {
        fontSize: "30px",
        fontFamily: "VT323, monospace",
        fill: "#24c50a",
      })
      .setOrigin(0.5, 0.5);

    const backButton = this.add
      .text(100, 50, "<", {
        fontSize: "24px",
        fontFamily: "VT323, monospace",
        fill: "#24c50a",
      })
      .setOrigin(0.5, 0.5)
      .setInteractive();
    backButton.on("pointerdown", () => {
      this.scene.start("MainMenu");
    });
  }
}

export class Rewards extends Phaser.Scene {
  constructor() {
    super({
      key: "Rewards",
    });
  }

  create() {
    this.cameras.main.setPostPipeline("crt");
    const backButton = this.add
      .text(100, 50, "<", {
        fontSize: "48px",
        fontFamily: "VT323, monospace",
        fill: "#24c50a",
      })
      .setOrigin(0.5, 0.5)
      .setInteractive();
    backButton.on("pointerdown", () => {
      this.scene.start("MainMenu");
    });

    this.add
      .text(400, 100, "Rewards:", {
        fontSize: "80px",
        fontFamily: "VT323, monospace",
        fill: "#24c50a",
      })

    this.add
      .text(150, 200, `฿ounty Points: ${this.registry.get("currency") || 0}`, {
        fontSize: "28px",
        fontFamily: "VT323, monospace",

        fill: "#24c50a",
      })
      .setOrigin(0.5, 0.5);

    this.add
      .text(150, 240, `€ems: 0`, {
        fontSize: "28px",
        fontFamily: "VT323, monospace",

        fill: "#24c50a",
      })
      .setOrigin(0.5, 0.5);
  }
}

export class GameOver extends Phaser.Scene {
  constructor() {
    super({
      key: "GameOver",
      physics: {
        arcade: {
          debug: false,
        },
      },
    });
    this.util = new MenuUtil(this);
  }
  create() {
    this.cameras.main.setPostPipeline("crt");
    const loseText = this.add
      .text(375, 100, "YOU DIED", {
        fontSize: "80px",
        fontFamily: "VT323, monospace",

        fill: "#24c50a",
      })
     

    const menu = this.add
      .text(500, 500, "Main Menu", {
        fontSize: "30px",
        fontFamily: "VT323, monospace",
        fill: "#24c50a",
      })
      .setOrigin(0.5, 0.5)
      .setInteractive();
    menu.on("pointerdown", () => {
      this.scene.start("MainMenu");
    });
    const finalScore = this.registry.get("finalScore");
    this.add
      .text(500, 400, `Final Score: ${finalScore}`, {
        fontSize: "30px",
        fontFamily: "VT323, monospace",
        fill: "#24c50a",
      })
      .setOrigin(0.5, 0.5);

    const highScore = this.registry.get("highScore") || 0;
    const hsPopup = this.add
      .text(582, 400, `New High Score!`, {
        fontSize: "16px",
        fontFamily: "VT323, monospace",
        fill: "#24c50a",
      })
      .setOrigin(0.5, 0.5)
      .setRotation(Math.PI / 6);

    if (finalScore === highScore) {
      hsPopup.visible = true;
    } else {
      hsPopup.visible = false;
    }

    this.tweens.add({
      targets: [loseText, hsPopup],
      y: (target) => target.y - 20,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.lose1 = this.add
      .text(500, 300, `...Game Over...`, {
        fontSize: "32px",
        fontFamily: "VT323, monospace",
        fill: "#c50a0aff",
      })
      .setOrigin(0.5, 0.5);

    this.lose2 = this.add
      .text(700, 300, `...Game Over...`, {
        fontSize: "32px",
        fontFamily: "VT323, monospace",
        fill: "#c50a0aff",
      })
      .setOrigin(0.5, 0.5);

    this.lose3 = this.add
      .text(900, 300, `...Game Over...`, {
        fontSize: "32px",
        fontFamily: "VT323, monospace",
        fill: "#c50a0aff",
      })
      .setOrigin(0.5, 0.5);

    this.lose4 = this.add
      .text(300, 300, `...Game Over...`, {
        fontSize: "32px",
        fontFamily: "VT323, monospace",
        fill: "#c50a0aff",
      })
      .setOrigin(0.5, 0.5);

    this.lose5 = this.add
      .text(100, 300, `...Game Over...`, {
        fontSize: "32px",
        fontFamily: "VT323, monospace",
        fill: "#c50a0aff",
      })
      .setOrigin(0.5, 0.5);

    this.lose6 = this.add
      .text(100, 300, `...Game Over...`, {
        fontSize: "32px",
        fontFamily: "VT323, monospace",
        fill: "#c50a0aff",
      })
      .setOrigin(0.5, 0.5);

    this.lose7 = this.add
      .text(-200, 300, `...Game Over...`, {
        fontSize: "32px",
        fontFamily: "VT323, monospace",
        fill: "#c50a0aff",
      })
      .setOrigin(0.5, 0.5);

    this.arr = [
      this.lose1,
      this.lose2,
      this.lose3,
      this.lose4,
      this.lose5,
      this.lose6,
      this.lose7,
    ];
    this.util.addMenuHoverTween(menu);
    this.util.scrollBar(this.arr);
  }

  update() {
    if (!this.arr) return;
    this.util.scrollBarUpdate(this.arr);
  }
}
