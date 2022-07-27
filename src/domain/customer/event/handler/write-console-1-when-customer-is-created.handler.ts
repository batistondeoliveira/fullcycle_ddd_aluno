import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import CustomerCreatedEvent from "../customer-created.event";

export default class WriteConsole1WhenProductIsCreatedHandler implements EventHandlerInterface<CustomerCreatedEvent> {

  handle(event: CustomerCreatedEvent): void {
      console.log('Esse é o primeiro console.log do evento: CustomerCreated');
  }
}
