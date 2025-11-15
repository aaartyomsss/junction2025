"""
Script to generate sample saunas in the Uusimaa region

Usage:
    uv run python scripts/generate_saunas.py --count 20
"""
import sys
import random
from pathlib import Path

# Add parent directory to path to import project modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlmodel import Session, select
from database import engine
from db_models import Sauna, User


# Uusimaa region coordinates (Helsinki area and surroundings)
# Latitude range: approximately 59.9 - 60.5
# Longitude range: approximately 24.5 - 25.5

SAUNA_NAMES = [
    "Löyly Helsinki",
    "Kulttuurisauna",
    "Kotiharju Sauna",
    "Hermanni Sauna",
    "Arla Sauna",
    "Sompasauna",
    "Kotiharjun Sauna",
    "Allas Sea Pool",
    "Uusi Sauna",
    "Sauna Arla Helsinki",
    "Rajaportin Sauna",
    "Sauna Hermanni",
    "Flamingo Spa Sauna",
    "Espoo Central Sauna",
    "Vantaa Wellness Sauna",
    "Porvoo Traditional Sauna",
    "Sipoo Beach Sauna",
    "Kirkkonummi Lakeside Sauna",
    "Järvenpää Forest Sauna",
    "Kerava Sports Sauna",
    "Tuusula Nature Sauna",
    "Nurmijärvi Country Sauna",
    "Hyvinkää Spa Sauna",
    "Hanko Coastal Sauna",
    "Lohja Lakeside Sauna",
    "Raseborg Heritage Sauna",
    "Inkoo Archipelago Sauna",
    "Mäntsälä Countryside Sauna",
    "Pornainen Peaceful Sauna",
    "Pukkila Rural Sauna",
]

DESCRIPTIONS = [
    "A traditional Finnish sauna with authentic wood-burning stove and stunning sea views.",
    "Modern urban sauna combining classic Finnish sauna culture with contemporary design.",
    "Historic neighborhood sauna serving the local community since decades.",
    "Cozy and authentic sauna experience with excellent löyly (steam).",
    "Beautiful lakeside sauna perfect for year-round relaxation.",
    "Public sauna with a welcoming atmosphere and friendly regulars.",
    "Eco-friendly sauna built with sustainable materials and practices.",
    "Luxurious spa sauna with additional wellness facilities.",
    "Family-friendly sauna with separate sections and child-friendly hours.",
    "Rustic forest sauna offering peace and connection with nature.",
    "Beach sauna with direct access to swimming in the sea.",
    "Boutique sauna experience with premium amenities.",
    "Community sauna bringing people together through shared heat.",
    "Architectural gem combining tradition and modern design.",
    "Countryside sauna with panoramic views of the Finnish landscape.",
    "Smoke sauna providing an authentic traditional experience.",
    "Waterfront sauna ideal for cooling dips between sauna sessions.",
    "Urban wellness oasis in the heart of the city.",
    "Traditional wood-heated sauna with genuine Finnish atmosphere.",
    "Private sauna rental perfect for small groups and special occasions.",
]


def generate_saunas(count: int = 20):
    """Generate and insert sample saunas in Uusimaa region"""
    print(f"Generating {count} sample saunas in Uusimaa region...")
    
    with Session(engine) as session:
        # Get existing users to link saunas to
        users = session.exec(select(User)).all()
        
        if not users:
            print("⚠️  No users found in database. Creating a default user...")
            default_user = User(
                email="sauna_admin@example.com",
                username="sauna_admin",
                full_name="Sauna Administrator",
                is_active=True
            )
            session.add(default_user)
            session.commit()
            session.refresh(default_user)
            users = [default_user]
        
        print(f"Found {len(users)} users to link saunas to")
        
        saunas = []
        used_names = set()
        
        for i in range(count):
            # Generate unique name
            available_names = [name for name in SAUNA_NAMES if name not in used_names]
            if not available_names:
                name = f"Sauna {i+1}"
            else:
                name = random.choice(available_names)
                used_names.add(name)
            
            # Generate coordinates in Uusimaa region
            # Helsinki center: 60.1695° N, 24.9354° E
            # Add variation to spread across Uusimaa
            lat = round(60.1695 + random.uniform(-0.3, 0.3), 6)
            lon = round(24.9354 + random.uniform(-0.4, 0.4), 6)
            
            sauna = Sauna(
                name=name,
                latitude=lat,
                longitude=lon,
                rating=random.randint(3, 5),  # Most saunas are rated 3-5
                description=random.choice(DESCRIPTIONS),
                added_by_user_id=random.choice(users).id
            )
            saunas.append(sauna)
        
        # Insert saunas into database
        for sauna in saunas:
            session.add(sauna)
        session.commit()
        
        print(f"✓ Successfully created {count} saunas")
        
        # Display created saunas
        print("\nCreated saunas:")
        for sauna in saunas:
            print(f"  - {sauna.name}")
            print(f"    Location: {sauna.latitude:.4f}°N, {sauna.longitude:.4f}°E")
            print(f"    Rating: {'⭐' * sauna.rating}")
            print(f"    Added by user ID: {sauna.added_by_user_id}")
            print()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Generate sample saunas in Uusimaa region")
    parser.add_argument(
        "--count",
        type=int,
        default=20,
        help="Number of saunas to generate (default: 20)"
    )
    
    args = parser.parse_args()
    
    try:
        generate_saunas(args.count)
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
