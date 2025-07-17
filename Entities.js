import { Abilities } from "./Abilities.js";
/*List of Bugs to squash:
  Gray colliding with Orange Corpse
  Yellow corpse hitbox causing slows prematurely <- adjust spawn edge
  Features:
  Ammo factory for Purple
   
  */
export class Entity extends Phaser.Physics.Arcade.Sprite {
  constructor(
    scene,
    x,
    y,
    texture,
    {
      //Defualt Configuration:
      setCircle = 16,
      setCollideWorldBounds = false,
      speed = 180,
      effectTimer = 0,
      substate = null,
      effect = null,
      state ="moving",
      invulnerable = false,
      threat = 1,
      spawnAngle = 0,
      turnRate = 0.02,
      value = 1,
      attackTimer = 0,
      coolDown = 0,
      initFrames = 5,
    } = {}
  ) {
    super(scene, x, y, texture);
    //Sprite:
    scene.physics.add.existing(this);
    scene.add.existing(this);
    this.setCollideWorldBounds(setCollideWorldBounds);
    this.body.setCircle(setCircle);
    this.setBounce(1, 1);
    this.movement = {
      speed: speed,
      turnRate: turnRate,
    };

    this.init = {
      initFrames: initFrames,
      spawnAngle: spawnAngle,
    };
    this.machine = {
      state: state,
      substate: substate,
      effect: effect,
      invulnerable: invulnerable,
    };
    this.meta = {
      threat: threat,
      value: value
    }
    this.timers = {
      attackTimer: attackTimer,
      coolDown: coolDown,
      effectTimer: effectTimer,
    };
    this.ability = new Abilities(this);
  }
}

export class Hitbox extends Entity {
  constructor(){
  super({
    setCircle: 5
    }) 
  }
}

export class Player extends Entity {
  constructor(scene, x, y) {
    //Sprite Registry:
    super(scene, x, y, "enemyBlue", {
      setCollideWorldBounds: true,
      speed: 240,
    });
    //--HitBoxes--:
    //Matter.js :
    this.sword = scene.matter.add.sprite(400, 300, "sword", null, {
      shape: {
        type: "rectangle",
        width: 15,
        height: 150,
        y: -75,
      },
      ignoreGravity: true,
      collisionFilter: {
        group: -1,
      },
    });
    this.sword.body.mass = 0.0001;
    this.sword.body.frictionAir = 0.1;
    this.sword.setOrigin(0.5, 1);
    //Arcade Hitboxes:
    this.hitbox1 = scene.physics.add.sprite(
      this.sword.x,
      this.sword.y,
      "enemyGreen"
    );
    this.hitbox2 = scene.physics.add.sprite(
      this.sword.x,
      this.sword.y,
      "enemyBlue"
    );
    this.hitbox3 = scene.physics.add.sprite(
      this.sword.x,
      this.sword.y,
      "enemyOrange"
    );

    //Sword Tip:
    this.hitbox1.body.setCircle(10);
    this.hitbox1.visible = false;
    //Sword Mid:
    this.hitbox2.body.setCircle(10);
    this.hitbox2.visible = false;
    //Sword Base:
    this.hitbox3.body.setCircle(10);
    this.hitbox3.visible = false;

    //hitboxes group:
    this.hitboxes = scene.physics.add.group([
      this.hitbox1,
      this.hitbox2,
      this.hitbox3,
    ]);
    this.hitbox3.body.enable = false;
    this.hitbox2.body.enable = false;
    this.hitbox1.body.enable = false;
  }

  onCollide(enemy) {
    if (enemy.machine.effect && this.machine.state !== enemy.machine.effect) {
      this.machine.state = enemy.machine.effect;
    }
  }

  onHit(enemy) {
    //Check if Kill:
    if (enemy.machine.state !== "dead" && enemy.machine.invulnerable === false) {
      enemy.machine.state = "dead";
      enemy.timers.effectTimer = 300;
      //Handle scoreing and check if nest is completed:
      this.scene.score += enemy.meta.value;
      this.scene.nestSize--;
      this.scene.enemiesLeft.setText("Marboids Left: " + this.scene.nestSize)
      this.scene.scoreText.setText("Score " + this.scene.score);
      if (this.scene.nestSize <= 0) {
        this.scene.events.emit("win");
      }
    }
    //Deflected:
    if (enemy.machine.substate === "deflect" && this.machine.state != "stunned") {
      this.machine.state = "stunned";
      this.sword.setAngularVelocity(1);
      this.timers.effectTimer = 30;
    }
    //Deflect Aqua:
    if (enemy instanceof Aqua && enemy.machine.invulnerable === true) {
      enemy.rotation += Math.PI / 2;
    }
  }

  update(target) {
    //hitbox positioning:
    const halfHeight = this.sword.displayHeight / 2;
    const setAngle = this.sword.rotation;
    const offsets = [30, 0, -30];
    const hitboxes = [this.hitbox1, this.hitbox2, this.hitbox3];
    offsets.forEach((offset, i) => {
      const x = this.sword.x + Math.sin(setAngle) * (halfHeight + offset);
      const y = this.sword.y - Math.cos(setAngle) * (halfHeight + offset);
      hitboxes[i].setPosition(x, y);
    });
    //slowed machine.substate:
    if (this.machine.substate == "slowed" && this.timers.effectTimer > 0) {
      this.movement.speed = this.movement.speed = 120;
      this.timers.effectTimer--;
    } else {
      this.machine.substate = null;
      this.movement.speed = 240;
    }
    //safety for glitchy attack animation:
    if (this.machine.state !== "attacking") {
      this.hitboxes.children.iterate((hitbox) => {
        hitbox.body.enable = false;
      });
      this.timers.attackTimer = 0;
    }
    if (this.timers.coolDown > 0) {
      this.timers.coolDown--;
    }

    switch (this.machine.state) {
      case "moving":
        this.sword.setRotation(this.rotation);
        this.sword.setPosition(this.x, this.y);
        const angle = Phaser.Math.Angle.Between(
          this.x,
          this.y,
          target.worldX,
          target.worldY
        );
        this.setRotation(angle + Math.PI);
        const distance = Phaser.Math.Distance.Between(
          this.x,
          this.y,
          target.worldX,
          target.worldY
        );
        if (distance > 10) {
          this.scene.physics.moveTo(
            this,
            target.worldX,
            target.worldY,
            this.movement.speed
          );
        } else {
          this.setVelocity(0, 0);
        }
        break;
      case "attacking":
        if (this.timers.attackTimer > 15) {
          this.hitboxes.children.iterate((hitbox) => {
            hitbox.body.enable = true;
          });
          this.timers.attackTimer--;
          this.setVelocity(0, 0);
          this.sword.setAngularVelocity(-0.2);
        }
        //Sword Reset/CoolDown:
        if (this.timers.attackTimer <= 15 && this.timers.attackTimer > 0) {
          this.hitboxes.children.iterate((hitbox) => {
            hitbox.body.enable = false;
          });
          this.sword.setAngularVelocity(0);
          this.timers.attackTimer--;
        }
        if (this.timers.attackTimer === 0) {
          this.machine.state = "moving";
          this.timers.attackTimer = 0;
          this.timers.coolDown = 5;
        }
        break;
      case "stunned":
        this.setVelocity(0, 0);
        this.timers.effectTimer--;
        if (this.timers.effectTimer <= 0) {
          this.machine.state = "moving";
        }
        break;
      case "dead":
        this.scene.events.emit("playerDied");
        break;
    }
  }
}
//Slime
export class Green extends Entity {
  constructor(scene, x, y) {
    //Sprite Registry:
    super(scene, x, y, "enemyGreen", {
      state: "init",
      effect: "stunned",
    });
  }

  onCollide(object) {
    if (object.machine.effect === "dead") {
      this.machine.state = object.machine.effect;
    }
    if (object instanceof Player) {
      object.machine.state = this.machine.effect;
      object.timers.effectTimer = 60;
    }
  }

  update() {
    if (this.machine.substate == "slowed" && this.timers.effectTimer > 0) {
      this.movement.speed = this.movement.speed = 90;
      this.timers.effectTimer--;
    } else {
      this.machine.substate = null;
      this.movement.speed = 180;
    }
    switch (this.machine.state) {
      case "init":
        this.init.initFrames--;
        this.setVelocity(
          Math.cos(this.init.spawnAngle) * this.movement.speed,
          Math.sin(this.init.spawnAngle) * this.movement.speed
        );
        this.setRotation(this.init.spawnAngle);
        if (this.init.initFrames < 1) {
          this.machine.state = "moving";
        }
        break;
      case "moving":
        //speed and visual angle normalization
        const angle = Math.atan2(this.body.velocity.y, this.body.velocity.x);
        this.setVelocity(
          Math.cos(angle) * this.movement.speed,
          Math.sin(angle) * this.movement.speed
        );
        this.setRotation(angle);
        break;
      case "dead":
        this.destroy();
        break;
    }
  }
}
//Hunter
export class Blue extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "enemyBlue", {
      value: 5,
      attackTimer: 30
    });
  }

  onCollide(object) {
    if (
      object.machine.effect &&
      this.machine.state != object.machine.effect &&
      object.machine.effect != "stunned"
    ) {
      this.machine.state = object.machine.effect;
    }
  }

  update(target) {
    if (this.machine.substate === "slowed" && this.timers.effectTimer > 0) {
      this.movement.speed = 90;
      this.timers.effectTimer--;
    } else {
      this.machine.substate = null;
      this.movement.speed = 180;
    }
    switch (this.machine.state) {
      case "moving":
        this.ability.homing(this, target);
        break;
      case "attacking":
        this.machine.effect = "dead";
        this.timers.attackTimer--;
        this.setVelocity(
          Math.cos(this.rotation) * this.movement.speed * 2,
          Math.sin(this.rotation) * this.movement.speed * 2
        );
        if (this.timers.attackTimer <= 0) {
          this.machine.state = "moving";
          this.machine.effect = null;
        }
        break;
      case "dead":
        this.destroy();
        break;
    }
  }
}
//Fireball
export class Orange extends Entity {
  constructor(scene, x, y) {
    //Sprite Registry:
    super(scene, x, y, "enemyOrange", {
      effect: "dead",
      threat: "medium",
      value: 3,
      turnRate: 0.005
    });
  }

  onCollide(object) {
    if (this.machine.state != "dead") {
      this.machine.state = "dead";
      this.timers.effectTimer = 300;
    }
  }

  update(target) {
    switch (this.machine.state) {
      case "moving":
        //this.ability.homing(this, target);
        //Gather information about the target location:
        const targetAngle = Phaser.Math.Angle.Between(
          this.x,
          this.y,
          target.x,
          target.y
        );

        //start turning visual sprite towards target, calculate that angle and store it in variable
        this.rotation = Phaser.Math.Angle.RotateTo(
          this.rotation,
          targetAngle,
          this.movement.turnRate
        );
        // calculate distance between current location and target
        const distanceTo = Phaser.Math.Distance.Between(
          this.x,
          this.y,
          target.x,
          target.y
        );

        // travel in the direction of the sprite's current direction until it reaches the target
        if (distanceTo > 10) {
          this.setVelocity(
            Math.cos(this.rotation) * this.movement.speed,
            Math.sin(this.rotation) * this.movement.speed
          );
        } else {
          this.setVelocity(0, 0);
        }
        break;
      case "dead":
        this.setVelocity(0, 0);
        this.setTexture("orangeDead");
        this.body.setCircle(32);
        this.timers.effectTimer--;
        if (this.timers.effectTimer < 1) {
          this.destroy();
        }
        break;
    }
  }
}
//Slime
export class Yellow extends Entity {
  constructor(scene, x, y) {
    //Sprite Registry:
    super(scene, x, y, "enemyYellow", {
      state: "init",
      effectTimer: 500,
    });
   
    //hitbox: (enabled on death)
    this.hitbox = scene.physics.add.sprite(this.x, this.y, "yellowDead");
    this.hitbox.body.setCircle(32);
    this.hitbox.body.enable = false;
    this.hitbox.visible = false;
    this.hitbox.owner = this;
  }

  onCollide(object) {
    if (this.machine.state != "dead" && object != this) {
      this.machine.state = "dead";
    }

    if (object.machine.substate != "slowed") {
      object.machine.substate = "slowed";
      object.timers.effectTimer = 150;
    }
  }

  onHit(object) {
    if (object.machine.substate != "slowed") {
      object.machine.substate = "slowed";
      object.timers.effectTimer = 150;
    }
  }

  update() {
    switch (this.machine.state) {
      case "init":
        //initial movement set by spawn. this runs so that "moving" doesn't override immediately
        this.init.initFrames -= 1;
        const initSpeed = 200;
        this.setVelocity(
          Math.cos(this.init.spawnAngle) * initSpeed,
          Math.sin(this.init.spawnAngle) * initSpeed
        );
        this.setRotation(this.init.spawnAngle);
        if (this.init.initFrames < 1) {
          this.machine.state = "moving";
        }
        break;
      case "moving":
        //speed and visual angle normalization
        const angle = Math.atan2(this.body.velocity.y, this.body.velocity.x);
        this.setVelocity(Math.cos(angle) * this.movement.speed, Math.sin(angle) * this.movement.speed);
        this.setRotation(angle);
        break;
      case "dead":
        //place the hitbox over the enemy:
        this.hitbox.setPosition(this.x, this.y);
        //turn on hitbox:
        this.hitbox.visible = true;
        this.hitbox.body.enable = true;
        this.hitbox.body.onOverlap = true;
        //turn off enemy:
        this.visible = false;
        this.body.enable = false;

        //count down to despawn:
        this.timers.effectTimer--;
        if (this.timers.effectTimer < 1) {
          this.destroy();
          this.hitbox.destroy();
        }
        break;
    }
  }
}

//Crush
export class Gray extends Entity {
  constructor(scene, x, y) {
    //Sprite Registry:
    super(scene, x, y, "enemyGray", {
      effect: "dead",
      substate: "deflect",
      threat: "medium",
      invulnerable: true,
      turnRate: 0.005,
      speed: 130,
      setCircle: 32,
      value: 10
    });
  }

  onCollide(object) {
    if (object instanceof Gray) {
      this.rotation += Math.PI / 2;
      this.setTexture("grayDamaged")
      this.machine.invulnerable = false
      this.machine.substate = null
    }
  }

  update(target) {
    switch (this.machine.state) {
      case "moving":
        //Gather information about the target location:
        const targetAngle = Phaser.Math.Angle.Between(
          this.x,
          this.y,
          target.x,
          target.y
        );

        //start turning visual sprite towards target, calculate that angle and store it in variable
        this.rotation = Phaser.Math.Angle.RotateTo(
          this.rotation,
          targetAngle,
          this.movement.turnRate
        );
        // calculate distance between current location and target
        const distanceTo = Phaser.Math.Distance.Between(
          this.x,
          this.y,
          target.x,
          target.y
        );

        // travel in the direction of the sprite's current direction until it reaches the target
        if (distanceTo > 10) {
          this.setVelocity(
            Math.cos(this.rotation) * this.movement.speed,
            Math.sin(this.rotation) * this.movement.speed
          );
        } else {
          this.setVelocity(0, 0);
        }
        break;
      case "dead":
        if (this.machine.invulnerable === false) {
        this.destroy()
      } else {
        this.machine.state = "moving"
      }
        
        break;
    }
  }
}

export class Purple extends Entity {
  constructor(scene, x, y) {
    //Sprite Registry:
    super(scene, x, y, "enemyPurple", {
      coolDown: 180,
      threat: "high",
      value: 5,
      speed: 130,
      turnRate: 0.005
    });
    //Hitbox:
    this.hitbox = scene.physics.add.sprite(this.x, this.y, "enemyBlue");
    this.hitbox.setCircle(5);
    this.hitbox.owner = this;
    this.hitbox.visible = false;

    //Custom Properties:
    this.attacking = false;
  }

  onCollide(object) {
    if (object.machine.effect === "dead") {
      this.machine.state = object.machine.effect;
    }
  }

  onHit(object) {
    if (object.machine.state != "dead" && object != this) {
      object.machine.state = "dead";
    }
  }

  update(target) {
    //slowed machine.substate:
    if (this.machine.substate == "slowed" && this.timers.effectTimer > 0) {
      this.movement.speed = this.movement.speed = 65;
      this.timers.effectTimer--;
    } else {
      this.machine.substate = null;
      this.movement.speed = 130;
    }
    //attach hitbox:
    if (this.timers.coolDown > 0) {
      this.hitbox.setPosition(this.x, this.y);
      this.timers.coolDown--;
      //attacking:
    } else {
      this.setVelocity(0, 0);
      this.hitbox.setVelocity(
        Math.cos(this.rotation) * 200,
        Math.sin(this.rotation) * 200
      );
    }

    switch (this.machine.state) {
      case "moving":
        //Gather information about the target location:
        const targetAngle = Phaser.Math.Angle.Between(
          this.x,
          this.y,
          target.x,
          target.y
        );

        //start turning visual sprite towards target, calculate that angle and store it in variable

        this.rotation = Phaser.Math.Angle.RotateTo(
          this.rotation,
          targetAngle,
          this.movement.turnRate
        );
        // calculate distance between current location and target
        const distanceTo = Phaser.Math.Distance.Between(
          this.x,
          this.y,
          target.x,
          target.y
        );
        // travel in the direction of the sprite's current rotation until it reaches the correct distance
        if (distanceTo > 250) {
          this.setVelocity(
            Math.cos(this.rotation) * this.movement.speed,
            Math.sin(this.rotation) * this.movement.speed
          );
        } else {
          this.machine.state = "retreating";
        }
        break;
      case "retreating":
        const angle = Phaser.Math.Angle.Between(
          this.x,
          this.y,
          target.x,
          target.y
        );
        //start turning visual sprite towards target, calculate that angle and store it in variable
        this.rotation = Phaser.Math.Angle.RotateTo(this.rotation, angle, this.movement.turnRate);
        // calculate distance between current location and target
        const distance = Phaser.Math.Distance.Between(
          this.x,
          this.y,
          target.x,
          target.y
        );
        let angleDiff = Phaser.Math.Angle.Wrap(angle - this.rotation);
        angleDiff = Math.abs(angleDiff);
        //travel away:
        if (distance < 250) {
          this.setVelocity(
            -Math.cos(this.rotation) * 100,
            -Math.sin(this.rotation) * 100
          );
          this.attacking = true;
        } else if (distance > 300) {
          this.machine.state = "moving";
          this.attacking = false;
        }
        break;
      case "dead":
        this.destroy();
        this.hitbox.destroy();
        break;
    }
  }
}

export class Aqua extends Entity {
  constructor(scene, x, y) {
    //Sprite Registry:
    super(scene, x, y, "enemyAqua", {
      threat: "high",
      coolDown: 200,
      turnRate: 0.002

    });
    //Hitbox:
    this.hitbox = scene.physics.add.sprite(this.x, this.y, "enemyAqua-attack");
    this.hitbox.setCircle(32);
    this.hitbox.owner = this;
    this.hitbox.visible = false;
    this.hitbox.body.checkCollision.none = true;
  }

  onCollide(object) {
    if (object.machine.effect === "dead" && this.machine.invulnerable === false) {
      this.machine.state = "dead";
    }
    if (this.machine.invulnerable === true) {
      this.rotation += Math.PI / 2;
    }
  }

  onHit(object) {
    if (
      object.machine.state != "dead" &&
      object != this &&
      object.machine.invulnerable === false
    ) {
      object.machine.state = "dead";
    }
  }

  update(target) {
    this.hitbox.setPosition(this.x, this.y);
    if (this.timers.attackTimer > 0) {
      this.timers.coolDown = 180;
      this.machine.invulnerable = true;
      this.machine.substate = "deflect";
      this.hitbox.body.enable = true;
      this.hitbox.visible = true;
      this.hitbox.body.checkCollision.none = false;
      this.timers.attackTimer--;
    } else {
      this.timers.coolDown--;
      this.machine.invulnerable = false;
      this.hitbox.body.enable = false;
      this.hitbox.visible = false;
      this.hitbox.body.checkCollision.none = true;
      this.machine.substate = null;
    }
    switch (this.machine.state) {
      case "moving":
        //targeting parameters: distance and angle:
        const range = Phaser.Math.Distance.Between(
          this.x,
          this.y,
          target.x,
          target.y
        );
        const targetAngle = Phaser.Math.Angle.Between(
          this.x,
          this.y,
          target.x,
          target.y
        );

        let angleDiff = Phaser.Math.Angle.Wrap(targetAngle - this.rotation);
        angleDiff = Math.abs(angleDiff);

        if (range > 175 || angleDiff > Math.PI / 4) {
          //slowly rotate towards targetAngle

          this.rotation = Phaser.Math.Angle.RotateTo(
            this.rotation,
            targetAngle,
            this.movement.turnRate
          );
          //go:
          this.setVelocity(
            Math.cos(this.rotation) * this.movement.speed,
            Math.sin(this.rotation) * this.movement.speed
          );
        } else {
          //deploy spines:
          this.timers.attackTimer = 180;
          this.machine.substate = "deflect";
        }

        break;
      case "dead":
        this.hitbox.destroy();
        this.destroy();
        break;
    }
  }
}