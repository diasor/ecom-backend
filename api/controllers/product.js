const path = require('path');
const IncomingForm = require('formidable');
const { isEmpty, each } = require('lodash');
const { Product } = require('../../models/product');
const { Manufacturer } = require('../../models/manufacturer');
const { getAll, getProductById, createProduct, updateProduct, removeProduct, getImagePath } = require('../../dao/productDao');

/******************************************************
  Product's cartController:
    This controller provides de apis for retrieving,
    creating and updating a shopping cart.
******************************************************/
const productController = {
  all (req, res) {
    // returns all products
    getAll((error, products) => {
      if (error) return res.status(500).json({ message: error });
      return res.json(products);
    });
  },

  byId (req, res) {
    const productId = req.params.id;
    if (productId === 'undefined') return res.status(400).json({ message: 'The product Id can not be empty.' });

    // returns a single product based on the passed in ID parameter
    getProductById(productId, (error, productDocument) => {
      if (error) return res.status(500).json({ message: error });
      return res.json(productDocument);
    });
  },

  createUpdate (req, res) {
    // Creates a new record from a submitted form
    let form = new IncomingForm();
    let newFileName = '';
    let idParam = '';
    // managing the file (if there is one)
    form.on('fileBegin', (name, file) => {
      newFileName = file.name;
      file.path = path.join(getImagePath(), newFileName);
    });
    // parsing the form to get the form information
    form.parse(req, (err, fields, files) => {
      idParam = fields.id;
      const isNewProduct = isEmpty(idParam);
      let oldImageName = '';
      let product = {
        name: fields.name,
        price: fields.price,
        description: fields.description,
        imageName: newFileName,
        manufacturer: fields.manufacturer,
      };
      if (isNewProduct) {
        // if it is a new product, we just save it
        createProduct(product, (error, productDocument) => {
          if (error) return res.status(500).json({ message: error });
          return res.json(productDocument);
        });
      } else {
        product._id = idParam;
        // if the object already existed, the it must be found in the database to be updated
        const uploadNewFile = !isEmpty(newFileName);
        updateProduct(product, uploadNewFile, (error, productDocument) => {
          if (error) return res.status(500).json({ message: error });
          return res.json(productDocument);
        });
      }
    });
    form.on('error', (error) => {
      console.log('error ', JSON.stringify(error));
      return res.status(500).json({ message: error });
    });
  },

  remove (req, res) {
    const idParam = req.params.id;
    // Removes a product
    removeProduct(idParam, (error, productRemoved) => {
      if (error) return res.status(400).json({ message: error });
      return res.json(productRemoved);
    });
  },
};

module.exports = { productController };
