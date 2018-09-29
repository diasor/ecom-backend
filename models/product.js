const mongoose = require('mongoose');
const Schema = mongoose.Schema,
  model = mongoose.model.bind(mongoose),
  ObjectId = mongoose.Schema.Types.ObjectId,
  Types = mongoose.Types;

  /****************************************
        Product Schema Definition
  *****************************************/
const productSchema = Schema({
  id: ObjectId,
  name: String,
  price: Number,
  description: String,
  imageName: String,
  // One to many relationship
  manufacturer: {type: ObjectId, ref: 'Manufacturer'}
});

const Product = model('Product', productSchema);

module.exports = {Product, Types};
