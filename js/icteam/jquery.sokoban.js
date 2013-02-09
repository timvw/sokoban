function Game(gameData, gameDiv, imageUrl) {
	this.gameData = gameData;
	this.gameDiv = gameDiv;
	this.imageUrl = imageUrl;

	this.wall = "#";
	this.player = "@";
	this.playerOnGoal = "+";
	this.box = "$";
	this.boxOnGoal = "*";
	this.goal = ".";
	this.floor = " ";

	this.level = 0;
	this.playerx;
	this.playery;
	this.board;
	this.rowcount;
	this.colcount;
	this.moves;

	this.initGame = function() {
		this.maxlevel = this.gameData.SokobanLevels.LevelCollection.Level.length;
	};

	this.initLevel = function() {
		this.board = [];
		this.moves = 0;

		var currentLevel = this.gameData.SokobanLevels.LevelCollection.Level[this.level];
		this.rowcount =  currentLevel["-Height"];
		this.colcount = currentLevel["-Width"];

		var lines = currentLevel.L;	
		for(var row=0;row<lines.length;++row) {
			var columns = [];

			var lineText = lines[row];
			for(var col=0;col<lineText.length;++col) {
				var cellValue = lineText.charAt(col);
				columns[col] = cellValue;	
				if(cellValue == this.player || cellValue == this.playerOnGoal) {
					this.playerx = col;
					this.playery = row;
				}
			}

			for(var col = lineText.length;col<this.colcount;++col) {
				columns[col] = this.floor;
			}

			this.board[row] = columns;
		}

		while(row<this.rowcount) {
			var columns = [];
			for(var col=0;col<this.colcount;++col) {
				columns[col] = this.floor;
			}
			this.board[row] = columns;
			++row;
		}
	}

	this.drawBoard = function() {
		var html= "<div>Level: <span id='level'>" + this.level + "</span> / " + this.maxlevel + " Moves: <span id='moves'>" + this.moves + "</span></div>";
		html += "<table>";
		for(var row=0;row<this.rowcount;++row) {
			html += "<tr>";
			for(var col=0;col<this.colcount;++col) {
				html += "<td id='row" + row +"col" +col +"' class='gamecell'>" + this.getCellHtml(row,col) + "</td>";
			}
			html += "</tr>";
		}
		html += "</table>";

		this.gameDiv.html(html);
	};

	this.getCellHtml = function(row, col) {
		var cellValue = this.board[row][col] ? this.board[row][col] : this.floor;
		if(cellValue == this.player) return "<img src='" + this.imageUrl + "player.png'/>";
		if(cellValue == this.playerOnGoal) return "<img src='" + this.imageUrl + "playerOnGoal.png'/>";
		if(cellValue == this.box) return "<img src='" + this.imageUrl + "box.png'/>";
		if(cellValue == this.boxOnGoal) return "<img src='" + this.imageUrl + "boxOnGoal.png'/>";
		if(cellValue == this.wall) return "<img src='" + this.imageUrl + "wall.png'/>";
		if(cellValue == this.goal) return "<img src='" + this.imageUrl + "goal.png'/>";
		if(cellValue == this.floor) return "&nbsp;";
	}

	this.drawUpdate = function(playery, playerx, newplayery, newplayerx, newboxy, newboxx) {
		if(newboxy != null && newboxx != null) $("#row" + newboxy + "col" + newboxx).html(this.getCellHtml(newboxy,newboxx));
		$("#row" + newplayery + "col" + newplayerx).html(this.getCellHtml(newplayery,newplayerx));
		$("#row" + playery + "col" + playerx).html(this.getCellHtml(playery,playerx));
		$("#moves").html(this.moves);
	}

	this.isCompleted = function() {
		for(var row=0;row<this.rowcount;++row) {
			for(var col=0;col<this.colcount;++col) {
				if (this.board[row][col] == this.box) {
					return false;
				}	
			}
		}	
		return true;
	}

	this.move = function(dy, dx) {
		if(dx==0 && dy==0) return;
		var playervalue = this.board[this.playery][this.playerx];
		var newplayerx = this.playerx + dx;
		var newplayery = this.playery + dy;
		var newplayervalue = this.board[newplayery][newplayerx];
		var newboxx = null;
		var newboxy = null;
		if(newplayervalue == this.wall) return;
		if(newplayervalue == this.box || newplayervalue == this.boxOnGoal) {
			newboxx = newplayerx + dx;
			newboxy = newplayery + dy;
			var newboxvalue = this.board[newboxy][newboxx];
			if(newboxvalue != this.floor && newboxvalue != this.goal) return;
			this.board[newboxy][newboxx] = newboxvalue == this.goal ? this.boxOnGoal : this.box;
		}
		this.board[this.playery][this.playerx] = playervalue == this.playerOnGoal ? this.goal : this.floor;				
		this.board[newplayery][newplayerx] = newplayervalue == this.boxOnGoal || newplayervalue == this.goal ? this.playerOnGoal : this.player;
		this.moves++;
		this.drawUpdate(this.playery, this.playerx, newplayery, newplayerx, newboxy, newboxx);
		this.playerx=newplayerx;
		this.playery=newplayery;

		if (this.isCompleted()) {
			if(this.level <= this.maxlevel){
				alert("Congratulations. You completed level " + this.level);
				this.level++;
				this.initLevel();
				this.drawBoard();
			} else {
				alert("Congratulations. You completed this game");
			}
		}
	}

	this.start = function(){
		this.initGame();
		this.initLevel();
		this.drawBoard();
	};
}

(function($) {
	$.fn.sokoban = function(options) {
    	var settings = $.extend( {
			'gameUrl' : './js/icteam/levels/original.json',
      		'imagesUrl' : './images/'
    	}, options);
	
		var gameDiv = $(this);
		$.get(settings.gameUrl, function(gamedata) {
		 	var game = new Game(gamedata, gameDiv, settings.imagesUrl);
			game.start();

		 	$(document).keydown(function(e) {
		 		var dx = 0;
			 	var dy = 0;
			 	if(e.keyCode==37) dx = -1;
			 	if(e.keyCode==38) dy = -1;
			 	if(e.keyCode==39) dx = 1;
			 	if(e.keyCode==40) dy = 1;
			 	game.move(dy,dx);
			 });
		 }, "json")
		.fail(function(a,b,c){ console.log("failed fetching data..." + b); });
		return this;
	};
})(jQuery);
