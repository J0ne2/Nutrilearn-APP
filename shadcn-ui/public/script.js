import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';

// Supabase configuration
const SUPABASE_URL = "https://ywbyuqiuvnvgyqlztuje.supabase.co";
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Ynl1cWl1dm52Z3lxbHp0dWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NjA4NjUsImV4cCI6MjA3MjIzNjg2NX0.SVvxLSGoc9waK78m1jrQ4cab40WuekHhWzArN5d4L-0';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Get current user
async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Error fetching current user:", error.message);
    return null;
  }
  return user;
}

// Signup
async function signUp(email, password, username) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    console.error("Signup failed:", error.message);
    return null;
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .insert([{
      id: data.user.id,
      username: username || email.split("@")[0]
    }]);

  if (profileError) console.error("Profile creation failed:", profileError.message);
  return data.user;
}

// Login
async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error("Login failed:", error.message);
    return null;
  }
  return data.user;
}

// Logout
async function logout() {
  await supabase.auth.signOut();
  console.log("User logged out");
}

// Add new food item
async function addFoodItem(name, calories, protein, carbs, fats) {
  const { data, error } = await supabase
    .from("food_items")
    .insert([{
      name,
      calories,
      protein,
      carbs,
      fats
    }]);

  if (error) console.error("Error adding food item:", error.message);
  return data;
}

// Get all food items
async function getFoodItems() {
  const { data, error } = await supabase.from("food_items").select("*");
  if (error) {
    console.error("Error fetching food items:", error.message);
    return [];
  }
  return data;
}

// Log a meal
async function logMeal(userId, foodName, calories, protein, carbs, fats, mealType, portionSize) {
  const { data, error } = await supabase
    .from("nutrition_logs")
    .insert([{
      user_id: userId,
      food_name: foodName,
      calories,
      protein,
      carbs,
      fats,
      meal_type: mealType,
      portion_size: portionSize
    }]);

  if (error) console.error("Error logging meal:", error.message);
  return data;
}

// Fetch meals for a user
async function getUserMeals(userId) {
  const { data, error } = await supabase
    .from("nutrition_logs")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching meals:", error.message);
    return [];
  }
  return data;
}

// Add a goal
async function addGoal(userId, goalType, targetValue, unit, deadline) {
  const { data, error } = await supabase
    .from("goals")
    .insert([{
      user_id: userId,
      goal_type: goalType,
      target_value: targetValue,
      current_value: 0,
      unit,
      deadline
    }]);

  if (error) console.error("Error adding goal:", error.message);
  return data;
}

// Fetch user goals
async function getUserGoals(userId) {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching goals:", error.message);
    return [];
  }
  return data;
}

// Save subscription
async function saveSubscription(userId, planName) {
  const { data, error } = await supabase
    .from("subscriptions

")
    .insert([{
      user_id: userId,
      plan: planName
    }]);

  if (error) console.error("Error saving subscription:", error.message);
  return data;
}

// Fetch subscription
async function getUserSubscription(userId) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching subscription:", error.message);
    return null;
  }
  return data;
}

export {
  getCurrentUser,
  signUp,
  login,
  logout,
  addFoodItem,
  getFoodItems,
  logMeal,
  getUserMeals,
  addGoal,
  getUserGoals,
  saveSubscription,
  getUserSubscription
};
