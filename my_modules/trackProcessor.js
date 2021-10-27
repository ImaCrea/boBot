const YTurl = require('./YTurl.js')
const MDReader = require('./MDReader.js')
const MDUpdater = require('./MDUpdater.js')
const YTdl = require('./YTdl.js')
const S3up = require('./S3up.js')
const isOnS3 = require('./isOnS3.js')
const isSCstreamable = require('./isSCstreamable.js')
const SCdl = require('./SCdl.js')
const URLcheck = require('./URLcheck.js')

// setting:
var YTSearchTolerance=5

module.exports = trackProcessor

//call architecture
// var trackNumber=6
// var MDfile="./posts/2014-03-30-Catching-Flies.md"

// trackProcessor(MDfile,trackNumber, function(err, result){
// 	if (err) console.error(err)
// 	console.log(result)
// })

function trackProcessor (MDfile,trackNumber,callback) {
	var episodeNumber
	var logPrefix=MDfile+" - track"+trackNumber+" : "

	let getEpNumber = new Promise(function(resolve,reject){

		MDReader(MDfile,'category',function(err, result){
			if (err) reject(new Error(callback(err)));
			episodeNumber=result;
			resolve(result);
		})

	});



	// MDReader(MDfile,'category',function(err, result){
	// 	if (err) return callback(err);
	// 	episodeNumber=result;
	// })

	// let's get the url and see if it is a SC link or AWS link
	getEpNumber.then(

		function(result) {

			MDReader(MDfile,'track'+trackNumber+'_link', function(err, trackURL) {
				if (err) return callback(err)

				URLcheck(trackURL, function(err,trackHoster){
					if (err) return callback(err)

					if (trackHoster==='wasabi') {
						return callback(null,logPrefix+"already streamed from Wasabi.")
					}

					if (trackHoster==='soundcloud') {				
						// no more check on SC since we can't connect to it for the moment
						 
						//console.log("- Found SC link to replace "+trackURL);

						// TODO : Rajouter un callback avec la récupération du numéro de l'épisode

				  		isOnS3(episodeNumber,trackNumber,function(err,backupURL){

				  			if (err) {		  				
				  				MDReader(MDfile,'track'+trackNumber+'_title', function(err, trackTitle) {
				  					if (err) return callback(err)

				  					console.log("Looking on YT for "+trackTitle)
					  				YTurl(trackTitle, YTSearchTolerance, function(err,YTURL) {
					  					if (err) return callback("Error with "+trackTitle+" in "+MDfile+" : "+err)
					  					
					  					YTdl(YTURL,function(err,trackDownloaded) {
					  						if (err) return callback("Error when trying to download "+YTURL+" :"+err)
					  						
					  						//console.log("Track now downloaded and ready for upload on AZ")
					  						S3up(trackDownloaded,trackNumber, episodeNumber,function(err,trackURLS3){
					  							if (err) return callback(err)
					  							//console.log("Cool track not streamable uploaded, downloaded on YT and now up on S3: "+trackURLS3)
					  							
					  							//console.log("Let's update the MD file with new URL")
					  							MDUpdater(MDfile,trackURL,trackURLS3,function(err){
					  								if (err) return callback(err)
					  								//console.log("MD updated with new S3 track downloaded straight from YT. BOOM!")
					  								return callback(null,logPrefix+"fixed! (dl on YT)")
					  							})
					  						})

					  					})

					  				})
					  			})

				  			}
				  			else {
					  			//console.log("- Found backupURL, let's update MDfile with backup URL instead of SC")
					  			
					  			MDUpdater(MDfile,trackURL,backupURL,function(err){
					  				if (err) return callback(err)
					  				return callback(null,logPrefix+"fixed! (updated with backup)")
					  			})
					  		}

				  		})

					}
				})
			})
		}

	);
	
}

