import mongoose from 'mongoose';
import fs from 'fs';
import csv from 'csv-parser';
import dotenv from 'dotenv';
import Data from './models/Data.js';

dotenv.config();

const importCSVData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 75000,
      maxPoolSize: 10,
      minPoolSize: 2
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Data.deleteMany({});
    console.log('🗑️  Cleared existing data');

    const records = [];
    const csvFilePath = '../data-mb.csv'; // Adjust path as needed

    // Read CSV file
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        records.push(row);
      })
      .on('end', async () => {
        console.log(`📄 CSV file read successfully. Total records: ${records.length}`);

        // Insert data in batches
        const BATCH_SIZE = 1000;
        let insertedCount = 0;

        for (let i = 0; i < records.length; i += BATCH_SIZE) {
          const batch = records.slice(i, i + BATCH_SIZE);
          await Data.insertMany(batch, { ordered: false });
          insertedCount += batch.length;
          console.log(`✅ Inserted ${insertedCount} / ${records.length} records`);
        }

        console.log(`🎉 Successfully imported all ${insertedCount} records!`);
        mongoose.connection.close();
        process.exit(0);
      })
      .on('error', (error) => {
        console.error('❌ Error reading CSV:', error);
        mongoose.connection.close();
        process.exit(1);
      });
  } catch (error) {
    console.error('❌ Error:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

importCSVData();

