// MDReader... lol Will parse post MD and return a JSON with all tracks information.

const lineReader = require('line-reader')
const YAML = require('yamljs');

// read line by line the config part of an Jekyll post file in MD
function MDReader(path,key,callback) {

	var separatorCounter = 0

	lineReader.eachLine(path, function(line, last) {

	  if (line==="---") separatorCounter++

	  const re = new RegExp(key)
	  if (re.test(line)) {
	  	callback(null,MDValue(line,key))
	  }

	  if (separatorCounter===2) {
	    return false
	  }
	  
	})
}

// extract the value of a key.
function MDValue (query,key) {
	jsonObject = JSON.parse(JSON.stringify(YAML.parse(query)))
	return jsonObject[key]
}

module.exports = MDReader

// Call structure. With Path=path to MD file. Key=reference of the value to look for (eg: track3_link)

// var path="../2011-07-31-Modonut.md"
// var key="track3_link"

// MDReader(path,key,function(err,result){
// 	if (err) console.error("There was an error:"+err)

// 	else {
// 		console.log(result)
// 	}

// })