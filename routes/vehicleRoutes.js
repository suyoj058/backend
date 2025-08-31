const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const Vehicle = require('../models/Vehicle');

// Create a new vehicle
router.post('/', (req, res, next) => {
  console.log('🔥 Hit POST /api/vehicles');
  next();
}, vehicleController.createVehicle);

// GET all vehicles OR filter by location, type, and budget range
router.get('/', async (req, res) => {
  try {
    const { location, type, minBudget, maxBudget } = req.query; // e.g., /api/vehicles?location=Kathmandu&type=suv&minBudget=10000&maxBudget=50000

    let query = {};

    // Add location filter if present
    if (location) {
      query.location = new RegExp(location, 'i'); // case-insensitive match for location
    }

    // Add type filter if present
    if (type) {
      query.type = new RegExp(type, 'i'); // case-insensitive match for type
    }

    // Add budget range filter if present
    if (minBudget && maxBudget) {
      query.budget = { $gte: minBudget, $lte: maxBudget }; // Filter vehicles within the specified budget range
    } else if (minBudget) {
      query.budget = { $gte: minBudget }; // Filter vehicles with budget greater than or equal to minBudget
    } else if (maxBudget) {
      query.budget = { $lte: maxBudget }; // Filter vehicles with budget less than or equal to maxBudget
    }

    // Fetch the vehicles from the database based on the query filters
    const vehicles = await Vehicle.find(query);

    // Return the fetched vehicles as a response
    res.json(vehicles);
  } catch (err) {
    // Handle errors if the query fails
    res.status(500).json({ error: err.message });
  }
});

// Update a vehicle by ID
router.put('/:id', vehicleController.updateVehicle);

// Delete a vehicle by ID
router.delete('/:id', vehicleController.deleteVehicle);

module.exports = router;
