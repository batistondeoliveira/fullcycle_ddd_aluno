import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

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
          quantity: item.quantity,
          orderId: item.id
        })),
      },
      {
        include: [{ model: OrderItemModel }]
      }
    );
  }

  async update(entity: Order): Promise<void> { 
    const sequelize = OrderModel.sequelize;

    await sequelize.transaction(async (t) => {
      await OrderItemModel.destroy({
        where: { orderId: entity.id },
        transaction: t
      });

      const items = entity.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        productId: item.productId,
        quantity: item.quantity,
        orderId: entity.id
      }))
      await OrderItemModel.bulkCreate(items, { transaction: t });
      await OrderModel.update(
        { 
          customerId: entity.customerId,
          total: entity.total(), 
        },
        { 
          where: { id: entity.id },
          transaction: t
        }
      )
    });    
  }  

  async find(id: string): Promise<Order> {    
    let orderModel;
    try {
      orderModel = await OrderModel.findOne({ 
        where: { 
          id 
        },
        include: [{ model: OrderItemModel }],
        rejectOnEmpty: true
      });
    } catch (error) {
      throw new Error("Order not found");
    }

    const order = new Order(
      orderModel.id, 
      orderModel.customerId,      
      orderModel.items.map((itemModel) => {
        let orderItem = new OrderItem(
          itemModel.id, 
          itemModel.name, 
          itemModel.price, 
          itemModel.productId, 
          itemModel.quantity
        );

        return orderItem;
      })
    );

    return order;
  }  

  async findAll(): Promise<Order[]> {        
    const orderModels = await OrderModel.findAll({
      include: [{ model: OrderItemModel }]
    });    
    
    const orders = orderModels.map((orderModel) => {
      let order = new Order(
        orderModel.id, 
        orderModel.customerId,        
        orderModel.items.map((itemModel) => {
          let orderItem = new OrderItem(
            itemModel.id, 
            itemModel.name, 
            itemModel.price, 
            itemModel.productId, 
            itemModel.quantity
          );
  
          return orderItem;
        })        
      );


      return order;
    });

    return orders;
  } 
}