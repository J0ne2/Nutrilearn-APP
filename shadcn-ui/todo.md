# NutriLearn - Nutrition Tracking App MVP

## Core Features to Implement
1. **Authentication System** - Simple login/signup with localStorage
2. **Dashboard** - Main overview with daily nutrition stats
3. **Meal Tracking** - Add/view meals and calculate calories
4. **Food Database** - Basic food items with nutritional info
5. **Daily Summary** - Track daily calorie intake vs goals

## Files to Create/Modify
1. `src/pages/Index.tsx` - Landing page with auth forms
2. `src/pages/Dashboard.tsx` - Main dashboard after login
3. `src/pages/AddMeal.tsx` - Form to add meals
4. `src/components/AuthForm.tsx` - Login/signup component
5. `src/components/MealCard.tsx` - Display meal information
6. `src/components/NutritionChart.tsx` - Daily nutrition visualization
7. `src/lib/auth.ts` - Authentication utilities
8. `src/lib/nutrition.ts` - Nutrition calculation utilities
9. `index.html` - Update title to "NutriLearn"

## Data Structure
- Users: { id, email, password, dailyCalorieGoal }
- Meals: { id, userId, name, calories, protein, carbs, fat, date }
- Foods: { id, name, caloriesPerUnit, protein, carbs, fat }

## Implementation Priority
1. Basic auth system with localStorage
2. Simple food database with common items
3. Meal tracking functionality
4. Dashboard with daily summary
5. Basic nutrition visualization