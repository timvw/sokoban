var expect = require('expect.js');
var SokobanLogic = require('../sokobanlogic.js').SokobanLogic;

describe('When moving the player', function(){
    describe('the source cell is a player',function(){
        describe('the target cell is out of bounds', function(){
            var sut = new SokobanLogic();
            sut.board = [[sut.player]];
            sut.rowIndexForPlayer= 0;
            sut.columnIndexForPlayer = 0;
            sut.moves = [];
            sut.numberOfMoves = sut.moves.length;

            sut.move(0,1);

            it('should not move the player',function(){
                expect(sut.board[0][0]).to.be(sut.player);
            });
        });

        describe('the target cell is a floor', function(){
            var sut = new SokobanLogic();
            sut.board = [[sut.player, sut.floor]];
            sut.rowIndexForPlayer= 0;
            sut.columnIndexForPlayer = 0;
            sut.moves = [];
            sut.numberOfMoves = sut.moves.length;

            sut.move(0,1);

            it('should move the player in target cell', function(){

                expect(sut.board[0][1]).to.be(sut.player);
            });

            it('should make the source cell a floor', function(){
                expect(sut.board[0][0]).to.be(sut.floor);
            });
        });
    });
});
