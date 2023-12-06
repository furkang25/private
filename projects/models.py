from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class Project(models.Model):
    name            = models.CharField(max_length=200)
    description     = models.TextField()
    user            = models.ForeignKey(User, on_delete=models.CASCADE)
    create          = models.DateTimeField(default=timezone.now)
    update          = models.DateTimeField(default=timezone.now, editable=False)
    
    def __str__(self):
        return self.name
    
    def save_update(self, *args, **kwargs):
        self.update = timezone.now()
        super(Project, self).speichern(*args, **kwargs)


class Comment(models.Model):
    text        = models.CharField(max_length=200)
    user        = models.ForeignKey(User, on_delete=models.CASCADE)
    date        = models.DateTimeField(default=timezone.now, editable=False)
    project     = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True)


class ProjektWatch(models.Model):
    user                = models.ForeignKey(User, on_delete=models.CASCADE)
    watch_list_projects = models.ManyToManyField(Project, related_name='watch_list_users', blank=True)
