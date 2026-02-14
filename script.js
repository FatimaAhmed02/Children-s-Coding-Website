document.addEventListener("DOMContentLoaded", async function () {
    checkUserStatus();
    await loadUserProgress();  
});

//show Login and Register popup
function showPopup(type) {
    document.getElementById("authPopup").style.display = "block";
    document.getElementById("popupTitle").textContent = type === "login" ? "Login" : "Register";
    document.getElementById("loginForm").style.display = type === "login" ? "block" : "none";
    document.getElementById("registerForm").style.display = type === "register" ? "block" : "none";
}


function closePopup() {
    document.getElementById("authPopup").style.display = "none";
}

// Register User 
async function register() {
    let email = document.getElementById("registerEmail").value.trim();
    let username = document.getElementById("registerUsername").value.trim();
    let password = document.getElementById("registerPassword").value;

    if (!email || !username || !password) {
        showNotification("Please fill in all fields!", "error");
        return;
    }

    try {
        let response = await fetch("http://localhost:5000/api/users/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, username, password })
        });

        let data = await response.json();  

        if (response.ok) {
            showNotification(data.msg, "success");
            showPopup("login");
        } else {
            showNotification(data.error || data.msg, "error");
        }
    } catch (error) {
        showNotification("Error connecting to server!", "error");
    }
}

// Login User 
async function login() {
    let username = document.getElementById("loginUsername").value.trim();
    let password = document.getElementById("loginPassword").value;

    if (!username || !password) {
        showNotification("Please enter both username and password!", "error");
        return;
    }

    try {
        let response = await fetch("http://localhost:5000/api/users/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        let data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.user.username);
            showNotification("Login successful! Welcome, " + data.user.username, "success");

            checkUserStatus();
            await loadUserProgress(); 
            closePopup();
        } else {
            showNotification(data.error || data.msg, "error");
        }
    } catch (error) {
        showNotification("Error connecting to server!", "error");
    }
}

// Check User Login Status
function checkUserStatus() {
    let loggedInUser = localStorage.getItem("username");
    let authButtons = document.querySelector(".auth-buttons");
    let logoutButton = document.querySelector(".logout-btn");

    if (loggedInUser) {
        authButtons.style.display = "none";
        logoutButton.style.display = "block";
    } else {
        authButtons.style.display = "flex";
        logoutButton.style.display = "none";
    }
}

// Logout User
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    showNotification("You have been logged out!", "info");
    checkUserStatus();
}

// show notification
function showNotification(message, type) {
    let notification = document.createElement("div");
    notification.classList.add("notification", type);
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

//load lesson progress from  the backend
async function loadLessonProgress() {
    let username = localStorage.getItem("username");
    if (!username) return;

    try {
        let response = await fetch(`http://localhost:5000/api/users/profile/${username}`);
        let data = await response.json();

        if (response.ok) {
            updateLessonTracker(data.meritPoints);
        }
    } catch (error) {
        console.error("Error fetching progress:", error);
    }
}


// update lesson tracker
function updateLessonTracker(meritPoints) {
    let lessonStatus = ["lesson1Status", "lesson2Status", "lesson3Status", "lesson4Status"];

    lessonStatus.forEach((id, index) => {
        let lessonCompleted = meritPoints > index;  // If merit points > index, lesson is complete
        document.getElementById(id).textContent = lessonCompleted ? "✔️" : "✖️";
    });

    // update progress bar
    let progress = (meritPoints / 4) * 100; 
    document.getElementById("progressBar").style.width = progress + "%";
}


document.addEventListener("DOMContentLoaded", async function () {
    await loadLessonProgress();
});


// load user progress from the backend
async function loadUserProgress() {
    let username = localStorage.getItem("username");
    if (!username) return;

    try {
        let response = await fetch(`http://localhost:5000/api/users/profile/${username}`);
        let data = await response.json();
        if (response.ok) {
            if (document.getElementById("meritPoints")) {
                document.getElementById("meritPoints").textContent = data.meritPoints;
            }
            updateBadgeDisplay(data.badges);
        }
    } catch (error) {
        console.error("Error fetching progress:", error);
    }
}

//update badges
function updateBadgeDisplay(badges) {
    let badgeContainer = document.getElementById("badgeContainer");
    badgeContainer.innerHTML = "";

    if (badges.length === 0) {
        badgeContainer.innerHTML = "<p>No badges earned yet.</p>";
    } else {
        badges.forEach(badge => {
            let badgeElement = document.createElement("div");
            badgeElement.classList.add("badge");
            badgeElement.innerHTML = `<p>${badge}</p>`;
            badgeContainer.appendChild(badgeElement);
        });
    }
}

//reset progress
async function resetProgress() {
    let username = localStorage.getItem("username");
    if (!username) {
        showNotification("You must be logged in to reset progress!", "error");
        return;
    }

    try {
        let response = await fetch("http://localhost:5000/api/users/reset-progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username })
        });

        let data = await response.json();

        if (response.ok) {
            showNotification("Progress reset successfully!", "success");
            document.getElementById("meritPoints").textContent = "0";
            updateBadgeDisplay([]);
        } else {
            // Display backend error message if available
            showNotification(`❌ ${data.error || "Error resetting progress!"}`, "error");
            console.error("❌ Backend responded with error:", data.error);
        }
    } catch (error) {
        // Catch fetch/network errors
        console.error("❌ Network or server error:", error);
        showNotification("❌ Failed to connect to the server.", "error");
    }
}


//toggle menu
document.addEventListener("DOMContentLoaded", function () {
    let resetButton = document.querySelector(".reset-btn");
    if (resetButton) {
        resetButton.addEventListener("click", resetProgress);
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");

    if (hamburger && navLinks) {
        hamburger.addEventListener("click", function () {
            navLinks.classList.toggle("show");
        });

        document.querySelectorAll(".nav-links a").forEach(link => {
            link.addEventListener("click", function () {
                navLinks.classList.remove("show");
            });
        });
    }
});



