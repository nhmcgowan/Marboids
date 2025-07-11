/*List of Bugs to squash:
  Gray colliding with Orange Corpse
  Yellow corpse hitbox causing slows prematurely <- adjust spawn edge
  Features:
  Ammo factory for Purple
  45 degree targeting angle for Purple?
   
  */
export class BaseClass extends Phaser.Physics.Arcade.Sprite {
  constructor(
    scene,
    x,
    y,
    texture,
    {
      //Defualt Values:
      setCircle = 16,
      setCollideWorldBounds = false,
      speed = 180,
      effectTimer = 0,
      substate = null,
      effect = null,
      state = "moving",
    } = {}
  ) {
    //Register:
    super(scene, x, y, texture);
    scene.physics.add.existing(this);
    scene.add.existing(this);
    //Sprite:
    this.setCollideWorldBounds(setCollideWorldBounds);
    this.body.setCircle(setCircle);
    this.speed = speed;
    //State Management:
    this.effectTimer = effectTimer;
    this.substate = substate;
    this.effect = effect;
    this.state = state;
  }
}
export class Character extends BaseClass {
  constructor(scene, x, y) {
    //Sprite Registry:
    super(scene, x, y, "enemyBlue", {
      setCollideWorldBounds: true,
      speed: 240,
    });
    //--HitBoxes--:
    //Matter.js:
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
    //Player State Management:
    this.attackTimer = 0;
    this.coolDown = 0;
  }

  onCollide(enemy) {
    if (enemy.effect && this.state !== enemy.effect) {
      this.state = enemy.effect;
    }
  }

  onHit(enemy) {
    if (enemy.state !== "dead" && !(enemy instanceof Gray)) {
      enemy.state = "dead";
      enemy.effectTimer = 300;
      this.scene.score++;
      this.scene.nestSize --;
      this.scene.scoreText.setText("Score " + this.scene.score);
      if (this.scene.nestSize <= 0) {
        this.scene.events.emit("win");
      }
    }
    if (enemy.substate === "deflect" && this.state != "stunned") {
      this.state = "stunned";
      this.sword.setAngularVelocity(1);
      this.effectTimer = 30;
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
    if (this.substate == "slowed" && this.effectTimer > 0) {
      this.speed = this.speed = 120;
      this.effectTimer--;
    } else {
      this.substate = null;
      this.speed = 240;
    }
    //safety for glitchy attack animation:
    if (this.state !== "attacking") {
      this.hitboxes.children.iterate((hitbox) => {
        hitbox.body.enable = false;
      });
      this.attackTimer = 0;
    }
    if (this.coolDown > 0) {
      this.coolDown--;
    }

    switch (this.state) {
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
            this.speed
          );
        } else {
          this.setVelocity(0, 0);
        }
        break;
      case "attacking":
        if (this.attackTimer > 15) {
          this.hitboxes.children.iterate((hitbox) => {
            hitbox.body.enable = true;
          });
          this.attackTimer--;
          this.setVelocity(0, 0);
          this.sword.setAngularVelocity(-0.2);
        }
        //Sword Reset/CoolDown:
        if (this.attackTimer <= 15 && this.attackTimer > 0) {
          this.hitboxes.children.iterate((hitbox) => {
            hitbox.body.enable = false;
          });
          this.sword.setAngularVelocity(0);
          this.attackTimer--;
        }
        if (this.attackTimer === 0) {
          this.state = "moving";
          this.attackTimer = 0;
          this.coolDown = 5;
        }
        break;
      case "stunned":
        this.setVelocity(0, 0);
        this.effectTimer--;
        if (this.effectTimer <= 0) {
          this.state = "moving";
        }
        break;
      case "dead":
        this.scene.events.emit("playerDied");
        break;
    }
  }
}
//Slime
export class Green extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    //Sprite Registry:
    super(scene, x, y, "enemyGreen");
    scene.physics.add.existing(this);
    scene.add.existing(this);
    //Sprite:
    this.body.setCircle(16);
    this.setCollideWorldBounds(false);
    this.setBounce(1, 1);
    this.speed = 200;
    //Custom Properties
    this.state = "init"; //this state is for dumb enemies to prevent weird things happening
    this.effect = "stunned";
    this.effectTimer = 0;
    this.substate = null;
    //init system
    this.init = 5; //lasts five frames
    //value passed by spawner
    this.spawnAngle = 0;
    this.threat = "low";
  }

  onCollide(object) {
    if (object.effect === "dead") {
      this.state = object.effect;
    }
    if (object instanceof Character) {
      object.state = this.effect;
      object.effectTimer = 60;
    }
  }

  update() {
    if (this.substate == "slowed" && this.effectTimer > 0) {
      this.speed = this.speed = 100;
      this.effectTimer--;
    } else {
      this.substate = null;
      this.speed = 200;
    }
    switch (this.state) {
      case "init":
        this.init -= 1;
        this.setVelocity(
          Math.cos(this.spawnAngle) * this.speed,
          Math.sin(this.spawnAngle) * this.speed
        );
        this.setRotation(this.spawnAngle);
        if (this.init < 1) {
          this.state = "moving";
        }
        break;
      case "moving":
        //speed and visual angle normalization

        const angle = Math.atan2(this.body.velocity.y, this.body.velocity.x);
        this.setVelocity(
          Math.cos(angle) * this.speed,
          Math.sin(angle) * this.speed
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
export class Blue extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    //Sprite Registry:
    super(scene, x, y, "enemyBlue");
    scene.physics.add.existing(this);
    scene.add.existing(this);
    //Sprite:
    this.body.setCircle(16);
    this.setCollideWorldBounds(false);
    this.setBounce(1, 1);
    this.speed = 180;
    //Flags:
    this.state = "moving";
    this.effect = null;
    this.effectTimer = 0;
    this.substate = null;
    this.threat = "high"
  }

  onCollide(object) {
    if (
      object.effect &&
      this.state != object.effect &&
      object.effect != "stunned"
    ) {
      this.state = object.effect;
    }
  }

  update(target) {
    if (this.substate === "slowed" && this.effectTimer > 0) {
      this.speed = 90;
      this.effectTimer--;
    } else {
      this.substate = null;
      this.speed = 180;
    }
    switch (this.state) {
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

        if (range > 200 || angleDiff > Math.PI / 4) {
          //slowly rotate towards targetAngle
          const turnRate = 0.02;
          this.rotation = Phaser.Math.Angle.RotateTo(
            this.rotation,
            targetAngle,
            turnRate
          );
          //go:
          this.setVelocity(
            Math.cos(this.rotation) * this.speed,
            Math.sin(this.rotation) * this.speed
          );
        } else {
          //leap at target
          //this.rotation = targetAngle <-- potential feature, snaps to player location
          this.effectTimer = 30;
          this.state = "attacking";
        }

        break;
      case "attacking":
        this.effect = "dead";
        this.effectTimer--;
        this.setVelocity(
          Math.cos(this.rotation) * this.speed * 2,
          Math.sin(this.rotation) * this.speed * 2
        );
        if (this.effectTimer <= 0) {
          this.state = "moving";
          this.effect = null;
        }
        break;
      case "dead":
        this.destroy();
        break;
    }
  }
}
//Fireball
export class Orange extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    //Sprite Registry:
    super(scene, x, y, "enemyOrange");
    scene.physics.add.existing(this);
    scene.add.existing(this);
    //Sprite:
    this.body.setCircle(16);
    this.setCollideWorldBounds(false);
    //Custom Properties:
    this.state = "moving";
    this.effectTimer = 0;
    this.effect = "dead";
    this.threat = "medium"
  }

  onCollide(object) {
    if (this.state != "dead") {
      this.state = "dead";
      this.effectTimer = 300;
    }
  }

  update(target) {
    switch (this.state) {
      case "moving":
        //Gather information about the target location:
        const targetAngle = Phaser.Math.Angle.Between(
          this.x,
          this.y,
          target.x,
          target.y
        );

        //start turning visual sprite towards target, calculate that angle and store it in variable
        const turnRate = 0.005;
        this.rotation = Phaser.Math.Angle.RotateTo(
          this.rotation,
          targetAngle,
          turnRate
        );
        // calculate distance between current location and target
        const moveRate = 200;
        const distanceTo = Phaser.Math.Distance.Between(
          this.x,
          this.y,
          target.x,
          target.y
        );

        // travel in the direction of the sprite's current direction until it reaches the target
        if (distanceTo > 10) {
          this.setVelocity(
            Math.cos(this.rotation) * moveRate,
            Math.sin(this.rotation) * moveRate
          );
        } else {
          this.setVelocity(0, 0);
        }
        break;
      case "dead":
        this.setVelocity(0, 0);
        this.setTexture("orangeDead");
        this.body.setCircle(32);
        this.effectTimer--;
        if (this.effectTimer < 1) {
          this.destroy();
        }
        break;
    }
  }
}
//Slime
export class Yellow extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    //Sprite Registry:
    super(scene, x, y, "enemyYellow");
    scene.physics.add.existing(this);
    scene.add.existing(this);
    //Sprite:
    this.body.setCircle(16);
    this.setCollideWorldBounds(false);
    this.setBounce(1, 1);
    //hitbox: (enabled on death)
    this.hitbox = scene.physics.add.sprite(this.x, this.y, "yellowDead");
    this.hitbox.body.setCircle(32);
    this.hitbox.body.enable = false;
    this.hitbox.visible = false;
    this.hitbox.owner = this;
    //Custom Properties
    this.state = "init"; //this state is for dumb enemies to prevent weird things happening
    this.effect = null;
    this.effectTimer = 500;
    //init system
    this.init = 5;
    this.spawnAngle = 0; //value passed by spawner
    this.threat = "low";
  }

  onCollide(object) {
    if (this.state != "dead" && object != this) {
      this.state = "dead";
    }

    if (object.substate != "slowed") {
      object.substate = "slowed";
      object.effectTimer = 150;
    }
  }

  onHit(object) {
    if (object.substate != "slowed") {
      object.substate = "slowed";
      object.effectTimer = 150;
    }
  }

  update() {
    switch (this.state) {
      case "init":
        //initial movement set by spawn. this runs so that "moving" doesn't override immediately
        this.init -= 1;
        const initSpeed = 200;
        this.setVelocity(
          Math.cos(this.spawnAngle) * initSpeed,
          Math.sin(this.spawnAngle) * initSpeed
        );
        this.setRotation(this.spawnAngle);
        if (this.init < 1) {
          this.state = "moving";
        }
        break;
      case "moving":
        //speed and visual angle normalization
        const speed = 200;
        const angle = Math.atan2(this.body.velocity.y, this.body.velocity.x);
        this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
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
        this.effectTimer--;
        if (this.effectTimer < 1) {
          this.destroy();
          this.hitbox.destroy();
        }
        break;
    }
  }
}

//Crush
export class Gray extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    //Sprite Registry:
    super(scene, x, y, "enemyGray");
    scene.physics.add.existing(this);
    scene.add.existing(this);
    //Sprite:
    this.body.setCircle(32);
    this.setCollideWorldBounds(false);
    //Custom Properties:
    this.state = "moving";
    this.effectTimer = 0;
    this.effect = "dead";
    this.substate = "deflect";
    this.threat = "medium"
  }

  onCollide(object) {
    if (object instanceof Gray) {
      this.rotation += Math.PI / 2;
    }
  }

  update(target) {
    switch (this.state) {
      case "moving":
        //Gather information about the target location:
        const targetAngle = Phaser.Math.Angle.Between(
          this.x,
          this.y,
          target.x,
          target.y
        );

        //start turning visual sprite towards target, calculate that angle and store it in variable
        const turnRate = 0.005;
        this.rotation = Phaser.Math.Angle.RotateTo(
          this.rotation,
          targetAngle,
          turnRate
        );
        // calculate distance between current location and target
        const moveRate = 180;
        const distanceTo = Phaser.Math.Distance.Between(
          this.x,
          this.y,
          target.x,
          target.y
        );

        // travel in the direction of the sprite's current direction until it reaches the target
        if (distanceTo > 10) {
          this.setVelocity(
            Math.cos(this.rotation) * moveRate,
            Math.sin(this.rotation) * moveRate
          );
        } else {
          this.setVelocity(0, 0);
        }
        break;
      case "dead":
        this.state = "moving";
        break;
    }
  }
}

export class Purple extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    //Sprite Registry:
    super(scene, x, y, "enemyPurple");
    scene.physics.add.existing(this);
    scene.add.existing(this);
    //Sprite:
    this.body.setCircle(16);
    this.setCollideWorldBounds(false);
    this.setBounce(1, 1);
    this.speed = 130;
    //Hitbox:
    this.hitbox = scene.physics.add.sprite(this.x, this.y, "enemyBlue");
    this.hitbox.setCircle(5);
    this.hitbox.owner = this;
    this.hitbox.visible = false;
    //Custom Properties
    this.effect = null;
    this.effectTimer = 0;
    this.substate = null;
    this.state = "moving";
    this.attacking = false;
    this.coolDown = 180;
    this.threat = "high"
    //init system
  }

  onCollide(object) {
    if (object.effect === "dead") {
      this.state = object.effect;
    }
  }

  onHit(object) {
    if (object.state != "dead" && object != this) {
      object.state = "dead";
    }
  }

  update(target) {
    //slowed substate:
    if (this.substate == "slowed" && this.effectTimer > 0) {
      this.speed = this.speed = 75;
      this.effectTimer--;
    } else {
      this.substate = null;
      this.speed = 130;
    }
    //attach hitbox:
    if (this.coolDown > 0) {
      this.hitbox.setPosition(this.x, this.y);
      this.coolDown--;
      //attacking:
    } else {
      this.setVelocity(0, 0);
      this.hitbox.setVelocity(
        Math.cos(this.rotation) * 200,
        Math.sin(this.rotation) * 200
      );
    }

    switch (this.state) {
      case "moving":
        //Gather information about the target location:
        const targetAngle = Phaser.Math.Angle.Between(
          this.x,
          this.y,
          target.x,
          target.y
        );

        //start turning visual sprite towards target, calculate that angle and store it in variable
        const turnRate = 0.005;
        this.rotation = Phaser.Math.Angle.RotateTo(
          this.rotation,
          targetAngle,
          turnRate
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
            Math.cos(this.rotation) * this.speed,
            Math.sin(this.rotation) * this.speed
          );
        } else {
          this.state = "retreating";
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
        const turn = 0.005;
        this.rotation = Phaser.Math.Angle.RotateTo(this.rotation, angle, turn);
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
          this.state = "moving";
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
