import sqlite3

def patch_db():
    try:
        conn = sqlite3.connect('exam_helper.db')
        cursor = conn.cursor()
        
        # Add teacher_id to outline
        print("Patching 'outline' table with 'teacher_id' column...")
        try:
            cursor.execute("ALTER TABLE outline ADD COLUMN teacher_id INTEGER REFERENCES user(id);")
            print("Successfully added teacher_id to outline.")
        except Exception as e:
            print(f"Skipping teacher_id in outline: {e}")
            
        # Add username to user
        print("Patching 'user' table with 'username' column...")
        try:
            cursor.execute("ALTER TABLE user ADD COLUMN username TEXT;")
            cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_user_username ON user(username);")
            print("Successfully added username to user.")
        except Exception as e:
            print(f"Skipping username in user: {e}")
            
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Failed to patch DB: {e}")

if __name__ == "__main__":
    patch_db()
