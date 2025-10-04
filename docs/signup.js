document.getElementById("signupForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const res = await fetch("http://localhost:5000/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();
        if (res.status === 201) {
            alert("Signup successful! Redirecting to login...");
            window.location.href = "index.html";
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert("Server error, try again later!");
    }
});
