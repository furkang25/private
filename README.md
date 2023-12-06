# Schritt: venv aktivieren
    source env/bin/activate

# Schritt: Webserver betreiben
    python3 manage.py runserver

# Schritt: Datenbank erstellen
    python3 manage.py makemigrations
    python manage.py migrate
    python -m pip install Pillow
    python manage.py flush

# Schritt: Datenbank Leer machen
    python manage.py flush

# Schritt: Pillow:
    python -m pip install Pillow

# Admin
    Benutzer: Seyma
    Passwort: Berlin1530

# APPS
 - Webseite App
 - Project App
 - Ducuments App
 
# App project:
    python manage.py startapp projects

# Modul documents:
    python manage.py startapp documents

# Neue User:
    python manage.py createsuperuser

# Figma

# Git
- Branrch
git branch --list
git branch _name
git checkout _name

- Push
git add .
git commit -m '_text'
git push origin models