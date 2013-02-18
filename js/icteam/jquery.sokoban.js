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
			var sokoban = new Sokoban(games, gameDiv, settings.imagesUrl, settings.startGameUrl);
			sokoban.start();
		}, "json")
		.fail(function(a,b,c){ console.log("failed fetching data..." + b); });
		return this;
	};
})(jQuery);
