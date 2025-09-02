import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { FOODS, saveMeal, getFoodById } from '@/lib/nutrition';
import { toast } from 'sonner';

interface AddMealProps {
  onBack: () => void;
  onMealAdded: () => void;
}

export default function AddMeal({ onBack, onMealAdded }: AddMealProps) {
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [isLoading, setIsLoading] = useState(false);

  const user = getCurrentUser();
  const selectedFood = getFoodById(selectedFoodId);

  const calculateNutrition = () => {
    if (!selectedFood) return null;
    
    const qty = parseFloat(quantity) || 0;
    return {
      calories: selectedFood.caloriesPerUnit * qty,
      protein: selectedFood.protein * qty,
      carbs: selectedFood.carbs * qty,
      fat: selectedFood.fat * qty
    };
  };

  const nutrition = calculateNutrition();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedFood || !nutrition) return;

    setIsLoading(true);

    try {
      const meal = {
        userId: user.id,
        foodId: selectedFood.id,
        foodName: selectedFood.name,
        quantity: parseFloat(quantity),
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        date: new Date().toISOString().split('T')[0],
        mealType
      };

      saveMeal(meal);
      toast.success('Meal added successfully!');
      onMealAdded();
    } catch (error) {
      toast.error('Failed to add meal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
          <h1 className="text-2xl font-bold text-green-600">Add Meal</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Log Your Meal</CardTitle>
            <CardDescription>
              Select a food item and specify the quantity to track your nutrition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Food Selection */}
              <div className="space-y-2">
                <Label htmlFor="food">Food Item</Label>
                <Select value={selectedFoodId} onValueChange={setSelectedFoodId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a food item" />
                  </SelectTrigger>
                  <SelectContent>
                    {FOODS.map((food) => (
                      <SelectItem key={food.id} value={food.id}>
                        {food.name} ({food.caloriesPerUnit} cal per {food.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">
                  Quantity {selectedFood && `(${selectedFood.unit}s)`}
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1"
                  required
                />
              </div>

              {/* Meal Type */}
              <div className="space-y-2">
                <Label htmlFor="meal-type">Meal Type</Label>
                <Select value={mealType} onValueChange={(value: 'breakfast' | 'lunch' | 'dinner' | 'snack') => setMealType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Nutrition Preview */}
              {nutrition && selectedFood && (
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Nutrition Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Calories</p>
                        <p className="font-medium text-orange-600">
                          {Math.round(nutrition.calories)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Protein</p>
                        <p className="font-medium text-red-600">
                          {Math.round(nutrition.protein)}g
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Carbs</p>
                        <p className="font-medium text-blue-600">
                          {Math.round(nutrition.carbs)}g
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Fat</p>
                        <p className="font-medium text-green-600">
                          {Math.round(nutrition.fat)}g
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={!selectedFoodId || !quantity || isLoading}
              >
                {isLoading ? 'Adding Meal...' : 'Add Meal'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}