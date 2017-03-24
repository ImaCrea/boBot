var fs = require('fs');
var https = require('https');
const URL = require('url').URL;

var config = require("./config.js")
var client_id=config.SCclientid // SC client id

// This module take a Soundcloud URL, download the track locally and send back the destination of local track.
// If can't do it, push back an error.

// call architecture :
// var track_url='https://soundcloud.com/seftel/03-spanish-song'
// for testing, a soundcloud GO track of only 30s: https://soundcloud.com/future-islands/seasons-waiting-on-you
// for testing, a url which is *not* streamable: https://soundcloud.com/paradisfm/sur-une-chanson-en-francais

// isSCstreamable(track_url,function(err, streamable){
//   if (err) console.error(err)
//   if (streamable) console.log("YES!")
//     else console.log("Not streamable")
// })


module.exports = isSCstreamable

function isSCstreamable(track_url,callback) {
  SCResolve(track_url,client_id,function(err,solvedURL){
    if (err!=404 && err!=null) return console.error(err)
    if (err==404) return callback(null,null) // on renvoie la même chose que si la track n'était pas streamable.
    isSolveURLStreamable(solvedURL,function(err,streamableStatus){ // url solved, now check if streamable.
      if (err) return console.error(err)

      if (streamableStatus==true) { // url is streamable, so we can download it
        
        isFullTrack(solvedURL,function(err,fullTrack){
          if (err) return console.error(err)
          if (fullTrack) {
            callback(null,true) // track streamable et fait bien plus de 30s.
            //console.log("track fait plus de 30s!")
          }
          else {
            //console.log("track fait moins de 30s, attention!")
            callback(null,null)
          }
        })

      }

      if (streamableStatus==false) {  // ALERT this soundcloud link does not work anymore and it needs to be fixed.
        callback(null,null)
      }

    })
  })
}

// Solve the URL. Return something like: https://api.soundcloud.com/tracks/206722679?client_id=xxx
function SCResolve(url,client_id,callback){
  https.get('https://api.soundcloud.com/resolve?url='+url+'&client_id='+client_id, function(res){
    res.setEncoding('utf8');

    res.on('data',(d)=>{
      JSON.parse(d,function(key,value){
        if (key=='error_message') callback(404)
        if (key=='location') callback(null,value)
      })
    })

    .on('error', function(err) { // Handle errors
      callback(err)
    })

    //if (res.statusCode==404) callback("Error 404 while trying to reach SC for "+url)

  })
}

// Check if streamable. Must use the solved URL.
function isSolveURLStreamable (url,callback) {
  https.get(url, function(res) {
    res.setEncoding('utf8');

    if (res.statusCode==403) callback(null,false) // detect shitty tracks not streamable or access denied

    res.on('data', (d) => {
      JSON.parse(d,function(key,value){
        if (key=='streamable'){
          callback(null, value)
        }
      })
    })

    .on('error', function(err) { // Handle errors
      callback(err)
    })

  })
}

// Check if only 30s, which then has many chances to be a 30s snippet...
function isFullTrack (url,callback) {
  https.get(url, function(res) {
    res.setEncoding('utf8');

    res.on('data', (d) => {
      JSON.parse(d,function(key,value){
        if (key=='duration'){
          if (value>30000) {
          callback(null, true)
          }
          else
            callback(null,false)
        }
      })
    })

    .on('error', function(err) { // Handle errors
      callback(err)
    })

  })
}