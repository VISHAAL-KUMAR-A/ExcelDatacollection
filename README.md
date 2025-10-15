# DataCollections - MERN Stack Application

A full-stack MERN application for uploading Excel/CSV files, managing sales data, and displaying it with advanced filtering, pagination, and analytics capabilities.

## 📋 Overview

DataCollections is a powerful data management system designed to handle large datasets with ease. The application allows users to upload Excel or CSV files, automatically parses and stores the data in MongoDB, and provides a modern, responsive interface with advanced features like multi-select filtering, pagination, data consolidation, and real-time totals calculation.

## ✨ Features

### Frontend Features
- ✅ **Excel/CSV File Upload** - Support for `.xlsx`, `.xls`, and CSV file formats
- ✅ **Advanced Multi-Select Filtering** - Filter by categories, branches, and suppliers
- ✅ **Pagination** - Efficient data loading with customizable page sizes (50, 100, 200, 500 records)
- ✅ **Real-Time Totals** - Automatic calculation of numeric field totals based on filters
- ✅ **Responsive Table View** - Beautiful, modern UI with gradient design
- ✅ **Error Handling** - User-friendly error messages and loading states
- ✅ **Data Export** - View and analyze data with dynamic column display

### Backend Features
- ✅ **RESTful API** - Well-structured API endpoints for data operations
- ✅ **Batch Processing** - Efficient handling of large datasets (1000+ records)
- ✅ **Data Consolidation** - Built-in script to merge duplicate records
- ✅ **CSV Import Utility** - Command-line tool for direct CSV imports
- ✅ **MongoDB Integration** - Optimized database connections with pooling
- ✅ **CORS Support** - Cross-origin resource sharing enabled
- ✅ **Dynamic Schema** - Supports any column structure from uploaded files

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React with modern hooks
- **Vite 7** - Lightning-fast build tool and dev server
- **Axios** - Promise-based HTTP client
- **Modern CSS** - Gradient designs, animations, and responsive layouts

### Backend
- **Node.js** - JavaScript runtime
- **Express 4** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose 8** - MongoDB object modeling
- **Multer** - File upload middleware
- **XLSX** - Excel file parsing
- **CSV Parser** - CSV file processing

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn package manager

### Backend Setup

1. **Navigate to the Backend folder:**
   ```bash
   cd Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the Backend directory with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   ```

4. **Start the backend server:**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```
   
   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to the Frontend folder:**
   ```bash
   cd Frontend/my-react-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The frontend will run on `http://localhost:5173` (or another port shown in terminal)

### Alternative: Run Both Servers
Open two terminal windows and run each server separately:

**Terminal 1 (Backend):**
```bash
cd Backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd Frontend/my-react-app
npm run dev
```

## 📖 Usage Guide

### Uploading Data

1. Start both backend and frontend servers
2. Open the frontend in your browser (`http://localhost:5173`)
3. Click the **"Choose File"** button and select an Excel or CSV file
4. Click **"Upload & Replace Data"** button
5. The existing data will be cleared and new data will be uploaded
6. Data will automatically load with default filters applied

### Filtering Data

- Use the **Category**, **Branch**, and **Supplier** dropdown filters
- Select/deselect specific items to filter the data
- Click **"Select All"** or **"Deselect All"** for quick actions
- Data and totals update automatically when filters change

### Pagination

- Use the **Page Size** dropdown to change records per page (50, 100, 200, 500)
- Navigate through pages using **Previous** and **Next** buttons
- Current page and total pages displayed at the top

### Viewing Totals

- Real-time totals displayed in a summary card:
  - **Net Sales Quantity**
  - **Net Amount**
  - **Net Sales Cost Value**
  - **Sales Extended Cost Value**
- Totals automatically recalculate based on active filters

## 🗂️ Project Structure

```
DataCollections/
├── Backend/
│   ├── models/
│   │   └── Data.js                 # Mongoose data model
│   ├── routes/
│   │   └── dataRoutes.js           # API route handlers
│   ├── consolidateData.js          # Data consolidation utility
│   ├── importData.js               # CSV import utility
│   ├── server.js                   # Express server configuration
│   ├── package.json
│   └── .env                        # Environment variables
├── Frontend/
│   └── my-react-app/
│       ├── src/
│       │   ├── App.jsx             # Main React component
│       │   ├── App.css             # Application styles
│       │   ├── main.jsx            # React entry point
│       │   └── assets/             # Static assets
│       ├── public/
│       ├── index.html
│       ├── vite.config.js
│       └── package.json
├── data-mb.csv                     # Sample CSV data file
└── README.md                       # This file
```

## 📡 API Endpoints

### Data Management
- **POST** `/api/upload` - Upload Excel/CSV file and replace all data
  - Accepts: multipart/form-data with file field
  - Returns: Success message and record count
  
- **GET** `/api/data` - Get paginated data with filters
  - Query params: `page`, `limit`, `categories`, `branches`, `suppliers`
  - Returns: Data array and pagination metadata
  
- **DELETE** `/api/data` - Clear all data from database
  - Returns: Success confirmation message

### Filters & Analytics
- **GET** `/api/filters` - Get unique filter values
  - Returns: Arrays of unique categories, branches, and suppliers
  
- **GET** `/api/totals` - Get aggregated totals with filters
  - Query params: `categories`, `branches`, `suppliers`
  - Returns: Summed totals for numeric fields

### Health Check
- **GET** `/` - Server health check
  - Returns: API status message

## 🔧 Utility Scripts

### Data Consolidation
Merge duplicate records based on category, branch, supplier, and article:

```bash
cd Backend
npm run consolidate
```

This script will:
- Group records by CategoryShortName, branch, SupplierAlias, and ArticleNo
- Sum numeric fields (NetSlsQty, NetAmount, NetSlsCostValue, SlsExtCostValue)
- Remove duplicate entries
- Display consolidation statistics

### CSV Import
Directly import CSV files into the database:

```bash
cd Backend
npm run import
```

Make sure to update the CSV file path in `importData.js` before running.

## 🗄️ MongoDB Configuration

The application connects to MongoDB Atlas by default. Connection settings:
- **Database Name**: `agentManagement`
- **Collection**: Dynamic (based on Data model)
- **Connection Pooling**: Enabled (min: 2, max: 10)
- **Timeout Settings**: Optimized for large operations

### Connection Options
```javascript
{
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 75000,
  maxPoolSize: 10,
  minPoolSize: 2
}
```

## 📊 Data Schema

The application uses a flexible schema that adapts to your Excel/CSV columns. Common fields include:

- `CategoryShortName` - Product category
- `branch` - Branch/location identifier
- `SupplierAlias` - Supplier name/code
- `ArticleNo` - Product article number
- `NetSlsQty` - Net sales quantity (numeric)
- `NetAmount` - Net amount (numeric)
- `NetSlsCostValue` - Net sales cost value (numeric)
- `SlsExtCostValue` - Sales extended cost value (numeric)

## 🎨 UI Features

- **Modern Gradient Design** - Beautiful purple-to-blue gradient theme
- **Responsive Layout** - Works on desktop, tablet, and mobile devices
- **Loading States** - Visual feedback during data operations
- **Error Messages** - Clear, user-friendly error notifications
- **Smooth Animations** - Enhanced user experience with transitions
- **Accessibility** - Keyboard navigation and screen reader support

## 🔒 Security Features

- File type validation (only Excel and CSV files accepted)
- CORS configuration for secure cross-origin requests
- Error handling middleware to prevent information leakage
- Environment variable usage for sensitive credentials

## 📝 Notes

- Each Excel/CSV upload completely replaces existing database data
- The application supports dynamic Excel schemas (any column structure)
- Batch processing ensures efficient handling of large datasets
- Pagination prevents memory issues with large data sets
- Filters operate on the backend for optimal performance

## 🐛 Troubleshooting

### Backend won't start
- Check MongoDB connection string in `.env` file
- Ensure MongoDB Atlas IP whitelist includes your IP
- Verify port 5000 is not in use by another application

### Frontend can't connect to backend
- Confirm backend is running on port 5000
- Check CORS configuration in `server.js`
- Verify API_URL in `App.jsx` matches backend address

### File upload fails
- Ensure file is Excel (.xlsx, .xls) or CSV format
- Check file size (large files may need timeout adjustments)
- Verify MongoDB connection is stable

### Data not displaying
- Check browser console for errors
- Verify data was successfully uploaded to MongoDB
- Ensure filters are not excluding all records

## 🚀 Future Enhancements

- [ ] Data export to Excel/CSV
- [ ] Advanced search and sorting capabilities
- [ ] User authentication and authorization
- [ ] Data visualization with charts and graphs
- [ ] Scheduled data imports
- [ ] Audit logs and version history
- [ ] Multi-language support
- [ ] Dark mode theme

## 📄 License

ISC

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue in the project repository.

