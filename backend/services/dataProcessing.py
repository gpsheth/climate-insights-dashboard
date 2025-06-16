import pandas as pd
from datetime import datetime

def calculate_yearly_averages(hourly_data):
    """Calculate yearly average temperatures"""
    if not hourly_data or 'time' not in hourly_data or 'temperature_2m' not in hourly_data:
        return []
    
    df = pd.DataFrame({
        'time': hourly_data['time'],
        'temperature': hourly_data['temperature_2m']
    })

    df['time'] = pd.to_datetime(df['time'])
    df['year'] = df['time'].dt.year

    yearly_avg = df.groupby('year')['temperature'].mean().reset_index()
    return yearly_avg.rename(columns={'temperature': 'avg_temp'}).to_dict('records')

def prepare_temperature_rain_correlation(hourly_data):
    """Prepare data for temperature vs rain correlation"""
    if not hourly_data or 'temperature_2m' not in hourly_data or 'precipitation' not in hourly_data:
        return []
    
    return [
        {'temperature': temp, 'precipitation': precip}
        for temp, precip in zip(hourly_data['temperature_2m'], hourly_data['precipitation'])
    ]