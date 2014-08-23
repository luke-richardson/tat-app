var AWS = require('aws-sdk');
AWS.config.loadFromPath('./credentials.json');
var dynamodb = new AWS.DynamoDB();
var databaseUrl = "localhost:27017/inkdb";
var collections = ["users", "artworks"];
var db = require("mongojs").connect(databaseUrl, collections);
var converter = require('./dynamotojson.js');



db.users.findOne({_id:db.ObjectId('53f87e792215525bdfdb200f')}, function(err, data) {
	if (err) {
		console.log(err);
	} else {
		console.log(data);
	}
});