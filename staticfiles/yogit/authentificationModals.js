import * as utils from './utils.js';


document.addEventListener('DOMContentLoaded', () => {

    // Handle click event to open signup modal
    const signupButton = document.querySelector('#signup');
    if (signupButton) {
        signupButton.addEventListener('click', () => {
            const signupModal = document.getElementById('signup-modal');
            utils.openModal(signupModal);
        });
    }

    // Handle click event to open login modal
    const loginButton = document.querySelector('#login');
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            const loginModal = document.getElementById('login-modal');
            utils.openModal(loginModal);
        });
    }

    // Handle click event to switch to login modal from signup modal
    const loginLink = document.querySelector('#switch-to-login-modal');
    loginLink.addEventListener('click', () => {
        const loginModal = document.getElementById('login-modal');
        const signupModal = document.getElementById('signup-modal');
        utils.closeModal(signupModal);
        utils.openModal(loginModal);
    });

    // Handle click event to switch to signup modal from login modal
    const signupLink = document.querySelector('#switch-to-signup-modal');
    signupLink.addEventListener('click', () => {
        const signupModal = document.getElementById('signup-modal');
        const loginModal = document.getElementById('login-modal');
        utils.closeModal(loginModal);
        utils.openModal(signupModal);
    });

    // Add submit event listeners for login and signup forms
    const loginForm = document.querySelector('#login-modal form');
    const signupForm = document.querySelector('#signup-modal form');

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = loginForm.elements.username.value;
        const password = loginForm.elements.password.value;
        login(username, password);
    });

    signupForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = signupForm.elements.username.value;
        const email = signupForm.elements.email.value;
        const password = signupForm.elements.password.value;
        const confirmation = signupForm.elements.confirmation.value;
        signup(username, email, password, confirmation);
    });

    // Add a click event on various child elements to close the parent modal
    (document.querySelectorAll('.modal-background, .modal-close, .delete') || []).forEach((close) => {
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

});


// Function to handle login form submission
async function login(username, password) {
    // Get the CSRF token from the cookie
    const csrftoken = utils.getCookie('csrftoken');

    // Create a new FormData object and append the username and password
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
        // Send a POST request to the login endpoint
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken
            },
            body: formData
        });

        // Parse the response as JSON
        const data = await response.json();

        if (data.success) {
            // Login successful, redirect to main page
            window.location.href = '/';
        } else {
            // Login failed, display error message
            const failedAuthMessage = document.querySelector('#login-modal .failed-auth-message');
            failedAuthMessage.textContent = data.message;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


async function signup(username, email, password, confirmation) {
    // Get the CSRF token from the cookie
    const csrftoken = utils.getCookie('csrftoken');

    // Create a new FormData object and append the username, email, password, and confirmation
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('confirmation', confirmation);

    try {
        // Send a POST request to the signup endpoint
        const response = await fetch('/signup', {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrftoken
            },
            body: formData
        });

        // Parse the response as JSON
        const data = await response.json();

        if (data.success) {
            // Signup successful, redirect to main page
            window.location.href = '/';
        } else {
            // Signup failed, display error message
            const failedAuthMessage = document.querySelector('#signup-modal .failed-auth-message');
            failedAuthMessage.textContent = data.message;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

