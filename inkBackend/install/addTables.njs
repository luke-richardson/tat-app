var AWS = require('aws-sdk');
AWS.config.loadFromPath('../credentials.json');
var dynamodb = new AWS.DynamoDB();

var userParams = {
	AttributeDefinitions : [ {
		AttributeName : 'artistName',
		AttributeType : 'S'
	} ],
	KeySchema : [ {
		AttributeName : 'artistName',
		KeyType : 'HASH'
	} ],
	ProvisionedThroughput : {
		ReadCapacityUnits : 1,
		WriteCapacityUnits : 1
	},
	TableName : 'users'
};

var artworkParams = {
	AttributeDefinitions : [ {
		AttributeName : 'artistName',
		AttributeType : 'S'
	}, {
		AttributeName : 'title',
		AttributeType : 'S'
	} ],
	KeySchema : [ {
		AttributeName : 'artistName',
		KeyType : 'HASH'
	}, {
		AttributeName : 'title',
		KeyType : 'RANGE'
	} ],
	ProvisionedThroughput : {
		ReadCapacityUnits : 1,
		WriteCapacityUnits : 1
	},
	TableName : 'artworks'
};

	dynamodb.deleteTable({
		TableName : 'users'
	}, function(err, data) {
		if (err) {
			console.log(err, err.stack);
		} else {
			console.log(data);
			setTimeout(function(){
				dynamodb.deleteTable({
					TableName : 'artworks'
				}, function(err, data) {
					if (err) {
						console.log(err, err.stack);
					} else {
						console.log(data);
						setTimeout(function(){
							dynamodb.createTable(userParams, function(err, data) {
								if (err) {
									console.log(err, err.stack); // an error occurred
								} else {
									console.log(data); // successful response
									setTimeout(function(){
										dynamodb.createTable(artworkParams, function(err, data) {
											if (err) {
												console.log(err, err.stack); // an error occurred
											} else {
												console.log(data); // successful response
												console.log("ALL FINISHED.");
											}
										});
									}, 10000);
								}
							});
						}, 60000);
					}
				});
			}, 10000);
		}
	});

	

	

