require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Visit = require('../models/Visit');
const LabTest = require('../models/LabTest');

(async () => {
  try {
    await connectDB();

    // Create users
    const [checkerDoctor] = await User.findOrCreate?.({}) || [null];
    const checker = await User.create({ fullName: 'Checker Doc', email: 'checker@example.com', password: 'Password1!', role: 'checkerDoctor' }).catch(async () => await User.findOne({ email: 'checker@example.com' }));
    const labTech = await User.create({ fullName: 'Lab Tech', email: 'lab@example.com', password: 'Password1!', role: 'labTech' }).catch(async () => await User.findOne({ email: 'lab@example.com' }));
    const mainDoctor = await User.create({ fullName: 'Main Doc', email: 'main@example.com', password: 'Password1!', role: 'mainDoctor' }).catch(async () => await User.findOne({ email: 'main@example.com' }));

    // Create patient
    const patient = await Patient.create({
      firstName: 'John',
      lastName: 'Doe',
      gender: 'male',
      age: 35,
      contact: { phone: '555-000-1111' },
      address: '123 Test St'
    }).catch(async () => await Patient.findOne({ 'contact.phone': '555-000-1111' }));

    // Create visit
    const visit = await Visit.create({
      patient: patient._id,
      complaint: 'Fever and cough',
      symptoms: 'Fever, cough',
      status: 'lab_pending',
      paid: true,
      checkerDoctor: checker._id,
      totalCost: 0
    }).catch(async () => await Visit.findOne({ patient: patient._id }).sort({ createdAt: -1 }));

    // Create lab tests
    const tests = await Promise.all([
      LabTest.create({ visit: visit._id, testName: 'CBC', testType: 'blood', cost: 100 }),
      LabTest.create({ visit: visit._id, testName: 'Urinalysis', testType: 'urine', cost: 50 })
    ]);

    await Visit.findByIdAndUpdate(visit._id, {
      labTests: tests.map(t => t._id),
      totalCost: 150
    });

    // Complete lab tests
    for (const t of tests) {
      await LabTest.findByIdAndUpdate(t._id, {
        result: 'Normal',
        notes: 'OK',
        performedBy: labTech._id,
        isCompleted: true,
        completedAt: new Date()
      }, { new: true });
    }

    // Flip visit to lab_done if all completed
    const allForVisit = await LabTest.find({ visit: visit._id });
    if (allForVisit.every(x => x.isCompleted)) {
      await Visit.findByIdAndUpdate(visit._id, { status: 'lab_done' });
    }

    console.log('Seeded main doctor flow successfully.');
    console.log('Main doctor login: main@example.com / Password1!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();



