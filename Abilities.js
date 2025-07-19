export class Abilities {
  constructor(user, target) {
    this.user = user;
    this.target = target;
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

    if (range > 200 || angleDiff > Math.PI / 4) {
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
    } else {
      //leap at target
      //user.rotation = targetAngle <-- potential feature, snaps to player location
      user.timers.attackTimer = 30;
      user.machine.state = "attacking";
    }
  }

  dumb() {}

  //Attacking Methods:
  blue() {}

  aqua() {}

  purple() {}
}
