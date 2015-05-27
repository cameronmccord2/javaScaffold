var ask = require("../utilities/ask.js");
var ModelClass = require("../models/modelClass.js");
var Property = require("../models/properties.js");

var yesNoRegex = /yes|no|y|n|Y|N|Yes|No|YES|NO|nO|YEs|YeS|yeS/;
var yesRegex = /yes|y|Y|Yes|YES|YEs|YeS|yeS/;
function isYes(data){
	return yesRegex.test(data);
}

var numbersOrBackRegex = /back|Back|BAck|BACk|BACK|bACK|baCK|bacK|BaCk|bAcK|bACk|BacK|([0-9])/
var numbersRegex = /([0-9])/

var server;
var backRegex = /back|Back|BAck|BACk|BACK|bACK|baCK|bacK|BaCk|bAcK|bACk|BacK/

function showSetDatabaseTableName(modelName, callback) {

	ask("What is the name of the database table for this model?", /[A-Z]([a-z])/, function(tableName){
		if(backRegex.test(tableName)){
			callback();
		}else if(tableName.length == 0){
			console.log("Cannot have a table name of no length. Specify a real class name or type 'Back' to go back.");
			showSetDatabaseTableName(modelName, callback);
		}else{
			var model = new ModelClass(modelName, defaultPackage + "/models", tableName);
			callback();
		}
	});
}

function showCreateAModel(callback){

	ask("What is the name of the model?", /[A-Z]([a-z])/, function(modelName){
		if(backRegex.test(modelName)){
			callback();
		}else if(modelName.length == 0){
			console.log("Cannot have a model name of no length. Specify a real class name or type 'Back' to go back.");
			showCreateAModel(callback);
		}else{
			showSetDatabaseTableName(modelName, callback);
		}
	});
}

function showChooseAnExistingModel(callback) {
	var message = "Select one of the " + server.models.length + " models below:\n";
	message += generateModelList()
	message += "Back: Go back to previous menu";

	ask(message, numbersOrBackRegex, function(data){
		if(backRegex.test(data)){
			callback()
		}else if(/([0-9])/.test(data)){
			var number = parseInt(data);
			if(number < server.models.length){
				// inputed a valid number
				callback(server.models[number]);
			}else{
				showChooseAnExistingModel(callback);
			}
		}
	})
}

function showDeleteAnExistingModel(callback) {
	showChooseAnExistingModel(function(model){
		if(model != null){
			// chose a model
			ask("Are you sure you want to delete the " + model.name + " model?(yes/no)", yesNoRegex, function(data){
				if(isYes(data)){
					server.models.splice(server.models.indexOf(model), 1);
				}
				callback();
			});
		}else{
			callback()
		}
	})
}

function generatePropertyList(model){
	var message = '';
	for (var i = 0; i < model.properties.length; i++) {
		message += i + ': ' + model.properties[i].name + '\n';
	};
	return message;
}

function invalidNumberInput(minimum, maximum, backText) {
	console.log('Invalid option. You must enter "' + backText + '" or a number from ' + minimum + ' to ' + maximum + '.');
}

function invalidInput(errorMessage, backText) {
	console.log(errorMessage + ". You can type '" + backText + "' to go back.");
}

function showModifyAnExistingModel(callback, model) {

	function showAddProperties(callback){
		ask('Add properties by specifying them in the format <visibility>:<type>:<name> or <type>:<name>. private visibility is the default if you dont specify. Type "Back" to go back.', /((private|protected|public):[a-zA-Z0-9]+:[a-zA-Z0-9]+)|([a-zA-Z0-9]+:[a-zA-Z0-9]+)|(back|Back|BAck|BACk|BACK|bACK|baCK|bacK|BaCk|bAcK|bACk|BacK)/, function(data){
			if(backRegex.test(data)){
				callback();
			}else{
				var property = new Property(data, model.name);
				model.properties.push(property);
				showAddProperties(callback);
			}
		});
	}

	function showRemoveProperties(callback) {
		ask('Property list:\n' + generatePropertyList(model) + '\nSelect a property to remove or type "Back"', numbersOrBackRegex, function(data){
			if(backRegex.test(data))
				callback();
			else if(parseInt(data) < model.properties.length){

				model.properties.splice(parseInt(data), 1);

				if(model.properties.length == 0)
					callback();
				else
				showRemoveProperties(callback);
			}else{
				console.log('\nYou typed an invalid option. Choose again.');
				showRemoveProperties(callback);
			}
		});
	}

	function showToggleRequiredParameters(callback) {
		var message = 'Toggle required:\n';
		for (var i = 0; i < model.properties.length; i++) {
			var property = model.properties[i];
			message += i + ". " + property.name;
			if(property.required)
				message += " : Required"
			message += "\n";
		};
		message += "\nEnter the property's number to toggle it's required flag or 'Back' to go back";
		ask(message, numbersOrBackRegex, function(data){
			if(backRegex.test(data)){
				callback();
			}else{
				if(parseInt(data) < model.properties.length){
					model.properties[parseInt(data)].required = !model.properties[parseInt(data)].required;
				}else{
					invalidNumberInput(0, model.properties.length-1, "Back");
				}
				showToggleRequiredParameters(callback);
			}
		});
	}

	function showAddAValidValue(callback, property) {
		var message = "Add valid values to the property: " + property.type + " " + property.name;
		ask(message, undefined, function(data){
			if(data.length > 0){
				if(backRegex.test(data)){
					callback();
				}else{
					property.addValidValue(data);
				}
			}else{
				invalidInput("You must input a value", "Back");
			}
		});
	}

	function showRemoveAValidValue(callback, property) {
		//TODO
	}

	function showSelectAProperty(callback, whyMessage) {
		ask('Property list:\n' + generatePropertyList(model) + '\n' + whyMessage + ' or type "Back"', numbersOrBackRegex, function(data){
			if(backRegex.test(data))
				callback();
			else if(parseInt(data) < model.properties.length){
				var property = model.properties[parseInt(data)];
				callback(property);
			}else{
				invalidNumberInput(0, model.properties.length-1, "Back");
				showSelectAProperty(callback);
			}
		});
	}

	function showModifyValidValues(property, callback) {
		var options = [
			{text:'Add valid values', whatToDo:function(callback){
				showAddAValidValue(function(){
					showModifyValidValues(property, callback);
				}, property);
			}},
			{text:'Remove valid values', whatToDo:function(callback){
				showRemoveAValidValue(function(){
					showModifyValidValues(property, callback);
				}, property);
			}},
			{text:'Back. Finish and go back', func:callback, dontShowNumber:true}
		];

		var message = "";
		for (var i = 0; i < options.length; i++) {
			if(options[i].dontShowNumber)
				message += i + ". ";
			message += options[i].name + "\n";
		};
		message += "Select an option to modify the valid values for the property: " + property.name + " or enter 'Back' to go back\n";

		ask(message, numbersOrBackRegex, function(data){
			if(backRegex.test(data))
				callback();
			else{

			}
		});
	}

	function showChangeDatabaseTableName(callback) {

		ask("What is the name of the database table for this model?", /[A-Z]([a-z])/, function(tableName){
			if(backRegex.test(tableName)){
				callback();
			}else if(tableName.length == 0){
				console.log("Cannot have a table name of no length. Specify a real class name or type 'Back' to go back.");
				showChangeDatabaseTableName(callback);
			}else{
				model.tableName = tableName;
				callback();
			}
		});
	}

	function modifyModelOptions(callback){
		//TODO: add showChangeDatabaseTableName to this list as option 2, bump all other options down. Change the removals to be a property on the options.
		var options = [
			{text:'List properties', removeIfNoProperties:false, whatToDo:function(callback){
				console.log(model.propertyList());
				modifyModelOptions(callback);// callback is menu()
			}},
			{text:'Add properties', removeIfNoProperties:false, whatToDo:function(callback){
				// callback is menu()
				showAddProperties(function(){
					modifyModelOptions(callback);
				});
			}},
			{text:'Remove properties', removeIfNoProperties:true, whatToDo:function(callback){
				// callback is menu()
				showRemoveProperties(function(){
					modifyModelOptions(callback);
				});
			}},
			{text:'Toggle required parameters', removeIfNoProperties:true, whatToDo:function(callback){
				showToggleRequiredParameters(function(){
					modifyModelOptions(callback);
				});
			}},
			{text:'Change database table name, currently: ' + this.tableName, whatToDo:function(callback){
				showChangeDatabaseTableName(function(){
					modifyModelOptions(callback);
				});
			}},
			{text:'Modify valid values for a specific property', removeIfNoProperties:true, isModifyValidValues:true, whatToDo:function(callback){
				showSelectAProperty(function(property){
					if(property){
						if(property.isValidValuesAble()){
							showModifyValidValues(property, function(){
								modifyModelOptions(callback);
							});
						}else{
							invalidInput("That property's type of " + property.type + " is not supported by ValidValues validations", "Back");
							modifyModelOptions(callback);
						}
					}else{
						// No property chosen
						modifyModelOptions(callback);
					}
				}, "Select a property to modify its valid values");
			}},
			{text:'Back. Finish and go back', func:callback, dontShowNumber:true}
		];

		if(model.properties.length == 0){
			for (var i = options.length - 1; i >= 0; i--) {
				if(options[i].removeIfNoProperties)
					options[i].splice(i, 1);
			};
		}else{
			// See if there is at least 1 property who supports valid values
			for (var i = 0; i < model.properties.length; i++) {
				var property = model.properties[i];
				if(property.isValidValuesAble()){
					for (var i = options.length - 1; i >= 0; i--) {
						if(options[i].isModifyValidValues){
							options[i].splice(i,1);
							break;
						}
					};
					break;
				}
			};
		}

		var message = "Modify a Model Menu: " + model.properties.length + " properties in " + model.name + " model\n";
		for (var i = 0; i < options.length; i++) {
			if(!options[i].dontShowNumber)
				message += i + '. ';
			message += options[i].text + "\n";
		};
		message += "\nType an above option";

		ask(message, numbersOrBackRegex, function(data){
			if(numbersRegex.test(data)){
				if(parseInt(data) < options.length)
					options[parseInt(data)].whatToDo(callback);
				else{
					invalidNumberInput(0, options.length-1, "Back");
					modifyModelOptions(callback);
				}
			}else if(backRegex.test(data)){
				callback();
			}else{
				console.log("Shouldn't get here");
			}
		});
	}

	if(model){
		modifyModelOptions(callback)
	}else{
		// need them to choose a model to modify

		ask("Model list:\n" + generateModelList() + '\n\nWhich model do you want to modify?', numbersOrBackRegex, function(data){
			if(numbersRegex.test(data)){
				model = server.models[parseInt(data)];
				modifyModelOptions(callback);

			}else if(backRegex.test(data)){
				callback();
			}else{
				console.log("Shouldn't get here");
			}
		})
	}
}

function generateModelList(){
	if(server.models.length == 0){
		return "No Models";
	}
	var message = "";
	for (var i = 0; i < server.models.length; i++) {
		var model = server.models[i];
		message += i + ": " + model.name;
	};
	return message
}

function showModelList(callback){
	console.log(generateModelList());
	callback();
}

function menu(callback, serverToWorkWith) {
	server = serverToWorkWith;

	server.models.push(new ModelClass("Asdf", "com/me/us"));

	var options = [
		{text:'Create a new model', func:showCreateAModel},
		{text:'Modify an existing model', func:showModifyAnExistingModel},
		{text:'List existing models', func:showModelList},
		{text:'Delete an existing model', func:showDeleteAnExistingModel},
		{text:'Back. Finish and go back', func:callback, dontShowNumber:true},
	];

	var message = "Model Menu\n";
	for (var i = 0; i < options.length; i++) {
		if(!options[i].dontShowNumber)
			message += i + '. ';
		message += options[i].text + "\n";
	};
	message += "\nType an above option";

	ask(message, numbersOrBackRegex, function(data){
		if(numbersRegex.test(data)){
			options[parseInt(data)].func(function(){
				menu(callback, server);
			});
		}else if(backRegex.test(data)){
			callback();
		}else{
			console.log("Shouldn't get here");
		}
	});
}

module.exports.menu = menu;