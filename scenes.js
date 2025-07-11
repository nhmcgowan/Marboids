import {
  Character,
  Green,
  Blue,
  Orange,
  Yellow,
  Gray,
  Purple,
} from "./CharacterClass.js";
import { MainMenu, Win } from "./MainMenu.js";

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
    this.strength = 15  ;
    //total enemies to defeat:
    this.nestSize = 10;
    //Difficulty scaler:
    this.scaler = 3000; //time between enemies spawning (milliseconds)
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
    this.load.image("enemyPurple", "./assets/enemyPurple.png");

    //Atlases:
    //One for each enemy
    //One for the menu scene(s)
    //One for the player
  }
  /* SpawnEnemy/Nest Management v2:
    A. limit the number of certain high threat enemies on the screen
    B. Gradually add more difficult enemies to the spawn pool
    C. Iterate down Nest.strength per enemy Killed
 */
  spawnEnemy() {
    if (this.activeEnemies < this.strength) {
      const width = 900,
        height = 700,
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
      //Spawn the enemy and add them to the enemies group
      let chance = Phaser.Math.Between(0, 5);
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
      } else {
        enemy = new Green(this, x, y);
      }

      enemy.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      enemy.setRotation(angle);
      if (enemy.state === "init") {
        enemy.spawnAngle = angle;
      }

      if (enemy.hitbox) {
        this.hitboxes.add(enemy.hitbox);
      }
      this.enemies.add(enemy);
    }
  }

  create() {
    this.matter.world.setBounds();
    //Init Character Objects:
    this.player = new Character(this, 400, 300);
    //Click event listener:
    this.input.on("pointerdown", () => {
      if (
        this.player.state === "moving" &&
        this.player.attackTimer === 0 &&
        this.player.state !== "attacking" &&
        this.player.coolDown === 0
      ) {
        this.player.state = "attacking";
        this.player.attackTimer = 30;
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
    this.scoreText = this.add.text(40, 16, "Score: " + this.score, {
      fontSize: "14px",
      fontFamily: "'Nunito Sans', sans-serif",
      fontStle: "bold",
      fill: "#db2450",
    });

    this.events.on("playerDied", () => {
      const highScore = this.registry.get("highScore") || 0;
      if (this.score > highScore) {
        this.registry.set("highScore", this.score);
      }
      this.score = 0;
      this.scene.start("MainMenu");
    });
    this.events.on("win",   () => {
      const highScore = this.registry.get("highScore") || 0;
      if (this.score > highScore) {
        this.registry.set("highScore", this.score);
      }
      this.score = 0;
      this.scene.start("Win");
    })
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
          enemy.x > 900 + margin ||
          enemy.y < -margin ||
          enemy.y > 700 + margin
        ) {
          enemy.destroy();
        }
      }
    });
    //track how many enemies are on screen:
    this.activeEnemies = this.enemies.countActive(true);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 800,
  backgroundColor: "2b2e36",
  scene: [MainMenu, Nest, Win],
};

new Phaser.Game(config);
