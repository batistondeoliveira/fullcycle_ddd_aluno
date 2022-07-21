import Address from "../../domain/entity/address";
import Customer from "../../domain/entity/customer";
import Order from "../../domain/entity/order";
import OrderRepositoryInterface from "../../domain/repository/order-repository.interface";
import CustomerModel from "../db/sequelize/model/customer.model";
import OrderItemModel from "../db/sequelize/model/order-item.model";
import OrderModel from "../db/sequelize/model/order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customerId: entity.customerId,        
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          productId: item.productId,
          quantity: item.quantity
        })),
      },
      {
        include: [{ model: OrderItemModel }]
      }
    );
  }

  async update(entity: Order): Promise<void> {
    // await CustomerModel.update(
    //   {      
    //     name: entity.name,
    //     street: entity.address.street,
    //     number: entity.address.number,
    //     zipcode: entity.address.zip,
    //     city: entity.address.city,
    //     active: entity.isActivate(),
    //     rewardPoints: entity.rewardPoints
    //   },
    //   {
    //     where: {
    //       id: entity.id
    //     }
    //   }
    // )
  }

  async find(id: string): Promise<Order> {    
    return new Order("", "", []);
    // let customerModel;
    // try {
    //   customerModel = await CustomerModel.findOne({ 
    //     where: { 
    //       id 
    //     } ,
    //     rejectOnEmpty: true
    //   });
    // } catch (error) {
    //   throw new Error("Customer not found");
    // }

    // const customer = new Customer(customerModel.id, customerModel.name);
    // const address = new Address(
    //   customerModel.street,
    //   customerModel.number,
    //   customerModel.zipcode,
    //   customerModel.city
    // );
    // customer.changeAddress(address);
    // return customer;
  }  

  async findAll(): Promise<Order[]> {
    return [new Order("", "", [])]
    // const customerModels = await CustomerModel.findAll();
    
    // const customers = customerModels.map((customerModel) => {
    //   let customer = new Customer(customerModel.id, customerModel.name);
    //   customer.addRewardPoints(customerModel.rewardPoints);
    //   const address = new Address(
    //     customerModel.street,
    //     customerModel.number,
    //     customerModel.zipcode,
    //     customerModel.city
    //   );
    //   customer.changeAddress(address);
    //   if (customerModel.active) {
    //     customer.activate();
    //   }
    //   return customer;
    // });

    // return customers;
  } 
}