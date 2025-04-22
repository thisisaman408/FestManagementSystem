import pandas as pd
import sys
import json
import os
import numpy as np
from groq import Groq, APIError
from dotenv import load_dotenv
import re


load_dotenv()
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
if not GROQ_API_KEY:
    print(json.dumps({"error": "GROQ_API_KEY not found."}))
    sys.exit(1)

# Initialize Groq client
try:
    groq_client = Groq(api_key=GROQ_API_KEY)
except Exception as e:
    print(json.dumps({"error": f"Failed to initialize Groq client: {e}"}))
    sys.exit(1)

GROQ_MODEL_ID = "llama3-8b-8192"

# Define weights for engagement score
WEIGHTS = {
    'Popularity': 0.20,
    'Attendance': 0.20,
    'Hashtag': 0.15,
    'Feedback': 0.25,
    'Sentiment': 0.20
}

# Load existing event data and standardize column names
PROCESSED_DATA_PATH = './events_with_aggregated_data.csv'
try:
    data = pd.read_csv(PROCESSED_DATA_PATH)
    # Standardize column names
    data = data.rename(columns={
        'Event Name': 'event_name',
        'Event Type': 'event_type',
        'Budget (INR)': 'budget_inr',
        'Popularity Score (1-10)': 'popularity_score',
        'Attendance': 'attendance',
        'Hashtag Mentions': 'hashtag_mentions',
        'Student Feedback Score (1-10)': 'feedback_score',
        'AvgPositiveSentiment': 'avg_positive_sentiment',
        'ReviewCount': 'review_count'
    })
    required_columns = [
        'event_name', 'event_type', 'budget_inr', 'popularity_score', 'attendance',
        'hashtag_mentions', 'feedback_score', 'avg_positive_sentiment', 'review_count'
    ]
    missing_cols = [col for col in required_columns if col not in data.columns]
    if missing_cols:
        raise ValueError(f"Missing columns: {', '.join(missing_cols)}")
    data = data.dropna(subset=required_columns)
except Exception as e:
    print(json.dumps({"error": f"Error loading data: {str(e)}"}))
    sys.exit(1)

# Compute global min and max for normalization
min_popularity = data['popularity_score'].min()
max_popularity = data['popularity_score'].max()
min_attendance = data['attendance'].min()
max_attendance = data['attendance'].max()
min_hashtag = data['hashtag_mentions'].min()
max_hashtag = data['hashtag_mentions'].max()
min_feedback = data['feedback_score'].min()
max_feedback = data['feedback_score'].max()

# Function to calculate engagement score using standardized keys
def calculate_engagement(event):
    popularity = event['popularity_score']
    attendance = event['attendance']
    hashtag = event['hashtag_mentions']
    feedback = event['feedback_score']
    sentiment = event['avg_positive_sentiment']
    
    if max_popularity > min_popularity:
        popularity_norm = (popularity - min_popularity) / (max_popularity - min_popularity)
    else:
        popularity_norm = 1 if popularity == min_popularity else 0
    
    if max_attendance > min_attendance:
        attendance_norm = (attendance - min_attendance) / (max_attendance - min_attendance)
    else:
        attendance_norm = 1 if attendance == min_attendance else 0
    
    if max_hashtag > min_hashtag:
        hashtag_norm = (hashtag - min_hashtag) / (max_hashtag - min_hashtag)
    else:
        hashtag_norm = 1 if hashtag == min_hashtag else 0
    
    if max_feedback > min_feedback:
        feedback_norm = (feedback - min_feedback) / (max_feedback - min_feedback)
    else:
        feedback_norm = 1 if feedback == min_feedback else 0
    
    sentiment_norm = min(max(sentiment, 0), 1)
    
    engagement = (
        WEIGHTS['Popularity'] * popularity_norm +
        WEIGHTS['Attendance'] * attendance_norm +
        WEIGHTS['Hashtag'] * hashtag_norm +
        WEIGHTS['Feedback'] * feedback_norm +
        WEIGHTS['Sentiment'] * sentiment_norm
    )
    return engagement


def get_additional_events(num_needed, input_params, existing_names, remaining_budget):
    event_types = input_params.get('event_types', ['any'])
    min_popularity = input_params.get('min_popularity', 0)
    min_sentiment = input_params.get('min_sentiment', 0)
    prompt = f"""
Generate {num_needed} unique college events not named in {', '.join(existing_names)} with:
- Event Type: {', '.join(event_types)}
- Budget: up to {remaining_budget / num_needed if num_needed > 0 else remaining_budget} INR per event
- Popularity Score: at least {min_popularity}
- AvgPositiveSentiment: at least {min_sentiment}
Provide for each:
- event_name: string
- event_type: string
- budget_inr: number
- popularity_score: number (1-10)
- attendance: number
- hashtag_mentions: number
- feedback_score: number (1-10)
- avg_positive_sentiment: number (0-1)
- review_count: number
Return in JSON format enclosed in ```json ``` block.
"""
    try:
        completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=GROQ_MODEL_ID,
            temperature=0.7,
            max_tokens=500
        )
        response_text = completion.choices[0].message.content.strip()
        json_match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
            events = json.loads(json_str)
            return events if isinstance(events, list) else []
        return []
    except (APIError, json.JSONDecodeError) as e:
        print(f"Error fetching events from Groq: {e}", file=sys.stderr)
        return []

# Function to generate event explanations
def get_event_explanation_groq(event_name, event_type):
    messages = [
        {"role": "system", "content": "Generate a concise, exciting event description (40-60 words)."},
        {"role": "user", "content": f"Describe '{event_name}' (Type: {event_type}) for college students."}
    ]
    try:
        completion = groq_client.chat.completions.create(
            messages=messages,
            model=GROQ_MODEL_ID,
            temperature=0.7,
            max_tokens=100
        )
        return completion.choices[0].message.content.strip().replace('"', '')
    except APIError as e:
        return f"Description generation failed (API Error: {e.status_code})."

# Main event selection logic
def select_events(input_params):
    budget = input_params['budget']
    min_events = input_params.get('min_events', 1)
    
    # Filter existing events based on input parameters
    filtered_data = data.copy()
    if 'event_types' in input_params:
        filtered_data = filtered_data[filtered_data['event_type'].isin(input_params['event_types'])]
    if 'min_popularity' in input_params:
        filtered_data = filtered_data[filtered_data['popularity_score'] >= input_params['min_popularity']]
    if 'min_sentiment' in input_params:
        filtered_data = filtered_data[filtered_data['avg_positive_sentiment'] >= input_params['min_sentiment']]
    
    # Calculate engagement scores for filtered events
    filtered_data['Engagement Score'] = filtered_data.apply(calculate_engagement, axis=1)
    
    # Sort by engagement score descending
    sorted_data = filtered_data.sort_values('Engagement Score', ascending=False)
    
    # Select events within budget
    selected_events = []
    total_cost = 0.0
    for _, event in sorted_data.iterrows():
        event_cost = event['budget_inr']
        if total_cost + event_cost <= budget:
            selected_events.append(event.to_dict())
            total_cost += event_cost
    
    # If budget remains and fewer events than desired, generate more
    remaining_budget = budget - total_cost
    if len(selected_events) < min_events and remaining_budget > 0:
        num_needed = min_events - len(selected_events)
        existing_names = data['event_name'].tolist()
        additional_events = get_additional_events(num_needed, input_params, existing_names, remaining_budget)
        for gen_event in additional_events:
            event_cost = float(gen_event.get('budget_inr', 0))
            if total_cost + event_cost <= budget:
                # Ensure all required fields are present
                required_fields = ['event_name', 'event_type', 'budget_inr', 'popularity_score', 'attendance',
                                   'hashtag_mentions', 'feedback_score', 'avg_positive_sentiment', 'review_count']
                if all(field in gen_event for field in required_fields):
                    gen_event['Engagement Score'] = calculate_engagement(gen_event)
                    selected_events.append(gen_event)
                    total_cost += event_cost
    
    # Generate explanations for selected events
    for event_info in selected_events:
        explanation = get_event_explanation_groq(event_info['event_name'], event_info['event_type'])
        event_info['Explanation'] = explanation
    
    return selected_events, total_cost

# Handle input
if len(sys.argv) != 2:
    print(json.dumps({"error": "Usage: python run.py '<json_input>'"}))
    sys.exit(1)

try:
    input_data = json.loads(sys.argv[1])
    required_params = ['budget']
    missing_params = [param for param in required_params if param not in input_data]
    if missing_params:
        raise ValueError(f"Missing required parameters: {', '.join(missing_params)}")
    budget_input = float(input_data['budget'])
    if budget_input < 0:
        raise ValueError("Budget cannot be negative.")
except (ValueError, KeyError, json.JSONDecodeError) as e:
    print(json.dumps({"error": f"Invalid input: {str(e)}. Provide JSON with 'budget' and optional parameters."}))
    sys.exit(1)

# Execute event selection
selected_events, total_cost = select_events(input_data)

# Prepare output
selected_events_data = []
for event in selected_events:
    event_data = {
        'Event': event['event_name'],
        'Type': event['event_type'],
        'Cost': event['budget_inr'],
        'Engagement_Score': round(event['Engagement Score'], 4),
        'Popularity': int(event['popularity_score']),
        'Avg_Sentiment': round(event['avg_positive_sentiment'], 3),
        'Review_Count': int(event['review_count']),
        'Explanation': event['Explanation']
    }
    selected_events_data.append(event_data)

response = {
    "selected_events": selected_events_data,
    "total_estimated_cost": round(total_cost, 2),
    "budget": budget_input,
    "events_selected": len(selected_events_data)
}
if len(selected_events_data) < input_data.get('min_events', 1):
    response["message"] = f"Only {len(selected_events_data)} events could be selected within the budget."

print(json.dumps(response, indent=2))