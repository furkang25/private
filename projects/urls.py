from django.urls import path
from .views import (ProjectListView, 
                    UserAutocompleteView, 
                    ProjectCreateView, 
                    ProjectListJsonView, 
                    ProjectDetailView, 
                    WatchListToggleView,
                    CheckWatchlistStatusView,
                    UploadFilesView,
                    ProjectUpdateJsonView,
                    ProjectDeleteJsonView,
                    CommentCreateJsonView,
                    CommentUpdateJsonView,
                    CommentDeleteJsonView)

#project 
app_name = 'projects'

urlpatterns = [
    path('comment/update/<int:pk>/', CommentUpdateJsonView.as_view(), name='comment_update'),
    path('comment/create/<int:project_id>/', CommentCreateJsonView.as_view(), name='comment_create'),
    path('upload-files/', UploadFilesView.as_view(), name='upload-files'),
    path('check-watchlist-status/<int:user_id>/<int:project_id>/', CheckWatchlistStatusView.as_view(), name='check_watchlist_status'),
    path('toggle-watchlist/', WatchListToggleView.as_view(), name='toggle-watchlist'),
    path('project-list/', ProjectListJsonView.as_view(), name='project-list'),
    path('create-project/', ProjectCreateView.as_view(), name='create-project'),
    path('autocomplete/user/', UserAutocompleteView.as_view(), name='team-autocomplete'),
    path('project-detail/<int:project_id>/', ProjectDetailView.as_view(), name='project-detail'),
    path('comment/<int:pk>/', CommentDeleteJsonView.as_view(), name='comment_delete'),
    path('delete/<int:pk>/', ProjectDeleteJsonView.as_view(), name='project_delete_json'),
    path('update/<int:pk>/', ProjectUpdateJsonView.as_view(), name='project_update_json'),
    path('', ProjectListView.as_view(), name='project_view_list'),
]