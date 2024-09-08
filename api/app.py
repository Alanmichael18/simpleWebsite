from flask import Flask, redirect, url_for, send_from_directory
from pymongo import MongoClient
from flask_cors import CORS, cross_origin
import json
import os

app = Flask(__name__, static_folder='/Users/alan/simpleWebsite/frontend/build')
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


mongoClient = MongoClient('mongodb://127.0.0.1:27017')
db = mongoClient.get_database('names_db')
names_col = db.get_collection('names_col')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.route('/addname/<name>/')
def addname(name = 'alan'):
    names_col.insert_one({"name": name.lower()})
    return redirect(url_for('getnames'))

@app.route('/deletename/<name>', methods=['DELETE'])
def deletename(name = 'alan'):
    # Delete document from MongoDB based on the name
    names_col.delete_one({"name": name.lower()})
    return redirect(url_for('getnames'))

@app.route('/getnames/')
def getnames():
    names_json = []
    if names_col.find({}):
        for name in names_col.find({}).sort("name"):
            names_json.append({"name": name['name'], "id": str(name['_id'])})
    return json.dumps(names_json)

if __name__ == "__main__":
    app.run(debug=True)