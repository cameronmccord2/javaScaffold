
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Collection;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.HashSet;

public abstract class ResultSetParser<T extends ResultSetParser> {

    private Class<T> typeOfSubclass;

    /**
     * This must be called from each subclass' constructor. type allows us to use reflection to create your class while parsing result set rows.
     *
     * @param type the type of your subclass
     */
    public ResultSetParser(Class<T> type) {
        this.typeOfSubclass = type;
    }

    /**
     * Parses the result set into an ArrayList without you needing to do resultSet.next(). This will close the result set.
     *
     * @param resultSet the result set
     * @return the List<T>
     * @throws SQLException
     */
    public List<T> parseRows(ResultSet resultSet) throws SQLException {
        List<T> results = new ArrayList<>();
        this.parseRowsToCollection(resultSet, results);
        return results;
    }

    /**
     * Parses the result set into a HashSet without you needing to do resultSet.next(). This will close the result set.
     *
     * @param resultSet the result set
     * @return the Set<T>
     * @throws SQLException
     */
    public Set<T> parseRowsAsSet(ResultSet resultSet) throws SQLException {
        Set<T> results = new HashSet<>();
        this.parseRowsToCollection(resultSet, results);
        return results;
    }

    /**
     * Parses the result set into an ArrayList without you needing to do resultSet.next(). This will close the result set.
     *
     * @param resultSet the result set
     * @return the List<T>
     * @throws SQLException
     */
    public List<T> parseRowsAsList(ResultSet resultSet) throws SQLException {
        List<T> results = new ArrayList<>();
        this.parseRowsToCollection(resultSet, results);
        return results;
    }

    /**
     * Parses the result set into the provided collection without you needing to do resultSet.next(). This will close the result set.
     *
     * @param resultSet the result set
     * @return the Collection<T>
     * @throws SQLException
     */
    public <T extends Collection> T parseRowsToCollection(ResultSet resultSet, T collection) throws SQLException {
        try {
            while (resultSet.next())
                collection.add(this.typeOfSubclass.newInstance().parseRowStepThrough(resultSet));
            resultSet.close();
            return collection;
        } catch (InstantiationException e) {
            throw new RuntimeException("Couldn't instantiate a new instance of class " + this.typeOfSubclass.getName() + " while parsing result set: " + e.getLocalizedMessage());
        } catch (IllegalAccessException e) {
            throw new RuntimeException("Illegal Access Exception: " + e.getLocalizedMessage());
        }
    }

    /**
     * Parses the result set to get the first row without you needing to do resultSet.next(). This will close the result set.
     *
     * @param resultSet the result set
     * @return the t
     * @throws SQLException
     */
    public T parseRow(ResultSet resultSet) throws SQLException {
        try{
            T result = null;
            if(resultSet.next()) {
                result = this.typeOfSubclass.newInstance();
                result.parseRowStepThrough(resultSet);
            }
            resultSet.close();
            return result;
        } catch (InstantiationException e) {
            throw new RuntimeException("Couldn't instantiate a new instance of class " + this.typeOfSubclass.getName() + " while parsing result set: " + e.getLocalizedMessage());
        } catch (IllegalAccessException e) {
            throw new RuntimeException("Illegal Access Exception: " + e.getLocalizedMessage());
        }
    }

    /**
     * Parses the result set one row at a time but requires you to wrap it in resultSet.next(); This allows you to do things with each row. Will NOT close the result set.
     *
     * @param resultSet the result set
     * @return the T
     * @throws SQLException
     */
    public T parseRowStepThrough(ResultSet resultSet) throws SQLException {
        // This can get called by subclasses
        return this.parseRowStepThrough(resultSet, "");
    }

    /**
     * Parses a single row of the result set into an instance of the class given in the constructor. You must implement this class.
     * This WILL NOT call resultSet.next().
     * Will NOT close the result set.
     *
     * @param resultSet
     * @param prefix
     * @return
     * @throws SQLException
     */
    public abstract T parseRowStepThrough(ResultSet resultSet, String prefix) throws SQLException;
}
