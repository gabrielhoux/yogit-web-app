import * as utils from './utils.js';
import { loadSequences } from './main.js';


document.addEventListener('DOMContentLoaded', () => {

    // Handle click event to open new sequence modal
    const createSequenceButton = document.getElementById('create-sequence');
    createSequenceButton.addEventListener('click', () => {
        const newSequenceModal = document.getElementById('new-sequence-modal');
        utils.openModal(newSequenceModal);
    });

    // Handle modal form submission event for creating a new sequence
    const newSequenceForm = document.querySelector('#new-sequence-modal form');
    newSequenceForm.addEventListener('submit', (event) => {
        event.preventDefault();
        createNewSequence(newSequenceForm);
    });

    // Handle modal form submission event for adding pose(s) to a sequence
    const addPoseForm = document.querySelector('#add-pose-modal form');
    addPoseForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const sequenceId = addPoseForm.dataset.sequenceId;
      const addPoseModal = document.getElementById('add-pose-modal');
      addPosesToSequence(sequenceId, addPoseModal);
    });

    // Add a click event on various child elements to close the parent modal
    (document.querySelectorAll('.modal-background, .modal-close, .delete, .cancel') || []).forEach((close) => {
        const target = close.closest('.modal');

        close.addEventListener('click', () => {
            utils.closeModal(target);
        });
    });

    // Add a keyboard event to close all modals
    document.addEventListener('keydown', (event) => {
        const e = event || window.event;

        if (e.keyCode === 27) { // Escape key
            utils.closeAllModals();
        }
    });
})


async function createNewSequence(newSequenceForm) {
    // Get the CSRF token from the cookie
    const csrftoken = utils.getCookie('csrftoken');

    // Create a FormData object and extract form data
    const formData = new FormData();
    const name = newSequenceForm.querySelector('input[name="name"]').value;
    const description = newSequenceForm.querySelector('textarea[name="description"]').value || "";

    // Get the error message element
    const errorMessage = document.querySelector('#new-sequence-modal .error-message');

    // Append form data to the FormData object
    formData.append('name', name);
    formData.append('description', description);

    try {
        // Send a POST request to create a new sequence
        const response = await fetch('/sequences/new-sequence', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken
            },
            body: formData
        });

        // Parse the response as JSON
        const data = await response.json();

        if (data.success) {
            // Sequence successfully created, close modal and reload sequences view
            const newSequenceModal = document.getElementById('new-sequence-modal');
            utils.closeModal(newSequenceModal);
            await loadSequences();
        } else {
            // If sequence name already used, display error message
            errorMessage.textContent = data.message;
        }
    } catch (error) {
        console.error('Error:', error);
        // Display an error message if needed
        errorMessage.textContent = 'An error occurred while creating the sequence.';
    }
}


export async function editSequence(element) {
    // Retrieve sequence ID from clicked element's dataset
    const sequenceId = element.dataset.sequenceId;

    // Retrieve relevant modal and open it
    const editSequenceModal = document.getElementById('edit-sequence-modal');
    utils.openModal(editSequenceModal);

    // Retrieve form and error message and initialize variables
    const editSequenceForm = document.querySelector('#edit-sequence-modal form');
    const errorMessage = document.querySelector('#edit-sequence-modal .error-message');

    try {
        // Fetch the sequence data from the server
        const response = await fetch(`sequences/${sequenceId}`);
        const sequence = await response.json();

        // Pre-fill the form fields with sequence data
        const modalTitle = editSequenceModal.querySelector('.modal-card-title');
        modalTitle.textContent = `Editing ${sequence.name}`;
        const nameInput = editSequenceForm.querySelector('input[name="name"]');
        const descriptionTextarea = editSequenceForm.querySelector('textarea[name="description"]');
        nameInput.value = sequence.name;
        descriptionTextarea.value = sequence.description;

        // Add event listener to handle form submission
        editSequenceForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Get the CSRF token from the cookie
            const csrftoken = utils.getCookie('csrftoken');

            // Create a FormData object and extract form data
            const formData = new FormData();
            const newName = nameInput.value;
            const newDescription = descriptionTextarea.value;
            formData.append('new_name', newName);
            formData.append('new_description', newDescription);

            try {
                // Send a POST request to edit the sequence
                const response = await fetch(`sequences/${sequenceId}/edit`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': csrftoken
                    },
                    body: formData
                });

                // Parse the response as JSON
                const data = await response.json();

                if (data.success) {
                    // Sequence successfully edited, close modal and reload sequences view
                    utils.closeModal(editSequenceModal);
                    await loadSequences();
                } else {
                    // If sequence name already used, display error message
                    errorMessage.textContent = data.message;
                }
            } catch (error) {
                console.error('Error:', error);
                // Display an error message if needed
                errorMessage.textContent = 'An error occurred while editing the sequence.';
            }
        });
    } catch (error) {
        console.error('Error:', error);
        // Display an error message if needed
        errorMessage.textContent = 'An error occurred while editing the sequence.';
    }
}


export async function deleteSequence(element) {
    // Retrieve sequence ID from clicked element's dataset
    const sequenceId = element.dataset.sequenceId;

    // Retrieve relevant modal and open it
    const deleteSequenceModal = document.getElementById('delete-sequence-modal');
    utils.openModal(deleteSequenceModal);

    // Retrieve form and error message and initialize variables
    const deleteSequenceForm = document.querySelector('#delete-sequence-modal form');
    const errorMessage = document.querySelector('#delete-sequence-modal .error-message');

    try {
        // Add event listener to handle form submission
        deleteSequenceForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Get the CSRF token from the cookie
            const csrftoken = utils.getCookie('csrftoken');

            try {
                // Send a DELETE request to delete the sequence
                const response = await fetch(`sequences/${sequenceId}/delete`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRFToken': csrftoken
                    },
                });

                // Parse the response as JSON
                const data = await response.json();

                if (data.success) {
                    // Sequence successfully deleted, close modal and reload sequences view
                    utils.closeModal(deleteSequenceModal);
                    await loadSequences();
                } else {
                    // Display error message if deletion failed
                    errorMessage.textContent = data.message;
                }
            } catch (error) {
                console.error('Error:', error);
                // Display an error message if needed
                errorMessage.textContent = 'An error occurred while deleting the sequence.';
            }
        });
    } catch (error) {
        console.error('Error:', error);
        // Display an error message if needed
        errorMessage.textContent = 'An error occurred while deleting the sequence.';
    }
}


export async function loadPosesModal(element) {
    // Retrieve relevant modal and open it
    const addPoseModal = document.getElementById('add-pose-modal');
    utils.openModal(addPoseModal);

    // Assign sequence ID to form's dataset from clicked element's dataset
    const form = addPoseModal.querySelector('form');
    form.dataset.sequenceId = element.dataset.sequenceId;

    // Initialize container variable
    const yogaPosesContainer = addPoseModal.querySelector('#yoga-poses');

    // Clear container of any previous/current content
    while (yogaPosesContainer.firstChild) {
        yogaPosesContainer.removeChild(yogaPosesContainer.firstChild);
    }

    // Initialize variables for search and filter fields
    const searchFilter = addPoseModal.querySelector("#modal-search-filter");
    const typeSelect = addPoseModal.querySelector("#modal-type-filter");
    const difficultySelect = addPoseModal.querySelector("#modal-difficulty-filter");

    // Add event listeners to the search & filter fields to detect changes
    // Remove any previously added listeners to avoid duplicating them
    if (searchFilter) {
        searchFilter.value = "";
        searchFilter.removeEventListener("input", () => {
            utils.filterPoses(addPoseModal, searchFilter, typeSelect, difficultySelect);
        });
        searchFilter.addEventListener("input", () => {
            utils.filterPoses(addPoseModal, searchFilter, typeSelect, difficultySelect);
        });
        // Set search input field to autofocus
        searchFilter.focus();
    }
    if (typeSelect) {
        typeSelect.value = "";
        typeSelect.removeEventListener("change", () => {
            utils.filterPoses(addPoseModal, searchFilter, typeSelect, difficultySelect);
        });
        typeSelect.addEventListener("change", () => {
            utils.filterPoses(addPoseModal, searchFilter, typeSelect, difficultySelect);
        });
    }
    if (difficultySelect) {
        difficultySelect.value = "";
        difficultySelect.removeEventListener("change", () => {
            utils.filterPoses(addPoseModal, searchFilter, typeSelect, difficultySelect);
        });
        difficultySelect.addEventListener("change", () => {
            utils.filterPoses(addPoseModal, searchFilter, typeSelect, difficultySelect);
        });
    }

    // Initialize index variable to keep track of order pose cards checkboxes are checked in
    let checkIndex = 0;

    try {
        // Fetch all poses from backend URL and create a card for each pose to append to container
        const response = await fetch(`poses`);
        const data = await response.json();

        // Retrieve poses and pose types from data
        const poses = data.poses;
        const types = data.types;

        // Initialize HTML element to display if no poses were found
        const noPoseTitleContainer = document.createElement('div');
        noPoseTitleContainer.classList.add('content', 'column');
        const noPoseTitle = document.createElement('p');
        noPoseTitle.classList.add('title', 'is-5');
        noPoseTitleContainer.appendChild(noPoseTitle);

        if (poses.length === 0) {
            noPoseTitle.innerText = 'No pose found.';
            yogaPosesContainer.appendChild(noPoseTitleContainer);
        } else {
            // Iterate through each pose to create a pose card and add a 'click' event listener to it
            poses.forEach(pose => {
                // Create a pose card from pose data
                const poseCard = utils.createPoseCard(pose);

                // Add column size as class to optimize card for modal format
                poseCard.classList.add('is-one-third');

                // Add a checkbox input to each pose card to allow adding multiple poses at once
                const checkboxContainer = document.createElement('p');
                checkboxContainer.classList.add('control', 'has-text-centered');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.dataset.poseId = pose.id;
                checkboxContainer.appendChild(checkbox);
                poseCard.appendChild(checkboxContainer);

                // Add pose card click event listener so checkbox is checked/unchecked when whole card is clicked, update check index
                poseCard.addEventListener('click', () => {
                    checkbox.checked = !checkbox.checked;
                    if (checkbox.checked) {
                        checkbox.dataset.checkIndex = checkIndex;
                        console.log(checkIndex);
                        checkIndex++;
                    } else {
                        checkbox.dataset.checkIndex = null;
                    }
                    poseCard.classList.toggle('has-background-success');
                })

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
        console.error('Error:', error);
        // Display an error message if needed
        errorMessage.textContent = 'An error occurred while adding pose(s) to your sequence.';
    }
}

async function addPosesToSequence(sequenceId, addPoseModal) {
    // Get CSRF token from cookie
    const csrftoken = utils.getCookie('csrftoken');

    // Initialize error message element variable
    const errorMessage = addPoseModal.querySelector('.error-message');

    // Retrieve checked checkboxes and convert NodeList to an array
    const checkboxes = Array.from(addPoseModal.querySelectorAll('input[type="checkbox"]:checked'));

    // Sort the checkboxes array based on their checkIndex dataset
    checkboxes.sort((checkboxA, checkboxB) => {
        const indexA = parseInt(checkboxA.dataset.checkIndex);
        const indexB = parseInt(checkboxB.dataset.checkIndex);
        return indexA - indexB;
    });

    // Retrieve the pose IDs from the sorted checkboxes in the order they were checked
    const poseIds = [];
    checkboxes.forEach(checkbox => {
        poseIds.push(checkbox.dataset.poseId);
    });

    try {
        // Send a POST request to save the selected poses to the sequence
        const response = await fetch(`sequences/${sequenceId}/add-poses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify({ poseIds }),
        });

        const data = await response.json();

        if (data.success) {
            console.log(`${poseIds.length} pose(s) added to sequence.`);

            // Close the modal after submission
            utils.closeModal(addPoseModal);

            // Reload sequence view
            await loadSequences();
        } else {
            // Display error message if could not add pose(s) to sequence
            errorMessage.textContent = data.message;
        }
    } catch (error) {
        console.error('Error:', error);
        // Display an error message if needed
        errorMessage.textContent = 'An error occurred while adding pose(s) to your sequence.';
    }
}


export async function removePoseFromSequence(removeButton) {
    // Retrieve CSRF token from cookie
    const csrftoken = utils.getCookie('csrftoken');

    // Retrieve sequence pose ID from button dataset
    const sequencePoseId = removeButton.dataset.sequencePoseId;

    try {
        // Send a DELETE request to remove pose from sequence
        const response = await fetch(`sequences/${sequencePoseId}/remove`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': csrftoken
            },
        });

        // Retrieve response data
        const data = await response.json();

        // Confirm removal or log error according to response data
        if (data.success) {
            console.log("Successfully removed pose from sequence.");
            await loadSequences();
        } else {
            console.error(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}