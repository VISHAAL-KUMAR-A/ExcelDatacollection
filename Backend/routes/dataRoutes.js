import express from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import Data from '../models/Data.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel files are allowed.'));
    }
  }
});

// Upload Excel file and replace existing data
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Parse Excel file
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      return res.status(400).json({ message: 'Excel file is empty' });
    }

    // Clear existing data in the database
    await Data.deleteMany({});
    console.log('Existing data cleared from database');

    // Insert new data in batches to avoid connection timeout
    const BATCH_SIZE = 1000;
    let insertedCount = 0;
    
    for (let i = 0; i < jsonData.length; i += BATCH_SIZE) {
      const batch = jsonData.slice(i, i + BATCH_SIZE);
      await Data.insertMany(batch, { ordered: false });
      insertedCount += batch.length;
      console.log(`Inserted ${insertedCount} / ${jsonData.length} records`);
    }
    
    console.log(`Successfully inserted all ${insertedCount} records`);
    
    res.status(200).json({
      message: 'File uploaded successfully and data replaced',
      recordsCount: insertedCount
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

// Get unique filter values
router.get('/filters', async (req, res) => {
  try {
    const [categories, branches, suppliers] = await Promise.all([
      Data.distinct('CategoryShortName'),
      Data.distinct('branch'),
      Data.distinct('SupplierAlias')
    ]);

    res.status(200).json({
      success: true,
      filters: {
        categories: categories.filter(v => v !== null && v !== undefined).sort(),
        branches: branches.filter(v => v !== null && v !== undefined).sort(),
        suppliers: suppliers.filter(v => v !== null && v !== undefined).sort()
      }
    });
  } catch (error) {
    console.error('Error fetching filters:', error);
    res.status(500).json({ message: 'Error fetching filters', error: error.message });
  }
});

// Get paginated data
router.get('/data', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    // Build filter query
    const filterQuery = {};
    
    // Parse filter parameters from query string
    if (req.query.categories) {
      const categories = JSON.parse(req.query.categories);
      if (categories.length > 0) {
        filterQuery.CategoryShortName = { $in: categories };
      }
    }
    
    if (req.query.branches) {
      const branches = JSON.parse(req.query.branches);
      if (branches.length > 0) {
        filterQuery.branch = { $in: branches };
      }
    }
    
    if (req.query.suppliers) {
      const suppliers = JSON.parse(req.query.suppliers);
      if (suppliers.length > 0) {
        filterQuery.SupplierAlias = { $in: suppliers };
      }
    }

    // Get total count for pagination with filters
    const totalCount = await Data.countDocuments(filterQuery);
    
    // Get paginated data with filters
    const data = await Data.find(filterQuery)
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      data: data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        pageSize: limit,
        totalRecords: totalCount,
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Error fetching data', error: error.message });
  }
});

// Clear all data
router.delete('/data', async (req, res) => {
  try {
    await Data.deleteMany({});
    res.status(200).json({ message: 'All data cleared successfully' });
  } catch (error) {
    console.error('Error clearing data:', error);
    res.status(500).json({ message: 'Error clearing data', error: error.message });
  }
});

// Get totals for numeric fields
router.get('/totals', async (req, res) => {
  try {
    // Build filter query
    const filterQuery = {};
    
    // Parse filter parameters from query string
    if (req.query.categories) {
      const categories = JSON.parse(req.query.categories);
      if (categories.length > 0) {
        filterQuery.CategoryShortName = { $in: categories };
      }
    }
    
    if (req.query.branches) {
      const branches = JSON.parse(req.query.branches);
      if (branches.length > 0) {
        filterQuery.branch = { $in: branches };
      }
    }
    
    if (req.query.suppliers) {
      const suppliers = JSON.parse(req.query.suppliers);
      if (suppliers.length > 0) {
        filterQuery.SupplierAlias = { $in: suppliers };
      }
    }

    // Aggregate to calculate totals
    const result = await Data.aggregate([
      { $match: filterQuery },
      {
        $group: {
          _id: null,
          totalNetSlsQty: { $sum: { $toDouble: { $ifNull: ["$NetSlsQty", 0] } } },
          totalNetAmount: { $sum: { $toDouble: { $ifNull: ["$NetAmount", 0] } } },
          totalNetSlsCostValue: { $sum: { $toDouble: { $ifNull: ["$NetSlsCostValue", 0] } } },
          totalSlsExtCostValue: { $sum: { $toDouble: { $ifNull: ["$SlsExtCostValue", 0] } } }
        }
      }
    ]);

    const totals = result.length > 0 ? {
      totalNetSlsQty: result[0].totalNetSlsQty || 0,
      totalNetAmount: result[0].totalNetAmount || 0,
      totalNetSlsCostValue: result[0].totalNetSlsCostValue || 0,
      totalSlsExtCostValue: result[0].totalSlsExtCostValue || 0
    } : {
      totalNetSlsQty: 0,
      totalNetAmount: 0,
      totalNetSlsCostValue: 0,
      totalSlsExtCostValue: 0
    };

    res.status(200).json({
      success: true,
      totals: totals
    });
  } catch (error) {
    console.error('Error fetching totals:', error);
    res.status(500).json({ message: 'Error fetching totals', error: error.message });
  }
});

export default router;

