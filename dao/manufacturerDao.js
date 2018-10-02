const { Manufacturer } = require('../models/manufacturer');

// ---------------------------------------------------------
//  Manufacturer's Data Access Object
//    handles all the necessary database interaction
//    concerning the manufacturer
// ---------------------------------------------------------

function getAll(callback) {
  // returns all manufacturers
  getAllManufacturers()
    .then(manufacturers => callback(undefined, manufacturers))
    .catch(error => callback(`Failed to get manufacturers. => ${error}. Bad Request.`));
};

function manufacturerById (id, callback) {
  // returns a single manufacturer identified by the parameter id
  Manufacturer.findOne({_id: id}, (error, manufacturer) => {
    if (error) callback(`Failed to get manufacturer by id. => ${error}. Bad Request.`);
    callback(undefined, manufacturer);
  });
};

function createManufacturer (name, callback) {
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
      if (error) callback(`Error updating manufacturer: ${name}. ERROR: ${error}`);
      callback(undefined, manufacturerDocument);
    });
};

function removeManufacturer (id, callback) {
  // deletes one manufacturer
  Manufacturer.deleteOne({_id: id}, (error) => {
    if (error) callback(`Error removing manufacturer: ${id}. ERROR: ${error}`);
    callback(undefined, 'OK');
  });
};

// Basic Data Access Object operations
async function getAllManufacturers () {
  return await Manufacturer.find({});
};

async function findById (id) {
  return await Manufacturer.findById({_id: id});
};

module.exports = {
  getAll,
  manufacturerById,
  createManufacturer,
  updateManufacturer,
  removeManufacturer,
};
