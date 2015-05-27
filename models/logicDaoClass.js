
function LogicDao(model, sqlDao) {
	this.model = model;
	this.sqlDao = sqlDao;
}

LogicDao.prototype.print = function() {
	// body...
};

module.exports = LogicDao;