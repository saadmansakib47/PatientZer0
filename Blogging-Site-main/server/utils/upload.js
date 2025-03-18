import multer from "multer";
import path from "path";
import fs from "fs";

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Created uploads directory");
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-blog-";
    const filename = uniqueSuffix + file.originalname.replace(/\s+/g, "-");
    console.log("Generated filename for storage:", filename);
    cb(null, filename);
  },
});

// Configure multer with the storage engine
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Log file info
    console.log("Multer processing file:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
    });

    if (!file.mimetype) {
      console.log("No mime type detected");
      return cb(new Error("No file type detected"));
    }

    // Normalize the mime type
    const normalizedMimeType = file.mimetype.toLowerCase();

    const allowedTypes = [
      "image/png",
      "image/jpg",
      "image/jpeg",
      "image/gif",
      "image/webp",
    ];

    // Check if the normalized mime type is allowed
    if (allowedTypes.includes(normalizedMimeType)) {
      console.log("File accepted:", file.originalname);
      cb(null, true);
    } else {
      console.log(
        "File rejected:",
        file.originalname,
        "Type:",
        normalizedMimeType
      );
      cb(
        new Error(
          `Invalid file type: ${normalizedMimeType}. Only PNG, JPG, JPEG, GIF, and WEBP files are allowed.`
        )
      );
    }
  },
});

export default upload;
