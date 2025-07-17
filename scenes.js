import {
  Player,
  Green,
  Blue,
  Orange,
  Yellow,
  Gray,
  Purple,
  Aqua,
} from "./Entities.js";
import { MainMenu, Win, Bestiary, GameOver } from "./Menus.js";

export class Nest extends Phaser.Scene {
  constructor() {
    {
      super({
        key: "Nest",
        physics: {
          arcade: {
            debug: true,
          },
          matter: {
            debug: false,
          },
        },
      });
    }
  }

  init() {
    //Bounty Score:
    this.score = 0;
    //amount of enemies possible on screen:
    this.strength = 15;
    //total enemies to defeat:
    this.nestSize = 25;
    //Difficulty scaler:
    this.scaler = 2500; //time between enemies spawning (milliseconds)
    //Amount of enemies on screen:
    this.activeEnemies = 1;
    //threat level, number of high threat enemies
    this.threat = 0;
  }

  preload() {
    this.load.image("enemyBlue", "./assets/enemyBlue.png");
    this.load.image("enemyGreen", "./assets/enemyGreen.png");
    this.load.image("enemyOrange", "./assets/enemyOrange.png");
    this.load.image("orangeDead", "./assets/orangeDead.png");
    this.load.image("sword", "./assets/sword.png");
    this.load.image("enemyYellow", "./assets/enemyYellow.png");
    this.load.image("yellowDead", "./assets/yellowDead.png");
    this.load.image("enemyGray", "./assets/enemyGray.png");
    this.load.image("grayDamaged", "./assets/grayDamaged.png");
    this.load.image("enemyPurple", "./assets/enemyPurple.png");
    this.load.image("enemyAqua", "./assets/enemyAqua.png");
    this.load.image("enemyAqua-attack", "./assets/enemyAqua-attack.png");

    //Atlases:
    //One for each enemy
    //One for the menu scene(s)
    //One for the player
  }
  /* SpawnEnemy/Nest Management v2:
    A. limit the number of certain high threat enemies on the screen
    B. Gradually add more difficult enemies to the spawn pool
    C. 
 */
  spawnEnemy() {
    if (this.activeEnemies < this.strength) {
      const width = 900,
        height = 750,
        margin = 32,
        speed = 200;
      let x, y, angleCenter, enemy;
      // Pick a random edge and set spawn position and general direction
      const edge = Phaser.Math.Between(0, 3);
      if (edge === 0) {
        // Top
        x = Phaser.Math.Between(0, width);
        y = -margin;
        angleCenter = Math.PI / 2;
      } else if (edge === 1) {
        // Bottom
        x = Phaser.Math.Between(0, width);
        y = height + margin;
        angleCenter = -Math.PI / 2;
      } else if (edge === 2) {
        // Left
        x = -margin;
        y = Phaser.Math.Between(0, height);
        angleCenter = 0;
      } else {
        // Right
        x = width + margin;
        y = Phaser.Math.Between(0, height);
        angleCenter = Math.PI;
      }

      const spread = Math.PI / 4;
      const angle = Phaser.Math.FloatBetween(
        angleCenter - spread,
        angleCenter + spread
      );
      //Spawn odds seed:
      let chance = Phaser.Math.Between(0, 8);
      //Spawn Pool:
      if (chance === 0) {
        enemy = new Blue(this, x, y);
      } else if (chance === 1) {
        enemy = new Orange(this, x, y);
      } else if (chance === 2) {
        enemy = new Yellow(this, x, y);
      } else if (chance === 3) {
        enemy = new Gray(this, x, y);
      } else if (chance === 4) {
        enemy = new Purple(this, x, y);
      } else if (chance === 5) {
        enemy = new Aqua(this, x, y);
      } else {
        enemy = new Green(this, x, y);
      }

      enemy.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      enemy.setRotation(angle);
      if (enemy.machine.state === "init") {
        enemy.init.spawnAngle = angle;
      }

      if (enemy.hitbox) {
        this.hitboxes.add(enemy.hitbox);
      }
      this.enemies.add(enemy);
    }
  }

  create() {
    this.score = 0;
    this.matter.world.setBounds();
    //Init Player Objects:
    this.player = new Player(this, 400, 300);
    //Click event listener:
    this.input.on("pointerdown", () => {
      if (
        this.player.machine.state === "moving" &&
        this.player.timers.attackTimer === 0 &&
        this.player.machine.state !== "attacking" &&
        this.player.timers.coolDown === 0
      ) {
        this.player.machine.state = "attacking";
        this.player.timers.attackTimer = 30;
      }
    });
    //Spawn Enemies:
    this.enemies = this.physics.add.group();

    this.spawnTimer = this.time.addEvent({
      delay: this.scaler,
      callback: () => this.spawnEnemy(),
      loop: true,
    });

    this.time.addEvent({
      delay: 5000,
      callback: () => {
        if (this.scaler > 500) {
          this.scaler -= 500;
          console.log("Updated scaler:", this.scaler);

          // Recreate the spawn timer with the updated delay
          this.spawnTimer.remove(); // Remove the existing timer
          this.spawnTimer = this.time.addEvent({
            delay: this.scaler,
            callback: () => this.spawnEnemy(),
            loop: true,
          });
        }
      },
      loop: true,
    });
    //init enemy hitboxes:
    this.hitboxes = this.physics.add.group();

    //Player Collisions:
    this.physics.add.collider(this.player, this.enemies, (player, enemy) => {
      player.onCollide(enemy);
      enemy.onCollide(player);
    });
    //Enemy Collisions:
    this.physics.add.collider(this.enemies, this.enemies, (g1, g2) => {
      g1.onCollide(g2);
      g2.onCollide(g1);
    });
    //Sword Collision
    this.physics.add.overlap(this.player.hitboxes, this.enemies, (hb, e) => {
      this.player.onHit(e);
    });

    this.physics.add.overlap(this.hitboxes, this.enemies, (hb, e) => {
      hb.owner.onHit(e);
    });

    this.physics.add.overlap(this.player, this.hitboxes, (p, hb) => {
      hb.owner.onHit(p);
    });
    //UI elements:
    this.scoreText = this.add
      .text(40, 16, "Score: " + this.score, {
        fontSize: "20px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#db2450",
      })
      .setOrigin(0.5, 0.5);

    this.enemiesLeft = this.add
      .text(80, 32, "Marboids left: " + this.nestSize, {
        fontSize: "20px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#db2450",
      })
      .setOrigin(0.5, 0.5);

    const quit = this.add
      .text(990, 16, "X", {
        fontSize: "20px",
        fontFamily: "'Nunito Sans', sans-serif",
        fontStyle: "bold",
        fill: "#db2450",
      })
      .setOrigin(0.5, 0.5)
      .setInteractive();
    quit.on("pointerdown", () => {
      this.scene.start("MainMenu");
    });
    //ending events:
    this.events.on("playerDied", () => {
      this.registry.set("finalScore", this.score);
      const highScore = this.registry.get("highScore") || 0;
      if (this.score > highScore) {
        this.registry.set("highScore", this.score);
      }
      this.scene.start("GameOver");
    });
    this.events.on("win", () => {
      this.registry.set("finalScore", this.score);

      const highScore = this.registry.get("highScore") || 0;
      if (this.score > highScore) {
        this.registry.set("highScore", this.score);
      }
      this.scene.start("Win");
    });
  }

  update() {
    // Update player:
    const target = this.input.activePointer;
    this.player.update(target);

    //Update enemy Group:
    const margin = 64;
    this.enemies.children.iterate((enemy) => {
      if (enemy) {
        enemy.update(this.player);
        // Despawn enemies if they leave play area:
        if (
          enemy.x < -margin ||
          enemy.x > 1000 + margin ||
          enemy.y < -margin ||
          enemy.y > 750 + margin
        ) {
          enemy.destroy();
        }
      }
    });
    //track how many enemies are on screen:
    this.activeEnemies = this.enemies.countActive(true);
  }
}

export class HUD extends Phaser.Scene {
  constructor() {
    super({ key: "HUD" });
  }
  create() {}
}

const config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 750,
  backgroundColor: "#444444",
  scene: [MainMenu, Nest, HUD, Win, Bestiary, GameOver],
};

new Phaser.Game(config);
