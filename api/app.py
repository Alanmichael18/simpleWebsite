from flask import Flask, redirect, url_for, send_from_directory, jsonify, request
from pymongo import MongoClient
from flask_cors import CORS, cross_origin
import json
import os
from datetime import datetime, timedelta


app = Flask(__name__, static_folder='/Users/alan/simpleWebsite/frontend/build')
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


mongoClient = MongoClient('mongodb://127.0.0.1:27017')
db = mongoClient.get_database('names_db')
names_col = db.get_collection('names_col')

colordb = mongoClient.get_database('colors_db')
colors_collection = colordb.get_collection('colors_col')

hour_colors = [
  { "date": "2024-09-09", "hour": 0, "color": "#FFDDC1" },
  { "date": "2024-09-09", "hour": 1, "color": "#FFCCBC" },
  { "date": "2024-09-09", "hour": 2, "color": "#FFE0B2" },
  { "date": "2024-09-09", "hour": 3, "color": "#FFECB3" },
  { "date": "2024-09-09", "hour": 4, "color": "#FFF9C4" },
  { "date": "2024-09-09", "hour": 5, "color": "#F0F4C3" },
  { "date": "2024-09-09", "hour": 6, "color": "#DCEDC8" },
  { "date": "2024-09-09", "hour": 7, "color": "#C8E6C9" },
  { "date": "2024-09-09", "hour": 8, "color": "#B2DFDB" },
  { "date": "2024-09-09", "hour": 9, "color": "#B2EBF2" },
  { "date": "2024-09-09", "hour": 10, "color": "#B3E5FC" },
  { "date": "2024-09-09", "hour": 11, "color": "#BBDEFB" },
  { "date": "2024-09-09", "hour": 12, "color": "#C5CAE9" },
  { "date": "2024-09-09", "hour": 13, "color": "#D1C4E9" },
  { "date": "2024-09-09", "hour": 14, "color": "#E1BEE7" },
  { "date": "2024-09-09", "hour": 15, "color": "#F8BBD0" },
  { "date": "2024-09-09", "hour": 16, "color": "#FFCDD2" },
  { "date": "2024-09-09", "hour": 17, "color": "#D7CCC8" },
  { "date": "2024-09-09", "hour": 18, "color": "#CFD8DC" },
  { "date": "2024-09-09", "hour": 19, "color": "#B0BEC5" },
  { "date": "2024-09-09", "hour": 20, "color": "#90A4AE" },
  { "date": "2024-09-09", "hour": 21, "color": "#78909C" },
  { "date": "2024-09-09", "hour": 22, "color": "#607D8B" },
  { "date": "2024-09-09", "hour": 23, "color": "#546E7A" },
  
  { "date": "2024-09-10", "hour": 0, "color": "#E0F2F1" },
  { "date": "2024-09-10", "hour": 1, "color": "#B9FBC0" },
  { "date": "2024-09-10", "hour": 2, "color": "#C5E1A5" },
  { "date": "2024-09-10", "hour": 3, "color": "#FCE4EC" },
  { "date": "2024-09-10", "hour": 4, "color": "#F1F8E9" },
  { "date": "2024-09-10", "hour": 5, "color": "#E8F5E9" },
  { "date": "2024-09-10", "hour": 6, "color": "#E1F5FE" },
  { "date": "2024-09-10", "hour": 7, "color": "#B3E5FC" },
  { "date": "2024-09-10", "hour": 8, "color": "#FFEBEE" },
  { "date": "2024-09-10", "hour": 9, "color": "#DCE775" },
  { "date": "2024-09-10", "hour": 10, "color": "#FFAB91" },
  { "date": "2024-09-10", "hour": 11, "color": "#D7CCC8" },
  { "date": "2024-09-10", "hour": 12, "color": "#D1C4E9" },
  { "date": "2024-09-10", "hour": 13, "color": "#C5CAE9" },
  { "date": "2024-09-10", "hour": 14, "color": "#F8BBD0" },
  { "date": "2024-09-10", "hour": 15, "color": "#FF8A65" },
  { "date": "2024-09-10", "hour": 16, "color": "#FFAB91" },
  { "date": "2024-09-10", "hour": 17, "color": "#C5E1A5" },
  { "date": "2024-09-10", "hour": 18, "color": "#FF6F61" },
  { "date": "2024-09-10", "hour": 19, "color": "#DCE775" },
  { "date": "2024-09-10", "hour": 20, "color": "#C5E1A5" },
  { "date": "2024-09-10", "hour": 21, "color": "#FFAB91" },
  { "date": "2024-09-10", "hour": 22, "color": "#C5CAE9" },
  { "date": "2024-09-10", "hour": 23, "color": "#F8BBD0" },
  
  { "date": "2024-09-11", "hour": 0, "color": "#FFEBEE" },
  { "date": "2024-09-11", "hour": 1, "color": "#E0F2F1" },
  { "date": "2024-09-11", "hour": 2, "color": "#B9FBC0" },
  { "date": "2024-09-11", "hour": 3, "color": "#C5E1A5" },
  { "date": "2024-09-11", "hour": 4, "color": "#FCE4EC" },
  { "date": "2024-09-11", "hour": 5, "color": "#F1F8E9" },
  { "date": "2024-09-11", "hour": 6, "color": "#E8F5E9" },
  { "date": "2024-09-11", "hour": 7, "color": "#E1F5FE" },
  { "date": "2024-09-11", "hour": 8, "color": "#B3E5FC" },
  { "date": "2024-09-11", "hour": 9, "color": "#FFEBEE" },
  { "date": "2024-09-11", "hour": 10, "color": "#DCE775" },
  { "date": "2024-09-11", "hour": 11, "color": "#FFAB91" },
  { "date": "2024-09-11", "hour": 12, "color": "#D7CCC8" },
  { "date": "2024-09-11", "hour": 13, "color": "#D1C4E9" },
  { "date": "2024-09-11", "hour": 14, "color": "#C5CAE9" },
  { "date": "2024-09-11", "hour": 15, "color": "#F8BBD0" },
  { "date": "2024-09-11", "hour": 16, "color": "#FF8A65" },
  { "date": "2024-09-11", "hour": 17, "color": "#FFAB91" },
  { "date": "2024-09-11", "hour": 18, "color": "#C5E1A5" },
  { "date": "2024-09-11", "hour": 19, "color": "#FF6F61" },
  { "date": "2024-09-11", "hour": 20, "color": "#DCE775" },
  { "date": "2024-09-11", "hour": 21, "color": "#C5E1A5" },
  { "date": "2024-09-11", "hour": 22, "color": "#FFAB91" },
  { "date": "2024-09-11", "hour": 23, "color": "#C5CAE9" }
]


# Insert colors into MongoDB collection
colors_collection.insert_many(hour_colors)

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



@app.route('/daily_colors', methods=['GET'])
def get_daily_colors():
    try:
        # Fetch all colors from MongoDB and organize them into a dictionary
        colors_cursor = colors_collection.find()
        daily_colors = {}
        for doc in colors_cursor:
            date = doc['date']
            hour = doc['hour']
            color = doc['color']
            if date not in daily_colors:
                daily_colors[date] = ['#ffffff'] * 24  # Initialize with default color
            daily_colors[date][hour] = color
        return jsonify(daily_colors)
    except Exception as e:
        print(f"Error fetching daily colors: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/update_colors', methods=['POST'])
def update_colors():
    try:
        updated_colors = request.json
        
        # Clear existing colors in the collection
        colors_collection.delete_many({})
        
        # Insert updated colors into MongoDB
        for date, colors in updated_colors.items():
            for hour, color in enumerate(colors):
                colors_collection.insert_one({
                    "date": date,
                    "hour": hour,
                    "color": color
                })
        
        return jsonify({"message": "Colors updated successfully"}), 200
    except Exception as e:
        print(f"Error updating colors: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)