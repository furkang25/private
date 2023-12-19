from django.urls import path
from .views import (ProjectCreateView,
                    ProjectUpdateView,
                    ProjectDeleteView,
                    UploadFilesView,
                    ProjectListView, 
                    ProjectDetailView, 
                    ProjectListUserView, 
                    UserAutocompleteView, 
                    CommentCreateView,
                    CommentUpdateView,
                    CommentDeleteView,
                    ProjectWatchlistView,
                    ProjectInWatchlistView,  
                    )

app_name = 'projects'

urlpatterns = [
    path('create-project/', ProjectCreateView.as_view(), name='create-project'),
    path('update/<int:pk>/', ProjectUpdateView.as_view(), name='project_update_json'),
    path('delete/<int:pk>/', ProjectDeleteView.as_view(), name='project_delete_json'),
    path('upload-files/', UploadFilesView.as_view(), name='upload-files'),
    path('project-list/', ProjectListView.as_view(), name='project-list'),
    path('project-detail/<int:project_id>/', ProjectDetailView.as_view(), name='project-detail'),
    path('', ProjectListUserView.as_view(), name='project_view_list'),
    path('autocomplete/user/', UserAutocompleteView.as_view(), name='toAssign-autocomplete'),
    path('comment/create/<int:project_id>/', CommentCreateView.as_view(), name='comment_create'),
    path('comment/update/<int:pk>/', CommentUpdateView.as_view(), name='comment_update'),
    path('comment/<int:pk>/', CommentDeleteView.as_view(), name='comment_delete'),
    path('toggle-watchlist/', ProjectWatchlistView.as_view(), name='toggle-watchlist'),
    path('check-watchlist-status/<int:user_id>/<int:project_id>/', ProjectInWatchlistView.as_view(), name='check_watchlist_status'),   
]