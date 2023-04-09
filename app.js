const addButtonList = document.querySelectorAll('.add-to-do-btn');
const habits = [];

/*
Here's a brief explanation of what the code does:

We first get a list of all the "Add" buttons using document.querySelectorAll('.add-to-do-btn').
We loop through this list using addButtonList.forEach().
For each button, we add a click event listener using button.addEventListener('click', function(event) {...}).
Inside the event listener, we first prevent the default form submission behavior using event.preventDefault().
We then get the closest .p-container element using this.closest('.p-container'), where this refers to the clicked button.
We get the input field value using participantContainer.querySelector('input[type="text"]').value.trim().
If the input value is not empty, we create a new li element using document.createElement('li'), add the necessary classes and HTML using newLi.classList.add() and newLi.innerHTML, and append it to the appropriate to-do list using toDoList.appendChild(newLi).
Finally, we clear the input field using inputField.value = ''.

*/

addButtonList.forEach(function(button) {
  button.addEventListener('click', function(event) {
    event.preventDefault();
    const participantContainer = this.closest('.p-container');
    const inputField = participantContainer.querySelector('input[type="text"]');
    const inputValue = inputField.value.trim();

    console.log(inputValue);

    if (inputValue !== '') {
      habits.push(inputValue);
      localStorage.setItem("habits", JSON.stringify(habits));
      
      const toDoList = participantContainer.querySelector('.to-do');
      const newLi = document.createElement('li');
      newLi.classList.add('checkbox-container');
      newLi.innerHTML = `
        <label for="${this.id}-checkbox">${inputValue}</label>
        <input type="checkbox" id="${this.id}-checkbox" name="myCheckbox" value="${inputValue}">
      `;
      toDoList.appendChild(newLi);

      inputField.value = '';
    }
  });
});