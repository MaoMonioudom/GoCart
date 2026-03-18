import jwt
from datetime import datetime, timedelta
from config import Config


def generate_token(user):
    payload = {
        "user_id": user["user_id"],
        "role": user["role"],
        "exp": datetime.utcnow() + timedelta(hours=2)
    }

    return jwt.encode(payload, Config.SECRET_KEY, algorithm="HS256")


def verify_token(token):
    try:
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        return payload
    except:
        return None