export function getCookie(name) {
    // Look through current document's cookies for the right cookie from name
    const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    // Return last element of array generated by match method, or null if cookie not found
    return cookieValue ? cookieValue.pop() : '';
}

export function openModal(el) {
    // Open modal by assigning specific class
    el.classList.add('is-active');
}

export function closeModal(el) {
    // Close modal by removing specific class
    el.classList.remove('is-active');

    // Reset form fields if a form exists in the modal
    const form = el.querySelector('form');
    if (form) {
        form.reset();
    }
}

export function closeAllModals() {
    (document.querySelectorAll('.modal') || []).forEach((modal) => {
        closeModal(modal);
    });
}

export function createPoseCard(pose) {
    // Initialize pose div
    const poseCard = document.createElement('div');
    poseCard.classList.add('column', 'pose-card');
    poseCard.dataset.poseId = pose.id;
    poseCard.dataset.name = pose.name;
    poseCard.dataset.sanskrit = pose.sanskrit;
    poseCard.dataset.type = pose.type;
    poseCard.dataset.difficulty = pose.difficulty_level;

    // Initialize an image with its container
    const poseImgContainer = document.createElement('figure');
    poseImgContainer.classList.add('image');
    const poseImg = document.createElement('img');
    poseImg.src = pose.svg;
    poseImgContainer.appendChild(poseImg);
    poseCard.appendChild(poseImgContainer);

    // Initialize title with english name
    const poseName = document.createElement('h2');
    poseName.classList.add('title', 'has-text-centered');
    poseName.innerText = pose.name;
    poseCard.appendChild(poseName);

    // Initialize subtitle with sanskrit name
    const poseSanskrit = document.createElement('h3');
    poseSanskrit.classList.add('subtitle', 'has-text-centered');
    poseSanskrit.innerText = pose.sanskrit;
    poseCard.appendChild(poseSanskrit);

    // Return the completed pose card
    return poseCard;
}


export function createAddPoseCard() {
    // Initialize card div
    const addPoseCard = document.createElement('div');
    addPoseCard.classList.add('column', 'add-pose-card', 'is-one-quarter');

    // Initialize an image with its container
    const addPoseImgContainer = document.createElement('figure');
    addPoseImgContainer.classList.add('image');
    const addPoseImg = document.createElement('img');
    addPoseImg.src = document.getElementById('add-pose-svg').getAttribute('src');
    addPoseImgContainer.appendChild(addPoseImg);
    addPoseCard.appendChild(addPoseImgContainer);

    // Initialize subtitle with sanskrit name
    const addPoseText = document.createElement('h4');
    addPoseText.classList.add('subtitle', 'has-text-centered', 'is-5', 'is-size-7-mobile');
    addPoseText.innerText = 'Add a pose';
    addPoseCard.appendChild(addPoseText);

    // Return the card
    return addPoseCard;
}


export function filterPoses(element, searchFilter, typeSelect, difficultySelect) {
    // Get the search input, selected type and difficulty level
    const searchValue = searchFilter.value.toLowerCase();
    const type = typeSelect.value;
    const difficulty = difficultySelect.value;

    // Get all the pose cards from the currently displayed HTML element
    const poseCards = element.querySelectorAll(".pose-card");

    // Iterate through each pose card
    poseCards.forEach((poseCard) => {
        // Get each pose's name, sanskrit, type(s) and difficulty from card dataset
        const poseName = poseCard.dataset.name.toLowerCase();
        const poseSanskrit = poseCard.dataset.sanskrit.toLowerCase();
        const poseTypes = poseCard.dataset.type.split(",");
        const poseDifficulty = poseCard.dataset.difficulty;

        // Hide or show pose card based on the search input, selected type and difficulty level
        if (
            (type === "" || poseTypes.includes(type)) &&
            (difficulty === "" || difficulty === poseDifficulty) &&
            (searchValue === "" || poseName.includes(searchValue) || poseSanskrit.includes(searchValue))
        ) {
            poseCard.style.display = "block";
        } else {
            poseCard.style.display = "none";
        }
    });
}


export async function searchYouTubeVideos(query) {
    try {
        // Initialize API key
        const apiKey = 'AIzaSyBRB88a_gI5IVXGKZ1E8DJ8IxtoV_F9lnk';

        // Display the first 3 YouTube search results
        const maxResults = 3;

        // Make a request to the YouTube Data API
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${query}&key=${apiKey}`);
        const data = await response.json();

        // Process the API response
        const searchResults = data.items.map(item => {
            const videoId = item.id.videoId;
            const title = item.snippet.title;
            const thumbnail = item.snippet.thumbnails.default.url;
            return { videoId, title, thumbnail };
        });

        // Create HTML elements for the search results
        displayYouTubeSearchResults(searchResults);
    } catch (error) {
        console.error(error);
    }
}


export function displayYouTubeSearchResults(searchResults) {
    // Intialize variable for container
    const searchResultsContainer = document.querySelector('#youtube-search-results');

    // Clear container of any previous content
    searchResultsContainer.innerHTML = '';

    // Create HTML elements for each search result and append to container
    searchResults.forEach(result => {
        const videoPlayer = document.createElement('div');
        videoPlayer.classList.add('column', 'is-one-third-desktop', 'is-full-mobile');
        videoPlayer.id = `player-${result.videoId}`;
        searchResultsContainer.appendChild(videoPlayer);

        // Load YouTube video player for each search result
        const player = new YT.Player(videoPlayer, {
            videoId: result.videoId,
        });
    });
}