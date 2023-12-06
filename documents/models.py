from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User
from projects.models import Project


class Tags(models.Model):
    name = models.CharField(max_length=200)
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    
    def __str__(self):
        return self.name
    

class Documents(models.Model):
    name        = models.CharField(max_length=200)
    create      = models.DateTimeField(default=timezone.now, editable=True)
    document    = models.ImageField(upload_to='document/', null=True, blank=True)
    user        = models.ForeignKey(User, on_delete=models.CASCADE)
    tags = models.ForeignKey(Tags, on_delete=models.SET_NULL, null=True, blank=True)
    project     = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True)    
    
    def __str__(self):
        return self.name


class DocumentWatch(models.Model):
    user                = models.ForeignKey(User, on_delete=models.CASCADE)
    watch_list_documents = models.ManyToManyField(Documents, related_name='watch_list_documents', blank=True)