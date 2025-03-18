import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  TextField,
  Chip,
  Divider,
  Alert,
  FormControlLabel,
  Switch,
  Tooltip,
  IconButton,
  Card,
  CardContent,
  Link,
  Grid,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import RecommendIcon from "@mui/icons-material/Recommend";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import InfoIcon from "@mui/icons-material/Info";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import PersonIcon from "@mui/icons-material/Person";
import TimeIcon from "@mui/icons-material/AccessTime";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  getHealthRecommendations,
  analyzeHealthStatus,
  analyzeHealthCondition,
  analyzeHealthGoals,
  getHealthProfile,
  updateHealthProfile,
} from "../../../service/healthService";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  cursor: "pointer",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
  },
}));

const StyledCardMedia = styled("div")(({ image }) => ({
  height: 200,
  backgroundImage: `url(${image})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  padding: 8
}));

const CategoryChip = styled(Chip)(({ theme }) => ({
  position: "absolute",
  top: 8,
  right: 8,
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  margin: 4,
  "& .MuiChip-icon": {
    color: theme.palette.primary.main
  }
}));

const PostTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: "1.25rem",
  marginBottom: theme.spacing(1),
  lineHeight: 1.4,
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  maxHeight: "2.8em",
}));

const PostDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(2),
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  maxHeight: "4.2em",
  lineHeight: 1.4,
}));

const MetaInfo = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  marginTop: "auto",
  color: theme.palette.text.secondary,
  "& .MuiSvgIcon-root": {
    fontSize: "1rem",
  },
}));

const MetaText = styled(Typography)({
  display: "flex",
  alignItems: "center",
  gap: 4,
  fontSize: "0.875rem",
});

const AIRecommendations = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [matchedCategories, setMatchedCategories] = useState([]);

  const fetchRecommendations = async () => {
    const accountStr = sessionStorage.getItem("account");
    const account = accountStr ? JSON.parse(accountStr) : null;
    const username = account?.username;

    if (!username || !sessionStorage.getItem("accessToken")) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Get user's health profile
      const profile = await getHealthProfile(username);
      
      // Analyze all health data to get relevant categories
      let statusCategories = [];
      let conditionsCategories = [];
      let goalsCategories = [];
      
      try {
        if (profile.currentStatus) {
          const analysis = await analyzeHealthStatus(username, profile.currentStatus);
          statusCategories = analysis.categories || [];
        }
      } catch (err) {
        console.warn('Error analyzing status:', err);
      }
      
      try {
        if (profile.conditions && profile.conditions.length > 0) {
          const conditionsResults = await Promise.all(
            profile.conditions.map(c => analyzeHealthCondition(username, c))
          );
          conditionsCategories = conditionsResults.flatMap(a => a?.categories || []);
        }
      } catch (err) {
        console.warn('Error analyzing conditions:', err);
      }
      
      try {
        if (profile.goals && profile.goals.length > 0) {
          const analysis = await analyzeHealthGoals(username, profile.goals);
          goalsCategories = analysis.categories || [];
        }
      } catch (err) {
        console.warn('Error analyzing goals:', err);
      }

      // Combine all categories from different analyses
      const allCategories = new Set([
        ...statusCategories,
        ...conditionsCategories,
        ...goalsCategories
      ]);

      console.log('Matched categories from health profile:', [...allCategories]);
      
      // Get recommendations based on categories
      const data = await getHealthRecommendations(username);
      console.log("Recommendations data:", data);

      if (Array.isArray(data) && data.length > 0) {
        // Filter recommendations to only show posts that match the user's categories
        const filteredRecommendations = data.filter(rec => {
          const recCategories = rec?.categories || [];
          const hasMatchingCategory = recCategories.some(cat => allCategories.has(cat));
          if (hasMatchingCategory) {
            // Add matchedCategories to each post for display
            rec.matchedCategories = recCategories.filter(cat => allCategories.has(cat));
          }
          return hasMatchingCategory;
        });

        setRecommendations(filteredRecommendations);
        setMatchedCategories([...allCategories].sort());
        setError(filteredRecommendations.length === 0 ? 
          "No matching recommendations found. Try updating your health profile with more details." : "");
      } else {
        setError("No recommendations available. Try updating your health profile.");
        setRecommendations([]);
        setMatchedCategories([]);
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError("Failed to load recommendations. Please try again later.");
      setRecommendations([]);
      setMatchedCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleRefresh = () => {
    fetchRecommendations();
  };

  const handleCardClick = (postId) => {
    navigate(`/details/${postId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!sessionStorage.getItem("accessToken")) {
    return (
      <Alert severity="info">
        Please log in to see personalized recommendations.
      </Alert>
    );
  }

  return (
    <StyledPaper>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" sx={{ 
          display: "flex", 
          alignItems: "center",
          fontWeight: 600,
          color: theme => theme.palette.primary.main
        }}>
          <SmartToyIcon sx={{ mr: 1.5 }} />
          AI Recommendations
        </Typography>
        <Button
          startIcon={<RecommendIcon />}
          onClick={handleRefresh}
          variant="contained"
          size="medium"
          sx={{ 
            borderRadius: 2,
            textTransform: "none",
            px: 2
          }}
        >
          Refresh
        </Button>
      </Box>

      {error ? (
        <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      ) : (
        <>
          {matchedCategories.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="subtitle1" 
                color="text.secondary" 
                sx={{ mb: 1.5, fontWeight: 500 }}
              >
                Showing posts from these categories:
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {matchedCategories.map((category) => {
                  // Determine icon based on category name
                  let icon;
                  if (category === "Nutrition") {
                    icon = <RestaurantIcon fontSize="small" />;
                  } else if (category === "Mental Health") {
                    icon = <HealthAndSafetyIcon fontSize="small" />;
                  } else if (category === "Exercise") {
                    icon = <FitnessCenterIcon fontSize="small" />;
                  } else {
                    icon = <FilterAltIcon fontSize="small" />;
                  }
                  
                  return (
                    <Chip
                      key={category}
                      label={category}
                      icon={icon}
                      color="primary"
                      variant="outlined"
                      sx={{ 
                        borderRadius: 3,
                        px: 1,
                        fontWeight: 500
                      }}
                    />
                  );
                })}
              </Box>
            </Box>
          )}

          <Grid container spacing={3} sx={{ mt: 2 }}>
            {recommendations.map((post) => (
              <Grid item xs={12} sm={6} md={4} key={post.id || post._id}>
                <StyledCard onClick={() => handleCardClick(post.id || post._id)}>
                  <Box sx={{ position: "relative" }}>
                    <StyledCardMedia image={post.picture || "https://source.unsplash.com/random?health"}>
                      {post.categories?.map((category, index) => (
                        <CategoryChip
                          key={`${post.id || post._id}-${category}-${index}`}
                          label={category}
                          size="small"
                          icon={
                            category === "Nutrition" ? (
                              <RestaurantIcon />
                            ) : category === "Mental Health" ? (
                              <HealthAndSafetyIcon />
                            ) : (
                              <FitnessCenterIcon />
                            )
                          }
                        />
                      ))}
                    </StyledCardMedia>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", pb: 1 }}>
                    <PostTitle variant="h6">{post.title}</PostTitle>
                    <PostDescription variant="body2">
                      {post.description.length > 150
                        ? `${post.description.substring(0, 150)}...`
                        : post.description}
                    </PostDescription>
                    <Box sx={{ mt: 2 }}>
                      {post.matchedCategories?.map(category => {
                        // Determine icon based on category name
                        let icon;
                        if (category === "Nutrition") {
                          icon = <RestaurantIcon fontSize="small" />;
                        } else if (category === "Mental Health") {
                          icon = <HealthAndSafetyIcon fontSize="small" />;
                        } else if (category === "Exercise") {
                          icon = <FitnessCenterIcon fontSize="small" />;
                        } else {
                          icon = <FilterAltIcon fontSize="small" />;
                        }
                        
                        return (
                          <Chip
                            key={category}
                            label={category}
                            size="small"
                            icon={icon}
                            variant="outlined"
                            sx={{ 
                              mr: 1,
                              mb: 1,
                              backgroundColor: theme => `${theme.palette.secondary.main}22`,
                              color: theme => theme.palette.secondary.dark,
                              borderColor: theme => theme.palette.secondary.light,
                            }}
                          />
                        );
                      })}
                    </Box>
                    <MetaInfo>
                      <MetaText>
                        <PersonIcon />
                        {post.username}
                      </MetaText>
                      {post.createdDate && (
                        <MetaText>
                          <TimeIcon />
                          {formatDistanceToNow(new Date(post.createdDate), {
                            addSuffix: true,
                          })}
                        </MetaText>
                      )}
                    </MetaInfo>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </StyledPaper>
  );
};

export default AIRecommendations;
