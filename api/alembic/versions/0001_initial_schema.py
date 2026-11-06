"""Initial schema

Revision ID: 0001
Revises:
Create Date: 2024-01-01 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── ENUM types ────────────────────────────────────────────────────────────
    op.execute("CREATE TYPE user_role AS ENUM ('admin', 'designer')")
    op.execute("CREATE TYPE project_status AS ENUM ('draft', 'sent', 'submitted', 'changes_requested', 'approved')")
    op.execute("CREATE TYPE project_type AS ENUM ('website', 'mobile_app', 'brand_identity', 'social_media')")
    op.execute("CREATE TYPE submission_status AS ENUM ('submitted', 'changes_requested', 'approved')")
    op.execute("CREATE TYPE preset_kind AS ENUM ('style', 'palette', 'font', 'khmer_font')")
    op.execute("CREATE TYPE author_type AS ENUM ('designer', 'client')")

    # ── users ─────────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column(
            "role",
            postgresql.ENUM("admin", "designer", name="user_role", create_type=False),
            nullable=False,
            server_default="designer",
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # ── projects ──────────────────────────────────────────────────────────────
    op.create_table(
        "projects",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True),
        sa.Column("owner_id", sa.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("client_name", sa.String(255), nullable=False),
        sa.Column("client_contact", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column("brand_name", sa.String(255), nullable=False),
        sa.Column(
            "project_type",
            postgresql.ENUM("website", "mobile_app", "brand_identity", "social_media", name="project_type", create_type=False),
            nullable=False,
        ),
        sa.Column(
            "status",
            postgresql.ENUM("draft", "sent", "submitted", "changes_requested", "approved", name="project_status", create_type=False),
            nullable=False,
            server_default="draft",
        ),
        sa.Column("deadline", sa.Date, nullable=True),
        sa.Column("internal_notes", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_projects_owner_id", "projects", ["owner_id"])
    op.create_index("ix_projects_status", "projects", ["status"])

    # ── invites ───────────────────────────────────────────────────────────────
    op.create_table(
        "invites",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True),
        sa.Column("project_id", sa.UUID(as_uuid=True), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("first_opened_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_invites_project_id", "invites", ["project_id"])
    op.create_index("ix_invites_token_hash", "invites", ["token_hash"], unique=True)

    # ── submissions ───────────────────────────────────────────────────────────
    op.create_table(
        "submissions",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True),
        sa.Column("project_id", sa.UUID(as_uuid=True), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("version", sa.Integer, nullable=False),
        sa.Column("rules", postgresql.JSONB, nullable=False),
        sa.Column(
            "status",
            postgresql.ENUM("submitted", "changes_requested", "approved", name="submission_status", create_type=False),
            nullable=False,
            server_default="submitted",
        ),
        sa.Column("submitted_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("project_id", "version", name="uq_submissions_project_version"),
    )
    op.create_index("ix_submissions_project_id", "submissions", ["project_id"])

    # ── drafts ────────────────────────────────────────────────────────────────
    op.create_table(
        "drafts",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True),
        sa.Column("project_id", sa.UUID(as_uuid=True), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("rules", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("project_id", name="uq_drafts_project_id"),
    )
    op.create_index("ix_drafts_project_id", "drafts", ["project_id"])

    # ── comments ──────────────────────────────────────────────────────────────
    op.create_table(
        "comments",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True),
        sa.Column("project_id", sa.UUID(as_uuid=True), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("submission_id", sa.UUID(as_uuid=True), sa.ForeignKey("submissions.id", ondelete="SET NULL"), nullable=True),
        sa.Column(
            "author_type",
            postgresql.ENUM("designer", "client", name="author_type", create_type=False),
            nullable=False,
        ),
        sa.Column("author_id", sa.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("body", sa.Text, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_comments_project_id", "comments", ["project_id"])
    op.create_index("ix_comments_submission_id", "comments", ["submission_id"])

    # ── presets ───────────────────────────────────────────────────────────────
    op.create_table(
        "presets",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "kind",
            postgresql.ENUM("style", "palette", "font", "khmer_font", name="preset_kind", create_type=False),
            nullable=False,
        ),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("data", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column("sort_order", sa.Integer, nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_presets_kind", "presets", ["kind"])

    # ── files ─────────────────────────────────────────────────────────────────
    op.create_table(
        "files",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True),
        sa.Column("project_id", sa.UUID(as_uuid=True), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("filename", sa.String(255), nullable=False),
        sa.Column("mime_type", sa.String(127), nullable=False),
        sa.Column("size", sa.Integer, nullable=False),
        sa.Column("storage_key", sa.String(512), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("storage_key", name="uq_files_storage_key"),
    )
    op.create_index("ix_files_project_id", "files", ["project_id"])

    # ── activity_log ──────────────────────────────────────────────────────────
    op.create_table(
        "activity_log",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True),
        sa.Column("project_id", sa.UUID(as_uuid=True), sa.ForeignKey("projects.id", ondelete="CASCADE"), nullable=False),
        sa.Column("actor", sa.String(255), nullable=False),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("meta", postgresql.JSONB, nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_activity_log_project_id", "activity_log", ["project_id"])

    # ── updated_at auto-update trigger ────────────────────────────────────────
    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """)
    op.execute("""
        CREATE TRIGGER trg_projects_updated_at
        BEFORE UPDATE ON projects
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    """)
    op.execute("""
        CREATE TRIGGER trg_drafts_updated_at
        BEFORE UPDATE ON drafts
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    """)


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS trg_drafts_updated_at ON drafts")
    op.execute("DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects")
    op.execute("DROP FUNCTION IF EXISTS update_updated_at")

    op.drop_table("activity_log")
    op.drop_table("files")
    op.drop_table("presets")
    op.drop_table("comments")
    op.drop_table("drafts")
    op.drop_table("submissions")
    op.drop_table("invites")
    op.drop_table("projects")
    op.drop_table("users")

    op.execute("DROP TYPE IF EXISTS author_type")
    op.execute("DROP TYPE IF EXISTS preset_kind")
    op.execute("DROP TYPE IF EXISTS submission_status")
    op.execute("DROP TYPE IF EXISTS project_type")
    op.execute("DROP TYPE IF EXISTS project_status")
    op.execute("DROP TYPE IF EXISTS user_role")
