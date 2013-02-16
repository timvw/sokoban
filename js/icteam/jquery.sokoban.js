function Sokoban(games, gameDiv, imageUrl) {
	this.games = games;
	this.gameDiv = gameDiv;
	this.imageUrl = imageUrl;

	this.wall = "#";
	this.player = "@";
	this.playerOnGoal = "+";
	this.box = "$";
	this.boxOnGoal = "*";
	this.goal = ".";
	this.floor = " ";

	this.urlOfCurrentGame;
	this.numberOfCurrentLevel;
	this.columnIndexForPlayer;
	this.rowIndexForPlayer;
	this.board;
	this.numberOfRowsInLevel;
	this.numberOfColumnsInLevel;
	this.numberOfMoves;
	this.moves;

	this.initializeSokoban = function(gameUrl) {
		this.urlOfCurrentGame = gameUrl;
		$.get(gameUrl, $.proxy(function(gameData) {
			this.gameData = gameData;
			this.numberOfAvailableLevels = this.gameData.SokobanLevels.LevelCollection.Level.length;
			this.numberOfCurrentLevel = 0;
			this.initializeLevel();
			this.drawLevel();
		}, this), "json")
		.fail(function(a,b,c){ console.log("failed fetching data..." + b); });
	};

	this.initializeLevel = function() {
		this.board = [];
		this.numberOfMoves = 0;
		this.moves = [];

		var currentLevel = this.gameData.SokobanLevels.LevelCollection.Level[this.numberOfCurrentLevel];
		this.numberOfRowsInLevel =  currentLevel["Height"];
		this.numberOfColumnsInLevel = currentLevel["Width"];

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
	};

	this.buildSelectHtml = function(id, name, options) {
		var selectHtml = "<select id='" + id + "' name='" + name + "'>";
		for(var i=0;i<options.length;++i){
			var option = options[i];
			var selected = "";
			if(option.isSelected) selected = "selected";
			selectHtml += "<option value='"+ option.value + "'"+ selected + ">" + option.label + "</option>";
		}
		selectHtml += "</select>";
		return selectHtml;
	};

	this.buildLevelOptions = function() {
		var options = [];
		for(var i=0;i<this.numberOfAvailableLevels;++i) {
			var isSelected = i == this.numberOfCurrentLevel ? true : false;
			var option = { "value" : i, "label" : (i+1), "isSelected" : isSelected };
			options[i] = option;
		}
		return options;
	};

	this.buildGameOptions = function() {
		var options = [];
		for(var i=0;i<this.games.length;++i) {
			var game = this.games[i];
			var isSelected = game == this.urlOfCurrentGame ? true : false;
			var option = { "value" : game, "label" : game, "isSelected" : isSelected };
			options[i] = option;
		}
		return options;
	};

	this.getNumberOfCurrentLevelLabel = function()
	{
		return parseInt(this.numberOfCurrentLevel) + 1;
	};

	this.drawLevel = function() {
		var html = "";

		var selectGameOptions = this.buildGameOptions();
		var selectGameHtml = this.buildSelectHtml('gamePicker', 'gamePicker', selectGameOptions);
		html += "<div>Current game: <form>" + selectGameHtml + "<input type='submit' value='Go' id='gameButton'/></form></div>";

		var selectLevelOptions = this.buildLevelOptions();	
		var selectLevelHtml = this.buildSelectHtml('levelPicker', 'levelPicker', selectLevelOptions);
		html += "<div>Current level: <form>" + selectLevelHtml + "<input type='submit' value='Go' id='levelbutton'/></form></div>";
		
		html += "<table>";
		for(var row=0;row<this.numberOfRowsInLevel;++row) {
			html += "<tr>";
			for(var col=0;col<this.numberOfColumnsInLevel;++col) {
				html += "<td id='row" + row +"col" +col +"' class='gamecell'>" + this.getCellHtml(row,col) + "</td>";
			}
			html += "</tr>";
		}
		html += "</table>";

		var numberOfCurrentLevelToDisplay = this.getNumberOfCurrentLevelLabel(); 

		html += "<div>Level: <span id='level'>" 
				+ numberOfCurrentLevelToDisplay 
				+ "</span> / " 
				+ this.numberOfAvailableLevels 
				+ " Moves: <span id='moves'>" 
				+ this.numberOfMoves 
				+ "</span></div>";

		this.gameDiv.html(html);

		$("#gameButton").on('click', $.proxy(function(event) {
			event.preventDefault();
			var requestedGame = $("#gamePicker :selected")[0].value;
			this.initializeSokoban(requestedGame);
			return false;
		}, this));

		$("#levelbutton").on('click',$.proxy(function(event){
			event.preventDefault();
			var requestedLevel = $("#levelPicker :selected")[0].value;
			this.numberOfCurrentLevel = requestedLevel;
			this.initializeLevel();
			this.drawLevel();
			return false;
		}, this));
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
	};

	this.drawUpdate = function(playery, playerx, newRowIndexForPlayer, newColumnIndexForPlayer, newRowIndexForAdjacentBox, newColumnIndexForAdjacentBox) {
		if(newRowIndexForAdjacentBox != null && newColumnIndexForAdjacentBox != null) $("#row" + newRowIndexForAdjacentBox + "col" + newColumnIndexForAdjacentBox).html(this.getCellHtml(newRowIndexForAdjacentBox,newColumnIndexForAdjacentBox));
		$("#row" + newRowIndexForPlayer + "col" + newColumnIndexForPlayer).html(this.getCellHtml(newRowIndexForPlayer,newColumnIndexForPlayer));
		$("#row" + playery + "col" + playerx).html(this.getCellHtml(playery,playerx));
		$("#moves").html(this.numberOfMoves);
	};

	this.isCompleted = function() {
		for(var row=0;row<this.numberOfRowsInLevel;++row) {
			for(var col=0;col<this.numberOfColumnsInLevel;++col) {
				if (this.board[row][col] == this.box) {
					return false;
				}	
			}
		}	
		return true;
	};

	this.move = function(rowChange, columnChange) {
		if(columnChange==0 && rowChange==0) return;

		var cellValueForPlayer = this.board[this.rowIndexForPlayer][this.columnIndexForPlayer];
		var newColumnIndexForPlayer = this.columnIndexForPlayer + columnChange;
		var newRowIndexForPlayer = this.rowIndexForPlayer + rowChange;
		var newCellValueForPlayer = this.board[newRowIndexForPlayer][newColumnIndexForPlayer];
		if(newCellValueForPlayer == this.wall) return;
		
		var newColumnIndexForAdjacentBox = null;
		var newRowIndexForAdjacentBox = null;
		var movedBox = false;
		if(newCellValueForPlayer == this.box || newCellValueForPlayer == this.boxOnGoal) {
			newColumnIndexForAdjacentBox = newColumnIndexForPlayer + columnChange;
			newRowIndexForAdjacentBox = newRowIndexForPlayer + rowChange;
			var newCellValueForAdjacentBox = this.board[newRowIndexForAdjacentBox][newColumnIndexForAdjacentBox];
			if(newCellValueForAdjacentBox != this.floor && newCellValueForAdjacentBox != this.goal) return;
			movedBox = true;
			this.board[newRowIndexForAdjacentBox][newColumnIndexForAdjacentBox] = newCellValueForAdjacentBox == this.goal ? this.boxOnGoal : this.box;
		}

		this.board[this.rowIndexForPlayer][this.columnIndexForPlayer] = cellValueForPlayer == this.playerOnGoal ? this.goal : this.floor;				
		this.board[newRowIndexForPlayer][newColumnIndexForPlayer] = newCellValueForPlayer == this.boxOnGoal || newCellValueForPlayer == this.goal ? this.playerOnGoal : this.player;
		this.numberOfMoves++;

		var move = { "columnChange" : columnChange, "rowChange" : rowChange, "movedBox" : movedBox };
		this.moves.push(move);

		this.drawUpdate(this.rowIndexForPlayer, this.columnIndexForPlayer, newRowIndexForPlayer, newColumnIndexForPlayer, newRowIndexForAdjacentBox, newColumnIndexForAdjacentBox);
		this.columnIndexForPlayer = newColumnIndexForPlayer;
		this.rowIndexForPlayer = newRowIndexForPlayer;

		if (this.isCompleted()) {
			if(this.numberOfCurrentLevel < this.numberOfAvailableLevels){
				this.numberOfCurrentLevel++;
				this.initializeLevel();
				this.drawLevel();
			} else {
				alert("Congratulations. You completed this game");
			}
		}
	};

	this.undoMove = function() {
		if(this.moves.length == 0)return;
		var move = this.moves.pop();
		var invertedColumnChange = -1 * move.columnChange;
		var invertedRowChange = -1 * move.rowChange;
		var previousColumnIndexForPlayer = this.columnIndexForPlayer + invertedColumnChange;
		var previousRowIndexForPlayer = this.rowIndexForPlayer + invertedRowChange;
		this.board[previousRowIndexForPlayer][previousColumnIndexForPlayer] = this.board[previousRowIndexForPlayer][previousColumnIndexForPlayer] == this.goal ? this.playerOnGoal : this.player;
		this.board[this.rowIndexForPlayer][this.columnIndexForPlayer] = this.board[this.rowIndexForPlayer][this.columnIndexForPlayer] == this.playerOnGoal ? this.goal : this.floor;
		var columnIndexForBox;
		var rowIndexForBox;
		if(move.movedBox) {
			columnIndexForBox = this.columnIndexForPlayer + move.columnChange;
			rowIndexForBox = this.rowIndexForPlayer + move.rowChange;
			var previousRowIndexForBox = this.rowIndexForPlayer;
			var previousColumnIndexForBox = this.columnIndexForPlayer;
			this.board[previousRowIndexForBox][previousColumnIndexForBox] = this.board[previousRowIndexForBox][previousColumnIndexForBox] == this.goal ? this.boxOnGoal : this.box;
			this.board[rowIndexForBox][columnIndexForBox] = this.board[rowIndexForBox][columnIndexForBox] == this.boxOnGoal ? this.goal : this.floor;
		}
		console.log('current row:' + this.rowIndexForPlayer + ' col:' + this.columnIndexForPlayer);
		console.log('previous row:' + previousRowIndexForPlayer + 'col:' + previousColumnIndexForPlayer);
		console.log('box row:' + rowIndexForBox + ' col:' + columnIndexForBox);

		this.drawUpdate(this.rowIndexForPlayer, this.columnIndexForPlayer, previousRowIndexForPlayer, previousColumnIndexForPlayer, rowIndexForBox, columnIndexForBox);
		this.rowIndexForPlayer = previousRowIndexForPlayer;
		this.columnIndexForPlayer = previousColumnIndexForPlayer;
		this.numberOfMoves--;
	};
}

(function($) {
	$.fn.sokoban = function(options) {
    	var settings = $.extend( {
			'gamesUrl' : './js/icteam/games.json',
      		'imagesUrl' : './images/',
			'startGameUrl' : "./js/icteam/levels/original.json"
    	}, options);
	
		var gameDiv = $(this);
		$.get(settings.gamesUrl, function(gamesData) {
			var games = gamesData.games;
			var sokoban = new Sokoban(games, gameDiv, settings.imagesUrl);
			sokoban.initializeSokoban(settings.startGameUrl);

			$(document).keydown(function(e) {
				var columnChange = 0;
				var rowChange = 0;
				if(e.keyCode==37) columnChange = -1;
				if(e.keyCode==38) rowChange = -1;
				if(e.keyCode==39) columnChange = 1;
				if(e.keyCode==40) rowChange = 1;
				sokoban.move(rowChange,columnChange);
				if(e.keyCode==85 /**u**/ || e.keyCode ==90 /**z**/) {
					sokoban.undoMove();
				}
			 });
		 }, "json")
		.fail(function(a,b,c){ console.log("failed fetching data..." + b); });
		return this;
	};
})(jQuery);
