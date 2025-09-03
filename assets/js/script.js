// NutriLearn - Nutrition Tracking App with Supabase Integration
// Configuration - Replace with your actual Supabase credentials
const SUPABASE_URL = 'https://ywbyuqiuvnvgyqlztuje.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3Ynl1cWl1dm52Z3lxbHp0dWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NjA4NjUsImV4cCI6MjA3MjIzNjg2NX0.SVvxLSGoc9waK78m1jrQ4cab40WuekHhWzArN5d4L-0'
// Create and export the Supabase client';

// Initialize Supabase client (will be replaced with actual credentials)
let supabase;
try {
    if (typeof window !== 'undefined' && window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
} catch (error) {
    console.log('Supabase not initialized - using demo mode');
}

// App state
let currentUser = null;
let foods = [];
let todaysMeals = [];
let calorieChart = null;

// Demo food data (will be replaced by Supabase data)
const demoFoods = [
    { id: '1', name: 'Apple', calories_per_unit: 95, protein: 0.5, carbs: 25, fat: 0.3, unit: 'medium' },
    { id: '2', name: 'Banana', calories_per_unit: 105, protein: 1.3, carbs: 27, fat: 0.4, unit: 'medium' },
    { id: '3', name: 'Chicken Breast', calories_per_unit: 165, protein: 31, carbs: 0, fat: 3.6, unit: '100g' },
    { id: '4', name: 'Brown Rice', calories_per_unit: 216, protein: 5, carbs: 45, fat: 1.8, unit: 'cup' },
    { id: '5', name: 'Broccoli', calories_per_unit: 55, protein: 4, carbs: 11, fat: 0.4, unit: 'cup' },
    { id: '6', name: 'Salmon', calories_per_unit: 206, protein: 22, carbs: 0, fat: 12, unit: '100g' },
    { id: '7', name: 'Greek Yogurt', calories_per_unit: 100, protein: 17, carbs: 6, fat: 0, unit: 'cup' },
    { id: '8', name: 'Oatmeal', calories_per_unit: 147, protein: 5, carbs: 25, fat: 3, unit: 'cup' },
    { id: '9', name: 'Eggs', calories_per_unit: 70, protein: 6, carbs: 0.6, fat: 5, unit: 'large' },
    { id: '10', name: 'Avocado', calories_per_unit: 234, protein: 3, carbs: 12, fat: 21, unit: 'medium' }
];

// Utility functions
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-gray-400 hover:text-gray-600">×</button>
        </div>
    `;
    
    document.getElementById('toast-container').appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

// Authentication functions
async function signUp(email, password, dailyGoal = 2000) {
    try {
        if (supabase) {
            // Real Supabase authentication
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
            });
            
            if (error) throw error;
            
            // Create user profile
            const { error: profileError } = await supabase
                .from('users')
                .insert([{ 
                    id: data.user.id,
                    email: email,
                    daily_calorie_goal: dailyGoal 
                }]);
                
            if (profileError) throw profileError;
            
            return { success: true, user: data.user };
        } else {
            // Demo mode - use localStorage
            const users = JSON.parse(localStorage.getItem('nutrilearn_users') || '[]');
            
            if (users.find(u => u.email === email)) {
                throw new Error('User already exists');
            }
            
            const newUser = {
                id: Date.now().toString(),
                email: email,
                password: password, // In real app, this would be hashed
                daily_calorie_goal: dailyGoal
            };
            
            users.push(newUser);
            localStorage.setItem('nutrilearn_users', JSON.stringify(users));
            localStorage.setItem('nutrilearn_current_user', JSON.stringify({
                id: newUser.id,
                email: newUser.email,
                daily_calorie_goal: newUser.daily_calorie_goal
            }));
            
            return { success: true, user: newUser };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function login(email, password) {
    try {
        if (supabase) {
            // Real Supabase authentication
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });
            
            if (error) throw error;
            
            // Get user profile
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', data.user.id)
                .single();
                
            if (profileError) throw profileError;
            
            return { success: true, user: profile };
        } else {
            // Demo mode - use localStorage
            const users = JSON.parse(localStorage.getItem('nutrilearn_users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);
            
            if (!user) {
                throw new Error('Invalid credentials');
            }
            
            localStorage.setItem('nutrilearn_current_user', JSON.stringify({
                id: user.id,
                email: user.email,
                daily_calorie_goal: user.daily_calorie_goal
            }));
            
            return { success: true, user: user };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function logout() {
    try {
        if (supabase) {
            await supabase.auth.signOut();
        }
        localStorage.removeItem('nutrilearn_current_user');
        currentUser = null;
        showAuthScreen();
    } catch (error) {
        console.error('Logout error:', error);
    }
}

function getCurrentUser() {
    const stored = localStorage.getItem('nutrilearn_current_user');
    return stored ? JSON.parse(stored) : null;
}

// Data functions
async function loadFoods() {
    try {
        if (supabase) {
            const { data, error } = await supabase
                .from('foods')
                .select('*')
                .order('name');
                
            if (error) throw error;
            foods = data;
        } else {
            // Demo mode
            foods = demoFoods;
        }
        
        populateFoodSelect();
    } catch (error) {
        console.error('Error loading foods:', error);
        foods = demoFoods;
        populateFoodSelect();
    }
}

async function loadTodaysMeals() {
    if (!currentUser) return;
    
    try {
        if (supabase) {
            const { data, error } = await supabase
                .from('meals')
                .select('*')
                .eq('user_id', currentUser.id)
                .eq('meal_date', getCurrentDate())
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            todaysMeals = data;
        } else {
            // Demo mode
            const allMeals = JSON.parse(localStorage.getItem('nutrilearn_meals') || '[]');
            todaysMeals = allMeals.filter(meal => 
                meal.user_id === currentUser.id && 
                meal.meal_date === getCurrentDate()
            );
        }
        
        displayMeals();
        updateNutritionSummary();
    } catch (error) {
        console.error('Error loading meals:', error);
        showToast('Error loading meals', 'error');
    }
}

async function saveMeal(mealData) {
    try {
        if (supabase) {
            const { data, error } = await supabase
                .from('meals')
                .insert([{
                    user_id: currentUser.id,
                    food_id: mealData.food_id,
                    food_name: mealData.food_name,
                    quantity: mealData.quantity,
                    calories: mealData.calories,
                    protein: mealData.protein,
                    carbs: mealData.carbs,
                    fat: mealData.fat,
                    meal_type: mealData.meal_type,
                    meal_date: getCurrentDate()
                }]);
                
            if (error) throw error;
        } else {
            // Demo mode
            const allMeals = JSON.parse(localStorage.getItem('nutrilearn_meals') || '[]');
            const newMeal = {
                id: Date.now().toString(),
                user_id: currentUser.id,
                ...mealData,
                meal_date: getCurrentDate(),
                created_at: new Date().toISOString()
            };
            
            allMeals.push(newMeal);
            localStorage.setItem('nutrilearn_meals', JSON.stringify(allMeals));
        }
        
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// UI functions
function showScreen(screenId) {
    const screens = ['loading', 'auth-screen', 'dashboard-screen', 'add-meal-screen'];
    screens.forEach(screen => {
        document.getElementById(screen).classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

function showAuthScreen() {
    showScreen('auth-screen');
}

async function showDashboard() {
    showScreen('dashboard-screen');
    document.getElementById('user-email').textContent = currentUser.email;
    document.getElementById('current-date').textContent = formatDate(new Date());
    
    // Load subscription status and update UI
    await loadUserSubscription();
    updateSubscriptionUI();
    
    loadTodaysMeals();
}

function showAddMeal() {
    // Check subscription limits before allowing meal addition
    if (!checkSubscriptionLimits('add_meal')) {
        return;
    }
    showScreen('add-meal-screen');
}

function populateFoodSelect() {
    const select = document.getElementById('food-select');
    select.innerHTML = '<option value="">Select a food item</option>';
    
    foods.forEach(food => {
        const option = document.createElement('option');
        option.value = food.id;
        option.textContent = `${food.name} (${food.calories_per_unit} cal per ${food.unit})`;
        option.dataset.food = JSON.stringify(food);
        select.appendChild(option);
    });
}

function displayMeals() {
    const container = document.getElementById('meals-container');
    const noMeals = document.getElementById('no-meals');
    
    if (todaysMeals.length === 0) {
        noMeals.classList.remove('hidden');
        container.innerHTML = '';
        container.appendChild(noMeals);
        return;
    }
    
    noMeals.classList.add('hidden');
    container.innerHTML = '';
    
    todaysMeals.forEach(meal => {
        const mealCard = document.createElement('div');
        mealCard.className = `meal-card ${meal.meal_type} fade-in`;
        mealCard.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <h3 class="text-lg font-semibold">${meal.food_name}</h3>
                <span class="meal-type-badge ${meal.meal_type}">${meal.meal_type}</span>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                    <span class="text-gray-600">Quantity:</span>
                    <div class="font-medium">${meal.quantity}</div>
                </div>
                <div>
                    <span class="text-gray-600">Calories:</span>
                    <div class="font-medium text-orange-600">${Math.round(meal.calories)}</div>
                </div>
                <div>
                    <span class="text-gray-600">Protein:</span>
                    <div class="font-medium text-red-600">${Math.round(meal.protein)}g</div>
                </div>
                <div>
                    <span class="text-gray-600">Carbs:</span>
                    <div class="font-medium text-blue-600">${Math.round(meal.carbs)}g</div>
                </div>
                <div>
                    <span class="text-gray-600">Fat:</span>
                    <div class="font-medium text-green-600">${Math.round(meal.fat)}g</div>
                </div>
            </div>
        `;
        container.appendChild(mealCard);
    });
}

function updateNutritionSummary() {
    const totalCalories = todaysMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = todaysMeals.reduce((sum, meal) => sum + meal.protein, 0);
    const totalCarbs = todaysMeals.reduce((sum, meal) => sum + meal.carbs, 0);
    const totalFat = todaysMeals.reduce((sum, meal) => sum + meal.fat, 0);
    
    document.getElementById('total-protein').textContent = `${Math.round(totalProtein)}g`;
    document.getElementById('total-carbs').textContent = `${Math.round(totalCarbs)}g`;
    document.getElementById('total-fat').textContent = `${Math.round(totalFat)}g`;
    
    updateCalorieChart(totalCalories, currentUser.daily_calorie_goal);
}

function updateCalorieChart(consumed, goal) {
    const ctx = document.getElementById('calorieChart').getContext('2d');
    
    if (calorieChart) {
        calorieChart.destroy();
    }
    
    const remaining = Math.max(0, goal - consumed);
    const over = Math.max(0, consumed - goal);
    
    calorieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: over > 0 ? ['Consumed', 'Over Goal'] : ['Consumed', 'Remaining'],
            datasets: [{
                data: over > 0 ? [goal, over] : [consumed, remaining],
                backgroundColor: over > 0 ? ['#ef4444', '#fca5a5'] : ['#10b981', '#e5e7eb'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            cutout: '70%'
        }
    });
    
    // Add center text
    const centerText = over > 0 
        ? `${Math.round(over)} over`
        : `${Math.round(remaining)} left`;
    
    Chart.register({
        id: 'centerText',
        beforeDraw: function(chart) {
            const ctx = chart.ctx;
            ctx.save();
            ctx.font = 'bold 16px Arial';
            ctx.fillStyle = over > 0 ? '#ef4444' : '#10b981';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            ctx.fillText(`${Math.round(consumed)}`, centerX, centerY - 10);
            ctx.font = '12px Arial';
            ctx.fillText(centerText, centerX, centerY + 10);
            ctx.restore();
        }
    });
}

function updateNutritionPreview() {
    const foodSelect = document.getElementById('food-select');
    const quantityInput = document.getElementById('quantity');
    const preview = document.getElementById('nutrition-preview');
    
    if (!foodSelect.value || !quantityInput.value) {
        preview.classList.add('hidden');
        return;
    }
    
    const selectedOption = foodSelect.options[foodSelect.selectedIndex];
    const food = JSON.parse(selectedOption.dataset.food);
    const quantity = parseFloat(quantityInput.value) || 0;
    
    const calories = food.calories_per_unit * quantity;
    const protein = food.protein * quantity;
    const carbs = food.carbs * quantity;
    const fat = food.fat * quantity;
    
    document.getElementById('preview-calories').textContent = Math.round(calories);
    document.getElementById('preview-protein').textContent = `${Math.round(protein)}g`;
    document.getElementById('preview-carbs').textContent = `${Math.round(carbs)}g`;
    document.getElementById('preview-fat').textContent = `${Math.round(fat)}g`;
    
    preview.classList.remove('hidden');
}

// Subscription functions
async function loadUserSubscription() {
    if (!currentUser) return;
    
    try {
        const subscription = await checkSubscriptionStatus(currentUser.id);
        if (subscription) {
            currentUser.subscription = subscription;
            localStorage.setItem('nutrilearn_current_user', JSON.stringify(currentUser));
        }
    } catch (error) {
        console.error('Error loading subscription:', error);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', async function() {
    // Check authentication status
    currentUser = getCurrentUser();
    
    if (currentUser) {
        await loadFoods();
        showDashboard();
    } else {
        showAuthScreen();
    }
    
    // Hide loading screen
    document.getElementById('loading').classList.add('hidden');
    
    // Auth tab switching
    document.getElementById('login-tab').addEventListener('click', function() {
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('signup-form').classList.add('hidden');
        this.classList.add('bg-white', 'shadow-sm', 'text-green-600');
        this.classList.remove('text-gray-600');
        document.getElementById('signup-tab').classList.remove('bg-white', 'shadow-sm', 'text-green-600');
        document.getElementById('signup-tab').classList.add('text-gray-600');
    });
    
    document.getElementById('signup-tab').addEventListener('click', function() {
        document.getElementById('signup-form').classList.remove('hidden');
        document.getElementById('login-form').classList.add('hidden');
        this.classList.add('bg-white', 'shadow-sm', 'text-green-600');
        this.classList.remove('text-gray-600');
        document.getElementById('login-tab').classList.remove('bg-white', 'shadow-sm', 'text-green-600');
        document.getElementById('login-tab').classList.add('text-gray-600');
    });
    
    // Login form
    document.getElementById('login-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        const result = await login(email, password);
        if (result.success) {
            currentUser = result.user;
            await loadFoods();
            showDashboard();
            showToast('Login successful!', 'success');
        } else {
            showToast(result.error, 'error');
        }
    });
    
    // Signup form
    document.getElementById('signup-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const dailyGoal = parseInt(document.getElementById('daily-goal').value);
        
        const result = await signUp(email, password, dailyGoal);
        if (result.success) {
            currentUser = result.user;
            await loadFoods();
            showDashboard();
            showToast('Account created successfully!', 'success');
        } else {
            showToast(result.error, 'error');
        }
    });
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // Upgrade button
    document.getElementById('upgrade-btn').addEventListener('click', showSubscriptionModal);
    
    // Add meal buttons
    document.getElementById('add-meal-btn').addEventListener('click', showAddMeal);
    document.querySelector('#no-meals button').addEventListener('click', showAddMeal);
    
    // Back to dashboard
    document.getElementById('back-to-dashboard').addEventListener('click', showDashboard);
    
    // Add meal form
    document.getElementById('add-meal-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const foodSelect = document.getElementById('food-select');
        const selectedOption = foodSelect.options[foodSelect.selectedIndex];
        const food = JSON.parse(selectedOption.dataset.food);
        const quantity = parseFloat(document.getElementById('quantity').value);
        const mealType = document.getElementById('meal-type').value;
        
        const mealData = {
            food_id: food.id,
            food_name: food.name,
            quantity: quantity,
            calories: food.calories_per_unit * quantity,
            protein: food.protein * quantity,
            carbs: food.carbs * quantity,
            fat: food.fat * quantity,
            meal_type: mealType
        };
        
        const result = await saveMeal(mealData);
        if (result.success) {
            showToast('Meal added successfully!', 'success');
            showDashboard();
        } else {
            showToast(result.error, 'error');
        }
    });
    
    // Nutrition preview updates
    document.getElementById('food-select').addEventListener('change', updateNutritionPreview);
    document.getElementById('quantity').addEventListener('input', updateNutritionPreview);
});

// Global functions for button clicks
window.showAddMeal = showAddMeal;
