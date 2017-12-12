# -*- coding: utf-8 -*-
# Generated by Django 1.11.8 on 2017-12-11 23:39
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('corpus', '0022_auto_20171211_0252'),
    ]

    operations = [
        migrations.AddField(
            model_name='sentence',
            name='dialect',
            field=models.CharField(blank=True, choices=[(b'mi', ((b'kaitahu', 'Kaitahu'), (b'muriwhen', 'Muriwhenua'), (b'taranaki', 'Taranaki'), (b'tuhoe', 'Tuhoe')))], max_length=8, null=True),
        ),
        migrations.AddField(
            model_name='text',
            name='dialect',
            field=models.CharField(blank=True, choices=[(b'mi', ((b'kaitahu', 'Kaitahu'), (b'muriwhen', 'Muriwhenua'), (b'taranaki', 'Taranaki'), (b'tuhoe', 'Tuhoe')))], max_length=8, null=True),
        ),
    ]