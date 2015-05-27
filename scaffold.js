var Property = require('./models/properties.js');
var ModelClass = require('./models/modelClass.js');
var Database = require('./models/database.js');
var Server = require('./models/server.js');
var ModelMenu = require('./menus/ModelMenu.js');
var Backup = require('./menus/BackupMenu.js');
var Generate = require('./utilities/generate.js');
var ask = require('./utilities/ask.js');
var fs = require('fs');
var mkdirp = require('mkdirp');

// Helper functions

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

var yesNoRegex = /yes|no|y|n|Y|N|Yes|No|YES|NO|nO|YEs|YeS|yeS/;
var yesRegex = /yes|y|Y|Yes|YES|YEs|YeS|yeS/;
function isYes(data){
	return yesRegex.test(data);
}

// Variables

var server;
var currentModel;

// Show functions

function showDefaultPackage(callback){
	ask("What is the default package? This is where the models, daos, and controllers folders will get put. It should be in the format com.companyname.subdomain.", null, function(data){
		ask("The default package is: " + data + "  ?(yes/no)", yesNoRegex, function(data){
			if(isYes(data)){
				server.package = data;
				callback();
			}else
				showDefaultPackage(callback);
		})
	})
}

function showPreviewDAO(callback){
	console.log("create a dao");
	callback();
}

function showPreviewModel(callback){

}

function showPreviewController(callback){

}

function quitProgram(){
	process.exit();
}

function showMainMenu(callback){
	var mainMenuOptions = [
		{text:'0. Show the model menu', func:ModelMenu.menu},
		{text:'1. Preview a Model', func:showPreviewModel},
		{text:'2. Preview a DAO', func:showPreviewDAO},
		{text:'3. Preview a controller', func:showPreviewController},
		{text:'4. Restore from a backup', func:function(restoredServer){
			if(restoredServer != null && restoredServer != undefined){
				server = restoredServer;
				showMainMenu(callback);
			}
		}},
		{text:'5. Save a backup', func:Backup.saveMenu},
		{text:'6. Generate the server code', func:Generate.generate},
		{text:'7'},
		{text:'8'},
		{text:'9. Quit', func:quitProgram}
	];
	var mainMenuText = '';
	for (var i = 0; i < mainMenuOptions.length; i++) {
		mainMenuText += mainMenuOptions[i].text + '\n';
	};
	ask(mainMenuText, /0|1|9/, function(data){
		mainMenuOptions[parseInt(data)].func(showMainMenu);
	})
}

function start(){
	ask("Welcome to the java scaffolder by @cameronmccord2. Is this for an existing project?(yes/no)", yesNoRegex, function(data){
		if(isYes(data)){
			// TODO: Finish this
			showDefaultPackage(showMainMenu);
		}else{
			ask('What do you want to call this server?', null, function(serverName){
				server = new Server(serverName);
				showDefaultPackage(showMainMenu);
			});
		}
	});
}

// ModelMenu.menu(function(){
// 	console.log("dont do anything");
// }, new Server());


start();


// var modelsPath = './src/main/java/' + projectPackage + '/models';

// mkdirp(modelsPath, function (err) {
//     if (err) console.error(err)
//     else{
//     	fs.writeFile(modelsPath + '/' + modelClass.name + '.java', modelClass.print(), function(err) {
// 		    if(err) {
// 		        return console.log(err);
// 		    }

// 		    console.log("The file was saved!");
// 		}); 
//     }
// });
