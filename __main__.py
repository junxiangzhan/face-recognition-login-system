from flask import Flask, request
from datetime import datetime, timedelta
import json
import jwt
from functions.test import Database

app = Flask(__name__)
tokens = {}

db = Database(r"data\\haarcascade_profileface.xml")
users = {}

# 使用者 ui
@app.route('/', methods=['GET'])
def default():
    return app.send_static_file('index.html')

# 取得資訊
@app.route('/<name>', methods=['GET'])
def getInfo(name):
    token = request.args.get('token')
    payload = jwt.decodeToken(token)

    if payload and tokens.get(token) == name:
        expires_time = payload.get('expires')
        if datetime.now() > expires_time:
            return json.dumps(None), 401
        return json.dumps(users.get(name)), 200
    elif token:
        return json.dumps(None), 401
    
    if name in users:
        return json.dumps({'nickname': users.get(name).get('nickname')}), 200
    else:
        return json.dumps(None), 404

# 驗證
@app.route('/<username>', methods=['PUT'])
def login(username):
    image = request.files.get('image')
    # image.save(f'{username}.jpg')
    # data=image.stream.read()

    if username != 'test':
        return json.dumps(None), 401

    payload = {
        "username": username,
        "iat": datetime.now(),
        "expires": datetime.now() + timedelta(0, 1500)
    }

    jwt_token = jwt.generateToken(payload)

    return jwt_token
    

# 建檔
@app.route('/<username>', methods=['POST'])
def register(username):

    images = request.files.getlist('images')

    db.saveImages(username, images)

    users.setdefault(username, {})

    return json.dumps({
        'status': 'success',
    })

# 掃臉刪除
@app.route('/<username>', methods=['DELETE'])
def delete(username):
    return json.dumps({
        'status': 'success',
        'match': 37.06
    })

if __name__ == '__main__':
    app.run()