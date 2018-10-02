const { Manufacturer } = require('../../models/manufacturer');
const { getAll, manufacturerById, createManufacturer, updateManufacturer, removeManufacturer } = require('../../dao/manufacturerDao');

/******************************************************
  Manufacturer's cartController:
    This controller provides de apis for retrieving,
    creating, updating and deleting a manufacturer.
******************************************************/
const manufacturerController = {
  all (req, res) {
    // this method returns all manufacturers
    getAll( (error, manufacturers) => {
      if (error) res.status(500).json({ message: error });
      res.json(manufacturers);
    });
  },

  byId (req, res) {
    // returns a single manufacturer identified by the parameter id
    manufacturerById(req.params.id, (error, manufacturerDocument) => {
      if (error) res.status(500).json({ message: error });
      res.json(manufacturerDocument);
    });
  },

  create (req, res) {
    // creates a new record from a submitted form
    createManufacturer(req.body.name, (error, manufacturerDocument) => {
      if (error) res.status(500).json({ message: error });
      res.json(manufacturerDocument);
    });
  },

  update (req, res) {
    // updates the manufacturer's information
    updateManufacturer(req.params.id, req.body.name, (error, manufacturerDocument) => {
      if (error) res.status(500).json({ message: error });
      res.json(manufacturerDocument);
    });
  },

  remove (req, res) {
    // deletes one manufacturer
    removeManufacturer(req.params.id, (error, result) => {
      if (error) res.status(500).json({ message: error });
      res.json(result);
    });
  } ,
};

module.exports = { manufacturerController };
