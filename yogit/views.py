from django.shortcuts import render
from django.http import HttpResponseRedirect, JsonResponse, Http404
from django.views.decorators.http import require_GET, require_POST, require_http_methods
from random import randint
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from django.db import IntegrityError
import json

from random import randint

from .models import *


from django.db.models import Count
import random

@require_GET
def main_view(request):
    # Count the total number of Pose objects
    pose_count = Pose.objects.count()

    # Generate a random index within the range of pose_count
    random_index = randint(0, pose_count - 1)

    # Retrieve a random Pose using the random_index
    random_pose = Pose.objects.all().order_by('id')[random_index]

    # Get the pose_svg of the random_pose
    pose_svg = random_pose.url_svg

    # Render the main view with the random pose in the context to be displayed as the background
    return render(request, "yogit/main.html", {"pose_svg": pose_svg})


@require_POST
def login_api(request):
    # Retrieve username and password from login form data
    username = request.POST["username"]
    password = request.POST["password"]

    # Authenticate user with username and password
    user = authenticate(request, username=username, password=password)

    # Log user in if successfully authenticated, else return an error message
    if user is not None:
        login(request, user)
        return JsonResponse({'success': True})
    else:
        return JsonResponse({'success': False, 'message': 'Invalid username and/or password.'})


def logout_and_redirect(request):
    # Log user out and redirect to main view
    logout(request)
    return HttpResponseRedirect(reverse("main"))


@require_POST
def signup_api(request):
    # Retrieve username, email and password+confirmation from signup form data
    username = request.POST["username"]
    email = request.POST["email"]
    password = request.POST["password"]
    confirmation = request.POST["confirmation"]

    # Return an error message if password and confirmation do not match
    if password != confirmation:
        return JsonResponse({'success': False, 'message': 'Passwords must match.'})

    # Create a new user in database and log them in, return an error message if username already exists
    try:
        user = User.objects.create_user(username, email, password)
        user.save()
        login(request, user)
        return JsonResponse({'success': True})
    except IntegrityError:
        return JsonResponse({'success': False, 'message': 'Username already taken.'})


@require_GET
def get_all_poses(request):
    # Retrieve all yoga poses from database
    poses = Pose.objects.all().order_by("english_name")

    # Retrieve all current pose types
    types = PoseType.objects.all().order_by("name")

    # Return list of serialized poses and list of involved pose types' names as JSON response
    return JsonResponse({
        "poses": [pose.serialize() for pose in poses],
        "types": [type.name for type in types]
    }, safe=False)


@require_GET
def get_pose_details(request, pose_id):
    # Retrieve pose object from ID
    try:
        pose = Pose.objects.get(id=pose_id)
    except Pose.DoesNotExist:
        return Http404("Pose not found, please reload the page.")

    # Check if user is authenticated and, if so, has saved pose
    if request.user.is_authenticated:
        is_saved = UserSavedPose.objects.filter(user=request.user, pose=pose).exists()
    else:
        is_saved = False

    # Return serialized pose and its save status as JSON response
    return JsonResponse({
        "pose": pose.serialize(),
        "is_saved": is_saved
        })


@require_POST
@login_required(login_url='login')
def save_pose_to_favourites(request, pose_id):
    # Retrieve pose from ID
    pose = Pose.objects.get(id=pose_id)

    try:
        # Create a new saved pose object for user
        pose_to_save = UserSavedPose(user=request.user, pose=pose)
        pose_to_save.save()
        # Return confirmation to user
        return JsonResponse({
            "success": True,
            "message": "Pose saved successfully!"
        })

    except Exception as woopsie:
        # Return error message if save is unsuccessful
        return JsonResponse({
            "success": False,
            "message": str(woopsie)
        })


@require_POST
@login_required(login_url='login')
def unsave_pose_from_favourites(request, pose_id):
    # Retrieve pose from ID
    pose = Pose.objects.get(id=pose_id)

    try:
        # Retrieve saved pose object from pose and user and delete it
        saved_pose = UserSavedPose.objects.filter(user=request.user, pose=pose)
        saved_pose.delete()
        # Return confirmation to user
        return JsonResponse({
            "message": "Pose unsaved successfully!"
        })

    except Exception as woopsie:
        # Return error message if unsave is unsuccessful
        return JsonResponse({
            "success": False,
            "message": str(woopsie)
        })


@require_GET
@login_required(login_url='login')
def get_favourites(request):
    # Retrieve the saved poses for the user
    saved_poses = UserSavedPose.objects.filter(user=request.user)

    # Retrieve the serialized data for each saved pose object
    serialized_poses = [saved_pose.pose.serialize() for saved_pose in saved_poses]

    # Retrieve the pose types from the saved poses
    types = PoseType.objects.filter(pose__usersavedpose__user=request.user).distinct().order_by("name")
    serialized_types = [type.serialize() for type in types]

    # Return a list of serialized poses and a list of involved pose types' names as a JSON response
    return JsonResponse({
        "poses": serialized_poses,
        "types": [type["name"] for type in serialized_types]
    }, safe=False)


@require_GET
@login_required(login_url='login')
def get_all_user_sequences(request):
    # Retrieve user's sequences
    sequences = UserSequence.objects.filter(user=request.user)

    # Return list of serialized sequences as JSON response
    return JsonResponse([sequence.serialize() for sequence in sequences], safe=False)


@require_GET
@login_required(login_url='login')
def get_user_sequence(request, sequence_id):
    # Retrieve specific user sequence
    sequence = UserSequence.objects.get(user=request.user, id=sequence_id)

    # Return serialized sequence as JSON response
    return JsonResponse(sequence.serialize(), safe=False)


@require_POST
@login_required(login_url='login')
def create_sequence(request):
    # Retrieve sequence name and description from new sequence form data
    name = request.POST.get("name")
    description = request.POST.get("description")

    try:
        # Create new sequence object from user, name and description
        sequence = UserSequence(user=request.user, name=name, description=description)
        sequence.save()
        # Confirm creation of sequence
        return JsonResponse({'success': True})

    except Exception as woopsie:
        return JsonResponse({
            'success': False,
            'message': str(woopsie)
        })


@require_POST
@login_required(login_url='login')
def edit_sequence(request, sequence_id):
    # Retrieve sequence from ID
    sequence = UserSequence.objects.get(user=request.user, id=sequence_id)

    # Retrieve edited name and/or description from edit sequence form
    new_name = request.POST.get("new_name")
    sequence.name = new_name
    new_description = request.POST.get("new_description")
    sequence.description = new_description

    try:
        # Save changed to sequence
        sequence.save()
        # Return confirmation
        return JsonResponse({'success': True})

    except Exception as woopsie:
        # Return error message if could not edit sequence
        return JsonResponse({
            'success': False,
            'message': str(e)
            })


@require_http_methods(["DELETE"])
@login_required(login_url='login')
def delete_sequence(request, sequence_id):
    # Retrieve sequence from ID
    sequence = UserSequence.objects.get(user=request.user, id=sequence_id)

    # Attempt deleting sequence and return response accordingly
    try:
        sequence.delete()
        return JsonResponse({'success': True})
    except Exception as woopsie:
        return JsonResponse({
            'success': False,
            'message': str(woopsie)
            })


@require_POST
@login_required(login_url='login')
def add_poses_to_sequence(request, sequence_id):
    # Retrieve pose IDs from POST request
    data = json.loads(request.body)
    pose_ids = data.get('poseIds', [])

    try:
        # Retrieve poses from IDs in the specified order
        poses = [Pose.objects.get(id=pose_id) for pose_id in pose_ids]

        # Retrieve user sequence from ID
        sequence = UserSequence.objects.get(id=sequence_id)

        # Create a list of SequencePose objects for bulk creation
        sequence_poses = [SequencePose(sequence=sequence, pose=pose) for pose in poses]

        # Bulk create the SequencePose objects
        SequencePose.objects.bulk_create(sequence_poses)

        # Confirm success
        return JsonResponse({
            'success': True,
            'message': 'Pose(s) added successfully'
            })

    except Exception as woopsie:
        return JsonResponse({
            'success': False,
            'message': str(woopsie)
            })


@require_http_methods(["DELETE"])
@login_required(login_url='login')
def remove_pose_from_sequence(request, sequence_pose_id):
    # Retrieve sequence pose from ID
    sequence_pose = SequencePose.objects.get(id=sequence_pose_id)

    # Attempt deleting sequence pose and return response accordingly
    try:
        sequence_pose.delete()
        return JsonResponse({'success': True})
    except Exception as woopsie:
        return JsonResponse({
            'success': False,
            'message': str(woopsie)
            })