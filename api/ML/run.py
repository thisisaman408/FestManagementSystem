import pandas as pd
import sys
import json
import os

script_dir = os.path.dirname(os.path.realpath(__file__))
file_path = os.path.join(script_dir, 'processed_with_scores.csv')

try:
    data = pd.read_csv(file_path)
except FileNotFoundError:
    print(json.dumps({"error": f"File not found: {file_path}"}))
    sys.exit(1)
except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)

def clean_event_cost(cost):
    try:
        return float(str(cost).replace(',', '').strip()) 
    except ValueError:
        return 0  


data['Event Cost'] = data['Event Cost'].apply(clean_event_cost)

def get_events_within_budget(budget):
    positive_events = data[data['Sentiment'] == 'Positive']
    positive_events_sorted = positive_events.sort_values(by=['Sentiment Score', 'Social Media Trend Score'], ascending=False)

    selected_events = []
    total_cost = 0
    event_names_seen = set()  

    for index, event in positive_events_sorted.iterrows():
        event_cost = event['Event Cost']
        event_name = event['Extracted Events']
        
        if event_name in event_names_seen:
            continue
        
        if total_cost + event_cost <= budget:
            selected_events.append({
                'Event': event_name,
                'Cost': event_cost,
                'Sentiment': event['Sentiment'],
                'Sentiment Score': event['Sentiment Score'],
                'Social Media Trend Score': event['Social Media Trend Score']
            })
            total_cost += event_cost
            event_names_seen.add(event_name)  

    return selected_events, total_cost

if len(sys.argv) != 2:
    print(json.dumps({"error": "Budget not provided."}))
    sys.exit(1)

try:
    budget = float(sys.argv[1])
except ValueError:
    print(json.dumps({"error": "Invalid budget provided."}))
    sys.exit(1)


events_within_budget, total_cost = get_events_within_budget(budget)


response = {}

if events_within_budget:
    response["events"] = events_within_budget
    response["total_cost"] = total_cost
else:
    response["message"] = f"No events can be organized within your budget of Rs {budget}."

# Print the response as JSON
print(json.dumps(response))
