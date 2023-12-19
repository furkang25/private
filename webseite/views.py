from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .forms import LoginForm
from django.contrib.auth.views import LoginView

class CustomLoginView(LoginView):
    form_class = LoginForm 
    def form_valid(self, form):
        remember_me = form.cleaned_data.get('remember_me')

        if not remember_me:
            self.request.session.set_expiry(0)
            self.request.session.modified = True
        
        return super(CustomLoginView, self).form_valid(form)


@login_required
def aktuelles(request):
    if request.user.is_authenticated:
        user_id = request.user.id
    else:
        user_id = None
    context = {
        'user_id': user_id,
    }
    return render(request, 'webseite/aktuelles.html', context)
