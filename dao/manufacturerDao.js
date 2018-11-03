const { Manufacturer } = require('../models/manufacturer');

/******************************************************
  Manufacturer's Data Access Object:
    handles all the necessary database interaction
    concerning the manufacturer.
******************************************************/
function getAll(callback) {
  // returns all manufacturers
  Manufacturer.find({}, (error, manufacturers) => {
    if (error) return callback(`Failed to get manufacturers:  ${error}.`);
    return callback(undefined, manufacturers)
  });
};

function manufacturerById (id, callback) {
  // returns a single manufacturer identified by the parameter id
  Manufacturer.findOne({_id: id}, (error, manufacturer) => {
    if (error) return callback(`Failed to get manufacturer by id: ${id}. ERROR: ${error}.`);
    return callback(undefined, manufacturer);
  });
};

function createManufacturer (name, callback) {
  // creates a new manufacturer
  const newManufacturer = new Manufacturer({ name });
  newManufacturer.save()
    .then(saved => callback(undefined, saved))
    .catch(error => callback(`Error creating manufacturer: ${name}`));
};

function updateManufacturer (id, name, callback) {
  // finds the manufacturer by id and updates it's information
  Manufacturer.findOneAndUpdate(
    { _id: id },
    { $set: { 'name' : name } },
    { new: true },
    (error, manufacturerDocument) => {
      if (error) return callback(`Error updating manufacturer: ${name}. ERROR: ${error}`);
      return callback(undefined, manufacturerDocument);
    });
};

function removeManufacturer (id, callback) {
  // deletes one manufacturer
  Manufacturer.deleteOne({_id: id}, (error) => {
    if (error) return callback(`Error removing manufacturer: ${id}. ERROR: ${error}`);
    return callback(undefined, 'OK');
  });
};


module.exports = {
  getAll,
  manufacturerById,
  createManufacturer,
  updateManufacturer,
  removeManufacturer,
};
