from django.contrib import admin
from .models import *

admin.site.register(PoseType)
admin.site.register(Pose)
admin.site.register(UserSavedPose)
admin.site.register(UserSequence)
admin.site.register(SequencePose)