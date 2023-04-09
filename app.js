const putUserNameOutput = document.getElementById("user-name-h2");

if (!localStorage.getItem("hasVisited")) {
  let username = prompt("Velkommen til din personlige HabitTracker! Hva heter du?");

  localStorage.setItem("user", username);
  putUserNameOutput.innerHTML = localStorage.getItem("user");
  localStorage.setItem("hasVisited", true);
} else {
  putUserNameOutput.innerHTML = localStorage.getItem("user");
}

const addButtonList = document.querySelectorAll(".add-to-do-btn");
const userhabitsSection = document.getElementById("user-habits-section");

const storedHabits = JSON.parse(localStorage.getItem("habits")) || [];
const habits = storedHabits;

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


showStoredHabits(habits);

addButtonList.forEach(function (button) {
  button.addEventListener("click", function (event) {
    event.preventDefault();
    const participantContainer = this.closest(".p-container");
    const inputField = participantContainer.querySelector('input[type="text"]');
    const inputValue = inputField.value.trim();

    if (inputValue !== "") {
      habits.push({habit:inputValue, finishedHabit: false});
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


userhabitsSection.addEventListener("click", function (event) {
  if (event.target.classList.contains("remove-habit")) {
    removeHabit(event);
  }
});

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
