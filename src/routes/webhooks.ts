import { Router } from "express";
import { supabase } from "../lib/supabase.js";

const router = Router();

router.post("/webhooks/contentstudio", async (req, res) => {
  // TODO: verify signature using SIGNING_SECRET if ContentStudio provides one.
  // Expected payload varies by event type. Common fields: post_id, status, event, published_url, error
  const payload = req.body;
  console.log("ContentStudio webhook received:", JSON.stringify(payload));

  try {
    // Log the webhook event
    const { data: webhookEvent, error: webhookError } = await supabase
      .from("webhook_events")
      .insert({
        source: "contentstudio",
        event_type: payload.event || payload.type || null,
        payload,
        contentstudio_post_id: payload.post_id || payload.id || null,
        processed: false
      })
      .select("id")
      .single();

    if (webhookError) {
      console.error("Failed to log webhook event:", webhookError);
      return res.status(500).json({ error: "Failed to log webhook" });
    }

    // Try to match and update our post record
    const csPostId = payload.post_id || payload.id;
    if (csPostId) {
      const { data: post } = await supabase
        .from("posts")
        .select("id, status")
        .eq("contentstudio_post_id", csPostId)
        .single();

      if (post) {
        // Update post status based on webhook event
        let newStatus = post.status;
        const eventType = (payload.event || payload.status || "").toLowerCase();

        if (eventType.includes("publish") || eventType.includes("posted") || payload.published_url) {
          newStatus = "published";
        } else if (eventType.includes("fail") || eventType.includes("error") || payload.error) {
          newStatus = "failed";
        } else if (eventType.includes("schedul")) {
          newStatus = "scheduled";
        }

        await supabase
          .from("posts")
          .update({
            status: newStatus,
            error_message: payload.error || null,
            updated_at: new Date().toISOString()
          })
          .eq("id", post.id);

        // Mark webhook as processed and link to post
        await supabase
          .from("webhook_events")
          .update({
            processed: true,
            processed_at: new Date().toISOString(),
            post_id: post.id
          })
          .eq("id", webhookEvent.id);
      } else {
        // Post not found - maybe it was created outside our system
        console.warn("Webhook for unknown post:", csPostId);
      }
    }

    res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error("Webhook processing error:", e);
    res.status(500).json({ error: "Failed to process webhook", details: e.message });
  }
});

export default router;
