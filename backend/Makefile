.PHONY: migrate migrate-auto migrate-down migrate-history db-upgrade db-downgrade help

help:
	@echo "Available commands:"
	@echo "  make migrate          - Create a new migration (auto-generate)"
	@echo "  make migrate-auto     - Same as migrate"
	@echo "  make migrate-down     - Downgrade one migration"
	@echo "  make migrate-history  - Show migration history"
	@echo "  make db-upgrade       - Apply all pending migrations"
	@echo "  make db-downgrade     - Downgrade database by one version"

# Create a new migration with auto-generated changes
migrate:
	@echo "Creating new migration..."
	uv run alembic revision --autogenerate -m "$(filter-out $@,$(MAKECMDGOALS))"

migrate-auto: migrate

# Apply all pending migrations
db-upgrade:
	@echo "Applying migrations..."
	uv run alembic upgrade head

# Downgrade by one migration
db-downgrade:
	@echo "Downgrading one migration..."
	uv run alembic downgrade -1

migrate-down: db-downgrade

# Show migration history
migrate-history:
	@echo "Migration history:"
	uv run alembic history --verbose

# Allow passing migration message as argument
%:
	@:
