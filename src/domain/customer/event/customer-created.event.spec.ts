import EventDispatcher from "../../@shared/event/event-dispatcher";
import Customer from "../entity/customer";
import Address from "../value-object/address";
import AddressChangedEvent from "./address-changed.event";
import CustomerCreatedEvent from "./customer-created.event";
import WriteConsole1WhenProductIsCreatedHandler from "./handler/write-console-1-when-customer-is-created.handler";
import WriteConsole2WhenProductIsCreatedHandler from "./handler/write-console-2-when-customer-is-created.handler";
import WriteConsoleWhenAddressIsChanged from "./handler/write-console-when-address-is-changed.handler";

describe("Customer domain events tests", () => {  

  it("should create a customer", () => {    
    const eventDispatcher = new EventDispatcher();
    const eventHandler1 = new WriteConsole1WhenProductIsCreatedHandler();
    const eventHandler2 = new WriteConsole2WhenProductIsCreatedHandler();
    const spyEventHandler1 = jest.spyOn(eventHandler1, "handle");
    const spyEventHandler2 = jest.spyOn(eventHandler2, "handle");
    
    eventDispatcher.register("CustomerCreatedEvent", eventHandler1);
    eventDispatcher.register("CustomerCreatedEvent", eventHandler2);

    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]).toMatchObject(eventHandler1);
    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"][1]).toMatchObject(eventHandler2);

    let customer = new Customer("123", "Customer 1");

    const customerCreatedEvent = new CustomerCreatedEvent({
      id: customer.id,
      name: customer.name      
    });
    
    eventDispatcher.notify(customerCreatedEvent);

    expect(spyEventHandler1).toHaveBeenCalled();
    expect(spyEventHandler2).toHaveBeenCalled();            
  })

  it("should create a customer and changeAddress", () => {    
    const eventDispatcher = new EventDispatcher();
    const eventHandler1 = new WriteConsole1WhenProductIsCreatedHandler();
    const eventHandler2 = new WriteConsole2WhenProductIsCreatedHandler();
    const spyEventHandler1 = jest.spyOn(eventHandler1, "handle");
    const spyEventHandler2 = jest.spyOn(eventHandler2, "handle");
    
    eventDispatcher.register("CustomerCreatedEvent", eventHandler1);
    eventDispatcher.register("CustomerCreatedEvent", eventHandler2);

    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]).toMatchObject(eventHandler1);
    expect(eventDispatcher.getEventHandlers["CustomerCreatedEvent"][1]).toMatchObject(eventHandler2);

    let customer = new Customer("123", "Customer 1");

    const customerCreatedEvent = new CustomerCreatedEvent({
      id: customer.id,
      name: customer.name      
    });
    
    eventDispatcher.notify(customerCreatedEvent);

    expect(spyEventHandler1).toHaveBeenCalled();
    expect(spyEventHandler2).toHaveBeenCalled();
    
    let address = new Address("Street 1", 123, "13330-250", "São Paulo");
    customer.changeAddress(address);

    const eventHandler3 = new WriteConsoleWhenAddressIsChanged();
    const spyEventHandler3 = jest.spyOn(eventHandler3, "handle");    
    
    eventDispatcher.register("AddressChangedEvent", eventHandler3);
    
    expect(eventDispatcher.getEventHandlers["AddressChangedEvent"][0]).toMatchObject(eventHandler3);
    
    const addressChangedEvent = new AddressChangedEvent({
      customer: {
        id: customer.id,
        name: customer.name
      },
      address: {
        street: customer.address.street,
        number: customer.address.number,
        zip: customer.address.zip,
        city: customer.address.city
      }
    })

    eventDispatcher.notify(addressChangedEvent);

    expect(spyEventHandler3).toHaveBeenCalled();
  })
});