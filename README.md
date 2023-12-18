# venv aktivieren
    source env/bin/activate

# Server starten
    python3 manage.py runserver

# Datenbank erstellen
    python3 manage.py makemigrations
    python manage.py migrate
    python -m pip install Pillow
    python manage.py flush

# Datenbank leeren
    python manage.py flush

# Pillow
    python -m pip install Pillow
 
# App erstellen
    python manage.py startapp projects

# Git
- Branch
git branch --list
git branch _name
git checkout _name

- Push
git add .
git commit -m '_text'
git push origin models