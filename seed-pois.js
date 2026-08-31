const mongoose = require('mongoose');
require('dotenv').config();
const POI = require('./models/POI');
const DeviceLocation = require('./models/DeviceLocation');

const seedPOIs = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/geotracker');
        
        await POI.deleteMany({});
        
        const pois = [
            { name: "Grand Mosque Al Ain", category: "Masjid", iconUnicode: "🕌", location: { type: "Point", coordinates: [55.760, 24.210] }, radiusMeters: 100 },
            { name: "Al Ain Hospital", category: "Hospital", iconUnicode: "🏥", location: { type: "Point", coordinates: [55.750, 24.220] }, radiusMeters: 200 },
            { name: "Jimi Mall", category: "Mall", iconUnicode: "🛍️", location: { type: "Point", coordinates: [55.740, 24.230] }, radiusMeters: 150 },
            { name: "Al Ain Oasis", category: "Park", iconUnicode: "🌴", location: { type: "Point", coordinates: [55.765, 24.215] }, radiusMeters: 300 },
            { name: "Hili Fun City", category: "Entertainment", iconUnicode: "🎡", location: { type: "Point", coordinates: [55.770, 24.280] }, radiusMeters: 400 },
            { name: "Al Qattarah Arts Centre", category: "Culture", iconUnicode: "🎨", location: { type: "Point", coordinates: [55.750, 24.260] }, radiusMeters: 80 },
            { name: "Al Ain Zoo", category: "Park", iconUnicode: "🦁", location: { type: "Point", coordinates: [55.735, 24.175] }, radiusMeters: 500 },
            { name: "Bawadi Mall", category: "Mall", iconUnicode: "🛒", location: { type: "Point", coordinates: [55.820, 24.180] }, radiusMeters: 250 },
            { name: "Al Ain University", category: "Education", iconUnicode: "🎓", location: { type: "Point", coordinates: [55.710, 24.190] }, radiusMeters: 200 },
            { name: "Jebel Hafeet Park", category: "Park", iconUnicode: "⛰️", location: { type: "Point", coordinates: [55.770, 24.080] }, radiusMeters: 150 }
        ];

        const insertedPois = await POI.insertMany(pois);
        
        // Add some dummy device pings near "Al Qattarah Arts Centre" so there's data to test
        const pings = [
            { deviceId: "device_poi_1", location: { type: "Point", coordinates: [55.7501, 24.2601] } }, // Inside radius
            { deviceId: "device_poi_2", location: { type: "Point", coordinates: [55.7502, 24.2602] } }, // Inside
            { deviceId: "device_poi_1", location: { type: "Point", coordinates: [55.7499, 24.2599] } }, // Inside
            { deviceId: "device_poi_3", location: { type: "Point", coordinates: [55.760, 24.260] } } // Outside radius (too far)
        ];
        await DeviceLocation.insertMany(pings);

        console.log(`Successfully seeded ${insertedPois.length} POIs!`);
        process.exit(0);
    } catch (error) {
        console.error("Seeding Error:", error);
        process.exit(1);
    }
};

seedPOIs();
