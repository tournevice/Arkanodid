function getXMLHttpRequest() {
	var xhr = null;
	 
	if (window.XMLHttpRequest || window.ActiveXObject) {
		if (window.ActiveXObject) {
			try {
				xhr = new ActiveXObject("Msxml2.XMLHTTP");
			} catch(e) {
				xhr = new ActiveXObject("Microsoft.XMLHTTP");
			}
		} else {
			xhr = new XMLHttpRequest(); 
		}
	} else {
		alert("Votre navigateur ne supporte pas l'objet XMLHTTPRequest...");
		return null;
	}
	 
	return xhr;
}

function loadFile(fileName, callback) {
	var xhr = getXMLHttpRequest();
	var level = "http://localhost:80/Brick/" + fileName;
	xhr.open("GET", level, false);
	xhr.send(""); 
	
	if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
		callback(xhr.responseText);
	}
}