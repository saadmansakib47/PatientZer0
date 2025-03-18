import Post from "../model/post.js";

export const createPost = async (request, response) => {
  try {
    console.log("Received post data:", request.body);

    // Ensure picture is a string
    const postData = {
      ...request.body,
      picture:
        request.body.picture && typeof request.body.picture === "object"
          ? request.body.picture.data
          : request.body.picture,
    };

    // Check if post content is nutrition-related and suggest tags
    const suggestedTags = suggestNutritionTags(postData);
    if (
      suggestedTags.length > 0 &&
      (!postData.tags || postData.tags.length === 0)
    ) {
      postData.tags = suggestedTags;
    }

    const post = await new Post(postData);
    await post.save();

    response.status(200).json({
      msg: "Post saved successfully",
      isSuccess: true,
      post,
      suggestedTags: suggestedTags.length > 0 ? suggestedTags : undefined,
    });
  } catch (error) {
    console.error("Create post error:", error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return response.status(400).json({
        msg: "A post with this title already exists. Please choose a different title.",
        isSuccess: false,
        field: "title",
        error: {
          code: error.code,
          keyPattern: error.keyPattern,
        },
      });
    }

    response.status(500).json({
      msg: error.message || "Error creating post",
      isSuccess: false,
      error: {
        message: error.message,
        code: error.code,
      },
    });
  }
};

export const updatePost = async (request, response) => {
  try {
    const post = await Post.findById(request.params.id);

    if (!post) {
      return response.status(404).json({ msg: "Post not found" });
    }

    const updateData = { ...request.body };

    // Check if content was updated and suggest nutrition tags
    if (updateData.title || updateData.description) {
      const postData = {
        title: updateData.title || post.title,
        description: updateData.description || post.description,
        categories: updateData.categories || post.categories,
      };

      const suggestedTags = suggestNutritionTags(postData);

      // If we have suggested tags and no tags were provided in the update
      if (suggestedTags.length > 0 && !updateData.tags) {
        // Merge with existing tags if any
        const existingTags = post.tags || [];
        const newTags = [...new Set([...existingTags, ...suggestedTags])];
        updateData.tags = newTags;
      }
    }

    await Post.findByIdAndUpdate(request.params.id, { $set: updateData });

    const updatedPost = await Post.findById(request.params.id);

    response.status(200).json({
      msg: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Update post error:", error);
    response.status(500).json({
      msg: "Error updating post",
      error: error.message,
    });
  }
};

export const deletePost = async (request, response) => {
  try {
    const post = await Post.findById(request.params.id);

    if (!post) {
      return response.status(404).json({ msg: "Post not found" });
    }

    await post.delete();

    response.status(200).json("post deleted successfully");
  } catch (error) {
    response.status(500).json(error);
  }
};

export const getPost = async (request, response) => {
  try {
    const post = await Post.findById(request.params.id);

    if (!post) {
      return response.status(404).json({ msg: "Post not found" });
    }

    // Check if post is nutrition-related
    const isNutritious = post.isNutritiousPost
      ? post.isNutritiousPost()
      : false;

    response.status(200).json({
      ...post.toObject(),
      isNutritious,
    });
  } catch (error) {
    response.status(500).json(error);
  }
};

export const getAllPosts = async (request, response) => {
  let username = request.query.username;
  let category = request.query.category;
  let tag = request.query.tag;
  let nutritious = request.query.nutritious === "true";
  let page = parseInt(request.query.page) || 1;
  let limit = parseInt(request.query.limit) || 10;
  let posts;
  try {
    const query = {};
    if (username) query.username = username;

    // Handle category filtering with support for both categories field and tags array
    if (category) {
      query.$or = [
        { categories: category }, // Exact match for categories field
        { tags: category }, // MongoDB will match if the array contains this value
      ];
    }

    // Filter by tag if provided
    if (tag) {
      query.tags = { $in: [new RegExp(tag, 'i')] }; // Case-insensitive tag matching
    }

    const skip = (page - 1) * limit;

    posts = await Post.find(query)
      .sort({ createdDate: -1 })
      .skip(skip)
      .limit(limit);

    // If nutritious filter is applied, filter posts in memory
    if (nutritious) {
      posts = posts.filter((post) => {
        try {
          return post.isNutritiousPost();
        } catch (error) {
          console.error("Error checking if post is nutritious:", error);
          return false;
        }
      });
    }

    // Add isNutritious flag to each post
    const postsWithNutritionInfo = posts.map((post) => {
      const isNutritious = post.isNutritiousPost
        ? post.isNutritiousPost()
        : false;
      return {
        ...post.toObject(),
        isNutritious,
      };
    });

    const total = await Post.countDocuments(query);

    response.status(200).json({
      posts: postsWithNutritionInfo,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    response.status(500).json({
      msg: "Error fetching posts",
      error: error.message,
    });
  }
};

// Helper function to suggest nutrition tags based on post content
const suggestNutritionTags = (postData) => {
  if (!postData.title && !postData.description) {
    return [];
  }

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
    "vitamin",
    "mineral",
    "nutrient",
    "organic",
    "whole food",
  ];

  const content = `${postData.title || ""} ${postData.description || ""} ${
    postData.categories || ""
  }`.toLowerCase();

  // Check if content contains nutrition keywords
  const matchedKeywords = nutritionKeywords.filter((keyword) =>
    content.includes(keyword.toLowerCase())
  );

  if (matchedKeywords.length === 0) {
    return [];
  }

  // Map matched keywords to appropriate tags
  const tagMap = {
    nutrition: "nutritious",
    nutritious: "nutritious",
    food: "food",
    diet: "diet",
    eating: "healthy-eating",
    meal: "meal-planning",
    recipe: "recipes",
    healthy: "healthy-eating",
    vegetable: "vegetables",
    fruit: "fruits",
    protein: "protein",
    vitamin: "vitamins",
    mineral: "minerals",
    nutrient: "nutritious",
    organic: "organic",
    "whole food": "whole-foods",
  };

  // Get suggested tags based on matched keywords
  const suggestedTags = matchedKeywords.map(
    (keyword) => tagMap[keyword] || keyword
  );

  // Remove duplicates
  return [...new Set(suggestedTags)];
};

export const votePost = async (request, response) => {
  try {
    const { id } = request.params;
    const { username, voteType } = request.body;

    const post = await Post.findById(id);
    if (!post) {
      return response
        .status(404)
        .json({ msg: "Post not found", isSuccess: false });
    }

    // Check if user has already voted
    const hasUpvoted = post.upvotes.includes(username);
    const hasDownvoted = post.downvotes.includes(username);

    // Remove any existing votes by this user
    post.upvotes = post.upvotes.filter((voter) => voter !== username);
    post.downvotes = post.downvotes.filter((voter) => voter !== username);

    // Apply new vote only if it's different from the previous one
    // If clicking the same button, it will act as an unvote
    if (voteType === "upvote" && !hasUpvoted) {
      post.upvotes.push(username);
    } else if (voteType === "downvote" && !hasDownvoted) {
      post.downvotes.push(username);
    }
    // If clicking the same button again, the vote is removed (unvote)

    // Update score
    post.score = post.upvotes.length - post.downvotes.length;

    await post.save();

    // Return the complete updated post
    response.status(200).json({
      msg:
        hasUpvoted || hasDownvoted
          ? "Vote removed successfully"
          : "Vote updated successfully",
      isSuccess: true,
      data: {
        upvotes: post.upvotes,
        downvotes: post.downvotes,
        score: post.score,
        _id: post._id,
        title: post.title,
        description: post.description,
        picture: post.picture,
        username: post.username,
        categories: post.categories,
        createdDate: post.createdDate,
      },
    });
  } catch (error) {
    console.error("Vote post error:", error);
    response.status(500).json({
      msg: error.message || "Error updating vote",
      isSuccess: false,
      error: {
        message: error.message,
        code: error.code,
      },
    });
  }
};

export const searchPosts = async (request, response) => {
  try {
    const { query } = request.query;
    if (!query) {
      return response.status(400).json({
        msg: "Search query is required",
        isSuccess: false,
      });
    }

    // Create a case-insensitive regex for the search query
    const searchRegex = new RegExp(query, "i");

    // Search in title, description, username, categories, and tags
    const posts = await Post.find({
      $or: [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { username: { $regex: searchRegex } },
        { categories: { $regex: searchRegex } },
        { tags: { $regex: searchRegex } }, // Add search in tags array
      ],
    })
      .sort({ createdDate: -1 })
      .limit(10); // Limit to 10 results for better performance

    response.status(200).json({
      msg: "Posts retrieved successfully",
      isSuccess: true,
      data: posts,
    });
  } catch (error) {
    console.error("Search posts error:", error);
    response.status(500).json({
      msg: error.message,
      isSuccess: false,
    });
  }
};
