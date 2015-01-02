//var AWS = require('aws-sdk');
//AWS.config.loadFromPath('./credentials.json');
var mongojs = require('mongojs');
var db = mongojs.connect("localhost:27017/inkdb", [ "users", "artworks" ]);
var http = require("http");
//var https = require("https");
var fs = require('fs');
var FB = require('fb');
var jwt = require('jsonwebtoken');
var key = '53f87e792215525bdfdb200e291aca83764b3d8a3dd8d74090a046e73c82d11178ae47b425f4bf6efe0f988b';

var batchSize = 3;

var server = http.createServer();

//var server = https.createServer({
//	key : fs.readFileSync('./ssl/server.key', 'utf8'),
//	cert : fs.readFileSync('./ssl/server.crt', 'utf8')
//});

var port = 2118;

var io = require('socket.io')(server);
var sio = io.of("/sio");

var socketioJwt = require("./socketiojwt.js");

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

	socket.on('getUser', function(userID, callback) {
		db.users.findOne({
			_id : mongojs.ObjectId(userID)
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
		db.artworks.find({}).limit(batchSize, function(err, data) {
			if (err) {
				console.log(err, err.stack);
			} else {
				callback(data);
			}
		});
	});

	socket.on('getArtworksByArtist', function(artistID, callback) {
		// console.log("Received fetch artworks by artist request.");
		db.artworks.find({
			artistID : artistID
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
		var longitude, latitude, minDistanceMetres;
		if(args.longitude === undefined || args.latitude === undefined){
			callback({
				err : "longitude and/or latitude unsupplied"
			});
			return;
		}else{
			longitude = args.longitude;
			latitude = args.latitude;
		}
		
		if( args.minDistanceMetres === undefined){
			minDistanceMetres = 0;
		}else{
			minDistanceMetres = args.minDistanceMetres;
		}
		
		
		
		db.runCommand(
				{
					geoNear: "artworks",
					near: { type: "Point", coordinates: [ longitude, latitude ] },
					spherical: true,
					limit: batchSize,
					minDistance: minDistanceMetres
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
	socket.on('myProfile', function(na, callback){
		db.users.findOne({
			_id : mongojs.ObjectId(socket.decoded_token.id)
		}, function(err, data){
			if (err) {
				console.log(err, err.stack);
			} else {
				callback(data);
			}
		});
	});
	
	socket.on('updateUsername', function(newName){
		db.users.update({
			_id : mongojs.ObjectId(socket.decoded_token.id)
		}, {
			$set: {artistName : newName}
		});
		db.artworks.update({
			artistID: socket.decoded_token.id
		}, {
			$set: {artistName: newName}
		}, {
			multi: true
		});
	});
	
	socket.on('updateLocation', function(newLocation){
		db.users.update({
			_id : mongojs.ObjectId(socket.decoded_token.id)
		}, {
			$set: {location : newLocation}
		});
	});
	
	socket.on('likePost', function(artworkId){
		db.artworks.update({
			_id : mongojs.ObjectId(artworkId)
		}, {
			$addToSet: {likes : socket.decoded_token.id}
		});
	});
	
	socket.on('unlikePost', function(artworkId){
		db.artworks.update({
			_id : mongojs.ObjectId(artworkId)
		}, {
			$pull: {likes : socket.decoded_token.id}
		});
	});
	
	
	
});