function Game() {
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

	this.initBoard = function() {
		this.playerx = 10;
		this.playery = 10;
		this.board = [];

		var rows=20;
		var cols=30;
		for(var row=0;row<rows;++row){
			var columns = [];
			for(var col=0;col<cols;++col){
				var cellvalue = this.floor;
				if(row == 0 || row == rows-1 || col == 0 || col == cols-1) cellvalue = this.wall;
				columns[col] = cellvalue;
			}
			this.board[row] = columns;
		}

		this.board[this.playery][this.playerx] = this.player;
		this.board[this.playery-1][this.playerx] = this.box;
		this.board[this.playery-1][this.playerx-1] = this.box;
		this.board[this.playery-2][this.playerx] = this.goal;
		this.board[this.playery-2][this.playerx-1] = this.goal;
		this.board[this.playery-3][this.playerx-1] = this.goal;
		this.board[this.playery-3][this.playerx-2] = this.boxOnGoal;

		this.rowcount = this.board.length;
		this.colcount = this.board[0].length;
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
		return this.board[row][col];
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
			if(this.level <= 50){
				alert("Congratulations. You completed this level");
				this.level++;
				this.initBoard();
				this.drawBoard();
			} else {
				alert("Congratulations. You completed this game");
			}
		}
	}
}
