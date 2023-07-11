document.addEventListener('DOMContentLoaded', () => {

    // Get navbar-burger element
    const navbarBurger = document.querySelector('.navbar-burger');

      // Add a click event
      navbarBurger.addEventListener('click', () => {

        // Get the target from the "data-target" attribute
        const target = navbarBurger.dataset.target;
        const $target = document.getElementById(target);

        // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
        navbarBurger.classList.toggle('is-active');
        $target.classList.toggle('is-active');

      });

});