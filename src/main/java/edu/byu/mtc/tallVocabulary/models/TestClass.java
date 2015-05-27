package edu.byu.mtc.tallVocabulary.models;

import java.sql.Timestamp;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class TestClass {

	// Properties
	private   String name;
	private   String funBookName;
	private   Integer otherStuff;
	protected String myPassword;
	private   Timestamp createdAt;

	// Getters and Setters
	public void getName(){ return this.name;}
	public void setName(String name){ this.name = name;}

	public void getFunBookName(){ return this.funBookName;}
	public void setFunBookName(String funBookName){ this.funBookName = funBookName;}

	public void getOtherStuff(){ return this.otherStuff;}
	public void setOtherStuff(Integer otherStuff){ this.otherStuff = otherStuff;}

	public void getMyPassword(){ return this.myPassword;}
	public void setMyPassword(String myPassword){ this.myPassword = myPassword;}

	public void getCreatedAt(){ return this.createdAt;}
	public void setCreatedAt(Timestamp createdAt){ this.createdAt = createdAt;}


	@Override
	public String toString() {
		final StringBuilder sb = new StringBuilder("TestClass{");
		sb.append("this.name='").append(name).append("'");
		sb.append(", this.funBookName='").append(funBookName).append("'");
		sb.append(", this.otherStuff='").append(otherStuff).append("'");
		sb.append(", this.myPassword='").append(myPassword).append("'");
		sb.append(", this.createdAt='").append(createdAt);
		sb.append('}');
		return sb.toString();
	}

	@Override
	public int hashCode() {
		int result = name != null ? name.hashCode() : 0;
		result = 31 * result + (funBookName != null ? funBookName.hashCode() : 0);
		result = 31 * result + (otherStuff != null ? otherStuff.hashCode() : 0);
		result = 31 * result + (myPassword != null ? myPassword.hashCode() : 0);
		result = 31 * result + (createdAt != null ? createdAt.hashCode() : 0);
		return result;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;

		TestClass testClass = (TestClass) o;

		if (name != null ? !name.equals(testClass.name) : testClass.name != null) return false;
		if (funBookName != null ? !funBookName.equals(testClass.funBookName) : testClass.funBookName != null) return false;
		if (otherStuff != null ? !otherStuff.equals(testClass.otherStuff) : testClass.otherStuff != null) return false;
		if (myPassword != null ? !myPassword.equals(testClass.myPassword) : testClass.myPassword != null) return false;
		if (createdAt != null ? !createdAt.equals(testClass.createdAt) : testClass.createdAt != null) return false;

		return true;
	}
}