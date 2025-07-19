export class MainMenu extends Phaser.Scene {
  constructor() {
    super({
      key: "MainMenu",
    });

    this.highScore = 0;
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

  addMenuHoverTween(target, originalY, offset = 20, duration = 1000) {
    target.on("pointerover", () => {
      this.tweens.killTweensOf(target);
      this.tweens.add({
        targets: target,
        y: originalY - offset,
        duration: duration,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    });
    target.on("pointerout", () => {
      this.tweens.killTweensOf(target);
      this.tweens.add({
        targets: target,
        y: originalY,
        duration: 200,
        ease: "Sine.easeIn",
      });
    });
  }

  create() {
    this.add
      //Title:
      .text(502, 102, "Marboid Arena", {
        fontSize: "64px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "italic bold",
        fill: "#000000",
      })
      .setOrigin(0.5, 0.5);

    this.add
      .text(500, 100, "Marboid Arena", {
        fontSize: "64px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "italic bold",
        fill: "#db2450",
      })
      .setOrigin(0.5, 0.5);

    //Start Button:
    this.add
      .text(502, 302, "Play", {
        fontSize: "48px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#000000",
      })
      .setOrigin(0.5, 0.5);
    const play = this.add
      .text(500, 300, "Play", {
        fontSize: "48px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#db2450",
      })
      .setOrigin(0.5, 0.5)
      .setInteractive();
    //Bestiary:
    this.add
      .text(502, 402, "Bestiary", {
        fontSize: "48px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#000000",
      })
      .setOrigin(0.5, 0.5);

    const bestiary = this.add
      .text(500, 400, "Bestiary", {
        fontSize: "48px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#db2450",
      })
      .setOrigin(0.5, 0.5)
      .setInteractive();
    bestiary.on("pointerdown", () => {
      this.scene.start("Bestiary");
    });

    this.add
      .text(502, 502, "Rewards", {
        fontSize: "48px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#000000",
      })
      .setOrigin(0.5, 0.5);
    const rewards = this.add
      .text(500, 500, "Rewards", {
        fontSize: "48px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#db2450",
      })
      .setOrigin(0.5, 0.5)
      .setInteractive();
    rewards.on("pointerdown", () => {
      this.scene.start("Rewards");
    });

    this.add
      .text(502, 602, "Achievements", {
        fontSize: "48px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#000000",
      })
      .setOrigin(0.5, 0.5);
    const achievements = this.add
      .text(500, 600, "Achievements", {
        fontSize: "48px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#db2450",
      })
      .setOrigin(0.5, 0.5)
      .setInteractive();
    achievements.on("pointerdown", () => {
      this.scene.start("Achievements");
    });

    const highScore = this.registry.get("highScore") || 0;
    this.add
      .text(152, 202, `High Score: ${highScore}`, {
        fontSize: "32px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#000000",
      })
      .setOrigin(0.5, 0.5);
    this.add
      .text(150, 200, `High Score: ${highScore}`, {
        fontSize: "32px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#db2450",
      })
      .setOrigin(0.5, 0.5);

    //hoverAnim:
    this.addMenuHoverTween(play, play.y);
    this.addMenuHoverTween(bestiary, bestiary.y);
    this.addMenuHoverTween(rewards, rewards.y);
    this.addMenuHoverTween(achievements, achievements.y);
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
      .text(500, 250, "NEST DESTROYED", {
        fontSize: "48px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#db2450",
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
        fontSize: "24px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#db2450",
      })
      .setOrigin(0.5, 0.5)
      .setInteractive();
    menu.on("pointerdown", () => {
      this.scene.start("MainMenu");
    });
    const finalScore = this.registry.get("finalScore");
    this.add
      .text(500, 400, `Final Score: ${finalScore}`, {
        fontSize: "24px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#db2450",
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
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#db2450",
      })
      .setOrigin(0.5, 0.5);

    const backButton = this.add
      .text(100, 50, "<", {
        fontSize: "24px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#db2450",
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
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#db2450",
      })
      .setOrigin(0.5, 0.5)
      .setInteractive();
    backButton.on("pointerdown", () => {
      this.scene.start("MainMenu");
    });
    this.add
      .text(502, 102, "Rewards:", {
        fontSize: "48px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#000000",
      })
      .setOrigin(0.5, 0.5);
    this.add
      .text(500, 100, "Rewards:", {
        fontSize: "48px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#db2450",
      })
      .setOrigin(0.5, 0.5);
    this.add
      .text(152, 202, `Reward Coins: ${this.registry.get("currency") || 0}`, {
        fontSize: "28px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#000000",
      })
      .setOrigin(0.5, 0.5);
    this.add
      .text(150, 200, `Reward Coins: ${this.registry.get("currency") || 0}`, {
        fontSize: "28px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#db2450",
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
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#db2450",
      })
      .setOrigin(0.5, 0.5);

    const menu = this.add
      .text(500, 500, "Main Menu", {
        fontSize: "24px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#db2450",
      })
      .setOrigin(0.5, 0.5)
      .setInteractive();
    menu.on("pointerdown", () => {
      this.scene.start("MainMenu");
    });
    const finalScore = this.registry.get("finalScore");
    this.add
      .text(500, 400, `Final Score: ${finalScore}`, {
        fontSize: "24px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#db2450",
      })
      .setOrigin(0.5, 0.5);

    const highScore = this.registry.get("highScore") || 0;
    const hsPopup = this.add
      .text(582, 400, `New High Score!`, {
        fontSize: "16px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#db2450",
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
