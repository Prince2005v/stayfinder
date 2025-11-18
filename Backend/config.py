
from datetime import timedelta              
class Config:
    MONGO_URI = "mongodb+srv://kartik2310179:2H1yMr6PjfGhyZIL@cluster0.95nrk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"      
    MONGO_DBNAME = "Stayfinder_db"
    STRIPE_SECRET_KEY="aaaa"
    JWT_SECRET_KEY = "your_jwt_secret_key"
    PHONEPE_CLIENT_ID = "M23ZBUD5KPDUF_2511092155"
    PHONEPE_CLIENT_SECRET = "ZWNiNzYyYTgtNGFhZi00ZDFkLTk5MTYtMDBhMTQ1ZjVhMWFi"
    PHONEPE_MERCHANT_ID = "M23ZBUD5KPDUF"  # Test Merchant ID always this
    PHONEPE_ENV = "UAT"  # Change to PROD later



    