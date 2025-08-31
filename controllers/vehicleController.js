const Vehicle = require('../models/Vehicle');

// ✅ Create a new vehicle
exports.createVehicle = async (req, res) => {
  console.log('📦 Received vehicle data:', req.body);

  // Validate required fields
  const requiredFields = ['name', 'type', 'brand', 'year', 'mileage', 'location', 'image', 'price', 'fuelType', 'seats'];
  const missing = requiredFields.filter(field => !req.body[field]);
  if (missing.length) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
  }

  try {
    const newVehicle = new Vehicle(req.body);
    const savedVehicle = await newVehicle.save();
    console.log('✅ Vehicle saved:', savedVehicle);
    res.status(201).json(savedVehicle);
  } catch (err) {
    console.error('❌ Error creating vehicle:', err.message);
    res.status(500).json({ error: 'Failed to add vehicle', details: err.message });
  }
};

// ✅ Get all vehicles (optionally you can add filtering in future)
exports.getVehicles = async (req, res) => {
    try {
    const { type, location, budget } = req.query;
    const filter = {};

    if (type) {
      filter.type = new RegExp(`^${type}$`, 'i'); // case-insensitive match
    }
    if (location) {
      filter.location = new RegExp(`^${location}$`, 'i');
    }
    if (budget) {
      // Example: budget="10-30k"
      if (budget === "0-5k") filter.price = { $gte: 0, $lte: 5000 };
      if (budget === "10-30k") filter.price = { $gte: 10000, $lte: 30000 };
      if (budget === "30k-60k") filter.price = { $gte: 30000, $lte: 60000 };
      if (budget === "60k+") filter.price = { $gte: 60000 };
    }

    const vehicles = await Vehicle.find(filter);
    res.status(200).json(vehicles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vehicles', details: err.message });
  }
};

// ✅ Update a vehicle by ID
exports.updateVehicle = async (req, res) => {
  const vehicleId = req.params.id;

  try {
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      vehicleId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    console.log('✏️ Vehicle updated:', updatedVehicle);
    res.status(200).json(updatedVehicle);
  } catch (err) {
    console.error(`❌ Error updating vehicle [${vehicleId}]:`, err.message);
    res.status(400).json({ error: 'Update failed', details: err.message });
  }
};

// ✅ Delete a vehicle by ID
exports.deleteVehicle = async (req, res) => {
  const vehicleId = req.params.id;

  try {
    const deletedVehicle = await Vehicle.findByIdAndDelete(vehicleId);

    if (!deletedVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    console.log('🗑️ Vehicle deleted:', deletedVehicle);
    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    console.error(`❌ Error deleting vehicle [${vehicleId}]:`, err.message);
    res.status(400).json({ error: 'Delete failed', details: err.message });
  }
};
