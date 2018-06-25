const fs = require('fs');
var UploadStream = require("s3-stream-upload")
var S3 = require("aws-sdk").S3
var config = require("./config.js")


// call architecture
// isOnS3(211,1,function(err,fileURL){
// 	if (err) console.log("not on S3 babe")
// 	console.log("it's on S3 babe, URL: "+fileURL)
// })


// is the track number X from episode Y on S3 ?
function isOnS3 (episodeNumber,trackNumber,callback) {

	var s3 = new S3({
		accessKeyId: config.S3accessKeyId,
		secretAccessKey: config.S3secretAccessKey,
		region: 'eu-west-3'
	});

	var s3params = {
			Bucket: "mailtapesounds",
			Key: episodeNumber+"/track"+trackNumber+".mp3"
		}

	var fileURL = "https://"+s3params.Bucket+".s3.amazonaws.com/"+s3params.Key

	s3.getObject(s3params,function(err,result){
		if (err) return callback(err,null)
		callback(null,fileURL)
	})

}

module.exports = isOnS3