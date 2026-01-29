export class MenuUtil {
  constructor(scene) {
    this.scene = scene;
  }

  hoverTween(target) {
    if (Array.isArray(target)) {
      target.forEach((t) => this.hoverTween(t));
      return;
    }

    target.on("pointerover", () => {
      this.scene.tweens.killTweensOf(target);
      this.scene.tweens.add({
        targets: target,
        scale: 1.2,
        duration: 200,
        ease: "Sine.easeOut",
      });
      target.setStyle({ fill: "#c50a0aff" });
    });

    target.on("pointerout", () => {
      this.scene.tweens.killTweensOf(target);
      this.scene.tweens.add({
        targets: target,
        scale: 1,
        duration: 200,
        ease: "Sine.easeIn",
      });
      target.setStyle({ fill: "#24c50a" });
    });
    target.on("pointerdown", () => {
      this.scene.tweens.killTweensOf(target);
      this.scene.tweens.add({
        targets: target,
        scale: 1,
        duration: 100,
        yoyo: true,
        ease: "Sine.easeIn",
      });
    });
  }

  text(x, y = 200, message = "message", size, color = "#24c50a", origin = 0) {
    const text = this.scene.add
      .text(x, y, message, {
        fontSize: size,
        fontFamily: "VT323, monospace",
        fill: color,
      })
      .setOrigin(origin, origin)
      .setInteractive();
    return text;
  }

  scrollBar(arr = []) {
    arr.forEach((item) => {
      this.scene.physics.add.existing(item);
      item.body.setVelocityX(100);
    });  
  }

  scrollBarUpdate(arr) {
    arr.forEach((item) => {
      if (item.x > 1100) {
        item.x = -200;
      }
    });
  }

  backButton() {
    const backButton = this.scene.add
      .text(100, 150, "<-", {
        fontSize: "24px",
        fontFamily: "VT323, monospace",
        fontStyle: "bold",
        fill: "#24c50a",
      })
      .setOrigin(0.5, 0.5)
      .setInteractive();
    backButton.on("pointerdown", () => {
      this.scene.scene.start("MainMenu");
    });

    this.hoverTween(backButton);

    const escape = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );
    escape.on("down", () => {
      this.scene.scene.start("MainMenu");
    });
  }

  purchase() {}

  debug(targets = []) {
    targets.forEach((target) => {
      const debugGraphics = this.scene.add.graphics();
      debugGraphics.lineStyle(2, 0xff0000, 1); // Red outline
      const bounds = target.getBounds();
      debugGraphics.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      debugGraphics.fillStyle(0xff0000, 1);
      debugGraphics.fillCircle(target.x, target.y, 2);
    });
  }
}
