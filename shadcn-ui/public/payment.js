import { getCurrentUser } from './script.js';

// Replace with your IntaSend public key
const INTASEND_PUBLIC_KEY = 'YOUR_INTASEND_PUBLIC_KEY'; // Obtain from IntaSend dashboard

export async function initiatePayment(userId, plan, method) {
  const user = await getCurrentUser();
  if (!user) {
    console.error("No user logged in");
    return;
  }

  try {
    const intasend = new window.IntaSend({
      public_key: INTASEND_PUBLIC_KEY,
      live: false // Set to true for production
    });

    intasend.on("COMPLETE", async (response) => {
      console.log("Payment completed:", response);
      // Optionally save payment details to Supabase
      await saveSubscription(userId, `${plan}_${method}`);
    });

    intasend.on("FAILED", (response) => {
      console.error("Payment failed:", response);
    });

    intasend.run({
      amount: 10, // Example: $10 for monthly plan; adjust as needed
      currency: method === 'mpesa' ? 'KES' : 'USD',
      method: method === 'mpesa' ? 'M-PESA' : 'CARD',
      email: user.email,
      reference: `subscription_${userId}_${Date.now()}`
    });
  } catch (error) {
    console.error("Error initiating payment:", error.message);
  }
}
