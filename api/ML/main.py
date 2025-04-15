import pandas as pd
import torch
from transformers import pipeline

try:
    df = pd.read_csv('Data/College_Fest_Review_data_set.csv')
except FileNotFoundError:
    print("The CSV file 'Data/College_Fest_Review_data_set.csv' was not found.")
    exit()

device = 0 if torch.cuda.is_available() else -1  

try:
   
    event_extractor = pipeline("text-generation", model="openai-community/gpt2", device=device)
    sentiment_analyzer = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english", device=device)
except Exception as e:
    print(f"An error occurred while loading the models: {e}")
    exit()

def extract_event_names(comment):
    prompt = f"Extract the event names from this comment: '{comment}'"
    try:
        result = event_extractor(prompt, max_length=50, num_return_sequences=1)
        extracted_text = result[0]['generated_text'].replace("Extract the event names from this comment:", "").strip()
        return extracted_text if extracted_text else "No events found"
    except Exception as e:
        print(f"Error extracting event names from comment: {comment} - {e}")
        return "Error in extraction"


def analyze_sentiment(comment):
    try:
        sentiment_result = sentiment_analyzer(comment)
        sentiment = sentiment_result[0]['label']
        return "Positive" if sentiment == "POSITIVE" else "Negative"
    except Exception as e:
        print(f"Error analyzing sentiment for comment: {comment} - {e}")
        return "Error in sentiment analysis"
try:
    df['Extracted Events'] = df['Comments'].apply(extract_event_names)
    df['Sentiment'] = df['Comments'].apply(analyze_sentiment)
except KeyError:
    print("The 'Comments' column was not found in the dataset.")
    exit()


print("\nExtracted Events and Sentiments:")
print(df[['Comments', 'Extracted Events', 'Sentiment']])

output_file = 'processed_events.csv'
df.to_csv(output_file, index=False)
print(f"\nResults saved to '{output_file}'")
