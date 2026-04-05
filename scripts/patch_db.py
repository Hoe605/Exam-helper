import sqlite3

def patch_db():
    try:
        conn = sqlite3.connect('exam_helper.db')
        cursor = conn.cursor()
        
        # Add teacher_id to outline
        print("Paging 'outline' table with 'teacher_id' column...")
        try:
            cursor.execute("ALTER TABLE outline ADD COLUMN teacher_id INTEGER REFERENCES user(id);")
            print("Successfully added teacher_id to outline.")
        except Exception as e:
            print(f"Skipping teacher_id in outline: {e}")
            
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Failed to patch DB: {e}")

if __name__ == "__main__":
    patch_db()
