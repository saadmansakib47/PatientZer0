import axios from "axios";
import { API } from "./api";
import { categories } from "../constants/data";

const API_URL = "http://localhost:8000";

// Get health profile for a user
export const getHealthProfile = async (username) => {
  try {
    // Check if access token exists
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      console.log("No access token found, returning empty profile");
      return {
        username,
        conditions: [],
        goals: [],
        currentStatus: "",
        history: [],
      };
    }

    // Try to get profile from local storage first
    const storedProfile = localStorage.getItem(`health_profile_${username}`);
    if (storedProfile) {
      return JSON.parse(storedProfile);
    }

    // If not in local storage, return default profile
    const defaultProfile = {
      username,
      conditions: [],
      goals: [],
      currentStatus: "",
      history: [],
    };

    // Save to local storage
    localStorage.setItem(`health_profile_${username}`, JSON.stringify(defaultProfile));
    return defaultProfile;
  } catch (error) {
    console.error("Error fetching health profile:", error);
    // For errors, return a default profile
    return {
      username,
      conditions: [],
      goals: [],
      currentStatus: "",
      history: [],
    };
  }
};

// Update health profile
export const updateHealthProfile = async (data) => {
  try {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("No access token found");
    }

    // Get existing profile from local storage
    const storedProfile = localStorage.getItem(`health_profile_${data.username}`);
    let profile = storedProfile ? JSON.parse(storedProfile) : { 
      username: data.username,
      conditions: [],
      goals: [],
      currentStatus: "",
      history: []
    };

    // Update with new data
    profile = { 
      ...profile,
      ...data,
      conditions: data.conditions || profile.conditions || [],
      goals: data.goals || profile.goals || [],
      history: data.history || profile.history || []
    };

    // Save to local storage
    localStorage.setItem(`health_profile_${data.username}`, JSON.stringify(profile));

    return { profile };
  } catch (error) {
    console.error("Error updating health profile:", error);
    throw error;
  }
};

// Mock analysis function with improved category matching
const mockAnalyzeText = (text) => {
  if (!text) return [];
  
  const lowercaseText = text.toLowerCase();
  const categoryKeywords = {
    'Nutrition': ['food', 'diet', 'eating', 'nutrition', 'meal', 'vitamin', 'protein', 'carbs', 'fat', 'weight'],
    'Mental Health': ['stress', 'anxiety', 'depression', 'mental', 'mood', 'therapy', 'emotional', 'psychological', 'meditation', 'mindfulness'],
    'Exercise': ['workout', 'exercise', 'fitness', 'training', 'gym', 'cardio', 'strength', 'running', 'sports', 'physical activity'],
    'Chronic Diseases': ['diabetes', 'hypertension', 'asthma', 'arthritis', 'heart disease', 'chronic', 'condition', 'blood pressure', 'cholesterol']
  };

  // Only return exact categories that are in the data.js file
  return categories
    .filter(cat => {
      // Skip "Healthy Living" category as specified
      if (cat.type === "Healthy Living") return false;
      
      // Match against keywords for this category
      const keywords = categoryKeywords[cat.type];
      return keywords && keywords.some(keyword => lowercaseText.includes(keyword));
    })
    .map(cat => cat.type);
};

// Analyze current health status
export const analyzeHealthStatus = async (username, statusUpdate) => {
  try {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken || !statusUpdate) {
      return { categories: [], insights: [] };
    }

    // Use local analysis until backend is ready
    const matchedCategories = mockAnalyzeText(statusUpdate);
    
    return {
      categories: matchedCategories,
      insights: [`Your status update matches ${matchedCategories.length} health categories`]
    };
  } catch (error) {
    console.error("Error analyzing health status:", error);
    return { categories: [], insights: [] };
  }
};

// Analyze health condition
export const analyzeHealthCondition = async (username, condition, isRemoval = false) => {
  try {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken || !condition) {
      return { categories: [], insights: [] };
    }

    // Use local analysis until backend is ready
    const matchedCategories = mockAnalyzeText(condition);
    
    return {
      categories: isRemoval ? [] : matchedCategories,
      insights: isRemoval ? 
        [`Removed condition from ${matchedCategories.length} health categories`] :
        [`Added condition to ${matchedCategories.length} health categories`]
    };
  } catch (error) {
    console.error("Error analyzing health condition:", error);
    return { categories: [], insights: [] };
  }
};

// Analyze health goals
export const analyzeHealthGoals = async (username, goals) => {
  try {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken || !goals?.length) {
      return { categories: [], insights: [] };
    }

    // Use local analysis until backend is ready
    const allCategories = goals.flatMap(goal => mockAnalyzeText(goal));
    const uniqueCategories = [...new Set(allCategories)];
    
    return {
      categories: uniqueCategories,
      insights: [`Your goals align with ${uniqueCategories.length} health categories`]
    };
  } catch (error) {
    console.error("Error analyzing health goals:", error);
    return { categories: [], insights: [] };
  }
};

// Get health recommendations based on health profile
export const getHealthRecommendations = async (username) => {
  try {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      console.log("No access token found, returning empty recommendations");
      return [];
    }

    console.log("Fetching recommendations for user:", username);
    
    // Use the existing API to get all posts
    const postsResponse = await API.getAllPosts({
      limit: 50  // Get more posts to have a good selection
    });

    if (!postsResponse || !postsResponse.isSuccess) {
      console.log("Error fetching posts:", postsResponse);
      return [];
    }

    // Extract posts from the response, handling different response formats
    let posts = [];
    if (postsResponse.data?.posts && Array.isArray(postsResponse.data.posts)) {
      posts = postsResponse.data.posts;
    } else if (Array.isArray(postsResponse.data)) {
      posts = postsResponse.data;
    }

    if (!posts.length) {
      return [];
    }

    // Transform posts to include categories based on content
    const postsWithCategories = posts.map(post => {
      const titleCategories = mockAnalyzeText(post.title || '');
      const descriptionCategories = mockAnalyzeText(post.description || '');
      const allCategories = [...new Set([...titleCategories, ...descriptionCategories])];
      
      return {
        ...post,
        categories: allCategories
      };
    });

    return postsWithCategories.filter(post => post.categories.length > 0);

  } catch (error) {
    console.error("Error fetching health recommendations:", error);
    return [];
  }
};

// Get health profile analysis
export const getHealthAnalysis = async (username) => {
  try {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("No access token found");
    }

    const response = await axios.post(
      `${API_URL}/health/analyze`,
      { username },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error getting health analysis:", error);
    return {
      summary: "Unable to analyze health profile",
      recommendations: [
        "Please update your health profile to get personalized recommendations",
      ],
    };
  }
};
