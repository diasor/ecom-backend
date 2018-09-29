const mongoose = require('mongoose');
const Schema = mongoose.Schema,
  model = mongoose.model.bind(mongoose),
  ObjectId = mongoose.Schema.Types.ObjectId,
  Types = mongoose.Types;

  /****************************************
        Manufacturer Schema Definition
  *****************************************/
const manufacturerSchema = Schema({
  id: ObjectId,
  name: String,
});

const Manufacturer = model('Manufacturer', manufacturerSchema);


module.exports = {Manufacturer};
