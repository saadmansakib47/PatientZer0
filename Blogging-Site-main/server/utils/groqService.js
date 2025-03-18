import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Get content recommendations based on user health profile and post history
 * @param {Object} healthProfile - User's health profile
 * @param {Array} posts - Available posts
 * @returns {Array} - Recommended post IDs with reasoning
 */
export const getRecommendations = async (healthProfile, posts) => {
  try {
    if (!healthProfile || !posts || posts.length === 0) {
      console.log("No health profile or posts available");
      return [];
    }

    // Get relevant categories from GROQ
    const relevantCategories = await getRelevantCategories(healthProfile);
    console.log("Relevant categories for recommendations:", relevantCategories);

    if (relevantCategories.length === 0) {
      console.log("No relevant categories found");
      return [];
    }

    // Filter posts that have matching tags or categories
    const recommendations = posts
      .map(post => {
        // Check if post has any matching tags
        const hasMatchingTags = post.tags && post.tags.some(tag =>
          relevantCategories.some(category => 
            tag.toLowerCase().includes(category.toLowerCase())
          )
        );

        // Check if post has matching category
        const hasMatchingCategory = post.categories && 
          relevantCategories.some(category =>
            post.categories.toLowerCase().includes(category.toLowerCase())
          );

        // Only include posts with matching tags or category
        if (hasMatchingTags || hasMatchingCategory) {
          const matchedCategories = relevantCategories.filter(category => {
            const matchesTag = post.tags && post.tags.some(tag =>
              tag.toLowerCase().includes(category.toLowerCase())
            );
            const matchesCategory = post.categories && 
              post.categories.toLowerCase().includes(category.toLowerCase());
            return matchesTag || matchesCategory;
          });

          return {
            ...post.toObject(),
            relevanceScore: 100, // All matching posts get same score
            reasoning: `Post tagged with relevant categories: ${matchedCategories.join(", ")}`,
            matchedCategories
          };
        }
        return null;
      })
      .filter(post => post !== null) // Remove non-matching posts
      .slice(0, 5); // Take top 5

    console.log(`Found ${recommendations.length} recommendations`);
    return recommendations;
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return [];
  }
};

/**
 * Get relevant health categories based on user input
 * @param {Object} healthProfile - User's health profile
 * @returns {Array} - Relevant health categories
 */
export const getRelevantCategories = async (healthProfile) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY not found in environment");
      return [];
    }

    const categories = [
      "Nutrition",
      "Mental Health",
      "Exercise",
      "Chronic Diseases",
      "Healthy Living"
    ];

    const prompt = `You are a health category classifier. Based on the user's health profile, determine which of these categories are most relevant: ${categories.join(", ")}

User's Health Profile:
- Current Status: ${healthProfile.currentStatus || "None"}
- Health Conditions: ${healthProfile.conditions?.join(", ") || "None"}
- Health Goals: ${healthProfile.goals?.join(", ") || "None"}

Return your response as a JSON array containing ONLY the matching category names from the list provided. For example: ["Nutrition", "Exercise"]

Consider:
1. Direct mentions of categories
2. Synonyms or related terms
3. Implied health needs
4. Current status context

Return only categories from the provided list that are clearly relevant to the user's health profile.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a health category classifier that matches user health profiles to relevant health categories.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama3-70b-8192",
      temperature: 0.2,
      max_tokens: 100,
      top_p: 0.9,
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0]?.message?.content || "[]";
    console.log("GROQ Response:", responseContent);

    try {
      const parsedResponse = JSON.parse(responseContent);
      const relevantCategories = Array.isArray(parsedResponse) ? parsedResponse : parsedResponse.categories || [];
      
      // Validate that returned categories are from our list
      const validCategories = relevantCategories.filter(cat => categories.includes(cat));
      console.log("Valid categories:", validCategories);
      
      return validCategories;
    } catch (error) {
      console.error("Error parsing GROQ response:", error);
      return [];
    }
  } catch (error) {
    console.error("Error getting relevant categories:", error);
    return [];
  }
};

/**
 * Check if user has nutrition-related interests based on their profile
 * @param {Object} healthProfile - User's health profile
 * @returns {Boolean} - Whether user has nutrition interest
 */
const checkNutritionInterest = (healthProfile) => {
  const nutritionKeywords = [
    "nutrition",
    "nutritious",
    "food",
    "diet",
    "eating",
    "meal",
    "weight",
    "healthy eating",
    "balanced diet",
    "nutrients",
    "vitamins",
    "protein",
  ];

  // Check goals
  const hasNutritionGoal = healthProfile.goals.some((goal) =>
    nutritionKeywords.some((keyword) =>
      goal.toLowerCase().includes(keyword.toLowerCase())
    )
  );

  // Check current status
  const hasNutritionStatus = nutritionKeywords.some((keyword) =>
    healthProfile.currentStatus.toLowerCase().includes(keyword.toLowerCase())
  );

  return hasNutritionGoal || hasNutritionStatus;
};

/**
 * Boost relevance scores for posts with nutrition-related tags
 * @param {Array} recommendations - Original recommendations
 * @param {Array} posts - All available posts
 * @returns {Array} - Recommendations with boosted scores
 */
const boostNutritionPosts = (recommendations, postsData) => {
  return recommendations.map((rec) => {
    const post = postsData.find((p) => p.id === rec.postId);

    if (post) {
      // Check if post is nutrition-related
      const nutritionKeywords = [
        "nutrition",
        "nutritious",
        "food",
        "diet",
        "eating",
        "meal",
        "recipe",
        "healthy",
        "vegetable",
        "fruit",
        "protein",
      ];

      // Check tags
      const hasTags =
        post.tags &&
        post.tags.some((tag) =>
          nutritionKeywords.some((keyword) =>
            tag.toLowerCase().includes(keyword.toLowerCase())
          )
        );

      // Check categories
      const hasCategories =
        post.categories &&
        post.categories.some((category) =>
          nutritionKeywords.some((keyword) =>
            category.toLowerCase().includes(keyword.toLowerCase())
          )
        );

      // Check title and description
      const hasTitle =
        post.title &&
        nutritionKeywords.some((keyword) =>
          post.title.toLowerCase().includes(keyword.toLowerCase())
        );

      const hasDescription =
        post.description &&
        nutritionKeywords.some((keyword) =>
          post.description.toLowerCase().includes(keyword.toLowerCase())
        );

      // Boost score if nutrition-related
      if (hasTags || hasCategories || hasTitle || hasDescription) {
        const boostAmount = 15; // Boost by 15 points (but don't exceed 100)
        const newScore = Math.min(100, rec.relevanceScore + boostAmount);

        return {
          ...rec,
          relevanceScore: newScore,
          reasoning: rec.reasoning + " (Boosted due to nutrition content)",
        };
      }
    }

    return rec;
  });
};

/**
 * Analyze user's current health status update
 * @param {String} previousStatus - User's previous status update
 * @param {String} currentStatus - User's current status update
 * @param {Object} profile - User's health profile
 * @returns {Object} - Analysis of the status update
 */
export const analyzeHealthStatus = async (
  previousStatus,
  currentStatus,
  profile
) => {
  try {
    if (!currentStatus) {
      return null;
    }

    // Check if status mentions nutrition
    const nutritionKeywords = [
      "nutrition",
      "nutritious",
      "food",
      "diet",
      "eating",
      "meal",
      "recipe",
      "healthy",
      "vegetable",
      "fruit",
      "protein",
    ];

    const mentionsNutrition = nutritionKeywords.some((keyword) =>
      currentStatus.toLowerCase().includes(keyword.toLowerCase())
    );

    // Create a prompt for the AI
    let prompt = `Analyze the user's health status update and identify any health conditions or changes mentioned.

Previous status: ${previousStatus || "None"}
Current status: ${currentStatus}

User's existing health conditions: ${profile.conditions.join(", ") || "None"}
User's health goals: ${profile.goals.join(", ") || "None"}

`;

    if (mentionsNutrition) {
      prompt += `The user has mentioned nutrition or food in their status update. Please pay special attention to any dietary needs, preferences, or nutrition-related health concerns.

`;
    }

    prompt += `Please analyze the status update and provide:
1. Any specific health condition mentioned or implied
2. Whether this is a new condition or an update to an existing one
3. Whether the user needs dietary or nutrition advice based on their status

Format your response as a JSON object with the following structure:
{
  "condition": "identified health condition or null if none detected",
  "isNew": true/false,
  "needsNutrition": true/false,
  "analysis": "brief analysis of the status update"
}

Only include the JSON object in your response, with no additional text.`;

    // Call the AI model
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a health analysis system that identifies health conditions and provides insights from user status updates.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama3-70b-8192",
      temperature: 0.3,
      max_tokens: 512,
      top_p: 0.9,
      response_format: { type: "json_object" },
    });

    // Parse the response
    const responseContent = completion.choices[0]?.message?.content || "{}";

    try {
      return JSON.parse(responseContent);
    } catch (error) {
      console.error("Error parsing AI analysis response:", error);
      return null;
    }
  } catch (error) {
    console.error("Error analyzing health status:", error);
    return null;
  }
};

// Helper function to check if a post is nutrition-related
const isNutritiousPost = (post) => {
  const nutritionKeywords = [
    "nutrition",
    "nutritious",
    "food",
    "diet",
    "eating",
    "meal",
    "recipe",
    "healthy",
    "vegetable",
    "fruit",
    "protein",
  ];

  // Check tags
  const hasTags =
    post.tags &&
    post.tags.some((tag) =>
      nutritionKeywords.some((keyword) =>
        tag.toLowerCase().includes(keyword.toLowerCase())
      )
    );

  // Check categories
  const hasCategories =
    post.categories &&
    post.categories.some((category) =>
      nutritionKeywords.some((keyword) =>
        category.toLowerCase().includes(keyword.toLowerCase())
      )
    );

  // Check title and description
  const hasTitle =
    post.title &&
    nutritionKeywords.some((keyword) =>
      post.title.toLowerCase().includes(keyword.toLowerCase())
    );

  const hasDescription =
    post.description &&
    nutritionKeywords.some((keyword) =>
      post.description.toLowerCase().includes(keyword.toLowerCase())
    );

  return hasTags || hasCategories || hasTitle || hasDescription;
};
