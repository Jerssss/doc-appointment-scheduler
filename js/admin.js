document.addEventListener("DOMContentLoaded", () => {
    // Buttons
    const viewButton = document.getElementById("viewAccounts");
    const addButton = document.getElementById("addAccount");


    // Create a single popup dynamically
    const popup = document.createElement("div");
    popup.classList.add("popup");
    document.body.appendChild(popup);


    /** ------------------ VIEW USERS ------------------ **/
    viewButton.addEventListener("click", async (e) => {
        e.preventDefault();


        popup.innerHTML = `
            <div class="popup-content">
                <h3>Registered Users</h3>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                        </tr>
                    </thead>
                    <tbody id="user-table-body"></tbody>
                </table>
                <button class="close-btn">Close</button>
            </div>
        `;
        popup.style.display = "flex";


        try {
            const response = await fetch("includes/get_users.php");
            const data = await response.json();


            const tbody = document.getElementById("user-table-body");


            if (data.status === "success" && data.data.length > 0) {
                tbody.innerHTML = data.data.map(user => `
                    <tr>
                        <td>${user.user_id}</td>
                        <td>${user.user_name}</td>
                        <td>${user.user_email}</td>
                        <td>${user.role}</td>
                    </tr>
                `).join("");
            } else {
                tbody.innerHTML = `<tr><td colspan="4">No users found.</td></tr>`;
            }
        } catch (err) {
            console.error("Failed to fetch users:", err);
            document.getElementById("user-table-body").innerHTML = `<tr><td colspan="4">Error fetching users.</td></tr>`;
        }


        // Close popup
        document.querySelector(".close-btn").addEventListener("click", () => {
            popup.style.display = "none";
        });
    });


    /** ------------------ ADD USER ------------------ **/
    addButton.addEventListener("click", (e) => {
        e.preventDefault();


        popup.innerHTML = `
            <div class="popup-content">
                <h3>Add New User</h3>
                <form id="add-user-form">
                    <label>Username:</label>
                    <input type="text" name="user_name" required>


                    <label>Email:</label>
                    <input type="email" name="user_email" required>


                    <label>Password:</label>
                    <input type="password" name="password" required>


                    <label>Role:</label>
                    <select name="role" required>
                        <option value="admin">Admin</option>
                        <option value="doctor">Doctor</option>
                        <option value="patient">Patient</option>
                    </select>


                    <button type="submit" class="submit-btn">Add User</button>
                </form>
                <button class="close-btn">Close</button>
            </div>
        `;
        popup.style.display = "flex";


        // Close popup
        document.querySelector(".close-btn").addEventListener("click", () => {
            popup.style.display = "none";
        });


        // Handle form submission
        document.getElementById("add-user-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());


            try {
                const response = await fetch("includes/add_user.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });


                const result = await response.json();
                alert(result.message);


                if (result.status === "success") {
                    popup.style.display = "none";
                }
            } catch (err) {
                console.error("Failed to add user:", err);
                alert("Error adding user.");
            }
        });
    });
});
