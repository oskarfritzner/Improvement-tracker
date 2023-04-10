// DOM elements
const usernameH1 = document.getElementById("user-name-h1");
const addButtonList = document.querySelectorAll(".add-to-do-btn");
const clearDataBtn = document.getElementById("clear-local-btn");
const getPdfBtn = document.getElementById('get-pdf-btn');
const userhabitsSection = document.getElementById("user-habits-section");
const habitTableBody = document.querySelector(".user-table tbody");

// Set user's name
setUserName();

// User-data
const username = localStorage.getItem("username");

// Get stored habits from local storage or set it as an empty array
const storedHabits = JSON.parse(localStorage.getItem("habits")) || [];
const habits = storedHabits;

// Reset habits at midnight and store daily habit data
resetHabitsAtMidnight();

// Reset habits weekly
resetHabitsWeekly();

// Display stored habits and habit-table
showStoredHabits(habits);
updateTableUI(habits);

// Event listeners
addButtonList.forEach((button) => button.addEventListener("click", addHabit));
clearDataBtn.addEventListener("click", clearUserData);
userhabitsSection.addEventListener("click", (event) => {
  if (event.target.classList.contains("remove-habit")) removeHabit(event);
  if (event.target.classList.contains("check-habit")) completeHabit(event);
});

getPdfBtn.addEventListener('click', generatePDF);



// Functions


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

function isHabitCompletedToday(habitObj) {
  const today = new Date();
  const currentDate = today.toISOString().slice(0, 10);
  return habitObj.completedDates.includes(currentDate);
}

//Reset habits to not completed at midnight

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

//Reset Weekly Tracker each week

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

//ShowTheStoredHabits from localStorage

function showStoredHabits(habits) {
  habits.forEach((habitObj) => {
    const newLi = document.createElement("li");
    newLi.classList.add("checkbox-container");
    newLi.innerHTML = `
        <label for="${habitObj.habit}-button">${habitObj.habit}</label>
        <div class="habit-btns-div">
          <button class="check-habit habit-btns ${
            isHabitCompletedToday(habitObj) ? "completed" : ""
          }" id="${habitObj.habit}-button" name="myCheckbox" value="${
      habitObj.habit
    }">&#x2713;</button>
          <button class="remove-habit habit-btns">X</button>
        </div>
      `;
    userhabitsSection.appendChild(newLi);
  });
}


//Function that clears userdata on btn click

function clearUserData() {
  localStorage.clear();
  location.reload();
}

// Function to add a habit

function addHabit(event) {
  event.preventDefault();
  const participantContainer = event.target.closest(".p-container");
  const inputField = participantContainer.querySelector('input[type="text"]');
  const inputValue = inputField.value.trim();

  if (inputValue !== "") {
    if (!habits.find((h) => h.habit === inputValue)) {
      habits.push({
        habit: inputValue,
        completedDates: [],
        createdAt: new Date().toISOString(),
      });

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
}

//Function to remove habit thats targeted by the user

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

//Function for completing habit. 

function completeHabit(event) {
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
}


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

            // Removes the fade class to smoothly show the content
            dayCell.classList.remove("fade");
          }, 300); // Matches this duration with the transition duration in the CSS
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


