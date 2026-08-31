const express = require('express');
const router = express.Router();
const DeviceLocation = require('../models/DeviceLocation');
const Area = require('../models/Area');

// GET /api/poi/:poiId/devices
router.get('/poi/:poiId/devices', async (req, res) => {
  try {
    const { poiId } = req.params;
    const { year } = req.query;

    const poiArea = await Area.findById(poiId);
    if (!poiArea) return res.status(404).json({ error: "POI not found" });

    let dateFilter = {};
    if (year) {
      dateFilter = {
        timestamp: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${parseInt(year) + 1}-01-01`)
        }
      };
    }

    const visits = await DeviceLocation.aggregate([
      {
        $match: {
          ...dateFilter,
          location: {
            $geoWithin: {
              $geometry: poiArea.boundary
            }
          }
        }
      },
      {
        $group: {
          _id: "$deviceId",
          visitCount: { $sum: 1 },
          locations: { $push: "$location.coordinates" }
        }
      }
    ]);

    const uniqueDevicesCount = visits.length;
    const totalVisits = visits.reduce((sum, v) => sum + v.visitCount, 0);
    const deviceIdsList = visits.map(v => v._id).join(', ');

    res.json({
      poiName: poiArea.name,
      totalVisits,
      uniqueDevicesCount,
      deviceIdsList,
      details: visits
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/poi - List all POIs
router.get('/poi', async (req, res) => {
  try {
    const areas = await Area.find({}, { name: 1, boundary: 1 });
    res.json(areas);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/districts/names - List all NAMEENGLISH (which are stored as 'name' in our DB)
router.get('/districts/names', async (req, res) => {
  try {
    const areas = await Area.find({}, { name: 1, _id: 0 }).sort({ name: 1 });
    const namesList = areas.map(a => a.name);
    res.json(namesList);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
