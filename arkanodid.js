window.addEventListener('load', function() {
	var elem = document.getElementById('canvas');
	if (!elem || !elem.getContext) {
		return;
	}
	
	var context = elem.getContext('2d');
	if (!context) {
		return;
	}
}, false)

var NBR_LIGNES = 5;
var NBR_BRIQUES_PAR_LIGNE = 8;
var BRIQUE_WIDTH = 48;
var BRIQUE_HEIGHT = 15;
var ESPACE_BRIQUE = 2;
var tabBriques; // Tableau virtuel contenant les briques