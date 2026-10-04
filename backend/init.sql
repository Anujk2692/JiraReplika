-- ==============================================================================
-- JIRA REPLICA ENTERPRISE POSTGRESQL INITIALIZATION SCRIPT
-- ==============================================================================

-- Create extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS jira_users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_MEMBER',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS jira_projects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    project_key VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'SOFTWARE',
    lead_id BIGINT NOT NULL REFERENCES jira_users(id) ON DELETE RESTRICT,
    issue_counter BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Project Members Join Table
CREATE TABLE IF NOT EXISTS jira_project_members (
    project_id BIGINT NOT NULL REFERENCES jira_projects(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES jira_users(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, user_id)
);

-- 4. Sprints Table
CREATE TABLE IF NOT EXISTS jira_sprints (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    goal TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'FUTURE',
    project_id BIGINT NOT NULL REFERENCES jira_projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Issues Table
CREATE TABLE IF NOT EXISTS jira_issues (
    id BIGSERIAL PRIMARY KEY,
    issue_key VARCHAR(20) NOT NULL UNIQUE,
    summary VARCHAR(500) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'TASK',
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(50) NOT NULL DEFAULT 'TO_DO',
    project_id BIGINT NOT NULL REFERENCES jira_projects(id) ON DELETE CASCADE,
    sprint_id BIGINT REFERENCES jira_sprints(id) ON DELETE SET NULL,
    parent_id BIGINT REFERENCES jira_issues(id) ON DELETE SET NULL,
    reporter_id BIGINT NOT NULL REFERENCES jira_users(id) ON DELETE RESTRICT,
    assignee_id BIGINT REFERENCES jira_users(id) ON DELETE SET NULL,
    story_points INTEGER,
    order_index DOUBLE PRECISION DEFAULT 0.0,
    due_date DATE,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Issue Labels Table
CREATE TABLE IF NOT EXISTS jira_issue_labels (
    issue_id BIGINT NOT NULL REFERENCES jira_issues(id) ON DELETE CASCADE,
    label VARCHAR(100) NOT NULL,
    PRIMARY KEY (issue_id, label)
);

-- 7. Comments Table
CREATE TABLE IF NOT EXISTS jira_comments (
    id BIGSERIAL PRIMARY KEY,
    issue_id BIGINT NOT NULL REFERENCES jira_issues(id) ON DELETE CASCADE,
    author_id BIGINT NOT NULL REFERENCES jira_users(id) ON DELETE RESTRICT,
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Activity Logs (Audit History)
CREATE TABLE IF NOT EXISTS jira_activity_logs (
    id BIGSERIAL PRIMARY KEY,
    issue_id BIGINT NOT NULL REFERENCES jira_issues(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES jira_users(id) ON DELETE RESTRICT,
    action VARCHAR(100) NOT NULL,
    field_name VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_issues_project ON jira_issues(project_id);
CREATE INDEX IF NOT EXISTS idx_issues_sprint ON jira_issues(sprint_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON jira_issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_assignee ON jira_issues(assignee_id);
CREATE INDEX IF NOT EXISTS idx_comments_issue ON jira_comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_activity_issue ON jira_activity_logs(issue_id);
