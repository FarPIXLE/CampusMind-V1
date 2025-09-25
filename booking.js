const counselors = [
  {
    id: '1',
    name: 'Dr. Priya Sharma',
    title: 'Licensed Clinical Psychologist',
    specialization: ['Academic Stress', 'Anxiety Disorders', 'Depression', 'Cultural Counseling'],
    institution: 'University of Kashmir',
    experience: '8+ years',
    rating: 4.9,
    totalSessions: 1247,
    languages: ['English', 'Hindi', 'Kashmiri'],
    availableSlots: ['Monday', 'Wednesday', 'Friday'],
    image: '👩‍⚕️'
  },
  {
    id: '2',
    name: 'Dr. Rajesh Kumar',
    title: 'Counseling Psychologist',
    specialization: ['Student Counseling', 'Career Guidance', 'Social Anxiety', 'Relationship Issues'],
    institution: 'University of Jammu',
    experience: '12+ years',
    rating: 4.8,
    totalSessions: 2156,
    languages: ['English', 'Hindi', 'Urdu', 'Dogri'],
    availableSlots: ['Tuesday', 'Thursday', 'Saturday'],
    image: '👨‍⚕️'
  },
  {
    id: '3',
    name: 'Dr. Meera Devi',
    title: 'Psychiatric Social Worker',
    specialization: ['Trauma Counseling', 'Family Therapy', 'Addiction Counseling', 'Crisis Intervention'],
    institution: 'NIT Srinagar',
    experience: '6+ years',
    rating: 4.7,
    totalSessions: 892,
    languages: ['English', 'Hindi', 'Kashmiri'],
    availableSlots: ['Monday', 'Tuesday', 'Thursday'],
    image: '👩‍⚕️'
  },
  {
    id: '4',
    name: 'Dr. Arjun Singh',
    title: 'Clinical Psychologist',
    specialization: ['Men\'s Mental Health', 'Sports Psychology', 'Performance Anxiety', 'Behavioral Therapy'],
    institution: 'SMVD University',
    experience: '10+ years',
    rating: 4.8,
    totalSessions: 1678,
    languages: ['English', 'Hindi', 'Punjabi'],
    availableSlots: ['Wednesday', 'Friday', 'Saturday'],
    image: '👨‍⚕️'
  }
];

// Updated timeSlots including multiple dates with available/unavailable times
const timeSlots = [
  { id: '1', time: '9:00 AM', date: '2025-09-24', available: true },
  { id: '2', time: '10:00 AM', date: '2025-09-24', available: true },
  { id: '3', time: '11:00 AM', date: '2025-09-24', available: false },
  { id: '4', time: '2:00 PM', date: '2025-09-24', available: true },
  { id: '5', time: '3:00 PM', date: '2025-09-24', available: true },
  { id: '6', time: '4:00 PM', date: '2025-09-24', available: false },

  { id: '7', time: '9:00 AM', date: '2025-09-25', available: true },
  { id: '8', time: '10:00 AM', date: '2025-09-25', available: true },
  { id: '9', time: '11:00 AM', date: '2025-09-25', available: true },
  { id: '10', time: '2:00 PM', date: '2025-09-25', available: false },
  { id: '11', time: '3:00 PM', date: '2025-09-25', available: true },
  { id: '12', time: '4:00 PM', date: '2025-09-25', available: true },

  { id: '13', time: '9:00 AM', date: '2025-09-26', available: true },
  { id: '14', time: '10:00 AM', date: '2025-09-26', available: false },
  { id: '15', time: '11:00 AM', date: '2025-09-26', available: true },
  { id: '16', time: '2:00 PM', date: '2025-09-26', available: true },
  { id: '17', time: '3:00 PM', date: '2025-09-26', available: true },
  { id: '18', time: '4:00 PM', date: '2025-09-26', available: true },

  { id: '19', time: '9:00 AM', date: '2025-09-27', available: true },
  { id: '20', time: '10:00 AM', date: '2025-09-27', available: true },
  { id: '21', time: '11:00 AM', date: '2025-09-27', available: true },
  { id: '22', time: '2:00 PM', date: '2025-09-27', available: true },
  { id: '23', time: '3:00 PM', date: '2025-09-27', available: true },
  { id: '24', time: '4:00 PM', date: '2025-09-27', available: false },
];

// State variables
let bookingStep = 1;
let selectedCounselor = null;
let selectedDate = '';
let selectedTime = '';
let bookingReference = '';

const root = document.getElementById('booking-root');

function clearRoot() {
  root.innerHTML = '';
}

function randomBookingReference() {
  return 'CM' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

function createElement(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const key in attrs) {
    if (key.startsWith('on') && typeof attrs[key] === 'function') {
      el.addEventListener(key.substring(2).toLowerCase(), attrs[key]);
    } else if (key === 'className') {
      el.className = attrs[key];
    } else {
      el.setAttribute(key, attrs[key]);
    }
  }
  children.forEach(child => {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  });
  return el;
}

// Render helpers for each step
function renderStepIndicator() {
  const container = createElement('div', {style: 'display: flex; justify-content: center; margin-bottom: 40px;'});
  const indicatorWrapper = createElement('div', {style: 'display: flex; align-items: center; gap: 12px;'});
  [1, 2, 3].forEach(step => {
    const circle = createElement('div', {
      style: `
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: ${bookingStep >= step ? '#2563eb' : '#e5e7eb'};
        color: ${bookingStep >= step ? 'white' : '#6b7280'};
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 14px;
      `
    }, bookingStep > step ? '✔' : step.toString());
    indicatorWrapper.appendChild(circle);
    if (step < 3) {
      indicatorWrapper.appendChild(createElement('div', {style: `
        width: 60px;
        height: 2px;
        background: ${bookingStep > step ? '#2563eb' : '#e5e7eb'};
      `}));
    }
  });
  container.appendChild(indicatorWrapper);
  root.appendChild(container);
}

function renderStep1() {
  clearRoot();
  renderStepIndicator();

  const title = createElement('h2', {style: 'font-size: 2rem; font-weight: 700; color: #111827; margin-bottom: 12px; text-align: center;'}, 'Choose Your Counselor');
  const description = createElement('p', {style: 'color: #6b7280; font-size: 1.1rem; text-align: center; margin-bottom: 40px;'}, 
    'All sessions are completely anonymous. Select a counselor based on your needs and preferences.');
  root.appendChild(title);
  root.appendChild(description);

  const grid = createElement('div', {style: 'display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px;'});

  counselors.forEach(c => {
    const card = createElement('div', {
      style: `
        background: white;
        border-radius: 16px;
        border: 2px solid #e5e7eb;
        padding: 24px;
        cursor: pointer;
        transition: all 0.3s ease;
      `
    });
    card.addEventListener('mouseenter', () => {
      card.style.borderColor = '#2563eb';
      card.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.15)';
      card.style.transform = 'translateY(-4px)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.borderColor = '#e5e7eb';
      card.style.boxShadow = 'none';
      card.style.transform = 'translateY(0)';
    });
    card.addEventListener('click', () => {
      selectedCounselor = c;
      bookingStep = 2;
      renderStep2();
    });

    const header = createElement('div', {style: 'display: flex; align-items: center; gap: 16px; margin-bottom: 16px;'});
    const img = createElement('div', {
      style: `
        font-size: 3rem;
        background: linear-gradient(135deg, #dbeafe, #bfdbfe);
        border-radius: 50%;
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
      `
    }, c.image);

    const info = createElement('div', {});
    const name = createElement('h3', {style: 'font-size: 1.25rem; font-weight: 600; color: #111827; margin-bottom: 4px;'}, c.name);
    const title = createElement('p', {style: 'color: #2563eb; font-weight: 500; margin-bottom: 4px;'}, c.title);
    const location = createElement('div', {style: 'display: flex; align-items: center; gap: 8px; margin-bottom: 8px;'}, 
      createElement('span', {}, '📍 ' + c.institution + ' Campus'));

    const ratingWrapper = createElement('div', {style: 'display: flex; align-items: center; gap: 16px; margin-bottom: 8px;'});
    const rating = createElement('div', {style: 'display: flex; align-items: center; gap: 4px; font-weight:600; color:#111827;'}, `⭐ ${c.rating}`);
    const sessions = createElement('span', {style: 'color: #6b7280; font-size: 14px;'}, `${c.totalSessions} sessions`);
    const experience = createElement('span', {style: 'color: #6b7280; font-size: 14px;'}, c.experience);

    ratingWrapper.appendChild(rating);
    ratingWrapper.appendChild(sessions);
    ratingWrapper.appendChild(experience);

    info.appendChild(name);
    info.appendChild(title);
    info.appendChild(location);
    info.appendChild(ratingWrapper);

    header.appendChild(img);
    header.appendChild(info);
    card.appendChild(header);

    const specHeader = createElement('h4', {style: 'font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 8px;'}, 'Specializations:');
    const specList = createElement('div', {style: 'display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px;'});

    c.specialization.forEach(spec => {
      const specItem = createElement('span', {
        style: `
          background: #eff6ff;
          color: #2563eb;
          padding:  '4px 8px';
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        `
      }, spec);
      specList.appendChild(specItem);
    });
    card.appendChild(specHeader);
    card.appendChild(specList);

    const langHeader = createElement('h4', {style: 'font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 8px;'}, 'Languages:');
    const langList = createElement('div', {style: 'display: flex; gap: 8px; margin-bottom: 16px;'});
    c.languages.forEach(lang => {
      const langItem = createElement('span', {
        style: `
          background: #f3f4f6;
          color: #4b5563;
          padding:  '2px 8px';
          border-radius: 4px;
          font-size: 12px;
        `
      }, lang);
      langList.appendChild(langItem);
    });
    card.appendChild(langHeader);
    card.appendChild(langList);

    const availability = createElement('div', {
      style: `
        background: #f9fafb;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 16px;
      `
    });
    const availabilityHeader = createElement('h4', {style: 'font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 6px;'}, 'Available Days:');
    const availabilityText = createElement('p', {style: 'font-size: 13px; color: #4b5563;'}, c.availableSlots.join(', '));

    availability.appendChild(availabilityHeader);
    availability.appendChild(availabilityText);
    card.appendChild(availability);

    const bookButton = createElement('button', {
      style: `
        width: 100%;
        padding: 12px;
        background: #2563eb;
        color: white;
        font-weight: 600;
        border: none;
        border-radius: 8px;
        cursor: pointer;
      `
    }, `Book with ${c.name.split(' ')[1]}`);
    bookButton.addEventListener('click', () => {
      selectedCounselor = c;
      bookingStep = 2;
      renderStep2();
    });
    card.appendChild(bookButton);

    grid.appendChild(card);
  });

  root.appendChild(grid);
}

function renderStep2() {
  clearRoot();
  renderStepIndicator();

  const title = createElement('h2', {style: 'font-size: 2rem; font-weight: 700; color: #111827; margin-bottom: 12px; text-align: center;'}, 'Select Date & Time');
  const description = createElement('p', {style: 'color: #6b7280; font-size: 1.1rem; margin-bottom: 40px; text-align: center;'}, 
    `Choose a convenient time slot for your anonymous session with ${selectedCounselor?.name || ''}`);
  root.appendChild(title);
  root.appendChild(description);

  const container = createElement('div', {style: 'display: grid; grid-template-columns: 1fr 1fr; gap: 40px; max-width: 900px; margin: 0 auto;'});

  // Counselor Info
  const counselorInfoCard = createElement('div', {
    style: `
      background: white;
      border-radius: 16px;
      padding: 24px;
      border: 1px solid #e5e7eb;
    `
  });

  const counselorHeading = createElement('h3', {style: 'font-size: 1.25rem; font-weight: 600; color: #111827; margin-bottom: 16px;'}, 'Your Selected Counselor');
  counselorInfoCard.appendChild(counselorHeading);

  const counselorTopInfo = createElement('div', {style: 'display: flex; align-items: center; gap: 12px; margin-bottom: 16px;'});
  const counselorImg = createElement('div', {style: 'font-size: 2rem;'}, selectedCounselor?.image || '');
  const counselorDetails = createElement('div', {});
  counselorDetails.appendChild(createElement('h4', {style: 'font-weight: 600; color: #111827; margin-bottom: 4px;'}, selectedCounselor?.name || ''));
  counselorDetails.appendChild(createElement('p', {style: 'color: #6b7280; font-size: 14px;'}, selectedCounselor?.title || ''));

  counselorTopInfo.appendChild(counselorImg);
  counselorTopInfo.appendChild(counselorDetails);
  counselorInfoCard.appendChild(counselorTopInfo);

  const sessionDetails = createElement('div', {
    style: `
      background: #f9fafb;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 16px;
    `
  });
  sessionDetails.appendChild(createElement('div', {style: 'font-size: 13px; color: #4b5563; margin-bottom: 8px; font-weight: 600;'}, 'Session Details:'));
  const sessionList = createElement('ul', {style: 'font-size: 13px; color: #4b5563; margin: 0; padding-left: 16px;'});
  ['Duration: 50 minutes', 'Format: In-person or Video call', 'Anonymous reference ID will be provided', 'No personal information required'].forEach(text => {
    sessionList.appendChild(createElement('li', {}, text));
  });
  sessionDetails.appendChild(sessionList);
  counselorInfoCard.appendChild(sessionDetails);

  const changeBtn = createElement('button', {
    style: `
      width: 100%;
      padding: 12px;
      background: #6b7280;
      color: white;
      font-weight: 600;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    `
  }, 'Change Counselor');
  changeBtn.addEventListener('click', () => {
    selectedCounselor = null;
    bookingStep = 1;
    renderStep1();
  });
  counselorInfoCard.appendChild(changeBtn);

  container.appendChild(counselorInfoCard);

  // Time Slots Card
  const timeSlotsCard = createElement('div', {
    style: `
      background: white;
      border-radius: 16px;
      padding: 24px;
      border: 1px solid #e5e7eb;
    `
  });

  timeSlotsCard.appendChild(createElement('h3', {style: 'font-size: 1.25rem; font-weight: 600; color: #111827; margin-bottom: 16px;'}, 'Available Time Slots'));

  // Select Date dropdown
  const dateLabel = createElement('label', {
      style: 'display: block; font-weight: 500; margin-bottom: 8px; color: #374151;'
    }, 'Select Date:');
  const dateSelect = createElement('select', {
    style: 'width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 14px; margin-bottom: 20px;'
  });
  ['Choose a date', '2025-09-24', '2025-09-25', '2025-09-26', '2025-09-27'].forEach((v, i) => {
    const opt = createElement('option', {value: i > 0 ? v : ''}, i > 0 ? (new Date(v).toDateString()) : v);
    dateSelect.appendChild(opt);
  });
  dateSelect.value = selectedDate;
  dateSelect.addEventListener('change', e => {
    selectedDate = e.target.value;
    renderStep2();
  });
  timeSlotsCard.appendChild(dateLabel);
  timeSlotsCard.appendChild(dateSelect);

  // Available Times
  if (selectedDate) {
    const availableLabel = createElement('label', {
      style: 'display: block; font-weight: 500; margin-bottom: 12px; color: #374151;'
    }, 'Available Times:');

    const timesGrid = createElement('div', {
      style: 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;'
    });

    timeSlots.filter(slot => slot.date === selectedDate).forEach(slot => {
      const btn = createElement('button', {
        style: `
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          background: ${slot.available ? 'white' : '#f3f4f6'};
          color: ${slot.available ? '#111827' : '#9ca3af'};
          cursor: ${slot.available ? 'pointer' : 'not-allowed'};
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        `,
        disabled: !slot.available
      }, slot.time);

      btn.addEventListener('mouseenter', e => {
        if (slot.available) {
          e.target.style.background = '#eff6ff';
          e.target.style.borderColor = '#2563eb';
        }
      });
      btn.addEventListener('mouseleave', e => {
        if (slot.available) {
          e.target.style.background = 'white';
          e.target.style.borderColor = '#d1d5db';
        }
      });

      btn.addEventListener('click', () => {
        selectedTime = slot.time;
        bookingStep = 3;
        renderStep3();
      });

      timesGrid.appendChild(btn);
    });

    timeSlotsCard.appendChild(availableLabel);
    timeSlotsCard.appendChild(timesGrid);
  }

  container.appendChild(timeSlotsCard);

  root.appendChild(container);
}

function renderStep3() {
  clearRoot();

  const confirmationContainer = createElement('div', {
    style: 'max-width: 600px; margin: 0 auto; text-align: center;'
  });
  confirmationContainer.appendChild(createElement('h2', {
    style: 'font-size: 2rem; font-weight: 700; color: #111827; margin-bottom: 16px;'
  }, 'Booking Confirmed! 🎉'));

  bookingReference = randomBookingReference();

  confirmationContainer.appendChild(createElement('p', {
    style: 'color: #6b7280; font-size: 1.1rem; margin-bottom: 32px;'
  }, 'Your anonymous counseling session has been successfully scheduled.'));

  const details = createElement('div', {
    style: `
      background: #f8fafc;
      padding: 24px;
      border-radius: 12px;
      text-align: left;
      margin-bottom: 32px;
    `
  });

  details.appendChild(createElement('h3', {
    style: 'font-size: 1.1rem; font-weight: 600; color: #111827; margin-bottom: 16px;'
  }, '📋 Session Details'));

  const infoList = createElement('div', {style: 'display: grid; gap: 12px;'});

  infoList.appendChild(createElement('div', {}, `Counselor: ${selectedCounselor?.name || ''}`));
  infoList.appendChild(createElement('div', {}, `Date: ${selectedDate}`));
  infoList.appendChild(createElement('div', {}, `Time: ${selectedTime}`));
  infoList.appendChild(createElement('div', {}, ['Reference ID: ', createElement('span', {
    style: `
      background: #2563eb;
      color: white;
      padding: 2px 8px;
      border-radius: 6px;
      font-family: monospace;
      font-weight: 600;
    `
  }, bookingReference)]));

  infoList.appendChild(createElement('div', {}, 'Duration: 50 minutes'));
  details.appendChild(infoList);
  confirmationContainer.appendChild(details);

  const infoBox = createElement('div', {
    style: `
      background: #eff6ff;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      text-align: left;
    `
  });

  infoBox.appendChild(createElement('h4', {
    style: 'font-size: 14px; font-weight: 600; color: #1e40af; margin-bottom: 8px;'
  }, '📱 Important Information:'));
  const infoList2 = createElement('ul', {style: 'font-size: 13px; color: #1e40af; margin: 0; padding-left: 16px;'});
  ['Save your Reference ID: ' + bookingReference, 'No personal information is stored or required', 'Arrive 10 minutes early for in-person sessions', 'Session confirmation will be sent to the provided contact method'].forEach(txt => {
    infoList2.appendChild(createElement('li', {}, txt));
  });
  infoBox.appendChild(infoList2);
  confirmationContainer.appendChild(infoBox);

  // Buttons
  const btnWrapper = createElement('div', {style: 'display: flex; gap: 12px; justify-content: center;'});
  const bookAnotherBtn = createElement('button', {
    style: `
      padding: 12px 24px;
      background: #6b7280;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    `
  }, 'Book Another Session');
  bookAnotherBtn.onclick = () => {
    selectedCounselor = null;
    selectedDate = '';
    selectedTime = '';
    bookingReference = '';
    bookingStep = 1;
    renderStep1();
  };
  btnWrapper.appendChild(bookAnotherBtn);

  const contactBtn = createElement('button', {
    style: `
      padding: 12px 24px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
    `
  }, 'Contact Support');
  contactBtn.onclick = () => {
    alert('Support: Contact support@example.com or call 123-456-7890');
  };
  btnWrapper.appendChild(contactBtn);

  confirmationContainer.appendChild(btnWrapper);

  root.appendChild(confirmationContainer);
}

// Initial render
renderStep1();
