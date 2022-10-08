import { Sequelize } from "sequelize-typescript"
import OrderItem from "../../../../domain/checkout/entity/order_item";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import OrderItemModel from "./order-item.model";
import OrderModel from "../../../order/repository/sequelize/order.model";
import ProductModel from "../../../product/repository/sequelize/product.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import OrderRepository from "./order.repository";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import Order from "../../../../domain/checkout/entity/order";
import {v4 as uuid} from "uuid";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true }
    });

    await sequelize.addModels([CustomerModel, OrderModel, OrderItemModel, ProductModel]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });  
  
  it("should create a new order", async () => {

    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", customer.id, [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"]
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customerId: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          orderId: "123",
          productId: "123",
        },
      ],
    })
  });

  it("should update an order change the item", async () => {

    const customerRepository = new CustomerRepository();
    const customer1 = new Customer("123", "Customer 1");
    const address1 = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer1.changeAddress(address1);
    await customerRepository.create(customer1);

    const productRepository = new ProductRepository();
    const product1 = new Product("123", "Product 1", 10);
    await productRepository.create(product1);

    const orderItem = new OrderItem(
      "1",
      product1.name,
      product1.price,
      product1.id,
      2
    );

    const order = new Order("123", customer1.id, [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"]
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customerId: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          orderId: "123",
          productId: "123",
        },
      ],
    })    

    const customer2 = new Customer("345", "Customer 2");
    const address2 = new Address("Street 2", 2, "Zipcode 2", "City 2");
    customer2.changeAddress(address2);    
    await customerRepository.create(customer2);

    const product2 = new Product("P2", "Product 2", 50);
    await productRepository.create(product2);

    const orderItemChanged = new OrderItem(
      "1",
      product2.name,
      product2.price,
      product2.id,
      3
    );
    
    order.changeCustomerId(customer2.id);
    order.changeItems([orderItemChanged]);    
    await orderRepository.update(order);
    
    const orderModelChanged = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"]
    });    

    expect(orderModelChanged.items).toHaveLength(1);
    expect(orderModelChanged.toJSON()).toStrictEqual({
      id: order.id,
      customerId: order.customerId,
      total: order.total(),
      items: [
        {
          id: orderItemChanged.id,
          name: orderItemChanged.name,
          price: orderItemChanged.price,
          quantity: orderItemChanged.quantity,
          orderId: order.id,
          productId: orderItemChanged.productId,
        },
      ]
    })
  });

  it("should update an order adding a new item", async () => {

    const customerRepository = new CustomerRepository();
    const customer1 = new Customer("123", "Customer 1");
    const address1 = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer1.changeAddress(address1);
    await customerRepository.create(customer1);

    const productRepository = new ProductRepository();
    const product1 = new Product("123", "Product 1", 10);
    await productRepository.create(product1);

    const orderItem = new OrderItem(
      "1",
      product1.name,
      product1.price,
      product1.id,
      2
    );
    
    const order = new Order(uuid(), customer1.id, [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"]
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: order.id,
      customerId: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          orderId: order.id,
          productId: "123",
        },
      ],
    })    

    const customer2 = new Customer("345", "Customer 2");
    const address2 = new Address("Street 2", 2, "Zipcode 2", "City 2");
    customer2.changeAddress(address2);    
    await customerRepository.create(customer2);

    const product2 = new Product("P2", "Product 2", 50);
    await productRepository.create(product2);

    const orderItemChanged = new OrderItem(
      "2",
      product2.name,
      product2.price,
      product2.id,
      3
    );

    order.changeCustomerId(customer2.id);
    order.changeItems([orderItem, orderItemChanged]);    
    await orderRepository.update(order);
    
    const orderModelChanged = await OrderModel.findOne({
      where: { id: order.id },      
      include: ["items"]
    });    

    orderModelChanged.items.sort(function(a, b) {
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    })    

    expect(orderModelChanged.items).toHaveLength(2);
    expect(orderModelChanged.toJSON()).toStrictEqual({
      id: order.id,
      customerId: order.customerId,
      total: order.total(),
      items: order.items.map(items => ({
        id: items.id,
        name: items.name,
        price: items.price,
        quantity: items.quantity,
        orderId: order.id,
        productId: items.productId,
      }))
    });
  });

  it("should update an order by deleting item 1 and adding a new item", async () => {

    const customerRepository = new CustomerRepository();
    const customer1 = new Customer("123", "Customer 1");
    const address1 = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer1.changeAddress(address1);
    await customerRepository.create(customer1);

    const productRepository = new ProductRepository();
    const product1 = new Product("123", "Product 1", 10);
    await productRepository.create(product1);

    const orderItem = new OrderItem(
      "1",
      product1.name,
      product1.price,
      product1.id,
      2
    );

    const order = new Order("123", customer1.id, [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"]
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customerId: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          orderId: "123",
          productId: "123",
        },
      ],
    })    

    const customer2 = new Customer("345", "Customer 2");
    const address2 = new Address("Street 2", 2, "Zipcode 2", "City 2");
    customer2.changeAddress(address2);    
    await customerRepository.create(customer2);

    const product2 = new Product("P2", "Product 2", 50);
    await productRepository.create(product2);

    const orderItemChanged = new OrderItem(
      "2",
      product2.name,
      product2.price,
      product2.id,
      3
    );

    order.changeCustomerId(customer2.id);
    order.changeItems([orderItemChanged]);    
    await orderRepository.update(order);
    
    const orderModelChanged = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"]
    });    

    expect(orderModelChanged.items).toHaveLength(1);
    expect(orderModelChanged.toJSON()).toStrictEqual({
      id: order.id,
      customerId: order.customerId,
      total: order.total(),
      items: [
        {
          id: orderItemChanged.id,
          name: orderItemChanged.name,
          price: orderItemChanged.price,
          quantity: orderItemChanged.quantity,
          orderId: order.id,
          productId: orderItemChanged.productId,
        },
      ]
    })
  });

  it("should find an order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", customer.id, [orderItem]);

    const orderRepository = new OrderRepository();    
    await orderRepository.create(order);
    
    const foundOrder = await orderRepository.find(order.id);    

    expect(order).toStrictEqual(foundOrder);
  });

  it("should throw an error when order is not found", async () => {
    const orderRepository = new OrderRepository();    

    expect(async () => {      
      await orderRepository.find("1");
    }).rejects.toThrow("Order not found");       
  });

  it("should find all orders", async () => {
    const customerRepository = new CustomerRepository();
    const customer1 = new Customer("123", "Customer 1");
    const address1 = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer1.changeAddress(address1);
    await customerRepository.create(customer1);

    const productRepository = new ProductRepository();
    const product1 = new Product("123", "Product 1", 10);
    await productRepository.create(product1);

    const orderItem1 = new OrderItem(
      "1",
      product1.name,
      product1.price,
      product1.id,
      2
    );

    const order1 = new Order("123", customer1.id, [orderItem1]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order1);
    
    const customer2 = new Customer("321", "Customer 2");
    const address2 = new Address("Street 2", 2, "Zipcode 2", "City 2");
    customer2.changeAddress(address2);
    await customerRepository.create(customer2);
    
    const product2 = new Product("P2", "Product 2", 20);
    await productRepository.create(product2);

    const orderItem2 = new OrderItem(
      "2",
      product2.name,
      product2.price,
      product2.id,
      3
    );

    const order2 = new Order("O2", customer2.id, [orderItem2]);
    
    await orderRepository.create(order2);

    const foundOrders = await orderRepository.findAll();
    const orders = [order1, order2];

    expect(foundOrders).toHaveLength(2);
    expect(foundOrders).toContainEqual(order1);
    expect(foundOrders).toContainEqual(order2);
    expect(foundOrders).toStrictEqual(orders);
  });
})