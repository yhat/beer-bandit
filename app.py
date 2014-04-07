#!/usr/bin/env python

from flask import Flask, request, render_template, url_for, Response, json
from yhat import Yhat
from uuid import uuid4
import numpy as np

from bandits import EpsilonGreedy

app = Flask(__name__)
yh = Yhat("__username__", "__apikey__",
                  "http://cloud.yhathq.com/")

arms = ["EuclideanBeerRec","CosineBeerRec","CorrelationBeerRec"]
eg = EpsilonGreedy(3)
ids = {}

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        arm = eg.choose_arm()
        arm_name = arms[arm]
        u_id = str(uuid4())
        pred = yh.predict(arm_name, {"beers": request.json['beers']})
        ids[u_id] = {
            'arm':arm,
            'arm_name':arm_name
        }
        return Response(json.dumps({'result':pred['result'],
                                    'uid':u_id}),mimetype='application/json')
    else:
        if len(ids) > 1000:
            ids.clear()
        # static files
        css_url = url_for('static', filename='css/main.css')
        jquery_url = url_for('static', filename='js/jquery-1.10.2.min.js')
        beers_url = url_for('static', filename='js/beers.js')
        highlight_url = url_for('static', filename='js/code.js')
        js_url = url_for('static', filename='js/main.js')
        return render_template('index.html', css_url=css_url,
                               jquery_url=jquery_url, beers_url=beers_url,
                               js_url=js_url, highlight_url=highlight_url)


@app.route('/update', methods=['POST'])
def update_path():
    try:
        u_id,item_num = request.json['id'], int(request.json['item'])
        reward = 1. - (item_num / 9.)
        if reward > 1. or reward < 0.:
            raise Exception()
        reward = reward * reward;
        # will throw exception if id not in ids
        arm_data = ids.pop(u_id)
        arm = arm_data['arm']
        eg.update(arm,reward)
        arm_data['reward'] = reward
        arm_data['arm_name'] = arms[arm]
        res = Response(json.dumps(arm_data),
                        mimetype='application/json')
        return res
    except Exception:
        res = Response(json.dumps({'bad data':"sorry"}),
                        mimetype='application/json')
        return res

@app.route('/state', methods=['GET'])
def get_results():
    state = {}
    state['epsilon'] = eg.get_epsilon()
    state['arms'] = []
    for i in range(len(arms)):
        arm_data = {}
        arm_data['name'] = arms[i]
        arm_data['number'] = i
        arm_data['count'] = eg.counts[i]
        arm_data['value'] = eg.values[i]
        state['arms'].append(arm_data)
    return render_template('state.html',state=state)

if __name__ == '__main__':
    app.run(debug=True)
