const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.serializeUser((user, done) => {
  console.log("Serializing user:", user.id);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    console.log("Deserializing user:", id);
    done(null, user);
  } catch (error) {
    console.error("Error deserializing user:", error);
    done(error, null);
  }
});

// Only set up Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log("Setting up Google OAuth strategy");

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
        scope: ["profile", "email"],
        proxy: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log(
            "Google profile received:",
            profile.id,
            profile.emails[0].value
          );

          // Check if user already exists in our database
          let user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            console.log("Existing user found:", user.email);
            // If user exists but was registered with password, update with Google info
            if (!user.googleId) {
              console.log("Updating existing user with Google ID");
              user.googleId = profile.id;
              user.profilePhoto = user.profilePhoto || profile.photos[0].value;
              await user.save();
            }
            return done(null, user);
          }

          console.log("Creating new user from Google profile");
          // If user doesn't exist, create a new user
          const newUser = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            password: "google-oauth-" + Math.random().toString(36).substring(2), // Random password for Google users
            role: "patient", // Default role - you may want to collect this info separately
            profilePhoto: profile.photos[0].value,
            additionalInfo: {
              // Default values - you may want to collect this info separately
            },
          });

          await newUser.save();
          console.log("New user created:", newUser.email);
          return done(null, newUser);
        } catch (error) {
          console.error("Error in Google strategy callback:", error);
          return done(error, null);
        }
      }
    )
  );
} else {
  console.log(
    "Google OAuth credentials not found. Google authentication is disabled."
  );
}

module.exports = passport;
