// Intasend Payment Integration for NutriLearn
// Updated with live API credentials

const INTASEND_TOKEN = 'ISSecretKey_live_07f3de46-74b3-44b8-be55-3949533fa59d';
const INTASEND_PUBLISHABLE_KEY = 'ISPubKey_live_3bebe382-f93c-40aa-81a3-020b6a6fae22';
const INTASEND_BASE_URL = 'https://payment.intasend.com/api/v1/';

// Subscription plans
const SUBSCRIPTION_PLANS = {
    basic: { name: 'Basic Plan', price: 5, currency: 'KES', duration: '1 month' },
    premium: { name: 'Premium Plan', price: 10, currency: 'KES', duration: '1 month' },
    yearly: { name: 'Yearly Plan', price: 100, currency: 'KES', duration: '12 months' }
};

class PaymentManager {
    constructor() {
        this.isProcessing = false;
        this.currentPlan = null;
    }

    // Initialize payment for selected plan
    async initiatePayment(planType, paymentMethod, phoneNumber = null) {
        if (this.isProcessing) {
            this.showMessage('Payment already in progress...', 'warning');
            return;
        }

        const plan = SUBSCRIPTION_PLANS[planType];
        if (!plan) {
            this.showMessage('Invalid subscription plan selected', 'error');
            return;
        }

        this.isProcessing = true;
        this.currentPlan = planType;
        this.showMessage('Initiating payment...', 'info');

        try {
            if (paymentMethod === 'mpesa') {
                await this.processMpesaPayment(plan, phoneNumber);
            } else if (paymentMethod === 'card') {
                await this.processCardPayment(plan);
            }
        } catch (error) {
            console.error('Payment error:', error);
            this.showMessage('Payment failed. Please try again.', 'error');
            this.isProcessing = false;
        }
    }

    // Process M-Pesa STK Push payment
    async processMpesaPayment(plan, phoneNumber) {
        if (!phoneNumber || phoneNumber.length < 10) {
            this.showMessage('Please enter a valid phone number', 'error');
            this.isProcessing = false;
            return;
        }

        // Format phone number (ensure it starts with 254)
        const formattedPhone = this.formatPhoneNumber(phoneNumber);

        const paymentData = {
            public_key: INTASEND_PUBLISHABLE_KEY,
            amount: plan.price,
            currency: plan.currency,
            phone_number: formattedPhone,
            api_ref: `nutrilearn_${Date.now()}`,
            comment: `NutriLearn ${plan.name} Subscription`
        };

        try {
            const response = await fetch(`${INTASEND_BASE_URL}checkout/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${INTASEND_TOKEN}`
                },
                body: JSON.stringify(paymentData)
            });

            const result = await response.json();

            if (response.ok && result.id) {
                this.showMessage('M-Pesa payment request sent! Check your phone.', 'success');
                this.pollPaymentStatus(result.id);
            } else {
                throw new Error(result.detail || 'Payment initiation failed');
            }
        } catch (error) {
            console.error('M-Pesa payment error:', error);
            this.showMessage(`M-Pesa payment failed: ${error.message}`, 'error');
            this.isProcessing = false;
        }
    }

    // Process card payment
    async processCardPayment(plan) {
        const paymentData = {
            public_key: INTASEND_PUBLISHABLE_KEY,
            amount: plan.price,
            currency: plan.currency,
            api_ref: `nutrilearn_card_${Date.now()}`,
            comment: `NutriLearn ${plan.name} Subscription`,
            redirect_url: window.location.origin + '/payment-success',
            method: 'CARD-PAYMENT'
        };

        try {
            const response = await fetch(`${INTASEND_BASE_URL}checkout/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${INTASEND_TOKEN}`
                },
                body: JSON.stringify(paymentData)
            });

            const result = await response.json();

            if (response.ok && result.url) {
                this.showMessage('Redirecting to card payment...', 'info');
                // Redirect to Intasend payment page
                window.location.href = result.url;
            } else {
                throw new Error(result.detail || 'Card payment initiation failed');
            }
        } catch (error) {
            console.error('Card payment error:', error);
            this.showMessage(`Card payment failed: ${error.message}`, 'error');
            this.isProcessing = false;
        }
    }

    // Poll payment status for M-Pesa
    async pollPaymentStatus(paymentId) {
        const maxAttempts = 30; // 5 minutes (10 seconds * 30)
        let attempts = 0;

        const checkStatus = async () => {
            try {
                const response = await fetch(`${INTASEND_BASE_URL}checkout/${paymentId}/`, {
                    headers: {
                        'Authorization': `Bearer ${INTASEND_TOKEN}`
                    }
                });

                const result = await response.json();

                if (result.state === 'COMPLETE') {
                    this.handlePaymentSuccess(result);
                    return;
                } else if (result.state === 'FAILED') {
                    this.showMessage('Payment failed. Please try again.', 'error');
                    this.isProcessing = false;
                    return;
                }

                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(checkStatus, 10000); // Check every 10 seconds
                } else {
                    this.showMessage('Payment timeout. Please check your M-Pesa messages.', 'warning');
                    this.isProcessing = false;
                }
            } catch (error) {
                console.error('Status check error:', error);
                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(checkStatus, 10000);
                } else {
                    this.showMessage('Unable to verify payment status.', 'error');
                    this.isProcessing = false;
                }
            }
        };

        checkStatus();
    }

    // Handle successful payment
    handlePaymentSuccess(paymentResult) {
        this.showMessage('Payment successful! Activating subscription...', 'success');
        
        // Store subscription info
        const subscriptionData = {
            plan: this.currentPlan,
            startDate: new Date().toISOString(),
            endDate: this.calculateEndDate(this.currentPlan),
            paymentId: paymentResult.id,
            amount: paymentResult.amount,
            active: true
        };

        localStorage.setItem('nutrilearn_subscription', JSON.stringify(subscriptionData));
        
        // Update UI
        this.updateSubscriptionUI(subscriptionData);
        
        // Close modal
        this.closeSubscriptionModal();
        
        this.isProcessing = false;
        
        // Refresh page to show updated features
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    }

    // Calculate subscription end date
    calculateEndDate(planType) {
        const now = new Date();
        if (planType === 'yearly') {
            now.setFullYear(now.getFullYear() + 1);
        } else {
            now.setMonth(now.getMonth() + 1);
        }
        return now.toISOString();
    }

    // Format phone number for Kenya
    formatPhoneNumber(phone) {
        // Remove any non-digit characters
        phone = phone.replace(/\D/g, '');
        
        // Handle different formats
        if (phone.startsWith('0')) {
            return '254' + phone.substring(1);
        } else if (phone.startsWith('254')) {
            return phone;
        } else if (phone.length === 9) {
            return '254' + phone;
        }
        
        return phone;
    }

    // Update subscription UI
    updateSubscriptionUI(subscriptionData) {
        const statusElement = document.getElementById('subscription-status');
        if (statusElement) {
            statusElement.innerHTML = `
                <div class="subscription-active">
                    <h3>✅ ${SUBSCRIPTION_PLANS[subscriptionData.plan].name} Active</h3>
                    <p>Valid until: ${new Date(subscriptionData.endDate).toLocaleDateString()}</p>
                </div>
            `;
        }
    }

    // Close subscription modal
    closeSubscriptionModal() {
        const modal = document.getElementById('subscription-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Show message to user
    showMessage(message, type = 'info') {
        // Create or update message element
        let messageEl = document.getElementById('payment-message');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'payment-message';
            messageEl.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                color: white;
                font-weight: bold;
                z-index: 10000;
                max-width: 300px;
            `;
            document.body.appendChild(messageEl);
        }

        // Set message and color based on type
        messageEl.textContent = message;
        switch (type) {
            case 'success':
                messageEl.style.backgroundColor = '#4CAF50';
                break;
            case 'error':
                messageEl.style.backgroundColor = '#f44336';
                break;
            case 'warning':
                messageEl.style.backgroundColor = '#ff9800';
                break;
            default:
                messageEl.style.backgroundColor = '#2196F3';
        }

        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 5000);
    }

    // Check if user has active subscription
    hasActiveSubscription() {
        const subscription = localStorage.getItem('nutrilearn_subscription');
        if (!subscription) return false;

        try {
            const subData = JSON.parse(subscription);
            const now = new Date();
            const endDate = new Date(subData.endDate);
            
            return subData.active && now < endDate;
        } catch (error) {
            return false;
        }
    }

    // Get current subscription info
    getCurrentSubscription() {
        const subscription = localStorage.getItem('nutrilearn_subscription');
        if (!subscription) return null;

        try {
            return JSON.parse(subscription);
        } catch (error) {
            return null;
        }
    }
}

// Initialize payment manager
const paymentManager = new PaymentManager();

// Export for global access
window.paymentManager = paymentManager;

// Handle payment method selection
function selectPaymentMethod(planType, method) {
    if (method === 'mpesa') {
        const phoneNumber = prompt('Enter your M-Pesa phone number (e.g., 0712345678):');
        if (phoneNumber) {
            paymentManager.initiatePayment(planType, 'mpesa', phoneNumber);
        }
    } else if (method === 'card') {
        paymentManager.initiatePayment(planType, 'card');
    }
}

// Check subscription status on page load
document.addEventListener('DOMContentLoaded', function() {
    const subscription = paymentManager.getCurrentSubscription();
    if (subscription && paymentManager.hasActiveSubscription()) {
        paymentManager.updateSubscriptionUI(subscription);
    }
});

console.log('🎉 Intasend Payment System FULLY CONFIGURED - Live Mode Active with both API keys!');
