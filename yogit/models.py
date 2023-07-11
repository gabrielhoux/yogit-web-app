from django.db import models
from django.contrib.auth.models import User


class PoseType(models.Model):
    '''
    Model for a type of yoga pose
    '''
    id = models.PositiveSmallIntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

    def serialize(self):
        return {
            "name": self.name,
            "description": self.description
        }


class Pose(models.Model):
    '''
    Model for a yoga pose and all available information on it
    '''
    id = models.PositiveSmallIntegerField(primary_key=True)
    DIFFICULTY_CHOICES = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('expert', 'Expert')
    )
    english_name = models.CharField(max_length=100)
    sanskrit_name_adapted = models.CharField(max_length=100, blank=True)
    sanskrit_name = models.CharField(max_length=100, blank=True)
    translation_name = models.CharField(max_length=100, blank=True)
    pose_description = models.TextField(blank=True)
    pose_benefits = models.TextField(blank=True)
    url_svg = models.URLField(max_length=200, blank=True)
    url_png = models.URLField(max_length=200, blank=True)
    url_svg_alt = models.URLField(max_length=200, blank=True)
    difficulty_level = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='beginner')
    type = models.ManyToManyField(PoseType)

    def __str__(self):
        return f"{self.id} - {self.english_name}"

    def serialize(self):
        return {
            "id": self.id,
            "name": self.english_name,
            "sanskrit": self.sanskrit_name_adapted,
            "benefits": self.pose_benefits,
            "description": self.pose_description,
            "svg": self.url_svg,
            "difficulty_level": self.difficulty_level,
            "type": [type.name for type in self.type.all()]
        }


class UserSavedPose(models.Model):
    '''
    Model for a yoga pose saved by a user as one of their favourites
    '''
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    pose = models.ForeignKey(Pose, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.pose.english_name} - {self.user.username}"


class UserSequence(models.Model):
    '''
    Model for a user-created sequence of one or more yoga poses
    '''
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.id} - {self.name} - {self.user.username}"

    def serialize(self):
        poses = self.sequencepose_set.order_by('id').select_related('pose')
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "poses": [pose.pose.serialize() for pose in poses],
            "sequence_pose_ids": [pose.id for pose in poses]
        }


class SequencePose(models.Model):
    '''
    Model for a yoga pose added by a user to one of their created sequences
    '''
    sequence = models.ForeignKey(UserSequence, on_delete=models.CASCADE)
    pose = models.ForeignKey(Pose, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.id} - {self.pose.english_name} - {self.sequence.name} - {self.sequence.user.username}"