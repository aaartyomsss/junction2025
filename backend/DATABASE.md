# SQLModel & Database Guide

## Overview

This project uses **SQLModel** as the ORM (Object-Relational Mapper) to interact with PostgreSQL. SQLModel combines SQLAlchemy and Pydantic, allowing you to define database models that work seamlessly with FastAPI.

## Database Setup

### 1. Start PostgreSQL with Docker

```bash
docker-compose up -d
```

This starts PostgreSQL on `localhost:5433` with:

- Database: `mydb`
- User: `user`
- Password: `password`

### 2. Configure Database URL

Set the `DATABASE_URL` environment variable (optional):

```bash
# Windows PowerShell
$env:DATABASE_URL = "postgresql://user:password@localhost:5433/mydb"

# Linux/Mac
export DATABASE_URL="postgresql://user:password@localhost:5433/mydb"
```

If not set, it defaults to the connection string in `database.py`.

## Project Structure

```
backend/
├── db_models/              # SQLModel database models
│   ├── __init__.py
│   ├── user.py            # User model example
│   └── prediction.py      # Prediction history model
├── database.py            # Database connection and session management
├── alembic/               # Migration files
│   ├── versions/          # Migration scripts
│   └── env.py            # Alembic configuration
└── alembic.ini           # Alembic settings
```

## Working with Models

### Defining Models

Models inherit from `SQLModel` with `table=True`:

```python
from sqlmodel import SQLModel, Field
from typing import Optional

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    username: str
```

### Using Models in Routes

```python
from fastapi import APIRouter, Depends
from sqlmodel import Session
from database import get_session
from db_models import User

router = APIRouter()

@router.post("/users/")
def create_user(user: User, session: Session = Depends(get_session)):
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.get("/users/{user_id}")
def get_user(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    return user
```

## Database Migrations with Alembic

Alembic tracks database schema changes over time, allowing you to:

- Create new tables
- Add/remove columns
- Modify constraints
- Roll back changes

### Key Commands

#### 1. Create a Migration

After modifying models in `db_models/`, generate a migration:

```bash
uv run alembic revision --autogenerate -m "Add users and predictions tables"
```

This creates a new file in `alembic/versions/` with detected changes.

#### 2. Apply Migrations

Run pending migrations to update the database:

```bash
uv run alembic upgrade head
```

#### 3. View Migration History

```bash
uv run alembic history
```

#### 4. Rollback Migration

Downgrade to previous version:

```bash
# Downgrade one step
uv run alembic downgrade -1

# Downgrade to specific revision
uv run alembic downgrade <revision_id>

# Rollback everything
uv run alembic downgrade base
```

#### 5. View Current Version

```bash
uv run alembic current
```

### Migration Workflow

1. **Modify models** in `db_models/`
2. **Generate migration**: `uv run alembic revision --autogenerate -m "description"`
3. **Review migration** in `alembic/versions/` (check upgrade/downgrade functions)
4. **Apply migration**: `uv run alembic upgrade head`
5. **Commit** migration files to git

## Important Notes

### ⚠️ Before Creating Migrations

1. **Import all models** in `alembic/env.py`:

   ```python
   from db_models import User, Prediction  # Add all models here
   ```

2. **Set metadata**:

   ```python
   target_metadata = SQLModel.metadata
   ```

3. **Always review** auto-generated migrations before applying them

### ⚠️ Production Best Practices

- **Never** use `SQLModel.metadata.create_all()` in production (use migrations instead)
- **Always** back up database before running migrations
- **Test** migrations on staging environment first
- **Keep** migration files in version control
- **Don't** edit old migration files (create new ones)

### ⚠️ Common Issues

**Issue**: Alembic doesn't detect changes

- **Solution**: Ensure model is imported in `alembic/env.py`

**Issue**: Migration conflicts

- **Solution**: Merge migrations or use `alembic merge`

**Issue**: Can't connect to database

- **Solution**: Check `DATABASE_URL` and ensure PostgreSQL is running

## Example: Creating a New Model

1. Create model in `db_models/`:

```python
# db_models/post.py
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class Post(SQLModel, table=True):
    __tablename__ = "posts"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200)
    content: str
    user_id: int = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

2. Import in `db_models/__init__.py`:

```python
from .post import Post
__all__ = ["User", "Prediction", "Post"]
```

3. Import in `alembic/env.py`:

```python
from db_models import User, Prediction, Post
```

4. Generate and apply migration:

```bash
uv run alembic revision --autogenerate -m "Add posts table"
uv run alembic upgrade head
```

## Useful SQLModel Patterns

### Query Examples

```python
from sqlmodel import Session, select
from database import get_session

# Get all users
def get_all_users(session: Session):
    statement = select(User)
    users = session.exec(statement).all()
    return users

# Filter users
def get_active_users(session: Session):
    statement = select(User).where(User.is_active == True)
    users = session.exec(statement).all()
    return users

# Join queries
def get_user_with_predictions(session: Session, user_id: int):
    statement = select(User, Prediction).join(Prediction).where(User.id == user_id)
    results = session.exec(statement).all()
    return results
```

### Update and Delete

```python
# Update
def update_user(session: Session, user_id: int, new_email: str):
    user = session.get(User, user_id)
    if user:
        user.email = new_email
        session.add(user)
        session.commit()
        session.refresh(user)
    return user

# Delete
def delete_user(session: Session, user_id: int):
    user = session.get(User, user_id)
    if user:
        session.delete(user)
        session.commit()
```

## Resources

- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [FastAPI SQL Databases Guide](https://fastapi.tiangolo.com/tutorial/sql-databases/)
