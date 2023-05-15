from flask import Flask, request, Response
import json

app = Flask(__name__)

users = {
    'test': {
        'nickname': '測試帳號',
    }
}

tokens = {}

# 使用者 ui
@app.route('/', methods=['GET'])
def default():
    return app.send_static_file('index.html')

# 取得資訊
@app.route('/<name>', methods=['GET'])
def getInfo(name):
    token = request.args.get('token')
    
    if tokens.get(token) == name:
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
    return json.dumps({
        'status': 'success',
        'match': 37.06
    })
    

# 建檔
@app.route('/<username>', methods=['POST'])
def register(username):
    images = request.files.getlist('images')
    print(images)
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

app.run()