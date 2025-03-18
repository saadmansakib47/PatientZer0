import mongoose from "mongoose";

const PostSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    // Remove unique constraint or make it case-sensitive
    // unique: true
  },
  description: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
    required: false,
  },
  username: {
    type: String,
    required: true,
  },
  categories: {
    type: String, // Keeping for backward compatibility
    required: false,
  },
  tags: {
    type: [String], // Array of strings for multiple tags
    default: [],
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  upvotes: [
    {
      type: String, // Store usernames of users who upvoted
      required: true,
    },
  ],
  downvotes: [
    {
      type: String, // Store usernames of users who downvoted
      required: true,
    },
  ],
  score: {
    type: Number,
    default: 0,
  },
});

// Create a compound index for title and username to allow same titles for different users
PostSchema.index({ title: 1, username: 1 }, { unique: true });

// Add text indexes for search
PostSchema.index({ 
  title: 'text', 
  description: 'text',
  categories: 'text',
  tags: 'text'
});

// Define common nutrition-related tags for suggestions
PostSchema.statics.NUTRITION_TAGS = [
  'nutritious',
  'healthy-eating',
  'diet',
  'protein',
  'vegetables',
  'fruits',
  'meal-planning',
  'recipes',
  'balanced-diet',
  'vitamins',
  'minerals',
  'whole-foods',
  'organic',
  'plant-based'
];

// Method to check if post is nutrition-related
PostSchema.methods.isNutritiousPost = function() {
  const nutritionKeywords = [
    "nutrition", "nutritious", "food", "diet", "eating", "meal", 
    "recipe", "healthy", "vegetable", "fruit", "protein"
  ];
  
  // Check tags
  const hasTags = this.tags && this.tags.some(tag => 
    nutritionKeywords.some(keyword => 
      tag.toLowerCase().includes(keyword.toLowerCase())
    )
  );
  
  // Check categories
  const hasCategories = this.categories && 
    nutritionKeywords.some(keyword => 
      this.categories.toLowerCase().includes(keyword.toLowerCase())
    );
  
  // Check title and description
  const hasTitle = this.title && 
    nutritionKeywords.some(keyword => 
      this.title.toLowerCase().includes(keyword.toLowerCase())
    );
  
  const hasDescription = this.description && 
    nutritionKeywords.some(keyword => 
      this.description.toLowerCase().includes(keyword.toLowerCase())
    );
  
  return hasTags || hasCategories || hasTitle || hasDescription;
};

const post = mongoose.model("post", PostSchema);

export default post;
