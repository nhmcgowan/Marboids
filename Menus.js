import { Util } from "./Util.js";
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
    this.utility = new Util(this);
    
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

  preload() {}

  debugGraphics(target = []) {
    const debugGraphics = this.add.graphics();
    debugGraphics.lineStyle(2, 0xff0000, 1); // Red outline
    const bounds = target.getBounds();
    debugGraphics.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    debugGraphics.fillStyle(0x00ff00, 1);
    debugGraphics.fillCircle(target.x, target.y, 2);
  }

  addMenuHoverTween(target) {
    target.on("pointerover", () => {
      this.tweens.killTweensOf(target);
      this.tweens.add({
        targets: target,
        scale: 1.2,
        duration: 200,
        ease: "Sine.easeOut",
      });
    });

    target.on("pointerout", () => {
      this.tweens.killTweensOf(target);
      this.tweens.add({
        targets: target,
        scale: 1,
        duration: 200,
        ease: "Sine.easeIn",
      });
    });
    target.on("pointerdown", () => {
      this.tweens.killTweensOf(target);
      this.tweens.add({
        targets: target,
        scale: 1,
        duration: 100,
        yoyo: true,
        ease: "Sine.easeIn",
      });
    });
  }

  create() {
    this.popup = false;
    const title1 = this.add
      .text(450, 100, "Vectoid", {
        fontSize: "64px",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "italic bold",
        fill: "#4a8525",
      })
      .setOrigin(0.5, 0.5);

    const title2 = this.add
      .text(title1.x + 180, 75, "Arena", {
        fontSize: "32px",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "italic bold",
        fill: "#4a8525",
      })
      .setOrigin(0.5, 0.5);
    this.tweens.add({
      targets: title2,
      scale: 1.2,
      duration: 200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    const play = this.add
      .text(600, 300, "Play", {
        fontSize: "48px",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "bold",
        fill: "#4a8525",
      })
      .setInteractive();
    play.on("pointerdown", () => {
      if (this.popup === false) {
        this.modeConfig();
      } else {
        this.closeConfig();
      }
    });

    const bestiary = this.add
      .text(600, 400, "Bestiary", {
        fontSize: "48px",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "bold",
        fill: "#4a8525",
      })
      .setInteractive();
    bestiary.on("pointerdown", () => {
      this.scene.start("Bestiary");
    });

    const rewards = this.add
      .text(600, 600, "Rewards", {
        fontSize: "48px",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "bold",
        fill: "#4a8525",
      })
      .setInteractive();
    rewards.on("pointerdown", () => {
      this.scene.start("Rewards");
    });

    const achievements = this.add
      .text(600, 500, "Achievements", {
        fontSize: "48px",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "bold",
        fill: "#4a8525",
      })
      .setInteractive();
    achievements.on("pointerdown", () => {
      this.scene.start("Achievements");
    });
    //hoverAnims:
    this.addMenuHoverTween(play, play.y);
    this.addMenuHoverTween(bestiary, bestiary.y);
    this.addMenuHoverTween(rewards, rewards.y);
    this.addMenuHoverTween(achievements, achievements.y);
    this.statsBar();

    this.easyInfo = this.add
      .text(400, 500, "150 Enemies. EZ-PZ.", {
        fontSize: "30px",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "bold",
        fill: "#4a8525",
      })
      .setOrigin(0.5, 0.5);
    this.easyInfo.visible = false;
  }

  statsBar() {
    const totalDeaths = this.registry.get("totalDeaths") || 0;
    const highScore = this.registry.get("highScore") || 0;
    const wins = this.registry.get("wins") || 0;
    this.hiScore = this.add.text(150, 200, `High Score: ${highScore}`, {
      fontSize: "32px",
      fontFamily: "Consolas, 'Courier New', monospace",
      fontStyle: "italic bold",
      fill: "#4a8525",
    });

    this.deaths = this.add.text(-50, 200, `Deaths: ${totalDeaths}`, {
      fontSize: "32px",
      fontFamily: "Consolas, 'Courier New', monospace",
      fontStyle: "italic bold",
      fill: "#4a8525",
    });

    this.wins = this.add.text(-210, 200, `Wins: ${wins}`, {
      fontSize: "32px",
      fontFamily: "Consolas, 'Courier New', monospace",
      fontStyle: "italic bold",
      fill: "#4a8525",
    });

    this.statsArr = [this.hiScore, this.deaths, this.wins];

    this.statsArr.forEach((stat) => {
      this.physics.add.existing(stat);
      stat.body.setVelocityX(100);
    });
  }

  update() {
    this.statsArr.forEach((stat) => {
      if (stat.x > 1000) {
        stat.x = -200;
      }
    });
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
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "bold",
        fill: "#4a8525",
      })
      .setInteractive();
    skirmish.on("pointerdown", () => {
      this.nestConfig();
      this.modeconFig.destroy();
    });

    const endless = this.add
      .text(0, -0, "Endless", {
        fontSize: "30px",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "bold",
        fill: "#4a8525",
      })
      .setInteractive();
    endless.on("pointerdown", () => {
      this.scene.start("Nest", {nestSize: 10000})
    }); 

    const campaign = this.add
      .text(0, 50, "Campaign", {
        fontSize: "30px",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "bold",
        fill: "#4a8525",
      })
      .setInteractive();
    campaign.on("pointerdown", () => {});

    this.modeconFig.add([skirmish, endless, campaign]);

    this.modeconFig.list.forEach((child) => {
      this.addMenuHoverTween(child);
    });
  }

  nestConfig() {
    this.config = this.add.container(300, 375);
    const easy = this.add
      .text(0, -50, "Easy", {
        fontSize: "30px",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "bold",
        fill: "#4a8525",
      })
      .setInteractive();
    easy.on("pointerdown", () => {
      this.scene.start("Nest", { nestSize: 150 });
    });
    easy.on("pointerover", () => {
      this.easyInfo.visible = true;
    });
    easy.on("pointerout", () => {
      this.easyInfo.visible = false;
    });
    const med = this.add
      .text(0, 0, "Medium", {
        fontSize: "30px",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "bold",
        fill: "#4a8525",
      })
      .setInteractive();
    med.on("pointerdown", () => {
      this.scene.start("Nest", { nestSize: 250 });
    });

    const hard = this.add
      .text(0, 50, "Hard", {
        fontSize: "30px",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "bold",
        fill: "#4a8525",
      })
      .setInteractive();
    hard.on("pointerdown", () => {
      this.scene.start("Nest", { nestSize: 500 });
    });
    this.config.add([easy, med, hard]);

    this.config.list.forEach((child) => {
      this.addMenuHoverTween(child);
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
  }

  create() {
    const winText = this.add
      .text(500, 250, "Nest Destroyed", {
        fontSize: "48px",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "italic bold",
        fill: "#4a8525",
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
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "bold",
        fill: "#4a8525",
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
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "bold",
        fill: "#4a8525",
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
    this.add
      .text(500, 500, "-Bumper-", {
        fontSize: "24px",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "bold",
        fill: "#4a8525",
      })
      .setOrigin(0.5, 0.5);

    const backButton = this.add
      .text(100, 50, "<", {
        fontSize: "24px",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "bold",
        fill: "#4a8525",
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
    const backButton = this.add
      .text(50, 50, "<", {
        fontSize: "48px",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "bold",
        fill: "#4a8525",
      })
      .setOrigin(0.5, 0.5)
      .setInteractive();
    backButton.on("pointerdown", () => {
      this.scene.start("MainMenu");
    });
    this.add
      .text(502, 102, "Rewards:", {
        fontSize: "48px",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "bold",
        fill: "#000000",
      })
      .setOrigin(0.5, 0.5);
    this.add
      .text(500, 100, "Rewards:", {
        fontSize: "48px",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "bold",
        fill: "#4a8525",
      })
      .setOrigin(0.5, 0.5);
    this.add
      .text(152, 202, `Reward Coins: ${this.registry.get("currency") || 0}`, {
        fontSize: "28px",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "bold",
        fill: "#000000",
      })
      .setOrigin(0.5, 0.5);
    this.add
      .text(150, 200, `Reward Coins: ${this.registry.get("currency") || 0}`, {
        fontSize: "28px",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "bold",
        fill: "#4a8525",
      })
      .setOrigin(0.5, 0.5);
  }
}

export class GameOver extends Phaser.Scene {
  constructor() {
    super({
      key: "GameOver",
    });
  }
  create() {
    const loseText = this.add
      .text(500, 250, "YOU DIED", {
        fontSize: "48px",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "italic bold",
        fill: "#4a8525",
      })
      .setOrigin(0.5, 0.5);

    const menu = this.add
      .text(500, 500, "Main Menu", {
        fontSize: "30px",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "bold",
        fill: "#4a8525",
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
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "bold",
        fill: "#4a8525",
      })
      .setOrigin(0.5, 0.5);

    const highScore = this.registry.get("highScore") || 0;
    const hsPopup = this.add
      .text(582, 400, `New High Score!`, {
        fontSize: "16px",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "bold",
        fill: "#4a8525",
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
  }
}
