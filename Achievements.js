import { MenuUtil } from "./MenuUtil.js";

/*
Achievement System Architectures:
  1. Create achievement objects.
  2. use emitters and listeners.
  3. 
*/

export class AchievementManager {
  constructor(scene) {
    this.scene = scene;
    this.achievements = [
      {
        id: "killGreen1",
        type: "kill",
        description: "Kill one Bumper vectoid. Honestly, this one's a freebie.",
        enemyType: "Green",
        target: 1,
        progress: 0,
        complete: false,
        reward: 1,
        series: "KillGreen",
        order: 1,
        ready: true,
      },
      {
        id: "killGreen10",
        type: "kill",
        description: "Okay, now we're getting serious",
        enemyType: "Green",
        target: 10,
        progress: -1,
        reward: 1,
        complete: false,
        series: "KillGreen",
        order: 2,
        ready: false,
      },
      {
        id: "killGreen50",
        type: "kill",
        description: "Have you seen two of them merge yet?",
        enemyType: "Green",
        target: 50,
        progress: -1,
        reward: 1,
        complete: false,
        series: "KillGreen",
        order: 3,
        ready: false,
      },
      {
        id: "killGreen100",
        type: "kill",
        description: "These guys are pretty annoying at this point",
        enemyType: "Green",
        target: 100,
        progress: -1,
        reward: 1,
        complete: false,
        series: "KillGreen",
        order: 4,
        ready: false,
      },
      {
        id: "killTotal100",
        type: "kill",
        description: "",
        enemyType: "any",
        target: 100,
        progress: -1,
        reward: 1,
        complete: false,
        series: "KillTotal",
        order: 1,
        ready: true,
      },
      {
        id: "scoreTotal100",
        type: "kill",
        description: "",
        enemyType: "any",
        target: 100,
        progress: -1,
        reward: 1,
        complete: false,
        series: "scoreTotal",
        order: 1,
        ready: true,
      },
      {
        id: "nuke",
        type: "spec",
        description: "Use the nuke one time. Feels good doesn't it?",
        target: 1,
        progress: 0,
        complete: false,
        reward: 1,
        series: "nuke",
        oder: 1,
        ready: true,
      },
    ];
    this.loadProgress();

    this.scene.events.on("enemyKilled", (enemy) => {
      this.achievements.forEach((ach) => {
        if (
          ach.type === "kill" &&
          ach.enemyType === enemy.meta.name &&
          ach.ready &&
          !ach.complete
        ) {
          this.trackAch(ach);
        }
        if (
          ach.enemyType === "any" &&
          ach.series === "killTotal" &&
          !ach.complete
        ) {
          this.trackAch(ach);
        }
        if (
          ach.enemyType === "any" &&
          ach.series === "scoreTotal" &&
          !ach.complete
        ) {
          this.trackAch(ach, enemy.meta.value);
        }
      });
    });

    this.scene.events.on("spec", () => {
      this.achievements.forEach(ach);
      if (ach.type === "spec" && ach.ready && !ach.complete) {
        this.trackAch(ach);
      }
    });
  }
  loadProgress() {
    this.achievements =
      this.scene.registry.get("achievements") || this.achievements;
  }
  saveProgress() {
    this.scene.registry.set("achievements", this.achievements);
    const registryData = this.scene.registry.values;
    localStorage.setItem("marboidsSave", JSON.stringify(registryData));
  }

  onComplete(done) {
    this.achievements.forEach((ach) => {
      if (done.series === ach.series && ach.order - done.order === 1) {
        ach.ready = true;
      }
    });
  }

  trackAch(ach, value = false) {
    if (value) {
      ach.progress += value;
      console.log(ach.id, ach.progress);
    } else {
      ach.progress++;
    }

    if (ach.progress >= ach.target) {
      ach.complete = true;
      this.achNotif();
      this.onComplete(ach);
      this.saveProgress();
    } else {
      this.saveProgress();
    }
  }

  achNotif() {
    this.scene.utility.scorePopup(
      this.scene.player.x,
      this.scene.player.y,
      "ACHIEVEMENT---COMPLETE"
    );
  }
}

export class Achievements extends Phaser.Scene {
  constructor() {
    super({
      key: "Achievements",
      physics: {
        arcade: {
          debug: false,
        },
      },
    });
    this.util = new MenuUtil(this);
  }

  create() {
    this.cameras.main.setPostPipeline("crt");
    this.util.backButton();
  }
}
