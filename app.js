// Get DOM elements
const usernameH1 = document.getElementById("user-name-h1");
const addButtonList = document.querySelectorAll(".add-to-do-btn");
const clearDataBtn = document.getElementById("clear-local-btn");
const getPdfBtn = document.getElementById('get-pdf-btn');
const userhabitsSection = document.getElementById("user-habits-section");
const habitTableBody = document.querySelector(".user-table tbody");


// Check if the user has visited the page before and set their name
function setUserName() {
  if (!localStorage.getItem("hasVisited")) {
    const username = prompt("Velkommen til din personlige HabitTracker! Hva heter du?");
    localStorage.setItem("username", username);
    usernameH1.innerHTML = localStorage.getItem("username");
    localStorage.setItem("hasVisited", true);
  } else {
    usernameH1.innerHTML = localStorage.getItem("username");
  }
}

// Set user's name
setUserName();

//user-data
const username = localStorage.getItem("username");

// Get stored habits from local storage or set it as an empty array
const storedHabits = JSON.parse(localStorage.getItem("habits")) || [];
const habits = storedHabits;

// Function to check if a habit is completed today
function isHabitCompletedToday(habitObj) {
  const today = new Date();
  const currentDate = today.toISOString().slice(0, 10);
  return habitObj.completedDates.includes(currentDate);
}

// Reset habits at midnight and store daily habit data
function resetHabitsAtMidnight() {
  const now = new Date();
  const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const timeToNextMidnight = nextMidnight - now;

  setTimeout(() => {
    const dailyHabits = habits.map((habitObj) => {
      return { habit: habitObj.habit, finishedHabit: habitObj.finishedHabit };
    });
    const storedDailyHabits = JSON.parse(localStorage.getItem("dailyHabits")) || [];
    storedDailyHabits.push({ date: now.toISOString().slice(0, 10), habits: dailyHabits });
    localStorage.setItem("dailyHabits", JSON.stringify(storedDailyHabits));

    habits.forEach((habitObj) => {
      habitObj.finishedHabit = false;
    });
    localStorage.setItem("habits", JSON.stringify(habits));
    location.reload();
    resetHabitsAtMidnight();
  }, timeToNextMidnight);
}

// Call the function to reset habits at midnight
resetHabitsAtMidnight();

// Function to show stored habits
function showStoredHabits(habits) {
  habits.forEach((habitObj) => {
    const newLi = document.createElement("li");
    newLi.classList.add("checkbox-container");
    newLi.innerHTML = `
        <label for="${habitObj.habit}-button">${habitObj.habit}</label>
        <button class="check-habit ${
          isHabitCompletedToday(habitObj) ? "completed" : ""
        }" id="${habitObj.habit}-button" name="myCheckbox" value="${
      habitObj.habit
    }"></button>
        <button class="remove-habit">X</button>
      `;
    userhabitsSection.appendChild(newLi);
  });
}

//Function for retreiving data from localstorage and creating the habit table.
function showHabitTable(habits) {
  habits.forEach((habitObj) => {
    const newRow = document.createElement("tr");
    const habitCell = document.createElement("td");
    habitCell.textContent = habitObj.habit;
    newRow.appendChild(habitCell);

    // Add cells for each day of the week
    for (let i = 0; i < 7; i++) {
      const dayCell = document.createElement("td");
      newRow.appendChild(dayCell);
    }

    habitTableBody.appendChild(newRow);
  });
}

// Function to clear user data
function clearUserData() {
  localStorage.clear();
  location.reload();
}

// Add event listener to clear user data button
clearDataBtn.addEventListener("click", clearUserData);

// Display stored habits and habit-table
showStoredHabits(habits);
showHabitTable(habits);

// Add event listeners for add buttons
// Add event listeners for add buttons
addButtonList.forEach(function (button) {
  button.addEventListener("click", function (event) {
    event.preventDefault();
    const participantContainer = this.closest(".p-container");
    const inputField = participantContainer.querySelector('input[type="text"]');
    const inputValue = inputField.value.trim();

    if (inputValue !== "") {
      // When adding a new habit
      habits.push({habit: inputValue, completedDates: []});

      localStorage.setItem("habits", JSON.stringify(habits));

      const toDoList = userhabitsSection;
      const newLi = document.createElement("li");
      newLi.classList.add("checkbox-container");
      newLi.innerHTML = `
        <label for="${inputValue}-button">${inputValue}</label>
        <button class="check-habit" id="${inputValue}-button" name="myCheckbox" value="${inputValue}"></button>
        <button class="remove-habit">X</button>
      `;
      toDoList.appendChild(newLi);
      newLi.querySelector(".remove-habit").addEventListener("click", removeHabit);

      // Add a new row to the table
      const newRow = document.createElement("tr");
      const newHabitCell = document.createElement("td");
      newHabitCell.textContent = inputValue;
      newRow.appendChild(newHabitCell);
      habitTableBody.appendChild(newRow);

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
    const todaysDate = new Date().toISOString().slice(0, 10);

    if (habitIndex > -1) {
      const dateIndex = habits[habitIndex].completedDates.indexOf(todaysDate);
      if (dateIndex > -1) {
        habits[habitIndex].completedDates.splice(dateIndex, 1);
      } else {
        habits[habitIndex].completedDates.push(todaysDate);
      }
      localStorage.setItem("habits", JSON.stringify(habits));
    }
  }
});

//Generating and working with the pdf
getPdfBtn.addEventListener('click', generatePDF);

function generatePDF() {
  const pdf = new jsPDF();
  const title = `${username} - Habit tracker`;

  pdf.setFontSize(22);
  pdf.setTextColor(0, 0, 0);
  pdf.text(title, 20, 30);

  const xOffset = 20;
  let yOffset = 50;

  habits.forEach((habitObj, index) => {
    const habitText = `${index + 1}. ${habitObj.habit} - ${
      isHabitCompletedToday(habitObj) ? "Completed" : "Not Completed"
    }`;

    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text(habitText, xOffset, yOffset);
    yOffset += 15;
  });

  pdf.save("HabitTracker.pdf");
}


