import * as utils from './utils.js';
import { editSequence, deleteSequence, loadPosesModal, removePoseFromSequence } from './sequenceModals.js';


document.addEventListener('DOMContentLoaded', () => {

    // Load all poses when clicking on a #view-poses button
    document.querySelectorAll('#view-poses').forEach(button =>
        button.addEventListener('click', () => {
            loadPoses('poses');
        })
    );

    // Load favourites when clicking on a #view-favourites button
    document.querySelectorAll('#view-favourites').forEach(button =>
        button.addEventListener('click', () => {
            loadPoses('favourites');
        })
    );

    // Set click event listeners for save and return buttons on pose-details-view
    const saveButton = document.querySelector('#save-pose');
    saveButton.addEventListener('click', () => {
        savePose(saveButton);
    });
    const returnButton = document.querySelector('#return');
    returnButton.addEventListener('click', () => {
        const target = returnButton.dataset.target;
        if (target === "sequences") {
            loadSequences();
        } else {
            loadPoses(target);
        }
    });

    // Load sequences when clicking on a #view-sequences button
    document.querySelectorAll('#view-sequences').forEach(button =>
        button.addEventListener('click', loadSequences)
    );

    // Load index when clicking on a #view-index button
    document.querySelector('#view-index').addEventListener('click', loadIndex);

    // By default, load index
    loadIndex();

});


function loadIndex() {
    // Mask other views and display index view
    document.querySelector('#pose-details-view').style.display = 'none';
    document.querySelector('#poses-view').style.display = 'none';
    document.querySelector('#sequences-view').style.display = 'none';
    document.querySelector('#index-view').style.display = 'block';
}


async function loadPoses(target) {
    // Initialize view variable
    const posesView = document.querySelector('#poses-view');

    // Mask other views and display poses view
    document.querySelector('#index-view').style.display = 'none';
    document.querySelector('#pose-details-view').style.display = 'none';
    document.querySelector('#sequences-view').style.display = 'none';
    posesView.style.display = 'block';

    // Assign relevant title and subtitle to displayed poses view
    const title = posesView.querySelector('#poses-view-title');
    const subtitle = posesView.querySelector('#poses-view-subtitle');
    if (target === 'poses') {
        title.innerText = "All yoga poses";
    } else {
        title.innerText = "Your favourite poses";
    }
    subtitle.innerText = "and what you need to know about them.";

    // Initialize <div> container variable
    const yogaPosesContainer = posesView.querySelector('#yoga-poses');

    // Clear container of any previous/current content
    while (yogaPosesContainer.firstChild) {
        yogaPosesContainer.removeChild(yogaPosesContainer.firstChild);
    }

    // Initialize variables for search and filter fields
    const searchFilter = posesView.querySelector("#search-filter");
    const typeSelect = posesView.querySelector("#type-filter");
    const difficultySelect = posesView.querySelector("#difficulty-filter");

    if (searchFilter) {
        searchFilter.value = "";
        searchFilter.removeEventListener("input", () => {
            utils.filterPoses(posesView, searchFilter, typeSelect, difficultySelect);
        });
        searchFilter.addEventListener("input", () => {
            utils.filterPoses(posesView, searchFilter, typeSelect, difficultySelect);
        });
        // Set search input field to autofocus
        searchFilter.focus();
    }
    if (typeSelect) {
        typeSelect.value = "";
        typeSelect.removeEventListener("change", () => {
            utils.filterPoses(posesView, searchFilter, typeSelect, difficultySelect);
        });
        typeSelect.addEventListener("change", () => {
            utils.filterPoses(posesView, searchFilter, typeSelect, difficultySelect);
        });
    }
    if (difficultySelect) {
        difficultySelect.value = "";
        difficultySelect.removeEventListener("change", () => {
            utils.filterPoses(posesView, searchFilter, typeSelect, difficultySelect);
        });
        difficultySelect.addEventListener("change", () => {
            utils.filterPoses(posesView, searchFilter, typeSelect, difficultySelect);
        });
    }

    try {
        // Fetch poses from backend URL and create a card for each pose to append to container
        const response = await fetch(target);
        const data = await response.json();

        // Retrieve poses and pose types from data
        const poses = data.poses;
        const types = data.types;

        if (
            (poses.length === 0) &&
            (target === 'favourites')
         ) {
            yogaPosesContainer.innerText = 'You currently do not have any pose saved.';
        } else if (
            (poses.length === 0) &&
            (target === 'poses')
        ) {
            yogaPosesContainer.innerText = 'No pose found.';;
        } else {
            // Iterate through each pose to create a pose card and add a 'click' event listener to it
            poses.forEach(pose => {
                const poseCard = utils.createPoseCard(pose);
                poseCard.addEventListener('click', () => {
                    const poseId = poseCard.dataset.poseId;
                    // Load pose details when pose card is clicked
                    loadPoseDetails(poseId, target);
                });
                // Add column size as class to optimize card for poses-view
                poseCard.classList.add('is-one-quarter');
                // Append pose card to container
                yogaPosesContainer.appendChild(poseCard);
            });

            // Add pose type options to the select field
            types.forEach((type) => {
                const option = document.createElement("option");
                option.value = type;
                option.text = type;
                typeSelect.appendChild(option);
            });
        }

    } catch (error) {
        console.error(error);
    }
}


async function loadPoseDetails(poseId, target) {
    // Mask other views and display poses view
    document.querySelector('#index-view').style.display = 'none';
    document.querySelector('#poses-view').style.display = 'none';
    document.querySelector('#sequences-view').style.display = 'none';
    document.querySelector('#pose-details-view').style.display = 'block';

    // Scroll back to top of page
    window.scrollTo(0, 0);

    // Initialize pose details view variables
    const poseTitle = document.querySelector('#pose-title');
    const poseSubtitle = document.querySelector('#pose-sanskrit');
    const poseImg = document.querySelector('#pose-image');
    const poseDifficulty = document.querySelector('#pose-difficulty');
    const poseTypes = document.querySelector('#pose-types');
    const poseDescription = document.querySelector('#pose-description');
    const poseBenefits = document.querySelector('#pose-benefits');
    const saveButton = document.querySelector('#save-pose');
    const returnButton = document.querySelector('#return');

    try {
        // Fetch pose details from backend URL with pose id as argument
        const response = await fetch(`poses/${poseId}`);
        const data = await response.json();

        // Initialize pose and save status variables from data
        const pose = data.pose;
        const isSaved = data.is_saved;

        // Assign fetched data to pose-details-view relevant elements
        poseTitle.innerText = pose.name;
        poseSubtitle.innerText = pose.sanskrit;
        poseImg.src = pose.svg;
        poseDifficulty.innerHTML = pose.difficulty_level.charAt(0).toUpperCase() + pose.difficulty_level.slice(1);
        poseTypes.innerText = pose.type.toString().replaceAll(",", " / ");
        poseDescription.innerText = pose.description;
        poseBenefits.innerText = pose.benefits;

        // If user is authenticated and save button is thus displayed
        if (saveButton) {
            saveButton.dataset.poseId = poseId;
            // Display button and handle saving or unsaving accordingly if user had saved pose or not
            if (isSaved) {
                saveButton.innerText = "Unsave pose";
                saveButton.classList.remove("is-primary");
                saveButton.classList.add("is-danger");
            } else {
                saveButton.innerText = "Save pose";
                saveButton.classList.remove("is-danger");
                saveButton.classList.add("is-primary");
            }
        }

        // Set return button's target to the previous view accordingly
        returnButton.dataset.target = target;

        // Search for YouTube videos related to the pose
        const query = `${pose.name} pose`;
        utils.searchYouTubeVideos(query);

    } catch (error) {
        console.error(error);
    }
}


async function savePose(saveButton) {
    try {
        // Set route to save/unsave according to which button was clicked
        const isSaved = saveButton.innerText;
        const poseId = saveButton.dataset.poseId;
        let fetchURL;
        if (isSaved === "Unsave pose") {
            fetchURL = `poses/${poseId}/unsave`;
        } else {
            fetchURL = `poses/${poseId}/save`;
        }

        // Process request to backend
        const response = await fetch(fetchURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': utils.getCookie('csrftoken')
            }
        });
        const data = await response.json();

        // Render confirmation message as button text
        saveButton.innerText = data.message;
    } catch (error) {
        console.error(error);
    }
}


export async function loadSequences() {
    try {
        // Mask other views and display sequences view
        document.querySelector('#index-view').style.display = 'none';
        document.querySelector('#poses-view').style.display = 'none';
        document.querySelector('#pose-details-view').style.display = 'none';
        document.querySelector('#sequences-view').style.display = 'block';

        // Initialize variable for sequences container
        const sequencesContainer = document.getElementById('sequences-container');

        // Clear the sequences container before populating it
        while (sequencesContainer.firstChild) {
            sequencesContainer.removeChild(sequencesContainer.firstChild);
        }

        // Fetch user's sequences from database
        const response = await fetch(`sequences`);
        const sequences = await response.json();

        // Check if user has any sequence created
        if (sequences.length === 0) {
            // Initialize HTML element to display if no poses were found
            const noSequenceCard = document.createElement('div');
            noSequenceCard.classList.add('card');
            const sequenceHeader = document.createElement('header');
            sequenceHeader.classList.add('card-header');
            noSequenceCard.appendChild(sequenceHeader);
            const title = document.createElement('p');
            title.classList.add('card-header-title');
            title.textContent = "No sequence found or created yet.";
            sequenceHeader.appendChild(title);
            sequencesContainer.appendChild(noSequenceCard);
        } else {
            // Iterate through sequences to create a card for each and populate card
            sequences.forEach(sequence => {
                const sequenceCard = document.createElement('div');
                sequenceCard.id = sequence.id;
                sequenceCard.classList.add('card', 'sequence-card');

                const sequenceHeader = document.createElement('header');
                sequenceHeader.classList.add('card-header');
                sequenceCard.appendChild(sequenceHeader);

                const title = document.createElement('p');
                title.classList.add('card-header-title');
                title.textContent = sequence.name;
                sequenceHeader.appendChild(title);

                const sequenceContent = document.createElement('div');
                sequenceContent.classList.add('card-content');
                sequenceCard.appendChild(sequenceContent);

                const sequenceColumns = document.createElement('div');
                sequenceColumns.classList.add('columns', 'is-multiline');
                sequenceContent.appendChild(sequenceColumns);

                // Retrieve poses and their respective IDs as sequence specific poses in its own list
                const poses = sequence.poses;
                const sequencePoseIds = sequence.sequence_pose_ids;

                // Display a card to add a pose if no poses currently in sequence
                if (sequence.poses.length === 0) {
                    // Add a card that enables adding a pose to sequence when clicked
                    const addPoseCard = utils.createAddPoseCard();
                    addPoseCard.dataset.sequenceId = sequence.id;
                    addPoseCard.removeEventListener('click', () => {
                        loadPosesModal(addPoseCard);
                    });
                    addPoseCard.addEventListener('click', () => {
                        loadPosesModal(addPoseCard);
                    });
                    sequenceColumns.appendChild(addPoseCard);

                // Else, display a clickable pose card for each of the sequence's poses
                } else {
                    poses.forEach((pose, index) => {
                        const poseCard = utils.createPoseCard(pose);
                        poseCard.classList.add('is-one-quarter');
                        sequenceColumns.appendChild(poseCard);
                        poseCard.removeEventListener('click', () => {
                            loadPoseDetails(poseCard.dataset.poseId, 'sequences');
                        });
                        poseCard.addEventListener('click', () => {
                            // Load pose details when pose card is clicked,
                            // enable return to sequences-view by setting loadPoseDetails's "target" parameter to "sequences"
                            loadPoseDetails(poseCard.dataset.poseId, 'sequences');
                        });
                        poseCard.dataset.sequencePoseId = sequencePoseIds[index];

                        // Add a delete button to pose card and an event listener to enable deletion
                        const removePoseButtonContainer = document.createElement('p');
                        removePoseButtonContainer.classList.add('has-text-centered');
                        const removePoseButton = document.createElement('button');
                        removePoseButton.classList.add('delete');
                        removePoseButton.dataset.sequencePoseId = sequencePoseIds[index];
                        removePoseButton.dataset.sequenceId = sequence.id;
                        removePoseButton.removeEventListener('click', async (event) => {
                            event.stopPropagation();
                            removePoseFromSequence(removePoseButton);
                        });
                        removePoseButton.addEventListener('click', async (event) => {
                            event.stopPropagation();
                            removePoseFromSequence(removePoseButton);
                        });
                        removePoseButtonContainer.appendChild(removePoseButton);
                        poseCard.appendChild(removePoseButtonContainer);
                    })
                }

                // Create description element
                const descriptionField = document.createElement('div');
                descriptionField.classList.add('content');
                const description = document.createElement('p');
                description.textContent = sequence.description;
                sequenceContent.appendChild(description);

                // Create card footer
                const sequenceFooter = document.createElement('footer');
                sequenceFooter.classList.add('card-footer');

                // Create footer button to add pose
                const addPoseButton = document.createElement('button');
                addPoseButton.innerText = "Add pose(s)";
                addPoseButton.classList.add('card-footer-item', 'button', 'is-ghost');
                addPoseButton.id = 'add-pose-to-sequence';
                addPoseButton.dataset.sequenceId = sequence.id;
                addPoseButton.removeEventListener('click', () => {
                    loadPosesModal(addPoseButton);
                });
                addPoseButton.addEventListener('click', () => {
                    loadPosesModal(addPoseButton);
                });
                sequenceFooter.appendChild(addPoseButton);

                // Create footer button to edit sequence
                const editButton = document.createElement('button');
                editButton.innerText = "Edit";
                editButton.classList.add('card-footer-item', 'button', 'is-ghost');
                editButton.id = 'edit-sequence';
                editButton.dataset.sequenceId = sequence.id;
                editButton.removeEventListener('click', () => {
                    editSequence(editButton);
                });
                editButton.addEventListener('click', () => {
                    editSequence(editButton);
                });
                sequenceFooter.appendChild(editButton);

                // Create footer button to delete sequence
                const deleteButton = document.createElement('button');
                deleteButton.innerText = "Delete";
                deleteButton.classList.add('card-footer-item', 'button', 'is-ghost');
                deleteButton.id = 'delete-sequence';
                deleteButton.dataset.sequenceId = sequence.id;
                deleteButton.removeEventListener('click', () => {
                    deleteSequence(deleteButton);
                });
                deleteButton.addEventListener('click', () => {
                    deleteSequence(deleteButton);
                });
                sequenceFooter.appendChild(deleteButton);
                sequenceCard.appendChild(sequenceFooter);

                // Append sequence card to sequences container
                sequencesContainer.appendChild(sequenceCard);
            })
        }
    } catch (error) {
        console.error(error);
    }
}
