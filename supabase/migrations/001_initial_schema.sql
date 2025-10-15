-- Initial schema for Content Orchestrator
-- Run this in your Supabase SQL Editor

-- Posts table: tracks all scheduled posts
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orchestrator_id VARCHAR(16) UNIQUE NOT NULL, -- idempotency key
  workspace_id VARCHAR(100) NOT NULL,
  contentstudio_post_id VARCHAR(100), -- set after successful creation
  
  -- Post content
  title TEXT,
  body TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  timezone VARCHAR(50) NOT NULL,
  
  -- Channels and mapping
  requested_channels JSONB NOT NULL, -- original channel slugs from request
  mapped_accounts JSONB NOT NULL, -- actual ContentStudio account IDs used
  
  -- Media and extras
  media JSONB DEFAULT '[]'::jsonb,
  first_comment JSONB DEFAULT '{}'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  link TEXT,
  utm JSONB DEFAULT '{}'::jsonb,
  
  -- Status tracking
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, scheduled, published, failed, cancelled
  error_message TEXT,
  retry_count INT DEFAULT 0,
  last_retry_at TIMESTAMPTZ,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by VARCHAR(100), -- future: user/api token identifier
  
  -- Indexes
  CONSTRAINT valid_status CHECK (status IN ('pending', 'scheduled', 'published', 'failed', 'cancelled'))
);

-- Webhook events table: logs all incoming webhook calls
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source VARCHAR(50) NOT NULL, -- 'contentstudio', etc
  event_type VARCHAR(50), -- 'post.published', 'post.failed', etc
  
  -- Payload
  payload JSONB NOT NULL,
  contentstudio_post_id VARCHAR(100),
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL, -- link to our posts table if we can match
  
  -- Audit
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  error TEXT
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_posts_workspace ON posts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled ON posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_posts_contentstudio_id ON posts(contentstudio_post_id);
CREATE INDEX IF NOT EXISTS idx_posts_orchestrator_id ON posts(orchestrator_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_source ON webhook_events(source);
CREATE INDEX IF NOT EXISTS idx_webhook_events_contentstudio_id ON webhook_events(contentstudio_post_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);

-- Updated_at trigger for posts
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - Enable but allow all for service role
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do anything (your backend)
CREATE POLICY "Service role has full access to posts" ON posts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to webhook_events" ON webhook_events
  FOR ALL USING (auth.role() = 'service_role');

-- Optional: Allow anon key read access for debugging (remove in production if not needed)
CREATE POLICY "Anon can read posts" ON posts
  FOR SELECT USING (true);

CREATE POLICY "Anon can read webhook_events" ON webhook_events
  FOR SELECT USING (true);

