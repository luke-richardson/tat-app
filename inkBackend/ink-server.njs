var AWS = require('aws-sdk');
AWS.config.loadFromPath('./credentials.json');
var mongojs = require('mongojs');
var db = mongojs.connect("localhost:27017/inkdb", [ "users", "artworks" ]);
var https = require("https");
var fs = require('fs');
var FB = require('fb');
var jwt = require('jsonwebtoken');
var key = '53f87e792215525bdfdb200e291aca83764b3d8a3dd8d74090a046e73c82d11178ae47b425f4bf6efe0f988b';

//epoch is (new Date()).getTime()
var batchSize = 3;

var server = https.createServer({
	key : fs.readFileSync('./ssl/server.key', 'utf8'),
	cert : fs.readFileSync('./ssl/server.crt', 'utf8')
});

var port = 2118;

var io = require('socket.io')(server);
var sio = io.of("/sio");

var socketioJwt   = require("./socketiojwt.js");

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
						var tkn = jwt.sign({
							fbtkn: token,
							id: data._id,
							name: data.artistName
						}, key);
						console.log(tkn);
						callback(data, tkn);
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
									var tkn = jwt.sign({
										fbtkn: token,
										id: dat2._id,
										name: dat2.artistName
									}, key);
									console.log(tkn);
									callback(dat2, tkn);
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
		db.artworks.find({}).limit(batchSize, function(err, data) {
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
		}).limit(batchSize, function(err, data) {
			if (err) {
				console.log(err, err.stack);
			} else {
				callback(data);
			}
		});
	});

	socket.on('getArtworksByDistance', function(args,
			callback) {
		console.log("Received fetch artworks by distance request.");
		db.runCommand(
				{
					geoNear: "artworks",
					near: { type: "Point", coordinates: [ args.longitude, args.latitude ] },
					spherical: true,
					limit: batchSize,
					minDistance: args.minDistanceMetres
				}, function(err, data) {
			if (err) {
				console.log(err, err.stack);
			} else {
				callback(data.results);
			}
		});
	});

	socket.on('disconnect', function() {
	});
});



// Behaviour that requires being logged in.
sio.on('connection', socketioJwt.authorize({
    secret: key,
    server: sio,
    timeout: 15000 // 15 seconds to send the authentication message
  })).on('authenticated', function(socket) {
	console.log(socket.decoded_token.name + ' has connected');
	
	socket.on('myProfile', function(na, callback){
		console.log("Totally worked: " + socket.decoded_token.id);
		db.users.findOne({
			_id : mongojs.ObjectId(socket.decoded_token.id)
		}, function(err, data){
			if (err) {
				console.log(err, err.stack);
			} else {
				console.log("callback data: " + data);
				callback(data);
			}
		});
	});
});