// Get DOM elements
const usernameH1 = document.getElementById("user-name-h1");
const addButtonList = document.querySelectorAll(".add-to-do-btn");
const userhabitsSection = document.getElementById("user-habits-section");
const clearDataBtn = document.getElementById("clear-local-btn");

// Check if the user has visited the page before
if (!localStorage.getItem("hasVisited")) {
  const username = prompt("Velkommen til din personlige HabitTracker! Hva heter du?");
  localStorage.setItem("user", username);
  usernameH1.innerHTML = localStorage.getItem("user");
  localStorage.setItem("hasVisited", true);
} else {
  usernameH1.innerHTML = localStorage.getItem("user");
}

// Get stored habits from local storage or set an empty array
const storedHabits = JSON.parse(localStorage.getItem("habits")) || [];
const habits = storedHabits;

// Function to show stored habits
function showStoredHabits(habits) {
  habits.forEach((habitObj) => {
    const newLi = document.createElement("li");
    newLi.classList.add("checkbox-container");
    newLi.innerHTML = `
        <label for="${habitObj.habit}-button">${habitObj.habit}</label>
        <button class="check-habit ${habitObj.finishedHabit ? 'completed' : ''}" id="${habitObj.habit}-button" name="myCheckbox" value="${habitObj.habit}"></button>
        <button class="remove-habit">X</button>
      `;
    userhabitsSection.appendChild(newLi);
  });
}

function clearUserData() {
  localStorage.clear();
  location.reload();
}

clearDataBtn.addEventListener("click", clearUserData);

// Display stored habits
showStoredHabits(habits);

// Add event listeners for add buttons
addButtonList.forEach(function (button) {
  button.addEventListener("click", function (event) {
    event.preventDefault();
    const participantContainer = this.closest(".p-container");
    const inputField = participantContainer.querySelector('input[type="text"]');
    const inputValue = inputField.value.trim();

    if (inputValue !== "") {
      habits.push({habit: inputValue, finishedHabit: false});
      localStorage.setItem("habits", JSON.stringify(habits));

      const toDoList = participantContainer.querySelector(".to-do");
      const newLi = document.createElement("li");
      newLi.classList.add("checkbox-container");
      newLi.innerHTML = `
        <label for="${inputValue}-button">${inputValue}</label>
        <button class="check-habit" id="${inputValue}-button" name="myCheckbox" value="${inputValue}"></button>
        <button class="remove-habit">X</button>
      `;
      toDoList.appendChild(newLi);
      newLi.querySelector(".remove-habit").addEventListener("click", removeHabit);

      inputField.value = "";
    }
  });
});

// Function to remove a habit
function removeHabit(event) {
  const habitLi = event.target.closest("li");
  const habitButton = habitLi.querySelector("button.check-habit");
  const habitValue = habitButton.value;
  const habitIndex = habits.findIndex(habitObj => habitObj.habit === habitValue);

  if (habitIndex > -1) {
    habits.splice(habitIndex, 1);
    localStorage.setItem("habits", JSON.stringify(habits));
  }
  habitLi.remove();
}

// Event listener for removing a habit
userhabitsSection.addEventListener("click", function (event) {
  if (event.target.classList.contains("remove-habit")) {
    removeHabit(event);
  }
});


// Event listener for checking a habit
userhabitsSection.addEventListener("click", function (event) {
  if (event.target.classList.contains("check-habit")) {
    event.target.classList.toggle("completed");
    
    const habitValue = event.target.value;
    const habitIndex = habits.findIndex(habitObj => habitObj.habit === habitValue);

    if (habitIndex > -1) {
      habits[habitIndex].finishedHabit = !habits[habitIndex].finishedHabit;
      localStorage.setItem("habits", JSON.stringify(habits));
    }
  }
});
