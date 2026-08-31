const cron = require('node-cron');
const DeviceLocation = require('../models/DeviceLocation');
const Area = require('../models/Area');

// Run every night at midnight
cron.schedule('0 0 * * *', async () => {
    console.log("Running Nightly Geospatial Aggregation Cron Job...");
    try {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const areas = await Area.find({});

        for (const area of areas) {
            const devicesInArea = await DeviceLocation.distinct('deviceId', {
                timestamp: { $gte: yesterday, $lt: today },
                location: {
                    $geoWithin: { $geometry: area.boundary }
                }
            });

            if (devicesInArea.length > 0) {
                console.log(`${devicesInArea.length} unique devices visited ${area.name} yesterday.`);
                // Here you would save to a DailyVisits collection if caching
            }
        }
        console.log("Cron job finished successfully.");
    } catch (error) {
        console.error("Cron job failed:", error);
    }
});
