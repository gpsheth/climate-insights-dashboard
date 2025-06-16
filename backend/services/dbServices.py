import sqlite3
import json

def init_db():
    conn = sqlite3.connect('weather_cache.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS weather_cache (
            location TEXT NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            hourly TEXT NOT NULL,
            data TEXT NOT NULL,
            PRIMARY KEY (location, start_date, end_date, hourly)
        )
    ''')
    conn.commit()
    conn.close()
    print("weather_cache.db initialized successfully.")

def check_cache(location, start_date, end_date, hourly):
    conn = sqlite3.connect('weather_cache.db')
    c = conn.cursor()
    c.execute('''
        SELECT data FROM weather_cache
        WHERE location=? AND start_date=? AND end_date=? AND hourly=?
    ''', (location, start_date, end_date, hourly))
    row = c.fetchone()
    conn.close()
    return json.loads(row[0]) if row else None

def save_to_cache(location, start_date, end_date, data, hourly):
    conn = sqlite3.connect('weather_cache.db')
    c = conn.cursor()
    try:
        c.execute('''
            INSERT INTO weather_cache (location, start_date, end_date, data, hourly)
            VALUES (?, ?, ?, ?, ?)
        ''', (location, start_date, end_date, json.dumps(data), hourly))
        conn.commit()
    except sqlite3.IntegrityError:
        # Already exists, update instead
        c.execute('''
            UPDATE weather_cache SET data = ?
            WHERE location=? AND start_date=? AND end_date=? AND hourly=?
        ''', (json.dumps(data), location, start_date, end_date, hourly))
        conn.commit()
    finally:
        conn.close()

def get_cached_data(location, start_date, end_date):
    conn = sqlite3.connect('weather_cache.db')
    c = conn.cursor()
    c.execute('''
        SELECT data FROM weather_cache
        WHERE location=? AND start_date=? AND end_date=?
    ''', (location, start_date, end_date))
    row = c.fetchone()
    conn.close()
    return json.loads(row[0]) if row else None