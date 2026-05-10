document.addEventListener("DOMContentLoaded", function () {
    //Global Variables 
    const btnSignIn = document.getElementById("btnSignIn");
    const btnSignUp = document.getElementById("btnSignUp");
    const signInForm = document.getElementById("signInForm");
    const signUpForm = document.getElementById("signUpForm");
    const donorSearchBtn = document.getElementById("searchBtn");
    const contactForm = document.getElementById("contactForm");
    let currentStep = 1;



    //Validation Functions
    //Errors for users
    function showSoftError(input, message) {
    clearSoftError(input);

    if (!input) return;

    input.classList.add("input-error");

    const err = document.createElement("span");
    err.className = "error-msg";
    err.textContent = message;

    if (input.parentElement.classList.contains("input-group")) {
        input.parentElement.appendChild(err);
    } else {
        input.insertAdjacentElement("afterend", err);
    }
}

    function clearSoftError(input) {
    if (!input) return;

    input.classList.remove("input-error");

    const parentError = input.parentElement.querySelector(".error-msg");
    if (parentError) parentError.remove();

    const next = input.nextElementSibling;
    if (next && next.classList.contains("error-msg")) {
        next.remove();
    }
}

    //Email validation 
    function validateEmail(input) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!input.value.trim()) { showSoftError(input, "Email is required."); return false; }
        if (!re.test(input.value.trim())) { showSoftError(input, "Please enter a valid email address (example@gmail.com)."); return false; }
        clearSoftError(input); return true;
    }

    //Password length validation
    function validatePassword(input) {
        if (!input.value) { showSoftError(input, "Password is required."); return false; }
        if (input.value.length < 8) { showSoftError(input, "Must be at least 8 characters."); return false; }
        clearSoftError(input); return true;
    }

    //Basic validation for text and select fields
    function validateRequired(input, message) {
        if (input.value.trim().length < 1) { showSoftError(input, message); return false; }
        clearSoftError(input); return true;
    }

    //Mobile number validation
    function validateMobile(input) {

    const re = /^05[0-9]{8}$/;

    if (!input.value.trim()) {
        showSoftError(input, "Mobile number is required.");
        return false;
    }

    if (!re.test(input.value.trim())) {
        showSoftError(input, "Mobile number must start with 05 and contain 10 digits.");
        return false;
    }

    clearSoftError(input);
    return true;
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

    //Sign Up - Step 1 Verification
    document.getElementById("nextStep1")?.addEventListener("click", () => {
        const emailField = document.getElementById("email");
        const passField = document.getElementById("password");

        if (validateEmail(emailField) && validatePassword(passField)) {
            fetch('/check-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailField.value })
            })
                .then(res => {
                    if (!res.ok) throw new Error("Server Error");
                    return res.json();
                })
                .then(data => {
                    if (data.exists) {
                        showSoftError(emailField, "This email is already registered.");
                    } else {
                        goToStep(2);
                    }
                })
                .catch(err => alert("Connection Error: Check if the server is running."));
        }
    });

    //Sign Up - Step 2 Verification
    document.getElementById("nextStep2")?.addEventListener("click", () => {
    const isFnameOk = validateRequired(document.getElementById("firstName"), "First name required.");
    const isLnameOk = validateRequired(document.getElementById("lastName"), "Last name required.");
    const isGenderOk = validateRequired(document.getElementById("gender"), "Please select gender.");
    const isDobOk = validateRequired(document.getElementById("dob"), "Date of birth is required.");
    const isMobileOk = validateMobile(document.getElementById("mobile"));
    const isCityOk = validateRequired(document.getElementById("city"), "City selection required.");
    const isNationalityOk = validateRequired(document.getElementById("nationality"), "Nationality required.");

    if (isFnameOk && isLnameOk && isGenderOk && isDobOk && isMobileOk && isCityOk && isNationalityOk) {
        goToStep(3);
    }
});

    // Back Navigation
    document.getElementById("backStep2")?.addEventListener("click", () => goToStep(1));
    document.getElementById("backStep3")?.addEventListener("click", () => goToStep(2));



//Backend Communication AJAX - Fetch
    //Sign Up Submission - step 3
  document.getElementById("submitSignUp")?.addEventListener("click", function () {
    const bloodField = document.getElementById("bloodType");
    const countField = document.getElementById("donationCount");
    const availField = document.getElementById("availability");
    const isBloodOk = validateRequired(bloodField, "Blood type selection required.");
    const isCountOk = validateRequired(countField, "Please select how many times you donated.");
    const isAvailOk = validateRequired(availField, "Please select your availability status.");

    if (isBloodOk && isCountOk && isAvailOk) {
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
            bloodType: bloodField.value,
            lastDonation: document.getElementById("lastDonation").value || null,
            donationCount: countField.value,
            availability: availField.value
        };

        fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(res => {
            if (!res.ok) { alert("Registration Failed: Server error."); return; }
            return res.json();
        })
        .then(data => {
            if (data.success) {
                localStorage.setItem("userName", data.firstName);
                document.getElementById("step3").style.display = "none";
                document.getElementById("successMsg").style.display = "block";
                setTimeout(() => { window.location.href = "index.html"; }, 2500);
            } else { alert("Error: " + data.message); }
        })
        .catch(err => alert("Server offline."));
    } 
});

//Sign In Submission
    signInForm?.addEventListener("submit", function (e) {
        e.preventDefault();
        const em = document.getElementById("siEmail"); 
        const ps = document.getElementById("siPassword"); 

        if (validateEmail(em) && validatePassword(ps)) {
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
                        if (data.message.toLowerCase().includes("password") || data.message.includes("Password")) {
                            showSoftError(ps, data.message);
                        } else {
                            showSoftError(em, data.message); 
                        }
                    }
                })
                .catch(err => alert("Connection to server failed."));
        }
    });

//Avatar Update
(function updateAvatar() {
    const savedName = localStorage.getItem("userName");
    if (savedName) {
        const navBtn = document.querySelector(".nav-btn-dark");
        const navWrapper = document.querySelector(".nav-wrapper");
        const heroBtnArea = document.querySelector(".hero-buttons");

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

        if (heroBtnArea) {
            heroBtnArea.style.display = "none";
        }
    }
})();



//Search Donors
if (donorSearchBtn) {
    donorSearchBtn.addEventListener("click", async () => {
        const bloodTypeField = document.getElementById("bloodType");
        const cityField = document.getElementById("city");
        const resultsList = document.getElementById("results-list");
        const resultsMeta = document.querySelector(".results-meta");
        const donorCard = document.getElementById("donorCard"); 
        const noResults = document.getElementById("no-results");

        clearSoftError(bloodTypeField);
        clearSoftError(cityField);
        const isBloodValid = bloodTypeField.value.trim() !== "";
        const isCityValid = cityField.value.trim() !== "";

        if (!isBloodValid) showSoftError(bloodTypeField, "Please select Blood Type.");
        if (!isCityValid) showSoftError(cityField, "Please select City.");
        if (!isBloodValid || !isCityValid){
        resultsList.innerHTML = "";
        resultsMeta.textContent = "0 Heroes available for donation";
        return;
        }


        let url = `/search-donors?bloodType=${encodeURIComponent(bloodTypeField.value)}&city=${encodeURIComponent(cityField.value)}`;

        try {
            const response = await fetch(url);
            if (!response.ok) { alert("Database connection failed."); return; }

            const donors = await response.json();

            resultsList.innerHTML = "";
            resultsMeta.textContent = `${donors.length} Heroes available for donation`;

            if (donors.length === 0) {
                const noMsg = noResults.cloneNode(true);
                noMsg.style.display = "block";
                resultsList.appendChild(noMsg);
                return;
            }

            donors.forEach(donor => {
                if (donorCard) {
                    const newCard = donorCard.cloneNode(true);
                    newCard.style.display = "flex";
                    newCard.id = ""; 
                    newCard.querySelector(".blood-badge").textContent = donor.blood_type;
                    newCard.querySelector(".donor-name").textContent = `${donor.first_name} ${donor.last_name}`;
                    newCard.querySelector(".donor-city").textContent = donor.city;
                    newCard.querySelector(".contact-link").href = `tel:${donor.mobile}`;
                    resultsList.appendChild(newCard);
                }
            });
        } catch (error) {
            console.error("Search Error:", error);
            alert("Server is offline.");
        }
    });
}

    //Contact Us  
    if (contactForm) {
        contactForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const fName = document.getElementById("firstName");
            const lName = document.getElementById("lastName");
            const mobile = document.getElementById("mobile");
            const email = document.getElementById("email");
            const language = document.getElementById("language");
            const message = document.getElementById("message");

            let isFormValid = true;
            if (!fName.value.trim()) { showSoftError(fName, "First name is required."); isFormValid = false; }
            if (!lName.value.trim()) { showSoftError(lName, "Last name is required."); isFormValid = false; }
            if (!validateMobile(mobile)) { isFormValid = false; }
            if (!validateEmail(email)) { isFormValid = false; }
            if (!language.value) { showSoftError(language, "Please select your preferred language."); isFormValid = false; }
            if (message.value.trim().length < 10) { showSoftError(message, "Message too short."); isFormValid = false; }

            if (isFormValid) {
                try {
                    const formData = new FormData(contactForm);
                    const response = await fetch('/contact', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(Object.fromEntries(formData))
                    });
                    if (response.ok) {
                        contactForm.style.display = "none";
                        document.getElementById("contact-Success-Msg").style.display = "block";
                    } else { alert("Could not send message."); }
                } catch (err) { alert("Failed to reach server."); }
            }
        });
    }

    document.querySelectorAll("input, select, textarea").forEach(el => {
        el.addEventListener("input", () => clearSoftError(el));
    });

//Handel Enter key
document.getElementById("step1")?.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        document.getElementById("nextStep1").click();
    }
});

document.getElementById("step2")?.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        document.getElementById("nextStep2").click();
    }
});

document.getElementById("step3")?.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        document.getElementById("submitSignUp").click();
    }
});

document.querySelector(".search-filter-form")?.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        document.getElementById("searchBtn").click();
    }
});

document.getElementById("contactForm")?.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        if (e.target.id !== "message") {
            e.preventDefault();
            document.querySelector(".send-btn").click();
        }
    }
});
});