var AWS = require('aws-sdk');
AWS.config.loadFromPath('../credentials.json');
var dynamodb = new AWS.DynamoDB();

var userContents = [
		{
			artistName : {
				S : 'SupaKitch'
			},
			location : {
				S : 'Paris, France'
			},
			joinDate : {
				S : '03/03/2014'
			},
			artistAvatar : {
				S : 'https://s3-eu-west-1.amazonaws.com/ink-media/user-avatars/supavatar.jpg'
			},
			happyCustomers : {
				N : '37'
			}
		},
		{
			artistName : {
				S : 'Grace Neutral'
			},
			location : {
				S : 'London, England'
			},
			joinDate : {
				S : '06/06/2014'
			},
			artistAvatar : {
				S : 'https://s3-eu-west-1.amazonaws.com/ink-media/user-avatars/graceavatar.jpg'
			},
			happyCustomers : {
				N : '23'
			}
		} ];

var artworkContents = [
		{
			currency : {
				S : '€'
			},
			deposit : {
				N : '100'
			},
			artistAvatar : {
				S : 'https://s3-eu-west-1.amazonaws.com/ink-media/user-avatars/supavatar.jpg'
			},
			artistName : {
				S : 'SupaKitch'
			},
			fullPrice : {
				N : '1200'
			},
			title : {
				S : 'Ice-nine'
			},
			likes : {
				N : '1024'
			},
			artworkUrl : {
				S : 'https://s3-eu-west-1.amazonaws.com/ink-media/tattoos/tattt.jpg'
			}
		},
		{
			currency : {
				S : '€'
			},
			deposit : {
				N : '100'
			},
			artistAvatar : {
				S : 'https://s3-eu-west-1.amazonaws.com/ink-media/user-avatars/supavatar.jpg'
			},
			artistName : {
				S : 'SupaKitch'
			},
			fullPrice : {
				N : '9999'
			},
			title : {
				S : 'SupEagle'
			},
			likes : {
				N : '564'
			},
			artworkUrl : {
				S : 'https://s3-eu-west-1.amazonaws.com/ink-media/tattoos/supeagle.jpg'
			}
		},
		{
			currency : {
				S : '€'
			},
			deposit : {
				N : '100'
			},
			artistAvatar : {
				S : 'https://s3-eu-west-1.amazonaws.com/ink-media/user-avatars/supavatar.jpg'
			},
			artistName : {
				S : 'SupaKitch'
			},
			fullPrice : {
				N : '1200'
			},
			title : {
				S : 'SupSkull'
			},
			likes : {
				N : '1024'
			},
			artworkUrl : {
				S : 'https://s3-eu-west-1.amazonaws.com/ink-media/tattoos/supskull.jpg'
			}
		},
		{
			currency : {
				S : '£'
			},
			deposit : {
				N : '80'
			},
			artistAvatar : {
				S : 'https://s3-eu-west-1.amazonaws.com/ink-media/user-avatars/graceavatar.jpg'
			},
			artistName : {
				S : 'Grace Neutral'
			},
			fullPrice : {
				N : '6000'
			},
			title : {
				S : 'Lunatic Mandala'
			},
			likes : {
				N : '423'
			},
			artworkUrl : {
				S : 'https://s3-eu-west-1.amazonaws.com/ink-media/tattoos/lunaticmandala.jpg'
			}
		},
		{
			currency : {
				S : '£'
			},
			deposit : {
				N : '80'
			},
			artistAvatar : {
				S : 'https://s3-eu-west-1.amazonaws.com/ink-media/user-avatars/graceavatar.jpg'
			},
			artistName : {
				S : 'Grace Neutral'
			},
			fullPrice : {
				N : '364'
			},
			title : {
				S : 'Mandalicious'
			},
			likes : {
				N : '423'
			},
			artworkUrl : {
				S : 'https://s3-eu-west-1.amazonaws.com/ink-media/tattoos/gracetattoo2.jpg'
			}
		} ];


userContents.forEach(function(user) {
	dynamodb.putItem({
		Item: user,
		TableName: 'users'
	}, function(err, data) {
		if (err) {
			console.log(err, err.stack); // an error occurred
		} else {
			console.log(user.artistName.S + " was sucessfully added."); // successful response
		}
	});

});

artworkContents.forEach(function(artwork) {
	dynamodb.putItem({
		Item: artwork,
		TableName: 'artworks'
	}, function(err, data) {
		if (err) {
			console.log(err, err.stack); // an error occurred
		} else {
			console.log(artwork.title.S + " by " + artwork.artistName.S + " was sucessfully added."); // successful response
		}
	});

});