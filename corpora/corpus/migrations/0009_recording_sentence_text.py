# -*- coding: utf-8 -*-
# Generated by Django 1.10.8 on 2017-09-22 02:39
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('corpus', '0008_auto_20170920_2333'),
    ]

    operations = [
        migrations.AddField(
            model_name='recording',
            name='sentence_text',
            field=models.CharField(blank=True, max_length=250, null=True),
        ),
    ]
