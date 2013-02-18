function Sokoban(games, gameDiv, imagesUrl, gameUrl){
	this.sokobanLogic = new SokobanLogic();
	this.games = games;
	this.gameDiv = gameDiv;
	this.imagesUrl = imagesUrl;
	this.gameUrl = gameUrl;

	this.start = function(){
		this.registerCallbacks();
		this.registerKeyListener();
		this.sokobanLogic.initializeGame(gameUrl);
	};

	this.registerKeyListener = function(){
		$(document).keydown($.proxy(function(e) {
				var columnChange = 0;
				var rowChange = 0;
				if(e.keyCode==37) columnChange = -1;
				if(e.keyCode==38) rowChange = -1;
				if(e.keyCode==39) columnChange = 1;
				if(e.keyCode==40) rowChange = 1;
				this.sokobanLogic.move(rowChange,columnChange);
				if(e.keyCode==85 /**u**/ || e.keyCode ==90 /**z**/) {
					this.sokobanLogic.undoMove();
				}
		}, this));
	};

	this.registerCallbacks = function(){
		this.sokobanLogic.addNewBoardCallback({ target: this, method: this.drawLevel });
		this.sokobanLogic.addUpdateBoardCallback({ target: this, method: this.drawUpdate });
		this.sokobanLogic.addCompletedLevelCallback({ target: this, method: this.completedLevel });
		this.sokobanLogic.addCompletedGameCallback({ target: this, method: this.completedGame });
	};

	this.completedLevel = function(){
		//alert('completed level...');
	};

	this.completedGame = function(){
		//alert('completed game');
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
		for(var i=0;i<this.sokobanLogic.numberOfAvailableLevels;++i) {
			var isSelected = i == this.sokobanLogic.numberOfCurrentLevel ? true : false;
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
		for(var i=0;i<this.games.length;++i) {
			var game = this.games[i];
			var gameLabel = this.getGameLabel(game);
			var isSelected = game == this.sokobanLogic.urlOfCurrentGame ? true : false;
			var option = { value : game, label : gameLabel, isSelected : isSelected };
			options[i] = option;
		}
		return options;
	};

	this.getNumberOfCurrentLevelLabel = function()
	{
		return parseInt(this.sokobanLogic.numberOfCurrentLevel) + 1;
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
		for(var row=0;row<this.sokobanLogic.numberOfRowsInLevel;++row) {
			html += "<tr>";
			for(var col=0;col<this.sokobanLogic.numberOfColumnsInLevel;++col) {
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
				+ this.sokobanLogic.numberOfAvailableLevels
				+ " Moves: <span id='moves'>"
				+ this.sokobanLogic.numberOfMoves
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
			this.sokobanLogic.initializeGame(requestedGame);
			return false;
		}, this));

		$("#levelbutton").on('click',$.proxy(function(event){
			event.preventDefault();
			var requestedLevel = $("#levelPicker :selected")[0].value;
			this.sokobanLogic.initializeLevel(requestedLevel);
			return false;
		}, this));
	};

	this.getCellHtml = function(row, col) {
		var cellValue = this.sokobanLogic.board[row][col] ? this.sokobanLogic.board[row][col] : this.sokobanLogic.floor;
		if(cellValue == this.sokobanLogic.player) return "<img src='" + this.imagesUrl + "player.png'/>";
		if(cellValue == this.sokobanLogic.playerOnGoal) return "<img src='" + this.imagesUrl + "playerOnGoal.png'/>";
		if(cellValue == this.sokobanLogic.box) return "<img src='" + this.imagesUrl + "box.png'/>";
		if(cellValue == this.sokobanLogic.boxOnGoal) return "<img src='" + this.imagesUrl + "boxOnGoal.png'/>";
		if(cellValue == this.sokobanLogic.wall) return "<img src='" + this.imagesUrl + "wall.png'/>";
		if(cellValue == this.sokobanLogic.goal) return "<img src='" + this.imagesUrl + "goal.png'/>";
		if(cellValue == this.sokobanLogic.floor) return "&nbsp;";
	};

	this.drawUpdate = function(updatedCellCoordinates) {
		for(var i=0; i<updatedCellCoordinates.length;++i){
			var cellCoordinate = updatedCellCoordinates[i];
			$(this.getSelectorForCell(cellCoordinate.y, cellCoordinate.x)).html(this.getCellHtml(cellCoordinate.y, cellCoordinate.x));
		}
		$("#moves").html(this.sokobanLogic.numberOfMoves);
	};
};