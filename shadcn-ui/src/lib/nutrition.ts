export interface Food {
  id: string;
  name: string;
  caloriesPerUnit: number;
  protein: number;
  carbs: number;
  fat: number;
  unit: string;
}

export interface Meal {
  id: string;
  userId: string;
  foodId: string;
  foodName: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface DailySummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  goalCalories: number;
  remainingCalories: number;
}

const MEALS_STORAGE_KEY = 'nutrilearn_meals';

// Basic food database
export const FOODS: Food[] = [
  { id: '1', name: 'Apple', caloriesPerUnit: 95, protein: 0.5, carbs: 25, fat: 0.3, unit: 'medium' },
  { id: '2', name: 'Banana', caloriesPerUnit: 105, protein: 1.3, carbs: 27, fat: 0.4, unit: 'medium' },
  { id: '3', name: 'Chicken Breast', caloriesPerUnit: 165, protein: 31, carbs: 0, fat: 3.6, unit: '100g' },
  { id: '4', name: 'Brown Rice', caloriesPerUnit: 216, protein: 5, carbs: 45, fat: 1.8, unit: 'cup' },
  { id: '5', name: 'Broccoli', caloriesPerUnit: 55, protein: 4, carbs: 11, fat: 0.4, unit: 'cup' },
  { id: '6', name: 'Salmon', caloriesPerUnit: 206, protein: 22, carbs: 0, fat: 12, unit: '100g' },
  { id: '7', name: 'Greek Yogurt', caloriesPerUnit: 100, protein: 17, carbs: 6, fat: 0, unit: 'cup' },
  { id: '8', name: 'Oatmeal', caloriesPerUnit: 147, protein: 5, carbs: 25, fat: 3, unit: 'cup' },
  { id: '9', name: 'Eggs', caloriesPerUnit: 70, protein: 6, carbs: 0.6, fat: 5, unit: 'large' },
  { id: '10', name: 'Avocado', caloriesPerUnit: 234, protein: 3, carbs: 12, fat: 21, unit: 'medium' }
];

export const getMeals = (userId: string): Meal[] => {
  const stored = localStorage.getItem(MEALS_STORAGE_KEY);
  if (stored) {
    const allMeals: Meal[] = JSON.parse(stored);
    return allMeals.filter(meal => meal.userId === userId);
  }
  return [];
};

export const saveMeal = (meal: Omit<Meal, 'id'>): void => {
  const stored = localStorage.getItem(MEALS_STORAGE_KEY);
  const allMeals: Meal[] = stored ? JSON.parse(stored) : [];
  
  const newMeal: Meal = {
    ...meal,
    id: Date.now().toString()
  };
  
  allMeals.push(newMeal);
  localStorage.setItem(MEALS_STORAGE_KEY, JSON.stringify(allMeals));
};

export const getTodaysMeals = (userId: string): Meal[] => {
  const today = new Date().toISOString().split('T')[0];
  return getMeals(userId).filter(meal => meal.date === today);
};

export const getDailySummary = (userId: string, goalCalories: number): DailySummary => {
  const todaysMeals = getTodaysMeals(userId);
  
  const totalCalories = todaysMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = todaysMeals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = todaysMeals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFat = todaysMeals.reduce((sum, meal) => sum + meal.fat, 0);
  
  return {
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    goalCalories,
    remainingCalories: goalCalories - totalCalories
  };
};

export const getFoodById = (id: string): Food | undefined => {
  return FOODS.find(food => food.id === id);
};