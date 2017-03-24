// boBot - A bot to fix and backup MailTape episodes.
// Version: 1.0
// Author: ImaCrea
// Wanna improve it, feel free to fork it!

const episodeProcessor = require('./my_modules/episodeProcessor.js')
const fs = require('fs')

var errCount=0


fs.readdir('./posts', function(err,posts){

	if (err) return console.error(err)

	syncLoop(posts.length, function(loop){  
	    setTimeout(function(){
	        var i = loop.iteration();
	        var MDfile = './posts/'+posts[i]
        	episodeProcessor(MDfile,function(err,result){
				if (err) {
					console.error(err)
					errCount+=err
				}
				console.log(result)
				loop.next();
			})
	    }, 1000);

	}, function(){
	    if (errCount==0) console.log("All post done with 100% success!")
        if (errCount!=0) console.log("/!\ you have "+errCount+" error(s) to fix. Must check")
	})

})

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
            if(index < iterations){
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
