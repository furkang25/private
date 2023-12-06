from django import template
from django.contrib.auth.models import User

register = template.Library()

@register.simple_tag
def get_username(user_id):
    try:
        if user_id:
            user = User.objects.get(id=user_id)
            return user.username
        else:
            return ""
    except User.DoesNotExist:
        return ""