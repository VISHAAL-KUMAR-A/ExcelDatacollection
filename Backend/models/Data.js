import mongoose from 'mongoose';

const dataSchema = new mongoose.Schema({
  // Dynamic schema to accommodate any Excel structure
  // We'll store all columns as flexible fields
}, { 
  strict: false, 
  timestamps: true 
});

const Data = mongoose.model('Data', dataSchema);

export default Data;

