import pandas as pd
import random
from pymongo import MongoClient
from flask_bcrypt import Bcrypt
from datetime import datetime
from bson.objectid import ObjectId
import math
from gridfs import GridFS, NoFile
import os # Added for file operations
from config import Config
# --- CONFIGURATION ---
# ! IMPORTANT: Fill in your database details here.
# You can copy these from your 'config.py' file.
MONGO_URI = Config.MONGO_URI  # e.g., "mongodb://localhost:27017/"
MONGO_DBNAME =Config.MONGO_DBNAME           # e.g., "stayfinder_db"
# ---------------------

# Initialize Bcrypt (used for hashing host passwords)
bcrypt = Bcrypt()

def pre_upload_rating_images(fs):
    """
    Uploads all rating-based images (0-5) once and returns a map of {rating: file_id}.
    This is much more efficient than uploading the same image repeatedly.
    """
    hotel_image_map = {}
    room_image_map = {}
    
    # --- Helper to upload or get default ---
    def get_image_id(fs, path, default_id=None):
        """Uploads an image from 'path' or returns 'default_id' if it fails."""
        if os.path.exists(path):
            try:
                # Open the file and put it in GridFS
                with open(path, 'rb') as f:
                    # We use the filename to make it easier to see in the DB
                    file_id = fs.put(f, filename=os.path.basename(path)) 
                    print(f"Uploaded {path} to GridFS with ID: {file_id}")
                    return str(file_id)
            except Exception as e:
                print(f"Error uploading {path}: {e}. Using default.")
                return default_id
        else:
            print(f"Warning: {path} not found. Using default.")
            return default_id

    # --- Upload Defaults First (Rating 0) ---
    default_hotel_path = os.path.join("hotel_image", "hotel0.png")
    default_room_path = os.path.join("room_images", "room0.png")
    
    # Uploading 'None' as default_id for the defaults themselves.
    default_hotel_id = get_image_id(fs, default_hotel_path, None) 
    default_room_id = get_image_id(fs, default_room_path, None)

    hotel_image_map[0] = default_hotel_id
    room_image_map[0] = default_room_id

    # --- Upload Rating-Specific Images (1-5) ---
    # It will re-use the default_id if a specific-rated image isn't found
    for rating in range(1, 6):
        # Hotel Image
        hotel_path = os.path.join("hotel_image", f"hotel{rating}.png")
        hotel_image_map[rating] = get_image_id(fs, hotel_path, default_hotel_id)

        # Room Image
        room_path = os.path.join("room_images", f"room{rating}.png")
        room_image_map[rating] = get_image_id(fs, room_path, default_room_id)
            
    print("--- Image Pre-upload Complete ---")
    print("Hotel Image IDs:", hotel_image_map)
    print("Room Image IDs:", room_image_map)
    print("-----------------------------------")
    
    return hotel_image_map, room_image_map


def generate_random_pricing(star_rating=0):
    """
    Generates a random pricing structure for a room,
    based on the hotel's star rating.
    """
    base_price_range = {
        0: (2000, 4000),    # Default/Unrated
        1: (2500, 4500),
        2: (4000, 7000),
        3: (7000, 12000),
        4: (12000, 20000),
        5: (20000, 35000)
    }
    
    if not isinstance(star_rating, int) or star_rating not in base_price_range:
        star_rating = 0
        
    min_price, max_price = base_price_range[star_rating]
    price_15 = round(random.uniform(min_price, max_price), -2)
    
    return {
        "price_15": str(price_15),
        "price_30": str(round(price_15 * 1.9, -2)),
        "price_45": str(round(price_15 * 2.8, -2)),
        "price_60": str(round(price_15 * 3.7, -2)),
        "price_75": str(round(price_15 * 4.6, -2)),
        "price_90": str(round(price_15 * 5.5, -2)),
    }

def create_dummy_hosts(users_collection):
    """Creates dummy host users if they don't exist and returns their IDs."""
    host_ids = []
    host_emails = ["host1@stayfinder.com", "host2@stayfinder.com", "host3@stayfinder.com"]

    for email in host_emails:
        host = users_collection.find_one({"email": email})
        if not host:
            print(f"Creating host: {email}")
            hashed_password = bcrypt.generate_password_hash("hostpassword123").decode("utf-8")
            host_doc = {
                "email": email,
                "password": hashed_password,
                "user_type": "host",
                "otp_verified": True,
                "registration_completed": True,
                "name": email.split('@')[0].capitalize(),
                "phone_number": "1234567890",
                "city": "Default City",
                "state": "Default State",
                "created_at": datetime.utcnow()
            }
            result = users_collection.insert_one(host_doc)
            host_ids.append(result.inserted_id)
        else:
            print(f"Host found: {email}")
            host_ids.append(host["_id"])
            
    print(f"Got {len(host_ids)} host IDs.")
    return host_ids

def seed_hotels(client, host_ids):
    """Reads the CSV and inserts hotels into the database."""
    db = client[MONGO_DBNAME]
    hotels_collection = db.hotels_new
    fs = GridFS(db) # Initialize GridFS
    
    # --- !! WARNING !! ---
    # This script DELETES all existing hotels in your collection.
    print("Clearing existing hotels from the collection...")
    hotels_collection.delete_many({})
    # --- !! WARNING !! ---
    
    # --- !! NEW: Pre-upload all images and get ID maps !! ---
    print("Starting image pre-upload...")
    hotel_image_id_map, room_image_id_map = pre_upload_rating_images(fs)
    # ---
    
    # Load the CSV
    try:
        df = pd.read_csv("goibibo_com-travel_sample.csv")
    except FileNotFoundError:
        print("Error: 'goibibo_com-travel_sample.csv' not found.")
        print("Please make sure it's in the same directory as this script.")
        return

    print(f"Loaded {len(df)} hotels from CSV. Processing...")
    
    new_hotel_documents = []
    
    for _, row in df.iterrows():
        # Assign a random host
        random_host_id = random.choice(host_ids)
        
        # Get star rating, handling NaN values
        star_rating_raw = row["hotel_star_rating"]
        if pd.isna(star_rating_raw) or not isinstance(star_rating_raw, (int, float)):
            star_rating = 0
        else:
            star_rating = int(star_rating_raw)
            # Cap rating at 5 if data is higher
            if star_rating > 5:
                star_rating = 5
            
        # --- !! MODIFIED: Look up image IDs from the map !! ---
        # Get the pre-uploaded ID for this rating, or use rating 0 as a fallback.
        doc_file_id = hotel_image_id_map.get(star_rating, hotel_image_id_map[0])
        room_img_id = room_image_id_map.get(star_rating, room_image_id_map[0])
        # ---

        # Create a default room with pricing based on star rating
        default_room = {
            "_id": ObjectId(), # New BSON ID for the room
            "room_type": row["room_type"] if pd.notna(row["room_type"]) else "Standard Room",
            "description": "A comfortable and spacious room.", # Per your example
            "occupancy": "2 adults", # Per your example
            "amenities": str(row["room_facilities"]).split('|') if pd.notna(row["room_facilities"]) else ["Basic Amenities"],
            "pricing": generate_random_pricing(star_rating),
            "image_id": room_img_id # String ID from map
        }
        
        # Build the hotel document
        hotel_doc = {
            # _id is auto-generated
            "owner_id": random_host_id, # Link to the host as ObjectId
            "hotel_name": row["property_name"],
            "address": row["address"],
            "city": row["city"], # Kept from CSV
            "state": row["state"], # Kept from CSV
            "latitude": row["latitude"], # Kept from CSV
            "longitude": row["longitude"], # Kept from CSV
            "star_rating": str(star_rating), # Saved as STRING per your schema
            "phone_number": "9999999999", # Placeholder
            "total_rooms_available": str(row["room_count"]), # Saved as STRING per your schema
            "restaurant_available": "Restaurant" in str(row["hotel_facilities"]),
            "document_file_id": doc_file_id, # String ID from map
            "amenities": str(row["hotel_facilities"]).split('|') if pd.notna(row["hotel_facilities"]) else [],
            "rooms": [default_room] # Add the room with pricing
        }
        
        new_hotel_documents.append(hotel_doc)

    # Insert all new hotels into the database at once
    if new_hotel_documents:
        print(f"Inserting {len(new_hotel_documents)} new hotels into the database...")
        hotels_collection.insert_many(new_hotel_documents)
        print("Database seeding complete!")
    else:
        print("No hotels were processed.")

def main():
    try:
        client = MongoClient(MONGO_URI)
        db = client[MONGO_DBNAME]
        
        # Test connection
        client.server_info()
        print(f"Successfully connected to MongoDB database: {MONGO_DBNAME}")
        
        users_collection = db.users
        
        # 1. Create hosts
        host_ids = create_dummy_hosts(users_collection)
        
        # 2. Seed hotels
        if host_ids:
            seed_hotels(client, host_ids)
            
    except Exception as e:
        print(f"\n--- An Error Occurred ---")
        print(f"Error: {e}")
        print("\nPlease ensure:")
        print(f"  1. Your MongoDB server is running.")
        print(f"  2. The 'MONGO_URI' and 'MONGO_DBNAME' at the top of this script are correct.")
        print(f"  3. You have 'pandas', 'flask_bcrypt', and 'pymongo' installed ('pip install pandas flask_bcrypt pymongo')")
        print(f"  4. You have created the 'hotel_images' and 'room_images' folders with your images.")
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    main()