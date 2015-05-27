var ControllerClass = require('../models/controllerClass.js');
var LogicDaoClass = require('../models/logicDaoClass.js');
var SqlDaoClass = require('../models/sqlDaoClass.js');

var fs = require('fs');

function generate(server) {

	function generateResultSetParser(package, callback) {
		var filePath = '../staticFiles/ResultSetParser.java';
		fs.readFile(filePath, 'utf8', function (err, string) {
			if (err) {
				console.log("Unable to open the file: " + filePath + ", error: " + err);
				callback();
			}else{
				//TODO: This may need to add a sub package, maybe return the correct path to save it to
				callback('package ' + package + ';\n' + string);
			}
		});
	}

	function generateFilesForModel(model, callback) {
		var sqlDao = SqlDaoClass(model);
		var logicDao = LogicDaoClass(model, sqlDao);
		var controller = ControllerClass(model, logicDao);
	}
}

module.exports.generate = generate;