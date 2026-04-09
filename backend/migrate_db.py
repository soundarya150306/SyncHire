import sqlite3

conn = sqlite3.connect("cv_screening.db")
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE candidates ADD COLUMN interview_slot DATETIME")
    conn.commit()
    print("Successfully added interview_slot column.")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e).lower():
        print("Column already exists.")
    else:
        print("Error:", e)
        
conn.close()
