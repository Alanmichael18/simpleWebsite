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



# Function to convert date to string (YYYY-MM-DD)
def date_to_string(date_obj):
    return date_obj.strftime('%Y-%m-%d')

# Route to fetch daily colors (GET)
@app.route('/daily_colors', methods=['GET'])
def get_daily_colors():
    # Query the database for color data in the next 7 days
    today = datetime.now().strftime('%Y-%m-%d')
    colors_data = colors_collection.find({"date": {"$gte": today}})
    
    # Prepare the response in the expected format
    daily_colors = {}
    for color_entry in colors_data:
        date = color_entry['date']
        hour = int(color_entry['hour'])
        color = color_entry['color']
        
        if date not in daily_colors:
            daily_colors[date] = ['#FFFFFF'] * 24  # Default for each hour
        
        daily_colors[date][hour] = color
    
    return jsonify(daily_colors)

# Route to update colors (POST)
@app.route('/update_colors', methods=['POST'])
def update_colors():
    updated_colors = request.json  # Get the updated colors from the frontend
    print('Received updated colors:', updated_colors)

    # Iterate through each date and hour to update MongoDB
    for date, colors in updated_colors.items():
        for hour, color in enumerate(colors):
            # Find and update the document for this date and hour, or insert if it doesn't exist
            colors_collection.update_one(
                {'date': date, 'hour': str(hour)},  # Search by date and hour
                {'$set': {'color': color}},  # Set the new color
                upsert=True  # Insert a new document if it doesn't exist
            )

    # Return the updated colors back to the frontend
    return get_daily_colors()

if __name__ == "__main__":
    app.run(debug=True)