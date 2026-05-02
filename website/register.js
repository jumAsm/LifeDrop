// REGISTER PAGE
document.addEventListener("DOMContentLoaded", function () {
 
    //  Sign In - Sign Up 
    const btnSignIn  = document.getElementById("btnSignIn");
    const btnSignUp  = document.getElementById("btnSignUp");
    const signInForm = document.getElementById("signInForm");
    const signUpForm = document.getElementById("signUpForm");
 
    btnSignIn.addEventListener("click", function () {
    btnSignIn.classList.add("active");
    btnSignUp.classList.remove("active");
    signInForm.style.display = "flex";
    signUpForm.style.display = "none";
});

btnSignUp.addEventListener("click", function () {
    btnSignUp.classList.add("active");
    btnSignIn.classList.remove("active");
    signInForm.style.display = "none";
    signUpForm.style.display = "block";
});
    // HELPERS 
    function showError(input, message) {
        clearError(input);
        input.style.borderColor = "#c62828";
        const err = document.createElement("span");
        err.className = "error-msg";
        err.textContent = message;
        input.insertAdjacentElement("afterend", err);
    }
 
    function clearError(input) {
        input.style.borderColor = "";
        const next = input.nextElementSibling;
        if (next && next.classList.contains("error-msg")) next.remove();
    }
 
    // VALIDATION FUNCTIONS
    function validateEmail(input) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!input.value.trim()) { showError(input, "Email is required."); return false; }
        if (!re.test(input.value.trim())) { showError(input, "Please enter a valid email (e.g. name@gmail.com)."); return false; }
        clearError(input); return true;
    }
 
    function validatePassword(input) {
        if (!input.value) { showError(input, "Password is required."); return false; }
        if (input.value.length < 8) { showError(input, "Password must be at least 8 characters."); return false; }
        clearError(input); return true;
    }
 
    function validateText(input, name) {
        const re = /^[A-Za-z\u0600-\u06FF ]{2,}$/;
        if (!input.value.trim()) { showError(input, `${name} is required.`); return false; }
        if (!re.test(input.value.trim())) { showError(input, `${name} must contain letters only.`); return false; }
        clearError(input); return true;
    }
 
    function validateSelect(input, name) {
        if (!input.value) { showError(input, `Please select your ${name}.`); return false; }
        clearError(input); return true;
    }
 
    function validateDOB(input) {
        if (!input.value) { showError(input, "Date of birth is required."); return false; }
        const age = new Date().getFullYear() - new Date(input.value).getFullYear();
        if (age < 18) { showError(input, "You must be at least 18 years old."); return false; }
        if (age > 65) { showError(input, "Donors must be 65 years old or younger."); return false; }
        clearError(input); return true;
    }
 
    function validateMobile(input) {
        const re = /^[0-9]{10}$/;
        if (!input.value.trim()) { showError(input, "Mobile number is required."); return false; }
        if (!re.test(input.value.trim())) { showError(input, "Mobile number must be exactly 10 digits."); return false; }
        clearError(input); return true;
    }
 
    function validateLastDonation(input) {
        if (!input.value) return true;
        if (new Date(input.value) > new Date()) { showError(input, "Date cannot be in the future."); return false; }
        clearError(input); return true;
    }
 
    // STEPS  
    let currentStep = 1;
 
    function goToStep(step) {
        document.getElementById("step" + currentStep).style.display = "none";
        document.getElementById("step" + step).style.display = "block";
        updateStepsBar(step);
        currentStep = step;
        window.scrollTo({ top: 300, behavior: "smooth" });
    }
 
    function updateStepsBar(active) {
        for (let i = 1; i <= 3; i++) {
            const s = document.getElementById("s" + i);
            s.classList.remove("active", "done");
            if (i < active) s.classList.add("done");
            else if (i === active) s.classList.add("active");
        }
        document.getElementById("line1").classList.toggle("done", active > 1);
        document.getElementById("line2").classList.toggle("done", active > 2);
    }
 
    //Step 1 to Step 2 
    document.getElementById("nextStep1").addEventListener("click", function () {
        const email    = document.getElementById("email");
        const password = document.getElementById("password");
        const v1 = validateEmail(email);
        const v2 = validatePassword(password);
        if (v1 && v2) goToStep(2);
    });
 
    //Step 2 back to Step 1
    document.getElementById("backStep2").addEventListener("click", function () {
        goToStep(1);
    });
 
    //Step 2 to Step 3 
    document.getElementById("nextStep2").addEventListener("click", function () {
        const results = [
            validateText(document.getElementById("firstName"), "First name"),
            validateText(document.getElementById("lastName"), "Last name"),
            validateSelect(document.getElementById("gender"), "gender"),
            validateDOB(document.getElementById("dob")),
            validateMobile(document.getElementById("mobile")),
            validateSelect(document.getElementById("city"), "city"),
            validateSelect(document.getElementById("nationality"), "nationality"),
        ];
        if (results.every(r => r)) goToStep(3);
        else document.querySelector(".error-msg")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
 
    //Step back to Step 2 
    document.getElementById("backStep3").addEventListener("click", function () {
        goToStep(2);
    });
 
    //Step 3 to Submit 
    document.getElementById("submitSignUp").addEventListener("click", function () {
        const results = [
            validateSelect(document.getElementById("bloodType"), "blood type"),
            validateLastDonation(document.getElementById("lastDonation")),
            validateSelect(document.getElementById("donationCount"), "donation count"),
            validateSelect(document.getElementById("availability"), "availability"),
        ];
        if (results.every(r => r)) {
            document.getElementById("step3").style.display = "none";
            document.getElementById("successMsg").style.display = "block";
            updateStepsBar(4); 
            window.scrollTo({ top: 200, behavior: "smooth" });
        } else {
            document.querySelector(".error-msg")?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    });
 
    //SIGN IN FORM SUBMIT
    signInForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const email    = document.getElementById("siEmail");
        const password = document.getElementById("siPassword");
        const v1 = validateEmail(email);
        const v2 = validatePassword(password);
        if (v1 && v2) {
            const old = signInForm.querySelector(".success-msg");
            if (old) old.remove();
            const success = document.createElement("div");
            success.className = "success-msg";
            success.textContent = "Signed in successfully! Welcome back.";
            signInForm.insertAdjacentElement("afterend", success);
            signInForm.reset();
        }
    });
          
    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: document.getElementById("siEmail").value,
          password: document.getElementById("siPassword").value
        })
    })
    .then(res => res.json())
    .then(data => {
         if (data.success) {
            localStorage.setItem("userName", data.firstName);
            window.location.href = "https://www.LIFEDROP.com/website/register.html"
        }
});

    //LIVE CLEAR ERRORS ON INPUT
    document.querySelectorAll("input, select").forEach(el => {
        el.addEventListener("input", () => clearError(el));
        el.addEventListener("change", () => clearError(el));
    });
 
});
const name = localStorage.getItem("userName");
if (name) {
    document.querySelector(".nav-btn-dark").style.display = "none";
    const avatar = document.createElement("div");
    avatar.className = "user-avatar";
    avatar.textContent = name.charAt(0).toUpperCase();
    document.querySelector(".nav-wrapper").appendChild(avatar);
}