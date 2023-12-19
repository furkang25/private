from django.shortcuts import render
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.views import View
from projects.models import Project
from .models import Documents, Tags, DocumentWatch
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.core.paginator import Paginator, EmptyPage


# Dokument hochladen
class DocumentCreateView(View):
    def post(self, request):
        try:
            name_new = request.POST.get("name")
            project_new = request.POST.get("project")
            tags_new = request.POST.get("tags")
            document_upload = request.FILES.getlist("file")

            if project_new:
                project = Project.objects.get(id=project_new)

            if tags_new:
                tags = Tags.objects.get(id=tags_new)

            for file in document_upload:
                document = Documents(
                    name=name_new,
                    user=request.user,
                    document=file,
                    project=project if project_new else None,
                    tags=tags if tags_new else None,
                )
                document.save()

            return JsonResponse({"message": "Dokument erfolgreich hochgeladen."}, status=201)
        except:
            return JsonResponse({"error": "Fehler beim Hochladen des Dokumentes."}, status=400)


# Dokument aktualisieren
class DocumentUpdateView(View):
    def get(self, request, pk):
        document = get_object_or_404(Documents, pk=pk)

        tags_name = document.tags.name if document.tags else ""
        tags_id = document.tags.id if document.tags else ""

        context = {
            "id": document.id,
            "name": document.name,
            "tags_name": tags_name,
            "tags_id": tags_id,
            "create": document.create.strftime("%Y-%m-%d %H:%M:%S"),
            "document": document.document.url if document.document else None,
            "user": document.user.username if document.user else None,
            "project": document.project.name if document.project else None,
            "project_id": document.project.id if document.project else None,
        }
        return JsonResponse({"documents": context})

    def post(self, request, pk):
        try:
            document = get_object_or_404(Documents, pk=pk)

            document.name = request.POST.get("name")

            project_id = request.POST.get("project")
            if project_id:
                project_exsit = Project.objects.get(id=project_id)
                document.project = project_exsit
            else:
                document.project = None

            tags_id = request.POST.get("tags")
            if tags_id:
                tags_exsit = Tags.objects.get(id=tags_id)
                document.tags = tags_exsit
            else:
                document.tags = None

            document.save()

            return JsonResponse({"message": "Dokument erfolgreich aktualisiert."}, status=200)
        except:
            return JsonResponse({"error": "Fehler bei der Aktualisierung des Dokumentes."}, status=400)


# Dokument löschen
class DocumentDeleteView(View):
    def post(self, request, pk):
        try:
            document = get_object_or_404(Documents, pk=pk)
            document.delete()

            return JsonResponse({"message": "Dokument erfolgreich gelöscht."}, status=204)
        except:
            return JsonResponse({"error": "Fehler beim Löschen des Dokumentes."}, status=400)


# Dokumente filtern
class DocumentFilterView(View):
    def get(self, request):
        selected_tags = request.GET.get("selected_tags")
        date_from = request.GET.get("date_from", "")
        date_to = request.GET.get("date_to", "")
        search_query = request.GET.get("search_query", "")
        is_user = request.GET.get("is_user", "")
        show_watchlist = request.GET.get("show_watchlist", False)
        project_id = request.GET.get("project_id")
        selecte_user = request.GET.get("selecte_user")

        user_list = request.user if request.user.is_authenticated else None

        documents = Documents.objects.all()

        watchlist_documents = []
        filtered_documents = documents

        if user_list and show_watchlist:
            try:
                watchlist = DocumentWatch.objects.get(user=user_list)
                watchlist_documents = watchlist.watch_list_documents.all()

            except DocumentWatch.DoesNotExist:
                watchlist_documents = []
        else:
            watchlist_documents = []

        if project_id:
            documents = documents.filter(project__id=project_id)

        if selecte_user:
            filtered_documents = documents.filter(user=selecte_user)

        if is_user == "true" and request.user.is_authenticated:
            filtered_documents = filtered_documents.filter(Q(user=request.user))

        if date_from and date_to:
            filtered_documents = filtered_documents.filter(
                create__date__range=(date_from, date_to)
            )

        if selected_tags:
            filtered_documents = filtered_documents.filter(
                tags__in=selected_tags.split(",")
            )

        if search_query:
            filtered_documents = documents.filter(Q(name__icontains=search_query))

        documents_data = [
            {
                "id": doc.id,
                "name": doc.name,
                "create": doc.create.strftime("%d.%m.%Y"),
                "document": doc.document.url if doc.document else None,
                "project": doc.project.name if doc.project else None,
                "user": doc.user.username if doc.user else None,
                "is_on_watchlist": doc in watchlist_documents
                if doc in filtered_documents
                else False,
            }
            for doc in filtered_documents
            if not project_id or (doc.project and doc.project.id == int(project_id))
        ]

        page = request.GET.get("page", 1)
        per_page = 12

        try:
            page = int(page)
        except ValueError:
            page = 1

        paginator = Paginator(documents_data, per_page)

        try:
            page_data = paginator.page(page)
        except EmptyPage:
            page_data = paginator.page(paginator.num_pages)

        response_data = {
            "documents": page_data.object_list,
            "has_next": page_data.has_next(),
            "page_number": page_data.number,
            "page_count": paginator.num_pages,
        }
        return JsonResponse(response_data)


# Projekte Autocomplete
class ProjectsAutocomplete(View):
    def get(self, request):
        query = request.GET.get("q", "")

        projects = Project.objects.filter(name__icontains=query)

        results = [{"id": project.id, "name": project.name} for project in projects]

        return JsonResponse({"results": results})


# Tag erstellen
class TagCreateView(View):
    def post(self, request):
        try:
            tagFormTag = request.POST.get("tagFormTag")

            tag = Tags(name=tagFormTag, user=request.user)
            tag.save()

            return JsonResponse({"message": "Tag erfolgreich erstellt."}, status=201)
        except:
            return JsonResponse({"error": "Fehler beim Erstellen des Tags."}, status=400)


# Tag aktualisieren
class TagUpdateView(View):
    def post(self, request, pk):
        try:
            tag = get_object_or_404(Tags, pk=pk)
            name = request.POST.get("name")
            tag.name = name
            tag.save()

            return JsonResponse({"message": "Tag wurde erfolgreich aktualisiert."}, status=200)
        except Exception:
            return JsonResponse({"error": "Fehler beim Aktualisieren des Tags."}, status=400)


# Tag löschen
class TagDeleteView(View):
    def post(self, request, pk):
        try:
            tag = get_object_or_404(Tags, pk=pk)
            tag.delete()

            return JsonResponse({"message": "Tag erfolgreich gelöscht."}, status=204)
        except Exception:
            return JsonResponse({"error": "Fehler beim Löschen des Tags."}, status=400)


# Ansicht aller Tags
class TagListView(View):
    def get(self, request):
        tags = Tags.objects.all()
        tag_data = []

        for tag in tags:
            tag_info = {
                "id": tag.id,
                "name": tag.name,
            }
            tag_data.append(tag_info)

        data = {"tags": tag_data}

        return JsonResponse(data)


# Tags Autocomplete
class TagsAutocompleteView(View):
    def get(self, request):
        query = request.GET.get("query", "")

        tags = Tags.objects.filter(name__icontains=query)

        results = [{"id": tag.id, "name": tag.name} for tag in tags]

        return JsonResponse({"results": results})


# Liste aller Benutzer aus der Datenbank
class UserListView(View):
    def get(self, request):
        users = User.objects.all()
        user_data = []

        for user in users:
            user_info = {
                "id": user.id,
                "username": user.username,
            }
            user_data.append(user_info)

        data = {"users": user_data}

        return JsonResponse(data)


# Angemeldeter Benutzer kann nur ins Dokumentenarchiv zugreifen
@method_decorator(login_required, name="dispatch")
class DocumentArchiveView(View):
    def get(self, request, *args, **kwargs):
        template_name = "dokumentenarchiv.html"

        tags = Tags.objects.all()

        context = {
            "user_id": request.user.id,
            "tags": tags,
        }
        return render(request, template_name, context)


# Dokumente markieren und in Markier-Liste hinzufügen
class DocumentWatchlistView(View):
    def post(self, request):
        try:
            user_id = request.POST.get("user_id")
            document_id = request.POST.get("document_id")

            user = None

            try:
                user = DocumentWatch.objects.get(user_id=user_id)
            except DocumentWatch.DoesNotExist:
                user = DocumentWatch.objects.create(user_id=user_id)

            document = Documents.objects.get(id=document_id)

            if document in user.watch_list_documents.all():
                user.watch_list_documents.remove(document)
                action = "remove"
            else:
                user.watch_list_documents.add(document)
                action = "add"

            return JsonResponse({"action": action})

        except User.DoesNotExist:
            return JsonResponse({"error": "Benutzer nicht gefunden."}, status=404)
        except DocumentWatch.DoesNotExist:
            return JsonResponse({"error": "Dokument nicht gefunden."}, status=404)


# Überprüft, ob Dokument in Markier-Liste ist
class DocumentInWatchlistView(View):
    def get(self, request, user_id, project_id):
        try:
            document_watch = DocumentWatch.objects.get(user_id=user_id)

            document = Documents.objects.get(id=project_id)

            is_on_watchlist = document in document_watch.watch_list_documents.all()

            return JsonResponse({"is_on_watchlist": is_on_watchlist})

        except (DocumentWatch.DoesNotExist, Project.DoesNotExist):
            return JsonResponse({"error": "Dokument nicht gefunden."}, status=404)
