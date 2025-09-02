import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DailySummary } from '@/lib/nutrition';

interface NutritionChartProps {
  summary: DailySummary;
}

export default function NutritionChart({ summary }: NutritionChartProps) {
  const calorieProgress = (summary.totalCalories / summary.goalCalories) * 100;
  const isOverGoal = summary.totalCalories > summary.goalCalories;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Nutrition Summary</CardTitle>
        <CardDescription>Your progress for today</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Calorie Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Calories</span>
            <span className="text-sm text-muted-foreground">
              {Math.round(summary.totalCalories)} / {summary.goalCalories}
            </span>
          </div>
          <Progress 
            value={Math.min(calorieProgress, 100)} 
            className="h-3"
          />
          <div className="text-center">
            <span className={`text-sm font-medium ${isOverGoal ? 'text-red-600' : 'text-green-600'}`}>
              {isOverGoal 
                ? `${Math.round(summary.totalCalories - summary.goalCalories)} over goal`
                : `${Math.round(summary.remainingCalories)} remaining`
              }
            </span>
          </div>
        </div>

        {/* Macronutrients */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {Math.round(summary.totalProtein)}g
            </div>
            <div className="text-sm text-muted-foreground">Protein</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(summary.totalCarbs)}g
            </div>
            <div className="text-sm text-muted-foreground">Carbs</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(summary.totalFat)}g
            </div>
            <div className="text-sm text-muted-foreground">Fat</div>
          </div>
        </div>

        {/* Calorie Breakdown */}
        <div className="space-y-2">
          <h4 className="font-medium">Calorie Breakdown</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Protein (4 cal/g)</span>
              <span>{Math.round(summary.totalProtein * 4)} cal</span>
            </div>
            <div className="flex justify-between">
              <span>Carbs (4 cal/g)</span>
              <span>{Math.round(summary.totalCarbs * 4)} cal</span>
            </div>
            <div className="flex justify-between">
              <span>Fat (9 cal/g)</span>
              <span>{Math.round(summary.totalFat * 9)} cal</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}