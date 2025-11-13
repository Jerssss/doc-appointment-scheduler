document.addEventListener("DOMContentLoaded", () => {
    // Buttons
    const viewButton = document.getElementById("viewAccounts");
    const addButton = document.getElementById("addAccount");
    const editButton = document.querySelector(".card.edit .card-btn");
    const deleteButton = document.querySelector(".card.delete .card-btn");

    // Create a single popup dynamically
    const popup = document.createElement("div");
    popup.classList.add("popup");
    document.body.appendChild(popup);

    /** ------------------ VIEW USERS ------------------ **/
    viewButton.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("includes/get_users.php");
            const data = await response.json();

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
                        <tbody>
                            ${data.status === "success" && data.data.length > 0
                                ? data.data.map(user => `
                                    <tr>
                                        <td>${user.user_id}</td>
                                        <td>${user.user_name}</td>
                                        <td>${user.user_email}</td>
                                        <td>${user.role}</td>
                                    </tr>`).join('')
                                : `<tr><td colspan="4">No users found.</td></tr>`}
                        </tbody>
                    </table>
                    <button class="close-btn">Close</button>
                </div>
            `;
            popup.style.display = "flex";
            popup.querySelector(".close-btn").addEventListener("click", () => popup.style.display = "none");

        } catch (err) {
            console.error("Failed to fetch users:", err);
            alert("Error fetching users.");
        }
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
        popup.querySelector(".close-btn").addEventListener("click", () => popup.style.display = "none");

        document.getElementById("add-user-form").addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = Object.fromEntries(new FormData(e.target).entries());
            try {
                const res = await fetch("includes/add_user.php", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData)
                });
                const result = await res.json();
                alert(result.message);
                if (result.status === "success") popup.style.display = "none";
            } catch (err) {
                console.error("Failed to add user:", err);
                alert("Error adding user.");
            }
        });
    });

    /** ------------------ EDIT USER ------------------ **/
    editButton.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("includes/get_users.php");
            const data = await response.json();

            if (data.status === "success" && data.data.length > 0) {
                popup.innerHTML = `
                    <div class="popup-content">
                        <h3>Edit Users</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.data.map(user => `
                                    <tr>
                                        <td>${user.user_id}</td>
                                        <td><input type="text" value="${user.user_name}" data-id="${user.user_id}" class="edit-name"></td>
                                        <td><input type="email" value="${user.user_email}" data-id="${user.user_id}" class="edit-email"></td>
                                        <td>
                                            <select data-id="${user.user_id}" class="edit-role">
                                                <option value="admin" ${user.role === "admin" ? "selected" : ""}>Admin</option>
                                                <option value="doctor" ${user.role === "doctor" ? "selected" : ""}>Doctor</option>
                                                <option value="patient" ${user.role === "patient" ? "selected" : ""}>Patient</option>
                                            </select>
                                        </td>
                                        <td>
                                            <button class="save-user-btn" data-id="${user.user_id}">Save</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        <button class="close-btn">Close</button>
                    </div>
                `;
                popup.style.display = "flex";

                // Save handlers
                popup.querySelectorAll(".save-user-btn").forEach(btn => {
                    btn.addEventListener("click", async () => {
                        const userId = btn.getAttribute("data-id");
                        const updatedData = {
                            user_id: userId,
                            user_name: popup.querySelector(`.edit-name[data-id="${userId}"]`).value,
                            user_email: popup.querySelector(`.edit-email[data-id="${userId}"]`).value,
                            role: popup.querySelector(`.edit-role[data-id="${userId}"]`).value
                        };
                        if (confirm("Save changes for this user?")) {
                            try {
                                const res = await fetch("includes/edit_user.php", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify(updatedData)
                                });
                                const result = await res.json();
                                alert(result.message);
                                if (result.status === "success") btn.closest("tr").querySelector(".edit-name").value = updatedData.user_name;
                            } catch (err) {
                                console.error("Failed to update user:", err);
                                alert("Error updating user.");
                            }
                        }
                    });
                });

                popup.querySelector(".close-btn").addEventListener("click", () => popup.style.display = "none");

            } else {
                popup.innerHTML = `<div class="popup-content"><h3>No users found.</h3><button class="close-btn">Close</button></div>`;
                popup.style.display = "flex";
                popup.querySelector(".close-btn").addEventListener("click", () => popup.style.display = "none");
            }

        } catch (err) {
            console.error("Failed to fetch users:", err);
            alert("Error fetching users.");
        }
    });

    /** ------------------ DELETE USER ------------------ **/
    deleteButton.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("includes/get_users.php");
            const data = await response.json();

            if (data.status === "success" && data.data.length > 0) {
                popup.innerHTML = `
                    <div class="popup-content">
                        <h3>Delete Users</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.data.map(user => `
                                    <tr>
                                        <td>${user.user_id}</td>
                                        <td>${user.user_name}</td>
                                        <td>${user.user_email}</td>
                                        <td>${user.role}</td>
                                        <td>
                                            <button class="delete-user-btn" data-id="${user.user_id}">Delete</button>
                                        </td>
                                    </tr>`).join('')}
                            </tbody>
                        </table>
                        <button class="close-btn">Close</button>
                    </div>
                `;
                popup.style.display = "flex";

                // Delete handlers
                popup.querySelectorAll(".delete-user-btn").forEach(btn => {
                    btn.addEventListener("click", async () => {
                        const userId = btn.getAttribute("data-id");
                        if (confirm("Are you sure you want to delete this user?")) {
                            try {
                                const res = await fetch("includes/delete_user.php", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ user_id: userId })
                                });
                                const result = await res.json();
                                alert(result.message);
                                if (result.status === "success") btn.closest("tr").remove();
                            } catch (err) {
                                console.error("Failed to delete user:", err);
                                alert("Error deleting user.");
                            }
                        }
                    });
                });

                popup.querySelector(".close-btn").addEventListener("click", () => popup.style.display = "none");

            } else {
                popup.innerHTML = `<div class="popup-content"><h3>No users found.</h3><button class="close-btn">Close</button></div>`;
                popup.style.display = "flex";
                popup.querySelector(".close-btn").addEventListener("click", () => popup.style.display = "none");
            }

        } catch (err) {
            console.error("Failed to fetch users:", err);
            alert("Error fetching users.");
        }
    });
});
