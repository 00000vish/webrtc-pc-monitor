let mongoose = require('mongoose');

let machineSchema = new mongoose.Schema({
    id: {
      type: String,      
      required: true
    },
    ip: {
      type: String,      
      required: true
    }
  })
  
module.exports = mongoose.model('machine', machineSchema)