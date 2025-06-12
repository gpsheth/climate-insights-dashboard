import sqlite3

conn = sqlite3.connect('weather_cache.db')
c = conn.cursor()

c.execute('''
CREATE TABLE IF NOT EXISTS weather_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    location TEXT,
    start_date TEXT,
    end_date TEXT,
    data TEXT
)
''')

conn.commit()
conn.close()
