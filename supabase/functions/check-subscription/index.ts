
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use service role key to bypass RLS for updates
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      await supabaseClient.from("subscriptions").upsert({
        user_id: user.id,
        is_active: false,
        plan_type: "free",
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      return new Response(JSON.stringify({ 
        subscribed: false, 
        plan_type: "free",
        subscription_end: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    let planType = "free";
    let subscriptionEnd = null;
    let isActive = false;

    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      isActive = true;
      
      // Determine plan type from price
      const priceId = subscription.items.data[0].price.id;
      if (priceId === "price_1RaE4jF5hbq3sDLKCtBPcScq") {
        planType = "premium"; // Monthly
      } else if (priceId === "price_1RaE5CF5hbq3sDLKhAp6negB") {
        planType = "premium"; // Annual
      }
      logStep("Active subscription found", { subscriptionId: subscription.id, planType, endDate: subscriptionEnd });
    } else {
      // Check for lifetime payments (one-time payments)
      const payments = await stripe.paymentIntents.list({
        customer: customerId,
        limit: 10,
      });
      
      for (const payment of payments.data) {
        if (payment.status === "succeeded") {
          const charges = await stripe.charges.list({
            payment_intent: payment.id,
            limit: 1,
          });
          
          if (charges.data.length > 0) {
            const charge = charges.data[0];
            // Check if this was a lifetime purchase based on metadata or amount
            if (charge.amount === 29900) { // $299 for lifetime
              planType = "premium";
              isActive = true;
              subscriptionEnd = null; // Lifetime has no end
              logStep("Lifetime purchase found", { paymentId: payment.id });
              break;
            }
          }
        }
      }
      logStep("No active subscription found");
    }

    await supabaseClient.from("subscriptions").upsert({
      user_id: user.id,
      is_active: isActive,
      plan_type: planType,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    logStep("Updated database with subscription info", { isActive, planType });
    return new Response(JSON.stringify({
      subscribed: isActive,
      plan_type: planType,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
