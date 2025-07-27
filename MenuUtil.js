export class MenuUtil {
  constructor(scene) {
    this.scene = scene;
  }
  addMenuHoverTween(target) {
    target.on("pointerover", () => {
      this.scene.tweens.killTweensOf(target);
      this.scene.tweens.add({
        targets: target,
        scale: 1.2,
        duration: 200,
        ease: "Sine.easeOut",
      });
      target.setStyle({fill: "#c50a0aff"})
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

  scrollBar(arr = []) {
    console.log(arr)
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
}
