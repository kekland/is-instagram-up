from flask import Flask, request
import logging
from requests import get
import json
app = Flask(__name__)


logging.basicConfig(level=logging.INFO)

base = "http://localhost:8081"

sessionStorage = {}


def get_requests(site=[]):
    answer = ''
    if len(site) != 0:
        for i in range(len(site)):
            url = site[i].strip()
            try:
                res = get(url)
                if res.ok:
                    answer = answer + site[i] + ' работает\n'
            except Exception as e:
                answer = answer + site[i] + ' не работает\n'
    else:
        jsn = get(base + "/status").json()
        for key in jsn.keys():
            answer += key[0].upper() + key[1:] + ": " + (
                "работает" if jsn[key] else "не работает") + "\n"
    return answer


@app.route('/post', methods=['POST'])
def main():
    logging.info('Request: %r', request.json)
    response = {
        'session': request.json['session'],
        'version': request.json['version'],
        'response': {
            'end_session': False
        }
    }
    handle_dialog(request.json, response)

    logging.info('Response: %r', request.json)
    return json.dumps(response)


def handle_dialog(req, res):
    user_id = req['session']['user_id']

    if req['session']['new']:
        sessionStorage[user_id] = {"prev": 'Привет! О блокировке каких сайтов ты хочешь узнать?'}
        # Заполняем текст ответа
        res['response']['text'] = 'Привет! О блокировке каких сайтов ты хочешь узнать?'
        res['response']['buttons'] = [
                {
                    'title': 'Все социальные сети',
                    'hide': True
                }
            ]
    else:
        if 'Все социальные сети' in req['request']['original_utterance']:
            res['response']['text'] = get_requests()
            sessionStorage[user_id]['prev'] = res['response']['text']
        else:
            zapros = req['request']['original_utterance']
            sites = zapros.split(' ')
            res['response']['text'] = get_requests(sites)
            sessionStorage[user_id]['prev'] = res['response']['text']


if __name__ == '__main__':
    app.run()

