# YOGIT

Yogit is my submission for Capstone, CS50W's final project. It's a web app designed with Django and JavaScript as both a yoga pose encyclopedia and sequence builder.

# BACK-END

## load_yoga_poses.py

The `load_yoga_poses.py` file contains a Django management command for loading yoga poses from an external API and saving them to the database. The script utilizes the `requests` library to make HTTP requests to the API and interacts with the Django models `Pose` and `PoseType`.

## admin.py

The `admin.py` file contains the registration of all models involved in the Yogit web application. This enables CRUD operations on the models, allowing administrators to manage the data associated with yoga poses, pose types, user saved poses, user sequences, and sequence poses.

## urls.py

The `urls.py` file contains the configuration for the Yogit web app's URL patterns and their corresponding views.

## models.py

The `models.py` file contains the Django models for a yoga pose application. It defines the database structure and relationships between different entities such as pose types, poses, user-saved poses, user-created sequences, and sequence poses. Respectively, these models are `PoseType`, `Pose`, `UserSavedPose`, `UserSequence` and `SequencePose`.

## views.py

This `views.py` file contains the views (functions) that handle the HTTP requests and generate the responses for the Yogit web-app. Below is an explanation of each view function and its purpose.

- `main_view`: Handles a `GET` request to the main page of the application. It picks a random pose from the database and renders the `yogit/main.html` template with the random pose as the background. The selected pose is passed to the template context as `pose_svg`.

- `login_api`: Handles a `POST` request to authenticate a user for login. It retrieves the `username` and `password` from the login form data and attempts to authenticate the user. If the authentication is successful, the user is logged in, and a JSON response with `{'success': True}` is returned. If the authentication fails, a JSON response with `{'success': False, 'message': 'Invalid username and/or password.'}` is returned.

- `logout_and_redirect`: Handles a request to log out the user and returns an HTTP response with a redirect to the main view.

- `signup_api`: Handles a `POST` request to create a new user account. It retrieves the `username`, `email`, `password`, and `confirmation` from the signup form data. If the `password` and `confirmation` match, it creates a new user in the database, logs them in, and returns a JSON response with `{'success': True}`. If the `password` and `confirmation` do not match, it returns a JSON response with `{'success': False, 'message': 'Passwords must match.'}`. If the username is already taken, it returns a JSON response with `{'success': False, 'message': 'Username already taken.'}`.

- `get_all_poses`: Handles a `GET` request to retrieve all yoga poses from the database. It retrieves all `Pose` objects from the database, orders them alphabetically by their English names, and retrieves all `PoseType` objects. It returns a JSON response with a list of serialized poses and a list of involved pose types' names.

- `get_pose_details`: Handles a `GET` request to retrieve details of a specific pose. It takes the `pose_id` as a parameter and retrieves the corresponding `Pose` object from the database. If the pose exists, it checks if the user is authenticated and, if so, whether the pose is saved by the user. It returns a JSON response with the serialized pose and its save status.

- `save_pose`: Handles a `POST` request to save a pose for the authenticated user. It takes the `pose_id` as a parameter, retrieves the corresponding `Pose` object, and creates a new `UserSavedPose` object for the user and the pose. If the save is successful, it returns a JSON response with `{'success': True, 'message': 'Pose saved successfully!'}`. If the save is unsuccessful, it returns a JSON response with an error message.

- `unsave_pose`: Handles a `POST` request to unsave a pose for the authenticated user. It takes the `pose_id` as a parameter, retrieves the corresponding `Pose` object, and deletes the corresponding `UserSavedPose` object if it exists. If the unsave is successful, it returns a JSON response with `{'message': 'Pose unsaved successfully!'}`. If the unsave is unsuccessful, it returns a JSON response with an error message.

- `get_saved_poses`: Handles a `GET` request to retrieve the saved poses for the authenticated user. It retrieves all `UserSavedPose` objects for the user and retrieves the serialized data for each saved pose. It also retrieves the pose types from the saved poses. It returns a JSON response with a list of serialized poses and a list of involved pose types' names.

- `get_all_user_sequences`: Handles a `GET` request to retrieve all sequences belonging to the authenticated user. It retrieves all `UserSequence` objects for the user and returns a JSON response with a list of serialized sequences.

- `get_user_sequence`: Handles a `GET` request to retrieve a specific user sequence. It takes the `sequence_id` as a parameter and retrieves the corresponding `UserSequence` object for the authenticated user. It returns a JSON response with the serialized sequence.

- `create_sequence`: Handles a `POST` request to create a new sequence for the authenticated user. It retrieves the `name` and `description` from the new sequence form data, creates a new `UserSequence` object with the user, name, and description, and saves it. If the creation is successful, it returns a JSON response with `{'success': True}`. If the creation is unsuccessful, it returns a JSON response with an error message.

- `edit_sequence`: Handles a `POST` request to edit a user sequence. It takes the `sequence_id` as a parameter, retrieves the corresponding `UserSequence` object for the authenticated user, and updates the `name` and `description` with the edited values from the form data. If the edit is successful, it returns a JSON response with `{'success': True}`. If the edit is unsuccessful, it returns a JSON response with an error message.

- `delete_sequence`: Handles a `DELETE` request to delete a user sequence. It takes the `sequence_id` as a parameter, retrieves the corresponding `UserSequence` object for the authenticated user, and deletes it. If the deletion is successful, it returns a JSON response with `{'success': True}`. If the deletion is unsuccessful, it returns a JSON response with an error message.

- `add_poses_to_sequence`: Handles a `POST` request to add poses to a user sequence. It takes the `sequence_id` as a parameter and retrieves the pose IDs from the request body. It retrieves the corresponding `Pose` objects for the IDs and the `UserSequence` object for the authenticated user. It creates a list of `SequencePose` objects for bulk creation and bulk creates them. If the addition is successful, it returns a JSON response with `{'success': True, 'message': 'Pose(s) added successfully'}`. If the addition is unsuccessful, it returns a JSON response with an error message.

- `remove_pose_from_sequence`: Handles a `DELETE` request to remove a pose from a user sequence. It takes the `sequence_pose_id` as a parameter, retrieves the corresponding `SequencePose` object, and deletes it. If the removal is successful, it returns a JSON response with `{'success': True}`. If the removal is unsuccessful, it returns a JSON response with an error message.

# FRONT-END

## utils.js

The `utils.js` file contains several utility functions used in the web application, such as retrieving a specific cookie (namely the CSRF token) with `getCookie`, handling modal functionality (`openModal`, `closeModal`, `closeAllModals`), managing and filtering yoga pose cards (`createPoseCard`, `createAddPoseCard`, `filterPoses`) and communicating with the Youtube API and handling its data (`searchYouTubeVideos`, `displayYouTubeSearchResults`).

## authenticationModals.js

The `authenticationModals.js` file contains code that handles the authentication modals in a web application. For that purpose, it contains multiple event listeners called when the DOM is loaded, as well as the two functions `login`and `signup`.

## hamburgerMenu.js

The `hamburgerMenu.js` file contains code that handles the functionality of the hamburger menu displayed in the HTML layout's navigation bar for smaller screen resolutions.

## main.js

The `main.js` file contains the main front-end functionality for the Yogit web-app. It handles the event listeners, API calls to the back-end and DOM manipulation necessary to load and display yoga poses, pose details, and sequences.

- `loadIndex`: Hides other views and displays the index view by manipulating the display property of corresponding DOM elements.

- `loadPoses`: Loads and displays yoga poses based on the given target. It fetches the poses from a backend URL, filters the poses based on user input, and dynamically generates and appends pose cards to the DOM.

- `loadPoseDetails`: Loads and displays detailed information about a specific pose. It fetches the pose details from a backend URL based on the given pose ID, updates the corresponding DOM elements with the fetched data, and handles events such as saving or unsaving the pose.

- `savePose`: Saves or unsaves a pose by sending a POST request to the backend API. Updates the button text and appearance based on the saved status.

- `loadSequences`: Loads and displays sequences created by the user. It fetches the sequences from a backend URL, generates sequence cards with their associated poses, and handles events such as adding or removing poses from sequences.

## sequenceModals.js

The `sequenceModals.js` file handles various modal interactions and operations related to sequences and poses. It includes event listeners for opening and closing modals, form submissions for creating and editing sequences, adding and removing poses from sequences, and loading pose data.

- `createNewSequence`: Handles the form data submitted for creating a new sequence. It sends a `POST` request to the server to create a new sequence. If the request is successful, the modal is closed, and the sequences view is reloaded. If the request fails, an error message is displayed.

- `editSequence`: Opens the modal for editing a sequence, retrieves the form and error message elements, and pre-fills the form fields with the existing sequence data. When the form is submitted, it prevents the default form submission behavior, retrieves the CSRF token, extracts the new form data, and sends a `POST` request to edit the sequence. If the request is successful, the modal is closed, and the sequences view is reloaded. If the request fails, an error message is displayed.

- `deleteSequence`: Opens the modal for confirming the deletion of a sequence. When the form is submitted, it prevents the default form submission behavior, retrieves the CSRF token, and sends a `DELETE` request to delete the sequence. If the request is successful, the modal is closed, and the sequences view is reloaded. If the request fails, an error message is displayed.

- `loadPosesModal`: Opens the modal for adding poses to a sequence. The modal displays an alternate version of the normal HTML poses view with its filters as a form with a checkbox for each pose card. Upon submitting the form with the selected pose(s), the next function is called.

- `addPosesToSequence`: Handles adding selected poses to a sequence. It retrieves the selected pose IDs from the HTML form's checkboxes, sends a `POST` request to save the poses to the sequence, and handles the response by either closing the modal and reloading the sequences view or displaying an error message.

- `removePoseFromSequence`: Handles removing a pose from a sequence. It sends a `DELETE` request to remove the pose from the sequence and handles the response by either logging a success message or an error message.

## styles.scss / styles.css

The `styles.scss` contains all the necessary CSS tweaks and manipulations I've made to improve the look and responsiveness of the web application, such as custom coloring, shadows and buttons, as well as making all forms displayed inside modals scrollable and accessible. The `styles.scss` file is converted to `styles.css`, with `styles.css.map` as its map file.

# INSTALLATION & HOW TO RUN

To install and run Yogit, make sure to first install the required modules listed in the `requirements.txt` file, located within the app's folder, `capstone/yogit`. For this, you can simply enter the command `pip install -r requirements.txt` in your terminal, once you have entered `cd capstone` to first move the terminal's focus to the project's folder.
Once all requirements have been installed, you can run the web application by entering the command `python manage.py runserver` in your terminal, and access the app from the link provided in the terminal.
>>>>>>> a97ca14 (initial commit)
