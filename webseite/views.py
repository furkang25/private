from django.shortcuts import render, redirect
from django.contrib import messages


from django.contrib.auth.decorators import login_required

from .forms import LoginForm

from django.urls import reverse_lazy
from django.contrib.auth.views import LoginView

class CustomLoginView(LoginView):
    # Legt fest, welches Formular für die Authentifizierung verwendet werden soll
    form_class = LoginForm 

    # Wird aufgerufen, wenn das Formular gültig ist
    def form_valid(self, form):
        # Überprüft, ob der Benutzer eingeloggt bleiben möchte
        remember_me = form.cleaned_data.get('remember_me')

        # Wenn der Benutzer nicht eingeloggt bleiben möchte, wird die Sitzung beim Schließen des Browsers beendet
        if not remember_me:
            self.request.session.set_expiry(0)
            self.request.session.modified = True
        
        # Ruft die ursprüngliche form_valid Methode auf
        return super(CustomLoginView, self).form_valid(form)


# Diese Funktion erfordert, dass der Benutzer eingeloggt ist
@login_required
def aktuelles(request):
    # Überprüft, ob der Benutzer eingeloggt ist und speichert die Benutzer-ID
    if request.user.is_authenticated:
        user_id = request.user.id
    else:
        user_id = None
    
    # Fügt die Benutzer-ID zum Kontext hinzu
    context = {
        'user_id': user_id,
    }
    
    # Gibt den Kontext an die Webseite zurück
    return render(request, 'webseite/aktuelles.html', context)
