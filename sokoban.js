function Game(gameData) {
	this.gameData = gameData;

	this.wall = "#";
	this.player = "@";
	this.playerOnGoal = "+";
	this.box = "$";
	this.boxOnGoal = "*";
	this.goal = ".";
	this.floor = " ";

	this.level = 1;
	this.playerx;
	this.playery;
	this.board;
	this.rowcount;
	this.colcount;

	// load some data...
	var levelCountXPath = "count(//Level)";
	var levelCountResult = this.gameData.evaluate(levelCountXPath, this.gameData, null, XPathResult.NUMBER_TYPE,null);
	this.maxlevel = levelCountResult.numberValue;

	this.initBoard = function() {
		this.board = [];

		var rowCountXPath = "//Level[@Id='" + this.level + "']/@Height";
		var rowCountResult = this.gameData.evaluate(rowCountXPath, this.gameData, null, XPathResult.NUMBER_TYPE, null);
		this.rowcount = rowCountResult.numberValue;

		var colCountXPath = "//Level[@Id='" + this.level + "']/@Width";
		var colCountResult = this.gameData.evaluate(colCountXPath, this.gameData, null, XPathResult.NUMBER_TYPE,null);
		this.colcount = colCountResult.numberValue;

		var levelLinesXPath = "//Level[@Id='" + this.level + "']/L";
		var levelLinesResult = this.gameData.evaluate(levelLinesXPath, this.gameData, null, XPathResult.ANY_TYPE, null);	
		var line = levelLinesResult.iterateNext();
		
		var row = 0;
		while(line) {
			var columns = [];

			var lineText = line.textContent;
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
			++row;
			line = levelLinesResult.iterateNext();
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
		var html="<table>";
		for(var row=0;row<this.rowcount;++row) {
			html += "<tr>";
			for(var col=0;col<this.colcount;++col) {
				html += "<td id='row" + row +"col" +col +"' class='gamecell'>" + this.getCellHtml(row,col) + "</td>";
			}
			html += "</tr>";
		}
		html += "</table>";

		$("#game").html(html);
	};

	this.getCellHtml = function(row, col) {
		var cellValue = this.board[row][col] ? this.board[row][col] : this.floor;
		if(cellValue == this.player) return "<img src='./images/player.png'/>";
		if(cellValue == this.playerOnGoal) return "<img src='./images/playerOnGoal.png'/>";
		if(cellValue == this.box) return "<img src='./images/box.png'/>";
		if(cellValue == this.boxOnGoal) return "<img src='./images/boxOnGoal.png'/>";
		if(cellValue == this.wall) return "<img src='./images/wall.png'/>";
		if(cellValue == this.goal) return "<img src='./images/goal.png'/>";
		if(cellValue == this.floor) return "&nbsp;";
	}

	this.drawUpdate = function(playery, playerx, newplayery, newplayerx, newboxy, newboxx) {
		if(newboxy != null && newboxx != null) $("#row" + newboxy + "col" + newboxx).html(this.getCellHtml(newboxy,newboxx));
		$("#row" + newplayery + "col" + newplayerx).html(this.getCellHtml(newplayery,newplayerx));
		$("#row" + playery + "col" + playerx).html(this.getCellHtml(playery,playerx));
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
		this.drawUpdate(this.playery, this.playerx, newplayery, newplayerx, newboxy, newboxx);
		this.playerx=newplayerx;
		this.playery=newplayery;
		if (this.isCompleted()) {
			if(this.level <= this.maxlevel){
				alert("Congratulations. You completed level " + this.level);
				this.level++;
				this.initBoard();
				this.drawBoard();
			} else {
				alert("Congratulations. You completed this game");
			}
		}
	}
}
