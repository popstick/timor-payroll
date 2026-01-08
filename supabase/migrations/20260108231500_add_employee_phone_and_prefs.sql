ALTER TABLE employees ADD COLUMN IF NOT EXISTS notification_preference text DEFAULT 'none' CHECK (notification_preference IN ('whatsapp', 'sms', 'none'));
