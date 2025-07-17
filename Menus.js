export class MainMenu extends Phaser.Scene {
  constructor() {
    super({
      key: "MainMenu",
    });

    this.highScore = 0;
  }

  preload() {
    this.load.image("startButton", "./assets/startButton.png");
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

    //Start Button
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
    play.on("pointerdown", () => {
      this.scene.start("Nest");
    });

    //Bestiary:
    this.add
      .text(502, 402, "Bestiary", {
        fontSize: "48px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#000000",
      })
      .setOrigin(0.5, 0.5);

    const Bestiary = this.add
      .text(500, 400, "Bestiary", {
        fontSize: "48px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#db2450",
      })
      .setOrigin(0.5, 0.5)
      .setInteractive();
    Bestiary.on("pointerdown", () => {
      this.scene.start("Bestiary");
    });

    const highScore = this.registry.get("highScore") || 0; // Default to 0 if no high score exists
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
      .text(500,500, "Main Menu", {
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
    this.tweens.add({
      targets: loseText,
      y: loseText.y - 20,
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


