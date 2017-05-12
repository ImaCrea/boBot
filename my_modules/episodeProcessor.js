const trackProcessor = require('./trackProcessor.js')
const MDReader = require('./MDReader.js')
const fs = require('fs')
const path = require('path')

// var trackNumber=7
// trackProcessor(MDfile,trackNumber, function(err, result){
// if (err) console.error(err)
// console.log(result)
// })

// var MDfile="./posts/2014-03-30-Catching-Flies.md"
// episodeProcessor(MDfile,function(err,result){
// 	if (err) return console.error(err)
// 	console.log(result)
// })

module.exports = episodeProcessor

function episodeProcessor(MDfile,callback) {
    var errCount=0
	syncLoop(7, function(loop){  
        var i = loop.iteration();
        trackProcessor(MDfile,i, function(err, result){
            if (err) {
                console.error(err)
                errCount++
            }
	        console.log(result)
	    	loop.next();
		})

	}, function(){
		MDReader(MDfile,'episode_URL', function(err, episode_URL) {
			if (err) return callback(err)
		    if (errCount==0) {
                fs.renameSync(MDfile, "./done/"+path.basename(MDfile))
                callback(null,MDfile+" : done and ready to be commited on Github.\n")
            }
            if (errCount!=0) callback(errCount,MDfile+" : /!\ there was "+errCount+" error(s) on this episode. Must check\n")
		})
	})
}


function syncLoop(iterations, process, exit){  
    var index = 1,
        done = false,
        shouldExit = false;
    var loop = {
        next:function(){
            if(done){
                if(shouldExit && exit){
                    return exit(); // Exit if we're done
                }
            }
            // If we're not finished
            if(index <= iterations){
                index++; // Increment our index
                process(loop); // Run our process, pass in the loop
            // Otherwise we're done
            } else {
                done = true; // Make sure we say we're done
                if(exit) exit(); // Call the callback on exit
            }
        },
        iteration:function(){
            return index - 1; // Return the loop number we're on
        },
        break:function(end){
            done = true; // End the loop
            shouldExit = end; // Passing end as true means we still call the exit callback
        }
    };
    loop.next();
    return loop;
}
