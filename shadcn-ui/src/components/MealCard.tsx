import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Meal } from '@/lib/nutrition';

interface MealCardProps {
  meal: Meal;
}

export default function MealCard({ meal }: MealCardProps) {
  const getMealTypeColor = (type: string) => {
    switch (type) {
      case 'breakfast':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'lunch':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'dinner':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'snack':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{meal.foodName}</CardTitle>
          <Badge className={getMealTypeColor(meal.mealType)}>
            {meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Quantity</p>
            <p className="font-medium">{meal.quantity}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Calories</p>
            <p className="font-medium text-orange-600">{Math.round(meal.calories)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Protein</p>
            <p className="font-medium text-red-600">{Math.round(meal.protein)}g</p>
          </div>
          <div>
            <p className="text-muted-foreground">Carbs</p>
            <p className="font-medium text-blue-600">{Math.round(meal.carbs)}g</p>
          </div>
          <div>
            <p className="text-muted-foreground">Fat</p>
            <p className="font-medium text-green-600">{Math.round(meal.fat)}g</p>
          </div>
          <div>
            <p className="text-muted-foreground">Date</p>
            <p className="font-medium">{new Date(meal.date).toLocaleDateString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}