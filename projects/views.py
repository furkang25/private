from django.http import JsonResponse
from django.shortcuts import render
from django.utils import timezone
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.views import View
from .models import Project, ProjektWatch, Comment
from django.db.models import F, Value, DateTimeField
from documents.models import Documents
from django.db.models import Q
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from webseite.models import UserProfile


# Projekt erstellen
class ProjectCreateView(View):
    def post(self, request):
        user_id = request.POST.get("user_id")
        projektname = request.POST.get("projektname")
        description = request.POST.get("description")
        selected_users = request.POST.getlist("selected_users[]")
        print(selected_users)
        user = UserProfile.objects.get(id=user_id)

        project = Project(
            name=projektname,
            user_id=user_id,
            description=description,
            create=timezone.now(),
            update=timezone.now(),
        )
        project.save()

        for username in selected_users:
            user = UserProfile.objects.get(user__username=username)
            user.projects.add(project)

        return JsonResponse(
            {
                "message": "Projekt wurde erfolgreich gespeichert.",
                "project_id": project.id,
            }
        )


# Projekt aktualisieren
class ProjectUpdateView(View):
    def post(self, request, pk):
        try:
            project = get_object_or_404(Project, pk=pk)

            name = request.POST.get("name")
            description = request.POST.get("description")
            selected_users = request.POST.getlist("selected_users[]")

            project.name = name
            project.description = description

            project.users.clear()

            for username in selected_users:
                user = UserProfile.objects.get(user__username=username)
                user.projects.add(project)

            project.save()

            return JsonResponse({"message": "Projekt erfolgreich aktualisiert."})
        except Project.DoesNotExist:
            return JsonResponse({"error": "Projekt nicht gefunden."}, status=404)


# Projekt löschen
class ProjectDeleteView(View):
    def get(self, request, pk):
        project = get_object_or_404(Project, pk=pk)

        project_name = project.name
        project_id = project.id
        return JsonResponse({"project_name": project_name, "project_id": project_id})

    def post(self, request, pk):
        project = get_object_or_404(Project, pk=pk)
        project.delete()

        return JsonResponse({"message": "Projekt erfolgreich gelöscht."})


# Dokument im Projekt hochladen
class UploadFilesView(View):
    def post(self, request):
        try:
            print("UploadFilesView wurde aufgerufen.")

            uploaded_files = request.FILES.getlist("file")
            new_project_id = request.POST.get("project_id")

            project = Project.objects.get(id=new_project_id)

            for file in uploaded_files:
                document = Documents(
                    name=file.name,
                    document=file,
                    user=request.user,
                    project=project,
                )
                document.save()

            return JsonResponse({"message": "Dateien erfolgreich hochgeladen."})
        except Exception as e:
            return JsonResponse(
                {"error": "Fehler beim Hochladen der Dateien: " + str(e)}, status=500
            )


# Projekte anzeigen lassen
class ProjectListView(View):
    def get(self, request):
        projects = Project.objects.annotate(
            sorting_create=F("create"),
            current_time=Value(timezone.now(), output_field=DateTimeField()),
        ).order_by("-sorting_create")

        project_days = request.GET.get("project_days", "")

        assigned_projects = request.GET.get("assigned_projects", "")

        if assigned_projects == "true" and request.user.is_authenticated:
            projects = projects.filter(Q(users=request.user.userprofile))

        if project_days:
            seven_days_ago = timezone.now() - timezone.timedelta(days=7)
            projects = projects.filter(create__gte=seven_days_ago)

        user_related_projects = request.GET.get("user_projects", "")

        if user_related_projects == "true" and request.user.is_authenticated:
            projects = projects.filter(Q(user=request.user))

        search_query = request.GET.get("search", "")
        if search_query:
            projects = projects.filter(
                Q(name__icontains=search_query) | Q(description__icontains=search_query)
            )

        watchlist_projects = []
        show_watchlist = request.GET.get("show_watchlist", False)
        if request.user and show_watchlist:
            try:
                watchlist = ProjektWatch.objects.get(user=request.user)
                watchlist_projects = watchlist.watch_list_projects.all()
            except ProjektWatch.DoesNotExist:
                watchlist_projects = []

        project_data = [
            {
                "create": project.create.strftime("%d.%m.%Y %H:%M"),
                "user": project.user.username,
                "name": project.name,
                "id": project.pk,
                "is_on_watchlist": project in watchlist_projects,
            }
            for project in projects
        ]

        return JsonResponse({"projects": project_data})


# Projektdaten
class ProjectDetailView(View):
    def get(self, request, project_id):
        try:
            project = Project.objects.get(id=project_id)

            all_users = User.objects.all()

            all_user_profiles = UserProfile.objects.all()
            all_users = [user_profile.user for user_profile in all_user_profiles]

            assigned_users = project.users.all()
            assigned_usernames = set(user.user.username for user in assigned_users)

            users_with_assignment = {}

            for user in all_users:
                username = user.username
                assigned = username in assigned_usernames
                users_with_assignment[username] = assigned

            username = project.user.username if project.user else ""
            user_id = project.user.id if project.user else ""

            documents = Documents.objects.filter(project=project)
            documents_data = [
                {"name": doc.name, "create": doc.create.strftime("%Y-%m-%d %H:%M:%S")}
                for doc in documents
            ]

            comments = Comment.objects.filter(project=project)
            comments_data = [
                {
                    "text": comment.text,
                    "id": comment.id,
                    "user": comment.user.username,
                    "date": comment.date.strftime("%d.%m.%Y %H:%M"),
                    "can_edit": comment.user == request.user,
                }
                for comment in comments
            ]

            assigned_usernames = set(user.user.username for user in assigned_users)
            cleaned_user = str(request.user).strip()
            can_edit_project = cleaned_user in assigned_usernames

            can_delete_project = (
                request.user.is_superuser or project.user == request.user
            )

            project_data = {
                "name": project.name,
                "description": project.description,
                "username": username,
                "user_id": user_id,
                "create": project.create.strftime("%Y-%m-%d %H:%M:%S"),
                "update": project.update.strftime("%Y-%m-%d %H:%M:%S"),
                "documents": documents_data,
                "comments": comments_data,
                "can_delete": can_delete_project,
                "can_edit": can_edit_project,
                "project_users": users_with_assignment,
            }

            return JsonResponse(project_data)
        except Project.DoesNotExist:
            return JsonResponse({"error": "Projekt nicht gefunden."}, status=404)


# Angemeldeter Benutzer kann nur die Projektliste sehen
@method_decorator(login_required, name="dispatch")
class ProjectListUserView(View):
    def get(self, request, *args, **kwargs):
        template_name = "projekt.html"

        context = {
            "user_id": request.user.id,
        }

        return render(request, template_name, context)


# Zugewiesenem Benutzer Autocomplete
class UserAutocompleteView(View):
    def get(self, request):
        users = User.objects.all()

        results = [{"id": user.id, "username": user.username} for user in users]

        return JsonResponse({"results": results})


# Kommentar erstellen
class CommentCreateView(View):
    def post(self, request, project_id):
        try:
            project = get_object_or_404(Project, id=project_id)
            text = request.POST.get("text")

            comment = Comment(user=request.user, text=text, project=project)
            comment.save()

            return JsonResponse({"message": "Kommentar erfolgreich erstellt."})
        except Exception as e:
            return JsonResponse({"message": "Fehler beim Erstellen des Kommentars."})


# Kommentar aktualisieren
class CommentUpdateView(View):
    def post(self, request, pk):
        try:
            comment = get_object_or_404(Comment, pk=pk)

            if comment.user == request.user:
                text = request.POST.get("text")
                comment.text = text
                comment.save()

                return JsonResponse({"message": "Kommentar erfolgreich aktualisiert."})
            else:
                return JsonResponse(
                    {
                        "message": "Sie sind nicht berechtigt, diesen Kommentar zu aktualisieren."
                    }
                )
        except Exception as e:
            # Gibt eine Fehler-JSON-Antwort zurück
            return JsonResponse(
                {"message": "Fehler beim Aktualisieren des Kommentars."}
            )


# Kommentar löschen
class CommentDeleteView(View):
    def post(self, request, pk):
        try:
            comment = get_object_or_404(Comment, pk=pk)

            if comment.user == request.user:
                comment.delete()

                return JsonResponse({"message": "Kommentar erfolgreich gelöscht."})
            else:
                return JsonResponse(
                    {
                        "message": "Sie sind nicht berechtigt, diesen Kommentar zu löschen."
                    }
                )
        except Exception as e:
            return JsonResponse({"message": "Fehler beim Löschen des Kommentars."})


# Projekte markieren und in Markier-Liste hinzufügen
class ProjectWatchlistView(View):
    def post(self, request):
        try:
            user_id = request.POST.get("user_id")
            project_id = request.POST.get("project_id")
            user = None

            try:
                user = ProjektWatch.objects.get(user_id=user_id)
            except ProjektWatch.DoesNotExist:
                user = ProjektWatch.objects.create(user_id=user_id)

            project = Project.objects.get(id=project_id)

            if project in user.watch_list_projects.all():
                user.watch_list_projects.remove(project)
                action = "remove"
            else:
                user.watch_list_projects.add(project)
                action = "add"

            return JsonResponse({"action": action})

        except User.DoesNotExist:
            return JsonResponse({"error": "Benutzer nicht gefunden."}, status=404)
        except Project.DoesNotExist as e:
            return JsonResponse({"error": "Projekt nicht gefunden."}, status=404)


# Überprüft, ob Projekt in Markier-Liste ist
class ProjectInWatchlistView(View):
    def get(self, request, user_id, project_id):
        try:
            projekt_watch = ProjektWatch.objects.get(user_id=user_id)
            project = Project.objects.get(id=project_id)
            is_on_watchlist = project in projekt_watch.watch_list_projects.all()

            return JsonResponse({"is_on_watchlist": is_on_watchlist})
        except Project.DoesNotExist:
            return JsonResponse(
                {"error": "Benutzer oder Projekt nicht gefunden."}, status=404
            )