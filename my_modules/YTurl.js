// Search on Youtube for a track and return its URL if find a 'good' result.

const search = require('youtube-search')
const leven = require('leven')

var config = require("./config.js")

//var tolerance_max=5 // Set here tolerance for quality of result. 

var opts = {
  maxResults: 10,
  key: config.YTkey,
  type: 'video',
}

function YTurl (query,tolerance_max,callback) {
	var count=0
	var tolerance=0
	
	setTimeout(function(){
		search(query, opts, function(err, results) {
		  if(err) {return callback(err)}
		  do {
			results.forEach (function(result) {
				if (leven(query, result.title)===tolerance) {
				count++
				if (count===1) return callback(null,result.link) //return first result only
				}
		  	})
		  	tolerance++
		  }
		  while (tolerance < tolerance_max)
		  
		  if (count===0 && tolerance===tolerance_max) {return callback("No YT URL found for "+query+" Sorry :/")}
		})
	},1000)

}

module.exports = YTurl

// YTurl(process.argv[2], function (err,chunk) {
// 	if (err) {return console.log(err)}
// 	console.log(chunk)
// })