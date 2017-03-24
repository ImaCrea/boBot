const fs = require('fs');
var UploadStream = require("s3-stream-upload")
var S3 = require("aws-sdk").S3
var config = require("./config.js")

// upload to S3
// call architecture
// S3up(trackDownloaded,trackNumber, episodeNumber,function(err,trackUploaded){
// 	if (err) console.error(err)
// 	console.log(trackUploaded)
// })

function S3up (file,trackNumber,episodeNumber,callback) {

	var s3 = new S3({
		accessKeyId: config.S3accessKeyId,
		secretAccessKey: config.S3secretAccessKey,
		region: 'eu-west-1'
	});

	var s3params = {
		ACL: "public-read",
		Bucket: "mailtapetracks",
		Key: episodeNumber+"/track"+trackNumber+".mp3" 
	}

	var fileURL = "https://"+s3params.Bucket+".s3.amazonaws.com/"+s3params.Key

	fs.createReadStream(file)
	.pipe(UploadStream(s3, s3params))
	.on("error", function (err) {
		callback("ERROR when trying to upload "+file+" on "+remotepath+" : "+err);
	})
	.on("finish", function () {
		callback(null,fileURL);
	});
}

module.exports = S3up