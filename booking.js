// Full booking.js content snippet starts here:

// State variables
let bookingStep = 1;
let selectedCounselor = null;
let selectedDate = null;
let selectedTime = null;
let bookingReference = null;

const counselors = [
  {
    id: 1,
    name: "Dr. Priya Sharma",
    title: "Licensed Clinical Psychologist",
    specialization: ["Academic Stress", "Anxiety Disorders", "Depression", "Cultural Counseling"],
    institution: "University of Kashmir",
    experience: 8,
    rating: 4.9,
    totalSessions: 1247,
    languages: ["English", "Hindi", "Kashmiri"],
    availableSlots: ["Monday", "Wednesday", "Friday"],
    image: "👩‍⚕️",
  },
  // Other counselors...
];

// The demo offers weekday choices from each counselor's stated schedule.
// A real deployment should load availability from the counseling service.
function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getNextAvailableDate(counselor, start = new Date()) {
  const availableDays = new Set(counselor.availableSlots);
  for (let offset = 0; offset < 46; offset++) {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + offset);
    const isToday = offset === 0;
    if (availableDays.has(date.toLocaleDateString("en-US", { weekday: "long" })) &&
        (!isToday || start.getHours() < 16)) return dateKey(date);
  }
  return "";
}

function getAvailableTimeSlots(date, counselor) {
  if (!date) return [];
  const parsedDate = parseDateKey(date);
  const weekday = parsedDate.toLocaleDateString("en-US", { weekday: "long" });
  if (!counselor.availableSlots.includes(weekday)) return [];
  const slots = [
    { time: "9:00 AM", hour: 9 }, { time: "10:00 AM", hour: 10 },
    { time: "11:00 AM", hour: 11 }, { time: "2:00 PM", hour: 14 },
    { time: "3:00 PM", hour: 15 }, { time: "4:00 PM", hour: 16 }
  ];
  const today = dateKey(new Date());
  return slots.map(slot => ({
    time: slot.time,
    available: date !== today || new Date().getHours() < slot.hour
  }));
}

const bookingRoot = document.getElementById("booking-root");

function clearRoot() {
  bookingRoot.innerHTML = "";
}

function randomBookingReference() {
  return "CM" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

function createElement(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const key in attrs) {
    if (key.startsWith("on") && typeof attrs[key] === "function") {
      el.addEventListener(key.substring(2).toLowerCase(), attrs[key]);
    } else if (key === "className") {
      el.className = attrs[key];
    } else {
      el.setAttribute(key, attrs[key]);
    }
  }
  children.forEach(child => {
    if (typeof child === "string") {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  });
  return el;
}

function createStepIndicator(currentStep) {
  const container = createElement("div", { style: "display:flex; justify-content:center; margin-bottom: 40px; gap: 12px;" });
  [1, 2, 3].forEach(step => {
    const circle = createElement("div", {
      style: `
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: ${currentStep >= step ? "#527A74" : "#DCE4DE"};
        color: ${currentStep >= step ? "white" : "#687A73"};
        font-weight: 700;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.3s ease;
        cursor: default;
      `,
    }, step.toString());
    container.appendChild(circle);
    if (step < 3) {
      container.appendChild(createElement("div", {
        style: `width: 60px; height: 2px; background-color: ${currentStep > step ? "#527A74" : "#DCE4DE"};`
      }));
    }
  });
  return container;
}

// Step 1: Select counselor
function renderStep1() {
  clearRoot();
  bookingStep = 1;

  bookingRoot.appendChild(createStepIndicator(1));

  const title = createElement("h2", { style: "font-size: 2rem; font-weight: 700; color: #344943; margin-bottom: 12px; text-align:center;" }, "Choose Your Counselor");
  bookingRoot.appendChild(title);

  const description = createElement("p", { style: "color: #687A73; font-size: 1.1rem; text-align:center; margin-bottom: 40px;" }, "Preview the counseling booking flow. This demo does not submit or reserve a real appointment.");
  bookingRoot.appendChild(description);

  const grid = createElement("div", { style: "display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px;" });

  counselors.forEach(c => {
    const card = createElement("div", {
      style: `
        background: white;
        border-radius: 16px;
        border: 2px solid #DCE4DE;
        padding: 24px;
        cursor: pointer;
        transition: all 0.3s ease;
      `,
      onmouseenter: () => {
        card.style.borderColor = "#527A74";
        card.style.boxShadow = "0 8px 24px rgba(63, 98, 93, 0.15)";
        card.style.transform = "translateY(-4px)";
      },
      onmouseleave: () => {
        card.style.borderColor = "#DCE4DE";
        card.style.boxShadow = "none";
        card.style.transform = "translateY(0)";
      },
      onclick: () => {
        selectedCounselor = c;
        bookingStep = 2;
        renderStep2();
      }
    });

    // ... Additional content like name, title, etc
    const header = createElement("div", { style: "display: flex; align-items: center; gap: 16px; margin-bottom: 16px;" });
    const img = createElement("div", { style: "font-size: 3rem; background: linear-gradient(135deg, #E8F0EC, #DCE4DE); border-radius: 50%; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;" }, c.image);
    const info = createElement("div");
    info.appendChild(createElement("h3", { style: "font-size: 1.25rem; font-weight: 600; color: #344943; margin-bottom: 4px;" }, c.name));
    info.appendChild(createElement("p", { style: "color: #527A74; font-weight: 500; margin-bottom: 4px;" }, c.title));
    info.appendChild(createElement("div", { style: "display: flex; align-items: center; gap: 8px; margin-bottom: 8px;" }, createElement("span", {}, c.institution, " Campus")));

    header.appendChild(img);
    header.appendChild(info);
    card.appendChild(header);

    // ... (Rest of specialization, rating, availability etc)

    grid.appendChild(card);
  });

  bookingRoot.appendChild(grid);
}

// Step 2: Select date and time
function renderStep2() {
  clearRoot();

  const validDates = getNextAvailableDate(selectedCounselor);
  if (!selectedDate) selectedDate = validDates;

  bookingRoot.appendChild(createStepIndicator(2));

  const title = document.createElement("h2");
  title.textContent = "Select Date & Time";
  bookingRoot.appendChild(title);

  const description = document.createElement("p");
  description.textContent = `Choose a date and time for a demo session with ${selectedCounselor.name}. This prototype does not submit or reserve an appointment.`;
  bookingRoot.appendChild(description);

  const container = document.createElement("div");
  container.className = "grid-columns-2";

  const counselorCard = document.createElement("div");
  counselorCard.className = "card";

  const counselorInfo = document.createElement("div");
  counselorInfo.innerHTML = `
    <h3>Your Selected Counselor</h3>
    <p><strong>${selectedCounselor.name}</strong></p>
    <p>${selectedCounselor.title}</p>
    <div class='session-details'>
      <p><strong>Session Details:</strong></p>
      <ul>
        <li>Duration: 50 minutes</li>
        <li>Format: In-person or Video call</li>
        <li>Anonymous reference ID will be provided</li>
        <li>No personal information required</li>
      </ul>
    </div>
  `;
  counselorCard.appendChild(counselorInfo);

  const changeBtn = createElement("button", {
      style: `
        width: 100%;
        padding: 12px;
        background: #607E66;
        color: white;
        font-weight: 600;
        border: none;
        border-radius: 8px;
        cursor: pointer;
      `,
  }, "Change Counselor");
  changeBtn.addEventListener("click", () => {
    bookingStep = 1;
    selectedCounselor = null;
    selectedDate = null;
    selectedTime = null;
    renderStep1();
  });
  counselorCard.appendChild(changeBtn);
  container.appendChild(counselorCard);

  const timeSlotsCard = document.createElement("div");
  timeSlotsCard.className = "card";

  const dateLabel = document.createElement("label");
  dateLabel.textContent = "Select a date:";
  dateLabel.htmlFor = "booking-date";
  timeSlotsCard.appendChild(dateLabel);

  const dateDropdown = document.createElement("input");
  dateDropdown.type = "date";
  dateDropdown.id = "booking-date";
  dateDropdown.name = "booking-date";
  dateDropdown.min = dateKey(new Date());
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 45);
  dateDropdown.max = dateKey(maxDate);
  dateDropdown.value = selectedDate;
  dateDropdown.setAttribute("aria-describedby", "booking-date-help");
  const dateHelp = document.createElement("p");
  dateHelp.id = "booking-date-help";
  dateHelp.textContent = `This demo shows weekday dates through ${maxDate.toLocaleDateString()}. Counselor schedule: ${selectedCounselor.availableSlots.join(", ")}.`;
  timeSlotsCard.appendChild(dateHelp);
  dateDropdown.addEventListener("change", e => {
    selectedDate = e.target.value;
    selectedTime = null;
    renderStep2();
  });
  timeSlotsCard.appendChild(dateDropdown);

  const timesContainer = document.createElement("div");
  timesContainer.className = "grid-columns-2 grid-columns-auto-fill-300";

  let selectedTimeLocal = selectedTime;

  const slotsForDate = getAvailableTimeSlots(selectedDate, selectedCounselor);
  if (!slotsForDate.length) {
    const unavailableMessage = document.createElement("p");
    unavailableMessage.className = "date-unavailable-message";
    unavailableMessage.textContent = selectedDate
      ? `No demo sessions are listed for this day. Choose ${selectedCounselor.availableSlots.join(", ")}.`
      : "Choose a date to see session times.";
    timesContainer.appendChild(unavailableMessage);
  }

  slotsForDate.forEach(slot => {
    const btn = createElement("button", {
      className: "time-slot-button",
      disabled: !slot.available,
      "aria-pressed": selectedTimeLocal === slot.time ? "true" : "false",
      style: `
        border: 1px solid #DCE4DE;
        padding: 10px;
        margin: 5px;
        background: ${selectedTimeLocal === slot.time ? "#607E66" : "#FFFEFB"};
        color: ${selectedTimeLocal === slot.time ? "white" : "#344943"};
        cursor: ${slot.available ? "pointer" : "not-allowed"};
        border-radius: 6px;
      `,
    }, slot.time);

    btn.addEventListener("click", () => {
      if (!slot.available) return;
      selectedTime = slot.time;
      selectedTimeLocal = slot.time;
      renderStep2();
    });

    timesContainer.appendChild(btn);
  });

  timeSlotsCard.appendChild(timesContainer);

  const continueButton = createElement("button", {
    style: `
      margin-top: 16px;
      padding: 12px;
      background: #527A74;
      color: white;
      border: none;
      border-radius: 8px;
      display: ${selectedDate && selectedTime ? "block" : "none"};
      cursor: pointer;
    `,
  }, "Continue");
  continueButton.addEventListener("click", () => {
    bookingStep = 3;
    renderStep3();
  });
  timeSlotsCard.appendChild(continueButton);

  container.appendChild(timeSlotsCard);

  bookingRoot.appendChild(container);
}

// Step 3: Confirm Booking
function renderStep3() {
  clearRoot();

  bookingRoot.appendChild(createStepIndicator(3));

  bookingReference = randomBookingReference();

  const confirmationContainer = document.createElement("div");
  confirmationContainer.style.maxWidth = "600px";
  confirmationContainer.style.margin = "0 auto";
  confirmationContainer.style.textAlign = "center";

  confirmationContainer.appendChild(createElement("h2", {
    style: "font-size: 2rem; font-weight: 700; color: #344943; margin-bottom: 16px;"
  }, "Demo Booking Summary"));

  confirmationContainer.appendChild(createElement("p", {
    style: "color: #687A73; font-size: 1.1rem; margin-bottom: 32px;"
  }, "This is a preview only. No appointment has been scheduled or sent to the counselor."));

  const details = createElement("div", {
    style: "background: #F4F6F2; padding: 24px; border-radius: 12px; text-align: left; margin-bottom: 32px;"
  });

  details.appendChild(createElement("h3", {
    style: "font-size: 1.1rem; font-weight: 600; color: #344943; margin-bottom: 16px;"
  }, "Session Details"));

  const infoList = createElement("div", { style: "display: grid; gap: 12px;" });
  infoList.appendChild(createElement("div", {}, `Counselor: ${selectedCounselor.name}`));
  infoList.appendChild(createElement("div", {}, `Date: ${selectedDate}`));
  infoList.appendChild(createElement("div", {}, `Time: ${selectedTime}`));
  infoList.appendChild(createElement("div", {}, `Reference ID: `, createElement("span", {
    style: "background: #527A74; color: white; padding: 2px 8px; border-radius: 6px; font-family: monospace; font-weight: 600;"
  }, bookingReference)));
  infoList.appendChild(createElement("div", {}, "Duration: 50 minutes"));

  details.appendChild(infoList);

  confirmationContainer.appendChild(details);

  const infoBox = createElement("div", {
    style: "background: #E8F0EC; padding: 16px; border-radius: 8px; margin-bottom: 24px; text-align: left;"
  });

  infoBox.appendChild(createElement("h4", {
    style: "font-size: 14px; font-weight: 600; color: #3F625D; margin-bottom: 8px;"
  }, "About this demo"));

  const infoList2 = createElement("ul", {
    style: "font-size: 13px; color: #3F625D; margin: 0; padding-left: 16px;"
  });

  ["You can use this reference ID to review the demo summary", "No appointment is reserved by this prototype", "Contact the counseling service directly to request a real session"].forEach(txt => {
    infoList2.appendChild(createElement("li", {}, txt));
  });

  infoBox.appendChild(infoList2);

  confirmationContainer.appendChild(infoBox);

  const btnWrapper = createElement("div", { style: "display: flex; gap: 12px; justify-content: center;" });

  const bookAnotherBtn = createElement("button", {
    style: "padding: 12px 24px; background: #687A73; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;"
  }, "Book Another Session");
  bookAnotherBtn.onclick = () => {
    selectedCounselor = null;
    selectedDate = null;
    selectedTime = null;
    bookingReference = null;
    bookingStep = 1;
    renderStep1();
  };
  btnWrapper.appendChild(bookAnotherBtn);

  const contactBtn = createElement("button", {
    style: "padding: 12px 24px; background: #527A74; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;"
  }, "View Support Resources");
  contactBtn.onclick = () => { window.location.href = "index.html#resources"; };
  btnWrapper.appendChild(contactBtn);

  confirmationContainer.appendChild(btnWrapper);

  bookingRoot.appendChild(confirmationContainer);
}

// Initial render
renderStep1();
