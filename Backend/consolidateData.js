import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Data from './models/Data.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 75000,
})
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

async function consolidateData() {
  try {
    console.log('🔄 Starting data consolidation process...');
    
    // Fetch all data from the database
    console.log('📥 Fetching all records from database...');
    const allData = await Data.find({}).lean();
    console.log(`✅ Fetched ${allData.length} records`);
    
    if (allData.length === 0) {
      console.log('⚠️ No data found in database. Nothing to consolidate.');
      process.exit(0);
    }

    // Group data by CategoryShortName, branch, SupplierAlias, and ArticleNo
    console.log('🔍 Grouping records by category, branch, supplier, and article...');
    const groupedData = {};
    
    allData.forEach((record) => {
      // Create a composite key using category, branch, supplier, and article
      const key = `${record.CategoryShortName}|||${record.branch}|||${record.SupplierAlias}|||${record.ArticleNo}`;
      
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(record);
    });

    console.log(`✅ Found ${Object.keys(groupedData).length} unique combinations`);

    // Consolidate groups where there are duplicates
    console.log('🔧 Consolidating duplicate entries...');
    const consolidatedRecords = [];
    let duplicatesFound = 0;
    
    Object.entries(groupedData).forEach(([key, records]) => {
      if (records.length > 1) {
        // Multiple records with same category, branch, supplier, and article
        // Consolidate them into a single record
        duplicatesFound += records.length - 1;
        
        // Use the first record as the base
        const consolidatedRecord = { ...records[0] };
        
        // Sum up the numeric fields
        consolidatedRecord.NetSlsQty = 0;
        consolidatedRecord.NetAmount = 0;
        consolidatedRecord.NetSlsCostValue = 0;
        consolidatedRecord.SlsExtCostValue = 0;
        
        records.forEach((record) => {
          consolidatedRecord.NetSlsQty += parseFloat(record.NetSlsQty) || 0;
          consolidatedRecord.NetAmount += parseFloat(record.NetAmount) || 0;
          consolidatedRecord.NetSlsCostValue += parseFloat(record.NetSlsCostValue) || 0;
          consolidatedRecord.SlsExtCostValue += parseFloat(record.SlsExtCostValue) || 0;
        });
        
        // Remove the _id field so MongoDB will generate a new one
        delete consolidatedRecord._id;
        delete consolidatedRecord.__v;
        delete consolidatedRecord.createdAt;
        delete consolidatedRecord.updatedAt;
        
        consolidatedRecords.push(consolidatedRecord);
      } else {
        // Single record - keep as is
        const singleRecord = { ...records[0] };
        delete singleRecord._id;
        delete singleRecord.__v;
        delete singleRecord.createdAt;
        delete singleRecord.updatedAt;
        
        consolidatedRecords.push(singleRecord);
      }
    });

    console.log(`✅ Consolidated ${duplicatesFound} duplicate records`);
    console.log(`📊 Final record count: ${consolidatedRecords.length} (was ${allData.length})`);

    if (duplicatesFound === 0) {
      console.log('⚠️ No duplicates found. Database is already consolidated.');
      process.exit(0);
    }

    // Clear existing data and insert consolidated data
    console.log('🗑️ Clearing existing data from database...');
    await Data.deleteMany({});
    console.log('✅ Existing data cleared');

    console.log('💾 Inserting consolidated data...');
    const BATCH_SIZE = 1000;
    let insertedCount = 0;
    
    for (let i = 0; i < consolidatedRecords.length; i += BATCH_SIZE) {
      const batch = consolidatedRecords.slice(i, i + BATCH_SIZE);
      await Data.insertMany(batch, { ordered: false });
      insertedCount += batch.length;
      console.log(`   Inserted ${insertedCount} / ${consolidatedRecords.length} records`);
    }

    console.log('✅ Data consolidation completed successfully!');
    console.log(`📈 Summary:`);
    console.log(`   - Original records: ${allData.length}`);
    console.log(`   - Consolidated records: ${consolidatedRecords.length}`);
    console.log(`   - Records merged: ${duplicatesFound}`);
    console.log(`   - Space saved: ${((duplicatesFound / allData.length) * 100).toFixed(2)}%`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error consolidating data:', error);
    process.exit(1);
  }
}

// Run the consolidation
consolidateData();

