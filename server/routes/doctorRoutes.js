const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { authenticateJWT } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const Prescription = require("../models/Prescription");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "server/uploads/doctor-documents/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, PNG and PDF files are allowed."
        )
      );
    }
  },
});

// Doctor registration route
router.post(
  "/register",
  (req, res, next) => {
    console.log("Doctor registration request received");
    console.log(
      "Authorization header:",
      req.headers.authorization ? "Exists" : "Missing"
    );
    authenticateJWT(req, res, next);
  },
  upload.fields([
    { name: "bmdcCertificate", maxCount: 1 },
    { name: "degreeCertificate", maxCount: 1 },
    { name: "chamberPhoto", maxCount: 1 },
    { name: "otherCertificates", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      console.log("Authentication successful, processing registration");
      const userId = req.user._id;
      console.log("User ID from token:", userId);

      const user = await User.findById(userId);

      if (!user) {
        console.log("User not found with ID:", userId);
        return res.status(404).json({ error: "User not found" });
      }

      // Update user role to doctor if not already
      if (user.role !== "doctor") {
        console.log("Setting user role to doctor");
        user.role = "doctor";
      }

      // Set account status to inactive until admin approves
      user.isActive = false;

      const {
        hospitalName,
        chamberAddress,
        bmdcNumber,
        specialization,
        subSpecialization,
        qualification,
        experience,
        consultationFee,
        availableTimeSlots,
        emergencyContact,
        services,
        languages,
        bio,
      } = req.body;

      // Handle file uploads with better error handling
      const documents = {};

      // Only add file paths if they exist
      if (
        req.files &&
        req.files["bmdcCertificate"] &&
        req.files["bmdcCertificate"][0]
      ) {
        documents.bmdcCertificate = req.files["bmdcCertificate"][0].path;
      }

      if (
        req.files &&
        req.files["degreeCertificate"] &&
        req.files["degreeCertificate"][0]
      ) {
        documents.degreeCertificate = req.files["degreeCertificate"][0].path;
      }

      if (
        req.files &&
        req.files["chamberPhoto"] &&
        req.files["chamberPhoto"][0]
      ) {
        documents.chamberPhoto = req.files["chamberPhoto"][0].path;
      }

      if (req.files && req.files["otherCertificates"]) {
        documents.otherCertificates = req.files["otherCertificates"].map(
          (file) => file.path
        );
      } else {
        documents.otherCertificates = [];
      }

      try {
        // Parse JSON fields or use defaults if parsing fails
        const parsedQualification = qualification
          ? JSON.parse(qualification)
          : [{ degree: "MBBS", institution: "Medical College", year: "2015" }];

        const parsedExperience = experience
          ? JSON.parse(experience)
          : { years: "5", details: "General practice" };

        const parsedTimeSlots = availableTimeSlots
          ? JSON.parse(availableTimeSlots)
          : [
              {
                day: "Monday",
                startTime: "09:00",
                endTime: "17:00",
                isAvailable: true,
              },
            ];

        const parsedEmergencyContact = emergencyContact
          ? JSON.parse(emergencyContact)
          : {
              name: "Emergency Contact",
              phone: "123-456-7890",
              relationship: "Colleague",
            };

        const parsedServices = services
          ? JSON.parse(services)
          : ["General Checkup", "Prescription"];

        const parsedLanguages = languages ? JSON.parse(languages) : ["English"];

        // Update user with doctor information
        user.additionalInfo = {
          ...user.additionalInfo,
          hospitalName: hospitalName || "General Hospital",
          chamberAddress: chamberAddress || "Address to be updated",
          bmdcNumber: bmdcNumber || "BMDC-12345",
          specialization: specialization || "General Physician",
          subSpecialization: subSpecialization || "",
          qualification: parsedQualification,
          experience: parsedExperience,
          consultationFee: consultationFee || "500",
          availableTimeSlots: parsedTimeSlots,
          documents,
          emergencyContact: parsedEmergencyContact,
          services: parsedServices,
          languages: parsedLanguages,
          bio: bio || `Doctor profile to be updated`,
          verificationStatus: "pending",
          isDoctorVerified: false,
          registrationDate: new Date(),
          verificationComments: [],
        };

        await user.save();
        res.status(200).json({
          message:
            "Doctor registration completed successfully. Your account is pending admin approval.",
        });
      } catch (parseError) {
        console.error("Error parsing JSON fields:", parseError);
        return res.status(400).json({
          error: "Invalid JSON data in form fields. " + parseError.message,
        });
      }
    } catch (error) {
      console.error("Error in doctor registration:", error);
      res.status(500).json({
        error: "An error occurred during doctor registration. " + error.message,
      });
    }
  }
);

// Register route - No auth required
router.post("/public-register", async (req, res) => {
  try {
    console.log("Doctor registration request received");

    // Extract basic user data from request
    const { name, email, password, ...doctorData } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create new user without password hashing - mongoose middleware will handle it
    const newUser = new User({
      name,
      email,
      password, // Plain password will be hashed by middleware
      role: "doctor",
      isActive: false,
    });

    // Extract and parse doctor-specific fields
    try {
      // Parse JSON fields if provided as strings
      if (
        doctorData.qualifications &&
        typeof doctorData.qualifications === "string"
      ) {
        doctorData.qualifications = JSON.parse(doctorData.qualifications);
      }

      if (doctorData.experience && typeof doctorData.experience === "string") {
        doctorData.experience = JSON.parse(doctorData.experience);
      }

      if (
        doctorData.availableTimeSlots &&
        typeof doctorData.availableTimeSlots === "string"
      ) {
        doctorData.availableTimeSlots = JSON.parse(
          doctorData.availableTimeSlots
        );
      }

      if (
        doctorData.emergencyContact &&
        typeof doctorData.emergencyContact === "string"
      ) {
        doctorData.emergencyContact = JSON.parse(doctorData.emergencyContact);
      }

      if (doctorData.services && typeof doctorData.services === "string") {
        doctorData.services = JSON.parse(doctorData.services);
      }

      if (doctorData.languages && typeof doctorData.languages === "string") {
        doctorData.languages = JSON.parse(doctorData.languages);
      }
    } catch (error) {
      console.error("Error parsing JSON fields:", error);
      // Continue with original values if parsing fails
    }

    // Set doctor-specific fields
    newUser.additionalInfo = {
      ...doctorData,
      verificationStatus: "pending",
      isDoctorVerified: false,
    };

    // Save the user to trigger password hashing middleware
    await newUser.save();

    // Create token for immediate login
    const token = jwt.sign(
      {
        _id: newUser._id,
        name: newUser.name,
        role: newUser.role,
        email: newUser.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message:
        "Doctor registered successfully. Your account is pending admin approval.",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error registering doctor:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get doctor profile
router.get("/profile", authenticateJWT, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user || user.role !== "doctor") {
      return res.status(404).json({ error: "Doctor profile not found" });
    }

    res.status(200).json({
      name: user.name,
      email: user.email,
      profilePhoto: user.profilePhoto,
      additionalInfo: user.additionalInfo,
    });
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the profile" });
  }
});

// Update doctor profile
router.put(
  "/profile",
  authenticateJWT,
  upload.fields([
    { name: "chamberPhoto", maxCount: 1 },
    { name: "otherCertificates", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId);

      if (!user || user.role !== "doctor") {
        return res.status(404).json({ error: "Doctor profile not found" });
      }

      const updateData = req.body;

      // Handle file uploads if any
      if (req.files) {
        if (req.files["chamberPhoto"]) {
          updateData.chamberPhoto = req.files["chamberPhoto"][0].path;
        }
        if (req.files["otherCertificates"]) {
          updateData.otherCertificates = req.files["otherCertificates"].map(
            (file) => file.path
          );
        }
      }

      // Update the profile
      Object.assign(user.additionalInfo, updateData);
      await user.save();

      res.status(200).json({ message: "Doctor profile updated successfully" });
    } catch (error) {
      console.error("Error updating doctor profile:", error);
      res
        .status(500)
        .json({ error: "An error occurred while updating the profile" });
    }
  }
);

// Get all verified doctors (public route)
router.get("/verified-doctors", async (req, res) => {
  try {
    const { specialization, location } = req.query;
    const query = {
      role: "doctor",
      "additionalInfo.isDoctorVerified": true,
      "additionalInfo.verificationStatus": "approved",
    };

    if (specialization) {
      query["additionalInfo.specialization"] = specialization;
    }

    if (location) {
      query["additionalInfo.chamberAddress"] = {
        $regex: location,
        $options: "i",
      };
    }

    const doctors = await User.find(query)
      .select("name profilePhoto additionalInfo")
      .limit(20);

    res.status(200).json(doctors);
  } catch (error) {
    console.error("Error fetching verified doctors:", error);
    res.status(500).json({ error: "An error occurred while fetching doctors" });
  }
});

// Get all patients for a doctor (patients who have had prescriptions from this doctor)
router.get("/patients", authenticateJWT, async (req, res) => {
  try {
    const doctorId = req.user._id;

    // Get unique patients who have prescriptions from this doctor
    const prescriptions = await Prescription.find({ doctor: doctorId })
      .populate("patient", "name email profilePhoto")
      .select("patient");

    // Extract unique patients using Set and map
    const uniquePatientIds = new Set();
    const patients = prescriptions
      .filter((prescription) => {
        const isDuplicate = uniquePatientIds.has(
          prescription.patient._id.toString()
        );
        uniquePatientIds.add(prescription.patient._id.toString());
        return !isDuplicate;
      })
      .map((prescription) => prescription.patient);

    // If no patients found through prescriptions, return empty array
    if (patients.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

// Get all prescriptions for a doctor
router.get("/prescriptions", authenticateJWT, async (req, res) => {
  try {
    const doctorId = req.user._id;

    const prescriptions = await Prescription.find({ doctor: doctorId })
      .populate("patient", "name email profilePhoto")
      .sort({ createdAt: -1 });

    res.status(200).json(prescriptions);
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    res.status(500).json({ error: "Failed to fetch prescriptions" });
  }
});

// Get a specific prescription
router.get("/prescriptions/:id", authenticateJWT, async (req, res) => {
  try {
    const doctorId = req.user._id;
    const prescriptionId = req.params.id;

    const prescription = await Prescription.findOne({
      _id: prescriptionId,
      doctor: doctorId,
    }).populate("patient", "name email profilePhoto");

    if (!prescription) {
      return res.status(404).json({ error: "Prescription not found" });
    }

    res.status(200).json(prescription);
  } catch (error) {
    console.error("Error fetching prescription:", error);
    res.status(500).json({ error: "Failed to fetch prescription" });
  }
});

// Create a new prescription
router.post("/prescriptions", authenticateJWT, async (req, res) => {
  try {
    const doctorId = req.user._id;
    const { patientId, diagnosis, notes, medications } = req.body;

    const newPrescription = new Prescription({
      doctor: doctorId,
      patient: patientId,
      diagnosis,
      notes,
      medications,
    });

    await newPrescription.save();

    const populatedPrescription = await Prescription.findById(
      newPrescription._id
    ).populate("patient", "name email profilePhoto");

    res.status(201).json(populatedPrescription);
  } catch (error) {
    console.error("Error creating prescription:", error);
    res.status(500).json({ error: "Failed to create prescription" });
  }
});

// Update a prescription
router.put("/prescriptions/:id", authenticateJWT, async (req, res) => {
  try {
    const doctorId = req.user._id;
    const prescriptionId = req.params.id;
    const { patientId, diagnosis, notes, medications } = req.body;

    const prescription = await Prescription.findOne({
      _id: prescriptionId,
      doctor: doctorId,
    });

    if (!prescription) {
      return res.status(404).json({ error: "Prescription not found" });
    }

    prescription.patient = patientId;
    prescription.diagnosis = diagnosis;
    prescription.notes = notes;
    prescription.medications = medications;

    await prescription.save();

    const updatedPrescription = await Prescription.findById(
      prescription._id
    ).populate("patient", "name email profilePhoto");

    res.status(200).json(updatedPrescription);
  } catch (error) {
    console.error("Error updating prescription:", error);
    res.status(500).json({ error: "Failed to update prescription" });
  }
});

// Delete a prescription
router.delete("/prescriptions/:id", authenticateJWT, async (req, res) => {
  try {
    const doctorId = req.user._id;
    const prescriptionId = req.params.id;

    const result = await Prescription.findOneAndDelete({
      _id: prescriptionId,
      doctor: doctorId,
    });

    if (!result) {
      return res.status(404).json({ error: "Prescription not found" });
    }

    res.status(200).json({ message: "Prescription deleted successfully" });
  } catch (error) {
    console.error("Error deleting prescription:", error);
    res.status(500).json({ error: "Failed to delete prescription" });
  }
});

// Generate and view a prescription as PDF
router.get("/prescriptions/:id/pdf", authenticateJWT, async (req, res) => {
  try {
    const prescriptionId = req.params.id;

    const prescription = await Prescription.findById(prescriptionId)
      .populate("doctor", "name additionalInfo")
      .populate("patient", "name email");

    if (!prescription) {
      return res.status(404).json({ error: "Prescription not found" });
    }

    // Set up PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers for inline viewing
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="prescription-${prescriptionId}.pdf"`
    );

    // Pipe PDF to response
    doc.pipe(res);

    // Add content to PDF
    const doctor = prescription.doctor;
    const specialization =
      doctor.additionalInfo?.specialization || "General Physician";
    const bmdcNumber = doctor.additionalInfo?.bmdcNumber || "N/A";

    // Header with doctor info
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Medical Prescription", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).font("Helvetica-Bold").text(`Dr. ${doctor.name}`);
    doc.fontSize(12).font("Helvetica").text(`${specialization}`);
    doc.text(`BMDC Reg: ${bmdcNumber}`);
    doc.moveDown();

    // Line separator
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Patient info
    doc.fontSize(12).font("Helvetica-Bold").text("Patient Information:");
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Name: ${prescription.patient.name}`);
    doc.text(`Date: ${new Date(prescription.createdAt).toLocaleDateString()}`);
    doc.moveDown();

    // Diagnosis
    doc.fontSize(12).font("Helvetica-Bold").text("Diagnosis:");
    doc.fontSize(10).font("Helvetica").text(prescription.diagnosis);
    doc.moveDown();

    // Medications
    doc.fontSize(12).font("Helvetica-Bold").text("Medications:");
    doc.moveDown(0.5);

    prescription.medications.forEach((med, index) => {
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(`${index + 1}. ${med.name} - ${med.dosage}`);
      doc.fontSize(10).font("Helvetica").text(`   Frequency: ${med.frequency}`);
      doc.text(`   Duration: ${med.duration}`);
      if (med.instructions) {
        doc.text(`   Instructions: ${med.instructions}`);
      }
      doc.moveDown(0.5);
    });

    // Notes section if available
    if (prescription.notes) {
      doc.moveDown();
      doc.fontSize(12).font("Helvetica-Bold").text("Notes:");
      doc.fontSize(10).font("Helvetica").text(prescription.notes);
    }

    // Footer with doctor signature
    doc.moveDown(2);
    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Doctor's Signature", { align: "right" });
    doc.moveDown(0.5);
    doc.text(`Dr. ${doctor.name}`, { align: "right" });

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("Error generating prescription PDF:", error);
    res.status(500).json({ error: "Failed to generate prescription PDF" });
  }
});

// Download a prescription as PDF
router.get("/prescriptions/:id/download", authenticateJWT, async (req, res) => {
  try {
    const prescriptionId = req.params.id;

    const prescription = await Prescription.findById(prescriptionId)
      .populate("doctor", "name additionalInfo")
      .populate("patient", "name email");

    if (!prescription) {
      return res.status(404).json({ error: "Prescription not found" });
    }

    // Set up PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Create a unique filename
    const filename = `prescription-${prescriptionId}.pdf`;
    const filePath = path.join(__dirname, `../temp/${filename}`);

    // Ensure temp directory exists
    if (!fs.existsSync(path.join(__dirname, "../temp"))) {
      fs.mkdirSync(path.join(__dirname, "../temp"), { recursive: true });
    }

    // Set response headers for download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Create write streams
    const fileStream = fs.createWriteStream(filePath);
    doc.pipe(fileStream);
    doc.pipe(res);

    // PDF content (same as the view PDF endpoint)
    const doctor = prescription.doctor;
    const specialization =
      doctor.additionalInfo?.specialization || "General Physician";
    const bmdcNumber = doctor.additionalInfo?.bmdcNumber || "N/A";

    // Header with doctor info
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Medical Prescription", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).font("Helvetica-Bold").text(`Dr. ${doctor.name}`);
    doc.fontSize(12).font("Helvetica").text(`${specialization}`);
    doc.text(`BMDC Reg: ${bmdcNumber}`);
    doc.moveDown();

    // Line separator
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Patient info
    doc.fontSize(12).font("Helvetica-Bold").text("Patient Information:");
    doc
      .fontSize(10)
      .font("Helvetica")
      .text(`Name: ${prescription.patient.name}`);
    doc.text(`Date: ${new Date(prescription.createdAt).toLocaleDateString()}`);
    doc.moveDown();

    // Diagnosis
    doc.fontSize(12).font("Helvetica-Bold").text("Diagnosis:");
    doc.fontSize(10).font("Helvetica").text(prescription.diagnosis);
    doc.moveDown();

    // Medications
    doc.fontSize(12).font("Helvetica-Bold").text("Medications:");
    doc.moveDown(0.5);

    prescription.medications.forEach((med, index) => {
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(`${index + 1}. ${med.name} - ${med.dosage}`);
      doc.fontSize(10).font("Helvetica").text(`   Frequency: ${med.frequency}`);
      doc.text(`   Duration: ${med.duration}`);
      if (med.instructions) {
        doc.text(`   Instructions: ${med.instructions}`);
      }
      doc.moveDown(0.5);
    });

    // Notes section if available
    if (prescription.notes) {
      doc.moveDown();
      doc.fontSize(12).font("Helvetica-Bold").text("Notes:");
      doc.fontSize(10).font("Helvetica").text(prescription.notes);
    }

    // Footer with doctor signature
    doc.moveDown(2);
    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Doctor's Signature", { align: "right" });
    doc.moveDown(0.5);
    doc.text(`Dr. ${doctor.name}`, { align: "right" });

    // Finalize PDF
    doc.end();

    // Clean up temp file after sending
    fileStream.on("finish", () => {
      setTimeout(() => {
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error removing temp file:", err);
        });
      }, 60000); // Delete after 1 minute
    });
  } catch (error) {
    console.error("Error downloading prescription PDF:", error);
    res.status(500).json({ error: "Failed to download prescription PDF" });
  }
});

// Simple test registration route with minimal required fields
router.post("/simple-register", async (req, res) => {
  try {
    const { email, name } = req.body;

    // Check if email is provided
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user with this email if doesn't exist
      user = new User({
        name: name || "Test Doctor",
        email: email,
        password: await bcrypt.hash("password123", 10), // Default password
        role: "doctor",
      });
    } else {
      // Update existing user to be a doctor
      user.role = "doctor";
    }

    // Set minimal doctor information with all required fields
    user.additionalInfo = {
      hospitalName: req.body.hospitalName || "Test Hospital",
      chamberAddress: req.body.chamberAddress || "123 Test Street",
      bmdcNumber: req.body.bmdcNumber || "12345-test",
      specialization: req.body.specialization || "General Physician",
      bio: req.body.bio || "Test Doctor Profile",
      verificationStatus: "approved", // Auto-approve for testing
      isDoctorVerified: true, // Auto-verify for testing
      consultationFee: req.body.consultationFee || "500",

      // Provide default objects for required fields
      experience: {
        years: "5",
        details: "General practice",
      },
      qualification: [
        {
          degree: "MBBS",
          institution: "Test Medical College",
          year: "2015",
        },
      ],
      availableTimeSlots: [
        {
          day: "Monday",
          startTime: "09:00",
          endTime: "17:00",
          isAvailable: true,
        },
      ],
      documents: {
        bmdcCertificate: null,
        degreeCertificate: null,
        chamberPhoto: null,
        otherCertificates: [],
      }, // Empty object for documents
      emergencyContact: {
        name: "Emergency Contact",
        phone: "123-456-7890",
        relationship: "Colleague",
      },
      services: ["General Checkup", "Prescription"],
      languages: ["English"],
    };

    await user.save();

    // Create a token for immediate login
    const token = jwt.sign(
      { _id: user._id, name: user.name, role: user.role, email: user.email },
      process.env.JWT_SECRET || "your_jwt_secret_key",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Doctor registration completed successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: "doctor",
      },
      token,
    });
  } catch (error) {
    console.error("Error in simple doctor registration:", error);
    res.status(500).json({
      error: "An error occurred during registration. " + error.message,
    });
  }
});

// Create a complete doctor account in one step - no auth required
router.post(
  "/complete-register",
  upload.fields([
    { name: "bmdcCertificate", maxCount: 1 },
    { name: "degreeCertificate", maxCount: 1 },
    { name: "chamberPhoto", maxCount: 1 },
    { name: "otherCertificates", maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const {
        email,
        name,
        password,
        hospitalName,
        chamberAddress,
        bmdcNumber,
        specialization,
        consultationFee,
        bio,
      } = req.body;

      // Basic validation
      if (!email || !name || !password) {
        return res
          .status(400)
          .json({ error: "Name, email and password are required" });
      }

      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email is already registered" });
      }

      // Handle file uploads
      const documents = {
        bmdcCertificate: null,
        degreeCertificate: null,
        chamberPhoto: null,
        otherCertificates: [],
      };

      // Only add file paths if they exist
      if (req.files) {
        if (req.files["bmdcCertificate"] && req.files["bmdcCertificate"][0]) {
          documents.bmdcCertificate = req.files["bmdcCertificate"][0].path;
        }
        if (
          req.files["degreeCertificate"] &&
          req.files["degreeCertificate"][0]
        ) {
          documents.degreeCertificate = req.files["degreeCertificate"][0].path;
        }
        if (req.files["chamberPhoto"] && req.files["chamberPhoto"][0]) {
          documents.chamberPhoto = req.files["chamberPhoto"][0].path;
        }
        if (req.files["otherCertificates"]) {
          documents.otherCertificates = req.files["otherCertificates"].map(
            (file) => file.path
          );
        }
      }

      // Create default objects for required fields
      const defaultExperience = { years: "1", details: "General practice" };
      const defaultQualification = [
        { degree: "MBBS", institution: "Medical College", year: "2015" },
      ];
      const defaultTimeSlots = [
        {
          day: "Monday",
          startTime: "09:00",
          endTime: "17:00",
          isAvailable: true,
        },
      ];
      const defaultEmergencyContact = {
        name: "Emergency Contact",
        phone: "123-456-7890",
        relationship: "Colleague",
      };
      const defaultServices = ["General Checkup", "Prescription"];
      const defaultLanguages = ["English"];

      // Create new user with doctor role
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: "doctor",
        additionalInfo: {
          hospitalName: hospitalName || "General Hospital",
          chamberAddress: chamberAddress || "Address pending",
          bmdcNumber: bmdcNumber || `DR-${Date.now().toString().substring(8)}`,
          specialization: specialization || "General Physician",
          consultationFee: consultationFee || "500",
          bio: bio || `Dr. ${name}'s profile`,
          experience: defaultExperience,
          qualification: defaultQualification,
          availableTimeSlots: defaultTimeSlots,
          emergencyContact: defaultEmergencyContact,
          services: defaultServices,
          languages: defaultLanguages,
          documents,
          verificationStatus: "pending",
          isDoctorVerified: false,
        },
      });

      await newUser.save();

      // Create token for immediate login
      const token = jwt.sign(
        {
          _id: newUser._id,
          name: newUser.name,
          role: newUser.role,
          email: newUser.email,
        },
        process.env.JWT_SECRET || "your_jwt_secret_key",
        { expiresIn: "24h" }
      );

      res.status(201).json({
        message: "Doctor account created successfully",
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: "doctor",
        },
      });
    } catch (error) {
      console.error("Error in doctor registration:", error);
      res.status(500).json({ error: "Failed to register: " + error.message });
    }
  }
);

module.exports = router;
