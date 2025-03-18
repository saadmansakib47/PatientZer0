const mongoose = require("mongoose");
const User = require("./models/User");

async function createTestUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/patientZer0");
    console.log("Connected to MongoDB");

    // Create admin user if it doesn't exist
    const adminExists = await User.findOne({ role: "admin" });
    if (!adminExists) {
      console.log("Creating admin user...");
      const admin = new User({
        name: "Admin User",
        email: "admin@example.com",
        password: "password123",
        role: "admin",
        isActive: true,
      });
      await admin.save();
      console.log("Admin user created successfully:", admin.email);
    } else {
      console.log("Admin user already exists:", adminExists.email);
    }

    // Create doctor with pending verification if it doesn't exist
    const pendingDoctorExists = await User.findOne({
      role: "doctor",
      "additionalInfo.verificationStatus": "pending",
    });

    if (!pendingDoctorExists) {
      console.log("Creating pending doctor user...");
      const pendingDoctor = new User({
        name: "Dr. John Smith",
        email: "doctor_pending@example.com",
        password: "password123",
        role: "doctor",
        additionalInfo: {
          specialization: "Cardiologist",
          bmdcNumber: "BMDC12345",
          verificationStatus: "pending",
          isDoctorVerified: false,
          qualifications: [
            { degree: "MBBS", institution: "Medical University", year: 2010 },
            {
              degree: "MD Cardiology",
              institution: "Cardiac Institute",
              year: 2015,
            },
          ],
          experience: [
            {
              position: "Cardiologist",
              hospital: "General Hospital",
              years: 5,
            },
          ],
          bio: "Experienced cardiologist specializing in preventive cardiac care.",
          consultationFee: 2000,
        },
      });
      await pendingDoctor.save();
      console.log("Pending doctor created successfully:", pendingDoctor.email);
    } else {
      console.log("Pending doctor already exists:", pendingDoctorExists.email);
    }

    // Create approved doctor if it doesn't exist
    const approvedDoctorExists = await User.findOne({
      role: "doctor",
      "additionalInfo.verificationStatus": "approved",
    });

    if (!approvedDoctorExists) {
      console.log("Creating approved doctor user...");
      const approvedDoctor = new User({
        name: "Dr. Sarah Johnson",
        email: "doctor_approved@example.com",
        password: "password123",
        role: "doctor",
        isActive: true,
        additionalInfo: {
          specialization: "Neurologist",
          bmdcNumber: "BMDC54321",
          verificationStatus: "approved",
          isDoctorVerified: true,
          qualifications: [
            { degree: "MBBS", institution: "Medical University", year: 2008 },
            {
              degree: "MD Neurology",
              institution: "Neuroscience Institute",
              year: 2013,
            },
          ],
          experience: [
            { position: "Neurologist", hospital: "City Hospital", years: 8 },
          ],
          bio: "Neurologist with expertise in treating neurological disorders.",
          consultationFee: 2500,
          verificationComments: [
            {
              status: "approved",
              text: "All documents verified successfully",
              date: new Date(),
              adminId: adminExists ? adminExists._id : null,
              adminName: adminExists ? adminExists.name : "Admin",
            },
          ],
        },
      });
      await approvedDoctor.save();
      console.log(
        "Approved doctor created successfully:",
        approvedDoctor.email
      );
    } else {
      console.log(
        "Approved doctor already exists:",
        approvedDoctorExists.email
      );
    }

    // Create patient user if it doesn't exist
    const patientExists = await User.findOne({ role: "patient" });
    if (!patientExists) {
      console.log("Creating patient user...");
      const patient = new User({
        name: "Patient User",
        email: "patient@example.com",
        password: "password123",
        role: "patient",
        isActive: true,
        additionalInfo: {
          age: 35,
          gender: "Male",
          country: "Bangladesh",
          state: "Dhaka",
          medicalHistory: [
            {
              condition: "Hypertension",
              diagnosedDate: new Date("2022-01-15"),
              medications: ["Lisinopril 10mg"],
              notes: "Under control with medication",
            },
          ],
          allergies: ["Penicillin"],
        },
      });
      await patient.save();
      console.log("Patient user created successfully:", patient.email);
    } else {
      console.log("Patient user already exists:", patientExists.email);
    }

    console.log("Test users setup completed!");
  } catch (error) {
    console.error("Error creating test users:", error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

createTestUsers();
