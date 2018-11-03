const { isEmpty } = require('lodash');
const { Manufacturer } = require('../../models/manufacturer');
const { getAll, manufacturerById, createManufacturer, updateManufacturer, removeManufacturer } = require('../../dao/manufacturerDao');

/******************************************************
  Manufacturer's cartController:
    This controller provides de apis for retrieving,
    creating, updating and deleting a manufacturer.
******************************************************/
const manufacturerController = {
  all (req, res) {
    // this api returns all manufacturers
    getAll((error, manufacturers) => {
      if (error) return res.status(500).json({ message: error });
      return res.json(manufacturers);
    });
  },

  byId (req, res) {
    // this api returns a single manufacturer identified by the parameter id
    const manufacturerId = req.params.id;
    if (manufacturerId === 'undefined') return res.status(400).json({ message: 'The manufacturer Id can not be empty.' });

    manufacturerById(manufacturerId, (error, manufacturerDocument) => {
      if (error) return res.status(500).json({ message: error });
      return res.json(manufacturerDocument);
    });
  },

  create (req, res) {
    // this api creates a new record from a submitted form
    const name = req.body.name;
    if (isEmpty(name)) return res.status(400).json({ message: 'The name of the manufacturer can not be empty.' });

    createManufacturer(name, (error, manufacturerDocument) => {
      if (error) return res.status(500).json({ message: error });
      return res.json(manufacturerDocument);
    });
  },

  update (req, res) {
    // updates the manufacturer's information
    const id = req.params.id;
    const name = req.body.name;
    if ((isEmpty(id)) || (isEmpty(name))) return res.status(400).json({ message: 'The id and name of the manufacturer can not be empty.' });

    updateManufacturer(id, name, (error, manufacturerDocument) => {
      if (error) return res.status(500).json({ message: error });
      return res.json(manufacturerDocument);
    });
  },

  remove (req, res) {
    // deletes one manufacturer
    const manufacturerId = req.params.id;
    if (isEmpty(manufacturerId)) return res.status(400).json({ message: 'The manufacturer Id can not be empty.' });

    removeManufacturer(manufacturerId, (error, result) => {
      if (error) return res.status(500).json({ message: error });
      return res.json(result);
    });
  } ,
};

module.exports = { manufacturerController };
