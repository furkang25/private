from django.urls import path

from .views import (DocumentCreateView,
                    DocumentUpdateView,
                    DocumentDeleteView,
                    DocumentFilterView,
                    ProjectsAutocomplete,
                    TagCreateView,
                    TagUpdateView,
                    TagDeleteView,
                    TagListView,
                    TagsAutocompleteView,
                    UserListView,
                    DocumentArchiveView,
                    DocumentWatchlistView,
                    DocumentInWatchlistView
                    )

app_name = 'documents'

urlpatterns = [
    path('create/', DocumentCreateView.as_view(), name='create_documents'),
    path('update/<pk>/', DocumentUpdateView.as_view(), name='update_documents'),
    path('delete/<pk>/', DocumentDeleteView.as_view(), name='delete_documents'),
    path('filter/', DocumentFilterView.as_view(), name='documents_view_list'),
    path('autocomplete/project/', ProjectsAutocomplete.as_view(), name='autocomplete_project'),
    path('create-tags/', TagCreateView.as_view(), name='create_tags'),
    path('update/tags/<pk>/', TagUpdateView.as_view(), name='update_tags'),
    path('delete/tags/<pk>/', TagDeleteView.as_view(), name='delete_tags'),
    path('tags/select/', TagListView.as_view(), name='select_tags'),
    path('autocomplete/tags/', TagsAutocompleteView.as_view(), name='autocomplete_tags'),
    path('user/select/', UserListView.as_view(), name='toAssignUser_select'),
    path('', DocumentArchiveView.as_view(), name='documents_view_list'),
    path('document-watchlist/', DocumentWatchlistView.as_view(), name='document_add_watchlist'),
    path('check-watchlist-status/<int:user_id>/<int:project_id>/', DocumentInWatchlistView.as_view(), name='watchlist_documents'),
]