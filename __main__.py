from flask import Flask, request
from datetime import datetime, timedelta
import json
import jwt
from functions import Database
from functions.Database import Database as dbA

app = Flask(__name__)
tokens = {}

CAS = 'data\\haarcascade_frontalface_default.xml'
db = Database()

users: dict[str, dict] = {}

def get_playload(username, token):
    if not token:
        return False
    tokens.get(token) == username
    payload = jwt.decodeToken(token)

    if payload and tokens.get(token) == username:
        expires_time = payload.get('expires')
        return datetime.now() < expires_time
    return False

def get_token(username):

    payload = {
        "username": username,
        "iat": datetime.now(),
        "expires": datetime.now() + timedelta(0, 1500)
    }

    jwt_token = jwt.generateToken(payload)

    tokens.setdefault(jwt_token, username)
    return jwt_token

# 使用者 ui
@app.route('/', methods=['GET'])
def default():
    return app.send_static_file('index.html')

# 取得資訊
@app.route('/<username>', methods=['GET'])
def getInfo(username):
    token = request.args.get('token')
    payload = get_playload(username, token)

    if payload:
        return json.dumps(users.get(username)), 200
    elif token:
        return 'null', 401
    
    if username in users:
        return json.dumps({
            'username': username,
            'nickname': users.get(username).get('nickname')
        })
    else:
        return 'null', 404

# 驗證
@app.route('/<username>', methods=['PUT'])
def login(username):

    if username not in users:
        return 'null', 404

    image = request.files.get('image')
    db.recognize(username, image)

    jwt_token = get_token(username)

    return jwt_token
    

# 建檔
@app.route('/<username>', methods=['POST'])
def register(username):

    images = request.files.getlist('images')
    user = json.loads(__str) if (__str := request.args.get('user')) else None

    # if not user or type(user) != dict:
    #     return 'null', 400

    db.cut_pics(username, images)
    users.setdefault(username, {'nickname': username})

    return json.dumps({
        'status': 'success',
    })

# 掃臉刪除
@app.route('/<username>', methods=['DELETE'])
def delete(username):
    image = request.files.get('image')

    return json.dumps({
        'status': 'success',
        'match': 37.06
    })

if __name__ == '__main__':
    app.run()