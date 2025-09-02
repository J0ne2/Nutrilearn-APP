// Intasend Payment Integration for NutriLearn
// Configuration - Replace with your actual Intasend credentials
const INTASEND_TOKEN = 'YOUR-API-TOKEN';
const INTASEND_PUBLISHABLE_KEY = 'INTASEND_PUBLISHABLE_KEY';
const INTASEND_BASE_URL = 'https://sandbox.intasend.com/api/v1'; // Use https://payment.intasend.com/api/v1 for production

// Subscription plans
const SUBSCRIPTION_PLANS = {
    basic: {
        id: 'basic',
        name: 'Basic Plan',
        price: 500, // KES 5.00 (in cents)
        currency: 'KES',
        duration: 30, // days
        features: [
            'Track up to 50 meals per month',
            'Basic nutrition analysis',
            'Daily progress charts',
            'Mobile app access'
        ]
    },
    premium: {
        id: 'premium',
        name: 'Premium Plan',
        price: 1000, // KES 10.00 (in cents)
        currency: 'KES',
        duration: 30, // days
        features: [
            'Unlimited meal tracking',
            'Advanced nutrition analysis',
            'Weekly & monthly reports',
            'Custom food database',
            'Export data to CSV',
            'Priority support'
        ]
    },
    yearly: {
        id: 'yearly',
        name: 'Yearly Plan',
        price: 10000, // KES 100.00 (in cents)
        currency: 'KES',
        duration: 365, // days
        features: [
            'All Premium features',
            '2 months free',
            'Nutrition consultation',
            'Custom meal plans',
            'API access'
        ]
    }
};

// Payment state
let currentPaymentSession = null;

// M-Pesa STK Push payment function
async function initiateMpesaPayment(planId, phoneNumber, userEmail) {
    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) {
        throw new Error('Invalid subscription plan');
    }

    try {
        const response = await fetch(`${INTASEND_BASE_URL}/payment/collection/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${INTASEND_TOKEN}`,
                'X-IntaSend-Public-Key': INTASEND_PUBLISHABLE_KEY
            },
            body: JSON.stringify({
                first_name: currentUser.email.split('@')[0],
                last_name: 'User',
                email: userEmail,
                host: window.location.origin,
                amount: plan.price / 100, // Convert cents to KES
                phone_number: phoneNumber,
                api_ref: `nutrilearn_${planId}_${Date.now()}`,
                method: 'M-PESA',
                currency: plan.currency,
                comment: `NutriLearn ${plan.name} Subscription`
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || data.message || 'Payment initiation failed');
        }

        return data;
    } catch (error) {
        console.error('M-Pesa payment error:', error);
        throw error;
    }
}

// Card payment function
async function initiateCardPayment(planId, userEmail) {
    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) {
        throw new Error('Invalid subscription plan');
    }

    try {
        const response = await fetch(`${INTASEND_BASE_URL}/payment/collection/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${INTASEND_TOKEN}`,
                'X-IntaSend-Public-Key': INTASEND_PUBLISHABLE_KEY
            },
            body: JSON.stringify({
                first_name: currentUser.email.split('@')[0],
                last_name: 'User',
                email: userEmail,
                host: window.location.origin,
                amount: plan.price / 100, // Convert cents to KES
                api_ref: `nutrilearn_${planId}_${Date.now()}`,
                method: 'CARD',
                currency: plan.currency,
                comment: `NutriLearn ${plan.name} Subscription`,
                redirect_url: window.location.origin + '/payment-success'
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.detail || data.message || 'Payment initiation failed');
        }

        return data;
    } catch (error) {
        console.error('Card payment error:', error);
        throw error;
    }
}

// Process subscription payment with payment method selection
async function processSubscription(planId) {
    if (!currentUser) {
        showToast('Please login to subscribe', 'error');
        return;
    }
    
    const plan = SUBSCRIPTION_PLANS[planId];
    
    // Show payment method selection modal
    showPaymentMethodModal(planId);
}

// Show payment method selection modal
function showPaymentMethodModal(planId) {
    const plan = SUBSCRIPTION_PLANS[planId];
    const modal = document.createElement('div');
    modal.id = 'payment-method-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div class="text-center mb-6">
                <h3 class="text-xl font-bold text-gray-900 mb-2">Choose Payment Method</h3>
                <p class="text-gray-600">Subscribe to ${plan.name} - KES ${plan.price / 100}</p>
            </div>
            
            <div class="space-y-4">
                <!-- M-Pesa Payment -->
                <div class="border border-gray-200 rounded-lg p-4 hover:border-green-500 cursor-pointer" onclick="selectMpesaPayment('${planId}')">
                    <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <span class="text-green-600 font-bold">M</span>
                        </div>
                        <div>
                            <h4 class="font-medium text-gray-900">M-Pesa</h4>
                            <p class="text-sm text-gray-600">Pay with your M-Pesa mobile money</p>
                        </div>
                    </div>
                </div>
                
                <!-- Card Payment -->
                <div class="border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer" onclick="selectCardPayment('${planId}')">
                    <div class="flex items-center space-x-3">
                        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span class="text-blue-600 font-bold">💳</span>
                        </div>
                        <div>
                            <h4 class="font-medium text-gray-900">Credit/Debit Card</h4>
                            <p class="text-sm text-gray-600">Pay with Visa, Mastercard, or other cards</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="mt-6 text-center">
                <button onclick="closePaymentMethodModal()" class="text-gray-500 hover:text-gray-700">
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Close payment method modal
function closePaymentMethodModal() {
    const modal = document.getElementById('payment-method-modal');
    if (modal) {
        modal.remove();
    }
}

// Select M-Pesa payment
function selectMpesaPayment(planId) {
    closePaymentMethodModal();
    showMpesaModal(planId);
}

// Select Card payment
function selectCardPayment(planId) {
    closePaymentMethodModal();
    processCardPayment(planId);
}

// Show M-Pesa phone number input modal
function showMpesaModal(planId) {
    const plan = SUBSCRIPTION_PLANS[planId];
    const modal = document.createElement('div');
    modal.id = 'mpesa-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div class="text-center mb-6">
                <h3 class="text-xl font-bold text-gray-900 mb-2">M-Pesa Payment</h3>
                <p class="text-gray-600">Subscribe to ${plan.name} - KES ${plan.price / 100}</p>
            </div>
            
            <form id="mpesa-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">M-Pesa Phone Number</label>
                    <input type="tel" id="mpesa-phone" placeholder="254712345678" required 
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                    <p class="text-xs text-gray-500 mt-1">Enter your M-Pesa registered phone number</p>
                </div>
                
                <div class="flex space-x-3">
                    <button type="submit" class="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md">
                        Pay with M-Pesa
                    </button>
                    <button type="button" onclick="closeMpesaModal()" class="px-4 py-2 text-gray-600 hover:text-gray-800">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle M-Pesa form submission
    document.getElementById('mpesa-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const phoneNumber = document.getElementById('mpesa-phone').value;
        await processMpesaPayment(planId, phoneNumber);
    });
}

// Close M-Pesa modal
function closeMpesaModal() {
    const modal = document.getElementById('mpesa-modal');
    if (modal) {
        modal.remove();
    }
}

// Process M-Pesa payment
async function processMpesaPayment(planId, phoneNumber) {
    showLoadingOverlay('Initiating M-Pesa payment...');
    
    try {
        closeMpesaModal();
        
        const paymentResponse = await initiateMpesaPayment(planId, phoneNumber, currentUser.email);
        
        hideLoadingOverlay();
        showToast('M-Pesa payment initiated! Check your phone for the payment prompt.', 'info');
        
        // Poll for payment status
        pollPaymentStatus(paymentResponse.id || paymentResponse.invoice_id, planId);
        
    } catch (error) {
        hideLoadingOverlay();
        showToast(`M-Pesa payment failed: ${error.message}`, 'error');
    }
}

// Process Card payment
async function processCardPayment(planId) {
    showLoadingOverlay('Redirecting to card payment...');
    
    try {
        const paymentResponse = await initiateCardPayment(planId, currentUser.email);
        
        if (paymentResponse.redirect_url) {
            // Redirect to card payment page
            window.location.href = paymentResponse.redirect_url;
        } else {
            throw new Error('Payment redirect URL not provided');
        }
        
    } catch (error) {
        hideLoadingOverlay();
        showToast(`Card payment failed: ${error.message}`, 'error');
    }
}

// Poll payment status
async function pollPaymentStatus(paymentId, planId, attempts = 0) {
    const maxAttempts = 30; // Poll for 5 minutes (30 * 10 seconds)
    
    if (attempts >= maxAttempts) {
        showToast('Payment verification timeout. Please contact support if payment was deducted.', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${INTASEND_BASE_URL}/payment/status/${paymentId}/`, {
            headers: {
                'Authorization': `Bearer ${INTASEND_TOKEN}`,
                'X-IntaSend-Public-Key': INTASEND_PUBLISHABLE_KEY
            }
        });
        
        const data = await response.json();
        
        if (data.invoice && data.invoice.state === 'COMPLETE') {
            await handlePaymentSuccess(data, planId);
        } else if (data.invoice && data.invoice.state === 'FAILED') {
            handlePaymentFailure(data);
        } else {
            // Continue polling
            setTimeout(() => {
                pollPaymentStatus(paymentId, planId, attempts + 1);
            }, 10000); // Poll every 10 seconds
        }
        
    } catch (error) {
        console.error('Payment status check error:', error);
        setTimeout(() => {
            pollPaymentStatus(paymentId, planId, attempts + 1);
        }, 10000);
    }
}

// Handle successful payment
async function handlePaymentSuccess(results, planId) {
    try {
        // Update user subscription in database
        const subscriptionData = {
            user_id: currentUser.id,
            plan_id: planId,
            plan_name: SUBSCRIPTION_PLANS[planId].name,
            amount_paid: SUBSCRIPTION_PLANS[planId].price / 100,
            currency: SUBSCRIPTION_PLANS[planId].currency,
            payment_reference: results.invoice.invoice_id,
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + (SUBSCRIPTION_PLANS[planId].duration * 24 * 60 * 60 * 1000)).toISOString(),
            status: 'active'
        };
        
        const saved = await saveSubscription(subscriptionData);
        
        if (saved.success) {
            // Update current user with subscription info
            currentUser.subscription = subscriptionData;
            localStorage.setItem('nutrilearn_current_user', JSON.stringify(currentUser));
            
            showToast(`Successfully subscribed to ${SUBSCRIPTION_PLANS[planId].name}!`, 'success');
            closeSubscriptionModal();
            updateSubscriptionUI();
        } else {
            throw new Error('Failed to save subscription');
        }
        
    } catch (error) {
        console.error('Subscription save error:', error);
        showToast('Payment successful but subscription activation failed. Please contact support.', 'error');
    }
}

// Handle payment failure
function handlePaymentFailure(results) {
    showToast('Payment was cancelled or failed. Please try again.', 'error');
    console.error('Payment failed:', results);
}

// Save subscription to database
async function saveSubscription(subscriptionData) {
    try {
        if (supabase) {
            // Create subscriptions table if it doesn't exist
            const { data, error } = await supabase
                .from('subscriptions')
                .insert([subscriptionData]);
                
            if (error) throw error;
            return { success: true, data };
        } else {
            // Demo mode - save to localStorage
            const subscriptions = JSON.parse(localStorage.getItem('nutrilearn_subscriptions') || '[]');
            subscriptionData.id = Date.now().toString();
            subscriptions.push(subscriptionData);
            localStorage.setItem('nutrilearn_subscriptions', JSON.stringify(subscriptions));
            return { success: true };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Check subscription status
async function checkSubscriptionStatus(userId) {
    try {
        if (supabase) {
            const { data, error } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', userId)
                .eq('status', 'active')
                .gte('end_date', new Date().toISOString())
                .order('created_at', { ascending: false })
                .limit(1);
                
            if (error) throw error;
            return data.length > 0 ? data[0] : null;
        } else {
            // Demo mode
            const subscriptions = JSON.parse(localStorage.getItem('nutrilearn_subscriptions') || '[]');
            const activeSubscription = subscriptions.find(sub => 
                sub.user_id === userId && 
                sub.status === 'active' && 
                new Date(sub.end_date) > new Date()
            );
            return activeSubscription || null;
        }
    } catch (error) {
        console.error('Subscription check error:', error);
        return null;
    }
}

// Show subscription modal
function showSubscriptionModal() {
    const modal = document.getElementById('subscription-modal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Close subscription modal
function closeSubscriptionModal() {
    const modal = document.getElementById('subscription-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Update subscription UI
function updateSubscriptionUI() {
    const subscriptionStatus = document.getElementById('subscription-status');
    const upgradeBtn = document.getElementById('upgrade-btn');
    
    if (currentUser && currentUser.subscription) {
        const sub = currentUser.subscription;
        const endDate = new Date(sub.end_date);
        const daysLeft = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
        
        subscriptionStatus.innerHTML = `
            <div class="flex items-center space-x-2">
                <span class="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                <span class="text-sm text-green-600 font-medium">${sub.plan_name}</span>
                <span class="text-xs text-gray-500">(${daysLeft} days left)</span>
            </div>
        `;
        
        upgradeBtn.textContent = 'Manage Subscription';
    } else {
        subscriptionStatus.innerHTML = `
            <div class="flex items-center space-x-2">
                <span class="inline-block w-2 h-2 bg-gray-400 rounded-full"></span>
                <span class="text-sm text-gray-600">Free Plan</span>
            </div>
        `;
        
        upgradeBtn.textContent = 'Upgrade Plan';
    }
}

// Show loading overlay
function showLoadingOverlay(message = 'Loading...') {
    const overlay = document.createElement('div');
    overlay.id = 'payment-loading';
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
        <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p class="text-gray-600">${message}</p>
        </div>
    `;
    document.body.appendChild(overlay);
}

// Hide loading overlay
function hideLoadingOverlay() {
    const overlay = document.getElementById('payment-loading');
    if (overlay) {
        overlay.remove();
    }
}

// Check subscription limits
function checkSubscriptionLimits(action) {
    if (!currentUser.subscription) {
        // Free plan limits
        if (action === 'add_meal') {
            const monthlyMeals = todaysMeals.length; // Simplified - should check monthly count
            if (monthlyMeals >= 50) {
                showSubscriptionModal();
                return false;
            }
        }
    }
    return true;
}

// Export functions for global access
window.processSubscription = processSubscription;
window.showSubscriptionModal = showSubscriptionModal;
window.closeSubscriptionModal = closeSubscriptionModal;
window.checkSubscriptionLimits = checkSubscriptionLimits;
window.selectMpesaPayment = selectMpesaPayment;
window.selectCardPayment = selectCardPayment;
window.closePaymentMethodModal = closePaymentMethodModal;
window.closeMpesaModal = closeMpesaModal;