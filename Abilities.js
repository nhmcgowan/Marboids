export class Abilities {
  constructor(user) {
    this.user = user;
  }

  //Movement Methods:
  homing(user, target) {
    //targeting parameters: distance and angle:
    const range = Phaser.Math.Distance.Between(
      user.x,
      user.y,
      target.x,
      target.y
    );
    const targetAngle = Phaser.Math.Angle.Between(
      user.x,
      user.y,
      target.x,
      target.y
    );

    let angleDiff = Phaser.Math.Angle.Wrap(targetAngle - user.rotation);
    angleDiff = Math.abs(angleDiff);

    if (range > user.combat.attackRange || angleDiff > Math.PI / 6) {
      //slowly rotate towards targetAngle
      user.rotation = Phaser.Math.Angle.RotateTo(
        user.rotation,
        targetAngle,
        user.movement.turnRate
      );
      //go:
      user.setVelocity(
        Math.cos(user.rotation) * user.movement.speed,
        Math.sin(user.rotation) * user.movement.speed
      );
    } else if (user.meta.name === "Blue") {
      /*let chance = Phaser.Math.Between(0, 1);
      if (chance > 0) {
        user.rotation = targetAngle;
      } <-- potential feature, snaps to player location */
      user.timers.attackTimer = 30;
      user.machine.state = "attacking";
    }
  }

  specNuke() {
    if (this.user.spec.nuke > 0) {
      this.user.scene.cameras.main.shake(200, 0.01);
      this.user.spec.nuke--;
      this.user.scene.registry.set("nuke", this.user.spec.nuke);
      this.user.scene.enemies.children.iterate((enemy) => {
        if (enemy.machine.state != "dead") {
          this.user.scene.events.emit("enemyKilled", enemy);
          enemy.machine.state = "dead";
          this.user.scene.score += enemy.meta.value;
          this.user.scene.nestSize -= enemy.meta.value;
          this.user.scene.utility.scorePopup(
            enemy.x,
            enemy.y,
            enemy.meta.value
          );
        }
      });
    }
  }

  specTeleport(target) {
    this.user.setPosition(target.x, target.y);
    if (!this.user.scene.dodgeSound.isPlaying) {
      this.user.scene.dodgeSound.play();
    }
  }
}
