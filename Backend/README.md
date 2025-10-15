# DataCollections Backend

This is the backend server for the DataCollections application built with Express and MongoDB.

## Setup

1. Install dependencies:
```bash
npm install
```

2. The `.env` file is already configured with MongoDB connection details.

3. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Upload Excel File
- **POST** `/api/upload`
- Upload an Excel file and replace all existing data
- Accepts: `.xlsx`, `.xls` files
- Clears existing database before inserting new data

### Get All Data
- **GET** `/api/data`
- Retrieve all records from the database

### Delete All Data
- **DELETE** `/api/data`
- Clear all records from the database

## Features

- ✅ MongoDB integration with Mongoose
- ✅ Excel file parsing (XLSX format)
- ✅ Automatic data clearing on upload
- ✅ CORS enabled for frontend communication
- ✅ Error handling middleware
- ✅ Dynamic schema for flexible Excel structures

