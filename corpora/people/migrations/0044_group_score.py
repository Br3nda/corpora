# -*- coding: utf-8 -*-
# Generated by Django 1.11.8 on 2018-03-09 10:55
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('people', '0043_auto_20180309_0332'),
    ]

    operations = [
        migrations.AddField(
            model_name='group',
            name='score',
            field=models.PositiveIntegerField(default=0, editable=False),
        ),
    ]
