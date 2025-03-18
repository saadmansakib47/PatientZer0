import path from "path";
import fs from "fs";

// Base URL for serving images - Updated to work with proxy
const url = "/blog-static";

// Fallback image URL
const fallbackImageUrl =
  "https://images.unsplash.com/photo-1543128639-4cb7e6eeef1b?ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8bGFwdG9wJTIwc2V0dXB8ZW58MHx8MHx8&ixlib=rb-1.2.1&w=1000&q=80";

// Debug function to list all files in uploads directory
export const listAllFiles = async (request, response) => {
  try {
    console.log("Listing all files in uploads directory...");

    const uploadsDir = path.join(process.cwd(), "uploads");

    // Check if directory exists
    if (!fs.existsSync(uploadsDir)) {
      return response.status(200).json({
        success: true,
        count: 0,
        files: [],
      });
    }

    // Read directory contents
    const files = fs.readdirSync(uploadsDir);

    console.log(`Found ${files.length} files in uploads directory`);

    // Get file stats
    const fileDetails = files.map((filename) => {
      const filePath = path.join(uploadsDir, filename);
      const stats = fs.statSync(filePath);

      // Determine content type based on extension
      const ext = path.extname(filename).toLowerCase();
      let contentType = "application/octet-stream";

      if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
      else if (ext === ".png") contentType = "image/png";
      else if (ext === ".gif") contentType = "image/gif";
      else if (ext === ".webp") contentType = "image/webp";

      return {
        filename,
        contentType,
        size: stats.size,
        createdAt: stats.birthtime,
        url: `${url}/file/${filename}`,
      };
    });

    // Return file list
    return response.status(200).json({
      success: true,
      count: files.length,
      files: fileDetails,
    });
  } catch (error) {
    console.error("Error listing files:", error);
    response.status(500).json({
      success: false,
      msg: "Error listing files: " + error.message,
    });
  }
};

// Upload a file
export const uploadImage = async (request, response) => {
  try {
    console.log("Upload request received");

    // Check if file exists in request
    if (!request.file) {
      console.error("No file in request");
      return response.status(400).json({
        isSuccess: false,
        msg: "No file uploaded",
      });
    }

    // Log file details from multer
    console.log("File uploaded via multer:", {
      filename: request.file.filename,
      originalname: request.file.originalname,
      mimetype: request.file.mimetype,
      size: request.file.size,
      path: request.file.path,
    });

    // Construct the URL for accessing the file
    const imageUrl = `${url}/file/${request.file.filename}`;
    console.log("Generated image URL:", imageUrl);

    // Return success response
    return response.status(200).json({
      isSuccess: true,
      data: imageUrl,
      file: {
        filename: request.file.filename,
        originalname: request.file.originalname,
        mimetype: request.file.mimetype,
        size: request.file.size,
      },
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    response.status(500).json({
      isSuccess: false,
      msg: "Error uploading file: " + error.message,
    });
  }
};

// Get a file by filename
export const getImage = async (request, response) => {
  try {
    // Get filename from params and clean it
    const filename = request.params.filename.split("?")[0];

    // Construct file path
    const filePath = path.join(process.cwd(), "uploads", filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      // Instead of logging an error, redirect to fallback image
      return response.redirect(fallbackImageUrl);
    }

    // Determine content type based on extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = "application/octet-stream";

    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".webp") contentType = "image/webp";

    // Set appropriate headers
    response.set("Content-Type", contentType);

    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(response);

    // Handle errors
    fileStream.on("error", (err) => {
      console.error("Stream error:", err);
      if (!response.headersSent) {
        response.redirect(fallbackImageUrl);
      }
    });
  } catch (error) {
    console.error("Error retrieving file:", error);
    if (!response.headersSent) {
      response.redirect(fallbackImageUrl);
    }
  }
};
