from django.urls import path

from django.contrib.auth import views as auth_views
from django.contrib.auth.views import LoginView, LogoutView
from .forms import LoginForm
from .views import CustomLoginView, aktuelles

app_name = 'webseite'

urlpatterns = [
    path('', CustomLoginView.as_view(redirect_authenticated_user=True, template_name='webseite/login.html', authentication_form=LoginForm), name='login'),
    path('logout/', auth_views.LogoutView.as_view(template_name='webseite/logout.html'), name='logout'),
    path('aktuelles/', aktuelles, name ="aktuelles"),
]