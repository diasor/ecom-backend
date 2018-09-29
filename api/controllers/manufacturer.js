const { Manufacturer } = require('../../models/manufacturer');

const manufacturerController = {
  all (req, res) {
    // Returns all manufacturers
    Manufacturer.find({})
      .exec((err, manufacturers) => res.json(manufacturers))
  },
  byId (req, res) {
    const idParam = req.params.id;
    // Returns a single product based on the passed in ID parameter
    Manufacturer.findOne({_id: idParam})
      .then(manufacturer => res.json(manufacturer))
      .catch(err => console.log('Error getting manufacturer ', req.params.id));
  },
  create (req, res) {
    const requestBody = req.body;
    // Creates a new record from a submitted form
    const newManufacturer = new Manufacturer(requestBody);
    newManufacturer.save()
      .then(saved => res.json(saved))
      .catch(err => console.log('Error creating manufacturer ', req.body.name));
  },
  update (req, res) {
    const idParam = req.params.id;
    Manufacturer.findById({_id: idParam}, (err, manufacturerDocument) => {
      // updates the manufacturer payload
      manufacturerDocument.name = req.body.name;
      manufacturerDocument.save()
      .then(saved => res.json(saved))
      .catch(err => console.log('Error updating manufacturer ', req.body.name));
    });
  },
  remove (req, res) {
    const idParam = req.params.id;
    Manufacturer.deleteOne({_id: idParam})
      .then(() => res.json("OK"))
      .catch(err => console.log('Error removing manufacturer ', idParam));
  } ,
};

module.exports = manufacturerController;
