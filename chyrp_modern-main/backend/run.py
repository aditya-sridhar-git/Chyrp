from app import create_app
from app.models import db, User

app = create_app()

@app.cli.command("init_db")
def init_db():
    
    print("Database initialized!")

if __name__ == '__main__':
    app.run(debug=True)
