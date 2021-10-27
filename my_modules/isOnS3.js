const fs = require('fs');
var UploadStream = require("s3-stream-upload");
const S3 = require("aws-sdk/clients/s3");
const AWS = require('aws-sdk');
var config = require("./config.js");
const wasabiEndpoint = new AWS.Endpoint('s3.eu-central-1.wasabisys.com');

// call architecture
// isOnS3(211,1,function(err,fileURL){
// 	if (err) console.log("not on S3 babe")
// 	console.log("it's on S3 babe, URL: "+fileURL)
// })


// is the track number X from episode Y on S3 ?
function isOnS3 (episodeNumber,trackNumber,callback) {

	var s3 = new S3({
		endpoint: wasabiEndpoint,
		accessKeyId: config.S3accessKeyId,
		secretAccessKey: config.S3secretAccessKey,
		region: 'eu-central-1',
	});

	var s3params = {
			Bucket: "mtsounds",
			Key: episodeNumber+"/track"+trackNumber+".mp3"
		}

	var fileURL = "https://"+s3params.Bucket+".s3.eu-central-1.wasabisys.com/"+s3params.Key

	s3.getObject(s3params,function(err,result){
		console.log ("isOnS3: "+fileURL);
		if (err) {console.log ("isOnS3: "+fileURL+err); return callback(err,null);}
		callback(null,fileURL)
		//console.log("it's on S3 babe, URL: "+fileURL)
	})

}

module.exports = isOnS3