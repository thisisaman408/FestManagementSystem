import numpy as np
import pandas as pd

df1 = pd.read_csv('Data/College_Fest_Review_data_set.csv')
df2 = pd.read_csv('Data/college_events_data.csv')
df3 = pd.read_csv('Data/expanded_college_events_data.csv')
df4 = pd.read_csv('processed_events.csv')
df5 = pd.read_csv('processed_with_scores.csv')

for i in range(1, 6):
    df_name = globals()[f'df{i}']
    print(f"\nDataFrame {i} info :")
    print(df_name.info())
