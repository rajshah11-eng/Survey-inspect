const mongoose = require('mongoose');
require('dotenv').config();
const Area = require('./models/Area');
const fs = require('fs');

const seedDistricts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/geotracker');
        console.log("Connected to MongoDB for district seeding...");

        const dataPath = 'D:/Survey Admin Panel/SurveyApi/data/shapedDistricts.json';
        const fileContent = fs.readFileSync(dataPath, 'utf8');
        const geojson = JSON.parse(fileContent);

        // Clear existing POIs (optional, but requested to use "instead of dummy AREA")
        await Area.deleteMany({});
        console.log("Cleared old Areas.");

        const areasToInsert = geojson.features.map(feature => {
            // Some features might be missing NAMEENGLISH, use NAMEARABIC or a fallback
            const name = feature.properties.NAMEENGLISH || feature.properties.NAMEARABIC || `District ${feature.properties.DISTRICTID}`;
            return {
                name: name,
                boundary: {
                    type: "Polygon",
                    coordinates: feature.geometry.coordinates
                }
            };
        });

        await Area.insertMany(areasToInsert);
        console.log(`Successfully seeded ${areasToInsert.length} districts into MongoDB!`);
        
        process.exit(0);
    } catch (error) {
        console.error("Seeding Error:", error);
        process.exit(1);
    }
};

seedDistricts();
