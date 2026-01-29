import { MenuUtil } from "./MenuUtil.js";

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
      this.savedData = data;
      for (const key in data) {
        this.registry.set(key, data[key]);
      }
    } else {
      this.savedData = {};
    }
  }

  musicSetUp() {
    if (!this.bgMusic) {
      this.bgMusic = this.sound.add("music", { loop: true });
      this.bgMusic.play();
      this.bgMusic.setRate(0.8);
      this.bgMusic.setVolume(0.5);
      this.game.bgMusic = this.bgMusic;
    } else {
      const startRate = this.game.bgMusic.rate;
      this.tweens.add({
        targets: { Rate: startRate },
        Rate: 0.8,
        duration: 1000,
        onUpdate: (tween) => {
          this.game.bgMusic.setRate(tween.getValue());
        },
      });

      const startDetune = this.game.bgMusic.detune;
      this.tweens.add({
        targets: { detune: startDetune },
        detune: 0,
        duration: 2000,
        onUpdate: (tween) => {
          this.game.bgMusic.setDetune(tween.getValue());
        },
      });
    }
  }

  create() {
    //cursor/shader/music
    this.cameras.main.setPostPipeline("crt");
    this.input.setDefaultCursor("url(assets/cursor.png), pointer");
    this.musicSetUp();
    //Menu:
    this.title1 = this.util.text(400, 100, "Vectoid", "80px");
    this.title2 = this.util.text(
      this.title1.x + 258,
      115,
      "arena",
      "32px",
      "#c50a0aff",
      0.5
    );

    this.tweens.add({
      targets: this.title2,
      scale: 1.2,
      duration: 200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.popup = false;
    const size = "48px";
    this.play = this.util.text(600, 300, "Play", size);
    this.play.on("pointerdown", () => {
      if (this.popup === false) {
        this.modeConfig();
      } else {
        this.closeConfig();
      }
    });

    this.bestiary = this.util.text(600, 400, "Bestiary", size);
    this.bestiary.on("pointerdown", () => {
      this.scene.start("Bestiary");
    });

    this.rewards = this.util.text(600, 600, "Rewards", size);
    this.rewards.on("pointerdown", () => {
      this.scene.start("Rewards");
    });

    this.achievements = this.util.text(600, 500, "Achievements", size);
    this.achievements.on("pointerdown", () => {
      this.scene.start("Achievements");
    });

    //hoverAnims:
    const targets = [this.play, this.bestiary, this.rewards, this.achievements];
    this.util.hoverTween(targets);
    this.statsBar();

    this.info = this.util.text(375, 500, "Info", "30px", undefined, 0.5);
    this.info.visible = false;
  }

  statsBar() {
    const totalDeaths = this.registry.get("totalDeaths") || 0;
    const highScore = this.registry.get("highScore") || 0;
    const wins = this.registry.get("wins") || 0;
    const bounty = this.registry.get("currency") || 0;
    const px = "32px";

    this.hiScore = this.util.text(150, 200, `High Score: ${highScore}`, px);

    this.deaths = this.util.text(-50, 200, `Deaths: ${totalDeaths}`, px);

    this.wins = this.util.text(-210, 200, `Wins: ${wins}`, px);

    this.bounty = this.util.text(-410, 200, `Bounty: ${bounty}`, px);

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
    const px = "30px";
    const skirmish = this.util.text(0, -50, "Skirmish", px);
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

    const endless = this.util.text(0, -0, "Insane", px);
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

    const challenge = this.util.text(0, 50, "Challenges", px);
    challenge.on("pointerdown", () => {
      this.scene.start("Challenge");
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
      this.util.hoverTween(child);
    });
  }

  nestConfig() {
    this.config = this.add.container(300, 375);
    const px = "30px";
    const easy = this.util.text(0, -50, "Easy", px);
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
    const med = this.util.text(0, 0, "Medium", px);
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

    const hard = this.util.text(0, 50, "Hard", px);
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
      this.util.hoverTween(child);
    });
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
    const winText = this.util.text(
      500,
      250,
      "Nest Destroyed!",
      "80px",
      undefined,
      0.5
    );

    this.tweens.add({
      targets: winText,
      y: winText.y - 20,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    const menu = this.util.text(500, 500, "Main Menu", "30px", undefined, 0.5);
    menu.on("pointerdown", () => {
      this.scene.start("MainMenu");
    });

    this.util.hoverTween(menu);

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
    this.util = new MenuUtil(this);
  }

  create() {
    this.cameras.main.setPostPipeline("crt");
    this.createTable();
    this.util.backButton();

    const title = this.util.text(400, 100, "Bestiary", "80px");
    this.info = this.util.text(375, 500, "Info", "30px", undefined, 0.5);
    this.info.visible = false;
  }

  createTable() {
    const px = 24;
    const W = this.scale.width;
    const H = this.scale.height;

    const enemies = [
      {
        key: "vectoidGreen",
        name: "Bumper",
        info: "Threat: Low\nAbility: Stun",
      },
      { key: "vectoidBlue", name: "Hunter", info: "2" },
      { key: "vectoidYellow", name: "Slimer", info: "3" },
      { key: "vectoidGray", name: "Roller", info: "4" },
      { key: "vectoidPurple", name: "Sniper", info: "5" },
      { key: "vectoidOrange", name: "Flamer", info: "6" },
      { key: "vectoidAqua", name: "Deflector", info: "7" },
      { key: "vectoidOlive", name: "Absorber", info: "8" },
      { key: "vectoidBluev2", name: "Hunter v2", info: "9" },
    ];

    const startX = W / 4;
    const startY = H / 4;
    const spacing = H / 12;

    enemies.forEach((enemy, index) => {
      const y = startY + index * spacing;

      const image = this.add.image(startX, y, enemy.key).setOrigin(0.5, 0.5);
      this.tween(image);
      /*if (enemy.name === "Hunter v2") {
        image.setScale(0.1);
      }*/

      const text = this.util.text(W / 3.5, y - 10, enemy.name, px);
      this.util.hoverTween(text);

      const info = this.util.text(W / 2, H / 2, enemy.info, px, undefined, 0.5);
      info.visible = false;

      text.on("pointerover", () => {
        info.setText(enemy.info);
        info.visible = true;
      });
      text.on("pointerout", () => {
        info.visible = false;
      });
    });
  }

  tween(targets) {
    this.tweens.add({
      targets: targets,
      angle: 360,
      duration: 4000,
      repeat: -1,
      ease: "linear",
    });
  }
}
export class Rewards extends Phaser.Scene {
  constructor() {
    super({
      key: "Rewards",
    });

    this.util = new MenuUtil(this);
  }

  create() {
    this.cameras.main.setPostPipeline("crt");
    this.util.backButton();
    this.add
      .text(500, 100, "Rewards:", {
        fontSize: "80px",
        fontFamily: "VT323, monospace",
        fill: "#24c50a",
      })
      .setOrigin(0.5, 0.5);

    this.account = this.add
      .text(250, 200, `฿ounty Points: ${this.registry.get("currency") || 0}`, {
        fontSize: "28px",
        fontFamily: "VT323, monospace",
        fill: "#24c50a",
      })
      .setOrigin(0.5, 0.5);

    this.add
      .text(150, 240, `€ems: ${this.registry.get("gems") || 1}`, {
        fontSize: "28px",
        fontFamily: "VT323, monospace",
        fill: "#24c50a",
      })
      .setOrigin(0.5, 0.5);

    this.lockednuke = this.util.text();

    this.nuke = this.add
      .text(
        500,
        450,
        `Nuke\nCost: ฿50\nOwned: ${this.registry.get("nuke") || 0}/`,
        {
          fontSize: "28px",
          fontFamily: "VT323, monospace",
          fill: "#24c50a",
        }
      )
      .setOrigin(0.5, 0.5)
      .setInteractive();

    //this.nuke.setVisible = false;

    this.buyButton = this.util.text(
      500,
      510,
      "Purchase",
      "28px",
      undefined,
      0.5
    );

    this.nukeIcon = this.add.image(500, 360, "nukeIcon").setScale(0.1);
    
    this.tweens.add({
      targets: this.nukeIcon,
      alpha: { from: 1, to: 0.2 },
      duration: 150,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.buyButton.on("pointerdown", () => {
      this.purchase("currency", 50, 2);
    });

    this.util.hoverTween(this.buyButton);
  }

  purchase(currency, cost, inv) {
    const current = this.registry.get(currency) || 0;
    const currentInv = this.registry.get("nuke") || 0;

    if (current >= 50 && currentInv < inv) {
      this.registry.set("currency", current - cost);
      this.registry.set("nuke", currentInv + 1);
      const registryData = this.registry.values;
      localStorage.setItem("marboidsSave", JSON.stringify(registryData));
    }
  }

  update() {
    const currentAcc = this.registry.get("currency") || 0;
    this.account.setText(`฿ounty Points: ${currentAcc}`);
    const currentNuke = this.registry.get("nuke") || 0;
    this.nuke.setText(`Nuke\nCost: 50\nOwned: ${currentNuke}`);
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
    const px = "32px";
    const loseText = this.util.text(375, 200, "YOU DIED", "80px");

    const skull = this.add.image(500, 150, "skull").setScale(0.1).setDepth(-1);

    const menu = this.util.text(500, 500, "Main Menu", px, undefined, 0.5);

    menu.on("pointerdown", () => {
      this.bgMusic = this.game.bgMusic;
      this.bgMusic.setDetune(0);
      this.scene.start("MainMenu");
    });
    const finalScore = this.registry.get("finalScore");
    this.util.text(500, 400, `Final Score: ${finalScore}`, px, undefined, 0.5);

    const highScore = this.registry.get("highScore") || 0;
    const hsPopup = this.util
      .text(590, 380, `New High Score!`, "20px", "#c50a0aff", 0.5)
      .setRotation(Math.PI / 8);

    if (finalScore > highScore) {
      hsPopup.visible = true;
    } else {
      hsPopup.visible = false;
    }

    this.tweens.add({
      targets: [loseText, hsPopup, skull],
      y: (target) => target.y - 20,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.lose6 = this.add
      .text(900, 300, `...Game Over...`, {
        fontSize: "32px",
        fontFamily: "VT323, monospace",
        fill: "#c50a0aff",
      })
      .setOrigin(0.5, 0.5);

    this.lose5 = this.add
      .text(700, 300, `...Game Over...`, {
        fontSize: "32px",
        fontFamily: "VT323, monospace",
        fill: "#c50a0aff",
      })
      .setOrigin(0.5, 0.5);

    this.lose4 = this.util.text(
      500,
      300,
      `...Game Over...`,
      px,
      "#c50a0aff",
      0.5
    );

    this.lose3 = this.add
      .text(300, 300, `...Game Over...`, {
        fontSize: "32px",
        fontFamily: "VT323, monospace",
        fill: "#c50a0aff",
      })
      .setOrigin(0.5, 0.5);

    this.lose2 = this.add
      .text(100, 300, `...Game Over...`, {
        fontSize: "32px",
        fontFamily: "VT323, monospace",
        fill: "#c50a0aff",
      })
      .setOrigin(0.5, 0.5);

    this.lose1 = this.add
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
    ];
    this.util.hoverTween(menu);
    this.util.scrollBar(this.arr);
  }

  update() {
    this.util.scrollBarUpdate(this.arr);
  }
}

export class Challenge extends Phaser.Scene {
  constructor() {
    super({
      key: "Challenge",
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
    const px = "30px";
    this.util.text(500, 100, "Challenges", "80px", undefined, 0.5);

    const skirmish = this.util.text(500, 3, "TIME CHALLENGE", px);
    skirmish.on("pointerdown", () => {
      this.scene.start("Nest", { nestSize: 50 });
    });

    this.util.backButton();
    this.util.hoverTween(skirmish);
    //Time Challenge: Finish a nest under a certain amount of time
    //Challegen Arena: Finish a nest with only leaping enemies coming at you.
    //Combo CountDown: Finish a nest while keeping up a combo.
  }

  update() {}
}
