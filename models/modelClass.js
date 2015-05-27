String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.uncapitalizeFirstLetter = function() {
    return this.charAt(0).toLowerCase() + this.slice(1);
}

function ModelClass(name, package, tableName) {
	this.package = package.replace(/\//g, '.');;
	this.name = name.capitalizeFirstLetter();
	this.visibility = 'public';
	this.properties = [];
	this.imports = [];
	this.usingJackson = true;
	this.tableName = tableName;
}

ModelClass.prototype.hasRequiredProperties = function() {
	for (var i = this.properties.length - 1; i >= 0; i--) {
		if(this.properties[i].required)
			return true;
	};
	return false;
};

ModelClass.prototype.toString = function() {
	var result = '\t@Override\n\tpublic String toString() {\n\t\tfinal StringBuilder sb = new StringBuilder("' + this.name + '{");\n';
	for (var i = 0; i < this.properties.length; i++) {
		result += '\t\t' + this.properties[i].toStringFragment(i == 0, i == this.properties.length - 1) + '\n';
	};
	result += '\t\tsb.append(\'}\');\n\t\treturn sb.toString();\n\t}'
	return result;
};

ModelClass.prototype.equals = function() {
	var result = 
		"\t@Override\n\tpublic boolean equals(Object o) {\n\t\tif (this == o) return true;\n\t\tif (o == null || getClass() != o.getClass()) return false;\n\n\t\t" + this.name + " " + this.name.uncapitalizeFirstLetter() + " = (" + this.name + ") o;\n\n";

	for (var i = 0; i < this.properties.length; i++) {
		result += '\t\t' + this.properties[i].equalsFragment(this.name.uncapitalizeFirstLetter()) + '\n';
	};
	result += "\n\t\treturn true;\n\t}";
	return result;
};

ModelClass.prototype.hashCode = function() {
	var result = "\t@Override\n\tpublic int hashCode() {\n";
	for (var i = 0; i < this.properties.length; i++) {
		result += "\t\t";
		if(i == 0)
			result += "int result = ";
		else
			result += "result = 31 * result + (";
		result += this.properties[i].hashCodeFragment();
		if(i != 0)
			result += ')';
		result += ';\n';
	};
	result += "\t\treturn result;\n\t}";
	return result;
};

ModelClass.prototype.propertyList = function() {
	var result = '\t// Properties\n';
	for (var i = 0; i < this.properties.length; i++) {
		result += '\t' + this.properties[i].propertyLine() + '\n';
	};
	return result;
};

ModelClass.prototype.gettersSetters = function() {
	var result = '\t// Getters and Setters\n';
	for (var i = 0; i < this.properties.length; i++) {
		result += '\t' + this.properties[i].getter() + '\n';
		result += '\t' + this.properties[i].setter() + '\n';
		result += '\n';
	};
	return result;
};

ModelClass.prototype.emptyConstructor = function() {
	return '\t//This constructor is NOT meant to be called from a subclass.\tpublic ' + this.name + '() {\n\t\tsuper(' + this.name + '.class);\n\t}\n';
};

ModelClass.prototype.emptySubclassConstructor = function() {
	return '\t//This constructor is meant to be called from a subclass.\tpublic ' + this.name + '(Class c) {\n\t\tsuper(c);\n\t}\n';
};

ModelClass.prototype.requiredFieldsConstructor = function() {
	var message = '\t// This constructor takes all the required fields this model has. This is NOT meant to be called from a subclass.\n\tpublic ' + this.name + '(';
	var functionCallFieldsText = '';
	var setFieldsText = '';
	
	for (var i = 0; i < this.properties.length; i++) {
		var property = this.properties[i];
		if(property.required){
			// list all fields in function call
			functionCallFieldsText += '\t\t' + property.type + ' ' + property.name;
			if(i != this.properties.length - 1)
				functionCallFieldsText += ', ';

			// set all fields
			setFieldsText += '\t\tthis.' + property.name + ' = ' + property.name + ';\n';
		}
	};
	message += functionCallFieldsText + '){\n\t\tsuper(' + this.name + '.class);\n' + setFieldsText + '\t}\n';
	return message;
};

ModelClass.prototype.requiredFieldsSubclassConstructor = function() {
	var message = '\t// This constructor takes all the required fields this model has. This is meant to be called from a subclass.\n\tpublic ' + this.name + '(';
	var functionCallFieldsText = 'Class c';
	if(this.hasRequiredProperties())
		functionCallFieldsText += ', ';
	var setFieldsText = '';
	
	for (var i = 0; i < this.properties.length; i++) {
		var property = this.properties[i];
		if(property.required){
			// list all fields in function call
			functionCallFieldsText += '\t\t' + property.type + ' ' + property.name;
			if(i != this.properties.length - 1)
				functionCallFieldsText += ', ';

			// set all fields
			setFieldsText += '\t\tthis.' + property.name + ' = ' + property.name + ';\n';
		}
	};
	message += functionCallFieldsText + '){\n\t\tsuper(c);\n' + setFieldsText + '\t}\n';
	return message;
};

ModelClass.prototype.allFieldsSubclassConstructor = function() {
	var message = '\t// This constructor takes all the fields this model has. This is meant to be called from a subclass.\n\tpublic ' + this.name + '(';
	var functionCallFieldsText = 'Class c';
	if(this.properties.length)
		functionCallFieldsText += ', ';
	var setFieldsText = '';
	
	for (var i = 0; i < this.properties.length; i++) {
		var property = this.properties[i];
		// list all fields in function call
		functionCallFieldsText += '\t\t' + property.type + ' ' + property.name;
		if(i != this.properties.length - 1)
			functionCallFieldsText += ', ';

		// set all fields
		setFieldsText += '\t\tthis.' + property.name + ' = ' + property.name + ';\n';
	};
	message += functionCallFieldsText + '){\n\t\tsuper(c);\n' + setFieldsText + '\t}\n';
	return message;
};

ModelClass.prototype.allFieldsConstructor = function() {
	var message = '\t// This constructor takes all the fields this model has. This is NOT meant to be called from a subclass.\n\tpublic ' + this.name + '(';
	var functionCallFieldsText = '';
	var setFieldsText = '';
	
	for (var i = 0; i < this.properties.length; i++) {
		var property = this.properties[i];
		// list all fields in function call
		functionCallFieldsText += '\t\t' + property.type + ' ' + property.name;
		if(i != this.properties.length - 1)
			functionCallFieldsText += ', ';

		// set all fields
		setFieldsText += '\t\tthis.' + property.name + ' = ' + property.name + ';\n';
	};
	message += functionCallFieldsText + '){\n' + setFieldsText + '\t}\n';
	return message;
};

ModelClass.prototype.print = function() {
	var result = 'package ' + this.package + ';\n\n';
	// Add imports
	for (var i = 0; i < this.properties.length; i++) {
		var importString = this.properties[i].importString();
		if(importString)
			result += importString + '\n';
	};
	if(this.usingJackson)
		result += "import com.fasterxml.jackson.annotation.JsonInclude;\n";

	// put gap between imports and the enums
	result += '\n';

	// add enums and enum deserializers
	for (var i = 0; i < this.properties.length; i++) {
		result += this.properties[i].enum.toString();
	};

	if(this.usingJackson)
		result += "@JsonInclude(JsonInclude.Include.NON_NULL)\n";
	result += this.visibility + ' class ' + this.name + ' extends ResultSetParser<' + this.name + '> {\n\n' + this.propertyList() + '\n';
	result += this.emptyConstructor() + '\n';
	result += this.emptySubclassConstructor() + '\n';
	result += this.requiredFieldsConstructor() + '\n';
	result += this.requiredFieldsSubclassConstructor() + '\n';
	result += this.allFieldsConstructor() + '\n';
	result += this.allFieldsSubclassConstructor() + '\n';
	result += this.gettersSetters() + '\n';
	result += this.toString() + '\n\n';
	result += this.hashCode() + '\n\n';
	result += this.equals() + '\n' + '}';
	return result;
};

module.exports = ModelClass;