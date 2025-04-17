# process_data.py
import pandas as pd
import torch
from transformers import pipeline
import numpy as np
import time
import re 

print("Starting data processing...")


REVIEW_DATA_PATH = 'Data/College_Fest_Review_data_set.csv'
EVENT_DATA_PATH = 'Data/expanded_college_events_data.csv'
OUTPUT_PATH = 'events_with_aggregated_data.csv'
BATCH_SIZE = 16 


try:
    print(f"Loading review data from: {REVIEW_DATA_PATH}")
    df_reviews = pd.read_csv(REVIEW_DATA_PATH)
    print(f"Loaded {len(df_reviews)} reviews.")

    print(f"Loading event data from: {EVENT_DATA_PATH}")
    df_events = pd.read_csv(EVENT_DATA_PATH)
    print(f"Loaded {len(df_events)} unique events.")

   
    if 'Comments' not in df_reviews.columns:
        raise KeyError("The 'Comments' column was not found in the review dataset.")
   
    if 'Event Name' not in df_events.columns:
        raise KeyError("The 'Event Name' column was not found in the event dataset.")

    
    df_reviews['Comments'] = df_reviews['Comments'].astype(str)

except FileNotFoundError as e:
    print(f"Error: File not found. {e}")
    exit()
except KeyError as e:
    print(f"Error: {e}")
    exit()
except Exception as e:
    print(f"An error occurred during data loading: {e}")
    exit()


try:
    print("Initializing sentiment analysis model...")
    device = 0 if torch.cuda.is_available() else -1
    if device == 0:
        print("CUDA (GPU) available. Using GPU.")
    else:
        print("CUDA not available. Using CPU.")

   
    sentiment_analyzer = pipeline(
        "sentiment-analysis",
        model="distilbert-base-uncased-finetuned-sst-2-english",
        device=device,
        return_all_scores=True 
    )
    print("Sentiment analysis model loaded.")
except Exception as e:
    print(f"An error occurred while loading the sentiment analysis model: {e}")
    exit()


print("Matching comments to known events...")
start_time = time.time()

# Creating... a mapping from lowercase event name to original Event Name and ID
event_name_map = {name.lower(): (name, eid) for name, eid in zip(df_events['Event Name'], df_events['Event ID'])}
event_names_lower = list(event_name_map.keys())

def find_mentioned_event(comment):
    comment_lower = comment.lower()
    
    for event_lower in event_names_lower:
        
        pattern = r'\b' + re.escape(event_lower) + r'\b'
        if re.search(pattern, comment_lower):
            original_name, event_id = event_name_map[event_lower]
            return pd.Series([original_name, event_id])
    return pd.Series([None, None]) 


df_reviews[['Matched Event Name', 'Event ID']] = df_reviews['Comments'].apply(find_mentioned_event)


df_matched_reviews = df_reviews.dropna(subset=['Matched Event Name'])
print(f"Found {len(df_matched_reviews)} comments matching known events.")
print(f"Matching took {time.time() - start_time:.2f} seconds.")

if df_matched_reviews.empty:
    print("No comments matched any known events. Exiting.")
    exit()


print(f"Performing sentiment analysis in batches of {BATCH_SIZE}...")
start_time = time.time()

comments_to_analyze = df_matched_reviews['Comments'].tolist()
all_sentiments = []

try:
   
    for i in range(0, len(comments_to_analyze), BATCH_SIZE):
        batch = comments_to_analyze[i:i+BATCH_SIZE]
        results = sentiment_analyzer(batch, truncation=True, max_length=512) 
        all_sentiments.extend(results)
        if (i // BATCH_SIZE + 1) % 10 == 0: 
             print(f"  Processed batch {i // BATCH_SIZE + 1}/{(len(comments_to_analyze) + BATCH_SIZE - 1) // BATCH_SIZE}")

    print(f"Sentiment analysis took {time.time() - start_time:.2f} seconds.")


    print("Processing sentiment results...")
   
    positive_scores = []
    for result_list in all_sentiments:
        
        positive_score = 0.0
        for score_dict in result_list:
            if score_dict['label'] == 'POSITIVE':
                positive_score = score_dict['score']
                break
        positive_scores.append(positive_score)

    df_matched_reviews['Positive Sentiment Score'] = positive_scores

except Exception as e:
    print(f"An error occurred during sentiment analysis: {e}")
  
    exit()


print("Aggregating sentiment data per event...")

sentiment_agg = df_matched_reviews.groupby('Event ID').agg(
    AvgPositiveSentiment=('Positive Sentiment Score', 'mean'),
    ReviewCount=('Comments', 'count')
).reset_index()

print("Aggregation complete.")

print("Merging aggregated sentiment with event details...")
df_final_events = pd.merge(df_events, sentiment_agg, on='Event ID', how='left')


df_final_events['AvgPositiveSentiment'] = df_final_events['AvgPositiveSentiment'].fillna(0.5) 
df_final_events['ReviewCount'] = df_final_events['ReviewCount'].fillna(0).astype(int)

print("Merge complete.")

try:
    print(f"Saving final processed data to: {OUTPUT_PATH}")
    df_final_events.to_csv(OUTPUT_PATH, index=False)
    print("Processing finished successfully.")
except Exception as e:
    print(f"An error occurred while saving the output file: {e}")