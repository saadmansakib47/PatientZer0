import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Grid,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import HistoryIcon from "@mui/icons-material/History";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import RecommendIcon from "@mui/icons-material/Recommend";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useParams } from "react-router-dom";
import {
  getHealthProfile,
  updateHealthProfile,
  analyzeHealthStatus,
  analyzeHealthCondition,
  analyzeHealthGoals,
} from "../../service/healthService";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
}));

const ChipContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const HistoryItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.grey[50],
  border: `1px solid ${theme.palette.grey[200]}`,
}));

const SuggestionChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
}));

// Predefined nutrition-related goals
const NUTRITION_GOALS = [
  "Eat more nutritious food",
  "Balanced diet",
  "Increase protein intake",
  "Reduce sugar consumption",
  "Eat more fruits and vegetables",
  "Healthy meal planning",
];

const HealthProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [statusUpdated, setStatusUpdated] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!sessionStorage.getItem("accessToken")
  );
  const [suggestionsAnchorEl, setSuggestionsAnchorEl] = useState(null);
  const [showNutritionSuggestions, setShowNutritionSuggestions] =
    useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username || !isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getHealthProfile(username);
        setProfile(data);

        // Check if user has any nutrition-related goals
        checkForNutritionGoals(data);

        setError("");
      } catch (err) {
        console.error("Error in HealthProfile:", err);
        setError("Failed to load health profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, isAuthenticated]);

  // Check if user is logged in
  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    setIsAuthenticated(!!token);
  }, []);

  // Check if user has any nutrition-related goals
  const checkForNutritionGoals = (profileData) => {
    if (!profileData || !profileData.goals || profileData.goals.length === 0) {
      setShowNutritionSuggestions(true);
      return;
    }

    const nutritionKeywords = [
      "nutrition",
      "nutritious",
      "food",
      "diet",
      "eating",
      "meal",
    ];
    const hasNutritionGoal = profileData.goals.some((goal) =>
      nutritionKeywords.some((keyword) =>
        goal.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    setShowNutritionSuggestions(!hasNutritionGoal);
  };

  const handleUpdateStatus = async () => {
    if (!currentStatus.trim() || !isAuthenticated) return;

    try {
      setError("");
      const statusText = currentStatus.trim();
      
      // First analyze the status
      const analysis = await analyzeHealthStatus(username, statusText);
      
      const updatedProfile = {
        username,
        currentStatus: statusText,
        history: [
          ...(profile?.history || []),
          {
            status: statusText,
            date: new Date().toISOString(),
            categories: analysis.categories || []
          }
        ]
      };

      const response = await updateHealthProfile(updatedProfile);
      
      if (response?.profile) {
        setProfile(response.profile);
        setCurrentStatus("");
        setStatusUpdated(true);
        setTimeout(() => setStatusUpdated(false), 3000);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error updating health status:", err);
      setError("Failed to update status. Please try again.");
    }
  };

  const handleRemoveCondition = async (condition) => {
    if (!isAuthenticated) return;

    try {
      setError("");
      const updatedConditions = profile.conditions.filter((c) => c !== condition);
      
      // First analyze the removal
      await analyzeHealthCondition(username, condition, true);
      
      const response = await updateHealthProfile({
        username,
        conditions: updatedConditions,
      });

      if (response && response.profile) {
        setProfile(response.profile);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Error removing health condition:", err);
      setError("Failed to remove health condition. Please try again.");
    }
  };

  const handleAddCondition = async () => {
    if (!newCondition.trim() || !isAuthenticated) return;

    try {
      setError("");
      // First analyze the new condition
      await analyzeHealthCondition(username, newCondition.trim());
      
      const updatedConditions = [
        ...(profile?.conditions || []),
        newCondition.trim(),
      ];
      const response = await updateHealthProfile({
        username,
        conditions: updatedConditions,
      });

      if (response && response.profile) {
        setProfile(response.profile);
        setNewCondition("");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Error updating health condition:", err);
      setError("Failed to update health condition. Please try again.");
    }
  };

  const handleAddGoal = async () => {
    if (!newGoal.trim() || !isAuthenticated) return;

    try {
      setError("");
      const updatedGoals = [...(profile?.goals || []), newGoal.trim()];
      
      // Analyze goals
      await analyzeHealthGoals(username, updatedGoals);
      
      const response = await updateHealthProfile({
        username,
        goals: updatedGoals,
      });

      if (response && response.profile) {
        setProfile(response.profile);
        setNewGoal("");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Error updating health goal:", err);
      setError("Failed to update health goal. Please try again.");
    }
  };

  const handleRemoveGoal = async (goalToRemove) => {
    if (!isAuthenticated) return;

    try {
      setError("");
      const updatedGoals = profile.goals.filter(
        (goal) => goal !== goalToRemove
      );

      // Analyze updated goals
      await analyzeHealthGoals(username, updatedGoals);
      
      const response = await updateHealthProfile({
        username,
        goals: updatedGoals,
      });

      if (response && response.profile) {
        setProfile(response.profile);

        // Check if we should show nutrition suggestions after removing a goal
        checkForNutritionGoals(response.profile);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Error removing health goal:", err);
      setError("Failed to remove health goal. Please try again.");
    }
  };

  const handleOpenSuggestions = (event) => {
    setSuggestionsAnchorEl(event.currentTarget);
  };

  const handleCloseSuggestions = () => {
    setSuggestionsAnchorEl(null);
  };

  const handleAddSuggestedGoal = async (goal) => {
    if (!isAuthenticated) return;

    try {
      setError("");

      // Check if goal already exists
      if (profile.goals.includes(goal)) {
        handleCloseSuggestions();
        return;
      }

      const updatedGoals = [...profile.goals, goal];
      const response = await updateHealthProfile({
        username,
        goals: updatedGoals,
      });

      if (response && response.profile) {
        setProfile(response.profile);
        handleCloseSuggestions();

        // Check if we should still show nutrition suggestions
        checkForNutritionGoals(response.profile);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Error adding suggested goal:", err);
      setError("Failed to add suggested goal. Please try again.");
      handleCloseSuggestions();
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box>
        <Typography
          variant="h5"
          fontWeight="600"
          mb={3}
          display="flex"
          alignItems="center"
        >
          <HealthAndSafetyIcon sx={{ mr: 1 }} color="primary" />
          Health Profile
        </Typography>

        <StyledPaper>
          <Typography variant="body1" textAlign="center" py={3}>
            Please log in to view and update your health profile
          </Typography>
        </StyledPaper>
      </Box>
    );
  }

  return (
    <Box>
      <Typography
        variant="h5"
        fontWeight="600"
        mb={3}
        display="flex"
        alignItems="center"
      >
        <HealthAndSafetyIcon sx={{ mr: 1 }} color="primary" />
        Health Profile
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {statusUpdated && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Status updated successfully!
        </Alert>
      )}

      <StyledPaper>
        <Typography variant="h6" fontWeight="500" mb={2}>
          Current Health Status
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="How are you feeling today? (e.g., I have a headache today, I'm feeling energetic after my workout, I want to eat more nutritious food...)"
          value={currentStatus}
          onChange={(e) => setCurrentStatus(e.target.value)}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdateStatus}
          disabled={!currentStatus.trim()}
        >
          Update Status
        </Button>

        {profile?.currentStatus && (
          <Box mt={2}>
            <Typography variant="subtitle2" color="text.secondary">
              Current Status:
            </Typography>
            <Typography variant="body1" sx={{ fontStyle: "italic", mt: 0.5 }}>
              "{profile.currentStatus}"
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Last updated: {new Date(profile.lastUpdated).toLocaleString()}
            </Typography>
          </Box>
        )}
      </StyledPaper>

      <StyledPaper>
        <Typography
          variant="h6"
          fontWeight="500"
          mb={2}
          display="flex"
          alignItems="center"
        >
          <FitnessCenterIcon sx={{ mr: 1 }} color="primary" />
          Health Conditions & Goals
        </Typography>

        <Typography variant="subtitle1" fontWeight="500">
          Health Conditions
        </Typography>
        <Box display="flex" alignItems="center" mb={1}>
          <TextField
            size="small"
            placeholder="Add a health condition (e.g., headache, back pain, anxiety)"
            value={newCondition}
            onChange={(e) => setNewCondition(e.target.value)}
            variant="outlined"
            sx={{ mr: 1, flexGrow: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddCondition}
            disabled={!newCondition.trim()}
            startIcon={<AddIcon />}
          >
            Add
          </Button>
        </Box>

        <ChipContainer>
          {profile?.conditions?.length > 0 ? (
            profile.conditions.map((condition, index) => (
              <Chip
                key={index}
                label={condition}
                onDelete={() => handleRemoveCondition(condition)}
                color="primary"
                variant="outlined"
              />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No health conditions added yet
            </Typography>
          )}
        </ChipContainer>

        <Divider sx={{ my: 2 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight="500">
            Health Goals
          </Typography>

          <Box>
            {showNutritionSuggestions && (
              <Tooltip title="Add nutrition goals">
                <IconButton
                  color="success"
                  size="small"
                  onClick={handleOpenSuggestions}
                  sx={{ mr: 1 }}
                >
                  <RestaurantIcon />
                </IconButton>
              </Tooltip>
            )}

            <Menu
              anchorEl={suggestionsAnchorEl}
              open={Boolean(suggestionsAnchorEl)}
              onClose={handleCloseSuggestions}
            >
              <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
                Nutrition Goals
              </Typography>
              {NUTRITION_GOALS.map((goal, index) => (
                <MenuItem
                  key={index}
                  onClick={() => handleAddSuggestedGoal(goal)}
                  disabled={profile?.goals?.includes(goal)}
                >
                  <ListItemIcon>
                    <RestaurantIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText primary={goal} />
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" mb={1}>
          <TextField
            size="small"
            placeholder="Add a health goal (e.g., lose weight, reduce stress, improve sleep)"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            variant="outlined"
            sx={{ mr: 1, flexGrow: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddGoal}
            disabled={!newGoal.trim()}
            startIcon={<AddIcon />}
          >
            Add
          </Button>
        </Box>

        {showNutritionSuggestions && (
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Suggested nutrition goals:
            </Typography>
            <Box>
              {NUTRITION_GOALS.slice(0, 3).map((goal, index) => (
                <SuggestionChip
                  key={index}
                  label={goal}
                  icon={<RestaurantIcon />}
                  variant="outlined"
                  color="success"
                  onClick={() => handleAddSuggestedGoal(goal)}
                  disabled={profile?.goals?.includes(goal)}
                />
              ))}
              <Tooltip title="More suggestions">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={handleOpenSuggestions}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        )}

        <ChipContainer>
          {profile?.goals?.length > 0 ? (
            profile.goals.map((goal, index) => {
              // Check if it's a nutrition-related goal
              const isNutritionGoal = [
                "nutrition",
                "nutritious",
                "food",
                "diet",
                "eating",
                "meal",
              ].some((keyword) =>
                goal.toLowerCase().includes(keyword.toLowerCase())
              );

              return (
                <Chip
                  key={index}
                  label={goal}
                  onDelete={() => handleRemoveGoal(goal)}
                  color={isNutritionGoal ? "success" : "secondary"}
                  variant="outlined"
                  icon={isNutritionGoal ? <RestaurantIcon /> : undefined}
                />
              );
            })
          ) : (
            <Typography variant="body2" color="text.secondary">
              No health goals added yet
            </Typography>
          )}
        </ChipContainer>
      </StyledPaper>

      <StyledPaper>
        <Typography
          variant="h6"
          fontWeight="500"
          mb={2}
          display="flex"
          alignItems="center"
        >
          <HistoryIcon sx={{ mr: 1 }} color="primary" />
          Health History
        </Typography>

        {profile?.history?.length > 0 ? (
          profile.history
            .slice()
            .reverse()
            .map((item, index) => (
              <HistoryItem key={index}>
                <Typography variant="body2" fontWeight="500">
                  {item.status}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(item.date).toLocaleString()}
                </Typography>
              </HistoryItem>
            ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No health history available
          </Typography>
        )}
      </StyledPaper>
    </Box>
  );
};

export default HealthProfile;
