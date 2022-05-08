import mongoose, { mongo } from "mongoose";
import { OrderStatus } from '@henoktekatickets/common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface OrderAttrs{
  id: string;
  version: number;
  status: OrderStatus;
  userId: string;
  price: number;
}

interface OrderDoc extends mongoose.Document{
  version: number;
  status: OrderStatus;
  userId: string;
  price: number;
}

interface OrderModel extends mongoose.Model<OrderDoc>{
  build(attrs: OrderAttrs):OrderDoc;
  findByEvent(event: { id: string, version: number }): Promise<OrderDoc | null>;
}

const orderSchema = new mongoose.Schema({
    status:{
      type: String,
      enum: Object.values(OrderStatus),
      required: true,
      default: OrderStatus.Created,
    },
    userId:{
      type: String,
      required: true,
    },
    price:{
      type: Number,
      required: true,
    },
  }, {
    toJSON:{
      transform(doc, ret){
        ret.id = ret._id;
        delete ret._id;
      }
    }
  }
);

orderSchema.plugin(updateIfCurrentPlugin);
orderSchema.set('versionKey', 'version');

orderSchema.statics.build = (attr:OrderAttrs)=>{
  return new Order({
    _id: attr.id,
    status: attr.status,
    userId: attr.userId,
    price: attr.price,
    version: attr.version,
  });
};

orderSchema.statics.findByEvent = (event: {id: string, version: number }) =>{
  return Order.findOne({ 
    _id: event.id, 
    version: event.version - 1, 
  });
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };