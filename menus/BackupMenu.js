var ask = require("../utilities/ask.js");
var fs = require('fs');
var mkdirp = require('mkdirp');

var backRegex = /back|Back|BAck|BACk|BACK|bACK|baCK|bacK|BaCk|bAcK|bACk|BacK/
var numbersOrBackRegex = /back|Back|BAck|BACk|BACK|bACK|baCK|bacK|BaCk|bAcK|bACk|BacK|([0-9])/
var numbersRegex = /([0-9])/

var extension = 'javaGenBackup';
var backupsPath = '../backups';

module.exports.saveMenu = function(callback, server){
	var stringOfServer = JSON.stringify(server);

	ask('What do you want to call this backup? Files may be overwriten. Extension will be added automatically. Type "Back" to go back.', /([a-zA-Z].+)|back|Back|BAck|BACk|BACK|bACK|baCK|bacK|BaCk|bAcK|bACk|BacK/, function(data){
		if(backRegex.test(data)){
			callback();
		}else{
			mkdirp(backupsPath, function (err) {
		    	if (err) console.error(err)
			    else{
			    	fs.writeFile(backupsPath + '/' + data + '.' + extension, stringOfServer, function(err) {
					    if(err) {
					        return console.log(err);
					    }

					    console.log('Backup saved to ' + filename);
						callback();
					}); 
			    }
			});
		}
	})
}


module.exports.restoreMenu = function(callback){
	fs.readdir(backupsPath, function(err, files){
		if(err){
			console.log('There was an error reading the directory: ' + backupsPath + '. It may not exist. Error: ' + err);
			callback();
		}else{
			var message = 'Files list:\n';
			for (var i = 0; i < files.length; i++) {
				message += i + '. ' + files[i] + '\n';
			};
			message += '\nWhich backup do you want to load. The file is not deleted afterward. Type "Back" to go back';

			ask(message, numbersOrBackRegex, function(data){
				if(backRegex.text(data))
					callback();
				else{
					fs.readFile('/doesnt/exist', 'utf8', function (err,data) {
						if (err) {
							console.log("Unable to open that file: " + err);
							callback();
						}else{
							var server = JSON.parse(data);
							callback(server);
						}
					});
				}
			});
		}
	});
}