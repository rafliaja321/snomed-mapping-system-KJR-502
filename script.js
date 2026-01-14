document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const btn = document.getElementById("loginBtn");
  const inputs = document.querySelectorAll("input");
  const errorMsg = document.getElementById("errorMsg");

  errorMsg.style.display = "none";

  btn.classList.add("loading");
  btn.disabled = true;
  inputs.forEach((input) => (input.disabled = true));

  setTimeout(() => {
    if (username === "pmik" && password === "123") {
      window.location.href = "home.html";
    } else {
      btn.classList.remove("loading");
      btn.disabled = false;
      inputs.forEach((input) => (input.disabled = false));
      errorMsg.style.display = "block";
    }
  }, 1500);
});

// toggle password
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

if (togglePassword) {
  togglePassword.addEventListener("click", () => {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    togglePassword.textContent = type === "password" ? "👁️" : "🙈";
  });
}
