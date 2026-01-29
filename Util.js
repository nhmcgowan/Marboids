import {
  Green,
  Blue,
  Orange,
  Yellow,
  Gray,
  Purple,
  Brown,
  Aqua,
  Olive,
  Silver,
} from "./Entities.js";

export class Util {
  constructor(scene) {
    this.scene = scene;
    this.uiReady = false;
    this.roster = [Aqua]; //[Green, Green, Green];
    this.dugout = []; //[Yellow, Orange, Blue, Purple, Gray, Aqua, Olive, Silver, Brown];
  }

  debug(targets = []) {
    targets.forEach((target) => {
      const debugGraphics = this.scene.add.graphics();
      debugGraphics.lineStyle(2, 0xff0000, 1);
      const bounds = target.getBounds();
      debugGraphics.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      debugGraphics.fillStyle(0xff0000, 1);
      debugGraphics.fillCircle(target.x, target.y, 2);
    });
  }
  //User Interface:
  scorePopup(x, y, value) {
    const popup = this.scene.add
      .text(x, y, `฿${value}`, {
        fontSize: "24px",
        fontFamily: "VT323, monospace",
        fill: "#ffffff",
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
    if (this.scene.scoreText) this.scene.scoreText.destroy();
    if (this.scene.enemiesLeft) this.scene.enemiesLeft.destroy();
    if (this.scene.quit) this.scene.quit.destroy();
    if (this.scene.healthBar) this.scene.healthBar.destroy();
    this.uiReady = false;
    this.popup = false;

    this.scene.scoreText = this.scene.add
      .text(50, 28, "00", {
        fontSize: "30px",
        fontFamily: "VT323, monospace",
        fill: "#24c50a",
      })
      .setOrigin(0.5, 0.5);

    this.scene.intensity = this.scene.add.text(50, 50, `Error`, {
      fontSize: "30px",
      fontFamily: "VT323, monospace",
      fill: "#24c50a",
    });

    this.scene.enemiesLeft = this.scene.add
      .text(500, 32, `${this.scene.nestSize}`, {
        fontSize: "30px",
        fontFamily: "VT323, monospace",
        fill: "#24c50a",
      })
      .setOrigin(0.5, 0.5);

    const esc = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );
    esc.on("down", () => {
      this.scene.scene.start("MainMenu");
    });

    this.scene.enemiesLeft.setDepth(1);
    this.scene.scoreText.setDepth(1);
    this.scene.healthBar = this.scene.add.graphics();
    const barWidth = this.scene.nestSize;
    const gameWidth = this.scene.sys.game.config.width;
    const x = (gameWidth - barWidth) / 2;

    this.scene.healthBar.setPosition(x, 0);
    this.scene.enemiesLeft.setPosition(x - 4, 22);
    this.uiReady = true;
  }

  uiUpdate() {
    if (
      !this.uiReady ||
      !this.scene.healthBar ||
      !this.scene.scoreText ||
      !this.scene.enemiesLeft
    )
      return;
    this.scene.healthBar.clear();
    if (this.scene.nestSize < 1000) {
      this.scene.healthBar.fillStyle(0x24c50a);
      this.scene.healthBar.fillRect(15, 15, this.scene.nestSize, 15);
      this.scene.enemiesLeft.setText(this.scene.nestSize);
    } else {
      this.scene.enemiesLeft.setStyle({ fontSize: 48 });
      this.scene.enemiesLeft.setPosition(500, 22);
      this.scene.enemiesLeft.setText("∞");
    }
    this.scene.scoreText.setText("฿: " + this.scene.score);
  }

  //Spawn/Despawn Enemies:

  /* SpawnEnemy/Nest Management v2:
    A. Create new scaling system that is simpler to manage and extend [X]
    B. Gradually add more difficult enemies to the spawn pool [X]
    C. Make some enemies rarer than others []
 */

  spawnEnemy(width = 1000, height = 750, margin = 32) {
    if (
      this.scene.activeEnemies < this.scene.strength &&
      this.scene.nestSize > 0
    ) {
      let x, y, angleCenter, enemy;
      const edge = Phaser.Math.Between(0, 3);
      if (edge === 0) {
        x = Phaser.Math.Between(0, width);
        y = -margin;
        angleCenter = Math.PI / 2;
      } else if (edge === 1) {
        x = Phaser.Math.Between(0, width);
        y = height + margin;
        angleCenter = -Math.PI / 2;
      } else if (edge === 2) {
        x = -margin;
        y = Phaser.Math.Between(0, height);
        angleCenter = 0;
      } else {
        x = width + margin;
        y = Phaser.Math.Between(0, height);
        angleCenter = Math.PI;
      }
      const spread = Math.PI / 4;
      const angle = Phaser.Math.FloatBetween(
        angleCenter - spread,
        angleCenter + spread
      );

      let egg = Phaser.Utils.Array.GetRandom(this.roster);

      enemy = new egg(this.scene, x, y);

      let chance = Phaser.Math.Between(1, 20);

      if (chance > 19 && this.dugout.length > 0) {
        let choice = Phaser.Utils.Array.GetRandom(this.dugout);
        Phaser.Utils.Array.Remove(this.dugout, choice);
        Phaser.Utils.Array.Add(this.roster, choice);
      }

      enemy.body.setVelocity(
        Math.cos(angle) * enemy.movement.speed,
        Math.sin(angle) * enemy.movement.speed
      );
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

  spawnTimer(time) {
    if (
      this.scene.nestSize <= this.scene.initSize &&
      this.scene.spawnDelay > 1000
    ) {
      this.scene.spawnDelay -= 100;
      this.scene.initSize -= this.scene.initSize / 10;
    }
    this.scene.currentTime = time;
    if (time - this.scene.lastSpawn > this.scene.spawnDelay) {
      let chance = Phaser.Math.Between(0, 3);
      if (chance === 1 || chance === 0) {
        this.spawnEnemy();
      } else if (chance === 2) {
        this.spawnEnemy();
        this.spawnEnemy();
      } else {
        this.spawnEnemy();
        this.spawnEnemy();
        this.spawnEnemy();
      }
      this.scene.lastSpawn = time;
      this.scene.intensity.setText(
        `spawnDelay: ${this.scene.spawnDelay}\n${Math.floor(
          this.scene.initSize
        )}\n${this.scene.player.spec.nuke}`
      );
    }
  }

  enemyUpdate() {
    this.scene.enemies.children.iterate((enemy) => {
      if (enemy) {
        enemy.update(this.scene.player);
      }
    });
    this.scene.hitboxes.children.iterate((hitbox) => {
      if (hitbox) {
        if (hitbox.update()) {
          hitbox.update(this.scene.player);
        }
      }
    });
  }

  entityCleanUp() {
    const margin = 32;
    this.scene.enemies.children.iterate((enemy) => {
      if (enemy) {
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

    this.scene.hitboxes.children.iterate((hitbox) => {
      if (hitbox) {
        if (hitbox) {
        }
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
    const space = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
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
    space.on("down", () => {
      this.scene.player.ability.specNuke();
    });

    const Q = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.Q
    );

    Q.on("down", () => {
      this.scene.player.ability.specTeleport(this.scene.input.activePointer);
    });
  }

  playerUpdate() {
    const target = this.scene.input.activePointer;
    this.scene.player.update(target);
  }

  //Colliders:
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

  //Meta: (Saving, Player Data, End Game)
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
