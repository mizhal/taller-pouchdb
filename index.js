var connect = require('connect');
var serveStatic = require('serve-static');

var PORT = 8086

connect()
	.use(serveStatic(__dirname + "/www"))
	.listen(PORT, 
		function(){
    		console.log('Server running on ' + PORT + '...');
		}
	)
;