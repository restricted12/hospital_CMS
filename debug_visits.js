// Debug script to check visits in database
// Run this with: node debug_visits.js

const mongoose = require('mongoose');
require('dotenv').config();

// Visit schema (simplified)
const visitSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  visitDate: { type: Date, default: Date.now },
  complaint: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['registered', 'checked', 'lab_pending', 'lab_done', 'diagnosed', 'done'],
    default: 'registered' 
  },
  paid: { type: Boolean, default: false },
  checkerDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Visit = mongoose.model('Visit', visitSchema);

async function debugVisits() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_cms');
    console.log('Connected to database');

    // Get all visits
    const allVisits = await Visit.find({}).populate('patient', 'firstName lastName age gender');
    console.log(`\nTotal visits in database: ${allVisits.length}`);
    
    if (allVisits.length > 0) {
      console.log('\nAll visits:');
      allVisits.forEach((visit, index) => {
        console.log(`${index + 1}. Visit ID: ${visit._id}`);
        console.log(`   Patient: ${visit.patient?.firstName} ${visit.patient?.lastName}`);
        console.log(`   Status: ${visit.status}`);
        console.log(`   Paid: ${visit.paid}`);
        console.log(`   Visit Date: ${visit.visitDate}`);
        console.log(`   Complaint: ${visit.complaint?.substring(0, 50)}...`);
        console.log('---');
      });
    }

    // Get visits that should appear in checker doctor dashboard
    const pendingVisits = await Visit.find({
      status: 'registered',
      paid: true
    }).populate('patient', 'firstName lastName age gender');
    
    console.log(`\nVisits that should appear in Checker Doctor Dashboard (status='registered' AND paid=true): ${pendingVisits.length}`);
    
    if (pendingVisits.length > 0) {
      console.log('\nPending visits for checker doctor:');
      pendingVisits.forEach((visit, index) => {
        console.log(`${index + 1}. Visit ID: ${visit._id}`);
        console.log(`   Patient: ${visit.patient?.firstName} ${visit.patient?.lastName}`);
        console.log(`   Status: ${visit.status}`);
        console.log(`   Paid: ${visit.paid}`);
        console.log(`   Visit Date: ${visit.visitDate}`);
        console.log(`   Complaint: ${visit.complaint?.substring(0, 50)}...`);
        console.log('---');
      });
    } else {
      console.log('\nNo visits found that meet the criteria for checker doctor dashboard.');
      console.log('This means either:');
      console.log('1. No visits have been created yet');
      console.log('2. No visits have been marked as paid=true');
      console.log('3. All visits have a status other than "registered"');
    }

    // Check visits by status
    const statusCounts = await Visit.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    console.log('\nVisits by status:');
    statusCounts.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count}`);
    });

    // Check paid vs unpaid visits
    const paidCounts = await Visit.aggregate([
      { $group: { _id: '$paid', count: { $sum: 1 } } }
    ]);
    console.log('\nVisits by payment status:');
    paidCounts.forEach(stat => {
      console.log(`   Paid: ${stat._id} - Count: ${stat.count}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from database');
  }
}

debugVisits();
