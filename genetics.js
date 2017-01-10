//jshint ignore:start

function Individual() {
	this.genome = [];
	this.distance = 0;
	this.fitness = 0;
}

/*
	Main.genetics can solve the two problems:

	1. What connections lead to the best connections to distance ratio
	2. What solution will have the most connections under a distance
*/
main.genetics = {
	
	individuals: [],
	fittestTierIndividuals: [],

	populationLength: 2,

	generation: 0,

	genomeLength: 2,

	mutationProbability: 0.4,
	useUnusedGeneProbability: 0.2, //probability

	useTournamentSelection: true,

	//initialized in init()
	//affects tournament pressure
	tournamentSize: undefined,

	/*
		Working on problem variable can either be 0 or 1

		0: What is the best distance to connection ratio (Connections to Distance)
		1: What solution has the most connections under a distance (Connections under D)
	*/
	ratioOrDistanceProblem: undefined,
	maxDistance: 10,

	//10:1 ratio for points length to random genome length
	randomGenomeLengthMax: main.amountOfRandomPoints/10,
	
	//a mode were the program actively searches for genes less than the distance k
	//and 
	UNDER_D_SEARCH_MODE: false,

	initIndividuals: function() {

		if(this.ratioOrDistanceProblem == 1 && main.amountOfRandomPoints < 10)
			throw Error("Amount of random points is less than 10. Random genome lengths are set to a 10:1 ratio! We can't have less than 10!");
			
		if(this.individuals.length > 0) {
			throw Error("Cannot initialize individuals while it is already initialized!");
		}

		this.individuals = [];
		for (var i = 0; i < this.populationLength; i++) {
			this.individuals.push(new Individual());
			this.individuals[this.individuals.length - 1].genome = this.createRandomGenome();

			this.individuals[this.individuals.length - 1].distance = main.calculateSumOfDistances(this.individuals[this.individuals.length - 1].genome);

			//Fitness equals ratio of connections (genome length) to distance
			//(connections per unit distance)
			//F = C / D
			this.individuals[this.individuals.length - 1].fitness = this.individuals[this.individuals.length - 1].genome.length /
				this.individuals[this.individuals.length - 1].distance;
		}
	},

	//TODO: in crossover function, swap unusedgene and uncommon genes in the end of the loop
	crossoverParents: function(parent1, parent2) {
		if (parent1.genome.length != parent2.genome.length)
			throw Error("Parent 1 and 2 do not have equivalent genome lengths!");

		var commonGenes = [],
			uncommonGenes = [],
			//use concat to dereference unusedGenes variable from main.randomPoints
			unusedGenes = main.randomPoints.concat(),

			childGenome = [],
			genomeLength = parent1.genome.length,

			indexOfCoords = main.genetics.indexOfObjectCoordinates,

			//probabilties
			mutationProbability = main.genetics.mutationProbability,
			useUnusedGeneProbability = main.genetics.useUnusedGeneProbability;

		//creation of uncommon, common, and unusedGene
		for(var i = 0; i < genomeLength; i++) {

			//we loop through each parent's genome simultaneously
			//and we check each of their genome index's with each other
			//to find common, uncommon, and unused genes
			var parentOneIndex = parent1.genome[i],
				parentTwoIndex = parent2.genome[i];

			var parentOneIndex_in_parentTwoGenome = indexOfCoords(parent2.genome, parentOneIndex),
				parentOneIndex_in_unusedGeneArray = indexOfCoords(unusedGenes, parentOneIndex);

			var parentTwoIndex_in_parentOneGenome = indexOfCoords(parent1.genome, parentTwoIndex);

			if(parentOneIndex_in_parentTwoGenome != -1)
				commonGenes.push(parentOneIndex);
			else
				uncommonGenes.push(parentOneIndex);

			unusedGenes.splice(parentOneIndex_in_unusedGeneArray, 1);

			//if true, we will define parentTwoIndex_in_unusedGeneArray
			if(parentTwoIndex_in_parentOneGenome == -1) {
				uncommonGenes.push(parentTwoIndex);
				unusedGenes.splice(indexOfCoords(unusedGenes, parentTwoIndex), 1);
			}
		}
		
		//creation of childGenome	
		for (var j = 0; j < genomeLength; j++) {

			var useCommonGenes = commonGenes.length > 0 && !(Math.random() < mutationProbability);

			if (useCommonGenes) {
				var randomIndex = Math.floor(Math.random() * (commonGenes.length));

				childGenome.push(commonGenes[randomIndex]);
				commonGenes.splice(randomIndex, 1);

				continue;
			}

			var useUnusedGeneArrayForMutation = (Math.random() <= useUnusedGeneProbability)	&&
				unusedGenes.length !== 0;
			
			if (useUnusedGeneArrayForMutation) {
				main.genetics.pushMutatedGene(true, unusedGenes, uncommonGenes, childGenome);
				
				continue;

			} else {

				//if uncommongenes is empty, push random index commongene index
				if (uncommonGenes.length === 0) {
					var randomIndex = Math.floor(Math.random() * (commonGenes.length));

					childGenome.push(commonGenes[randomIndex]);
					commonGenes.splice(randomIndex, 1);

					continue;
				}

				//we're using uncommon genes because we didn't choose to use unusedgenes
				//and also uncommon gene array is not empty, if it were, the above
				//if statement would execute 
				main.genetics.pushMutatedGene(false, unusedGenes, uncommonGenes, childGenome);

			}

		}

		return childGenome;

	},

	pushMutatedGene: function(useUnusedGeneArray, unusedGenes, uncommonGenes, childGenome) {
		var genePoolChoice = useUnusedGeneArray ? unusedGenes : uncommonGenes,
			randomIndex = Math.floor(Math.random() * (genePoolChoice.length));

		childGenome.push(genePoolChoice[randomIndex]);
		genePoolChoice.splice(randomIndex, 1);
	},

	// initIndividual: function(crossParent1, crossParent2) {
	// 	var individual = new Individual();

	// 	individual.genome = main.genetics.crossoverParents(crossParent1, crossParent2);

	// 	individual.distance = main.calculateSumOfDistances(individual.genome);
	// 	individual.fitness = individual.genome.length / individual.distance;

	// 	return individual;
	// },

	getFittestIndividual: function(populationArray) {
		var fittest = populationArray[0],
			_tempArray = [];

		for (var i = 1; i < populationArray.length; i++)

			if (fittest.fitness < populationArray[i].fitness)
				fittest = populationArray[i];

		return fittest;
	},

	//creates random genome from random coordinates array
	createRandomGenome: function() {
		var genome = [],
			genomeLength = undefined;

		if(this.ratioOrDistanceProblem == 0)
			genomeLength = main.genetics.genomeLength;
		else if(this.ratioOrDistanceProblem == 1)
			genomeLength = Math.floor(Math.random() * (main.genetics.randomGenomeLengthMax));
		else
			throw Error("What is life. What is ratioOrDistanceProblem equal to.");

		if(genomeLength == 0) genomeLength++;

		//todo: instead of making a new version of random points array every time
		//since we're doing random, we can just use a dereferenced version and have
		//it be spliced until it is empty and we can just reset. lasagna for thought

		var _randomPoints = main.randomPoints.concat(); //dereference from main variable

		for (var i = 0; i < genomeLength; i++) {
			var randomIndex = Math.floor(Math.random() * (_randomPoints.length));
			_randomPoints.splice(randomIndex, 1);

			genome.push(main.randomPoints[randomIndex]);
		}

		return genome;
	},

	indexOfObjectCoordinates: function(array, object) {
		for (var i = 0; i < array.length; i++)
			if (array[i].x == object.x && array[i].y == object.y)
				return i;

		return -1;
	},

	createGeneration: function(whichProblem) {

		if(whichProblem == null && this.ratioOrDistanceProblem == undefined)
			throw Error("whichProblem has been left undefined! Fix it.");

		if(whichProblem == null) whichProblem = this.ratioOrDistanceProblem;

		if(this.ratioOrDistanceProblem != undefined && whichProblem != this.ratioOrDistanceProblem)
			throw Error("We can't change the problem number after initializing!");
		//can either by 0 or 1; ratio or distance problem
		this.ratioOrDistanceProblem = whichProblem;

		this.generation++;

		if (this.individuals.length === 0) {
			this.initIndividuals();
				
			console.log("Initindividuals() called because individuals array is empty!");
		}

		var newGeneration = [];
		if (this.useTournamentSelection) {

			//minus 1 from populationLength because we push fittestIndividual
			for (var i = 0; i < main.genetics.populationLength; i++) {
				var parent1 = this.tournamentSelection(this.individuals),
					parent2 = this.tournamentSelection(this.individuals),
					child = new Individual();

				//will later merge the two seperate crossoverParents functions
				//child.genome = this.crossoverParents(parent1, parent2);

				if(this.ratioOrDistanceProblem == 0) {
					child.genome = this.crossoverParents(parent1, parent2);
					child.distance = main.calculateSumOfDistances(child.genome);
					child.fitness = child.genome.length / child.distance;
				
				} else if(this.ratioOrDistanceProblem == 1) {

					child.genome = main.genetics.variedGenomeLength.crossoverParents(parent1, parent2);
					console.log(child.genome);
					child.distance = main.calculateSumOfDistances(child.genome);
					console.log(child.distance );
					//terminate child if he exceeds the max distance
					// if(child.distance > this.maxDistance) {
					// 	child.fitness = 0;	
					// 	newGeneration.push(child);

					// 	continue;
					// }

					child.fitness = main.genetics.variedGenomeLength.getIndividualFitness(child.genome.length, child.distance);

				} else
					throw Error("What is life? What is ratioOrDistanceProblem equal to? Entropy. Life. Accidents. What are they? What is they?");

				newGeneration.push(child);
			}

		}

		//newGeneration.push(this.getFittestIndividual(this.individuals));
		
		console.log("Average Fitness of Generation: " + this.averageFitnessOfGeneration(newGeneration));
		if(this.ratioOrDistanceProblem == 1)
			console.log("Average Genome Length of Generation: " + this.variedGenomeLength.averageGenomeLength(newGeneration));

		this.individuals = newGeneration;

		main.drawOnly = {
			color: "red",
			connections: main.genetics.getFittestIndividual(this.individuals).genome
		};

		main.renderConnections(main.canvas);
		
	},

	//temporary --- will be automatic until testing is done.
	nextTierGeneration: function() {
		this.generation = 0;
		this.genomeLength++;

		this.individuals = [];

		this.fittestTierIndividuals.push(this.getFittestIndividual(this.individuals));
	},

	tournamentSelection: function(individuals) {
		var randomlySelected = [];

		if (main.genetics.tournamentSize >= main.genetics.populationSize)
			throw Error("Tournament size is greater than the amount of individuals.");

		for (var i = 0; i < main.genetics.tournamentSize; i++)
			randomlySelected.push(individuals[Math.floor(Math.random() * individuals.length)]);

		var bestIndividual = randomlySelected[0];

		for (var j = 0; j < randomlySelected.length; j++) {
			if (randomlySelected[j].fitness > bestIndividual.fitness)
				bestIndividual = randomlySelected[j];
		}

		return individuals[Math.floor(Math.random() * individuals.length)];

	},

	averageFitnessOfGeneration: function(population) {
		var sumOfFitnesses = 0;

		for (var i = 0; i < population.length; i++) {
			sumOfFitnesses += population[i].fitness;
		}

			return sumOfFitnesses / population.length;
	}

};

//modified or new functions to handle different genome lengths
main.genetics.variedGenomeLength = {

	multiplier: 0.05,
	//n = x/10
	randomLengthRatio: Math.floor(main.amountOfRandomPoints/10),

	crossoverParents: function(parent1, parent2) {
		
		var commonGenes = [],
			uncommonGenes = [],
			//use concat to dereference unusedGenes variable from main.randomPoints
			unusedGenes = main.randomPoints.concat(),

			childGenome = [],
			genomeLength = parent1.genome.length,

			indexOfCoords = main.genetics.indexOfObjectCoordinates,

			mutationProbability = main.genetics.mutationProbability,
			useUnusedGeneProbability = main.genetics.useUnusedGeneProbability;

		var longestGenomeLengthOfParents = undefined;

		if(parent1.genome.length > parent2.genome.length)
			longestGenomeLengthOfParents = parent1.genome.length;
		else
			longestGenomeLengthOfParents = parent2.genome.length;

		//====== Where it gets modified =============
		//we use the longest parent genome length because
		//we can keep going through the genome length simultaneously
		//but we can stop checking one of the parents when one
		//reaches/surpasses its genome length


		for (var i = 0; i < longestGenomeLengthOfParents; i++) {
			var parentOneIndex = parent1.genome[i],
				parentTwoIndex = parent2.genome[i];

			var parentOneIndex_in_parentTwoGenome,
				parentOneIndex_in_unusedGeneArray;

			var parentTwoIndex_in_parentOneGenome;

			if(parentOneIndex != null) {
				parentOneIndex_in_parentTwoGenome = indexOfCoords(parent2.genome, parentOneIndex);
				parentOneIndex_in_unusedGeneArray = indexOfCoords(unusedGenes, parentOneIndex);

				if(parentOneIndex_in_parentTwoGenome != -1){
					commonGenes.push(parentOneIndex);
					console.log(commonGenes);
				}
				else
					uncommonGenes.push(parentOneIndex);

				unusedGenes.splice(parentOneIndex_in_unusedGeneArray, 1);
			}

			if(parentTwoIndex != null) {
				parentTwoIndex_in_parentOneGenome = indexOfCoords(parent1.genome, parentTwoIndex);
				
				if(parentTwoIndex_in_parentOneGenome == -1) {
					uncommonGenes.push(parentTwoIndex);
					unusedGenes.splice(indexOfCoords(unusedGenes, parentTwoIndex), 1);
				}

			}

		}


		console.log("===========================================");

		console.log(parent1);
		console.log(parent2);

		console.log(commonGenes);
		console.log(uncommonGenes);
		console.log(uncommonGenes[0]);
		console.log(uncommonGenes[1]);
		console.log(unusedGenes);
		console.log("===========================================");

		/*
		TODO: GENOMELENGTH WILL BE CHANGED AFTER THE CREATIONG OF RANDOM DISUNIFORM DISTRIBUTION IS FINISHED
		*/

		var fittestIndividual = undefined;

		if(parent1.fitness >= parent2.fitness)
			fittestIndividual = parent1;
		else if(parent2.fitness > parent1.fitness)
			fittestIndividual = parent2;

		var randomGenomeLength = this.getRandomGenomeLength(fittestIndividual);
		
		//creation of childGenome	
		for (var j = 0; j < randomGenomeLength; j++) {

			var useCommonGenes = commonGenes.length > 0 && !(Math.random() < mutationProbability);

			if (useCommonGenes) {
				var randomIndex = Math.floor(Math.random() * (commonGenes.length));
				
				childGenome.push(commonGenes[randomIndex]);
				commonGenes.splice(randomIndex, 1);

					if(childGenome[childGenome.length-1] == undefined)
						throw "undefined bruuhhh";
				continue;
			}

			var useUnusedGeneArrayForMutation = (Math.random() <= useUnusedGeneProbability)	&&
				unusedGenes.length !== 0;
			
			if (useUnusedGeneArrayForMutation) {
				main.genetics.pushMutatedGene(true, unusedGenes, uncommonGenes, childGenome);

					if(childGenome[childGenome.length-1] == undefined)
						throw "undefined bruuhhh";				
				continue;

			} else {

				//if uncommongenes is empty, push random index commongene index
				if (uncommonGenes.length === 0) {

					if(commonGenes.length === 0) {
						main.genetics.pushMutatedGene(true, unusedGenes, uncommonGenes, childGenome);						
						continue;		
					}

					var randomIndex = Math.floor(Math.random() * (commonGenes.length));

					childGenome.push(commonGenes[randomIndex]);

					

					commonGenes.splice(randomIndex, 1);

					continue;
				}

				//we're using uncommon genes because we didn't choose to use unusedgenes
				//and also uncommon gene array is not empty
				main.genetics.pushMutatedGene(false, unusedGenes, uncommonGenes, childGenome);
			}

		}

		if(childGenome.length > main.randomPoints.length || childGenome.length < 0)
			throw Error("Child genome is greater than max genome or less than 0");

		return childGenome;

	},

	getIndividualFitness: function(connections, distance) {
		//Individual fitness = (connections/distance) + m(c-1) + m_2(d-k)
		//where k is max distance
		return (connections/distance) + (this.multiplier * (connections - 1)) - 0.1*(distance-main.genetics.maxDistance);

	},

	getRandomGenomeLength: function(fittestIndividual) {
		
		var sign = Math.random() > 0.5 ? "add" : "subtract";

		// var maxNegative = -(fittestIndividual.genome.length);
		// var maxPositive = main.randomPoints.length - fittestIndividual.genome.length;

		

		// (idea)
		// Without n = x/10 for random set, but using the equation

		// console.log(maxPositive);
		// console.log(fittestIndividual.genome.length);
		// if(sign == "add") 
		// 	return fittestIndividual.genome.length + Math.floor(Math.random() * (maxPositive));
		// else if(sign == "subtract")
		// 	return fittestIndividual.genome.length - Math.floor(Math.random() * (maxNegative));
		
		

		// var addingMax = this.randomLengthRatio > maxPositive ? maxPositive : this.randomLengthRatio;
		// var subtractingMax = -(this.randomLengthRatio) < maxNegative ? maxNegative : -this.randomLengthRatio;


		// if(sign == "add") {
		// 	console.log(fittestIndividual.genome.length + Math.floor(Math.random() * (addingMax)));
		// 	return fittestIndividual.genome.length + Math.floor(Math.random() * (addingMax));
		// }
		// else if(sign == "subtract"){
		// 	console.log(fittestIndividual.genome.length - Math.floor(Math.random() * (subtractingMax)));
		// 	return fittestIndividual.genome.length - Math.floor(Math.random() * (subtractingMax));
		// }


		if(sign == "add") {
			var length = Math.floor(Math.random() * (this.randomLengthRatio)) + fittestIndividual.genome.length;
			
			if(length > main.randomPoints.length)
				length = main.randomPoints.length;

			return length;

		} else if(sign == "subtract") {
			var length = fittestIndividual.genome.length - Math.floor(Math.random() * (this.randomLengthRatio));
			
			if(length < 1)
				length = 1;

			return length;
		}

	},

	averageGenomeLength: function(population) {
		var sum = 0;

		for(var i = 0; i < population.length; i++)
			sum += population[i].genome.length;

		return sum / population.length;
	}

}

function disuniformDistribution(distributionArrayMax) {
	if(distributionArrayMax == null)
		throw Error("Argument for disuniformDistribution is not set! (distributionArrayMax)");

	this.distributionArray = [];

	this.numberAndAttribute = [];	
	this.distributionArrayMax = distributionArray;

	this.probabilityCount = 0;
}

disuniformDistribution.prototype.setNumberAndProbability = function(number, probability) {
	if(this.probabilityCount + probability > 1)
		throw Error("Probability  for " + number + " is too large for the sum of past numbers and their probabilities.");

	this.numberAndAttribute.push([number, probability]);
};

disuniformDistribution.prototype.resetDistributionVariables = function(distributionArrayMax) {};

//uses info gained from setNumberProbability function to initialize the distribution array once finished
disuniformDistribution.prototype.initializeArray = function() {
	for(var i = 0 ; i < this.numberAndAttribute.length; i++) {
		//j is less than the amount of the number (probability * max)
		for(var j = 0; j < this.numberAndAttribute[i][1] * this.distributionArrayMax; i++) {
			this.distributionArray.push(this.numberAndAttribute[i][0]);
		}
	}
};

