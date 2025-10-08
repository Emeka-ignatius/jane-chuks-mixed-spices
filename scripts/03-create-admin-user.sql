-- Create admin user for JaneChucks Mixed Spices
-- Password: Admin@123 (hashed with bcrypt)

INSERT INTO users (email, name, password_hash, is_admin, email_verified)
VALUES (
  'admin@janechucks.com',
  'Admin User',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWIgAnKK',
  true,
  true
)
ON CONFLICT (email) DO UPDATE
SET is_admin = true, email_verified = true;
