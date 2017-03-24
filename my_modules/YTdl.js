const fs = require('fs');
var ytdl = require('ytdl-core');
var ffmpeg = require('fluent-ffmpeg');
var ffmpeg_bin = require('ffmpeg-static');

// grab the video on YT and extract the audio as an mp3
function YTAudioDL(url, callback) {

	var options = {
		filter: function(format) { 
			return format.container === 'mp4'; 
		} 
	}

	ffmpeg(ytdl(url,options))
	.noVideo()
	.audioCodec('libmp3lame')
	.audioBitrate(128)
	.format('mp3')
	.on('error', function(err) {
		callback('An error occurred: ' + err.message)
	})
	.on('end', function() {
		callback(null, 'myTrack.mp3') // Good, go to the next step now the track is downloaded.
	})
	.save('myTrack.mp3')

}

module.exports = YTAudioDL