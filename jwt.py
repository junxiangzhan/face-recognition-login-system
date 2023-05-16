import base64 as __base64
import json as __json
import hmac as __hmac
import random as __random
from typing import Literal as __literal

__secret_key = __random.getrandbits(256).to_bytes(256)


def generateToken(payload):

    jwt = []
    jwt.append(__base64.b64encode(
        __json.dumps({'typ': 'JWT', 'alg': 'sha256'})))
    jwt.append(__base64.b64encode(__json.dumps(payload)))

    token = b'.'.join(jwt)
    hmac_token = __hmac.digest(
        __secret_key,
        token,
        'sha256'
    )

    jwt.append(__base64.b64encode(hmac_token))

    return str(b'.'.join(jwt))


def decodeToken(token: str) -> dict | __literal[False]:

    try:
        header_b64, payload_b64, hmac_token_b64 = token.split('.')
        payload = __json.loads(__base64.b64decode(payload_b64))
        hmac_token = __base64.b64decode(hmac_token_b64)

        test_token = __hmac.digest(
            __secret_key,
            token,
            'sha256'
        )
    except:
        return False

    if header_b64 != __json.dumps({'typ': 'JWT', 'alg': 'sha256'}):
        return False

    if test_token != hmac_token:
        return False

    return payload
