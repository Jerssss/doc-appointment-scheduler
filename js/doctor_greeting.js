document.addEventListener("DOMContentLoaded", () => {
  try {
    const raw = sessionStorage.getItem("user");
    if (!raw) {
      console.warn("No user in sessionStorage");
      return;
    }

    const doctor = JSON.parse(raw);

    // Check role (handle both new login format and updated format from loadDoctorInfo)
    const userRole = doctor.role || doctor.user_role;
    if (userRole !== "doctor") {
      // keep existing behavior from your other script
      alert("Please log in as a doctor.");
      window.location.href = "login.html";
      return;
    }

    // Convert the user ID object into a string if necessary
    const doctorId =
      typeof doctor.user_id === "object" && doctor.user_id?.$oid
        ? doctor.user_id.$oid
        : doctor.user_id;

    console.log("Doctor ID (greeting):", doctorId);
    console.log("Doctor role (greeting):", userRole);

    // Load doctor info from backend and update greeting
    async function loadDoctorInfo() {
      try {
        const res = await fetch(
          `includes/get_doctor_by_id.php?user_id=${encodeURIComponent(doctorId)}`
        );
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        return data;
      } catch (err) {
        console.error("loadDoctorInfo error:", err);
        return { error: err.message || String(err) };
      }
    }

    const doctorGreeting = document.getElementById("doctorGreeting");
    if (!doctorGreeting) {
      console.warn("doctorGreeting element not found");
      return;
    }

    // Try to get nicer name from server — but fallback to session user data
    loadDoctorInfo().then((fullDoctor) => {
      if (!fullDoctor || fullDoctor.error) {
        console.warn("Could not load full doctor info:", fullDoctor?.error);
        // fallback: prefer personal_info.full_name, then username fields
        const fallbackName =
          doctor?.personal_info?.full_name ||
          doctor?.full_name ||
          doctor?.user_name ||
          doctor?.username ||
          "";
        if (fallbackName && fallbackName.trim()) {
          doctorGreeting.textContent = `Hello, ${fallbackName.trim()}`;
        } else {
          doctorGreeting.textContent = "Hello, Doctor";
        }
        return;
      }

      // update session storage with fuller doctor data (keeps it consistent for other pages)
      try {
        sessionStorage.setItem("user", JSON.stringify(fullDoctor));
      } catch (e) {
        console.warn("Could not update sessionStorage with full doctor:", e);
      }

      // Choose display name: prefer full_name from server, then user_name, then session username
      const displayName =
        fullDoctor.full_name ||
        fullDoctor.user_name ||
        doctor?.personal_info?.full_name ||
        doctor?.full_name ||
        doctor?.user_name ||
        doctor?.username ||
        "";

      // If displayName is empty, fallback
      if (displayName && String(displayName).trim()) {
        // If you want the entire full name, use it as-is:
        doctorGreeting.textContent = `Hello, ${String(displayName).trim()}`;
        console.log("Greeting set to:", displayName);
      } else {
        doctorGreeting.textContent = "Hello, Doctor";
        console.log("Greeting fallback used");
      }
    });
  } catch (err) {
    console.error("Greeting script error:", err);
  }
});
