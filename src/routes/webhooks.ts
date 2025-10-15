import { Router } from "express";

const router = Router();

router.post("/webhooks/contentstudio", (req, res) => {
  // TODO: verify signature using SIGNING_SECRET if ContentStudio provides one.
  // Expected payload (example): { post_id, status, published_url, error }
  console.log("Webhook:", JSON.stringify(req.body));
  res.status(204).end();
});

export default router;
