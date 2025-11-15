"""
Script to generate sample sauna sessions in the database

Usage:
    uv run python scripts/generate_sessions.py --count 20
"""
import sys
import argparse
from pathlib import Path
from datetime import datetime, timedelta
import random

# Add parent directory to path to import project modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlmodel import Session, select
from database import engine
from db_models import SaunaSession, User, Sauna


def generate_sessions(count: int = 20):
    """Generate and insert sample sauna sessions into the database"""
    print(f"Generating {count} sample sauna sessions...")
    
    with Session(engine) as session:
        # Get all users and saunas
        users = session.exec(select(User)).all()
        saunas = session.exec(select(Sauna)).all()
        
        if not users:
            print("✗ Error: No users found in database. Please run generate_users.py first.")
            sys.exit(1)
        
        print(f"Found {len(users)} users and {len(saunas)} saunas in database")
        
        sessions_list = []
        for i in range(count):
            # Random session duration between 15 minutes and 2 hours
            duration_seconds = random.randint(900, 7200)
            
            # Random temperatures (typical sauna range)
            avg_temp = random.uniform(60.0, 85.0)
            max_temp = avg_temp + random.uniform(5.0, 15.0)  # Max is higher than average
            
            # Random user
            user_id = random.choice(users).id
            
            # 70% chance to have a sauna location, 30% chance to be None
            sauna_id = random.choice(saunas).id if saunas and random.random() < 0.7 else None
            
            sauna_session = SaunaSession(
                duration_seconds=duration_seconds,
                average_temperature=round(avg_temp, 1),
                max_temperature=round(max_temp, 1),
                user_id=user_id,
                sauna_id=sauna_id,
                created_at=datetime.utcnow() - timedelta(days=random.randint(0, 30))
            )
            sessions_list.append(sauna_session)
        
        # Insert sessions into database
        for sauna_session in sessions_list:
            session.add(sauna_session)
        session.commit()
        
        print(f"✓ Successfully created {count} sauna sessions")
        
        # Display sample sessions
        print("\nSample sessions created:")
        for sauna_session in sessions_list[:5]:
            duration_min = sauna_session.duration_seconds // 60
            sauna_info = f"Sauna #{sauna_session.sauna_id}" if sauna_session.sauna_id else "No location"
            print(f"  - User #{sauna_session.user_id} | {duration_min} min | "
                  f"Avg: {sauna_session.average_temperature}°C | "
                  f"Max: {sauna_session.max_temperature}°C | {sauna_info}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate sample sauna sessions")
    parser.add_argument(
        "--count",
        type=int,
        default=20,
        help="Number of sessions to generate (default: 20)"
    )
    
    args = parser.parse_args()
    
    try:
        generate_sessions(args.count)
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
