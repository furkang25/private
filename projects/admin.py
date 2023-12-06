from django.contrib import admin

from .models import Project, Comment, ProjektWatch


admin.site.register(Comment)
admin.site.register(ProjektWatch)


class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'create') 
    
admin.site.register(Project, ProjectAdmin)