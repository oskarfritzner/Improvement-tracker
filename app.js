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
    updateTableUI(habits);
    location.reload();
    resetHabitsAtMidnight();
  }, timeToNextMidnight);
}

// Call the function to reset habits at midnight
resetHabitsAtMidnight();

function resetHabitsWeekly() {
  const now = new Date();
  const daysUntilNextMonday = (8 - now.getDay()) % 7;
  const nextMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilNextMonday, 0, 0, 0);
  const timeToNextMonday = nextMonday - now;

  setTimeout(() => {
    // Refresh the UI without clearing the habit data
    updateTableUI(habits);

    // Call the function again to set up the next reset
    resetHabitsWeekly();
  }, timeToNextMonday);
}

// Call the function to reset habits weekly
resetHabitsWeekly();


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

// Function to clear user data
function clearUserData() {
  localStorage.clear();
  location.reload();
}

// Add event listener to clear user data button
clearDataBtn.addEventListener("click", clearUserData);

// Display stored habits and habit-table
showStoredHabits(habits);
updateTableUI(habits);

// Add event listener for add button
addButtonList.forEach(function (button) {
  button.addEventListener("click", function (event) {
    event.preventDefault();
    const participantContainer = this.closest(".p-container");
    const inputField = participantContainer.querySelector('input[type="text"]');
    const inputValue = inputField.value.trim();

    if (inputValue !== "") {
      if(!habits.find(h => h.habit === inputValue)) {

        // When adding a new habit
        habits.push({habit: inputValue, completedDates: [], createdAt: new Date().toISOString()});
  
        localStorage.setItem("habits", JSON.stringify(habits));
  
        const toDoList = userhabitsSection;
        const newLi = document.createElement("li");
        newLi.classList.add("checkbox-container");
        newLi.innerHTML = `
          <label for="${inputValue}-button">${inputValue}</label>
          <div class="habit-btns-div">
          <button class="check-habit habit-btns" id="${inputValue}-button" name="myCheckbox" value="${inputValue}">&#x2713;</button>
          <button class="remove-habit habit-btns">X</button>
          </div>
        `;
        toDoList.appendChild(newLi);
        newLi.querySelector(".remove-habit").addEventListener("click", removeHabit);

        updateTableUI(habits);
  
        inputField.value = "";
      } else {
        alert("Habit is already added.");
      }
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
    const habitObj = habits[habitIndex];
    if (habitObj.completedDates.length <= 1) {
      habits.splice(habitIndex, 1);
      localStorage.setItem("habits", JSON.stringify(habits));
    }
    habitLi.remove();
  }
    // Remove the corresponding row from the table UI
    if (habitTableBody.children[habitIndex]) {
      habitTableBody.children[habitIndex].remove();
    }
  
    updateTableUI(habits);
}

// Event listener for removing a habit
userhabitsSection.addEventListener("click", function (event) {
  if (event.target.classList.contains("remove-habit")) {
    const habitIndex = Array.from(userhabitsSection.children).indexOf(event.target.closest("li"));
    removeHabit(event, habitIndex);
  }
});


// Event listener for checking a habit

function completeHabit(event) {

} 

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
      updateTableUI(habits);
    }
  }
});


//Update Data-table UI
function updateTableUI(habitsArr) {
    // Remove all rows that correspond to removed habits
    Array.from(habitTableBody.children).forEach((row, index) => {
      if (index >= habitsArr.length) {
        row.remove();
      }
    });

  habitsArr.forEach((habitObj, habitIndex) => {
    let habitRow = habitTableBody.children[habitIndex];

    if (!habitRow) {
      // Create a new row if it doesn't exist
      habitRow = document.createElement("tr");
      const newHabitCell = document.createElement("td");
      newHabitCell.textContent = habitObj.habit;
      habitRow.appendChild(newHabitCell);
      habitTableBody.appendChild(habitRow);

      // Add cells for each day of the week
      for (let i = 0; i < 7; i++) {
        const dayCell = document.createElement("td");
        habitRow.appendChild(dayCell);
      }
    }

    // Calculate the start date of the current week (Monday)
    const today = new Date();
    const currentWeekday = today.getDay() === 0 ? 7 : today.getDay();
    const daysSinceMonday = 1 - currentWeekday;
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysSinceMonday);
    const startOfWeekFormatted = startOfWeek.toISOString().slice(0, 10);

    // Update cells for each day of the week
    for (let i = 0; i < 7; i++) {
      const dayCell = habitRow.children[i + 1];

      // Check if habit is completed on this day
      const daysSinceMonday = i - currentWeekday + 2;
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysSinceMonday);
      const formattedDate = date.toISOString().slice(0, 10);
      const isCompleted = habitObj.completedDates.includes(formattedDate);
      const habitCreationDate = habitObj.createdAt.slice(0, 10);

      // Check if date is between the start of the current week and today (inclusive)
      if (formattedDate >= startOfWeekFormatted && formattedDate <= today.toISOString().slice(0, 10)) {
        const newContent = isCompleted ? "Completed" : "X";

        if (dayCell.textContent !== newContent) {
          // Add the fade class to smoothly hide the content
          dayCell.classList.add("fade");

          // Wait for the fade-out transition to complete
          setTimeout(() => {
            dayCell.textContent = newContent;

            // Remove the fade class to smoothly show the content
            dayCell.classList.remove("fade");
          }, 500); // Match this duration with the transition duration in the CSS
        }
      } else {
        dayCell.textContent = "";
      }
    }
  });
}



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


