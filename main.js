/*
	Optimizing DC problem
	Science Fair 2016-17

	Distance and Connections Problem -

	Given a coordinate A, preferably origin, and N amount of random coordinates B,  
	what is the most amount of connections from coordinate A to any random 
	B coordinate while keeping the sum of distance D < K, or while optimizing solutions for the 
	best fitness score of the ratio of connections to distance.

	I don't know what I'm doing.
*/

/*
	TODO:
	Make the x and y of distance text relative to the slope of the lines
	so it doesn't intersect

	Clean up RenderConnection function code

	Clean up CrossoverParents function - four indexOf calls? what?!!

*/

var main = {
	//node in which distance calculation is based on
	mainCoordinate: {
		x: 0,
		y: 0
	},

	nodeWidth: 29,
	nodeHeight: 29,

	canvasWidth: 1080,
	canvasHeight: 1080,

	randomPoints: [],
	amountOfRandomPoints: 25,

	//max x and y for random point generation
	maxX: null,
	maxY: null,

	printDistance: false,

	canvasObject: document.getElementById("canvas"),
	canvas: null,

	//in case we any other algorithms to solve CDP
	enableGeneticOptimization: true,

	//array for holding objects with color and array of points
	//{ color:red, points: [1, 2, 3, ... ] }
	drawSetOfConnections: [],

	//draws only one set of connections
	//drawOnly equals to an array
	drawOnly: undefined,

	init: function() {
		if (main.amountOfRandomPoints <= main.genetics.genomeLength)
			throw Error("Oi. Random points less than genome length mate! That can't do!");

		//main.genetics.tournamentSize = Math.floor(main.genetics.populationLength*0.2);
		main.genetics.tournamentSize = 10

		main.canvasObject.width = main.canvasWidth;
		main.canvasObject.height = main.canvasHeight;


		//since main node is offset in canvas to be at center,
		//the max will only go up to half of its potential
		main.maxX = main.canvasWidth / 2;
		main.maxY = main.canvasHeight / 2;

		main.canvas = main.canvasObject.getContext('2d');

		for (var i = 0; i < main.amountOfRandomPoints; i++) {
			main.randomPoints.push({
				x: Math.floor(Math.random() * (main.maxX * 2 + 1) - main.maxX),
				y: Math.floor(Math.random() * (main.maxY * 2 + 1) - main.maxY)
			});
		}

		main.renderConnections(main.canvas);

		if (main.enableGeneticOptimization)
			main.genetics.initIndividuals();
	},

	//calculates the sum of distances FROM THE MAIN NODE
	calculateSumOfDistances: function(randomPoints) {
		var distanceSum = 0;
//			distanceFromNode = [];

		for (var i = 0; i < randomPoints.length; i++) {
			distanceSum += this.calculateDistance(this.mainCoordinate, randomPoints[i]);
			// distanceFromNode.push({
			// 	x: randomPoints[i].x,
			// 	y: randomPoints[i].y,
			// 	distance: this.calculateDistance(this.mainCoordinate, randomPoints[i])
			// });
		}


		return distanceSum;
	},

	//temporary debug function
	_distanceFromNode: function(point) {
		return this.calculateDistance(thismainCoordinate, point);
	},	

	calculateDistance: function(point1, point2) {
		var deltaX = Math.abs(point1.x - point2.x),
			deltaY = Math.abs(point1.y - point2.y);

		return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
	},

	renderConnections: function(canvas) {
		canvas.beginPath();

		canvas.clearRect(0, 0, main.canvasObject.width, main.canvasObject.height);

		//draws the main center node
		canvas.fillRect(main.mainCoordinate.x + (main.canvasObject.width / 2) - main.nodeWidth / 2,
			main.mainCoordinate.y + (main.canvasObject.width / 2) - main.nodeHeight / 2,
			main.nodeWidth,
			main.nodeHeight);

		canvas.fillStyle = 'orange';
		canvas.fillRect(main.canvasObject.width / 2, 0, 1, main.canvasObject.height);
		canvas.fillRect(0, main.canvasObject.height / 2, main.canvasObject.width, 1);


		for (var i = 0; i < main.randomPoints.length; i++) {
			canvas.fillStyle = "black";
	
			//draw the random nodes
			//the random nodes have a width and height 10 less than the main node
			canvas.fillRect(main.randomPoints[i].x + (main.canvasObject.width / 2) - (main.nodeWidth - 10) / 2,
				main.randomPoints[i].y + (main.canvasObject.height / 2) - (main.nodeHeight - 10) / 2,
				main.nodeWidth - 10,
				main.nodeHeight - 10);

			canvas.strokeStyle = "black";

 			canvas.beginPath();

 			canvas.lineWidth = 1	;

			//draw line from the center node to the random node
			canvas.moveTo(main.mainCoordinate.x + (main.canvasObject.width / 2),
				main.mainCoordinate.y + (main.canvasObject.height / 2));

			canvas.lineTo(main.randomPoints[i].x + (main.canvasObject.width / 2),
				main.randomPoints[i].y + (main.canvasObject.height / 2));

			//prints the distance between main node and random point
			if (main.printDistance)
				canvas.fillText("" + main.calculateDistance(main.mainCoordinate, main.randomPoints[i]),
					(main.mainCoordinate.x + main.randomPoints[i].x) / 2 + (main.canvasObject.width / 2) + 3,
					(main.mainCoordinate.y + main.randomPoints[i].y) / 2 + (main.canvasObject.height / 2) + 2);

			canvas.stroke();

		}

		//temorary way of drawing the drawOnly variable
		//draw lines over prexisting lines
		
		if(main.drawOnly != undefined) {

			for(var j = 0; j < main.drawOnly.connections.length; j++) {
				canvas.beginPath();

				canvas.strokeStyle = "red";

				canvas.lineWidth = 5;
			
				//draw line from the center node to the random node
				canvas.moveTo(main.mainCoordinate.x + (main.canvasObject.width / 2),
					main.mainCoordinate.y + (main.canvasObject.height / 2));

				canvas.lineTo(main.drawOnly.connections[j].x + (main.canvasObject.width / 2),
					main.drawOnly.connections[j].y + (main.canvasObject.height / 2));


				// //prints the distance between main node and random point
				// if (main.printDistance)
				// 	canvas.fillText("" + main.calculateDistance(main.mainCoordinate, main.drawOnly.connections[j]),
				// 		(main.mainCoordinate.x + main.drawOnly.connections[j].x) / 2 + (main.canvasObject.width / 2) + 3,
				// 		(main.mainCoordinate.y + main.drawOnly.connections[j].y) / 2 + (main.canvasObject.height / 2) + 2);

				canvas.stroke();

			}

			// for(var j = 0; j < main.drawOnly.connections.length; j++) {
			// 		//prints the distance between main node and random point
			// 	canvas.fillStyle = "blue";
			// 	console.log(main.calculateDistance(main.mainCoordinate, main.drawOnly.connections[j]));
			// 	if (main.printDistance)
			// 		canvas.fillText("" + main.calculateDistance(main.mainCoordinate, main.drawOnly.connections[j]),
			// 			(main.mainCoordinate.x + main.drawOnly.connections[j].x) / 2 + (main.canvasObject.width / 2) + 3,
			// 			(main.mainCoordinate.y + main.drawOnly.connections[j].y) / 2 + (main.canvasObject.height / 2) + 2);

			// }
		}

	}

};


Array.prototype.indexOfObject = function(object) {
	for (var i = 0; i < this.length; i++) {

		if (Object.keys(this).length != Object.keys(object).length)
			continue;

		for (var property in this) {
			if (property != object[property])
				continue;
			else if (typeof property == 'object')
				throw Error("Cannot be used for nested objects!");
		}


		//if it was able to get past continue statement and equality loops,
		//it is equal, so return index
		return i;
	}

	return -1;
};

