import Genome from "./genome.js";

let genomeInputsN = 9;
let genomeOutputN = 4;
//The Player Class
//The interface between our
//NeuralNetwork and the game
class Player {
  constructor(id, x, y) {
    this.brain = new Genome(genomeInputsN, genomeOutputN);
    this.fitness = 0;
    this.id = id;
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
    this.score = 1;
    this.dead = false;
    this.decisions = []; //Current Output values //  Size 4 // left x direction number, right x direction number, top y direction number, down y direction number
    this.vision = []; //Current input values // 6 values // current x, current y, Closest Prey x and y and closest predator x and y
    this.color = "#" + Math.floor(Math.random() * 16777215).toString(16);
    this.moving = false;
    this.lifeSpan = 0;
  }

  clone() {
    //Returns a copy of this player
    let clone = new Player();
    clone.brain = this.brain.clone();
    return clone;
  }

  crossover(parent) {
    //Produce a child
    let x = Math.floor(Math.random() * 650);
    let y = Math.floor(Math.random() * 400);
    let child = new Player(this.id, x, y);
    if (parent.fitness <= this.fitness) {
      child.brain = this.brain.crossover(parent.brain);
    } else {
      child.brain = parent.brain.crossover(this.brain);
      child.id = parent.id;
    }

    child.color = child.mixColor(parent.mixColorWithPlayer(this));
    child.brain.mutate();
    return child;
  }

  mixColor(otherColor) {
    let colorA = this.color;
    let numA = colorA.substring(1);
    let numB = otherColor.substring(1);
    let num1 = parseInt(numA, 16);
    let num2 = parseInt(numB, 16);
    let avg = Math.floor(num2);
    return "#" + avg.toString(16);
  }

  mixColorWithPlayer(otherPlayer) {
    let colorA = this.color;
    let colorB = otherPlayer.color;
    let numA = colorA.substring(1);
    let numB = colorB.substring(1);

    let num1 = parseInt(numA, 16);
    let num2 = parseInt(numB, 16);
    let avg = Math.floor((num1 + num2) / 2);
    return "#" + avg.toString(16);
  }

  //Game stuff
  look(population) {
    let closest = population[0];
    let secondClosest = population[0];
    for (let i = 0; i < population.length; i++) {
      let other = population[i];
      if (this.distance(other) < this.distance(closest) && other !== this) {
        secondClosest = closest;
        closest = other;
      }

      this.vision = [
        this.x,
        this.y,
        this.score,
        closest.x,
        closest.y,
        closest.score,
        secondClosest.x,
        secondClosest.y,
        secondClosest.score,
      ];
    }
  }

  think() {
    this.decisions = this.brain.feedForward(this.vision);
  }

  move() {
    if (this.decisions[0] > this.decisions[1]) {
      this.x = Math.max(0 + this.score + 5, this.x - 10 / (this.score + 5));
      this.moving = true;
    }
    if (this.decisions[0] < this.decisions[1]) {
      this.x = Math.min(650 - (this.score + 5), this.x + 10 / (this.score + 5));
      this.moving = true;
    }

    if (this.decisions[2] < this.decisions[3]) {
      this.y = Math.max(0 + (this.score + 5), this.y - 7 / (this.score + 5));
      this.moving = true;
    }
    if (this.decisions[2] > this.decisions[3]) {
      this.y = Math.min(400 - (this.score + 5), this.y + 7 / (this.score + 5));
      this.moving = true;
    }

    if (
      this.decisions[0] === this.decisions[1] &&
      this.decisions[2] === this.decisions[3]
    ) {
      this.moving = false;
    }
  }

  eat(preyList) {
    preyList.forEach((prey) => {
      prey.dead = true;
      this.score += prey.score;
      prey.score -= 5; // this.score;
    });
  }

  update(population) {
    this.eat(this.overlappingCells(population));
    this.lifeSpan++;
  }

  distance(other) {
    return Math.hypot(this.x - other.x, this.y - other.y);
  }

  draw() {
    if (!this.dead) {
      const c = document.getElementById("theGame");
      const ctx = c.getContext("2d");
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.min(50, this.score + 5), 0, 2 * Math.PI);
      ctx.fillStyle = this.color;
      // ctx.stroke();
      ctx.fill();
    }
  }

  overlappingCells(population) {
    let allEat = [];
    for (let i = 0; i < population.length; i++) {
      let other = population[i];
      if (
        this.distance(other) < Math.min(100, this.score + other.score + 10) &&
        !other.dead &&
        other !== this &&
        this.score >= other.score
      ) {
        allEat.push(other);
      }
    }
    return allEat;
  }
  /*
	show(){
		push();
		if(this.correctVal == this.val) {
			if(this.correctVal == 1)
				fill(0, 255, 0);
			
			if(this.correctVal == 0)
				fill(0, 0, 255);

			ellipse(points[this.lifespan - 1].x * width, points[this.lifespan - 1].y * height, 6)
		} else {
			fill(255, 0, 0);
			ellipse(points[this.lifespan - 1].x * width, points[this.lifespan - 1].y * height, 6)
		}
		pop();
	}
    */

  calculateFitness(predationScalar, lifeSpanScalar) {
    //Fitness function : adapt it to the needs of the
    // console.log(this.score);
    this.fitness =
      1 + predationScalar * this.score + lifeSpanScalar * (this.lifeSpan / 34); //this.score +
    this.fitness /= this.brain.calculateWeight();
  }
}

export default Player;
