from django.urls import path

from . import views

urlpatterns = [
    # MAIN
    path("", views.main_view, name="main"),

    # USER AUTHENTIFICATION
    path("signup", views.signup_api, name="signup"),
    path("login", views.login_api, name="login"),
    path("logout", views.logout_and_redirect, name="logout"),

    # POSES
    path("poses", views.get_all_poses, name="get_all_poses"),
    path("poses/<int:pose_id>", views.get_pose_details, name="get_pose_details"),
    path("poses/<int:pose_id>/save", views.save_pose_to_favourites, name="save_pose_to_favourites"),
    path("poses/<int:pose_id>/unsave", views.unsave_pose_from_favourites, name="unsave_pose_from_favourites"),
    path("favourites", views.get_favourites, name="get_favourites"),

    # POSE SEQUENCES
    path("sequences", views.get_all_user_sequences, name="get_all_user_sequences"),
    path("sequences/new-sequence", views.create_sequence, name="create_sequence"),
    path("sequences/<int:sequence_id>", views.get_user_sequence, name="get_user_sequence"),
    path("sequences/<int:sequence_id>/edit", views.edit_sequence, name="edit_sequence"),
    path("sequences/<int:sequence_id>/delete", views.delete_sequence, name="delete_sequence"),
    path("sequences/<int:sequence_id>/add-poses", views.add_poses_to_sequence, name="add_poses_to_sequence"),
    path("sequences/<int:sequence_pose_id>/remove", views.remove_pose_from_sequence, name="remove_pose_from_sequence")
]