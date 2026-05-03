document.addEventListener("DOMContentLoaded", function () {
    //Global Variables 
    const btnSignIn = document.getElementById("btnSignIn");
    const btnSignUp = document.getElementById("btnSignUp");
    const signInForm = document.getElementById("signInForm");
    const signUpForm = document.getElementById("signUpForm");
    let currentStep = 1;




    //Validation Functions    
    //Function to add red error text and border style 
    function showError(input, message) {
        clearError(input);
        if (!input) return;
        input.classList.add("input-error");
        const err = document.createElement("span");
        err.className = "error-msg";
        err.textContent = message;
        input.insertAdjacentElement("afterend", err);
    }
    //Function to remove error styles and elements
    function clearError(input) {
        if (!input) return;
        input.classList.remove("input-error");
        const next = input.nextElementSibling;
        if (next && next.classList.contains("error-msg")) next.remove();
    }
    //Email validation 
    function validateEmail(input) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!input.value.trim()) { showError(input, "Email is required."); return false; }
        if (!re.test(input.value.trim())) { showError(input, "Invalid email format."); return false; }
        clearError(input); return true;
    }
    //Password length validation
    function validatePassword(input) {
        if (!input.value) { showError(input, "Password is required."); return false; }
        if (input.value.length < 8) { showError(input, "Must be at least 8 characters."); return false; }
        clearError(input); return true;
    }
    //Basic validation for text and select fields
    function validateRequired(input, message) {
        if (input.value.trim().length < 1) { showError(input, message); return false; }
        clearError(input); return true;
    }
    //Mobile number validation
    function validateMobile(input) {
        const re = /^[0-9]{10}$/;
        if (!re.test(input.value.trim())) { showError(input, "Mobile must be 10 digits."); return false; }
        clearError(input); return true;
    }

    //Sign Up Steps 
    function goToStep(step) {
        const currentDiv = document.getElementById("step" + currentStep);
        const nextDiv = document.getElementById("step" + step);
        if (currentDiv) currentDiv.style.display = "none";
        if (nextDiv) nextDiv.style.display = "block";
        updateStepsBar(step);
        currentStep = step;
        window.scrollTo({ top: 200, behavior: "smooth" });
    }
    //Progress bar update
    function updateStepsBar(active) {
        for (let i = 1; i <= 3; i++) {
            const s = document.getElementById("s" + i);
            if (s) {
                s.classList.remove("active", "done");
                if (i < active) s.classList.add("done");
                else if (i === active) s.classList.add("active");
            }
        }
    }




    //Event Handlers 
    //Form Toggle between Sign IN or Sign UP
    if (btnSignIn && btnSignUp) {
        btnSignIn.addEventListener("click", function () {
            btnSignIn.classList.add("active"); btnSignUp.classList.remove("active");
            signInForm.style.display = "flex"; signUpForm.style.display = "none";
        });
        btnSignUp.addEventListener("click", function () {
            btnSignUp.classList.add("active"); btnSignIn.classList.remove("active");
            signInForm.style.display = "none"; signUpForm.style.display = "block";
        });
    }

    //Sign Up - Step 1 Verification
    document.getElementById("nextStep1")?.addEventListener("click", () => {
        const emailField = document.getElementById("email");
        const passField = document.getElementById("password");

        if (validateEmail(emailField) && validatePassword(passField)) {
            clearError(emailField);
            fetch('/check-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailField.value })
            })
                .then(res => {
                    if (!res.ok) throw new Error("Server is not responding correctly");
                    return res.json();
                })
                .then(data => {
                    if (data.exists) {
                        showError(emailField, "This email is already registered. Please Sign In instead.");
                    } else {
                        goToStep(2);
                    }
                })
                .catch(err => {
                    console.error("Error details:", err);
                    showError(emailField, "Verification error. Please ensure the server is running.");
                });
        }
    });

    //Sign Up - Step 2 Verification
    document.getElementById("nextStep2")?.addEventListener("click", () => {
        const isFnameOk = validateRequired(document.getElementById("firstName"), "First name required.");
        const isLnameOk = validateRequired(document.getElementById("lastName"), "Last name required.");
        const isMobileOk = validateMobile(document.getElementById("mobile"));
        const isCityOk = validateRequired(document.getElementById("city"), "City selection required.");
        if (isFnameOk && isLnameOk && isMobileOk && isCityOk) goToStep(3);
    });

    // Back Navigation
    document.getElementById("backStep2")?.addEventListener("click", () => goToStep(1));
    document.getElementById("backStep3")?.addEventListener("click", () => goToStep(2));

    //Enter Key Handler
    document.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {

            const isSignUpVisible = signUpForm && window.getComputedStyle(signUpForm).display !== "none";
            const isSignInVisible = signInForm && window.getComputedStyle(signInForm).display !== "none";

            if (isSignUpVisible) {
                e.preventDefault();
                if (currentStep === 1) document.getElementById("nextStep1").click();
                else if (currentStep === 2) document.getElementById("nextStep2").click();
                else if (currentStep === 3) document.getElementById("submitSignUp").click();
            }
            else if (isSignInVisible) {
                const siBtn = signInForm.querySelector(".register-btn");
                if (siBtn) { e.preventDefault(); siBtn.click(); }
            }
        }
    });




    //Backend Communication AJAX - Fetch
    //Sign Up Submission
    document.getElementById("submitSignUp")?.addEventListener("click", function () {
        const blood = document.getElementById("bloodType");
        if (validateRequired(blood, "Blood type selection required.")) {
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
                .then(res => { if (!res.ok) throw new Error("Server Error"); return res.json(); })
                .then(data => {
                    if (data.success) {
                        localStorage.setItem("userName", data.firstName);
                        document.getElementById("step3").style.display = "none";
                        const successDiv = document.getElementById("successMsg");
                        if (successDiv) {
                            successDiv.style.display = "block";
                        }
                        setTimeout(() => { window.location.href = "index.html"; }, 2500);
                    } else { alert("Registration Error: " + data.message); }
                })
                .catch(err => alert("Connection Error."));
        }
    });

    //Sign In Submission
    signInForm?.addEventListener("submit", function (e) {
        e.preventDefault();
        const em = document.getElementById("siEmail");
        const ps = document.getElementById("siPassword");

        clearError(em);
        clearError(ps);

        const isEmailOk = validateEmail(em);
        const isPassOk = validatePassword(ps);

        if (isEmailOk && isPassOk) {
            fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: em.value, password: ps.value })
            })
                .then(res => {
                    if (!res.ok) throw new Error("Invalid response");
                    return res.json();
                })
                .then(data => {
                    if (data.success) {
                        localStorage.setItem("userName", data.firstName);
                        window.location.href = "index.html";
                    } else {
                        showError(em, data.message);
                    }
                })
                .catch(err => {
                    console.error("Sign-in error:", err);
                    showError(em, "Server offline. Check Terminal.");
                });
        }
    });

    //Clear validation 
    document.querySelectorAll("input, select").forEach(el => {
        el.addEventListener("input", () => clearError(el));
    });

    //Avatar Update
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
                    if (confirm("Log out?")) {
                        localStorage.removeItem("userName");
                        window.location.reload();
                    }
                };
            }
        }
    })();
});