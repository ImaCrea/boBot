// MDUpdater : will update the value of a specified key in the MD file

const lineReader = require('line-reader')
const YAML = require('yamljs')
const fs= require('fs')
var replaceStream = require('replacestream')



// call architecture
// var file="../2017-03-05-Max-Future.md"
// var oldValue="'https://soundcloud.com/from-go-to-whoa-blog/tame-impala-prototype-outkast'"
// var newValue="'http://kiki'"

// MDUpdater(file,oldValue,newValue,function(err){
// 	if (err) return console.error("There was an error with: "+err)
// 	console.log("wow it's done baby")
// })


function MDUpdater(file, oldValue, newValue,callback) {

	var file2=file+"b"

	const readable = fs.createReadStream(file).pipe(replaceStream(oldValue, newValue))
	const writable = fs.createWriteStream(file2)

	readable.pipe(writable)

	fs.unlink(file,function(err){
		if (err) callback(err)
		fs.rename(file2,file,function(err){
			if (err) callback(err)
			callback(null,true)
		})	
	})

}

module.exports = MDUpdater

// pour note si besoin, ancienne façon d'appeler les adresses des fichiers
// var path = require('path')
// const readable = fs.createReadStream(path.join(__dirname, file)).pipe(replaceStream(oldValue, newValue))
