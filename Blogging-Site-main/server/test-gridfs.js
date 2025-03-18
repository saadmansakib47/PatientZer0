import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// MongoDB connection string
const mongoURI = process.env.DB || "mongodb://localhost:27017/blog";
console.log("Using MongoDB URI:", mongoURI);

// Create a test image if it doesn't exist
const createTestImage = () => {
  const publicDir = path.join(process.cwd(), "public");
  const testImagePath = path.join(publicDir, "test-image.jpg");

  // Create public directory if it doesn't exist
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
    console.log("Created public directory");
  }

  // Check if test image already exists
  if (!fs.existsSync(testImagePath)) {
    // Copy a sample image or create a simple one
    const sampleImagePath = path.join(process.cwd(), "sample-image.jpg");

    if (fs.existsSync(sampleImagePath)) {
      fs.copyFileSync(sampleImagePath, testImagePath);
      console.log("Copied sample image to test image");
    } else {
      // Create a simple text file as a placeholder
      fs.writeFileSync(testImagePath, "This is a test image placeholder");
      console.log("Created test image placeholder");
    }
  }

  return testImagePath;
};

// Test GridFS functionality
const testGridFS = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");

    // Create GridFS bucket
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: "fs",
    });
    console.log("Created GridFS bucket");

    // Create test image
    const testImagePath = createTestImage();
    console.log("Test image path:", testImagePath);

    // Upload test image to GridFS
    const filename = `test-image-${Date.now()}.jpg`;
    console.log("Uploading test image with filename:", filename);

    const uploadStream = bucket.openUploadStream(filename, {
      contentType: "image/jpeg",
    });

    const readStream = fs.createReadStream(testImagePath);
    readStream.pipe(uploadStream);

    uploadStream.on("finish", async () => {
      console.log("Upload finished, file ID:", uploadStream.id);

      // List all files in GridFS
      const files = await mongoose.connection.db
        .collection("fs.files")
        .find({})
        .toArray();
      console.log(`Found ${files.length} files in GridFS`);
      console.log(
        "Files:",
        files.map((f) => ({
          _id: f._id,
          filename: f.filename,
          contentType: f.contentType,
          size: f.length,
        }))
      );

      // Test downloading the file
      console.log("Testing download of file:", filename);
      const downloadStream = bucket.openDownloadStreamByName(filename);

      downloadStream.on("data", (chunk) => {
        console.log(`Received ${chunk.length} bytes of data`);
      });

      downloadStream.on("error", (err) => {
        console.error("Download error:", err);
      });

      downloadStream.on("end", () => {
        console.log("Download completed successfully");
        console.log("GridFS test completed successfully");

        // Close connection
        mongoose.connection.close();
        console.log("MongoDB connection closed");
      });
    });

    uploadStream.on("error", (err) => {
      console.error("Upload error:", err);
      mongoose.connection.close();
    });
  } catch (error) {
    console.error("Error in GridFS test:", error);
    if (mongoose.connection) {
      mongoose.connection.close();
    }
  }
};

// Run the test
testGridFS();
