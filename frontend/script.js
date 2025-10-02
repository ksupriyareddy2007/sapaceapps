document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const res = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();

        if (res.status === 200) {
            alert(`Welcome, ${data.user.name}! Redirecting to dashboard...`);
            window.location.href = "home.html"; // We'll create this next
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert("Server not responding!");
    }
});
