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

	MDReader(MDfile,'category',function(err, result){
		if (err) return callback(err)
		episodeNumber=result
	})

	// let's get the url and see if it is a SC link or AWS link
	MDReader(MDfile,'track'+trackNumber+'_link', function(err, trackURL) {
		if (err) return callback(err)

		URLcheck(trackURL, function(err,trackHoster){
			if (err) return callback(err)

			if (trackHoster==='amazon') {
				return callback(null,logPrefix+"already streamed from Amazon.")
			}

			if (trackHoster==='soundcloud') {
				//console.log("Track is streamed from Soundcloud. Let's see if it's streamable or not, attempt a backup and link update in case")
				
				isSCstreamable(trackURL,function(err, streamable){
					if (err) return callback(err)

					if (streamable) {
						//console.log("Cool it's streamable, let's see if track "+trackNumber+" from episode "+episodeNumber+" is backed up")
						
						isOnS3(episodeNumber,trackNumber,function(err,result){
							if (err) {
								//console.log("not on S3, let's download it on SC and backup up this gem")
								
								SCdl(trackURL,function(err, trackDownloaded){
									if (err) return callback(err)						
									//console.log("cool track is downloaded from SC, let's back it up.")
									S3up(trackDownloaded,trackNumber, episodeNumber,function(err,trackURLS3){
										if (err) return callback(err)
										//console.log("cool track "+trackNumber+" from episode "+episodeNumber+" is now backed up! Stream it on "+trackURLS3)
										return callback(null,logPrefix+"backed up on S3")
									})

								})
							}
							
							if (result)	{
								//console.log("All good, track "+trackNumber+" from episode "+episodeNumber+" is streamable from SC and already backed up. Chillax")
								return callback(null,logPrefix+"track ok and already backed up")
							}
						})
					}
				  	
				  	else {
				  		//console.log("this track is not streamable. Let's see if we have a back up, and if not, let's DL it on YT")
				  		
				  		isOnS3(episodeNumber,trackNumber,function(err,backupURL){
				  			if (err) {
				  				//console.log("not streamable and not on S3, let's download it on YT, back it up and update MDfile")
				  				
				  				MDReader(MDfile,'track'+trackNumber+'_title', function(err, trackTitle) {
				  					if (err) return callback(err)

				  					//console.log("Looking on YT for "+trackTitle)
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
					  			//console.log("not streamable but already backed up. let's update MDfile with good URL")
					  			MDUpdater(MDfile,trackURL,backupURL,function(err){
					  				if (err) return callback(err)
					  				//console.log("OK: not streamable track was updated with backup URL.")
					  				return callback(null,logPrefix+"fixed! (updated with backup)")
					  			})
					  		}

				  		})
				  	}
				})

			}
		})
	})
}

