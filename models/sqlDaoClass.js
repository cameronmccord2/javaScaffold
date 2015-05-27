
function SqlDao(model, package) {
	this.model = model;
	this.package = package;
}

SqlDao.prototype.print = function() {

	var message = '';
	message += 'package ' + this.package + ';\n\n';
	// imports
	// constructor
	// getAll
	// getAllSet
	// getById(s)
	// getByValidValuesColumn(s)
	// getByRequiredColumn(s)
	// getByAllColumns
	// insertByRequiredColumns
	// insertByAllColumns
	// updateById
	// updateByRequiredColumns
	// deleteById(s)
	// deleteByValidValuesColumns
	// deleteByAnyColumn(s)
	// validateDatabaseData
	return message;
};


module.exports = SqlDao;