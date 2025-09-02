import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, LogOut, Utensils } from 'lucide-react';
import { getCurrentUser, logout } from '@/lib/auth';
import { getDailySummary, getTodaysMeals, Meal } from '@/lib/nutrition';
import NutritionChart from '@/components/NutritionChart';
import MealCard from '@/components/MealCard';
import AddMeal from './AddMeal';

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [user, setUser] = useState(getCurrentUser());

  const loadMeals = () => {
    if (user) {
      const todaysMeals = getTodaysMeals(user.id);
      setMeals(todaysMeals);
    }
  };

  useEffect(() => {
    loadMeals();
  }, [user]);

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const handleMealAdded = () => {
    loadMeals();
    setShowAddMeal(false);
  };

  if (!user) {
    return null;
  }

  if (showAddMeal) {
    return (
      <AddMeal 
        onBack={() => setShowAddMeal(false)}
        onMealAdded={handleMealAdded}
      />
    );
  }

  const summary = getDailySummary(user.id, user.dailyCalorieGoal);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Utensils className="h-8 w-8 text-green-600" />
              <h1 className="text-2xl font-bold text-green-600">NutriLearn</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Nutrition Summary */}
          <div className="lg:col-span-1">
            <NutritionChart summary={summary} />
          </div>

          {/* Right Column - Meals */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Meal Button */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Today's Meals</CardTitle>
                    <CardDescription>
                      {new Date().toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => setShowAddMeal(true)}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Meal</span>
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Meals List */}
            {meals.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Utensils className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No meals logged today
                  </h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Start tracking your nutrition by adding your first meal
                  </p>
                  <Button onClick={() => setShowAddMeal(true)}>
                    Add Your First Meal
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {meals.map((meal) => (
                  <MealCard key={meal.id} meal={meal} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}