import { Green, Blue, Orange, Yellow, Gray, Purple, Aqua } from "./Entities.js";

export class Util {
  constructor(scene) {
    this.scene = scene;
  }
  //UI:
  scorePopup(x, y, value) {
    const popup = this.scene.add
      .text(x, y, `+${value}`, {
        fontSize: "20px",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "bold",
        fill: "#4a8525",
      })
      .setOrigin(0.5, 0.5);
    popup.setDepth(1);
    this.scene.tweens.add({
      targets: popup,
      y: y - 40,
      alpha: 0,
      duration: 1250,
      ease: "Cubic.easeOut",
      onComplete: () => popup.destroy(),
    });
  }

  ui() {
    this.scene.scoreText = this.scene.add
      .text(40, 16, "Score: " + this.scene.score, {
        fontSize: "20px",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "bold",
        fill: "#4a8525",
      })
      .setOrigin(0.5, 0.5);

    this.scene.enemiesLeft = this.scene.add
      .text(80, 32, "Marboids left: " + this.scene.nestSize, {
        fontSize: "20px",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "bold",
        fill: "#4a8525",
      })
      .setOrigin(0.5, 0.5);
    if (this.scene.nestSize > 1000) {
      this.scene.enemiesLeft.setStyle({ fontSize: "32px" });
      this.scene.enemiesLeft.setText("∞");
    }

    const quit = this.scene.add
      .text(990, 16, "X", {
        fontSize: "20px",
        fontFamily: "Consolas, 'Courier New', monospace",
        fontStyle: "bold",
        fill: "#4a8525",
      })
      .setOrigin(0.5, 0.5)
      .setInteractive();
    quit.on("pointerdown", () => {
      this.scene.start("MainMenu");
    });
    quit.setDepth(1);
    this.scene.enemiesLeft.setDepth(1);
    this.scene.scoreText.setDepth(1);
    this.scene.healthBar = this.scene.add.graphics();
    const barWidth = this.scene.nestSize * 3;
    const gameWidth = this.scene.sys.game.config.width; // or just 1000 if hardcoded
    const x = (gameWidth - barWidth) / 2;

    this.scene.healthBar.setPosition(x, 0);
  }

  uiUpdate() {
    this.scene.healthBar.clear();
    if (this.scene.nestSize < 1000) {
      this.scene.healthBar.fillStyle(0x4a8525);
      this.scene.healthBar.fillRect(15, 15, this.scene.nestSize * 3, 15);
    }
  }

  //Spawn/Despawn Enemies:

  /* SpawnEnemy/Nest Management v2:
    A. limit the number of certain high threat enemies on the screen
    B. Gradually add more difficult enemies to the spawn pool
 */
  spawnEnemy() {
    if (
      this.scene.activeEnemies < this.scene.strength &&
      this.scene.nestSize > 0
    ) {
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
        enemy = new Blue(this.scene, x, y);
      } else if (chance === 1) {
        enemy = new Orange(this.scene, x, y);
      } else if (chance === 2) {
        enemy = new Yellow(this.scene, x, y);
      } else if (chance === 3) {
        enemy = new Gray(this.scene, x, y);
      } else if (chance === 4) {
        enemy = new Purple(this.scene, x, y);
      } else if (chance === 5) {
        enemy = new Aqua(this.scene, x, y);
      } else {
        enemy = new Green(this.scene, x, y);
      }
      enemy.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      enemy.setRotation(angle);
      if (enemy.machine.state === "init") {
        enemy.init.spawnAngle = angle;
      }
      if (enemy.hitbox) {
        this.scene.hitboxes.add(enemy.hitbox);
      }
      this.scene.enemies.add(enemy);
    }
  }

  spawnTimer() {
    this.scene.spawnTimer = this.scene.time.addEvent({
      delay: this.scene.scaler,
      callback: () => this.spawnEnemy(),
      loop: true,
    });

    this.scene.time.addEvent({
      delay: 10000,
      callback: () => {
        if (this.scene.scaler > 500) {
          this.scene.scaler -= 500;
          console.log("Updated scaler:", this.scene.scaler);

          // Recreate the spawn timer with the updated delay
          this.scene.spawnTimer.remove(); // Remove the existing timer
          this.scene.spawnTimer = this.scene.time.addEvent({
            delay: this.scene.scaler,
            callback: () => this.spawnEnemy(),
            loop: true,
          });
        }
      },
      loop: true,
    });
  }

  entityCleanUp() {
    const margin = 32;
    this.scene.enemies.children.iterate((enemy) => {
      if (enemy) {
        enemy.update(this.scene.player);
        // Despawn enemies if they leave play area:
        if (
          enemy.x < -margin ||
          enemy.x > 1000 + margin ||
          enemy.y < -margin ||
          enemy.y > 750 + margin
        ) {
          this.scene.enemies.remove(enemy, true, false);
        }
      }
    });
    //Update hitbox group:
    this.scene.hitboxes.children.iterate((hitbox) => {
      if (hitbox) {
        if (hitbox.update()) {
          hitbox.update(this.scene.player);
        }
        // Despawn hitboxes if they leave play area:
        if (
          hitbox.x < -margin ||
          hitbox.x > 1000 + margin ||
          hitbox.y < -margin ||
          hitbox.y > 750 + margin
        ) {
          if (hitbox.owner && hitbox.owner.hitbox === hitbox) {
            hitbox.owner.hitbox = null;
          }

          this.scene.hitboxes.remove(hitbox, true, false);
        }
      }
    });
  }
  //Player Mechanics:
  attackListener() {
    this.scene.input.on("pointerdown", () => {
      if (
        this.scene.player.machine.state === "moving" &&
        this.scene.player.timers.attackTimer === 0 &&
        this.scene.player.machine.state !== "attacking" &&
        this.scene.player.timers.coolDown === 0
      ) {
        this.scene.player.machine.state = "attacking";
        this.scene.player.timers.attackTimer = 30;
      }
    });
  }
  playerUpdate() {
    const target = this.scene.input.activePointer;
    this.scene.player.update(target);
  }

  //Colliders/ Enemy Updaters:
  colliders() {
    this.scene.physics.add.collider(
      this.scene.player,
      this.scene.enemies,
      (player, enemy) => {
        player.onCollide(enemy);
        enemy.onCollide(player);
      }
    );
    this.scene.physics.add.collider(
      this.scene.enemies,
      this.scene.enemies,
      (g1, g2) => {
        g1.onCollide(g2);
        g2.onCollide(g1);
      }
    );
    this.scene.physics.add.overlap(
      this.scene.player.hitboxes,
      this.scene.enemies,
      (hb, e) => {
        this.scene.player.onHit(e);
      }
    );
    this.scene.physics.add.overlap(
      this.scene.hitboxes,
      this.scene.enemies,
      (hb, e) => {
        hb.owner.onHit(e);
      }
    );
    this.scene.physics.add.overlap(
      this.scene.player,
      this.scene.hitboxes,
      (p, hb) => {
        hb.owner.onHit(p);
      }
    );
    this.scene.physics.add.overlap(
      this.scene.player.hitboxes,
      this.scene.hitboxes,
      (p, hb) => {
        this.scene.player.onHit(hb);
      }
    );
  }

  //Meta: (Saving, Player Data)

  endingEvents() {
    this.scene.events.once("playerDied", () => {
      const totalDeaths = this.scene.registry.get("totalDeaths") || 0;
      this.scene.registry.set("totalDeaths", totalDeaths + 1);
      this.setHiScore();
      this.scene.scene.start("GameOver");
    });

    this.scene.events.once("win", () => {
      const wins = this.scene.registry.get("wins") || 0;
      this.scene.registry.set("wins", wins + 1);
      this.setHiScore();
      this.scene.scene.start("Win");
    });
  }

  save() {
    const registryData = this.scene.registry.values;
    localStorage.setItem("marboidsSave", JSON.stringify(registryData));
  }

  setHiScore() {
    this.scene.registry.set("finalScore", this.scene.score);
    this.setCurrency(this.scene.score);
    const highScore = this.scene.registry.get("highScore") || 0;
    if (this.scene.score > highScore) {
      this.scene.registry.set("highScore", this.scene.score);
    }
    this.save();
  }

  setCurrency(addition) {
    const currency = this.scene.registry.get("currency") || 0;
    this.scene.registry.set("currency", currency + addition);
  }
}
