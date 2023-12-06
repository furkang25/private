from django.http import JsonResponse
from django.shortcuts import render
from django.utils import timezone
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.views import View
from .models import Project, ProjektWatch, Comment
from django.db.models import F, Value, DateTimeField
from django.db.models.functions import Now

from documents.models import Documents, Tags
from django.db.models import Q
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from webseite.models import UserProfile
        

# Klasse zum Löschen eines Projekts
class ProjectDeleteJsonView(View):
    def get(self, request, pk):
        # Holt das Projekt anhand der Primärschlüssel-ID
        project = get_object_or_404(Project, pk=pk)
        
        # Gibt Projektname und Projekt-ID für die JSON-Antwort zurück
        project_name = project.name
        project_id = project.id
        return JsonResponse({'project_name': project_name, 'project_id': project_id})
    
    def post(self, request, pk):
        # Holt das Projekt anhand der Primärschlüssel-ID und löscht es
        project = get_object_or_404(Project, pk=pk)
        project.delete()
        
        # Gibt eine erfolgreiche JSON-Antwort zurück
        return JsonResponse({'message': 'Projekt erfolgreich gelöscht.'})


# Diese Klasse überprüft, ob ein spezifisches Projekt sich in der Watchlist eines Benutzers befindet.
class CheckWatchlistStatusView(View):
    # Die 'get'-Methode wird aufgerufen, wenn ein HTTP GET-Anfrage gemacht wird.
    def get(self, request, user_id, project_id):
        try:
            # Holt die Watchlist des Benutzers mit der entsprechenden 'user_id'
            projekt_watch = ProjektWatch.objects.get(user_id=user_id)
                
            # Holt das Projekt mit der entsprechenden 'project_id'
            project = Project.objects.get(id=project_id)

            # Überprüft, ob das gefundene Projekt sich in der Watchlist des Benutzers befindet.
            is_on_watchlist = project in projekt_watch.watch_list_projects.all()

            # Gibt das Ergebnis der Überprüfung als JSON-Antwort zurück.
            return JsonResponse({'is_on_watchlist': is_on_watchlist})
        except (Project.DoesNotExist):
            # Wenn der Benutzer oder das Projekt nicht gefunden werden kann, wird ein Fehler zurückgegeben.
            return JsonResponse({'error': 'Benutzer oder Projekt nicht gefunden.'}, status=404)


# Diese Klasse fügt ein Projekt zur Watchlist eines Benutzers hinzu oder entfernt es.
class WatchListToggleView(View):
    # Die 'post'-Methode wird aufgerufen, wenn ein HTTP POST-Anfrage gemacht wird.
    def post(self, request):
        try:
            # Holt die 'user_id' und 'project_id' aus dem POST-Body der Anfrage.
            user_id = request.POST.get('user_id')
            project_id = request.POST.get('project_id')
            user = None

            # Versucht, die Watchlist des Benutzers zu finden oder erstellt eine neue, wenn sie nicht existiert.
            try:
                user = ProjektWatch.objects.get(user_id=user_id)
            except ProjektWatch.DoesNotExist:
                user = ProjektWatch.objects.create(user_id=user_id)

            # Holt das Projekt mit der entsprechenden 'project_id'
            project = Project.objects.get(id=project_id)
            
            # Überprüft, ob das Projekt bereits in der Watchlist ist und fügt es hinzu oder entfernt es.
            if project in user.watch_list_projects.all():
                user.watch_list_projects.remove(project)
                action = 'remove'
            else:
                user.watch_list_projects.add(project)
                action = 'add'

            # Gibt die durchgeführte Aktion ('add' oder 'remove') als JSON-Antwort zurück.
            return JsonResponse({'action': action})
        except (Project.DoesNotExist) as e:
            # Wenn der Benutzer oder das Projekt nicht gefunden werden kann, wird ein Fehler zurückgegeben.
            return JsonResponse({'error': 'Benutzer oder Projekt nicht gefunden.'}, status=404)


# Diese Klasse ermöglicht das Aktualisieren eines Projekts über eine POST-Anfrage.
class ProjectUpdateJsonView(View): #UpdateProject
    def post(self, request, pk):
        try:
            # Versucht das Projekt mit der angegebenen 'pk' (primary key) zu finden.
            project = get_object_or_404(Project, pk=pk)
            
            # Aktualisiert den Namen und die Beschreibung des Projekts aus den POST-Daten.
            name = request.POST.get('name')
            description = request.POST.get('description')
            selected_users = request.POST.getlist('selected_users[]')
            
            # Aktualisieren Sie den Projektnamen und die Beschreibung
            project.name = name
            project.description = description            
            
            project.users.clear()
            
            
            # Iterieren Sie durch ausgewählte Benutzer und fügen Sie sie zum Projekt hinzu
            for username in selected_users:
                user = UserProfile.objects.get(user__username=username)
                user.projects.add(project)
                
            project.save()
            
            # Speichern Sie das aktualisierte Projekt in der Datenbank.
            

            # Gibt eine Erfolgsmeldung als JSON zurück.
            return JsonResponse({'message': 'Projekt erfolgreich aktualisiert.'})
        except Project.DoesNotExist:
            # Gibt einen Fehler zurück, wenn das Projekt nicht gefunden wird.
            return JsonResponse({'error': 'Projekt nicht gefunden.'}, status=404)


# Diese Klasse gibt detaillierte Informationen zu einem Projekt als JSON zurück.
class ProjectDetailView(View):
    def get(self, request, project_id):
        try:
            # Holt das Projekt aus der Datenbank.
            project = Project.objects.get(id=project_id)
            
            #Alle User
            all_users = User.objects.all()
            
            # Extrahiere die Benutzerliste aus dem UserProfile-Modell
            all_user_profiles = UserProfile.objects.all()
            all_users = [user_profile.user for user_profile in all_user_profiles]
            
            # Holen Sie sich alle Benutzer, die dem Projekt zugewiesen sind
            assigned_users = project.users.all()
            assigned_usernames = set(user.user.username for user in assigned_users)

                        
            # Erstelle ein Dictionary, um Benutzer und deren Zuweisungsstatus zu speichern
            users_with_assignment = {}

            # Iteriere durch alle Benutzer und überprüfe, ob sie zugewiesen sind
            for user in all_users:
                username = user.username
                assigned = username in assigned_usernames
                users_with_assignment[username] = assigned
            
            # Extrahiert relevante Informationen von dem Projekt und den zugehörigen Entitäten.
            username = project.user.username if project.user else ""
            user_id = project.user.id if project.user else ""
            
            # Holt alle Dokumente, die zu diesem Projekt gehören.
            documents = Documents.objects.filter(project=project)
            documents_data = [{'name': doc.name, 'create': doc.create.strftime('%Y-%m-%d %H:%M:%S')} for doc in documents]

            # Holt alle Kommentare, die zu diesem Projekt gehören.
            comments = Comment.objects.filter(project=project)
            comments_data = [{'text': comment.text, 'id': comment.id, 'user': comment.user.username, 'date': comment.date.strftime('%d.%m.%Y %H:%M'), 'can_edit': comment.user == request.user} for comment in comments]
            
            # Überprüfen, ob der Benutzer das Projekt bearbeiten darf, aber nicht löschen darf.
            assigned_usernames = set(user.user.username for user in assigned_users)
            cleaned_user = str(request.user).strip()
            can_edit_project = (cleaned_user in assigned_usernames)
            
            # Der Super user darf löschen
            can_delete_project = request.user.is_superuser or project.user == request.user
            
            # Erstellt ein Dictionary mit allen relevanten Daten.
            project_data = {
                'name': project.name,
                'description': project.description,
                'username': username,
                'user_id': user_id,
                'create': project.create.strftime('%Y-%m-%d %H:%M:%S'),
                'update': project.update.strftime('%Y-%m-%d %H:%M:%S'),
                'documents': documents_data,
                'comments': comments_data,
                'can_delete': can_delete_project,
                'can_edit': can_edit_project,
                'project_users': users_with_assignment,
            }

            # Gibt die gesammelten Daten als JSON zurück.
            return JsonResponse(project_data)
        except Project.DoesNotExist:
            # Wenn das Projekt nicht gefunden wird, gibt es eine Fehlermeldung zurück.
            return JsonResponse({'error': 'Projekt nicht gefunden.'}, status=404)


class ProjectListJsonView(View):
    def get(self, request):
        # Holt alle Projekte aus der Datenbank und sortiert sie nach 'create' absteigend
        projects = Project.objects.annotate(
            sorting_create=F('create'),
            current_time=Value(timezone.now(), output_field=DateTimeField())
        ).order_by('-sorting_create')
        
        # Prüft, ob ein Zeitfilter angewendet werden soll
        project_days = request.GET.get('project_days', '')
        
        # User zugewiesen Projekte
        assigned_projects = request.GET.get('assigned_projects', '')
        
        if assigned_projects == 'true' and request.user.is_authenticated:
            projects = projects.filter(Q(users=request.user.userprofile))
        
        # Filtert Projekte, die in den letzten 7 Tagen erstellt wurden, falls erforderlich
        if project_days:
            seven_days_ago = timezone.now() - timezone.timedelta(days=7)
            projects = projects.filter(create__gte=seven_days_ago)
        
        # Filtert Projekte, die zum angemeldeten Benutzer gehören, falls erforderlich
        user_related_projects = request.GET.get('user_projects', '')
        
        # Hier wird der Benutzer gefiltert, der mit dem Projekt verbunden ist.
        if user_related_projects == 'true' and request.user.is_authenticated:
            projects = projects.filter(Q(user=request.user))
        
        # Führt eine Textsuche in den Projektnamen und -beschreibungen durch, falls erforderlich
        search_query = request.GET.get('search', '')
        if search_query:
            projects = projects.filter(Q(name__icontains=search_query) | Q(description__icontains=search_query))
        
        # Prüft, ob Projekte aus der Watchlist des Benutzers markiert werden sollen
        watchlist_projects = []
        show_watchlist = request.GET.get('show_watchlist', False)
        if request.user and show_watchlist:
            try:
                watchlist = ProjektWatch.objects.get(user=request.user)
                watchlist_projects = watchlist.watch_list_projects.all()
            except ProjektWatch.DoesNotExist:
                watchlist_projects = []
        
        # Erstellt eine Liste von Projektdaten für die JSON-Antwort
        project_data = [{'create': project.create.strftime('%d.%m.%Y %H:%M'), 'user': project.user.username, 'name': project.name, 'id': project.pk, 'is_on_watchlist': project in watchlist_projects} for project in projects]
        
        # Gibt die Liste der Projekte als JSON zurück
        return JsonResponse({'projects': project_data})



# Create Project
class ProjectCreateView(View):
    def post(self, request):
        # Holt die Parameter aus der POST-Anfrage
        user_id = request.POST.get('user_id')
        projektname = request.POST.get('projektname')
        description = request.POST.get('description')
        selected_users = request.POST.getlist('selected_users[]')
        print(selected_users)
        # Versuchen Sie, den Benutzer anhand der ID zu finden
        user = UserProfile.objects.get(id=user_id)
        

        
        # Erstellt ein neues Projektobjekt und speichert es in der Datenbank
        project = Project(
            name=projektname,
            user_id=user_id,
            description=description,
            create=timezone.now(),
            update=timezone.now()
        )
        project.save()
        
        # Weisen Sie das Projekt auch dem Benutzer im User-Modell zu
        # user.projects.add(project)
        for username in selected_users:
            user = UserProfile.objects.get(user__username=username)
            user.projects.add(project)
        
        # Gibt eine Erfolgsmeldung und die Projekt-ID als JSON zurück
        return JsonResponse({'message': 'Projekt wurde erfolgreich gespeichert.',  'project_id': project.id})


# Image Upload Project
class UploadFilesView(View):
    def post(self, request):
        try:
            # Log-Ausgabe, um anzuzeigen, dass dieser Endpunkt aufgerufen wurde
            print("UploadFilesView wurde aufgerufen.")
            
            # Holt die hochgeladenen Dateien und die Projekt-ID aus der Anfrage
            uploaded_files = request.FILES.getlist("file")
            new_project_id = request.POST.get('project_id')
            
            # Findet das zugehörige Projekt in der Datenbank
            project = Project.objects.get(id=new_project_id)

            # Iteriert durch alle hochgeladenen Dateien
            for file in uploaded_files:
                # Erstellt ein neues Dokument und speichert es in der Datenbank
                document = Documents(
                    name=file.name,
                    document=file,
                    user=request.user,
                    project=project,
                )
                document.save()
            
            # Sendet eine Erfolgsmeldung als JSON zurück
            return JsonResponse({'message': 'Dateien erfolgreich hochgeladen.'})
        except Exception as e:
            # Sendet eine Fehlermeldung als JSON zurück, wenn etwas schiefgelaufen ist
            return JsonResponse({'error': 'Fehler beim Hochladen der Dateien: ' + str(e)}, status=500)


@method_decorator(login_required, name='dispatch')
class ProjectListView(View):
    def get(self, request, *args, **kwargs):
        # Setzt den Namen des HTML-Templates
        template_name = 'projekt.html'
        
        # Erstellt den Kontext für das Rendering des Templates
        context = {
            'user_id': request.user.id,
        }  
        
        # Rendert das Template und gibt es zurück
        return render(request, template_name, context)



# Klasse UserAutocompleteView(View):
class UserAutocompleteView(View):
    def get(self, request):
        # Holt alle Benutzer aus der Datenbank
        users = User.objects.all()
        
        # Erstellt eine Liste der gefundenen Benutzer als Dictionary
        results = [{'id': user.id, 'username': user.username} for user in users]
        
        # Gibt die Liste als JSON zurück
        return JsonResponse({'results': results})
    

# Klasse zum Erstellen von Kommentaren
class CommentCreateJsonView(View):
    def post(self, request, project_id):
        try:
            # Holt das Projekt anhand der Projekt-ID
            project = get_object_or_404(Project, id=project_id)
            
            # Liest den Text des Kommentars aus dem POST-Request
            text = request.POST.get('text')
            
            # Erstellt und speichert den neuen Kommentar
            comment = Comment(user=request.user, text=text, project=project)
            comment.save()
            
            # Gibt eine erfolgreiche JSON-Antwort zurück
            return JsonResponse({'message': 'Kommentar erfolgreich erstellt.'})
        except Exception as e:
            # Gibt eine Fehler-JSON-Antwort zurück
            return JsonResponse({'message': 'Fehler beim Erstellen des Kommentars.'})


# Klasse zum Aktualisieren von Kommentaren
class CommentUpdateJsonView(View):
    def post(self, request, pk):
        try:
            # Holt den Kommentar anhand der Primärschlüssel-ID
            comment = get_object_or_404(Comment, pk=pk)
            
            # Prüft, ob der Benutzer der Ersteller des Kommentars ist
            if comment.user == request.user:
                # Aktualisiert den Text des Kommentars
                text = request.POST.get('text')
                comment.text = text
                comment.save()
                
                # Gibt eine erfolgreiche JSON-Antwort zurück
                return JsonResponse({'message': 'Kommentar erfolgreich aktualisiert.'})
            else:
                # Wenn der Benutzer nicht der Ersteller ist, gibt eine Fehlermeldung zurück
                return JsonResponse({'message': 'Sie sind nicht berechtigt, diesen Kommentar zu aktualisieren.'})
        except Exception as e:
            # Gibt eine Fehler-JSON-Antwort zurück
            return JsonResponse({'message': 'Fehler beim Aktualisieren des Kommentars.'})


# Klasse zum Löschen von Kommentaren
class CommentDeleteJsonView(View):
    def post(self, request, pk):
        try:
            # Holt den Kommentar anhand der Primärschlüssel-ID
            comment = get_object_or_404(Comment, pk=pk)
            
            # Prüft, ob der Benutzer der Ersteller des Kommentars ist
            if comment.user == request.user:
                # Löscht den Kommentar
                comment.delete()
                
                # Gibt eine erfolgreiche JSON-Antwort zurück
                return JsonResponse({'message': 'Kommentar erfolgreich gelöscht.'})
            else:
                # Wenn der Benutzer nicht der Ersteller ist, gibt eine Fehlermeldung zurück
                return JsonResponse({'message': 'Sie sind nicht berechtigt, diesen Kommentar zu löschen.'})
        except Exception as e:
            # Gibt eine Fehler-JSON-Antwort zurück
            return JsonResponse({'message': 'Fehler beim Löschen des Kommentars.'})