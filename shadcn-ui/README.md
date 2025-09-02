# NutriLearn - Nutrition Tracking App

A modern, responsive nutrition tracking web application built with vanilla HTML, CSS, and JavaScript, designed to integrate with Supabase for cloud-based data storage.

## Features

- 🔐 **User Authentication** - Sign up and login functionality
- 📊 **Daily Nutrition Tracking** - Monitor calories, protein, carbs, and fat
- 🍎 **Food Database** - Pre-loaded with common food items
- 📈 **Visual Progress** - Interactive charts showing daily progress
- 📱 **Responsive Design** - Works on desktop and mobile devices
- ☁️ **Cloud Storage** - Supabase integration for data persistence
- 🎯 **Goal Setting** - Personalized daily calorie goals

## Setup Instructions

### 1. Supabase Configuration

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Update the configuration in `script.js`:

```javascript
const SUPABASE_URL = 'your-project-url';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

### 2. Database Setup

Run the following SQL in your Supabase SQL editor:

```sql
-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  daily_calorie_goal INTEGER DEFAULT 2000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create foods table
CREATE TABLE foods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  calories_per_unit DECIMAL NOT NULL,
  protein DECIMAL NOT NULL,
  carbs DECIMAL NOT NULL,
  fat DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create meals table
CREATE TABLE meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  food_id UUID REFERENCES foods(id),
  food_name TEXT NOT NULL,
  quantity DECIMAL NOT NULL,
  calories DECIMAL NOT NULL,
  protein DECIMAL NOT NULL,
  carbs DECIMAL NOT NULL,
  fat DECIMAL NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  meal_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX meals_user_id_idx ON meals(user_id);
CREATE INDEX meals_date_idx ON meals(meal_date);
CREATE INDEX users_email_idx ON users(email);

-- Insert sample foods
INSERT INTO foods (name, calories_per_unit, protein, carbs, fat, unit) VALUES
('Apple', 95, 0.5, 25, 0.3, 'medium'),
('Banana', 105, 1.3, 27, 0.4, 'medium'),
('Chicken Breast', 165, 31, 0, 3.6, '100g'),
('Brown Rice', 216, 5, 45, 1.8, 'cup'),
('Broccoli', 55, 4, 11, 0.4, 'cup'),
('Salmon', 206, 22, 0, 12, '100g'),
('Greek Yogurt', 100, 17, 6, 0, 'cup'),
('Oatmeal', 147, 5, 25, 3, 'cup'),
('Eggs', 70, 6, 0.6, 5, 'large'),
('Avocado', 234, 3, 12, 21, 'medium');
```

### 3. Deployment Options

#### GitHub Pages
1. Push all files to a GitHub repository
2. Go to Settings > Pages
3. Select source branch (usually `main`)
4. Your app will be available at `https://yourusername.github.io/repository-name`

#### Netlify
1. Drag and drop the project folder to [netlify.com](https://netlify.com)
2. Or connect your GitHub repository for automatic deployments

#### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts

## File Structure

```
nutrilearn/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Demo Mode

The app includes a demo mode that uses localStorage when Supabase is not configured. This allows you to test the functionality before setting up the database.

## Features Overview

### Authentication
- Email/password signup and login
- Secure session management
- User profile with calorie goals

### Meal Tracking
- Add meals from food database
- Categorize by meal type (breakfast, lunch, dinner, snack)
- Automatic nutrition calculation
- Daily meal history

### Nutrition Analysis
- Real-time calorie tracking
- Macronutrient breakdown (protein, carbs, fat)
- Visual progress charts
- Goal vs. actual comparison

### User Interface
- Clean, modern design
- Responsive layout
- Toast notifications
- Loading states
- Form validation

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please create an issue in the GitHub repository.