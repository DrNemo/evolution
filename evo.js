window.requestAnimFrame = (function(){
  return window.requestAnimationFrame  ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame    ||
	function( callback ){
		window.setTimeout(callback, 1000 / 60);
	};
})();

window.onload = function(){
	main();
}

var evolution;
var tact = 0;

function main(){
	var size = [600, 300];
	EvoDraw.init('evolution', size, 2);
	evolution = new Evolution(size, 10);

	tick();	
}

function tick(){
	if(tact % 2 == 0)
		evolution.evolution();	

	EvoDraw.drawFoods(evolution.getFoods());
	EvoDraw.drawMicrobes(evolution.getMicrobes());
	EvoDraw.draw();

	requestAnimFrame(tick);

	tact ++;
}

function Evolution(size, start_count_microbe){
	this.size = size;
	var width = size[0],
		height = size[1];
		
	var menergy_reproduce = 1000; // количество энергии для рождения
	var spawn_food_count = 2; // количество новой пищи за такт
	var foods = new Uint8Array(height * width); // массив с едой
	
	this.microbe_num = 0;
	this.microbes = new Array();

	this.init = function(){
		// set init random foods
		for (var i = 0; i < foods.length / 6; i++){
			var point = new Point(Math.round(Math.random() * width), 
							Math.round(Math.random() * height));
			this.setFoods(point);
		}

		// set init microbe
		for(var i = 0; i < start_count_microbe; i++) {
			this.createRandomMicrobe();
		}
	}

	this.evolution = function(){
		this.spawnFood();

		for(var i in this.microbes){
			var microbe = this.microbes[i];
			// микроб умирает
			if(microbe.energy < 0) {
        		delete this.microbes[i];
        		this.microbe_num --;
        		continue;
      		}

      		// перемещаем микроба на новую позицию
      		microbe.point.move(microbe.getDirection(), this.size);

      		// проверяем наличее и съедаем еду
      		if(this.isFood(microbe.point) && microbe.eatFood()){
      			this.removeFood(microbe.point);
      		}

      		// рождаем нового микроба
			if(microbe.energy > menergy_reproduce){
				this.createParentMicrobe(microbe);
			}

			// вычисляем новое направление
			microbe.live(this);
		}
	}

	this.createParentMicrobe = function(parent){
		var microbe = new Microbe(parent.point.clone(), Math.floor(parent.energy / 2));
		microbe.mutateGenes(parent.genes);
		this.addMicrobe(microbe);

		parent.energy = Math.round(parent.energy / 2);
	}

	this.createRandomMicrobe = function(){
		var point = new Point(Math.floor(Math.random() * width), Math.floor(Math.random() * height));
		var microbe = new Microbe(point, this.microbe_num + 100);
		microbe.randomGenes();
		this.addMicrobe(microbe);		
	}

	this.addMicrobe = function(microbe){
		this.microbes.push(microbe);
		this.microbe_num ++;
	}
	
	this.getMicrobes = function(){
		return this.microbes;
	}

	this.spawnFood = function(){
		for(var i = 0; i < spawn_food_count; i++){
			var point = new Point(Math.round(Math.random() * width), 
							Math.round(Math.random() * height));
			this.setFoods(point);
		}
	}

	this.getFoods = function(){
		return foods;
	}

	this.setFoods = function(point){
		foods[point.y * width + point.x] = true;
	}

	this.isFood = function(point){
		return foods[point.y * width + point.x];
	}

	this.removeFood = function(point){
		foods[point.y * width + point.x] = false;
	}

	this.init();
}

function Microbe(point, energy){
	var direction_set = [new Point(-1, 1), new Point(0, 1), new Point(1, 1),
						 new Point(-1, 0),					new Point(1, 0),
						 new Point(-1, -1), new Point(0, -1), new Point(1, 1)];

	// стоимость смены направления
	var steering_cost = [ [0], [1], [2], [4], [8], [4], [2], [1] ];

	var eat_food_energy = 40, // количество энергии после поедания пищи
		energy_max = 1500; // максимальное количество энегии

	this.point = point;
	this.direction = Math.floor(Math.random() * 8);
	this.energy = energy;
	this.age = 0;

	this.genes = [];

    this.randomGenes = function(){
    	var genes = new Float64Array(8);
      	for (var i = 0; i < genes.length; i++) {
		    genes[i] = Math.random();
      	}
      	this.normalizeGenes(genes);
    }

    this.mutateGenes = function(genes){
    	var clone_genes = new Float64Array(genes);
    	var mutate_gen = Math.floor(Math.random() * clone_genes.length); // мутация случайного гена

    	clone_genes[mutate_gen] += (Math.random() - 0.5); // сама мутация
    	if(clone_genes[mutate_gen] < 0){ // ген не может быть отрицательным
    		clone_genes[mutate_gen] = 0;
    	}

    	this.normalizeGenes(clone_genes);
    }

    this.normalizeGenes = function(genes){
    	// нормализация генов
    	var sum = 0;
		for (var i = 0; i < genes.length; i++) {
			sum += genes[i]; 
		}

		for (var i = 0; i < genes.length; i++) {
			genes[i] = genes[i] / sum;
		}

		this.genes = genes;
    }

    this.getDirection = function(){
    	return direction_set[this.direction];
    }

    this.eatFood = function(){
    	if(this.energy < energy_max){
    		this.energy += eat_food_energy;
    		return true;
    	}
    	return false;
    }

    this.live = function(){
    	this.age += 1;
    	this.energy -= 1;

    	var len_genes = this.genes.length;
		var rnd = Math.random();
		var energy_for_dir_change = 0;
		var sum = 0;
		for (var i = 0; i < len_genes; i++) {
			sum += this.genes[i];
			if (rnd < sum) {
				var new_dir = (this.direction + i) % len_genes;
				energy_for_dir_change = ((new_dir + len_genes) - this.direction) % len_genes; 
				this.direction = new_dir;
				break;
			}
		}

		this.energy -= steering_cost[energy_for_dir_change];
    }
}

function Point(x, y){
	this.x = x;
	this.y = y;

	this.move = function(point, size){
		this.x += point.x;
		this.y += point.y;
		if(this.x < 0) this.x = size[0] - 1;
		if(this.x >= size[0]) this.x = 0;

		if(this.y < 0) this.y = size[1] - 1;
		if(this.y >= size[1]) this.y = 0;
	}

	this.clone = function(){
		return new Point(this.x, this.y);
	}
}