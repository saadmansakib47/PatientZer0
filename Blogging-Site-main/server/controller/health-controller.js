import HealthProfile from "../model/healthProfile.js";
import Post from "../model/post.js";
import User from "../model/user.js";
import {
  getRecommendations,
  analyzeHealthStatus,
} from "../utils/groqService.js";

// Create or update a user's health profile
export const updateHealthProfile = async (request, response) => {
  try {
    const username = request.body.username;
    const updatedData = request.body;
    console.log("\n=== Updating Health Profile ===");
    console.log("Username:", username);
    console.log("Update data:", updatedData);

    // Find existing profile or create new one
    let profile = await HealthProfile.findOne({ username });
    if (!profile) {
      profile = new HealthProfile({ username });
    }

    // Update fields if provided
    if (updatedData.conditions) profile.conditions = updatedData.conditions;
    if (updatedData.goals) profile.goals = updatedData.goals;
    if (updatedData.currentStatus) {
      // Add current status to history
      profile.history.push({
        condition: updatedData.currentStatus,
        status: "active",
        date: new Date()
      });
      profile.currentStatus = updatedData.currentStatus;
    }

    profile.lastUpdated = new Date();
    await profile.save();
    console.log("✓ Profile updated successfully");

    return response.status(200).json(profile);
  } catch (error) {
    console.error("Error updating health profile:", error);
    return response.status(500).json({ error: "Internal server error" });
  }
};

// Get a user's health profile
export const getHealthProfile = async (request, response) => {
  try {
    const username = request.params.username;

    // Verify user exists
    const user = await User.findOne({ username });
    if (!user) {
      return response.status(404).json({ error: "User not found" });
    }

    // Get or create health profile
    let profile = await HealthProfile.findOne({ username });

    if (!profile) {
      profile = new HealthProfile({ username });
      await profile.save();
    }

    return response.status(200).json(profile);
  } catch (error) {
    console.error("Error in getHealthProfile:", error);
    return response.status(500).json({ error: "Internal server error" });
  }
};

// Get AI recommendations based on health profile
export const getHealthRecommendations = async (request, response) => {
  try {
    const username = request.params.username;
    console.log("\n=== Getting Recommendations ===");
    console.log("Username:", username);

    // Verify user exists
    const user = await User.findOne({ username });
    if (!user) {
      console.log("❌ User not found:", username);
      return response.status(404).json({ error: "User not found" });
    }
    console.log("✓ Found user:", user.username);

    // Get health profile
    const profile = await HealthProfile.findOne({ username });
    if (!profile) {
      console.log("❌ Health profile not found");
      return response.status(404).json({ error: "Health profile not found" });
    }
    console.log("✓ Found health profile:", {
      conditions: profile.conditions,
      goals: profile.goals,
      currentStatus: profile.currentStatus
    });

    // Get all posts for recommendations
    const posts = await Post.find({}).populate("username", "name username");
    console.log("✓ Found posts:", posts.length);

    // DEBUG: Log each post's category
    console.log("\nPost Categories:");
    posts.forEach(post => {
      console.log(`- "${post.title}": category="${post.categories}", tags=${JSON.stringify(post.tags)}`);
    });

    if (posts.length === 0) {
      console.log("❌ No posts available for recommendations");
      return response.status(200).json([]);
    }

    // Check if GROQ API key is set
    if (!process.env.GROQ_API_KEY) {
      console.error("❌ GROQ_API_KEY not found in environment");
      return response.status(500).json({ error: "AI service not configured" });
    }
    console.log("✓ GROQ API key found");

    // Get recommendations from AI
    console.log("\nGetting AI recommendations...");
    const recommendations = await getRecommendations(profile, posts);

    console.log("\nRecommendation Details:");
    recommendations.forEach(rec => {
      console.log(`\n"${rec.title}":`);
      console.log(`- Category: ${rec.categories}`);
      console.log(`- Tags: ${rec.tags?.join(", ") || "none"}`);
      console.log(`- Score: ${rec.relevanceScore}`);
      console.log(`- Matched Categories: ${rec.matchedCategories?.join(", ")}`);
      console.log(`- Reasoning: ${rec.reasoning}`);
    });

    if (!recommendations || recommendations.length === 0) {
      console.log("❌ No recommendations returned from AI");
      return response.status(200).json([]);
    }

    console.log("✓ Returning recommendations:", recommendations.length);
    return response.status(200).json(recommendations);
  } catch (error) {
    console.error("Error in getHealthRecommendations:", error);
    return response.status(500).json({ error: "Internal server error" });
  }
};

// Helper function to check if user has nutrition-related interests
const checkNutritionInterest = (profile) => {
  if (!profile) return false;

  const nutritionKeywords = [
    "nutrition",
    "nutritious",
    "food",
    "diet",
    "eating",
    "meal",
    "healthy eating",
  ];

  // Check goals
  const hasNutritionGoal =
    profile.goals &&
    profile.goals.some((goal) =>
      nutritionKeywords.some((keyword) =>
        goal.toLowerCase().includes(keyword.toLowerCase())
      )
    );

  // Check current status
  const hasNutritionStatus =
    profile.currentStatus &&
    nutritionKeywords.some((keyword) =>
      profile.currentStatus.toLowerCase().includes(keyword.toLowerCase())
    );

  return hasNutritionGoal || hasNutritionStatus;
};

export const analyzeHealthData = async (request, response) => {
  try {
    const { username } = request.body;

    // Verify user exists
    const user = await User.findOne({ username });
    if (!user) {
      return response.status(404).json({ error: "User not found" });
    }

    // Get health profile
    const profile = await HealthProfile.findOne({ username });
    if (!profile) {
      return response.status(404).json({ error: "Health profile not found" });
    }

    // Analyze health data
    const analysis = {
      summary: "Health profile analysis",
      conditions: profile.conditions.length,
      goals: profile.goals.length,
      history: profile.history.length,
      lastUpdated: profile.lastUpdated,
      nutritionFocus: checkNutritionInterest(profile),
      recommendations: [],
    };

    // Add recommendations based on profile
    if (profile.conditions.length > 0 && profile.goals.length === 0) {
      analysis.recommendations.push(
        "Consider adding health goals to track your progress"
      );
    }

    if (
      !profile.currentStatus ||
      new Date() - new Date(profile.lastUpdated) > 7 * 24 * 60 * 60 * 1000
    ) {
      analysis.recommendations.push(
        "Update your current health status to get better recommendations"
      );
    }

    if (!analysis.nutritionFocus) {
      analysis.recommendations.push(
        "Consider adding nutrition-related goals for more personalized food recommendations"
      );
    }

    return response.status(200).json(analysis);
  } catch (error) {
    console.error("Error in analyzeHealthData:", error);
    return response.status(500).json({ error: "Internal server error" });
  }
};
