# -*- coding: utf-8 -*-
# Generated by Django 1.11.7 on 2017-12-06 03:05
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('corpus', '0019_auto_20171004_2300'),
    ]

    operations = [
        migrations.AddField(
            model_name='recording',
            name='user_agent',
            field=models.CharField(blank=True, max_length=512, null=True),
        ),
    ]
