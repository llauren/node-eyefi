try {
    process.setgid("pi");
} catch (err) {
    console.log("Setting Group failed");
}

try {
    process.setuid("pi");
} catch (err) {
    console.log("Setting User failed");
}

/**
 * Module dependencies.
    Code below is not done according to the devnull documentation...

require("./logger").init();
var logger = require('./logger').logger;
 */

var Logger = require("devnull")
  , logger = new Logger();

var express = require('express')
  , routes = require('./routes')
  , formidable = require("formidable");

var config = require("./config");

var app = module.exports = express.createServer();

// Configuration

//var progressBars = {};

app.configure(function(){
	app.use(function(req, res, next) {
	    logger.info("New request from %s to %s", req.connection.remoteAddress, req.url);
	    if (req.url == '/api/soap/eyefilm/v1/upload') {
		var form = new formidable.IncomingForm();
		var startTime = new Date();
		var old = 0;
		logger.log("Receiving data");  

		form.on('progress', function(received, expected) {
		    //console.log(this.requestHeader);
		    if(old != Math.round(received*100/expected) && Math.round(received*100/expected) % 10 == 0)
			logger.log("  received %d %", Math.round(received*100/expected));
		    old = Math.round(received*100/expected)
		});

		form.on('end', function() {
		    var timeTaken = (new Date().getTime() - startTime.getTime()) / 1000;
		    var kbs = ((req.headers['content-length']/1024)/timeTaken);
		    logger.log("Received %d kB in %d seconds (%d kB/s)", (req.headers['content-length']/1024), timeTaken, kbs);
		    });

		form.parse(req); // <--- this probably writes the income file to /tmp
	    }
	    next();
	});

	app.set('views', __dirname + '/views');
	app.register("html", require('ejs'));
	app.set('view engine', 'html');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
	app.use(express.errorHandler()); 
});

// Routes

app.get('/', routes.index);
app.post('/api/soap/eyefilm/v1', routes.soap);
app.post('/api/soap/eyefilm/v1/upload', routes.upload);

app.listen(59278);
logger.info("The Node-Eyefi Server was successfully started and is listening.");
