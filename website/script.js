// REGISTER PAGE - UNIFIED COMPREHENSIVE LOGIC (CCSW 321)[cite: 7]
document.addEventListener("DOMContentLoaded", function () {

    // --- 1. Global Variables ---
    const btnSignIn = document.getElementById("btnSignIn");
    const btnSignUp = document.getElementById("btnSignUp");
    const signInForm = document.getElementById("signInForm");
    const signUpForm = document.getElementById("signUpForm");
    let currentStep = 1;

    // --- 2. Helper Validation Functions (Unified Style) ---
    
    // Displays red text under the field and adds red border
    function showError(input, message) {
        clearError(input);
        if (!input) return;
        input.classList.add("input-error"); 
        const err = document.createElement("span");
        err.className = "error-msg";
        err.textContent = message;
        input.insertAdjacentElement("afterend", err);
    }

    // Removes error styles and messages[cite: 12]
    function clearError(input) {
        if (!input) return;
        input.classList.remove("input-error");
        const next = input.nextElementSibling;
        if (next && next.classList.contains("error-msg")) next.remove();
    }

    function validateEmail(input) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!input.value.trim()) { showError(input, "Email is required."); return false; }
        if (!re.test(input.value.trim())) { showError(input, "Invalid email format."); return false; }
        clearError(input); return true;
    }

    function validatePassword(input) {
        if (!input.value) { showError(input, "Password is required."); return false; }
        if (input.value.length < 8) { showError(input, "Must be at least 8 characters."); return false; }
        clearError(input); return true;
    }

    function validateRequired(input, message) {
        if (input.value.trim().length < 1) { showError(input, message); return false; }
        clearError(input); return true;
    }

    function validateMobile(input) {
        const re = /^[0-9]{10}$/;
        if (!re.test(input.value.trim())) { showError(input, "Mobile must be 10 digits."); return false; }
        clearError(input); return true;
    }

    // --- 3. Multi-Step Navigation Logic ---[cite: 7]
    function goToStep(step) {
        const currentDiv = document.getElementById("step" + currentStep);
        const nextDiv = document.getElementById("step" + step);
        if (currentDiv) currentDiv.style.display = "none";
        if (nextDiv) nextDiv.style.display = "block";
        updateStepsBar(step);
        currentStep = step;
        window.scrollTo({ top: 200, behavior: "smooth" });
    }

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

    // --- 4. Event Handlers ---[cite: 12]

    // Form Toggle Logic[cite: 7]
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

    // Step-by-Step Sign Up Validation[cite: 12]
    document.getElementById("nextStep1")?.addEventListener("click", () => {
        const emailField = document.getElementById("email");
        const passField = document.getElementById("password");
        if (validateEmail(emailField) && validatePassword(passField)) goToStep(2);
    });

    document.getElementById("nextStep2")?.addEventListener("click", () => {
        const isFnameOk = validateRequired(document.getElementById("firstName"), "First name required.");
        const isLnameOk = validateRequired(document.getElementById("lastName"), "Last name required.");
        const isMobileOk = validateMobile(document.getElementById("mobile"));
        const isCityOk = validateRequired(document.getElementById("city"), "City required.");
        if (isFnameOk && isLnameOk && isMobileOk && isCityOk) goToStep(3);
    });

    document.getElementById("backStep2")?.addEventListener("click", () => goToStep(1));
    document.getElementById("backStep3")?.addEventListener("click", () => goToStep(2));

    // Global Enter Key Handler for both forms[cite: 12]
    document.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
            if (signUpForm && signUpForm.style.display !== "none") {
                e.preventDefault();
                if (currentStep === 1) document.getElementById("nextStep1").click();
                else if (currentStep === 2) document.getElementById("nextStep2").click();
                else if (currentStep === 3) document.getElementById("submitSignUp").click();
            } 
            else if (signInForm && signInForm.style.display !== "none") {
                const siBtn = signInForm.querySelector(".register-btn");
                if (siBtn) siBtn.click();
            }
        }
    });

    // --- 5. Backend Communication (AJAX) ---[cite: 11]

    // Sign Up Submission[cite: 11]
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
                    document.getElementById("successMsg").style.display = "block";
                    setTimeout(() => { window.location.href = "index.html"; }, 2000);
                } else { alert("Registration Error: " + data.message); }
            })
            .catch(err => alert("Connection Error."));
        }
    });

    // Unified Sign In Logic[cite: 11, 12]
    signInForm?.addEventListener("submit", function (e) {
        e.preventDefault(); // Prevents the browser's default "required" popup[cite: 12]
        
        const em = document.getElementById("siEmail");
        const ps = document.getElementById("siPassword");

        // Now uses the same error handling style as Sign Up[cite: 12]
        const isEmailOk = validateEmail(em);
        const isPassOk = validatePassword(ps);

        if (isEmailOk && isPassOk) {
            fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: em.value, password: ps.value })
            })
            .then(res => { if (!res.ok) throw new Error("Invalid response"); return res.json(); })
            .then(data => {
                if (data.success) {
                    localStorage.setItem("userName", data.firstName);
                    window.location.href = "index.html";
                } else { alert("Login Failed: " + data.message); }
            })
            .catch(err => alert("Server offline."));
        }
    });

    document.querySelectorAll("input, select").forEach(el => {
        el.addEventListener("input", () => clearError(el));
    });
});

// --- 6. Navigation Bar Avatar Logic ---[cite: 12]
(function updateNavigation() {
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