# Generated by Django 3.2 on 2023-10-06 14:36

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('documents', '0002_documents_user'),
    ]

    operations = [
        migrations.AlterField(
            model_name='documents',
            name='tags',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='documents.tags'),
        ),
    ]