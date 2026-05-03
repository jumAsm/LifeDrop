document.addEventListener("DOMContentLoaded", function () {

//Global Variables
    const btnSignIn = document.getElementById("btnSignIn");
    const btnSignUp = document.getElementById("btnSignUp");
    const signInForm = document.getElementById("signInForm");
    const signUpForm = document.getElementById("signUpForm");
    let currentStep = 1;

//Validator Functions
    function showError(input, message) {
        clearError(input);
        if (!input) return;
        input.classList.add("input-error");
        const err = document.createElement("span");
        err.className = "error-msg";
        err.textContent = message;
        input.insertAdjacentElement("afterend", err);
    }

    function clearError(input) {
        if (!input) return;
        input.classList.remove("input-error");
        const next = input.nextElementSibling;
        if (next && next.classList.contains("error-msg")) next.remove();
    }

    function validateEmail(input) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!input.value.trim()) { showError(input, "Email is required."); return false; }
        if (!re.test(input.value.trim())) { showError(input, "Please enter a valid email."); return false; }
        clearError(input); return true;
    }

    function validatePassword(input) {
        if (!input.value) { showError(input, "Password is required."); return false; }
        if (input.value.length < 8) { showError(input, "Password must be 8+ characters."); return false; }
        clearError(input); return true;
    }

//Moving between steps
    function goToStep(step) {
        const currentDiv = document.getElementById("step" + currentStep);
        const nextDiv = document.getElementById("step" + step);
        if (currentDiv) currentDiv.style.display = "none";
        if (nextDiv) nextDiv.style.display = "block";
        currentStep = step;
    }
    document.getElementById("backStep2")?.addEventListener("click", () => goToStep(1));
    document.getElementById("backStep3")?.addEventListener("click", () => goToStep(2));

    document.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
            if (signUpForm && signUpForm.style.display !== "none") {
                e.preventDefault();
                if (currentStep === 1) document.getElementById("nextStep1").click();
                else if (currentStep === 2) document.getElementById("nextStep2").click();
                else if (currentStep === 3) document.getElementById("submitSignUp").click();
            }
        }
    });

//Sending Data    
    //Sing Up
    document.getElementById("submitSignUp")?.addEventListener("click", function () {
        const formData = {
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
            firstName: document.getElementById("firstName").value,
            lastName: document.getElementById("lastName").value,
            gender: document.getElementById("gender").value,
            dob: document.getElementById("dob").value,
            mobile: document.getElementById("mobile").value,
            city: document.getElementById("city").value,
            nationality: document.getElementById("nationality").value,
            bloodType: document.getElementById("bloodType").value,
            lastDonation: document.getElementById("lastDonation").value || null,
            donationCount: document.getElementById("donationCount").value,
            availability: document.getElementById("availability").value
        };

        fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(res => {
            if (!res.ok) throw new Error("Server Error");
            return res.json();
        })
        .then(data => {
            if (data.success) {
                localStorage.setItem("userName", data.firstName);
                document.getElementById("step3").style.display = "none";
                document.getElementById("successMsg").style.display = "block";
                setTimeout(() => { window.location.href = "index.html"; }, 2000);
            } else {
                alert("Registration Error: " + data.message);
            }
        })
        .catch(err => alert("Connection Error: Unable to reach the server."));
    });

    //Sing In
    signInForm?.addEventListener("submit", function (e) {
        e.preventDefault();
        if (validateEmail(document.getElementById("siEmail")) && validatePassword(document.getElementById("siPassword"))) {
            fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: document.getElementById("siEmail").value,
                    password: document.getElementById("siPassword").value
                })
            })
            .then(res => {
                if (!res.ok) throw new Error("Server Error");
                return res.json();
            })
            .then(data => {
                if (data.success) {
                    localStorage.setItem("userName", data.firstName);
                    window.location.href = "index.html";
                } else {
                    alert("Login Failed: " + data.message);
                }
            })
            .catch(err => alert("Server is offline. Check your Terminal."));
        }
    });

    document.querySelectorAll("input, select").forEach(el => {
        el.addEventListener("input", () => clearError(el));
    });
});

//Update Avatar
(function updateAvatar() {
    const savedName = localStorage.getItem("userName");
    if (savedName) {
        const navBtn = document.querySelector(".nav-btn-dark");
        const navWrapper = document.querySelector(".nav-wrapper");
        if (navBtn && navWrapper) {
            navBtn.style.display = "none";
            const avatar = document.createElement("div");
            avatar.className = "user-avatar";
            avatar.textContent = savedName.charAt(0).toUpperCase();
            navWrapper.appendChild(avatar);
            avatar.onclick = () => {
                if (confirm("Log out?")) { localStorage.removeItem("userName"); window.location.reload(); }
            };
        }
    }
})();