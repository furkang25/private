from django.contrib import admin
from django.urls import path

from .views import (DocumentsListView,
                    ProjectsAutocomplete,
                    TagsAutocompleteView,
                    DocumentsCreateJsonView,
                    TagsListView,
                    UserListView,
                    DocumentsListJsonView,
                    DocumentsUpdateView,
                    DocumentsDeleteJsonView,
                    DocumentsListToggleView,
                    TagsCreateView,
                    TagsUpdateView,
                    TagsDeleteView,
                    CheckWatchlistStatusDocumentsView
                    )

app_name = 'documents'

urlpatterns = [
    path('check-watchlist-status/<int:user_id>/<int:project_id>/', CheckWatchlistStatusDocumentsView.as_view(), name='watchlist_documents'),
    path('autocomplete/projets/', ProjectsAutocomplete.as_view(), name='autocomplete_project'),
    path('autocomplete/tags/', TagsAutocompleteView.as_view(), name='autocomplete_tags'),
    path('update/tags/<pk>/', TagsUpdateView.as_view(), name='update_tags'),
    path('delete/tags/<pk>/', TagsDeleteView.as_view(), name='delete_tags'),
    path('update/<pk>/', DocumentsUpdateView.as_view(), name='update_documents'),
    path('delete/<pk>/', DocumentsDeleteJsonView.as_view(), name='delete_documents'),
    path('toggle-watchlist/', DocumentsListToggleView.as_view(), name='toggle-watchlist'),
    path('create-tags/', TagsCreateView.as_view(), name='tags_create'),
    path('tags/select/', TagsListView.as_view(), name='tags_select'),
    path('user/select/', UserListView.as_view(), name='teams_select'),
    path('create/', DocumentsCreateJsonView.as_view(), name='create_documents'),
    path('list/', DocumentsListJsonView.as_view(), name='documents_view_list'),
    path('', DocumentsListView.as_view(), name='documents_view_list'),
]