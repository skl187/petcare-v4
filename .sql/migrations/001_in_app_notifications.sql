-- ============================================================================
-- Migration: In-App Notifications System
-- Description: Adds in_app_notifications (master) + user_notifications (per-user delivery)
-- ============================================================================

-- Master notification record (created by admin or system)
CREATE TABLE IF NOT EXISTS in_app_notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL DEFAULT 'general'
        CHECK (type IN ('system','appointment','payment','reminder','promotion','general')),
    priority text NOT NULL DEFAULT 'normal'
        CHECK (priority IN ('low','normal','high','urgent')),

    -- Targeting
    target_type text NOT NULL DEFAULT 'user'
        CHECK (target_type IN ('user','role','broadcast')),
    target_role text,                          -- role slug when target_type = 'role'

    -- Optional deep-link / action
    action_url text,
    icon text,
    metadata jsonb,

    -- Scheduling & expiry
    scheduled_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz,

    -- Status
    status text NOT NULL DEFAULT 'active'
        CHECK (status IN ('active','scheduled','expired','deleted')),

    -- Audit
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at timestamptz
);

-- Indexes for in_app_notifications
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_type ON in_app_notifications (type);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_target ON in_app_notifications (target_type);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_status ON in_app_notifications (status);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_scheduled ON in_app_notifications (scheduled_at);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_created_by ON in_app_notifications (created_by);
CREATE INDEX IF NOT EXISTS idx_in_app_notifications_created_at ON in_app_notifications (created_at DESC);

-- Per-user notification delivery + read tracking
CREATE TABLE IF NOT EXISTS user_notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id uuid NOT NULL REFERENCES in_app_notifications(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_read boolean NOT NULL DEFAULT FALSE,
    read_at timestamptz,
    is_archived boolean NOT NULL DEFAULT FALSE,
    created_at timestamptz NOT NULL DEFAULT now(),

    UNIQUE(notification_id, user_id)
);

-- Indexes for user_notifications
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_notification_id ON user_notifications (notification_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_unread ON user_notifications (user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications (user_id, created_at DESC);

-- updated_at trigger for in_app_notifications
DO $$
BEGIN
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', 'in_app_notifications_touch_updated_at', 'in_app_notifications');
    EXECUTE format(
        'CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION touch_updated_at()',
        'in_app_notifications_touch_updated_at',
        'in_app_notifications'
    );
END;
$$ LANGUAGE plpgsql;
