var AWS = require('aws-sdk');
AWS.config.loadFromPath('./credentials.json');
var converter = require('./dynamotojson.js');
var databaseUrl = "localhost:27017/inkdb";
var collections = [ "users", "artworks" ];
var db = require("mongojs").connect(databaseUrl, collections);
var port = 2118;

var io = require('socket.io')(port);
console.log("Listening on port: " + port);

io.on('connection', function(socket) {
	console.log("New connect.");

	socket.on('getUser', function(userName, callback) {
		console.log("Received request for " + userName);
		db.users.findOne({
			artistName : userName
		}, function(err, data) {
			if (err) {
				console.log(err);
			} else {
				callback(data);
			}
		});
	});

	socket.on('getArtworks', function(args, callback) {
		console.log("Received fetch artworks request.");
		db.artworks.find({}).limit(10, function(err, data) {
			if (err) {
				console.log(err, err.stack);
			} else {
				callback(data);
			}
		});
	});

	socket.on('getArtworksByArtist', function(artist, callback) {
		console.log("Received fetch artworks by artist request.");
		db.artworks.find({
			artistName : artist
		}).limit(10, function(err, data) {
			if (err) {
				console.log(err, err.stack);
			} else {
				callback(data);
			}
		});
	});

	socket.on('getArtworksByDistance', function(args,
			maxDistanceInMetres, callback) {
		console.log("Received fetch artworks by artist request.");
		db.artworks.find({
			loc : {
				$near : {
					$geometry : {
						type : 'Point',
						coordinates : [ args.longitude, args.latitude ]
					},
					$maxDistance : maxDistanceInMetres
				}
			}
		}).limit(10, function(err, data) {
			if (err) {
				console.log(err, err.stack);
			} else {
				callback(data);
			}
		});
	});

	socket.on('disconnect', function() {
	});
});