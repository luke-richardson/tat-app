var AWS = require('aws-sdk');
AWS.config.loadFromPath('./credentials.json');
var dynamodb = new AWS.DynamoDB();
var converter = require('./dynamotojson.js');

var io = require('socket.io')(99999);

io.on('connection', function(socket) {
	console.log("New connect.");

	socket.on('getUser', function(userName, callback) {
		console.log("Received request for " + userName);
		dynamodb.getItem({
			"TableName" : "users",
			"Key" : {
				"artistName" : {
					"S" : userName
				}
			}
		}, function(err, data) {
			if (err) {
				console.log(err);
			} else {
				callback(converter.ObjectConverter(data.Item));
			}
		});
	});
	
	socket.on('getArtworks', function(args, callback) {
		console.log("Received fetch artworks request.");
		dynamodb.scan({
			"TableName" : 'artworks'
		}, function(err, data) {
			if (err) {
				console.log(err, err.stack);
			} else {
				callback(converter.ArrayConverter(data.Items));
			}
		});
	});

	socket.on('disconnect', function() {
	});
});