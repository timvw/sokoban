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

	this.numberOfCurrentLevel = 0;
	this.columnIndexForPlayer;
	this.rowIndexForPlayer;
	this.board;
	this.numberOfRowsInLevel;
	this.numberOfColumnsInLevel;
	this.numberOfMoves;

	this.initializeGame = function() {
		this.numberOfAvailableLevels = this.gameData.SokobanLevels.LevelCollection.Level.length;
	};

	this.initializeLevel = function() {
		this.board = [];
		this.numberOfMoves = 0;

		var currentLevel = this.gameData.SokobanLevels.LevelCollection.Level[this.numberOfCurrentLevel];
		this.numberOfRowsInLevel =  currentLevel["-Height"];
		this.numberOfColumnsInLevel = currentLevel["-Width"];

		var rowsInLevel = currentLevel.L;	
		for(var row=0;row<rowsInLevel.length;++row) {
			var columns = [];

			var rowText = rowsInLevel[row];
			for(var col=0;col<rowText.length;++col) {
				var cellValue = rowText.charAt(col);
				columns[col] = cellValue;	
				if(cellValue == this.player || cellValue == this.playerOnGoal) {
					this.columnIndexForPlayer = col;
					this.rowIndexForPlayer = row;
				}
			}

			for(var col = rowText.length;col<this.numberOfColumnsInLevel;++col) {
				columns[col] = this.floor;
			}

			this.board[row] = columns;
		}

		while(row<this.numberOfRowsInLevel) {
			var columns = [];
			for(var col=0;col<this.numberOfColumnsInLevel;++col) {
				columns[col] = this.floor;
			}
			this.board[row] = columns;
			++row;
		}
	}

	this.drawLevel = function() {
		var html= "<div>Level: <span id='level'>" + this.numberOfCurrentLevel + "</span> / " + this.numberOfAvailableLevels + " Moves: <span id='moves'>" + this.numberOfMoves + "</span></div>";
		html += "<table>";
		for(var row=0;row<this.numberOfRowsInLevel;++row) {
			html += "<tr>";
			for(var col=0;col<this.numberOfColumnsInLevel;++col) {
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

	this.drawUpdate = function(playery, playerx, newRowIndexForPlayer, newColumnIndexForPlayer, newRowIndexForAdjacentBox, newColumnIndexForAdjacentBox) {
		if(newRowIndexForAdjacentBox != null && newColumnIndexForAdjacentBox != null) $("#row" + newRowIndexForAdjacentBox + "col" + newColumnIndexForAdjacentBox).html(this.getCellHtml(newRowIndexForAdjacentBox,newColumnIndexForAdjacentBox));
		$("#row" + newRowIndexForPlayer + "col" + newColumnIndexForPlayer).html(this.getCellHtml(newRowIndexForPlayer,newColumnIndexForPlayer));
		$("#row" + playery + "col" + playerx).html(this.getCellHtml(playery,playerx));
		$("#moves").html(this.numberOfMoves);
	}

	this.isCompleted = function() {
		for(var row=0;row<this.numberOfRowsInLevel;++row) {
			for(var col=0;col<this.numberOfColumnsInLevel;++col) {
				if (this.board[row][col] == this.box) {
					return false;
				}	
			}
		}	
		return true;
	}

	this.move = function(rowChange, columnChange) {
		if(columnChange==0 && rowChange==0) return;

		var cellValueForPlayer = this.board[this.rowIndexForPlayer][this.columnIndexForPlayer];
		var newColumnIndexForPlayer = this.columnIndexForPlayer + columnChange;
		var newRowIndexForPlayer = this.rowIndexForPlayer + rowChange;
		var newCellValueForPlayer = this.board[newRowIndexForPlayer][newColumnIndexForPlayer];
		if(newCellValueForPlayer == this.wall) return;
		
		var newColumnIndexForAdjacentBox = null;
		var newRowIndexForAdjacentBox = null;
		if(newCellValueForPlayer == this.box || newCellValueForPlayer == this.boxOnGoal) {
			newColumnIndexForAdjacentBox = newColumnIndexForPlayer + columnChange;
			newRowIndexForAdjacentBox = newRowIndexForPlayer + rowChange;
			var newCellValueForAdjacentBox = this.board[newRowIndexForAdjacentBox][newColumnIndexForAdjacentBox];
			if(newCellValueForAdjacentBox != this.floor && newCellValueForAdjacentBox != this.goal) return;
			this.board[newRowIndexForAdjacentBox][newColumnIndexForAdjacentBox] = newCellValueForAdjacentBox == this.goal ? this.boxOnGoal : this.box;
		}

		this.board[this.rowIndexForPlayer][this.columnIndexForPlayer] = cellValueForPlayer == this.playerOnGoal ? this.goal : this.floor;				
		this.board[newRowIndexForPlayer][newColumnIndexForPlayer] = newCellValueForPlayer == this.boxOnGoal || newCellValueForPlayer == this.goal ? this.playerOnGoal : this.player;
		this.numberOfMoves++;
		this.drawUpdate(this.rowIndexForPlayer, this.columnIndexForPlayer, newRowIndexForPlayer, newColumnIndexForPlayer, newRowIndexForAdjacentBox, newColumnIndexForAdjacentBox);
		this.columnIndexForPlayer = newColumnIndexForPlayer;
		this.rowIndexForPlayer = newRowIndexForPlayer;

		if (this.isCompleted()) {
			if(this.numberOfCurrentLevel <= this.numberOfAvailableLevels){
				alert("Congratulations. You completed level " + this.numberOfCurrentLevel);
				this.numberOfCurrentLevel++;
				this.initializeLevel();
				this.drawLevel();
			} else {
				alert("Congratulations. You completed this game");
			}
		}
	}

	this.start = function(){
		this.initializeGame();
		this.initializeLevel();
		this.drawLevel();
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
		 		var columnChange = 0;
			 	var rowChange = 0;
			 	if(e.keyCode==37) columnChange = -1;
			 	if(e.keyCode==38) rowChange = -1;
			 	if(e.keyCode==39) columnChange = 1;
			 	if(e.keyCode==40) rowChange = 1;
			 	game.move(rowChange,columnChange);
			 });
		 }, "json")
		.fail(function(a,b,c){ console.log("failed fetching data..." + b); });
		return this;
	};
})(jQuery);
