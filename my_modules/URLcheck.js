const http = require ('http')
const https = require ('https')
const URL = require ('url').URL

// here we check if the URL is SoundCloud or Wasabi.

module.exports = URLcheck

// this module help to check if URL is on Soundcloud or Amazon.
// URLcheck(urlToCheck, function(err,result){
// 	if (err) return console.error(err)
// 	console.log(result)
// })

function URLcheck (urlToCheck, callback) {

	const myURL = new URL(urlToCheck)
	
	const sc = new RegExp('soundcloud')
	const s3 = new RegExp('wasabi')

	  if (sc.test(myURL.hostname)) {
	  	return callback(null, 'soundcloud')
	  }
	  if (s3.test(myURL.hostname)) {
	  	return callback(null, 'wasabi')
	  }
	  
	  callback('There seems to be a problem with URL, not hosted on Soundcloud neither Wasabi.')
}