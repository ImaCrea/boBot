var fs = require('fs');
var https = require('https');
const URL = require('url').URL;

var config = require("./config.js")
var client_id=config.SCclientid // SC client id

// This module take a Soundcloud URL, download the track locally and send back the destination of local track.
// If can't do it, push back an error.

// call artchitecture
// SCdl(track_url,function(err, result){
//   if (err) console.error(err)
//   console.log('done! '+result)
// })

// TODO
// Rewrite module by using the new module isSCscreamable to avoid code redundancy


module.exports = SCdl

function SCdl(track_url,callback) {
  var dest="myTrack.mp3"
  SCResolve(track_url,client_id,function(err,solvedURL){
    if (err) console.error(err)
    isStreamable(solvedURL,function(err,streamableStatus){ // url solved, now check if streamable.
      if (err) console.error(err)

      if (streamableStatus==true) { // url is streamable, so we can download it
        const myURL = new URL(solvedURL)
        var streamURL=myURL.protocol+"//"+myURL.hostname+myURL.pathname+"/stream?client_id="+client_id // quick re-process to have the stream url

        getDownloadURL(streamURL,function(err,mp3URL){ // trying to download the track
          if (err) console.error(err)
          downloadTrack(mp3URL,dest,function(err,result){
            if (err) console.errror(err)
            callback(null,dest) // Track downloaded.
          })
        })

      }

      if (streamableStatus==false) {  // ALERT this soundcloud link does not work anymore and it needs to be fixed.
        callback('error, SC link not working (maybe not streamable)')
      }

    })
  })
}

// Solve the URL. Return something like: https://api.soundcloud.com/tracks/206722679?client_id=xxxx
function SCResolve(url,client_id,callback){
  https.get('https://api.soundcloud.com/resolve?url='+url+'&client_id='+client_id, function(res){
    res.setEncoding('utf8');

    res.on('data',(d)=>{
      JSON.parse(d,function(key,value){
        if (key=='location') callback(null,value)
      })
    })

    .on('error', function(err) { // Handle errors
      callback(err)
    })

    if (res.statusCode==404) callback("Error 404 while tracksying to reach SC for "+url)

  })
}

// Check if streamable. Must use the solved URL.
function isStreamable (url,callback) {
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

// Get the fuckin MP3 url to download it
function getDownloadURL (url,callback) {
  https.get(url, function(res) {
    res.setEncoding('utf8');

    res.on('data', (d) => {
      JSON.parse(d,function(key,value){
        if (key=='location'){
          callback(null, value)
        }
      })
    })

    .on('error', function(err) { // Handle errors
      callback(err)
    })

  })
}

// télécharge le mp3 en local
function downloadTrack (url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = https.get(url, function(res) {
    res.pipe(file);
    file.on('finish', function() {
      file.close(cb);  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};
