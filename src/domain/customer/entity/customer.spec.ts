import Address from "../value-object/address";
import Customer from "./customer";

describe("Customer unit tests", () => {
  
  it("should throw error when id is empty", () => {
    
    expect(() => {
      let customer = new Customer("", "John");
    }).toThrowError("Id is required");    
  })

  it("should throw error when name is empty", () => {
    
    expect(() => {
      let customer = new Customer("123", "");
    }).toThrowError("Name is required");    
  })

  it("should change name", () => {

    // Arrange
    const customer = new Customer("123", "John");

    // Act
    customer.changeName("Jane");

    // Assert
    expect(customer.name).toBe("Jane");
  })

  it("should activate customer", () => {

    // Arrange
    const customer = new Customer("123", "John");
    const address = new Address("Street 1", 123, "13330-250", "São Paulo");
    customer.changeAddress(address);

    // Act
    customer.activate();

    // Assert
    expect(customer.isActivate()).toBe(true);
  })

  it("should deactivate customer", () => {

    // Arrange
    const customer = new Customer("123", "John");

    // Act
    customer.deactivate();

    // Assert
    expect(customer.isActivate()).toBe(false);
  })

  it("should throw error when address is undefined when you activate a customer", () => {

    expect(() => {
      const customer = new Customer("123", "John");        
        
      customer.activate();              
    }).toThrowError("Address is mandatory to activate a customer");
  })

  it("should add reward points", () => {
    const customer = new Customer("1", "Customer 1");
    expect(customer.rewardPoints).toBe(0);

    customer.addRewardPoints(10);
    expect(customer.rewardPoints).toBe(10);

    customer.addRewardPoints(10);
    expect(customer.rewardPoints).toBe(20);
  })
})