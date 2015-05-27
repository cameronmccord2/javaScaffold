
String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function Enum(name, type){
	this.name = name;
	this.type = type;
	this.validValues = [];
}

Enum.prototype.isTypeString = function() {
	return (this.type === 'String');
};

Enum.prototype.toString = function() {
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
			if(this.isTypeString())
				message += this.toStringStringEnum(value);
			else
				message += this.toStringValueEnum(value);
		};
		message += '\t\t}\n\t\tthrow new IllegalArgumentException("Invalid input: " + input + " for enum: ' + this.name + '");\n\t}\n}\n\n';
		message += this.toStringDeserializer();
		return message;
	}
	return "";
};

Enum.prototype.jacksonDeserializerAnnotation = function() {
	if(this.validValues.length > 0)
		return "@JsonDeserialize(using = " + this.name.capitalizeFirstLetter() + "Deserializer.class)\n";
	return undefined;
};

Enum.prototype.toStringDeserializer = function() {
	if(this.validValues.length > 0){
		return "public class " + this.name.capitalizeFirstLetter() + "Deserializer extends JsonDeserializer<" + this.name.capitalizeFirstLetter() + "> {\n\t@Override\n\tpublic " + this.name.capitalizeFirstLetter() + " deserialize(final JsonParser parser, final DeserializationContext context) throws IOException {\n\t\treturn " + this.name.capitalizeFirstLetter() + ".from" + this.type.capitalizeFirstLetter() + "(parser.getValueAs" + this.type.capitalizeFirstLetter() + "());\n\t}\n}\n");
	}
	return "";
};

Enum.prototype.toStringStringEnum = function(value) {
	return '\t\tcase "' + value + '": return ' + value.toUpperCase() + ';\n';
};

Enum.prototype.toStringValueEnum = function() {
	return '\t\tcase ' + value + ': return ' + value.toUpperCase() + ';\n';
};

module.exports = Enum;