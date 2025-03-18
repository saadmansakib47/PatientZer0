import React, { useState, useEffect, useContext, useRef } from "react";

import {
  styled,
  Box,
  TextareaAutosize,
  Button,
  InputBase,
  FormControl,
  Typography,
  Alert,
  CircularProgress,
  Skeleton,
  Select,
  MenuItem,
  Paper,
  Container as MuiContainer,
  Chip,
  OutlinedInput,
} from "@mui/material";
import { AddCircle as Add } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

import { API } from "../../service/api";
import { DataContext } from "../../context/DataProvider";
import { categories } from "../../constants/data";

const Container = styled(MuiContainer)(({ theme }) => ({
  paddingTop: theme.spacing(10),
  paddingBottom: theme.spacing(8),
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(4),
}));

const FormWrapper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[4],
}));

const ImageContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "100%",
  height: "400px",
  borderRadius: theme.spacing(2),
  overflow: "hidden",
  backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5",
  boxShadow: theme.shadows[2],
  marginBottom: theme.spacing(4),
}));

const Image = styled("img")({
  width: "100%",
  height: "100%",
  objectFit: "cover",
  transition: "opacity 0.3s ease",
});

const FormSection = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(3),
}));

const TitleSection = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "auto 1fr auto",
  alignItems: "center",
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
}));

const CategorySection = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  alignItems: "center",
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
}));

const TagChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  borderRadius: theme.spacing(1),
  fontWeight: 500,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  fontSize: "1.25rem",
  width: "100%",
  "& input": {
    padding: theme.spacing(1),
  },
  "& input::placeholder": {
    opacity: 0.7,
  },
  "&.error": {
    color: theme.palette.error.main,
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  width: "100%",
  "& .MuiSelect-select": {
    padding: theme.spacing(1),
  },
}));

const StyledTextArea = styled(TextareaAutosize)(({ theme }) => ({
  width: "100%",
  minHeight: "300px",
  padding: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  fontSize: "1rem",
  fontFamily: theme.typography.fontFamily,
  resize: "vertical",
  "&:focus": {
    outline: "none",
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${theme.palette.primary.main}25`,
  },
  "&::placeholder": {
    opacity: 0.7,
  },
  "&.error": {
    borderColor: theme.palette.error.main,
  },
}));

const UploadButton = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  cursor: "pointer",
  borderRadius: theme.spacing(1),
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const PublishButton = styled(Button)(({ theme }) => ({
  padding: `${theme.spacing(1)} ${theme.spacing(4)}`,
  fontSize: "1rem",
  textTransform: "none",
  minWidth: "120px",
}));

const ErrorText = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  fontSize: "0.875rem",
  marginTop: theme.spacing(0.5),
  marginLeft: theme.spacing(2),
}));

const initialPost = {
  title: "",
  description: "",
  picture: "",
  username: "",
  tags: ["Nutrition"], // Changed from categories to tags array
  createdDate: new Date(),
};

const CreatePost = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { account } = useContext(DataContext);
  const mountedRef = useRef(true); // Add mounted ref

  const [post, setPost] = useState(initialPost);
  const [file, setFile] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState("");

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Safe setState functions
  const safeSetState =
    (setter) =>
    (...args) => {
      if (mountedRef.current) {
        setter(...args);
      }
    };

  const safeSetPost = safeSetState(setPost);
  const safeSetErrors = safeSetState(setErrors);
  const safeSetIsSubmitting = safeSetState(setIsSubmitting);
  const safeSetSubmitError = safeSetState(setSubmitError);
  const safeSetIsUploading = safeSetState(setIsUploading);
  const safeSetImageLoaded = safeSetState(setImageLoaded);
  const safeSetImageError = safeSetState(setImageError);
  const safeSetImageSrc = safeSetState(setImageSrc);

  const fallbackUrl =
    "https://images.unsplash.com/photo-1512314889357-e157c22f938d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80";

  // Define a reference for the image element to test it directly
  const imgRef = useRef(null);

  // Test image directly in the browser with fetch
  const testImageWithFetch = async (url) => {
    try {
      console.log("Testing image URL with fetch:", url);
      const response = await fetch(url, { method: "HEAD" });
      console.log("Fetch response:", response.status, response.ok);
      return response.ok;
    } catch (error) {
      console.error("Fetch test failed:", error);
      return false;
    }
  };

  useEffect(() => {
    const getImage = async () => {
      if (file) {
        try {
          safeSetIsUploading(true);
          const data = new FormData();
          data.append("file", file);

          console.log(
            "Uploading file:",
            file.name,
            "Type:",
            file.type,
            "Size:",
            file.size
          );
          const response = await API.uploadFile(data);
          console.log("Upload response:", response);
          console.log("Upload response data:", response.data);

          if (response.isSuccess && response.data) {
            // Extract the URL string properly
            let imageUrl;
            if (typeof response.data === "string") {
              imageUrl = response.data;
            } else if (
              typeof response.data === "object" &&
              response.data.data
            ) {
              imageUrl = response.data.data;
            } else if (typeof response.data.data === "string") {
              imageUrl = response.data.data;
            } else {
              console.error("Unexpected response format:", response.data);
              throw new Error("Invalid image URL format");
            }

            console.log("Extracted image URL:", imageUrl);

            // Wait a moment for the file to be available before setting the URL
            setTimeout(async () => {
              if (mountedRef.current) {
                // First, attempt to verify the image is accessible
                const isAccessible = await testImageWithFetch(imageUrl);
                console.log("Image accessibility test result:", isAccessible);

                safeSetPost((prev) => ({ ...prev, picture: imageUrl }));
                safeSetErrors((prev) => ({ ...prev, picture: "" }));
              }
            }, 1000); // Wait 1 second for server to process
          } else {
            throw new Error(response.msg || "Failed to upload image");
          }
        } catch (error) {
          console.error("Image upload error:", error);
          if (mountedRef.current) {
            safeSetErrors((prev) => ({
              ...prev,
              picture:
                error.message || "Failed to upload image. Please try again.",
            }));
          }
        } finally {
          if (mountedRef.current) {
            safeSetIsUploading(false);
          }
        }
      }
    };

    getImage();
  }, [file]);

  // Fix the image source useEffect to handle URL correctly
  useEffect(() => {
    // Set image source with a longer delay to allow the server to process the image
    if (post.picture) {
      console.log("Setting image source from picture:", post.picture);

      // Clean up any existing cache busting parameters
      let baseUrl = post.picture;
      if (baseUrl.includes("?")) {
        baseUrl = baseUrl.split("?")[0];
      }

      // Set loading state and clear error state
      safeSetImageLoaded(false);
      safeSetImageError(false);

      // Start with the fallback image
      safeSetImageSrc(fallbackUrl);

      // Add a longer delay before loading the image to give the server time to process it
      const timer = setTimeout(async () => {
        // Try to fetch the image directly first
        const isAccessible = await testImageWithFetch(baseUrl);
        if (isAccessible) {
          console.log("Image is now accessible, setting as source");
          safeSetImageSrc(baseUrl);
        } else {
          console.log("Image still not accessible, using fallback");
          safeSetImageError(true);
        }
      }, 2000); // Try after 2 seconds

      return () => clearTimeout(timer);
    } else {
      safeSetImageSrc(fallbackUrl);
    }
  }, [post.picture]);

  const handleImageError = () => {
    console.error("Failed to load image:", imageSrc);

    // Retry loading the image with a direct fetch
    fetch(imageSrc, { method: "HEAD" })
      .then((response) => {
        console.log("Image HEAD request result:", {
          status: response.status,
          ok: response.ok,
          headers: Array.from(response.headers.entries()),
        });

        if (!response.ok) {
          safeSetImageError(true);
          safeSetImageSrc(fallbackUrl);
        } else {
          // Try loading the image again with a fresh URL
          const freshUrl = `${imageSrc}?retry=${Date.now()}`;
          safeSetImageSrc(freshUrl);
        }
      })
      .catch((error) => {
        console.error("Image fetch error:", error);
        safeSetImageError(true);
        safeSetImageSrc(fallbackUrl);
      });
  };

  useEffect(() => {
    let mounted = true;

    // Get category from URL and update post
    const category = location.search?.split("=")[1] || "All";
    if (mounted) {
      safeSetPost((prev) => ({
        ...prev,
        tags: category !== "All" ? [category] : prev.tags, // Update to use tags array
        username: account.username,
      }));
    }

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, [location.search, account.username]);

  const validatePost = () => {
    const newErrors = {};

    if (!post.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!post.description.trim()) {
      newErrors.description = "Description is required";
    }

    safeSetErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const savePost = async () => {
    if (!validatePost()) {
      return;
    }

    try {
      safeSetIsSubmitting(true);
      safeSetSubmitError("");

      // Check if user is logged in
      if (!account?.username) {
        safeSetSubmitError("Please log in to create a post.");
        navigate("/login");
        return;
      }

      const postData = {
        ...post,
        picture: post.picture || fallbackUrl,
        createdDate: new Date(),
      };

      console.log("Sending post data:", postData);

      try {
        const response = await API.createPost(postData);
        console.log("Create post API response:", response);

        if (response?.isSuccess) {
          if (mountedRef.current) {
            navigate("/");
          }
        } else {
          // Handle the error response
          console.log("API error response:", response);
          safeSetSubmitError(
            response?.msg || "Failed to create post. Please try again."
          );
        }
      } catch (apiError) {
        // Log the complete error object
        console.error("API Error Details:", {
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          data: apiError.response?.data,
          headers: apiError.response?.headers,
          error: apiError,
        });

        // Handle 400 Bad Request specifically
        if (apiError.response?.status === 400) {
          const errorData = apiError.response.data;
          console.log("Bad Request Error Data:", errorData);

          if (errorData.field === "title") {
            safeSetErrors((prev) => ({
              ...prev,
              title:
                errorData.msg ||
                "This title is already in use. Please choose a different title.",
            }));
            safeSetSubmitError(
              errorData.msg ||
                "Warning: A post with this title already exists. Please choose a different title."
            );
          } else {
            safeSetSubmitError(
              errorData.msg || "Invalid request. Please check your input."
            );
          }
          return;
        }

        throw apiError; // Re-throw for other error handling
      }
    } catch (error) {
      console.error("Create post error:", error);

      // Handle authentication errors
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.log("Authentication error:", error.response);
        safeSetSubmitError("Your session has expired. Please log in again.");
        sessionStorage.clear();
        navigate("/login");
        return;
      }

      if (error.response?.data) {
        console.log("Error response data:", error.response.data);
        const errorData = error.response.data;

        // Check for duplicate title error
        if (
          errorData.field === "title" ||
          (errorData.error && errorData.error.code === 11000) ||
          errorData.msg?.includes("title already exists")
        ) {
          safeSetErrors((prev) => ({
            ...prev,
            title:
              errorData.msg ||
              "This title is already in use. Please choose a different title.",
          }));
          safeSetSubmitError(
            errorData.msg ||
              "Warning: A post with this title already exists. Please choose a different title."
          );
        } else {
          safeSetSubmitError(
            errorData.msg || "Failed to create post. Please try again."
          );
        }
      } else {
        safeSetSubmitError("Failed to create post. Please try again.");
      }
    } finally {
      safeSetIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    safeSetPost((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      safeSetErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <Container maxWidth="lg">
      <FormWrapper elevation={0}>
        <ImageContainer>
          {!imageLoaded && !imageError && (
            <Skeleton variant="rectangular" width="100%" height="100%" />
          )}
          <Image
            ref={imgRef}
            src={imageSrc}
            alt="post"
            onLoad={() => {
              console.log("Image loaded successfully:", imageSrc);
              safeSetImageLoaded(true);
            }}
            onError={handleImageError}
            style={{ opacity: imageLoaded ? 1 : 0 }}
            crossOrigin="anonymous"
          />
        </ImageContainer>

        <FormSection>
          <TitleSection>
            <UploadButton component="label" htmlFor="fileInput">
              <Add fontSize="large" color="action" />
              <Typography color="textSecondary">
                {isUploading ? "Uploading..." : "Upload Image"}
              </Typography>
            </UploadButton>
            <input
              type="file"
              id="fileInput"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const validTypes = [
                    "image/png",
                    "image/jpg",
                    "image/jpeg",
                    "image/gif",
                    "image/webp",
                  ];
                  const fileExtension = file.name
                    .split(".")
                    .pop()
                    .toLowerCase();
                  const extensionToMimeType = {
                    png: "image/png",
                    jpg: "image/jpeg",
                    jpeg: "image/jpeg",
                    gif: "image/gif",
                    webp: "image/webp",
                  };
                  const detectedType =
                    file.type || extensionToMimeType[fileExtension];

                  if (!detectedType || !validTypes.includes(detectedType)) {
                    safeSetErrors((prev) => ({
                      ...prev,
                      picture: `Invalid file type. Only PNG, JPG, JPEG, GIF, and WEBP files are allowed.`,
                    }));
                    return;
                  }
                  if (file.size > 5 * 1024 * 1024) {
                    safeSetErrors((prev) => ({
                      ...prev,
                      picture: "File size too large. Maximum size is 5MB.",
                    }));
                    return;
                  }
                  setFile(file);
                  safeSetErrors((prev) => ({ ...prev, picture: "" }));
                }
              }}
              accept="image/png,image/jpg,image/jpeg,image/gif,image/webp"
            />
            <StyledInputBase
              placeholder="Title"
              name="title"
              value={post.title}
              onChange={handleChange}
              className={errors.title ? "error" : ""}
              fullWidth
            />
            <PublishButton
              variant="contained"
              color="primary"
              onClick={savePost}
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Publish"
              )}
            </PublishButton>
          </TitleSection>

          {errors.title && <ErrorText>{errors.title}</ErrorText>}

          <CategorySection>
            <Typography variant="subtitle1" color="textSecondary">
              Tags:
            </Typography>
            <FormControl fullWidth>
              <Select
                multiple
                value={post.tags}
                onChange={(e) => safeSetPost({ ...post, tags: e.target.value })}
                input={<OutlinedInput />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selected.map((value) => (
                      <TagChip
                        key={value}
                        label={value}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 48 * 4.5 + 8,
                      width: 250,
                    },
                  },
                }}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.type}>
                    {category.type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CategorySection>

          <StyledTextArea
            placeholder="Tell your story..."
            name="description"
            value={post.description}
            onChange={handleChange}
            className={errors.description ? "error" : ""}
          />

          {errors.description && <ErrorText>{errors.description}</ErrorText>}
          {errors.picture && <ErrorText>{errors.picture}</ErrorText>}

          {submitError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {submitError}
            </Alert>
          )}
        </FormSection>
      </FormWrapper>
    </Container>
  );
};

export default CreatePost;
