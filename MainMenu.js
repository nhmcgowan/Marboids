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

    this.add
      .text(502, 252, "Main Menu", {
        fontSize: "48px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#000000",
      })
      .setOrigin(0.5, 0.5);

    this.add
      .text(500, 250, "Main Menu", {
        fontSize: "48px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#db2450",
      })
      .setOrigin(0.5, 0.5);

    //Start Button
    const startButton = this.add
      .image(500, 400, "startButton")
      .setInteractive();
    startButton.on("pointerdown", () => {
      this.scene.start("Nest");
    });

    const highScore = this.registry.get("highScore") || 0; // Default to 0 if no high score exists
    this.add.text(500, 300, `High Score: ${highScore}`, {
      fontSize: "32px",
      fontFamily: "'Nunito Sans', sans-serif",
      fill: "#db2450",
    }).setOrigin(0.5, 0.5);
  }
}

export class Win extends Phaser.Scene {
  constructor() {
    super({
      key: "Win",
    });
  }

  preload() {}

  create() {
    this.add
      .text(500, 250, "NEST DESTROYED", {
        fontSize: "48px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#db2450",
      })
      .setOrigin(0.5, 0.5);

      const startButton = this.add
        .image(500, 400, "startButton")
        .setInteractive();
      startButton.on("pointerdown", () => {
        this.scene.start("Nest");
      });
  }

  update() {}
}
