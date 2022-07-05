import Player from "./player.js";

let genomeInputsN = 4;
let genomeOutputN = 2;
let showBest = false;

//The Population Class
//Here is where the power of all the classes
//comes together to destroy the game score records
class Population {
  constructor(size, inputsArray) {
    this.population = [];
    //this.bestPlayer;
    this.bestFitness = 0;
    this.inputsArray = inputsArray;
    this.generation = 0;
    this.matingPool = [];

    for (let i = 0; i < size; i++) {
      let x = Math.floor(Math.random() * 650);
      let y = Math.floor(Math.random() * 400);

      this.population.push(new Player(i, x, y));
      this.population[i].brain.generateNetwork();
      this.population[i].brain.mutate();
    }
  }

  clone() {
    let clone = new Population(this.population.length, this.inputsArray);
    clone.population = [...this.population];
    clone.bestFitness = this.bestFitness;
    clone.generation = this.generation;
    clone.matingPool = [...this.matingPool];

    return clone;
  }

  updateAlive() {
    for (let i = 0; i < this.population.length; i++) {
      if (!this.population[i].dead) {
        this.population[i].look(this.population);
        this.population[i].think();
        this.population[i].move();
        this.population[i].update(this.population);
        //this.population[i].show();
      }
    }

    /*
		if(showBest && this.bestPlayer && !this.bestPlayer.dead) {
			this.bestPlayer.look(this.population);
			this.bestPlayer.think();
			this.bestPlayer.move();
			this.bestPlayer.update(this.population);
			this.bestPlayer.show();
		}
        */
  }

  done(timeToFinish) {
    let deadCount = this.population.length;
    let allStopped = true;
    for (let i = 0; i < this.population.length; i++) {
      if (this.population[i].dead) {
        deadCount++;
      }
      if (this.population[i].moving) {
        allStopped = false;
      }
      if (this.population[i].lifeSpan >= timeToFinish) {
        return true;
      }
    }
    if (allStopped) {
      return true;
    }
    return deadCount < this.population.length - 3;
  }

  finishGen(timeToFinish) {
    while (!this.done(timeToFinish)) {
      this.updateAlive();
    }
  }

  naturalSelection(predationScalar, lifeSpanScalar) {
    this.calculateFitness(predationScalar, lifeSpanScalar);

    let averageSum = this.getAverageScore();
    let children = [];
    this.fillMatingPool();
    for (let i = 0; i < this.population.length; i++) {
      let parent1 = this.selectPlayer();
      let parent2 = this.selectPlayer();
      if (parent1.fitness > parent2.fitness)
        children.push(parent1.crossover(parent2));
      else children.push(parent2.crossover(parent1));
    }

    this.population.splice(0, this.population.length);
    this.population = children.slice(0);
    this.generation++;
    this.population.forEach((element) => {
      element.brain.generateNetwork();
    });

    // this.bestPlayer.lifespan = 0;
    // this.bestPlayer.dead = false;
    // this.bestPlayer.score = 1;
  }

  draw() {
    this.population.forEach((player) => player.draw());
  }

  calculateFitness(predationScalar, lifeSpanScalar) {
    let currentMax = 0;
    this.population.forEach((element) => {
      element.calculateFitness(predationScalar, lifeSpanScalar);
      if (element.fitness > this.bestFitness) {
        this.bestFitness = element.fitness;
        this.bestPlayer = element.clone();
        this.bestPlayer.brain.id = "BestGenome";
        this.bestPlayer.brain.draw();
      }

      if (element.fitness > currentMax) currentMax = element.fitness;
    });

    //Normalize
    this.population.forEach((element, elementN) => {
      element.fitness /= currentMax;
    });
  }

  fillMatingPool() {
    this.matingPool.splice(0, this.matingPool.length);
    this.population.forEach((element, elementN) => {
      let n = element.fitness * 100;
      for (let i = 0; i < n; i++) this.matingPool.push(elementN);
    });
  }

  selectPlayer() {
    let rand = Math.floor(Math.random() * this.matingPool.length);
    return this.population[this.matingPool[rand]];
  }

  getAverageScore() {
    let avSum = 0;
    this.population.forEach((element) => {
      avSum += element.score;
    });

    return avSum / this.population.length;
  }
}

export default Population;
