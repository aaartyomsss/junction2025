"""
Script to generate sample users in the database

Usage:
    uv run python scripts/generate_users.py --count 10
"""
import sys
import argparse
from pathlib import Path

# Add parent directory to path to import project modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlmodel import Session
from database import engine
from db_models import User
from faker import Faker

fake = Faker()


def generate_users(count: int = 10):
    """Generate and insert sample users into the database"""
    print(f"Generating {count} sample users...")
    
    users = []
    for i in range(count):
        user = User(
            email=fake.unique.email(),
            username=fake.unique.user_name(),
            full_name=fake.name(),
            is_active=fake.boolean(chance_of_getting_true=90)
        )
        users.append(user)
    
    # Insert users into database
    with Session(engine) as session:
        for user in users:
            session.add(user)
        session.commit()
        print(f"✓ Successfully created {count} users")
        
        # Display created users
        print("\nCreated users:")
        for user in users:
            status = "Active" if user.is_active else "Inactive"
            print(f"  - {user.username} ({user.email}) - {status}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate sample users")
    parser.add_argument(
        "--count",
        type=int,
        default=10,
        help="Number of users to generate (default: 10)"
    )
    
    args = parser.parse_args()
    
    try:
        generate_users(args.count)
    except Exception as e:
        print(f"✗ Error: {e}")
        sys.exit(1)
