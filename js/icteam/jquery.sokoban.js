function Sokoban(games) {
	this.games = games;

	this.newBoardCallbacks = [];
	this.updateBoardCallbacks = [];

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
			this.initializeLevel(0);
		}, this), "json")
		.fail(function(a,b,c){ console.log("failed fetching data..." + b); });
	};

	this.initializeLevel = function(numberOfLevel) {
		this.numberOfCurrentLevel = numberOfLevel;
		this.board = [];
		this.numberOfMoves = 0;
		this.moves = [];

		var currentLevel = this.gameData.SokobanLevels.LevelCollection.Level[this.numberOfCurrentLevel];
		this.numberOfRowsInLevel =  currentLevel.Height;
		this.numberOfColumnsInLevel = currentLevel.Width;

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

		this.invokeNewBoardCallbacks();
	};

	this.addNewBoardCallback = function(callback){
		this.newBoardCallbacks.push(callback);
	};

	this.invokeNewBoardCallbacks = function(){
		for(var i=0;i<this.newBoardCallbacks.length;++i){
			var callback = this.newBoardCallbacks[i];
			callback.method.call(callback.target);
		}
	};

	this.addUpdateBoardCallback = function(callback){
		this.updateBoardCallbacks.push(callback);
	};

	this.invokeUpdateBoardCallbacks = function(updatedCellCoordinates){
		for(var i=0;i<this.updateBoardCallbacks.length;++i){
			var callback = this.updateBoardCallbacks[i];
			callback.method.call(callback.target, updatedCellCoordinates);
		}
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

		var move = { columnChange : columnChange, rowChange : rowChange, movedBox : movedBox };
		this.moves.push(move);

		var updatedCellCoordinates = [];
		updatedCellCoordinates.push({ y: this.rowIndexForPlayer, x: this.columnIndexForPlayer });
		updatedCellCoordinates.push({ y: newRowIndexForPlayer, x: newColumnIndexForPlayer } );
		if(movedBox){
			updatedCellCoordinates.push({ y: newRowIndexForAdjacentBox, x: newColumnIndexForAdjacentBox });
		}
		this.invokeUpdateBoardCallbacks(updatedCellCoordinates);
		this.columnIndexForPlayer = newColumnIndexForPlayer;
		this.rowIndexForPlayer = newRowIndexForPlayer;

		if (this.isCompleted()) {
			if(this.numberOfCurrentLevel < this.numberOfAvailableLevels){
				this.initializeLevel(this.numberOfCurrentLevel++);
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

		this.numberOfMoves--;
		var updatedCellCoordinates = [];
		updatedCellCoordinates.push({ y: this.rowIndexForPlayer, x: this.columnIndexForPlayer });
		updatedCellCoordinates.push({ y: previousRowIndexForPlayer, x: previousColumnIndexForPlayer });
		if(move.movedBox){
			updatedCellCoordinates.push({ y: rowIndexForBox, x: columnIndexForBox });
		}
		this.invokeUpdateBoardCallbacks(updatedCellCoordinates);
		this.rowIndexForPlayer = previousRowIndexForPlayer;
		this.columnIndexForPlayer = previousColumnIndexForPlayer;
	};
};

function SokobanDisplay(sokoban, gameDiv, imagesUrl){
	this.sokoban = sokoban;
	this.gameDiv = gameDiv;
	this.imagesUrl = imagesUrl;

	this.registerCallbacks = function(){
		this.sokoban.addNewBoardCallback({ target: this, method: this.drawLevel });
		this.sokoban.addUpdateBoardCallback({ target: this, method: this.drawUpdate });
	};

	this.getSelectHtml = function(id, name, options) {
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

	this.getLevelOptions = function() {
		var options = [];
		for(var i=0;i<this.sokoban.numberOfAvailableLevels;++i) {
			var isSelected = i == this.sokoban.numberOfCurrentLevel ? true : false;
			var option = { value : i, label : (i+1), isSelected : isSelected };
			options[i] = option;
		}
		return options;
	};

	this.getGameLabel = function(gameUrl){
		var lastSlashIndex = gameUrl.lastIndexOf('/');
		var lastDotIndex = gameUrl.lastIndexOf('.');
		var gameLabel = gameUrl.substring(lastSlashIndex + 1, lastDotIndex);
		return gameLabel;
	};

	this.getGameOptions = function() {
		var options = [];
		for(var i=0;i<this.sokoban.games.length;++i) {
			var game = this.sokoban.games[i];
			var gameLabel = this.getGameLabel(game);
			var isSelected = game == this.sokoban.urlOfCurrentGame ? true : false;
			var option = { value : game, label : gameLabel, isSelected : isSelected };
			options[i] = option;
		}
		return options;
	};

	this.getNumberOfCurrentLevelLabel = function()
	{
		return parseInt(this.sokoban.numberOfCurrentLevel) + 1;
	};

	this.getIdForCell = function(rowIndex, columnIndex){
		var id = "row" + rowIndex + "col" + columnIndex;
		return id;
	};


	this.getSelectorForCell = function(rowIndex, columnIndex) {
		var cellId = this.getIdForCell(rowIndex, columnIndex);
		var selector = "#" + cellId; 
		return selector;
	};

	this.getLevelBoardHtml = function(){
		var html = "<table>";
		for(var row=0;row<this.sokoban.numberOfRowsInLevel;++row) {
			html += "<tr>";
			for(var col=0;col<this.sokoban.numberOfColumnsInLevel;++col) {
				var cellId = this.getIdForCell(row, col);
				var cellHtml = this.getCellHtml(row,col); 
				html += "<td id='" + cellId +"' class='gamecell'>" + cellHtml + "</td>";
			}
			html += "</tr>";
		}
		html += "</table>";
		return html;
	};

	this.getStatusHtml = function() {
		var html = "";

		html += "<div>Level: <span id='level'>" 
				+ this.getNumberOfCurrentLevelLabel()
				+ "</span> / " 
				+ this.sokoban.numberOfAvailableLevels 
				+ " Moves: <span id='moves'>" 
				+ this.sokoban.numberOfMoves 
				+ "</span></div>";

		html += "<div>Use arrow keys to move. Press u to undo previous move.</div>";

		return html;
	};

	this.drawLevel = function() {
		var html = "";

		var selectGameOptions = this.getGameOptions();
		var selectGameHtml = this.getSelectHtml('gamePicker', 'gamePicker', selectGameOptions);
		html += "<div>Current game: <form>" + selectGameHtml + "<input type='submit' value='Go' id='gameButton'/></form></div>";

		var selectLevelOptions = this.getLevelOptions();	
		var selectLevelHtml = this.getSelectHtml('levelPicker', 'levelPicker', selectLevelOptions);
		html += "<div>Current level: <form>" + selectLevelHtml + "<input type='submit' value='Go' id='levelbutton'/></form></div>";
		
		html += this.getLevelBoardHtml();	
		html += this.getStatusHtml();

		this.gameDiv.html(html);

		$("#gameButton").on('click', $.proxy(function(event) {
			event.preventDefault();
			var requestedGame = $("#gamePicker :selected")[0].value;
			this.sokoban.initializeSokoban(requestedGame);
			return false;
		}, this));

		$("#levelbutton").on('click',$.proxy(function(event){
			event.preventDefault();
			var requestedLevel = $("#levelPicker :selected")[0].value;
			this.sokoban.initializeLevel(requestedLevel);
			return false;
		}, this));
	};

	this.getCellHtml = function(row, col) {
		var cellValue = this.sokoban.board[row][col] ? this.sokoban.board[row][col] : this.sokoban.floor;
		if(cellValue == this.sokoban.player) return "<img src='" + this.imagesUrl + "player.png'/>";
		if(cellValue == this.sokoban.playerOnGoal) return "<img src='" + this.imagesUrl + "playerOnGoal.png'/>";
		if(cellValue == this.sokoban.box) return "<img src='" + this.imagesUrl + "box.png'/>";
		if(cellValue == this.sokoban.boxOnGoal) return "<img src='" + this.imagesUrl + "boxOnGoal.png'/>";
		if(cellValue == this.sokoban.wall) return "<img src='" + this.imagesUrl + "wall.png'/>";
		if(cellValue == this.sokoban.goal) return "<img src='" + this.imagesUrl + "goal.png'/>";
		if(cellValue == this.sokoban.floor) return "&nbsp;";
	};

	this.drawUpdate = function(updatedCellCoordinates) {
		for(var i=0; i<updatedCellCoordinates.length;++i){
			var cellCoordinate = updatedCellCoordinates[i];
			$(this.getSelectorForCell(cellCoordinate.y, cellCoordinate.x)).html(this.getCellHtml(cellCoordinate.y, cellCoordinate.x));
		}
		$("#moves").html(this.sokoban.numberOfMoves);
	};
};

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
			var sokoban = new Sokoban(games);
			var sokobanDisplay = new SokobanDisplay(sokoban, gameDiv, settings.imagesUrl);
			sokobanDisplay.registerCallbacks();
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
