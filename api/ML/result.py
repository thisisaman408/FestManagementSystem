import pandas as pd
import random
from transformers import pipeline

df = pd.read_csv('processed_events.csv')


sentiment_analyzer = pipeline("sentiment-analysis")


def assign_sentiment(comment):
    result = sentiment_analyzer(comment)
    sentiment = result[0]['label']  
    score = 1 if sentiment == 'POSITIVE' else 0
    return score

def assign_event_cost(event):
   
    return random.randint(20000, 100000)


def assign_social_media_trend(event):
  
    return random.randint(0, 100)


df['Sentiment Score'] = df['Comments'].apply(assign_sentiment)
df['Event Cost'] = df['Comments'].apply(assign_event_cost)
df['Social Media Trend Score'] = df['Extracted Events'].apply(assign_social_media_trend)


positive_events = df[df['Sentiment Score'] == 1]


df.to_csv('processed_with_scores.csv', index=False)

print("Updated dataset saved as 'processed_with_scores.csv'")


print(df[['Extracted Events', 'Event Cost', 'Sentiment Score', 'Social Media Trend Score']].head())
