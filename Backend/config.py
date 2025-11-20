
from datetime import timedelta              
class Config:
    MONGO_URI = "mongo_uri"      
    MONGO_DBNAME = "Stayfinder_db"
    STRIPE_SECRET_KEY="aaaa"
    JWT_SECRET_KEY = "your_jwt_secret_key"
    PHONEPE_CLIENT_ID = "clientid"
    PHONEPE_CLIENT_SECRET = "clientsecret"
    PHONEPE_MERCHANT_ID = "M23ZBUD5KPDUF"  # Test Merchant ID always this
    PHONEPE_ENV = "UAT"  # Change to PROD later



    
