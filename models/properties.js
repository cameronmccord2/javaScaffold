var Enum = require('./enum.js');

var visibilities = ['private', 'protected', 'public'];
var defaultVisibility = visibilities[0];

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.uncapitalizeFirstLetter = function() {
    return this.charAt(0).toLowerCase() + this.slice(1);
}

function Property(propertyString, modelName){
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
	this.required = false;
	// The enum name is modelName + propertyName
	this.enum = Enum(modelName + this.name.capitalizeFirstLetter(), this.type);
	this.validValues = this.enum.validValues;
}

Property.prototype.propertyLine = function() {
	var message = "";
	switch(this.visibility){
		case 'private':
			message = 'private   ' + this.type + ' ' + this.name + ';';
		case 'protected':
			message = 'protected ' + this.type + ' ' + this.name + ';';
		case 'public':
			message = 'public    ' + this.type + ' ' + this.name + ';';
	}
	var deserializerLine = this.enum.jacksonDeserializerAnnotation();
	if(deserializerLine)
		message += "\n" + deserializerLine
	return message;
};

Property.prototype.getter = function() {
	return 'public void ' + this.getterName() + '(){ return this.' + this.name + ';}';
};

Property.prototype.setter = function() {
	return 'public void ' + this.setterName() + '(' + this.type + ' ' + this.name + '){ this.' + this.name + ' = ' + this.name + ';}';
};

Property.prototype.getterName = function() {
	return 'get' + this.name.capitalizeFirstLetter();
};

Property.prototype.setterName = function() {
	return 'set' + this.name.capitalizeFirstLetter();
};

Property.prototype.toStringFragment = function(isFirst, isLast) {
	var result;
	if(isFirst)
		result =  "sb.append(\"this." + this.name + "='\").append(" + this.name + ")";
	else
		result =  "sb.append(\", this." + this.name + "='\").append(" + this.name + ")";
	if(!isLast)
		result += ".append(\"'\")";
	return result + ";";
};

Property.prototype.equalsFragment = function(otherName) {
	return "if (" + this.name + " != null ? !" + this.name + ".equals(" + otherName + "." + this.name + ") : " + otherName + "." + this.name + " != null) return false;";
};

Property.prototype.hashCodeFragment = function() {
	return this.name + " != null ? " + this.name + ".hashCode() : 0";
};

Property.prototype.importString = function() {
	switch (this.type){
		case "Timestamp":
		return 'import java.sql.Timestamp;';
	}
	if(this.type.indexOf('List<') != -1)
		return 'import java.util.List;';
	if(this.type.indexOf('Set<') != -1)
		return 'import java.util.Set;';
	if(this.type.indexOf('Map<') != -1)
		return 'import java.util.Map;';
	if(this.type.indexOf('Collection<') != -1)
		return 'import java.util.Collection;';
};

Property.prototype.getEnum = function() {
	// This assumes enums can only be of type string for now
	if(this.validValues.length > 0){
		var message = "public enum " + this.name + " {\n";
		for (var i = 0; i < this.validValues.length; i++) {
			var value = this.validValues[i];
			message += '\t' + value.toUpperCase();
			if(i == this.validValues.length-1)
				message += ';\n';
			else
				message += ',\n';
		};
		message += 'public static from' + this.type.capitalizeFirstLetter() + '(final ' + this.type + ' input) {\n\t\tswitch(input) {\n';
		for (var i = 0; i < this.validValues.length; i++) {
			var value = this.validValues[i];
			message += '\t\tcase "' + value + '": return ' + value.toUpperCase() + ';\n';
		};
		message += '\t\t}\n\t\tthrow new IllegalArgumentException("Invalid input: " + input + " for enum: ' + this.name + '");\n\t}\n}\n'
		return message;
	}
	return undefined;
};

Property.prototype.parseResultSetString = function() {
	var resultSetGet;
	switch(this.type){
		case "String":
			resultSetGet = "String"; break;
		case "Float":
			resultSetGet = "Float"; break;
		case "Double":
			resultSetGet = "Double"; break;
		case "double":
			resultSetGet = "Double"; break;
		case "Integer":
		case "int":
			resultSetGet = "Int"; break;
		case "long":
		case "Long":
			resultSetGet = "Long"; break;
		case "bool":
		case "Boolean":
			resultSetGet = "Boolean"; break;
		case "Date":
			resultSetGet = "Date"; break;
		case "Timestamp":
			resultSetGet = "Timestamp"; break;
		default:
			console.error(this.type + " is not supported to be parsed from the result set"); break;
	}

	switch(this.type){
		case "Timestamp":
		case "Date":
			var message = '\t\t//We use the calendar object here to ensure that time stamps are returned in utc format\n\t\tCalendar timezoneCal' + this.name.capitalizeFirstLetter() + ' = Calendar.getInstance(TimeZone.getTimeZone("UTC"));\n\t\t'
			return 'this.set' + this.name.capitalizeFirstLetter() + '(resultSet.get' + resultSetGet + '(prefix + "' + (this.databaseName || this.name.uncapitalizeFirstLetter()) + '", timezoneCal' + this.name.capitalizeFirstLetter() + '));';
		default:
			return '\t\tthis.set' + this.name.capitalizeFirstLetter() + '(resultSet.get' + resultSetGet + '(prefix + "' + (this.databaseName || this.name.uncapitalizeFirstLetter()) + '"));';
	}
};

Property.prototype.valueFromString = function(value) {
	switch(this.type){
		case "String":
			return value;
		case "Float":
		case "Double":
		case "double":
		case "long":
		case "Long":
			return parseFloat(value);
		case "Integer":
		case "int":
			return parseInt(value);
		case "bool":
		case "Boolean":
			// Unverified
			return (value == 1 || value == '1' || value == 'true');
		default:
			console.error(this.type + " is not supported for valueFromString"); break;
	}
};

Property.prototype.isValidValuesAble = function(value) {
	switch(this.type){
		case "String":
		case "Float":
		case "Double":
		case "double":
		case "Integer":
		case "int":
		case "long":
		case "Long":
			return true;
	}
	return false;
};

Property.prototype.isTypeString = function() {
	return (this.type === 'String');
};

Property.prototype.addValidValue = function(newValue) {
	var value
	if(this.validValues.indexOf(value) == -1){
		this.validValues.push(value);
	}
};

Property.prototype.removeValidValue = function(oldValue) {
	var value
	var index = this.validValues.indexOf(value)
	if(index != -1){
		this.validValues.splice(index, 1);
	}
};

module.exports = Property;