document.addEventListener("DOMContentLoaded", () => {
    const viewButton = document.getElementById("viewAccounts");
    const addButton = document.getElementById("addAccount");
    const editButton = document.querySelector(".card.edit .card-btn");
    const deleteButton = document.querySelector(".card.delete .card-btn");

    const popup = document.createElement("div");
    popup.classList.add("popup");
    document.body.appendChild(popup);

    /** ------------------ VIEW USERS ------------------ **/
    viewButton.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("includes/get_users.php");
            const data = await res.json();

            if (!(data.status === "success" && data.data.length > 0)) {
                popup.innerHTML = `<div class="popup-content"><h3>No users found.</h3><button class="close-btn">Close</button></div>`;
                popup.style.display = "flex";
                popup.querySelector(".close-btn").addEventListener("click", () => popup.style.display = "none");
                return;
            }

            const tableRows = data.data.map(user => {
                let username = "", email = "";
                if (user.role === "admin") {
                    username = user.user_name;
                    email = user.user_email;
                } else {
                    username = user.user_name || user.username || "";
                    email = user.user_email || user.email || "";
                }
                return `
                    <tr>
                        <td>${user.user_id.$oid}</td>
                        <td>${username}</td>
                        <td>${email}</td>
                        <td>${user.role}</td>
                    </tr>
                `;
            }).join("");

            popup.innerHTML = `
                <div class="popup-content">
                    <h3>Registered Users</h3>
                    <table>
                        <thead>
                            <tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th></tr>
                        </thead>
                        <tbody>${tableRows}</tbody>
                    </table>
                    <button class="close-btn">Close</button>
                </div>
            `;
            popup.style.display = "flex";
            popup.querySelector(".close-btn").addEventListener("click", () => popup.style.display = "none");

        } catch (err) {
            console.error("Error fetching users:", err);
            alert("Failed to fetch users.");
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
                <input type="text" name="username" required>
                <label>Email:</label>
                <input type="email" name="email" required>
                <label>Password:</label>
                <input type="password" name="password" required>
                <label>Role:</label>
                <select name="role" required>
                    <option value="admin">Admin</option>
                    <option value="doctor">Doctor</option>
                    <option value="patient">Patient</option>
                </select>
                <hr>
                <h4>Personal Info</h4>
                <label>Full Name:</label>
                <input type="text" name="full_name">
                <label>Date of Birth:</label>
                <input type="date" name="date_of_birth">
                <label>Sex:</label>
                <select name="sex">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
                <label>Address:</label>
                <input type="text" name="address">
                <hr>
                <h4>Contact Info</h4>
                <label>Phone:</label>
                <input type="text" name="phone">
                <hr>
                <h4>Emergency Contact</h4>
                <label>Name:</label>
                <input type="text" name="emergency_name">
                <label>Relationship:</label>
                <input type="text" name="emergency_relationship">
                <label>Phone:</label>
                <input type="text" name="emergency_phone">
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
        let payload = {};

        if (formData.role === "admin") {
            // Flattened fields for admin
            payload = {
                user_name: formData.username,
                user_email: formData.email,
                password: formData.password,
                role: formData.role
            };
        } else {
            // Nested fields for patient/doctor
            payload = {
                username: formData.username,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                personal_info: {
                    full_name: formData.full_name || "",
                    date_of_birth: formData.date_of_birth || "",
                    sex: formData.sex || "",
                    address: formData.address || ""
                },
                contact_info: {
                    phone: formData.phone || ""
                },
                emergency_contact: {
                    name: formData.emergency_name || "",
                    relationship: formData.emergency_relationship || "",
                    phone: formData.emergency_phone || ""
                }
            };
        }

        try {
            const res = await fetch("includes/add_user.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const result = await res.json();
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


/** ------------------ EDIT USERS ------------------ **/
    editButton.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("includes/get_users.php");
            const data = await res.json();
            if (!(data.status === "success" && data.data.length > 0)) {
                popup.innerHTML = `<div class="popup-content"><h3>No users found.</h3><button class="close-btn">Close</button></div>`;
                popup.style.display = "flex";
                popup.querySelector(".close-btn").addEventListener("click", () => popup.style.display = "none");
                return;
            }

            const rows = data.data.map(user => {
                let uname = user.user_name || user.username || "";
                let uemail = user.user_email || user.email || "";
                return `
                    <tr>
                        <td>${user.user_id.$oid}</td>
                        <td><input type="text" class="edit-name" data-id="${user.user_id.$oid}" value="${uname}"></td>
                        <td><input type="email" class="edit-email" data-id="${user.user_id.$oid}" value="${uemail}"></td>
                        <td>
                            <select class="edit-role" data-id="${user.user_id.$oid}">
                                <option value="admin" ${user.role === "admin" ? "selected" : ""}>Admin</option>
                                <option value="doctor" ${user.role === "doctor" ? "selected" : ""}>Doctor</option>
                                <option value="patient" ${user.role === "patient" ? "selected" : ""}>Patient</option>
                            </select>
                        </td>
                        <td><button class="save-user-btn" data-id="${user.user_id.$oid}">Save</button></td>
                    </tr>
                `;
            }).join("");

            popup.innerHTML = `<div class="popup-content">
                <h3>Edit Users</h3>
                <table><thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Action</th></tr></thead>
                <tbody>${rows}</tbody></table>
                <button class="close-btn">Close</button>
            </div>`;
            popup.style.display = "flex";

            // Save handler
            popup.querySelectorAll(".save-user-btn").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const id = btn.getAttribute("data-id");
                    const updatedData = {
                        user_id: id,
                        user_name: popup.querySelector(`.edit-name[data-id="${id}"]`).value,
                        user_email: popup.querySelector(`.edit-email[data-id="${id}"]`).value,
                        role: popup.querySelector(`.edit-role[data-id="${id}"]`).value,
                    };
                    if (!confirm("Save changes?")) return;
                    try {
                        const res = await fetch("includes/edit_user.php", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(updatedData)
                        });
                        const result = await res.json();
                        alert(result.message);
                    } catch (err) {
                        console.error("Error saving user:", err);
                        alert("Failed to save user.");
                    }
                });
            });

            popup.querySelector(".close-btn").addEventListener("click", () => popup.style.display = "none");

        } catch (err) {
            console.error("Error fetching users:", err);
            alert("Failed to fetch users.");
        }
    });


  /** ------------------ DELETE USERS ------------------ **/
    deleteButton.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("includes/get_users.php");
            const data = await res.json();
            if (!(data.status === "success" && data.data.length > 0)) {
                popup.innerHTML = `<div class="popup-content"><h3>No users found.</h3><button class="close-btn">Close</button></div>`;
                popup.style.display = "flex";
                popup.querySelector(".close-btn").addEventListener("click", () => popup.style.display = "none");
                return;
            }

            const rows = data.data.map(user => {
                let uname = user.user_name || user.username || "";
                let uemail = user.user_email || user.email || "";
                return `
                    <tr>
                        <td>${user.user_id.$oid}</td>
                        <td>${uname}</td>
                        <td>${uemail}</td>
                        <td>${user.role}</td>
                        <td><button class="delete-user-btn" data-id="${user.user_id.$oid}">Delete</button></td>
                    </tr>
                `;
            }).join("");

            popup.innerHTML = `<div class="popup-content">
                <h3>Delete Users</h3>
                <table><thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Action</th></tr></thead>
                <tbody>${rows}</tbody></table>
                <button class="close-btn">Close</button>
            </div>`;
            popup.style.display = "flex";

            popup.querySelectorAll(".delete-user-btn").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const id = btn.getAttribute("data-id");
                    if (!confirm("Delete this user?")) return;
                    try {
                        const res = await fetch("includes/delete_user.php", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ user_id: id })
                        });
                        const result = await res.json();
                        alert(result.message);
                        if (result.status === "success") btn.closest("tr").remove();
                    } catch (err) {
                        console.error("Error deleting user:", err);
                        alert("Failed to delete user.");
                    }
                });
            });

            popup.querySelector(".close-btn").addEventListener("click", () => popup.style.display = "none");

        } catch (err) {
            console.error("Error fetching users:", err);
            alert("Failed to fetch users.");
        }
    });
});
