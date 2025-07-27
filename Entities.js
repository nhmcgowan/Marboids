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
      state = "moving",
      invulnerable = false,
      threat = 1,
      spawnAngle = 0,
      turnRate = 0.02,
      value = 1,
      attackTimer = 0,
      coolDown = 0,
      initFrames = 5,
      corpseTimer = 300,
      dying = false,
      spawnProtection = false,
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
      dying: dying,
      spawnProtection: spawnProtection,
    };
    this.meta = {
      threat: threat,
      value: value,
    };
    this.timers = {
      attackTimer: attackTimer,
      coolDown: coolDown,
      effectTimer: effectTimer,
      corpseTimer: corpseTimer,
    };
    this.ability = new Abilities(this);
  }

  deathAnim() {
    if (this.machine.dying === false) {
      this.machine.dying = true;
      this.setVelocity(0, 0);
      this.body.enable = false;
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        duration: 1500,
        ease: "Cubic.easeOut",
        onComplete: () => {
          if (this instanceof Player) {
            this.scene.events.emit("playerDied");
          } else if (this instanceof Hitbox) {
            this.scene.hitboxes.remove(this, true, true);
            //this.hitbox = null;
          } else {
            this.destroy();
          }
        },
      });
    }
  }
}

export class Hitbox extends Entity {
  constructor(scene, x, y, texture, config = {}) {
    super(scene, x, y, texture, config);
  }
}
export class Player extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "player", {
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
    if (!enemy.body.enable) return;
    //Deflect logic:
    if (
      !(enemy instanceof Hitbox) &&
      enemy.machine.substate === "deflect" &&
      this.machine.state !== "stunned"
    ) {
      this.machine.state = "stunned";
      this.sword.setAngularVelocity(1);
      this.timers.effectTimer = 30;
      if (enemy instanceof Aqua) {
        enemy.rotation += Math.PI / 2;
      }
    }
    //Kill logic
    if (
      (enemy.machine.state !== "dead" &&
        enemy.machine.invulnerable === false) ||
      (enemy instanceof Hitbox && enemy.owner instanceof Purple)
    ) {
      enemy.machine.state = "dead";
      //Handle meta
      this.scene.score += enemy.meta.value;
      this.scene.nestSize--;
      this.scene.utility.scorePopup(enemy.x, enemy.y, enemy.meta.value);
      //handle clearNest:
      if (this.scene.nestSize <= 0 && this.scene.activeEnemies > 0) {
        this.scene.enemies.children.iterate((enemy) => {
          if (enemy) enemy.deathAnim();
        });
      }
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
    //slowed substate:
    if (this.machine.substate == "slowed" && this.timers.effectTimer > 0) {
      this.movement.speed = 120;
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
    //Win condition:
    if (this.scene.nestSize <= 0 && this.scene.activeEnemies <= 0) {
      this.scene.events.emit("win");
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
        this.deathAnim();
        break;
    }
  }
}
//Slime
export class Green extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "vectoidGreen", {
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
        this.deathAnim();
        break;
    }
  }
}
//Hunter
export class Blue extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "vectoidBlue", {
      value: 5,
      attackTimer: 30,
      turnRate: 0.01,
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
        this.setTexture("vectoidBlue");
        this.ability.homing(this, target);
        break;
      case "attacking":
        this.setTexture("vectoidBlueAttack");
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
        this.deathAnim();
        break;
    }
  }
}
//Fireball
export class Orange extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "vectoidOrange", {
      effect: "dead",
      threat: "medium",
      value: 3,
      turnRate: 0.005,
    });

    this.hitbox = new Hitbox(scene, x, y, "orangeDead", { setCircle: 32 });
    this.hitbox.body.enable = false;
    this.hitbox.visible = false;
    this.hitbox.owner = this;
  }

  onCollide(object) {
    if (this.machine.state != "dead") {
      this.machine.state = "dead";
    }
  }

  onHit(object) {
    if (
      !(object instanceof Gray) &&
      object != this &&
      object.machine.invulnerable === false
    ) {
      object.machine.state = "dead";
    }
    if (object instanceof Gray) {
      object.machine.substate = "damaged";
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
        if (this.hitbox && this.hitbox.machine.dying === false) {
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
          this.timers.corpseTimer--;
          if (this.timers.corpseTimer < 1) {
            this.deathAnim();
            this.hitbox.deathAnim();
          }
        }
        break;
    }
  }
}
//Slime
export class Yellow extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "vectoidYellow", {
      state: "init",
    });

    //hitbox: (enabled on death)
    this.hitbox = new Hitbox(this.scene, this.x, this.y, "yellowDead", {
      setCircle: 32,
    });
    this.hitbox.setAlpha(0.5);
    this.hitbox.machine.invulnerable = true;
    this.hitbox.body.enable = false;
    this.hitbox.visible = false;
    this.hitbox.owner = this;
    this.setScale(1.5);
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
        this.setVelocity(
          Math.cos(angle) * this.movement.speed,
          Math.sin(angle) * this.movement.speed
        );
        this.setRotation(angle);
        break;
      case "dead":
        if (this.hitbox && this.hitbox.machine.dying === false) {
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
          this.timers.corpseTimer--;
          if (this.timers.corpseTimer < 1) {
            this.deathAnim();
            this.hitbox.deathAnim();
          }
        }
        break;
    }
  }
}

//Crush
export class Gray extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "vectoidGray", {
      effect: "dead",
      substate: "deflect",
      threat: "medium",
      invulnerable: true,
      turnRate: 0.005,
      speed: 150,
      setCircle: 32,
      value: 10,
    });
  }

  onCollide(object) {
    if (object instanceof Gray) {
      this.rotation += Math.PI / 2;
      this.machine.substate = "damaged";
    }
  }

  update(target) {
    if (this.machine.substate === "damaged") {
      this.setTexture("grayDamaged");
      this.machine.invulnerable = false;
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
          this.deathAnim();
        } else {
          this.machine.state = "moving";
        }

        break;
    }
  }
}

export class Purple extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "vectoidPurple", {
      coolDown: 180,
      threat: "high",
      value: 5,
      speed: 130,
      turnRate: 0.005,
    });
    //Hitbox:
    this.hitbox = new Hitbox(scene, this.x, this.y, "purpleProjectile", {
      setCircle: 5,
    });
    this.hitbox.owner = this;

    //custom properties:
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
    //reload:
    if (!this.hitbox) {
      this.timers.coolDown = 120;
      this.hitbox = new Hitbox(this.scene, this.x, this.y, "purpleProjectile", {
        setCircle: 5,
      });
      this.hitbox.owner = this;
      this.hitbox.machine.dying = false;
      this.scene.hitboxes.add(this.hitbox);
    }
    //destroy hitbox:
    if (
      this.hitbox &&
      this.hitbox.machine.state === "dead" &&
      this.hitbox.machine.dying === false
    ) {
      this.hitbox.deathAnim();
      this.hitbox = null;
    }
    //attach hitbox:
    if (this.hitbox) {
      if (this.timers.coolDown > 0) {
        this.hitbox.setPosition(this.x, this.y);
        this.timers.coolDown--;
        //attacking:
      } else {
        this.body.enable = true;
        this.setVelocity(0, 0);
        this.hitbox.setVelocity(
          Math.cos(this.rotation) * 200,
          Math.sin(this.rotation) * 200
        );
      }
      //slowed machine.substate:
      if (
        this.hitbox &&
        this.machine.substate == "slowed" &&
        this.timers.effectTimer > 0
      ) {
        this.movement.speed = 65;
        this.timers.effectTimer--;
      } else {
        this.machine.substate = null;
        this.movement.speed = 130;
      }
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
        this.rotation = Phaser.Math.Angle.RotateTo(
          this.rotation,
          angle,
          this.movement.turnRate
        );
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
        } else if (distance > 300) {
          this.machine.state = "moving";
        }
        break;
      case "dead":
        this.deathAnim();
        if (this.hitbox && this.hitbox.machine.dying === false) {
          this.hitbox.deathAnim();
        }
        break;
    }
  }
}

/*Aqua Enemy Type (Aqua class)
The Aqua class defines an enemy with a unique orbiting hitbox and a defensive "spine deploy" mechanic.

Key Features
Orbiting Hitbox:

The Aqua enemy has a Hitbox that orbits around it, using Phaser.Geom.Circle and Phaser.Actions.PlaceOnCircle.
The orbit radius and position change based on its attack state.
Deflect/Invulnerable State:

When attacking (attackTimer > 0), the hitbox orbits at a larger radius (40), and Aqua becomes invulnerable (machine.invulnerable = true), entering a "deflect" substate.
When not attacking, the hitbox orbits at a smaller radius (10), and Aqua is vulnerable.
Movement & Targeting:

In "moving" state, Aqua rotates toward the target and moves forward.
If close enough to the target (range ≤ 150 and angle difference ≤ π/4), it deploys spines (starts attack timer and becomes invulnerable).
Collision & Hit Logic:

On collision with a "dead" effect, Aqua dies unless invulnerable.
If invulnerable, it rotates away.
On hit, it kills non-invulnerable, non-dead targets.
Death:

When dead, both Aqua and its hitbox play death animations.

Attack method: 
How the Attack Works
Orbiting Hitbox:
The hitbox orbits the Aqua enemy, with its position updated every frame (orbitAngle += 0.05).

Normal State: The hitbox orbits at a radius of 10.
Attack State: When attackTimer > 0, the hitbox orbits at a radius of 40.
Attack Trigger:
The attack is triggered elsewhere in the update logic when the Aqua is close enough to the target.

When triggered, attackTimer is set to 150, starting the attack phase.
During Attack:

The hitbox radius increases (from 10 to 40), making it harder for the player to approach.
Aqua becomes invulnerable (machine.invulnerable = true) and enters the "deflect" substate.
The turn rate slows (movement.turnRate = 0.01), making Aqua less agile.
Each frame, attackTimer decrements until it reaches zero.
After Attack:

The hitbox radius returns to 10.
Aqua becomes vulnerable again.
Turn rate returns to normal.
Effectiveness
Visual Feedback:
The expanding hitbox is a clear visual indicator of the attack phase, warning the player.

Defensive Mechanic:
Invulnerability and "deflect" substate make Aqua immune to damage during attack, and can deflect the player.

Area Denial:
The larger hitbox radius during attack effectively creates a temporary zone the player must avoid.

Transition:
The attack phase is time-limited and automatically reverts after attackTimer runs out.*/

export class Aqua extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "vectoidAqua", {
      threat: 3,
      turnRate: 0.02,
      value: 8,
      attackTimer: 0,
    });

    // Orbiting hitboxes (3 total, spaced 120 degrees apart)
    this.hitbox1 = new Hitbox(scene, this.x, this.y, "aquaHitbox", {
      setCircle: 10,
    });
    this.hitbox1.owner = this;

    this.hitbox2 = new Hitbox(scene, this.x, this.y, "aquaHitbox", {
      setCircle: 10,
    });
    this.hitbox2.owner = this;

    this.hitbox3 = new Hitbox(scene, this.x, this.y, "aquaHitbox", {
      setCircle: 10,
    });
    this.hitbox3.owner = this;

    this.orbitAngle = 0;
    this.hitboxes = [this.hitbox1, this.hitbox2, this.hitbox3];
  }

  onCollide(object) {
    if (object.machine.effect === "dead" && !this.machine.invulnerable) {
      this.machine.state = object.machine.effect;
    }
    // If invulnerable, rotate away
    if (this.machine.invulnerable && object.machine.effect === "dead") {
      this.rotation += Math.PI / 2;
    }
  }

  onHit(object) {
    if (
      object.machine.state !== "dead" &&
      object !== this &&
      !object.machine.invulnerable
    ) {
      object.machine.state = "dead";
    }
  }

  update(target) {
    // Orbiting hitbox logic
    if (this.hitboxes && this.hitboxes.length > 0) {
      this.orbitAngle += 0.05;

      if (this.timers.attackTimer > 0) {
        // Attack state: larger radius, invulnerable
        this.machine.effect = "dead";
        const circle = new Phaser.Geom.Circle(this.x, this.y, 40);

        // Place all three hitboxes equidistantly around the circle
        this.hitboxes.forEach((hitbox, index) => {
          const angleOffset = (index * (2 * Math.PI)) / 3; // 120 degrees apart
          const hitboxAngle = this.orbitAngle + angleOffset;
          const x = this.x + Math.cos(hitboxAngle) * 40;
          const y = this.y + Math.sin(hitboxAngle) * 40;
          hitbox.setPosition(x, y);
        });

        this.machine.invulnerable = true;
        this.machine.substate = "deflect";
        this.movement.turnRate = 0.01;
        this.timers.attackTimer--;
      } else {
        // Normal state: smaller radius, vulnerable
        this.machine.effect = null;
        const circle = new Phaser.Geom.Circle(this.x, this.y, 10);

        // Place all three hitboxes equidistantly around the circle
        this.hitboxes.forEach((hitbox, index) => {
          const angleOffset = (index * (2 * Math.PI)) / 3; // 120 degrees apart
          const hitboxAngle = this.orbitAngle + angleOffset;
          const x = this.x + Math.cos(hitboxAngle) * 10;
          const y = this.y + Math.sin(hitboxAngle) * 10;
          hitbox.setPosition(x, y);
        });

        this.machine.invulnerable = false;
        this.machine.substate = null;
        this.movement.turnRate = 0.02;
      }
    }

    // Slowed substate handling
    if (this.machine.substate === "slowed" && this.timers.effectTimer > 0) {
      this.movement.speed = 90;
      this.timers.effectTimer--;
    } else if (this.machine.substate !== "deflect") {
      this.machine.substate = null;
      this.movement.speed = 180;
    }

    switch (this.machine.state) {
      case "moving":
        // Gather information about the target location
        const targetAngle = Phaser.Math.Angle.Between(
          this.x,
          this.y,
          target.x,
          target.y
        );

        // Start turning visual sprite towards target
        this.rotation = Phaser.Math.Angle.RotateTo(
          this.rotation,
          targetAngle,
          this.movement.turnRate
        );

        // Calculate distance between current location and target
        const distanceTo = Phaser.Math.Distance.Between(
          this.x,
          this.y,
          target.x,
          target.y
        );

        // Move forward
        if (distanceTo > 10) {
          this.setVelocity(
            Math.cos(this.rotation) * this.movement.speed,
            Math.sin(this.rotation) * this.movement.speed
          );
        } else {
          this.setVelocity(0, 0);
        }

        // Check if close enough to deploy spines (attack)
        const angleDiff = Math.abs(
          Phaser.Math.Angle.Wrap(targetAngle - this.rotation)
        );
        if (
          distanceTo <= 150 &&
          angleDiff <= Math.PI / 4 &&
          this.timers.attackTimer <= 0
        ) {
          this.timers.attackTimer = 150;
        }
        break;

      case "dead":
        this.deathAnim();
        if (this.hitboxes && this.hitboxes.length > 0) {
          this.hitboxes.forEach((hitbox) => {
            if (hitbox && hitbox.machine.dying === false) {
              hitbox.deathAnim();
            }
          });
        }
        break;
    }
  }
}
//Combo Green/Green:
export class GreenMerge extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "enemyGray", {
      threat: "high",
      turnRate: 0.03,
      value: 12,
      state: "spawning",
    });
  }
  onCollide(object) {}

  update(target) {}
}
//lancer
export class Silver extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "enemyGray", {
      threat: "high",
      turnRate: 0.03,
      value: 12,
    });
  }
}
//armored blue
export class Brown extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "enemyBlue", {
      value: 10,
      attackTimer: 30,
      turnRate: 0.03,
      speed: 180,
    });
    this.armor = 3;
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
        this.deathAnim();
        break;
    }
  }
}
//Almagam: onCollide kills other Entity and grows more powerful. Once a certain threshold is met, spawns additional Almagams.
//Power Level determines what Entities it can absorb.
export class Olive extends Entity {
  constructor(scene, x, y) {
    super(scene, x, y, "enemyGreen", {
      threat: 3,
      turnRate: 0.015,
      value: 15,
      speed: 160,
      setCircle: 20,
      coolDown: 30,
    });
    this.absorptionCount = 0;
    this.spawnThreshold = 2;
    this.grow = 1.2;
    this.setScale(1.2);
  }

  onCollide(object) {
    // Can absorb entities based on power level
    if (
      object.machine.state !== "dead" &&
      object.meta.threat <= this.meta.threat &&
      object.machine.invulnerable === false &&
      object.machine.spawnProtection === false
    ) {
      // Absorb the entity
      object.machine.state = "dead";
      this.absorptionCount++;
      this.meta.threat++;

      // Grow in size and power
      this.body.setCircle(Math.min(this.body.radius + 2, 40));
      this.movement.speed -= 1;
      this.meta.value += object.meta.value;
      this.grow += 0.2;
      this.setScale(this.grow);

      // Spawn additional Amalgams when threshold is reached
      if (this.absorptionCount >= this.spawnThreshold) {
        this.spawnOlive();
        this.absorptionCount = 0;
        this.spawnThreshold++; // Increase threshold for next spawn
      }
    }
  }

  spawnOlive() {
    // Spawn a new Olive at a random nearby position
    const spawnAngle = Math.random() * Math.PI * 2;
    const spawnDistance = 10;
    const spawnX = this.x + Math.cos(spawnAngle) * spawnDistance;
    const spawnY = this.y + Math.sin(spawnAngle) * spawnDistance;

    const newAmalgam = new Olive(this.scene, spawnX, spawnY);
    this.scene.enemies.add(newAmalgam);
  }

  update(target) {
    if (this.machine.substate === "slowed" && this.timers.effectTimer > 0) {
      this.movement.speed = Math.max(this.movement.speed * 0.5, 80);
      this.timers.effectTimer--;
    } else {
      this.machine.substate = null;
    }
    if (this.machine.spawnProtection && this.timers.coolDown > 0) {
      this.timers.coolDown--;
    } else {
      this.machine.spawnProtection = false;
    }

    switch (this.machine.state) {
      case "moving":
        this.ability.homing(this, target);
        break;
      case "dead":
        this.deathAnim();

        break;
    }
  }
}
