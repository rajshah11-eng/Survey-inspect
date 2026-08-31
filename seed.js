const mongoose = require('mongoose');
require('dotenv').config();
const Area = require('./models/Area');
const DeviceLocation = require('./models/DeviceLocation');

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/geotracker');
        console.log("Connected to MongoDB for seeding...");

        // Clear existing data
        await Area.deleteMany({});
        await DeviceLocation.deleteMany({});
        console.log("Cleared old data.");

        // 1. Create Polygons (Coordinates format: [Longitude, Latitude])
        const alQattarah = await Area.create({
            name: "Al Qattarah",
            boundary: {
                type: "Polygon",
                coordinates: [[
                    [55.740, 24.265],
                    [55.750, 24.265],
                    [55.750, 24.255],
                    [55.740, 24.255],
                    [55.740, 24.265] // Must close the loop
                ]]
            }
        });

        const shoppingMall = await Area.create({
            name: "Lulu Shopping Mall",
            boundary: {
                type: "Polygon",
                coordinates: [[
                    [55.760, 24.270],
                    [55.765, 24.270],
                    [55.765, 24.265],
                    [55.760, 24.265],
                    [55.760, 24.270]
                ]]
            }
        });
        console.log("Created Areas:", alQattarah.name, shoppingMall.name);

        // 2. Create Device Pings
        const pings = [
            // Inside Al Qattarah (device_001 visits twice, device_002 visits once)
            { deviceId: "device_001", location: { type: "Point", coordinates: [55.745, 24.260] } },
            { deviceId: "device_002", location: { type: "Point", coordinates: [55.748, 24.258] } },
            { deviceId: "device_001", location: { type: "Point", coordinates: [55.746, 24.259] } }, 
            
            // Outside Al Qattarah (Should NOT be counted)
            { deviceId: "device_003", location: { type: "Point", coordinates: [55.730, 24.250] } }, 

            // Inside Lulu Shopping Mall
            { deviceId: "device_004", location: { type: "Point", coordinates: [55.762, 24.268] } },
            { deviceId: "device_001", location: { type: "Point", coordinates: [55.761, 24.266] } }
        ];

        await DeviceLocation.insertMany(pings);
        console.log(`Inserted ${pings.length} device pings.`);

        console.log("\n--- SEEDING COMPLETE ---");
        console.log(`You can now search using these IDs:`);
        console.log(`Al Qattarah ID: ${alQattarah._id}`);
        console.log(`Lulu Mall ID: ${shoppingMall._id}`);
        
        process.exit(0);
    } catch (error) {
        console.error("Seeding Error:", error);
        process.exit(1);
    }
};

seedDB();
