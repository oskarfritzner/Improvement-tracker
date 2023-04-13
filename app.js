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

// Call the function initially to set the correct visibility for the quotes container
updateQuotesContainerVisibility();

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
    <div class="habit-div">
    <button class="remove-habit habit-btns">X</button>
    <label for="${habitObj.habit}-button">${habitObj.habit}</label>
    </div>
    <div class="complete-div">
    <input type="number" class="habit-time" min="0" placeholder="min"/>
    <button class="check-habit habit-btns ${
      isHabitCompletedToday(habitObj) ? "completed" : ""
    }" id="${habitObj.habit}-button" name="myCheckbox" value="${habitObj.habit}">&#x2713;</button>
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

  if (habits.length === 8) {
    alert("Studies have shown that its better to focus on changing smaller amounts of time. We therefore only allow maximum 8 habits at the time.")
    return inputValue.value = "";
  }

  if (inputValue !== "") {
    if (!habits.find((h) => h.habit === inputValue)) {
      habits.push({
        habit: inputValue,
        completedDates: [],
        completedTime: {},
        createdAt: new Date().toISOString(),
      });

      localStorage.setItem("habits", JSON.stringify(habits));

      const toDoList = userhabitsSection;
      const newLi = document.createElement("li");
      newLi.classList.add("checkbox-container");
      newLi.innerHTML = `
      <div class="habit-div">
      <button class="remove-habit habit-btns">X</button>
      <label for="${inputValue}-button">${inputValue}</label>
      </div>
      <div class="complete-div">
      <input type="number" class="habit-time" min="0" placeholder="min"/>
      <button class="check-habit habit-btns" id="${inputValue}-button" name="myCheckbox" value="${inputValue}">&#x2713;</button>
      </div>
      `;      
      toDoList.appendChild(newLi);
      newLi.querySelector(".remove-habit").addEventListener("click", removeHabit);

      updateTableUI(habits);
      updateQuotesContainerVisibility();

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
    habits.splice(habitIndex, 1);
    localStorage.setItem("habits", JSON.stringify(habits));
    habitLi.remove();
  }
  
  // Remove the corresponding row from the table UI
  if (habitTableBody.children[habitIndex]) {
    habitTableBody.children[habitIndex].remove();
  }

  updateTableUI(habits);
  updateQuotesContainerVisibility();
}

// Function for completing habit

function completeHabit(event) {
  if (event.target.classList.contains("check-habit")) {
    event.target.classList.toggle("completed");

    const habitValue = event.target.value;
    const habitIndex = habits.findIndex(habitObj => habitObj.habit === habitValue);
    const todaysDate = new Date().toISOString().slice(0, 10);

    if (habitIndex > -1) {
      const timeInput = event.target.closest('.checkbox-container').querySelector('.habit-time');
      const timeSpent = parseInt(timeInput.value, 10) || 0;

      const dateIndex = habits[habitIndex].completedDates.indexOf(todaysDate);
      if (dateIndex > -1) {
        habits[habitIndex].completedDates.splice(dateIndex, 1);
        delete habits[habitIndex].completedTime[todaysDate];
      } else {
        habits[habitIndex].completedDates.push(todaysDate);
        habits[habitIndex].completedTime[todaysDate] = timeSpent;
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

    // Create a new row if it doesn't exist
    if (!habitRow) {
      habitRow = document.createElement("tr");
      habitTableBody.appendChild(habitRow);

      // Create cells for the new row
      for (let i = 0; i < 8; i++) {
        const cell = document.createElement("td");
        habitRow.appendChild(cell);
      }
    }

    // Set the habit name
    habitRow.children[0].textContent = habitObj.habit;

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    const startOfWeekFormatted = startOfWeek.toISOString().slice(0, 10);

    // Update habit completion status for each day
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(dayDate.getDate() + i);
      const formattedDate = dayDate.toISOString().slice(0, 10);

      const dayCell = habitRow.children[i + 1];

      const isCompleted = habitObj.completedDates.includes(formattedDate);

      if (formattedDate >= startOfWeekFormatted && formattedDate <= today.toISOString().slice(0, 10)) {
        const newContent = isCompleted ? `Completed (${habitObj.completedTime[formattedDate] || 0} min)` : "X";

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
  const pdf = new jsPDF('p', 'pt', 'a4');
  pdf.html(document.querySelector('.user-table-container'), {
    callback: function (pdf) {
      const timePerHabit = calculateTimePerHabit();
      const userName = localStorage.getItem("username");

      // Add personalized title
      pdf.setFontSize(22);
      pdf.text(40, 40, `${userName}'s Weekly Habit Review`);

      // Add total time spent on habits
      pdf.setFontSize(12);
      let habitTotalYPosition = 80;
      for (const [habit, time] of Object.entries(timePerHabit)) {
        pdf.text(40, habitTotalYPosition, `${habit}: ${time}`);
        habitTotalYPosition += 15;
      }

      pdf.save('Weekly_Tracker.pdf');
    },
    x: 0,
    y: 80,
    html2canvas: { scale: 0.49},
  });
}

//calculate the time per habit

function calculateTimePerHabit() {
  const habitRows = document.querySelectorAll('.user-table tbody tr');
  const habitTimes = {};

  for (const habitRow of habitRows) {
    const habitName = habitRow.querySelector('td:first-child').textContent.trim();
    const timeCells = habitRow.querySelectorAll('td:not(:first-child)');
    let habitTotalMinutes = 0;

    for (const timeCell of timeCells) {
      const timeText = timeCell.textContent.trim();
      if (timeText.startsWith('Completed')) {
        const minutes = parseInt(timeText.match(/\d+/)[0], 10);
        habitTotalMinutes += minutes;
      }
    }

    const habitTotalHours = Math.floor(habitTotalMinutes / 60);
    const remainingMinutes = habitTotalMinutes % 60;

    habitTimes[habitName] = `${habitTotalHours}h ${remainingMinutes}m`;
  }

  return habitTimes;
}
const total = calculateTimePerHabit();
console.log(total);

function updateQuotesContainerVisibility() {
  const pContainer = document.querySelector('.p-container');
  const goalsContainer = document.querySelector('.goals-container');
  const quotesContainer = document.querySelector('.quotes-container');

  if(habits.length <= 3) {
    quotesContainer.style.display = "none";
  } else {
    quotesContainer.style.display = "block";
  }
}


// Add an event listener to update the visibility when the window is resized
window.addEventListener('resize', updateQuotesContainerVisibility);


