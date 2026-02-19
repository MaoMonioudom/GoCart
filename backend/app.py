from flask import Flask
from routes.auth import auth
from middleware.auth_middleware import token_required
from flask import request, jsonify

app = Flask(__name__)
app.register_blueprint(auth, url_prefix="/auth")


@app.route("/")
def home():
    return {"message": "GoCart backend running"}

@app.route("/protected")
@token_required
def protected_test():
    user = request.user  # comes from middleware
    return jsonify({
        "message": f"Hello {user['role']}! Your user_id is {user['user_id']}"
    })

if __name__ == "__main__":
    app.run(debug=True)

