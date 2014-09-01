var AWS = require('aws-sdk');
AWS.config.loadFromPath('./credentials.json');
var db = require('./mongo.js');
var https = require("https");
var fs = require('fs');
var FB = require('fb');

var server = https.createServer({
	key : fs.readFileSync('./ssl/server.key', 'utf8'),
	cert : fs.readFileSync('./ssl/server.crt', 'utf8')
});

var port = 2118;

var io = require('socket.io')(server);
var sio = io.of("/sio");

server.listen(port);
console.log("Listening on port: " + port);

// Behaviour that does not required being logged in.
io.on('connection', function(socket) {
	console.log("New anonymous connect.");

	socket.on('authenticate', function(token, callback) {
		console.log("Authentication request received.");
		FB.api('me', {
			fields: ['id', 'name', 'picture', 'email', 'first_name', 'last_name', 'name'],
			access_token : token
		}, function(res) {
			if (res.error === undefined) {
				db.users.findOne({
					fbId : res.id
				}, function(err, data) {
					if (err) {
						console.log(err, err.stack);
					} else if (data !== null) {
						callback(data);
					} else {
						var joinDate = new Date();
						db.users.insert({
							"fbId": res.id,
							"artistName" : res.name + res.id,
							"location" : "Somewhere",
							"email" : res.email,
							"firstName" : res.first_name,
							"lastName" : res.last_name,
							"joinDate" : joinDate.getDate() + "/" + (joinDate.getMonth() + 1) + "/" + joinDate.getFullYear(),
							"artistAvatar" : res.picture.data.url,
							"happyCustomers" : 0}, function(err, dat2){
								if (err) {
									console.log(err);
								} else {
									callback(dat2);
								}
							});
					}
				});
			} else {
				callback({
					err : "Couldn't find user's details"
				});
			}
		});
	});

	socket.on('getUser', function(userName, callback) {
		// console.log("Received request for " + userName);
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
		// console.log("Received fetch artworks request.");
		db.artworks.find({}).limit(10, function(err, data) {
			if (err) {
				console.log(err, err.stack);
			} else {
				callback(data);
			}
		});
	});

	socket.on('getArtworksByArtist', function(artist, callback) {
		// console.log("Received fetch artworks by artist request.");
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

	socket.on('getArtworksByDistance', function(args, maxDistanceInMetres,
			callback) {
		console.log("Received fetch artworks by distance request.");
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

// Behaviour that requires being logged in.
sio.on('connection', function(socket) {
	console.log("User is logged in.");
});