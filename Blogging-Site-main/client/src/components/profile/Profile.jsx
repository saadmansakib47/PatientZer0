import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Avatar,
  Paper,
  Tabs,
  Tab,
  Divider,
  Button,
  TextField,
  CircularProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  LinearProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../../service/api";
import { DataContext } from "../../context/DataProvider";

// Icons
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import ArticleIcon from "@mui/icons-material/Article";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CommentIcon from "@mui/icons-material/Comment";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";

// Components
import Posts from "../home/post/Posts";
import ScrollAnimation from "../animations/ScrollAnimation";
import HealthProfile from "./HealthProfile";

const ProfileContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(8),
}));

const ProfileHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: 16,
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    background: theme.palette.primary.main,
    zIndex: 0,
  },
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 150,
  height: 150,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  marginBottom: theme.spacing(2),
  position: "relative",
  zIndex: 1,
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: "center",
  borderRadius: 12,
  height: "100%",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
  },
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: "2rem",
  fontWeight: 700,
  color: theme.palette.primary.main,
}));

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { account } = useContext(DataContext);

  const [user, setUser] = useState({
    name: "",
    username: "",
    bio: "No bio available",
    profilePicture: "",
  });

  const [stats, setStats] = useState({
    posts: 0,
    comments: 0,
    likes: 0,
  });

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [openPhotoDialog, setOpenPhotoDialog] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info", // 'success', 'error', 'warning', 'info'
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const isOwnProfile = account.username === username;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);

        // Fetch user profile data from the API
        const response = await API.getUserProfile(username);

        if (response.isSuccess) {
          const userData = response.data;
          setUser({
            name: userData.name,
            username: userData.username,
            bio: userData.bio || "No bio available",
            profilePicture:
              userData.profilePicture ||
              `https://ui-avatars.com/api/?name=${username}&background=random&size=150`,
          });

          // Fetch user stats
          try {
            const statsResponse = await API.getUserStats(username);
            if (statsResponse && statsResponse.isSuccess) {
              setStats(statsResponse.data);
            } else {
              console.log("Falling back to post count only due to stats error");
              // Fallback to post count only
              const postsResponse = await API.getAllPosts({ username });
              if (postsResponse && postsResponse.isSuccess) {
                setStats((prev) => ({
                  ...prev,
                  posts:
                    postsResponse.data.total ||
                    postsResponse.data.pagination?.total ||
                    0,
                }));
              }
            }
          } catch (statsError) {
            console.log(
              "Error fetching stats, falling back to post count:",
              statsError
            );
            // Fallback to post count only
            try {
              const postsResponse = await API.getAllPosts({ username });
              if (postsResponse && postsResponse.isSuccess) {
                setStats((prev) => ({
                  ...prev,
                  posts:
                    postsResponse.data.total ||
                    postsResponse.data.pagination?.total ||
                    0,
                }));
              }
            } catch (postsError) {
              console.error("Error fetching posts count:", postsError);
            }
          }
        } else {
          // If user not found, use placeholder data
          setUser({
            name: username.charAt(0).toUpperCase() + username.slice(1),
            username: username,
            bio: "No bio available",
            profilePicture: `https://ui-avatars.com/api/?name=${username}&background=random&size=150`,
          });
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching user profile:", error);

        // If error, use placeholder data
        setUser({
          name: username.charAt(0).toUpperCase() + username.slice(1),
          username: username,
          bio: "No bio available",
          profilePicture: `https://ui-avatars.com/api/?name=${username}&background=random&size=150`,
        });

        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditProfile = () => {
    setEditedUser({ ...user });
    setEditing(true);
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const showNotification = (message, severity = "info") => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleSaveProfile = async () => {
    try {
      // Send updated profile to the API
      const response = await API.updateUserProfile(username, {
        name: editedUser.name,
        bio: editedUser.bio,
        profilePicture: editedUser.profilePicture,
      });

      if (response.isSuccess) {
        setUser(response.data);
        setEditing(false);
        showNotification("Profile updated successfully", "success");
      } else {
        console.error("Error updating profile:", response.msg);
        showNotification(response.msg || "Error updating profile", "error");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showNotification("Error updating profile. Please try again.", "error");
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenPhotoDialog = () => {
    setOpenPhotoDialog(true);
  };

  const handleClosePhotoDialog = () => {
    setOpenPhotoDialog(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile) {
      showNotification("Please select a file first", "warning");
      return;
    }

    try {
      setUploading(true);

      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Upload the file
      const uploadResponse = await API.uploadFile(
        formData,
        (progress) => setUploadProgress(progress),
        null
      );

      if (uploadResponse.isSuccess) {
        const imageUrl = uploadResponse.data.imageUrl;

        // Update the user profile with the new image URL
        const updateResponse = await API.updateUserProfile(username, {
          ...user,
          profilePicture: imageUrl,
        });

        if (updateResponse.isSuccess) {
          setUser((prev) => ({
            ...prev,
            profilePicture: imageUrl,
          }));
          showNotification("Profile picture updated successfully", "success");
          handleClosePhotoDialog();
        } else {
          showNotification(
            updateResponse.msg || "Error updating profile picture",
            "error"
          );
        }
      } else {
        showNotification(
          uploadResponse.msg || "Error uploading image",
          "error"
        );
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      showNotification(
        "Error uploading profile picture. Please try again.",
        "error"
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setSelectedFile(null);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ProfileContainer maxWidth="lg">
      <ScrollAnimation direction="up" delay={0.2}>
        <ProfileHeader>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box sx={{ position: "relative" }}>
              <ProfileAvatar src={user.profilePicture} alt={user.name} />
              {isOwnProfile && (
                <IconButton
                  sx={{
                    position: "absolute",
                    bottom: 10,
                    right: 0,
                    backgroundColor: "primary.main",
                    color: "white",
                    "&:hover": { backgroundColor: "primary.dark" },
                  }}
                  onClick={handleOpenPhotoDialog}
                >
                  <PhotoCameraIcon />
                </IconButton>
              )}
            </Box>

            {editing ? (
              <Box sx={{ width: "100%", maxWidth: 500, mt: 2 }}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={editedUser.name}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Bio"
                  name="bio"
                  value={editedUser.bio}
                  onChange={handleInputChange}
                  margin="normal"
                  variant="outlined"
                  multiline
                  rows={4}
                />
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveProfile}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<CancelIcon />}
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <>
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 2 }}>
                  {user.name}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  @{user.username}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ textAlign: "center", maxWidth: 600, mb: 3 }}
                >
                  {user.bio}
                </Typography>
                {isOwnProfile && (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={handleEditProfile}
                    sx={{ mb: 2 }}
                  >
                    Edit Profile
                  </Button>
                )}
              </>
            )}
          </Box>
        </ProfileHeader>
      </ScrollAnimation>

      <ScrollAnimation direction="up" delay={0.4}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <StatsCard>
              <ArticleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <StatValue>{stats.posts}</StatValue>
              <Typography variant="h6">Posts</Typography>
            </StatsCard>
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatsCard>
              <CommentIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <StatValue>{stats.comments}</StatValue>
              <Typography variant="h6">Comments</Typography>
            </StatsCard>
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatsCard>
              <FavoriteIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <StatValue>{stats.likes}</StatValue>
              <Typography variant="h6">Likes</Typography>
            </StatsCard>
          </Grid>
        </Grid>
      </ScrollAnimation>

      <ScrollAnimation direction="up" delay={0.6}>
        <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Posts" />
            <Tab label="Health Profile" icon={<HealthAndSafetyIcon />} />
            <Tab label="Liked Posts" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <Posts username={username} />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <HealthProfile username={username} />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Liked posts will appear here
              </Typography>
            </Box>
          </TabPanel>
        </Paper>
      </ScrollAnimation>

      {/* Photo Upload Dialog */}
      <Dialog open={openPhotoDialog} onClose={handleClosePhotoDialog}>
        <DialogTitle>Update Profile Picture</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Upload a new profile picture
          </Typography>
          {selectedFile && (
            <Box sx={{ mb: 2, textAlign: "center" }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Selected file: {selectedFile.name}
              </Typography>
              {uploadProgress > 0 && (
                <Box sx={{ width: "100%", mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={uploadProgress}
                  />
                  <Typography
                    variant="body2"
                    sx={{ mt: 0.5, textAlign: "center" }}
                  >
                    {uploadProgress}%
                  </Typography>
                </Box>
              )}
            </Box>
          )}
          <Button
            variant="contained"
            component="label"
            fullWidth
            sx={{ mt: 1 }}
            disabled={uploading}
          >
            Choose File
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePhotoDialog} disabled={uploading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUploadPhoto}
            disabled={!selectedFile || uploading}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </ProfileContainer>
  );
};

export default Profile;
