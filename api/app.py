from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import datetime

app = Flask(__name__)
CORS(app)

# MongoDB setup
client = MongoClient('mongodb://localhost:27017/')
db = client['colors_db']
colors_collection = db['colors']

# Convert date to string format (YYYY-MM-DD)
def date_to_string(date_obj):
    return date_obj.strftime('%Y-%m-%d')

# Route to fetch only changed colors (GET)
@app.route('/daily_colors', methods=['GET'])
def get_daily_colors():
    today = datetime.datetime.now().strftime('%Y-%m-%d')

    # Query the database for color data from today onwards (next 7 days)
    next_week = (datetime.datetime.now() + datetime.timedelta(days=28)).strftime('%Y-%m-%d')
    colors_data = colors_collection.find({
        "date": {"$gte": today, "$lte": next_week}
    })

    # Create a dictionary to store only the changed hours
    changed_colors = {}
    
    for color_entry in colors_data:
        date = color_entry['date']
        hour = int(color_entry['hour'])
        color = color_entry['color']
        
        if date not in changed_colors:
            changed_colors[date] = {}
        
        changed_colors[date][hour] = color

    return jsonify(changed_colors)

# Route to update only the changed colors (POST)
@app.route('/update_colors', methods=['POST'])
def update_colors():
    updated_colors = request.json  # Receive only the changed colors

    for date, colors in updated_colors.items():
        for hour, color in colors.items():
            # Update only the specific hour that was changed
            if color:
                colors_collection.update_one(
                    {'date': date, 'hour': str(hour)},  # Search by date and hour
                    {'$set': {'color': color}},  # Set the new color
                    upsert=True  # Insert a new document if it doesn't exist
                )

    return jsonify({"status": "success"})

if __name__ == '__main__':
    app.run(debug=True)
