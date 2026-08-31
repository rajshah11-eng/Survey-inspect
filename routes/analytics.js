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

    // Find all Point POIs that fall inside this District's polygon
    const poisInsideDistrict = await POI.find({
      location: {
        $geoWithin: {
          $geometry: poiArea.boundary
        }
      }
    });

    const uniqueDevicesCount = visits.length;
    const totalVisits = visits.reduce((sum, v) => sum + v.visitCount, 0);
    const deviceIdsList = visits.map(v => v._id).join(', ');

    res.json({
      poiName: poiArea.name,
      boundary: poiArea.boundary, // Include boundary here so frontend doesn't need all 216 boundaries in memory!
      poisInsideDistrict, // Return the nested POIs
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

// GET /api/poi - List all POIs (Heavy: includes all boundaries)
router.get('/poi', async (req, res) => {
  try {
    const areas = await Area.find({}, { name: 1, boundary: 1 });
    res.json(areas);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/districts/names - Lightweight list of IDs and Names for dropdown
router.get('/districts/names', async (req, res) => {
  try {
    const areas = await Area.find({}, { name: 1, _id: 1 }).sort({ name: 1 });
    res.json(areas);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

const POI = require('../models/POI');

// GET /api/point-pois - List all Point POIs (Masjids, Hospitals, etc.)
router.get('/point-pois', async (req, res) => {
  try {
    const pois = await POI.find({});
    res.json(pois);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/point-pois/:poiId/devices - Radius search for devices near a Point POI
router.get('/point-pois/:poiId/devices', async (req, res) => {
  try {
    const { poiId } = req.params;
    
    const poiData = await POI.findById(poiId);
    if (!poiData) return res.status(404).json({ error: "POI not found" });

    // MongoDB requires radius in radians for $centerSphere. Earth radius = 6378.1 km
    const radiusInRadians = poiData.radiusMeters / 6378100.0;

    const visits = await DeviceLocation.aggregate([
      {
        $match: {
          location: {
            $geoWithin: {
              $centerSphere: [ poiData.location.coordinates, radiusInRadians ]
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
      poiName: poiData.name,
      category: poiData.category,
      radiusMeters: poiData.radiusMeters,
      location: poiData.location, // Included location so Map can zoom to the point!
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

module.exports = router;
