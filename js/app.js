// Loader
window.addEventListener('load', () => {
  const loader = document.querySelector('.loader');
  if (loader) {
    setTimeout(() => {
      loader.style.display = 'none';
    }, 900);
  }
});

// Theme toggle with persistence
const darkBtn = document.getElementById('darkModeBtn');
if (darkBtn) {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    darkBtn.querySelector('i')?.classList.replace('fa-moon', 'fa-sun');
  }

  darkBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');

    const icon = darkBtn.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-moon', !isLight);
      icon.classList.toggle('fa-sun', isLight);
    }
  });
}

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');
if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
}

// Search courses
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('keyup', () => {
    const value = searchInput.value.trim().toLowerCase();
    document.querySelectorAll('.course-card').forEach((course) => {
      const text = course.textContent.toLowerCase();
      course.style.display = text.includes(value) ? 'block' : 'none';
    });
  });
}

// Filter tabs
const filterButtons = document.querySelectorAll('.filter-btn');
if (filterButtons.length) {
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter || 'all';
      document.querySelectorAll('.course-card').forEach((card) => {
        const matches = filter === 'all' || card.dataset.category === filter;
        card.style.display = matches ? 'block' : 'none';
      });
      filterButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
    });
  });
}

// FAQ accordion
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach((item) => {
  const question = item.querySelector('.faq-question');
  if (question) {
    question.addEventListener('click', () => {
      faqItems.forEach((entry) => {
        if (entry !== item) entry.classList.remove('active');
      });
      item.classList.toggle('active');
    });
  }
});

// Scroll-to-top button
const scrollTopBtn = document.getElementById('scrollTop');
if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    scrollTopBtn.style.display = window.scrollY > 300 ? 'flex' : 'none';
  });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Contact form validation
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');
if (contactForm && formMessage) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const inputs = contactForm.querySelectorAll('input, textarea');
    let valid = true;

    inputs.forEach((input) => {
      if (!input.value.trim()) {
        valid = false;
      }
    });

    if (!valid) {
      formMessage.textContent = 'Please fill out all fields before submitting.';
      formMessage.style.display = 'block';
      return;
    }

    formMessage.textContent = 'Thanks! Your message has been sent successfully.';
    formMessage.style.display = 'block';
    contactForm.reset();
  });
}

// Student CRUD API integration
const studentForm = document.getElementById('studentForm');
const studentIdInput = document.getElementById('studentId');
const studentNameInput = document.getElementById('studentName');
const studentCourseInput = document.getElementById('studentCourse');
const studentYearInput = document.getElementById('studentYear');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const studentTableBody = document.getElementById('studentTableBody');
const crudStatus = document.getElementById('crudStatus');

if (studentForm && studentTableBody && crudStatus) {
  const setStatus = (message, isError = false) => {
    crudStatus.textContent = message;
    crudStatus.style.color = isError ? '#f87171' : 'var(--accent)';
  };

  const resetForm = () => {
    studentForm.reset();
    studentIdInput.value = '';
    submitBtn.textContent = 'Add Student';
    cancelEditBtn.hidden = true;
  };

  const renderStudents = (students) => {
    studentTableBody.innerHTML = '';

    if (!students.length) {
      studentTableBody.innerHTML = `
        <tr>
          <td colspan="5">No students found.</td>
        </tr>
      `;
      return;
    }

    students.forEach((student) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${student.id}</td>
        <td>${student.name}</td>
        <td>${student.course}</td>
        <td>${student.year}</td>
        <td>
          <button class="crud-action-btn" data-action="edit" data-id="${student.id}">Edit</button>
          <button class="crud-action-btn delete" data-action="delete" data-id="${student.id}">Delete</button>
        </td>
      `;
      studentTableBody.appendChild(row);
    });
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/students');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch students');
      }
      renderStudents(data.data || []);
    } catch (error) {
      setStatus(error.message, true);
    }
  };

  studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      name: studentNameInput.value.trim(),
      course: studentCourseInput.value.trim(),
      year: Number(studentYearInput.value)
    };

    if (!payload.name || !payload.course || !Number.isInteger(payload.year) || payload.year < 1 || payload.year > 6) {
      setStatus('Please enter valid student details.', true);
      return;
    }

    try {
      const id = studentIdInput.value;
      const method = id ? 'PUT' : 'POST';
      const url = id ? `/students/${id}` : '/students';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      setStatus(id ? 'Student updated successfully.' : 'Student added successfully.');
      resetForm();
      await fetchStudents();
    } catch (error) {
      setStatus(error.message, true);
    }
  });

  cancelEditBtn.addEventListener('click', () => {
    resetForm();
    setStatus('');
  });

  studentTableBody.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.action;

    if (action === 'edit') {
      try {
        const response = await fetch(`/students/${id}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Unable to load student');
        }

        studentIdInput.value = data.data.id;
        studentNameInput.value = data.data.name;
        studentCourseInput.value = data.data.course;
        studentYearInput.value = data.data.year;
        submitBtn.textContent = 'Update Student';
        cancelEditBtn.hidden = false;
        setStatus('Editing student details.');
      } catch (error) {
        setStatus(error.message, true);
      }
    }

    if (action === 'delete') {
      try {
        const response = await fetch(`/students/${id}`, { method: 'DELETE' });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Delete failed');
        }
        setStatus('Student deleted successfully.');
        await fetchStudents();
      } catch (error) {
        setStatus(error.message, true);
      }
    }
  });

  fetchStudents();
}

const studentsStatCounter = document.getElementById('studentsStatCounter');
const dashboardStudentCount = document.getElementById('dashboardStudentCount');
const dashboardCourseCount = document.getElementById('dashboardCourseCount');
const profileStudentCount = document.getElementById('profileStudentCount');
const profileCourseCount = document.getElementById('profileCourseCount');

const updateStudentCount = async () => {
  if (!studentsStatCounter) return;

  try {
    const response = await fetch('/students');
    const data = await response.json();
    if (!response.ok) {
      studentsStatCounter.textContent = 'N/A';
      return;
    }

    const count = data.count || 0;
    studentsStatCounter.dataset.target = count;
    studentsStatCounter.textContent = '0';
  } catch (error) {
    studentsStatCounter.textContent = 'N/A';
  }
};

const fetchAppSummary = async () => {
  if (!dashboardStudentCount && !dashboardCourseCount && !profileStudentCount && !profileCourseCount) return;

  try {
    const response = await fetch('/stats');
    const data = await response.json();
    if (!response.ok || !data.success) return;

    const summary = data.data || {};
    if (dashboardStudentCount) dashboardStudentCount.textContent = summary.studentCount ?? '0';
    if (dashboardCourseCount) dashboardCourseCount.textContent = summary.courseCount ?? '0';
    if (profileStudentCount) profileStudentCount.textContent = summary.studentCount ?? '0';
    if (profileCourseCount) profileCourseCount.textContent = summary.courseCount ?? '0';
  } catch (error) {
    console.error('Failed to load app summary:', error.message || error);
  }
};

updateStudentCount();
fetchAppSummary();

// Animated counters
const counters = document.querySelectorAll('.counter');
if (counters.length) {
  const animateCounter = (counter) => {
    const target = Number(counter.dataset.target || 0);
    const suffix = counter.dataset.suffix || '';
    let current = 0;

    const update = () => {
      if (current < target) {
        const stepAmount = Math.max(1, Math.ceil(target / 40));
        current = Math.min(target, current + stepAmount);
        counter.textContent = `${current.toLocaleString()}${suffix}`;
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  };

  setTimeout(() => {
    counters.forEach(animateCounter);
  }, 500);
}

// AI assistant demo chat
const sendChat = document.getElementById('sendChat');
const chatInput = document.getElementById('chatInput');
const chatBox = document.getElementById('chatBox');
if (sendChat && chatInput && chatBox) {
  sendChat.addEventListener('click', () => {
    const userText = chatInput.value.trim();
    if (!userText) return;

    const userMessage = document.createElement('div');
    userMessage.className = 'message user';
    userMessage.textContent = userText;
    chatBox.appendChild(userMessage);

    const responses = {
      sql: 'SQL helps you retrieve, update, and organize data using commands like SELECT, INSERT, and JOIN.',
      python: 'Python is great for automation, data analysis, and building AI models with simple syntax.',
      react: 'React lets you build reusable UI components and manage state efficiently with hooks.',
      default: 'This is a demo response. Connect an AI API to unlock real-time answers.'
    };

    let reply = responses.default;
    const lower = userText.toLowerCase();
    if (lower.includes('sql')) reply = responses.sql;
    else if (lower.includes('python')) reply = responses.python;
    else if (lower.includes('react')) reply = responses.react;

    setTimeout(() => {
      const botMessage = document.createElement('div');
      botMessage.className = 'message bot';
      botMessage.textContent = reply;
      chatBox.appendChild(botMessage);
      chatBox.scrollTop = chatBox.scrollHeight;
    }, 700);

    chatInput.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;
  });

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendChat.click();
  });
}

// AOS init
if (window.AOS) {
  AOS.init({ duration: 800, once: true });
}
