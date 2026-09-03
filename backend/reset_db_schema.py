from app import app, db, seed_data
from sqlalchemy import text

with app.app_context():
    print("Dropping all existing database tables with CASCADE for schema migration...")
    # List of all potential tables from previous and current schemas
    tables = [
        'phases', 
        'artifacts', 
        'tasks', 
        'task_comments', 
        'project_tasks', 
        'project_phases', 
        'projects', 
        'users', 
        'audit_logs'
    ]
    
    for t in tables:
        try:
            db.session.execute(text(f"DROP TABLE IF EXISTS {t} CASCADE;"))
            db.session.commit()
            print(f"Dropped table {t} successfully.")
        except Exception as e:
            db.session.rollback()
            print(f"Notice: Table {t} drop skipped or failed: {e}")
            
    # Standard metadata drop and create
    db.drop_all()
    db.create_all()
    print("New database tables created successfully.")
    
    # Run seed
    seed_data()
    print("Seeding completed successfully.")
