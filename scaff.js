var visibilities = ['private', 'protected', 'public'];
var defaultVisibility = visibilities[0];

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function Property(propertyString){
	var pieces = propertyString.split(':');
	if(pieces.length == 3){
		this.visibility = pieces[0];
		this.type = pieces[1];
		this.name = pieces[2];
	}else if(pieces.length == 2){
		this.visibility = defaultVisibility;
		this.type = pieces[0];
		this.name = pieces[1];
	}
}

Property.prototype.propertyLine = function() {
	return this.visibility + ' ' + this.type + ' ' + this.name + ';';
};

Property.prototype.getter = function() {
	return 'public void get' + this.name.capitalizeFirstLetter() + '(){ return this.' + this.name + ';}';
};

Property.prototype.setter = function() {
	return 'public void set' + this.name.capitalizeFirstLetter() + '(' + type + ' ' + this.name + '){ this.' + this.name + ' = ' + this.name + ';}';
};function JavaClass(name) {
	this.name = name;
	this.visibility = 'public';
	this.properties = [];
}

JavaClass.prototype.toString = function() {
	return '';
};

JavaClass.prototype.equals = function() {
	return '';
};

JavaClass.prototype.hashCode = function() {
	return '';
};

JavaClass.prototype.propertyList = function() {
	var result = '\t\t// Properties\n';
	for (var i = 0; i < this.properties.length; i++) {
		result += '\t\t' + this.properties[i].propertyLine() + '\n';
	};
	return result;
};

JavaClass.prototype.gettersSetters = function() {
	var result = '\t\t// Getters and Setters\n';
	for (var i = 0; i < this.properties.length; i++) {
		result += '\t\t' + this.properties[i].getter() + '\n';
		result += '\t\t' + this.properties[i].setter() + '\n';
	};
	return result;
};

JavaClass.prototype.print = function() {
	var result = this.visibility + ' class ' + this.name + ' {\n\n' + this.propertyList() + '\n' + this.gettersSetters() + '\n' + this.toString() + '\n' + this.equals() + '\n' + this.hashCode() + '\n' + '}';
};var types = ['oracle'];

function Database(type){
	this.type = type;
}var fs = require('fs');

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

// Proccess arguments

var states = ["database", 'modelName', "properties"]
var stateIndex = 0;
var state = states[stateIndex];
stateIndex++;
var database, javaClass;
process.argv.forEach(function (val, index, array) {
	console.log("here")
	switch (state) {
		case 'database':
		database = val;
		state = states[stateIndex];
		stateIndex++;
		break;

		case "modelName":
		javaClass = JavaClass(val);
		state = states[stateIndex];
		stateIndex++;
		break;

		case 'properties':
		var property = Property(val);
		javaClass.properties.push(property);
		break;
	}
});

fs.writeFile("/output/test", javaClass.print(), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
}); 