-- IntelliWealth Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP
);

-- User profiles table
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    current_age INTEGER,
    gender VARCHAR(10),
    retirement_age INTEGER DEFAULT 60,
    life_expectancy INTEGER DEFAULT 100,
    currency VARCHAR(3) DEFAULT 'INR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Income & Expenses data
CREATE TABLE financial_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    data_type VARCHAR(20) NOT NULL, -- 'income' or 'expense'
    category VARCHAR(50) NOT NULL, -- 'salary', 'bonus', 'rent', etc.
    amount DECIMAL(15, 2) NOT NULL,
    frequency VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'annual', 'one-time'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, data_type, category)
);

-- Assets table
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    asset_name VARCHAR(100) NOT NULL,
    asset_type VARCHAR(50) NOT NULL, -- 'Mutual Funds', 'FD', 'House', 'PF', 'Gold'
    current_value DECIMAL(15, 2) NOT NULL,
    purchase_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Liabilities table
CREATE TABLE liabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    liability_name VARCHAR(100) NOT NULL,
    liability_type VARCHAR(50) NOT NULL, -- 'House Loan', 'Personal Loan', etc.
    outstanding_amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2),
    emi_amount DECIMAL(15, 2),
    start_date DATE,
    end_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goals table
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    goal_name VARCHAR(100) NOT NULL,
    goal_type VARCHAR(50) NOT NULL, -- 'retirement', 'education', 'house', etc.
    target_age INTEGER NOT NULL,
    target_amount DECIMAL(15, 2),
    position_x INTEGER, -- For timeline visualization
    position_y INTEGER,
    icon VARCHAR(10), -- Emoji icon
    is_achieved BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complete snapshots (for version history)
CREATE TABLE data_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    snapshot_data JSONB NOT NULL, -- Complete data backup
    snapshot_type VARCHAR(20) DEFAULT 'auto', -- 'auto', 'manual', 'export'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens for JWT
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked BOOLEAN DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_financial_data_user ON financial_data(user_id);
CREATE INDEX idx_assets_user ON assets(user_id);
CREATE INDEX idx_liabilities_user ON liabilities(user_id);
CREATE INDEX idx_goals_user ON goals(user_id);
CREATE INDEX idx_snapshots_user ON data_snapshots(user_id);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_updated_at BEFORE UPDATE ON financial_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_liabilities_updated_at BEFORE UPDATE ON liabilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data views
CREATE VIEW user_financial_summary AS
SELECT
    u.id AS user_id,
    u.email,
    up.current_age,
    COALESCE(SUM(CASE WHEN fd.data_type = 'income' THEN fd.amount ELSE 0 END), 0) AS total_income,
    COALESCE(SUM(CASE WHEN fd.data_type = 'expense' THEN fd.amount ELSE 0 END), 0) AS total_expenses,
    COALESCE(SUM(a.current_value), 0) AS total_assets,
    COALESCE(SUM(l.outstanding_amount), 0) AS total_liabilities
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN financial_data fd ON u.id = fd.user_id
LEFT JOIN assets a ON u.id = a.user_id
LEFT JOIN liabilities l ON u.id = l.user_id
WHERE u.is_active = TRUE
GROUP BY u.id, u.email, up.current_age;

-- Comments for documentation
COMMENT ON TABLE users IS 'User authentication and profile data';
COMMENT ON TABLE user_profiles IS 'Extended user profile information';
COMMENT ON TABLE financial_data IS 'Income and expense tracking';
COMMENT ON TABLE assets IS 'User assets and investments';
COMMENT ON TABLE liabilities IS 'User loans and debts';
COMMENT ON TABLE goals IS 'User financial goals and milestones';
COMMENT ON TABLE data_snapshots IS 'Complete data backups for version history';
COMMENT ON TABLE refresh_tokens IS 'JWT refresh tokens for authentication';
