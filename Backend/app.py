# ---------- Imports ----------
from flask import Flask, jsonify, request, send_file
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from flask_mail import Mail, Message
from dotenv import load_dotenv
from pymongo import MongoClient
from gridfs import GridFS
from bson import ObjectId
import stripe
import requests
import joblib
import os
import io
import random
import base64
import json
import hashlib
from datetime import datetime, timedelta
from config import Config

# ---------- App Initialization ----------
app = Flask(__name__)
bcrypt = Bcrypt(app)
CORS(app)
load_dotenv()


def phonepe_base():
    if Config.PHONEPE_ENV == "UAT":
        return "https://api-preprod.phonepe.com/apis/pg-sandbox"
    return "https://api.phonepe.com/apis/hermes"

def xverify_generate(payload, endpoint):
    body = base64.b64encode(json.dumps(payload).encode()).decode()
    signature = hashlib.sha256(
        (body + endpoint + Config.PHONEPE_CLIENT_SECRET).encode()
    ).hexdigest()
    return body, signature + "###1"


app.config["MONGO_URI"] = Config.MONGO_URI
app.config["JWT_SECRET_KEY"] = Config.JWT_SECRET_KEY
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)

# Note: Stripe key is set directly in the payment route
stripe.api_key = Config.STRIPE_SECRET_KEY
client=MongoClient(Config.MONGO_URI)
db=client[Config.MONGO_DBNAME]
jwt = JWTManager(app)
fs = GridFS(db)
# --- Database Collections ---
# (PyMongo creates these collections automatically on first use)
users_collection = db.users
hotels_collection = db.hotels_new
bookings_collection = db.Bookings

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'kartik2310179@akgec.ac.in'  # Replace with your email
app.config['MAIL_PASSWORD'] = 'etrf leme yhgk bwup'  # Replace with your email password
app.config['MAIL_DEFAULT_SENDER'] = 'kartik2310179@akgec.ac.in'
mail = Mail(app)

# --- Helper: Load Recommendation Model ---
# Load your pre-trained model.
# Ensure 'recommendation_model.pkl' is in the same directory.
try:
    recommendation_model = joblib.load("recommendation_model.pkl")
    print("Recommendation model loaded successfully.")
except FileNotFoundError:
    recommendation_model = None
    print("WARNING: recommendation_model.pkl not found. Recommendations will be basic.")

# --- 1. User Authentication & Registration ---
def send_verification_email(email, code):
    try:
        subject = "Your Verification Code for Stayfinder"
        msg = Message(subject, recipients=[email])
        msg.body = f"""
Hello,

Thank you for registering. Your verification code is: {code}

This code will expire in 10 minutes.

If you did not request this, please ignore this email.
"""
        mail.send(msg)
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
def serialize_document(doc):
    if not isinstance(doc, dict):
        return doc

    new_doc = {}
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            new_doc[key] = str(value)
        elif isinstance(value, list):
            new_doc[key] = [serialize_document(v) for v in value]
        elif isinstance(value, dict):
            new_doc[key] = serialize_document(value)
        else:
            new_doc[key] = value
    return new_doc
@app.route("/register/start", methods=["POST"])
def register_start():
    data = request.json

    required_fields = ["email", "password", "user_type"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing fields"}), 400

    # Check if user already exists
    if users_collection.find_one({"email": data["email"]}):
        return jsonify({"error": "Email already registered"}), 409

    # Hash password
    hashed_password = bcrypt.generate_password_hash(data["password"]).decode("utf-8")

    # Generate OTP
    otp_code = str(random.randint(100000, 999999))

    # Insert as pending user
    pending_user = {
        "email": data["email"],
        "password": hashed_password,
        "user_type": data["user_type"],   # ✅ "guest" or "host"
        "otp": otp_code,
        "otp_verified": False,
        "created_at": datetime.utcnow()
    }

    users_collection.insert_one(pending_user)
    email=data["email"]
    if not send_verification_email(email, otp_code):
        return jsonify(msg="Could not send verification email. Please try again later."), 500
    return jsonify(msg="Verification code sent to your email. It will expire in 10 minutes."), 200


    # ───────────────
    #  (Send OTP here—SMS/Email)
    # ───────────────

    return jsonify({"message": "OTP sent successfully"}), 200
@app.route("/register/verify", methods=["POST"])
def register_verify():
    data = request.json

    required_fields = ["email", "otp"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing fields"}), 400

    user = users_collection.find_one({"email": data["email"]})

    if not user:
        return jsonify({"error": "User not found"}), 404

    if user["otp"] != data["otp"]:
        return jsonify({"error": "Invalid OTP"}), 401

    users_collection.update_one(
        {"email": data["email"]},
        {"$set": {"otp_verified": True}}
    )

    return jsonify({"message": "OTP verified successfully"}), 200
@app.route("/register/complete", methods=["POST"])
def register_complete():
    data = request.json

    required_fields = ["email", "name", "phone_number", "city", "state"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing fields"}), 400

    user = users_collection.find_one({"email": data["email"]})

    if not user:
        return jsonify({"error": "User not found"}), 404

    if not user.get("otp_verified"):
        return jsonify({"error": "OTP not verified"}), 401

    # Update user details
    users_collection.update_one(
        {"email": data["email"]},
        {
            "$set": {
                "name": data["name"],
                "phone_number": data["phone_number"],
                "city": data["city"],
                "state": data["state"],
                "wishlist": [],
                "registration_completed": True
            },
            "$unset": {"otp": ""}
        }
    )
    access_token = create_access_token(identity=str(user["_id"]))

    return jsonify({"message": "Registration completed","access_token":access_token}), 201



@app.route("/login", methods=["POST"])
def login_user():
    """
    Log in a user.
    Expects JSON: { "email", "password" }
    """
    data = request.json
    user = users_collection.find_one({"email": data["email"]})
    
    if user and bcrypt.check_password_hash(user["password"], data["password"]):
        # Create access token
        access_token = create_access_token(identity=str(user["_id"]))
        return jsonify({
            "message": "Login successful", 
            "access_token": access_token
        }), 200
    else:
        return jsonify({"error": "Invalid email or password"}), 401

@app.route("/profile", methods=["GET"])
@jwt_required()
def get_user_profile():
    """
    Get the profile of the currently logged-in user.
    """
    current_user_id = get_jwt_identity()
    user = users_collection.find_one(
        {"_id": ObjectId(current_user_id)}, 
        {"_id": 0, "password": 0} # Exclude private fields
    )
    
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    return jsonify({"user_profile": user}), 200

# --- 2. Hotel Registration ---

@app.route("/register-hotel", methods=["POST"])
@jwt_required()
def register_hotel():
    try:
        # Read fields
        hotel_name = request.form.get("hotel_name")
        address = request.form.get("address")
        star_rating = request.form.get("star_rating")
        phone_number = request.form.get("phone_number")
        total_rooms_available = request.form.get("total_rooms_available")
        restaurant_available = request.form.get("restaurant_available") == "true"
        print("JWT Identity:", get_jwt_identity())
        # Get file
        if "valid_document" not in request.files:
            return jsonify({"error": "Document required"}), 400

        file = request.files["valid_document"]

        # ✅ Store file in MongoDB GridFS
        file_id = fs.put(
            file,
            filename=file.filename,
            content_type=file.content_type
        )

        # ✅ Insert hotel document with file reference
        hotel_id = hotels_collection.insert_one({
            "owner_id": get_jwt_identity(),
            "hotel_name": hotel_name,
            "address": address,
            "star_rating": star_rating,
            "phone_number": phone_number,
            "total_rooms_available": total_rooms_available,
            "restaurant_available": restaurant_available,
            "document_file_id": str(file_id),
            "rooms":[] # store file reference
        }).inserted_id

        return jsonify({
            "message": "Hotel registered successfully",
            "hotel_id": str(hotel_id),
            "document_file_id": str(file_id)
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route("/hotels/<hotel_id>/add-room", methods=["POST"])
@jwt_required()
def add_room(hotel_id):
    try:
        # Only owner can add -> verify
        owner_id = get_jwt_identity()
        hotel = hotels_collection.find_one({"_id": ObjectId(hotel_id)})
        if not hotel:
            return jsonify({"error": "Hotel not found"}), 404
        if str(hotel.get("owner_id")) != owner_id:
            return jsonify({"error": "Forbidden"}), 403

        room_type = request.form.get("room_type")
        description = request.form.get("description")
        occupancy = request.form.get("occupancy")
        amenities = request.form.get("amenities", "")
        amenities_list = [a.strip() for a in amenities.split(",") if a.strip()]

        # pricing fields
        price_15 = request.form.get("price_15") or None
        price_30 = request.form.get("price_30") or None
        price_45 = request.form.get("price_45") or None
        price_60 = request.form.get("price_60") or None
        price_75 = request.form.get("price_75") or None
        price_90 = request.form.get("price_90") or None

        # optional image
        img_id = None
        if "image" in request.files:
            img = request.files["image"]
            img_id = fs.put(img, filename=img.filename, content_type=img.content_type)

        room = {
            "_id": ObjectId(),
            "room_type": room_type,
            "description": description,
            "occupancy": occupancy,
            "amenities": amenities_list,
            "pricing": {
                "price_15": price_15,
                "price_30": price_30,
                "price_45": price_45,
                "price_60": price_60,
                "price_75": price_75,
                "price_90": price_90,
            },
            "image_id": str(img_id) if img_id else None
        }

        hotels_collection.update_one(
            {"_id": ObjectId(hotel_id)},
            {"$push": {"rooms": room}}
        )

        room["_id"] = str(room["_id"])
        return jsonify({"message": "Room added successfully", "room": room}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- 3. Recommendation & Search Route ---

@app.route("/search-hotels", methods=["GET"])
def search_hotels():
    """
    Search and get hotel recommendations.
    Accepts query params: ?city=...&min_rating=...&restaurant=true
    """
    
    query_params = request.args
    
    # 1. Build MongoDB filter query from URL parameters
    db_filter = {}
    if "city" in query_params:
        # Assumes address is a string. If it's a sub-document, use "address.city"
        db_filter["address"] = {"$regex": query_params["city"], "$options": "i"}
    if "min_rating" in query_params:
        db_filter["star_rating"] = {"$gte": int(query_params["min_rating"])}
    if "restaurant" in query_params:
        db_filter["restaurant_available"] = (query_params["restaurant"].lower() == 'true')
        
    # 2. Fetch filtered hotels from DB
    try:
        filtered_hotels = list(hotels_collection.find(db_filter, {"_id": 0}))
        
        # 3. Apply recommendation model (Placeholder)
        if recommendation_model and filtered_hotels:
            # --- MODEL LOGIC PLACEHOLDER ---
            # This is highly dependent on your model's features (e.g., user_id, search_context)
            # Example:
            # user_id = get_jwt_identity() if "Authorization" in request.headers else None
            # features = create_features(filtered_hotels, user_id)
            # ranked_indices = recommendation_model.predict(features)
            # recommended_hotels = [filtered_hotels[i] for i in ranked_indices]
            
            # Simple fallback: just return filtered hotels for now
            recommended_hotels = filtered_hotels 
        else:
            # Fallback if model not loaded or no hotels found
            recommended_hotels = filtered_hotels
            
        return jsonify({"recommended_hotels": recommended_hotels}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/hotels/search", methods=["GET"])
def search_hotels1():
    keyword = request.args.get("keyword", "")

    if not keyword:
        hotels = list(hotels_collection.find({}, {"rooms": 0}))
    else:
        hotels = list(
            hotels_collection.find(
                {
                    "$or": [
                        {"hotel_name": {"$regex": keyword, "$options": "i"}},
                        {"address": {"$regex": keyword, "$options": "i"}},
                        {"state": {"$regex": keyword, "$options": "i"}},
                        {"city": {"$regex": keyword, "$options": "i"}},
                    ]
                },
                {"rooms": 0}
            )
        )

    # Convert ObjectId
    for h in hotels:
        h["_id"] = str(h["_id"])
    hotels = [serialize_document(h) for h in hotels]
    return jsonify({"hotels": hotels}), 200

@app.route("/hotels/<hotel_id>", methods=["GET"])
def get_hotel_details(hotel_id):
    try:
        hotel = hotels_collection.find_one({"_id": ObjectId(hotel_id)})

        if not hotel:
            return jsonify({"error": "Hotel not found"}), 404

        # ✅ Convert hotel _id to string
        hotel["_id"] = str(hotel["_id"])

        # ✅ Convert each room _id to string
        for room in hotel.get("rooms", []):
            room["_id"] = str(room["_id"])
        hotel = serialize_document(hotel)
        return jsonify({"hotel": hotel}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route("/hotels/<hotel_id>/rooms/<room_id>", methods=["GET"])
def get_single_room(hotel_id, room_id):
    hotel = hotels_collection.find_one({"_id": ObjectId(hotel_id)})

    if not hotel:
        return jsonify({"error": "Hotel not found"}), 404

    # find room inside hotel's rooms list
    for room in hotel.get("rooms", []):
        if str(room["_id"]) == room_id:
            room["_id"] = str(room["_id"])
            return jsonify({"room": room}), 200

    return jsonify({"error": "Room not found"}), 404

# --- 4. Booking & Save for Later Logic ---

@app.route("/booking", methods=["POST"])
@jwt_required()
def create_booking():
    # ✅ Fix: force JSON parsing
    data = request.get_json(force=True)
    user_id = get_jwt_identity()

    required = ["hotel_id", "room_id", "duration", "checkin"]
    missing = [k for k in required if k not in data or data[k] in (None, "")]
    if missing:
        return jsonify({"error": "Missing fields", "missing": missing}), 400

    hotel_id = data["hotel_id"]
    room_id = data["room_id"]
    duration = int(data["duration"])
    checkin = datetime.fromisoformat(data["checkin"])

    hotel = hotels_collection.find_one({"_id": ObjectId(hotel_id)})
    if not hotel:
        return jsonify({"error": "Hotel not found"}), 404

    room = None
    for r in hotel.get("rooms", []):
        if str(r["_id"]) == room_id:
            room = r
            break

    if not room:
        return jsonify({"error": "Room not found"}), 404

    # Pricing values are stored under the room's `pricing` subdocument.
    # Try to read prices from room["pricing"] and coerce to float if possible.
    pricing = room.get("pricing", {}) or {}

    def _parse_price(key):
        # key is e.g. 'price_15'
        val = pricing.get(key) if isinstance(pricing, dict) else None
        # fallback: some older documents might have top-level keys (defensive)
        if val is None:
            val = room.get(key)
        if val in (None, ""):
            return None
        try:
            return float(val)
        except (ValueError, TypeError):
            return None

    pricing_map = {
        15: _parse_price("price_15"),
        30: _parse_price("price_30"),
        45: _parse_price("price_45"),
        60: _parse_price("price_60"),
        75: _parse_price("price_75"),
        90: _parse_price("price_90"),
    }

    if duration not in pricing_map or pricing_map[duration] is None:
        return jsonify({"error": "Invalid duration"}), 400

    price = pricing_map[duration]
    checkout = checkin + timedelta(days=duration)

    booking = {
        "user_id": ObjectId(user_id),
        "hotel_id": ObjectId(hotel_id),
        "room_id": ObjectId(room_id),
        "price": price,
        "duration": duration,
        "checkin": checkin.isoformat(),
        "checkout": checkout.isoformat(),
        "status": "pending",
        "created_at": datetime.utcnow()
    }

    result = bookings_collection.insert_one(booking)

    return jsonify({
        "message": "Booking created successfully",
        "booking_id": str(result.inserted_id),
        "price": price
    }), 201

@app.route("/user/bookings", methods=["GET"])
@jwt_required()
def user_bookings():
    user_id = get_jwt_identity()

    pipeline = [
        {"$match": {"user_id": ObjectId(user_id)}},

        # ✅ join hotel info
        {
            "$lookup": {
                "from": "hotels",
                "localField": "hotel_id",
                "foreignField": "_id",
                "as": "hotel_data"
            }
        },
        {"$unwind": "$hotel_data"},

        # ✅ join room info
        {
            "$project": {
                "_id": 1,
                "duration": 1,
                "checkin": 1,
                "checkout": 1,
                "status": 1,
                "price": 1,
                "hotel_name": "$hotel_data.hotel_name",
                "room_type": {
                    "$filter": {
                        "input": "$hotel_data.rooms",
                        "as": "room",
                        "cond": {"$eq": ["$$room._id", "$room_id"]}
                    }
                }
            }
        },
        {"$unwind": "$room_type"},
    ]

    bookings = list(bookings_collection.aggregate(pipeline))

    for b in bookings:
        b["_id"] = str(b["_id"])
        b["room_type"] = b["room_type"]["room_type"]

    return jsonify({"bookings": bookings}), 200

# @app.route("/create-payment-intent", methods=["POST"])
# @jwt_required()
# def create_payment_intent():
#     data = request.json
#     current_user_id = get_jwt_identity()

#     booking = bookings_collection.find_one({
#         "_id": ObjectId(data["booking_id"]),
#         "user_id": ObjectId(current_user_id)
#     })

#     if not booking:
#         return jsonify({"error": "Booking not found"}), 404

#     amount_in_cents = int(float(booking["price"]) * 100)

#     intent = stripe.PaymentIntent.create(
#         amount=amount_in_cents,
#         currency="inr",  
#         metadata={
#             "booking_id": data["booking_id"]
#         }
#     )

#     return jsonify({
#         "clientSecret": intent.client_secret
#     }), 200

@app.route("/host/bookings", methods=["GET"])
@jwt_required()
def host_bookings():
    user_id = get_jwt_identity()

    # find hotels owned by host
    hotels = list(hotels_collection.find({"owner_id": ObjectId(user_id)}))
    hotel_ids = [h["_id"] for h in hotels]

    bookings = list(bookings_collection.find({"hotel_id": {"$in": hotel_ids}}))

    # convert
    bookings = [serialize_document(b) for b in bookings]


    return jsonify({"bookings": bookings}), 200
@app.route("/host/hotels", methods=["GET"])
@jwt_required()
def get_host_hotels():
    host_id = get_jwt_identity()
    print("🔹 JWT identity (host_id):", host_id)

    try:
        # ✅ Fetch hotels owned by host using ObjectId
        hotels = list(hotels_collection.find(
            {"owner_id": ObjectId(host_id)},
            {"rooms": 0}
        ))

        print("🔹 Hotels owned by host =", len(hotels))

        # ✅ Convert MongoDB doc to JSON-safe format
        hotels = [serialize_document(h) for h in hotels]

        return jsonify({"hotels": hotels}), 200

    except Exception as e:
        print("❌ ERROR in /host/hotels:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/save-for-later", methods=["POST"])
@jwt_required()
def save_for_later():
    """
    Add a hotel to the user's wishlist.
    Expects JSON: { "hotel_id" }
    """
    current_user_id = get_jwt_identity()
    data = request.json
    hotel_id = data["hotel_id"]
    
    try:
        # Use $addToSet to avoid duplicate entries
        result = users_collection.update_one(
            {"_id": ObjectId(current_user_id)},
            {"$addToSet": {"wishlist": ObjectId(hotel_id)}}
        )
        
        if result.modified_count > 0:
            return jsonify({"message": "Hotel added to wishlist"}), 200
        else:
            return jsonify({"message": "Hotel already in wishlist"}), 200
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- 5. Payment Logic (Stripe) ---

@app.route("/create-payment-intent", methods=["POST"])
@jwt_required()
def create_payment_intent():
    """
    Create a payment intent with Stripe for a booking.
    Expects JSON: { "booking_id" }
    """
    data = request.json
    current_user_id = get_jwt_identity()
    
    try:
        # 1. Find the booking
        booking = bookings_collection.find_one({
            "_id": ObjectId(data["booking_id"]),
            "user_id": ObjectId(current_user_id)
        })
        
        if not booking:
            return jsonify({"error": "Booking not found"}), 404
            
        # 2. !! PLACEHOLDER: Calculate amount !!
        # In a real app, you'd fetch hotel/room price and calculate the total
        # Amount must be in the smallest currency unit (e.g., cents)
        amount_in_cents = 10000  # Example: $100.00
        
        # 3. Create a PaymentIntent with Stripe
        intent = stripe.PaymentIntent.create(
            amount=amount_in_cents,
            currency="usd", # or "inr"
            metadata={
                "booking_id": data["booking_id"],
                "user_id": current_user_id
            }
        )
        
        # 4. Return the client secret to the frontend
        return jsonify({
            'clientSecret': intent.client_secret
        }), 200

    except Exception as e:
        return jsonify(error=str(e)), 403

# --- Webhook for Stripe (Optional but Recommended) ---
@app.route('/stripe-webhook', methods=['POST'])
def stripe_webhook():
    """
    Handles events from Stripe (e.g., payment_intent.succeeded)
    to update booking status in the database.
    """
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    
    # !! Set your Stripe Webhook Secret in environment variables !!
    endpoint_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        # Invalid payload
        return 'Invalid payload', 400
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        return 'Invalid signature', 400

    # Handle the event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        booking_id = payment_intent['metadata']['booking_id']
        
        # Update the booking status in your database
        bookings_collection.update_one(
            {"_id": ObjectId(booking_id)},
            {"$set": {"status": "confirmed"}}
        )
        print(f"Payment succeeded for booking: {booking_id}")

    else:
        print(f"Unhandled event type: {event['type']}")

    return jsonify(success=True)

@app.route("/file/<file_id>", methods=["GET"])
def serve_file(file_id):
    try:
        file_obj = fs.get(ObjectId(file_id))
        data = file_obj.read()
        return send_file(
            io.BytesIO(data),
            mimetype=file_obj.content_type or "application/octet-stream",
            as_attachment=False,
            download_name=file_obj.filename
        )
    except NoFile:
        return jsonify({"error": "File not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#edit rooms
@app.route("/hotels/<hotel_id>/rooms/<room_id>", methods=["PUT"])
@jwt_required()
def edit_room(hotel_id, room_id):
    try:
        owner_id = get_jwt_identity()
        hotel = hotels_collection.find_one({"_id": ObjectId(hotel_id)})
        if not hotel:
            return jsonify({"error":"Hotel not found"}), 404
        if str(hotel.get("owner_id")) != owner_id:
            return jsonify({"error":"Forbidden"}), 403

        data = request.form.to_dict() or request.json or {}
        # allowed updates
        update_fields = {}
        if "room_type" in data: update_fields["rooms.$.room_type"] = data["room_type"]
        if "description" in data: update_fields["rooms.$.description"] = data["description"]
        if "occupancy" in data: update_fields["rooms.$.occupancy"] = data["occupancy"]
        if "amenities" in data:
            update_fields["rooms.$.amenities"] = [a.strip() for a in data["amenities"].split(",")]

        # pricing keys (if present)
        pricing = {}
        for key in ["price_15","price_30","price_45","price_60","price_75","price_90"]:
            if key in data:
                days = key.split("_")[1]
                pricing[f"rooms.$.pricing.{days}"] = data[key]

        update_fields.update(pricing)

        # optional image replace
        if "image" in request.files:
            img = request.files["image"]
            img_id = fs.put(img, filename=img.filename, content_type=img.content_type)
            update_fields["rooms.$.image_id"] = str(img_id)

        if not update_fields:
            return jsonify({"error":"No changes"}), 400

        hotels_collection.update_one(
            {"_id": ObjectId(hotel_id), "rooms._id": ObjectId(room_id)},
            {"$set": update_fields}
        )

        hotel = hotels_collection.find_one({"_id": ObjectId(hotel_id)})
        hotel = serialize_document(hotel)
        return jsonify({"hotel": hotel}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route("/hotels/<hotel_id>/rooms/<room_id>", methods=["DELETE"])
@jwt_required()
def delete_room(hotel_id, room_id):
    try:
        owner_id = get_jwt_identity()
        hotel = hotels_collection.find_one({"_id": ObjectId(hotel_id)})
        if not hotel:
            return jsonify({"error":"Hotel not found"}), 404
        if str(hotel.get("owner_id")) != owner_id:
            return jsonify({"error":"Forbidden"}), 403

        hotels_collection.update_one(
            {"_id": ObjectId(hotel_id)},
            {"$pull": {"rooms": {"_id": ObjectId(room_id)}}}
        )
        return jsonify({"message":"Room deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route("/host/bookings/<booking_id>/update", methods=["POST"])
@jwt_required()
def update_booking_status(booking_id):
    try:
        user_id = get_jwt_identity()
        data = request.json
        if "status" not in data:
            return jsonify({"error":"Missing status"}), 400

        # Optional: verify host owns the hotel for this booking
        booking = bookings_collection.find_one({"_id": ObjectId(booking_id)})
        if not booking:
            return jsonify({"error":"Booking not found"}), 404

        # verify owner
        hotel = hotels_collection.find_one({"_id": booking["hotel_id"]})
        if not hotel or str(hotel.get("owner_id")) != user_id:
            return jsonify({"error":"Forbidden"}), 403

        bookings_collection.update_one({"_id": ObjectId(booking_id)}, {"$set": {"status": data["status"]}})
        return jsonify({"message":"Booking status updated"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route("/booking/create", methods=["POST"])
@jwt_required()
def create_booking_new():
    data = request.json
    user_id = get_jwt_identity()
    required = ["hotel_id","room_id","duration_days","price","checkin","checkout"]
    if not all(k in data for k in required):
        return jsonify({"error":"Missing fields"}), 400

    booking = {
        "user_id": ObjectId(user_id),
        "hotel_id": ObjectId(data["hotel_id"]),
        "room_id": ObjectId(data["room_id"]),
        "duration_days": int(data["duration_days"]),
        "price": float(data["price"]),
        "checkin": data["checkin"],
        "checkout": data["checkout"],
        "status": "pending_payment",
        "created_at": datetime.utcnow()
    }
    res = bookings_collection.insert_one(booking)
    return jsonify({"booking_id": str(res.inserted_id), "message":"Booking created"}), 201
@app.route("/host/booking/confirm/<booking_id>", methods=["PUT"])
@jwt_required()
def host_confirm_booking(booking_id):
    host_id = get_jwt_identity()

    try:
        # ✅ Find the booking
        booking = bookings_collection.find_one({"_id": ObjectId(booking_id)})
        if not booking:
            return jsonify({"error": "Booking not found"}), 404

        # ✅ Find hotel owned by host
        hotel = hotels_collection.find_one({
            "_id": ObjectId(booking["hotel_id"]),
            "owner_id": ObjectId(host_id)
        })

        if not hotel:
            return jsonify({"error": "Not authorized"}), 403

        # ✅ Update status
        bookings_collection.update_one(
            {"_id": ObjectId(booking_id)},
            {"$set": {"status": "confirmed"}}
        )

        return jsonify({"message": "Booking confirmed successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

#payment
@app.route("/create-checkout-session", methods=["POST"])
@jwt_required()
def create_checkout_session():
    data = request.json
    current_user = get_jwt_identity()

    # ✅ Get booking
    booking = bookings_collection.find_one({
        "_id": ObjectId(data["booking_id"]),
        "user_id": ObjectId(current_user)
    })

    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    amount_in_rupees = float(booking["price"])
    amount_paisa = int(amount_in_rupees * 100)  # convert to paisa

    YOUR_DOMAIN = "http://localhost:3000"

    # ✅ Create Stripe Checkout Session
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        mode="payment",
        success_url=f"{YOUR_DOMAIN}/payment-success?booking_id={data['booking_id']}",
        cancel_url=f"{YOUR_DOMAIN}/payment-cancel?booking_id={data['booking_id']}",
        customer_email=booking.get("email", None),
        line_items=[
            {
                "price_data": {
                    "currency": "inr",
                    "unit_amount": amount_paisa,
                    "product_data": {
                        "name": "Hotel Booking Payment",
                        "description": f"Booking ID: {data['booking_id']}",
                    },
                },
                "quantity": 1,
            }
        ],
        metadata={
            "booking_id": data["booking_id"]
        }
    )

    return jsonify({"checkout_url": session.url})
# @app.route("/stripe-webhook", methods=["POST"])
# def stripe_webhook():
#     payload = request.data
#     sig_header = request.headers.get("Stripe-Signature")
#     endpoint_secret = Config.STRIPE_WEBHOOK_SECRET

#     try:
#         event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)

#     except Exception as e:
#         return jsonify({"error": str(e)}), 400

#     # ✅ Payment Success
#     if event["type"] == "checkout.session.completed":
#         session = event["data"]["object"]
#         booking_id = session["metadata"]["booking_id"]

#         # Update booking status
#         bookings_collection.update_one(
#             {"_id": ObjectId(booking_id)},
#             {"$set": {"status": "confirmed"}}
#         )
#         print("✅ Booking Confirmed:", booking_id)

#     return jsonify({"status": "ok"})

#payment-phonepe

@app.route("/payment/phonepe/create", methods=["POST"])
@jwt_required()
def phonepe_create_payment():
    data = request.json
    booking_id = data["booking_id"]
    user_id = get_jwt_identity()

    booking = bookings_collection.find_one({
        "_id": ObjectId(booking_id),
        "user_id": ObjectId(user_id)
    })

    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    amount = int(float(booking["price"]) * 100)

    endpoint = "/pg/v1/pay"
    base = phonepe_base()

    payload = {
        "merchantId": Config.PHONEPE_MERCHANT_ID,
        "merchantTransactionId": booking_id,
        "merchantUserId": str(user_id),
        "amount": amount,
        "redirectUrl": f"http://localhost:3000/payment/success?booking_id={booking_id}",
        "redirectMode": "REDIRECT",
        "callbackUrl": "http://127.0.0.1:5000/payment/phonepe/callback",
        "paymentInstrument": {
            "type": "PAY_PAGE"
        }
    }

    body, xverify = xverify_generate(payload, endpoint)

    headers = {
        "Content-Type": "application/json",
        "X-CLIENT-ID": Config.PHONEPE_CLIENT_ID,
        "X-VERIFY": xverify
    }

    res = requests.post(
        base + endpoint,
        json={"request": body},
        headers=headers
    ).json()

    if res.get("success"):
        url = res["data"]["instrumentResponse"]["redirectInfo"]["url"]
        return jsonify({"payment_url": url})

    return jsonify({"error": res}), 400
@app.route("/payment/phonepe/callback", methods=["POST"])
def phonepe_callback():
    data = request.json
    print("📩 CALLBACK RECEIVED:", data)

    return jsonify({"status": "ok"})
@app.route("/payment/phonepe/status/<booking_id>", methods=["GET"])
def phonepe_payment_status(booking_id):
    endpoint = f"/pg/v1/status/{Config.PHONEPE_MERCHANT_ID}/{booking_id}"
    base = phonepe_base()

    xverify = hashlib.sha256(
        (endpoint + Config.PHONEPE_CLIENT_SECRET).encode()
    ).hexdigest() + "###1"

    headers = {
        "Content-Type": "application/json",
        "X-CLIENT-ID": Config.PHONEPE_CLIENT_ID,
        "X-VERIFY": xverify
    }

    res = requests.get(base + endpoint, headers=headers).json()

    if res.get("code") == "PAYMENT_SUCCESS":
        bookings_collection.update_one(
            {"_id": ObjectId(booking_id)},
            {"$set": {"status": "confirmed"}}
        )
        return jsonify({"status": "SUCCESS"})

    return jsonify({"status": res.get("code", "FAILED")})


# --- Run the App ---
if __name__ == "__main__":
    if not stripe.api_key:
        print("Stripe API key not set. Please set the STRIPE_SECRET_KEY environment variable.")
    app.run(debug=True)