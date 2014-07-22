var qs = require("querystring"),
    xml2js = require("xml2js"),
    parser = new xml2js.Parser(),
    config = require("../config"),
    crypto = require("crypto"),
    tar = require("tar"),
    fs = require("fs"),
    util = require("util"),
    exec  = require('child_process').exec,
    child,
    path = require("path"),
    multiparter = require("multiparter"),
    http = require("http"),
    mime = require("mime"),
    url = require("url");

// we probably need to do that logger thing again
var Logger = require('devnull')
    , logger = new Logger();

function md5HexDigest(data)
{
    var string = new Buffer(data, "hex");
    var hash = crypto.createHash("md5");
    hash.update(string);
    return hash.digest("hex");  
}

/*
 * Human index file :)
 */
exports.index = function(req, res){
    res.render('index', {layout: false});
};

/*
 * Upload file command.
 */

exports.upload = function(req, res) {
    var renderUpload = function(err, data) {
	var obj = data["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]["ns1:UploadPhoto"][0];
	var folder = config.folder;
	if(config.cards[obj.macaddress].folder) {
	    folder = config.cards[obj.macaddress].folder;
	}
	logger.info("Working on filename %s -> %s", req.files.filename.path, req.files.filename.name);
	logger.info("Extracting to folder %s", folder);

	fs.createReadStream(req.files.FILENAME.path) 
	    .pipe(tar.Extract({ path: folder }))
	    .on("error", function (err) {
		    logger.error("error while processing file %s", req.files.FILENAME.path);
		    }
	       )
	    .on("end", function () {
		    logger.log("Folder: %s", folder);
		    var file = folder+req.files.FILENAME.name.substr(0, req.files.FILENAME.name.length -4);
		    logger.log("File name: %s", file);

		    fs.unlink(req.files.FILENAME.path, function(err) {
			if (err) logger.error("Couldn't delete file: %s", err);
		    });

		    if (config.cards[obj.macaddress].command) {
			var command = util.format(config.cards[obj.macaddress].command, path.normalize(file));
			logger.info("Executing command %s", command);
			child = exec(command, function (error, stdout, stderr) {
			    logger.log('stdout: ' + stdout);
			    logger.log('stderr: ' + stderr);
			    if (error !== null) {
				logger.error('exec error: ', error);
			    }
			});
		    }

		    if (config.post) {
			var settings = url.parse(config.post);
			var request = new multiparter.request(http, {
			    host: settings.hostname,
			    port: settings.post, 
			    path: settings.pathname,
			    method: "POST"
			});

			request.addStream(
				'file', 
				path.basename(file),
				mime.lookup(file),
				fs.statSync(file).size,
				fs.createReadStream(file));

			request.send(function(error, response) {
				if (error) {
				    console.log(error);
				}

				var data = "";

				response.setEncoding("utf8");

				response.on("data", function(chunk) {
				    data += chunk;
				    });

				response.on("end", function() {
				    //console.log("Data: " + data);
				    });

				response.on("error", function(error) {
				    console.log(error);
				    });
				});
		    }

		    //console.log(req.socket._idleStart.getTime());
		    logger.log("Finished Upload successfully.");
		    res.render('uploadSuccess', {layout: false});
	    })
    };

    var decodedBody = decodeURIComponent(qs.stringify(qs.parse(req.body.SOAPENVELOPE)));
    parser.parseString(decodedBody, renderUpload); 
};

/*
 * All other commands that don't have anything to do with uploading.
 */

exports.soap = function(req, res) {  
    //api.eye.fi:80
    //StartSession
    //GetCardSettings
    var renderStartSession = function(err, data) {
	var obj = data["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]["ns1:StartSession"][0];
	if(config.cards[obj.macaddress]) {
	    var credential = md5HexDigest(obj.macaddress + obj.cnonce + config.cards[obj.macaddress].uploadkey);
	    res.render('startSession', {layout:false, "credential": credential, "snonce":"8744904b7ea202439631c67186690a1e", "transfermodetimestamp": obj.transfermodetimestamp, "transfermode":obj.transfermode });  
	}
    };

    var renderGetPhotoStatus = function(err, data) {
	var obj = data["SOAP-ENV:Envelope"]["SOAP-ENV:Body"][0]["ns1:GetPhotoStatus"][0];
	logger.log("Camera requests status of %s ", obj["filename"][0]);
	if(config.cards[obj.macaddress]) {
	    var credential = md5HexDigest(obj.macaddress + config.cards[obj.macaddress].uploadkey + "8744904b7ea202439631c67186690a1e");
	    res.render('getPhotoStatus', {layout:false});
	}
    };

    var renderMarkLastPhotoInRoll = function(err, data) {
	res.render('markLastPhotoInRoll', {layout: false});
    };

    /*
     * Get add data in the SOAP-Request
     */
    var getData = function(callback) {
	var body = '';
	var parsedbody = '';
	req.on('data', function (data) {
		body += data;
		}); 
	req.on('end', function () {
		var decodedBody = decodeURIComponent(qs.stringify(qs.parse(body)));
		parser.parseString(decodedBody, callback);
		});
    };

    /*
     * Decide what kind of SOAP request this was.
     */
    logger.info("SOAP action requested: %s", req.headers.soapaction);
    switch(req.headers.soapaction.substr(5, req.headers.soapaction.length-6)) {

	case "StartSession":
	    logger.info("SOAP StartSession");
	    //console.log(req.params);
	    getData(renderStartSession);
	    break;
	case "GetPhotoStatus":
	    logger.info("SOAP GetPhotoStatus");
	    getData(renderGetPhotoStatus);
	    break;
	case "MarkLastPhotoInRoll":
	    logger.info("SOAP MarkLastPhotoInRoll");
	    getData(renderMarkLastPhotoInRoll);
	    break;
	default:
	    logger.warning("Different request - We don't really know what to do!", req.headers);
	    var length = req.headers.soapaction.length;
	    // console.log(length-2);
	    logger.notice("Unknown SOAP action: %s", req.headers.soapaction.substr(5, req.headers.soapaction.length-6));
	    break;
    }
};

