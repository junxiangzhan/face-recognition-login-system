import base64
import json
import hmac


def generateToken(payload, secret: str):

    jwt = []
    jwt.append(base64.b64encode(json.dumps({'typ': 'JWT', 'alg': 'sha256'})))
    jwt.append(base64.b64encode(json.dumps(payload)))
    
    token = b'.'.join(jwt)
    hmac_token = hmac.digest(
        secret,
        token,
        'sha256'
    )

    jwt.append(base64.b64encode(hmac_token))

    return str(b'.'.join(jwt))
    
def decodeToken(token: str, secret: str):
    header_b64, payload_b64, hmac_token_b64 = token.split('.')
    payload = json.loads(base64.b64decode(payload_b64))
    hmac_token = base64.b64decode(hmac_token_b64)

    test_token = hmac.digest(
        secret,
        token,
        'sha256'
    )

    if header_b64 != json.dumps({'typ': 'JWT', 'alg': 'sha256'}):
        return False

    if test_token != hmac_token:
        return False
    
    return payload
    