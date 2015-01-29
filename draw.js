var EvoDraw = {
	_size : [0, 0],

	_zoom : 1,

	main_canvas : false,
	main_context : false,

	food_canvas : false,
	food_context : false,

	microbe_canvas : false,
	microbe_context : false,

	tooltip : false,

	color_back :'#000000',
	color_food : '#20603D',
	color_microbe : '#FFF44F',
	color_tooltip : '#ffffff',
	color_text : '#ff0000',

	init : function(selector, size, zoom){
		this._size = size;
		this._zoom = zoom;
		// canvas_main
		this.main_canvas = document.getElementById('evolution');
		this.main_canvas.width = this.zoom(size[0]);
		this.main_canvas.height = this.zoom(size[1]);

		this.main_canvas.onclick = function(){
			EvoDraw.resetTooltip();
		};

		this.main_context = this.main_canvas.getContext("2d");

		// canvas_food
		this.food_canvas = document.createElement("canvas");
		this.food_canvas.width = this.zoom(size[0]);
		this.food_canvas.height = this.zoom(size[1]);

		this.food_context = this.food_canvas.getContext("2d");

		// canvas_microbe
		this.microbe_canvas = document.createElement("canvas");
		this.microbe_canvas.width = this.zoom(size[0]);
		this.microbe_canvas.height = this.zoom(size[1]);

		this.microbe_context = this.microbe_canvas.getContext("2d");
		this.microbe_context.globalAlpha = 0.6;

		this.microbe_context.font = "bold 14px Tahoma";
		this.microbe_context.textAlign = "start";
		this.microbe_context.textBaseline = "hanging";
	},

	zoom : function(val){
		return val * this._zoom;
	},

	drawFoods : function(foods){
		this.clear(this.food_context);
		this.food_context.fillStyle = this.color_food;

		for(var i = 0; i < foods.length; i++){
			if(!foods[i]) continue;

			var y = Math.floor(i / this._size[0]);
			var x = i - (y * this._size[0]);
			
			this.food_context.fillRect(this.zoom(x), this.zoom(y), this.zoom(1), this.zoom(1));
		}
	},

	drawMicrobes : function(microbes){
		this.clear(this.microbe_context); 
		
		for(var i in microbes){
			var m = microbes[i];
			if(this.tooltip){
				this.drawMicrobeTooltip(m);
			}
			this.microbe_context.fillStyle = this.color_microbe;
			this.microbe_context.fillRect(this.zoom(m.point.x - 1), this.zoom(m.point.y - 1), this.zoom(3), this.zoom(3));
		}
	},

	drawMicrobeTooltip : function(microbe){
		var padding = 5;
		var text = 'energy:' + microbe.energy.toString() + ' age:' + microbe.age.toString();
		var text_width = Math.floor(this.microbe_context.measureText(text).width) + 4;
		var text_height = 16;
		var padding_y = 22;

		var rect_x = this.zoom(microbe.point.x) - text_width / 2;
		if(rect_x < padding){
			rect_x = padding;
		}else if(rect_x + text_width > this.zoom(this._size[0]) - padding){
			rect_x = this.zoom(this._size[0]) - text_width - padding;
		}

		var rect_y = this.zoom(microbe.point.y) - padding_y;
		if(rect_y < padding){
			rect_y = padding;
		}else if(rect_y + text_height > this.zoom(this._size[1]) - padding){
			rect_y = this.zoom(this._size[1]) - text_height - padding;
		}

		this.microbe_context.fillStyle = this.color_tooltip;
		this.microbe_context.fillRect(rect_x, rect_y, text_width, text_height);

		this.microbe_context.fillStyle = this.color_text;
		this.microbe_context.fillText(text, rect_x + 2, rect_y + 3)
	},

	clear : function(context){
		context.clearRect( 0, 0, this.zoom(this._size[0]), this.zoom(this._size[1]));
	},

	draw : function(){		
		this.main_context.fillStyle = this.color_back;
		this.main_context.fillRect(0, 0, this.main_canvas.width, this.main_canvas.height);

		this.main_context.drawImage(this.food_canvas, 0, 0);
		this.main_context.drawImage(this.microbe_canvas, 0, 0);
	},

	resetTooltip : function(){
		this.tooltip = (this.tooltip) ? false : true;
	}
}