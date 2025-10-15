-- Enhanced schema for Content Orchestrator Admin
-- Adds hashtag management, drafts, media library, posting windows, and templates

-- ========================================
-- HASHTAG LIBRARY
-- ========================================
CREATE TABLE IF NOT EXISTS hashtag_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id VARCHAR(100) NOT NULL,
  name VARCHAR(200) NOT NULL, -- e.g., "Tech Startup", "Real Estate", "Holiday Posts"
  hashtags TEXT[] NOT NULL, -- array of hashtags
  description TEXT,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by VARCHAR(100)
);

-- Individual hashtag tracking for analytics
CREATE TABLE IF NOT EXISTS hashtag_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id VARCHAR(100) NOT NULL,
  hashtag VARCHAR(200) NOT NULL, -- without the #
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL, -- linkedin, instagram, twitter, etc.
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- DRAFTS & APPROVALS
-- ========================================
CREATE TABLE IF NOT EXISTS post_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id VARCHAR(100) NOT NULL,
  
  -- Content
  title TEXT,
  body TEXT NOT NULL,
  channels TEXT[] NOT NULL, -- channel slugs
  media JSONB DEFAULT '[]'::jsonb,
  first_comment JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  link TEXT,
  utm JSONB DEFAULT '{}'::jsonb,
  
  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  timezone VARCHAR(50) DEFAULT 'Europe/London',
  
  -- Workflow
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, needs_review, approved, rejected, scheduled
  approval_notes TEXT,
  approved_by VARCHAR(100),
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by VARCHAR(100),
  
  CONSTRAINT valid_draft_status CHECK (status IN ('draft', 'needs_review', 'approved', 'rejected', 'scheduled'))
);

-- ========================================
-- MEDIA LIBRARY
-- ========================================
CREATE TABLE IF NOT EXISTS media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id VARCHAR(100) NOT NULL,
  
  -- File info
  url TEXT NOT NULL,
  filename VARCHAR(500),
  alt_text TEXT,
  file_type VARCHAR(50), -- image/jpeg, video/mp4, etc.
  file_size INT, -- bytes
  width INT,
  height INT,
  
  -- Organization
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  folder VARCHAR(200), -- e.g., "Products", "Team Photos", "Events"
  
  -- Usage tracking
  usage_count INT DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by VARCHAR(100)
);

-- ========================================
-- POSTING WINDOWS / QUIET HOURS
-- ========================================
CREATE TABLE IF NOT EXISTS posting_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id VARCHAR(100) NOT NULL,
  channel VARCHAR(50), -- null = applies to all channels, or specific like 'linkedin'
  
  -- Time rules
  days_of_week INT[] NOT NULL, -- [1,2,3,4,5] = Mon-Fri, 0 = Sunday
  start_time TIME NOT NULL, -- e.g., '08:00:00'
  end_time TIME NOT NULL, -- e.g., '18:00:00'
  timezone VARCHAR(50) NOT NULL DEFAULT 'Europe/London',
  
  -- Status
  active BOOLEAN DEFAULT TRUE,
  name VARCHAR(200), -- e.g., "Weekday Business Hours"
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- POST TEMPLATES
-- ========================================
CREATE TABLE IF NOT EXISTS post_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id VARCHAR(100) NOT NULL,
  
  -- Template info
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- e.g., "Product Launch", "Team Update", "Holiday"
  
  -- Content template
  title_template TEXT,
  body_template TEXT NOT NULL, -- can include {{variables}}
  default_channels TEXT[] DEFAULT ARRAY[]::TEXT[],
  default_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  default_first_comment JSONB DEFAULT '{}'::jsonb,
  
  -- Usage
  usage_count INT DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by VARCHAR(100)
);

-- ========================================
-- ACCOUNT MAPPING (move from env to DB)
-- ========================================
CREATE TABLE IF NOT EXISTS account_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id VARCHAR(100) NOT NULL,
  channel_slug VARCHAR(50) NOT NULL, -- e.g., 'linkedin', 'instagram'
  account_ids TEXT[] NOT NULL, -- ContentStudio account IDs
  
  -- Status
  active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(workspace_id, channel_slug)
);

-- ========================================
-- CALENDAR EVENTS (for visual planning)
-- ========================================
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id VARCHAR(100) NOT NULL,
  
  -- Event details
  title VARCHAR(500) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_type VARCHAR(50) DEFAULT 'custom', -- campaign, holiday, product_launch, etc.
  color VARCHAR(7) DEFAULT '#3B82F6', -- hex color for calendar UI
  
  -- Linking
  related_posts UUID[], -- array of post_ids or draft_ids
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- ANALYTICS SNAPSHOTS (optional)
-- ========================================
CREATE TABLE IF NOT EXISTS post_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  
  -- Metrics (from ContentStudio webhooks or API)
  impressions INT DEFAULT 0,
  engagements INT DEFAULT 0,
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  shares INT DEFAULT 0,
  clicks INT DEFAULT 0,
  
  -- Snapshot timestamp
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================================
-- INDEXES
-- ========================================
CREATE INDEX IF NOT EXISTS idx_hashtag_sets_workspace ON hashtag_sets(workspace_id);
CREATE INDEX IF NOT EXISTS idx_hashtag_usage_workspace ON hashtag_usage(workspace_id);
CREATE INDEX IF NOT EXISTS idx_hashtag_usage_hashtag ON hashtag_usage(hashtag);
CREATE INDEX IF NOT EXISTS idx_post_drafts_workspace ON post_drafts(workspace_id);
CREATE INDEX IF NOT EXISTS idx_post_drafts_status ON post_drafts(status);
CREATE INDEX IF NOT EXISTS idx_media_library_workspace ON media_library(workspace_id);
CREATE INDEX IF NOT EXISTS idx_media_library_tags ON media_library USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_posting_windows_workspace ON posting_windows(workspace_id);
CREATE INDEX IF NOT EXISTS idx_account_mappings_workspace ON account_mappings(workspace_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_workspace_date ON calendar_events(workspace_id, event_date);
CREATE INDEX IF NOT EXISTS idx_post_analytics_post ON post_analytics(post_id);

-- ========================================
-- TRIGGERS
-- ========================================
CREATE TRIGGER update_hashtag_sets_updated_at
  BEFORE UPDATE ON hashtag_sets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_post_drafts_updated_at
  BEFORE UPDATE ON post_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_library_updated_at
  BEFORE UPDATE ON media_library
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posting_windows_updated_at
  BEFORE UPDATE ON posting_windows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_post_templates_updated_at
  BEFORE UPDATE ON post_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_account_mappings_updated_at
  BEFORE UPDATE ON account_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ROW LEVEL SECURITY
-- ========================================
ALTER TABLE hashtag_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE hashtag_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE posting_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_analytics ENABLE ROW LEVEL SECURITY;

-- Service role policies
CREATE POLICY "Service role has full access to hashtag_sets" ON hashtag_sets
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to hashtag_usage" ON hashtag_usage
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to post_drafts" ON post_drafts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to media_library" ON media_library
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to posting_windows" ON posting_windows
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to post_templates" ON post_templates
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to account_mappings" ON account_mappings
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to calendar_events" ON calendar_events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to post_analytics" ON post_analytics
  FOR ALL USING (auth.role() = 'service_role');

-- Anon read policies (for frontend with anon key)
CREATE POLICY "Anon can read hashtag_sets" ON hashtag_sets
  FOR SELECT USING (true);

CREATE POLICY "Anon can read post_drafts" ON post_drafts
  FOR SELECT USING (true);

CREATE POLICY "Anon can read media_library" ON media_library
  FOR SELECT USING (true);

CREATE POLICY "Anon can read posting_windows" ON posting_windows
  FOR SELECT USING (true);

CREATE POLICY "Anon can read post_templates" ON post_templates
  FOR SELECT USING (true);

CREATE POLICY "Anon can read account_mappings" ON account_mappings
  FOR SELECT USING (true);

CREATE POLICY "Anon can read calendar_events" ON calendar_events
  FOR SELECT USING (true);

-- Anon write policies (you can restrict these later with proper auth)
CREATE POLICY "Anon can write hashtag_sets" ON hashtag_sets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anon can update hashtag_sets" ON hashtag_sets
  FOR UPDATE USING (true);

CREATE POLICY "Anon can write post_drafts" ON post_drafts
  FOR ALL USING (true);

CREATE POLICY "Anon can write media_library" ON media_library
  FOR ALL USING (true);

CREATE POLICY "Anon can write posting_windows" ON posting_windows
  FOR ALL USING (true);

CREATE POLICY "Anon can write post_templates" ON post_templates
  FOR ALL USING (true);

CREATE POLICY "Anon can write account_mappings" ON account_mappings
  FOR ALL USING (true);

CREATE POLICY "Anon can write calendar_events" ON calendar_events
  FOR ALL USING (true);

