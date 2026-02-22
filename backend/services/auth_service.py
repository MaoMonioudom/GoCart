from utils.hash import hash_password, verify_password
from utils.jwt_handler import create_token

def hash_pw(pw:str)->str:
    return hash_password(pw)

def verify_pw(pw:str, hashed:str)->bool:
    return verify_password(pw, hashed)

def issue_token(user_id:int, role:str)->str:
    return create_token(user_id, role)
