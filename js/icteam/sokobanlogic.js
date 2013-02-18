(function(){
    function SokobanLogic() {
        this.newBoardCallbacks = [];
        this.updateBoardCallbacks = [];
        this.completedLevelCallbacks = [];
        this.completedGameCallbacks = [];

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
        this.moves;

        this.initializeGame = function(gameUrl) {
            this.urlOfCurrentGame = gameUrl;
            $.get(gameUrl, $.proxy(function(gameData) {
                this.gameData = gameData;
                this.numberOfAvailableLevels = this.gameData.SokobanLevels.LevelCollection.Level.length;
                this.initializeLevel(0);
            }, this), "json")
            .fail(function(a,b,c){ console.log("failed fetching data..." + b); });
        };

        this.getNumberOfRowsInLevel = function(){
            return this.board.length;
        };

        this.getNumberOfColumnsInLevel = function(){
            return this.board[0].length;
        };

        this.getNumberOfMoves = function(){
            return this.moves.length;
        };

        this.initializeLevel = function(numberOfLevel) {
            this.numberOfCurrentLevel = numberOfLevel;
            this.board = [];
            this.moves = [];

            var currentLevel = this.gameData.SokobanLevels.LevelCollection.Level[this.numberOfCurrentLevel];
            var numberOfRowsInLevel =  currentLevel.Height;
            var numberOfColumnsInLevel = currentLevel.Width;

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

                for(var col = rowText.length;col<numberOfColumnsInLevel;++col) {
                    columns[col] = this.floor;
                }

                this.board[row] = columns;
            }

            while(row<numberOfRowsInLevel) {
                var columns = [];
                for(var col=0;col<numberOfColumnsInLevel;++col) {
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

        this.addUpdateBoardCallback = function(callback){
            this.updateBoardCallbacks.push(callback);
        };

        this.addCompletedLevelCallback = function(callback) {
            this.completedLevelCallbacks.push(callback);
        };

        this.addCompletedGameCallback = function(callback) {
            this.completedGameCallbacks.push(callback);
        };

        this.invokeNewBoardCallbacks = function(){
            this.invokeCallbacks(this.newBoardCallbacks);
        };
        this.invokeCompletedLevelCallbacks = function(){
            this.invokeCallbacks(this.completedLevelCallbacks);
        };

        this.invokeCompletedGameCallbacks = function(){
            this.invokeCallbacks(this.completedGameCallbacks);
        };

        this.invokeUpdateBoardCallbacks = function(updatedCellCoordinates){
            this.invokeCallbacks(this.updateBoardCallbacks, updatedCellCoordinates);
        };

        this.invokeCallbacks = function(callbacks, parameters){
            for(var i=0;i<callbacks.length;++i)
            {
                var callback = callbacks[i];
                callback.method.call(callback.target, parameters);
            }
        };

        this.isCompleted = function() {
            for(var row=0;row<this.getNumberOfRowsInLevel();++row) {
                for(var col=0;col<this.getNumberOfColumnsInLevel();++col) {
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
                this.invokeCompletedLevelCallbacks();
                if(this.numberOfCurrentLevel < this.numberOfAvailableLevels){
                    this.numberOfCurrentLevel++;
                    this.initializeLevel(this.numberOfCurrentLevel);
                } else {
                    this.invokeCompletedGameCallbacks();
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

    var root = typeof exports !== "undefined" && exports !== null ? exports : window;
    root.SokobanLogic = SokobanLogic;
}).call(this);
