function ask(question, formatRegex, callback, dontPutWhitespace) {
 var stdin = process.stdin, stdout = process.stdout;
 
 stdin.resume();
 if(dontPutWhitespace)
 	stdout.write(question + ": ");
 else
 	stdout.write('\n\n\n' + question + ": ");
 
 stdin.once('data', function(data) {
   data = data.toString().trim();
 	
 	if(!formatRegex){
 		callback(data);
 	}else if (formatRegex.test(data)) {
     callback(data);
   } else {
     stdout.write("It should match: "+ formatRegex +"\n");
     ask(question, formatRegex, callback);
   }
 });
}

module.exports = ask;