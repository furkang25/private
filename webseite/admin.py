from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import UserProfile

class ProjectInline(admin.TabularInline):
    model = UserProfile
    extra = 1
    filter_horizontal = ('projects',) 

class CustomUserAdmin(UserAdmin):
    inlines = [ProjectInline]

admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)