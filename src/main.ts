// todo
function createButton() {
    // Create button 
    const button = document.createElement('button');
    button.textContent = 'Click Me';

    // Set up click event listener
    button.addEventListener('click', () => {
        alert('You clicked the button!');
    });

    // Append button to document body
    document.body.appendChild(button);
}

// Call button function
createButton();