// Loader

window.addEventListener("load", () => {
  const loader = document.querySelector(".loader");

  if (loader) {
    setTimeout(() => {
      loader.style.display = "none";
    }, 1200);
  }
});

// Dark Mode

const darkBtn = document.getElementById("darkModeBtn");

if (darkBtn) {
  darkBtn.addEventListener("click", () => {

    document.body.classList.toggle("light-mode");

    const icon = darkBtn.querySelector("i");

    if (document.body.classList.contains("light-mode")) {
      icon.classList.remove("fa-moon");
      icon.classList.add("fa-sun");
    } else {
      icon.classList.remove("fa-sun");
      icon.classList.add("fa-moon");
    }

  });
}

// Course Search

const searchInput = document.getElementById("searchInput");

if (searchInput) {

  searchInput.addEventListener("keyup", () => {

    const value = searchInput.value.toLowerCase();

    const courses = document.querySelectorAll(".course");

    courses.forEach(course => {

      const text = course.innerText.toLowerCase();

      if (text.includes(value)) {
        course.style.display = "block";
      } else {
        course.style.display = "none";
      }

    });

  });

}

// Contact Form Validation

const contactForm = document.getElementById("contactForm");

if (contactForm) {

  contactForm.addEventListener("submit", (e) => {

    e.preventDefault();

    alert("✅ Message Sent Successfully!");

    contactForm.reset();

  });

}

// Scroll Reveal Animation

const revealElements = document.querySelectorAll(
  ".card, .stat-card, .profile-card"
);

const revealOnScroll = () => {

  revealElements.forEach((element) => {

    const windowHeight = window.innerHeight;

    const revealTop =
      element.getBoundingClientRect().top;

    if (revealTop < windowHeight - 100) {

      element.style.opacity = "1";
      element.style.transform = "translateY(0)";

    }

  });

};

revealElements.forEach((element) => {

  element.style.opacity = "0";
  element.style.transform = "translateY(40px)";
  element.style.transition = "0.8s ease";

});

window.addEventListener("scroll", revealOnScroll);

revealOnScroll();

// Smooth Scroll

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

  anchor.addEventListener("click", function(e) {

    e.preventDefault();

    const target =
      document.querySelector(this.getAttribute("href"));

    if (target) {

      target.scrollIntoView({
        behavior: "smooth"
      });

    }

  });

});

// AI Assistant Demo

const chatButton =
  document.querySelector(".chat-input button");

const chatInput =
  document.querySelector(".chat-input input");

const chatBox =
  document.querySelector(".chat-box");

if (chatButton && chatInput && chatBox) {

  chatButton.addEventListener("click", () => {

    const userText = chatInput.value.trim();

    if (userText === "") return;

    const userMessage =
      document.createElement("div");

    userMessage.className = "message user";

    userMessage.textContent = userText;

    chatBox.appendChild(userMessage);

    setTimeout(() => {

      const botMessage =
        document.createElement("div");

      botMessage.className = "message bot";

      botMessage.textContent =
        "This is a demo AI response. Connect an AI API for real answers.";

      chatBox.appendChild(botMessage);

      chatBox.scrollTop =
        chatBox.scrollHeight;

    }, 1000);

    chatInput.value = "";

  });

}