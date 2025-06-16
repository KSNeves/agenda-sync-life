
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 503,
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user?.email) {
      return new Response(JSON.stringify({ error: "Invalid authentication" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    const user = userData.user;
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

    // Check for subscriptions with rate limiting
    const allSubscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10,
    });

    let planType = "free";
    let subscriptionEnd = null;
    let isActive = false;

    const activeSubscriptions = allSubscriptions.data.filter(sub => sub.status === "active");
    
    if (activeSubscriptions.length > 0) {
      const subscription = activeSubscriptions[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      isActive = true;
      
      const priceId = subscription.items.data[0].price.id;
      if (priceId === "price_1RaE4jF5hbq3sDLKCtBPcScq" || priceId === "price_1RaE5CF5hbq3sDLKhAp6negB") {
        planType = "premium";
      }
      logStep("Active subscription found", { subscriptionId: subscription.id, planType, endDate: subscriptionEnd });
    } else {
      // Check for lifetime payments
      const payments = await stripe.paymentIntents.list({
        customer: customerId,
        limit: 10,
      });
      
      for (const payment of payments.data) {
        if (payment.status === "succeeded" && payment.amount === 49990) {
          planType = "premium";
          isActive = true;
          subscriptionEnd = null;
          logStep("Lifetime purchase found", { paymentId: payment.id });
          break;
        }
      }
    }

    await supabaseClient.from("subscriptions").upsert({
      user_id: user.id,
      is_active: isActive,
      plan_type: planType as any,
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
    
    // Generic error response for security
    return new Response(JSON.stringify({ error: "An error occurred processing your request" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
