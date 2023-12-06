from django.db import models
from django.contrib.auth.models import User
from django.contrib.auth.models import AbstractUser
from projects.models import Project  # Ihr Modell für Projekte

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    projects = models.ManyToManyField('projects.Project', related_name='users', blank=True)

    def __str__(self):
        return self.user.username
    
    
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.userprofile.save()
