const mongoose = require('mongoose');
const Schema = mongoose.Schema,
  model = mongoose.model.bind(mongoose),
  ObjectId = mongoose.Schema.Types.ObjectId,
  Types = mongoose.Types;

  /****************************************
            Cart Schema Definition
  *****************************************/
const cartSchema = Schema({
  id: ObjectId,
  expire: Date,
  items: [
    {
      product_id: String,
      amount: Number,
    }
  ]
});

const Cart = model('Cart', cartSchema);

module.exports = {Cart};
