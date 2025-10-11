const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Patient = require('../models/Patient');
const Medicine = require('../models/Medicine');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('👤 Admin user already exists, skipping user seeding');
      return;
    }

    // Create admin user
    const adminUser = await User.create({
      fullName: 'System Administrator',
      email: 'admin@hospital.com',
      password: 'admin123',
      role: 'admin',
      isActive: true
    });

    // Create sample users for each role
    const sampleUsers = [
      {
        fullName: 'Reception Staff',
        email: 'reception@hospital.com',
        password: 'reception123',
        role: 'reception',
        isActive: true
      },
      {
        fullName: 'Dr. John Checker',
        email: 'checker@hospital.com',
        password: 'checker123',
        role: 'checkerDoctor',
        isActive: true
      },
      {
        fullName: 'Dr. Jane Main',
        email: 'main@hospital.com',
        password: 'main123',
        role: 'mainDoctor',
        isActive: true
      },
      {
        fullName: 'Lab Technician',
        email: 'lab@hospital.com',
        password: 'lab123',
        role: 'labTech',
        isActive: true
      },
      {
        fullName: 'Pharmacy Staff',
        email: 'pharmacy@hospital.com',
        password: 'pharmacy123',
        role: 'pharmacy',
        isActive: true
      }
    ];

    await User.insertMany(sampleUsers);
    console.log('✅ Sample users created successfully');
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
  }
};

const seedMedicines = async () => {
  try {
    // Check if medicines already exist
    const existingMedicines = await Medicine.countDocuments();
    if (existingMedicines > 0) {
      console.log('💊 Medicines already exist, skipping medicine seeding');
      return;
    }

    const sampleMedicines = [
      {
        name: 'Paracetamol 500mg',
        genericName: 'Acetaminophen',
        price: 5.00,
        stock: 100,
        minimumStock: 20,
        description: 'Pain reliever and fever reducer',
        category: 'Analgesic',
        unit: 'tablet',
        manufacturer: 'PharmaCorp',
        isActive: true
      },
      {
        name: 'Amoxicillin 250mg',
        genericName: 'Amoxicillin',
        price: 15.00,
        stock: 50,
        minimumStock: 10,
        description: 'Antibiotic for bacterial infections',
        category: 'Antibiotic',
        unit: 'capsule',
        manufacturer: 'MediPharm',
        isActive: true
      },
      {
        name: 'Ibuprofen 400mg',
        genericName: 'Ibuprofen',
        price: 8.00,
        stock: 75,
        minimumStock: 15,
        description: 'Anti-inflammatory pain reliever',
        category: 'NSAID',
        unit: 'tablet',
        manufacturer: 'HealthPlus',
        isActive: true
      },
      {
        name: 'Omeprazole 20mg',
        genericName: 'Omeprazole',
        price: 12.00,
        stock: 60,
        minimumStock: 10,
        description: 'Proton pump inhibitor for acid reflux',
        category: 'PPI',
        unit: 'capsule',
        manufacturer: 'GastroMed',
        isActive: true
      },
      {
        name: 'Lisinopril 10mg',
        genericName: 'Lisinopril',
        price: 18.00,
        stock: 40,
        minimumStock: 8,
        description: 'ACE inhibitor for hypertension',
        category: 'Antihypertensive',
        unit: 'tablet',
        manufacturer: 'CardioCorp',
        isActive: true
      },
      {
        name: 'Metformin 500mg',
        genericName: 'Metformin',
        price: 14.00,
        stock: 55,
        minimumStock: 12,
        description: 'Antidiabetic medication',
        category: 'Antidiabetic',
        unit: 'tablet',
        manufacturer: 'DiabCare',
        isActive: true
      },
      {
        name: 'Atorvastatin 20mg',
        genericName: 'Atorvastatin',
        price: 22.00,
        stock: 35,
        minimumStock: 8,
        description: 'Statin for cholesterol management',
        category: 'Statin',
        unit: 'tablet',
        manufacturer: 'LipidCorp',
        isActive: true
      },
      {
        name: 'Cough Syrup',
        genericName: 'Dextromethorphan',
        price: 6.00,
        stock: 80,
        minimumStock: 15,
        description: 'Cough suppressant syrup',
        category: 'Expectorant',
        unit: 'bottle',
        manufacturer: 'RespiraCorp',
        isActive: true
      }
    ];

    await Medicine.insertMany(sampleMedicines);
    console.log('✅ Sample medicines created successfully');
  } catch (error) {
    console.error('❌ Error seeding medicines:', error.message);
  }
};

const seedPatients = async () => {
  try {
    // Check if patients already exist
    const existingPatients = await Patient.countDocuments();
    if (existingPatients > 0) {
      console.log('👥 Patients already exist, skipping patient seeding');
      return;
    }

    // Get reception user for registeredBy field
    const receptionUser = await User.findOne({ role: 'reception' });
    if (!receptionUser) {
      console.log('⚠️ Reception user not found, skipping patient seeding');
      return;
    }

    const samplePatients = [
      {
        firstName: 'John',
        lastName: 'Doe',
        gender: 'male',
        age: 35,
        contact: {
          phone: '+1234567890',
          email: 'john.doe@email.com'
        },
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        registeredBy: receptionUser._id
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        gender: 'female',
        age: 28,
        contact: {
          phone: '+1234567891',
          email: 'jane.smith@email.com'
        },
        address: {
          street: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'USA'
        },
        registeredBy: receptionUser._id
      },
      {
        firstName: 'Michael',
        lastName: 'Johnson',
        gender: 'male',
        age: 45,
        contact: {
          phone: '+1234567892',
          email: 'michael.johnson@email.com'
        },
        address: {
          street: '789 Pine St',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'USA'
        },
        registeredBy: receptionUser._id
      },
      {
        firstName: 'Sarah',
        lastName: 'Wilson',
        gender: 'female',
        age: 32,
        contact: {
          phone: '+1234567893',
          email: 'sarah.wilson@email.com'
        },
        address: {
          street: '321 Elm St',
          city: 'Houston',
          state: 'TX',
          zipCode: '77001',
          country: 'USA'
        },
        registeredBy: receptionUser._id
      },
      {
        firstName: 'David',
        lastName: 'Brown',
        gender: 'male',
        age: 52,
        contact: {
          phone: '+1234567894',
          email: 'david.brown@email.com'
        },
        address: {
          street: '654 Maple Ave',
          city: 'Phoenix',
          state: 'AZ',
          zipCode: '85001',
          country: 'USA'
        },
        registeredBy: receptionUser._id
      }
    ];

    await Patient.insertMany(samplePatients);
    console.log('✅ Sample patients created successfully');
  } catch (error) {
    console.error('❌ Error seeding patients:', error.message);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Starting database seeding...');
    
    await seedUsers();
    await seedMedicines();
    await seedPatients();
    
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Default Login Credentials:');
    console.log('👤 Admin: admin@hospital.com / admin123');
    console.log('👤 Reception: reception@hospital.com / reception123');
    console.log('👤 Checker Doctor: checker@hospital.com / checker123');
    console.log('👤 Main Doctor: main@hospital.com / main123');
    console.log('👤 Lab Tech: lab@hospital.com / lab123');
    console.log('👤 Pharmacy: pharmacy@hospital.com / pharmacy123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
