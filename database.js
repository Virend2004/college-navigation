/* ==========================================================================
   GL BAJAJ - Database & Full API Client Module
   File: database.js
   Supports both:
   1. Python SQLite REST Backend (when running via server.py at http://localhost:5000)
   2. Standalone Client-Side Persistent Database & Geolocation (Offline mode)
   ========================================================================== */

const CollegeDB = (function () {
    const DB_KEY = "GL_BAJAJ_USERS_DB";
    const SESSION_KEY = "GL_BAJAJ_ACTIVE_SESSION";
    const TOKEN_KEY = "GL_BAJAJ_AUTH_TOKEN";

    // Campus Coordinates (GL Bajaj, Knowledge Park III, Greater Noida)
    const CAMPUS_COORDS = { lat: 28.4727, lng: 77.4891 };

    // Standard Preset Institutional Avatars (SVG Data URIs)
    const DEFAULT_AVATARS = {
        student: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20100%20100%22%20width%3D%22100%22%20height%3D%22100%22%3E%0A%20%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2248%22%20fill%3D%22%230771db%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%224%22/%3E%0A%20%20%3Ctext%20x%3D%2250%22%20y%3D%2258%22%20font-size%3D%2242%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3E%F0%9F%8E%93%3C/text%3E%0A%3C/svg%3E",
        student_female: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20100%20100%22%20width%3D%22100%22%20height%3D%22100%22%3E%0A%20%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2248%22%20fill%3D%22%23ec4899%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%224%22/%3E%0A%20%20%3Ctext%20x%3D%2250%22%20y%3D%2258%22%20font-size%3D%2242%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3E%F0%9F%91%A9%E2%80%8D%F0%9F%8E%93%3C/text%3E%0A%3C/svg%3E",
        faculty: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20100%20100%22%20width%3D%22100%22%20height%3D%22100%22%3E%0A%20%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2248%22%20fill%3D%22%23059669%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%224%22/%3E%0A%20%20%3Ctext%20x%3D%2250%22%20y%3D%2258%22%20font-size%3D%2242%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3E%F0%9F%91%A8%E2%80%8D%F0%9F%8F%AB%3C/text%3E%0A%3C/svg%3E",
        faculty_female: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20100%20100%22%20width%3D%22100%22%20height%3D%22100%22%3E%0A%20%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2248%22%20fill%3D%22%230d9488%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%224%22/%3E%0A%20%20%3Ctext%20x%3D%2250%22%20y%3D%2258%22%20font-size%3D%2242%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3E%F0%9F%91%A9%E2%80%8D%F0%9F%8F%AB%3C/text%3E%0A%3C/svg%3E",
        staff: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20100%20100%22%20width%3D%22100%22%20height%3D%22100%22%3E%0A%20%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2248%22%20fill%3D%22%237c3aed%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%224%22/%3E%0A%20%20%3Ctext%20x%3D%2250%22%20y%3D%2258%22%20font-size%3D%2242%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3E%F0%9F%9B%A1%EF%B8%8F%3C/text%3E%0A%3C/svg%3E",
        tech: "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20100%20100%22%20width%3D%22100%22%20height%3D%22100%22%3E%0A%20%20%3Ccircle%20cx%3D%2250%22%20cy%3D%2250%22%20r%3D%2248%22%20fill%3D%22%230284c7%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%224%22/%3E%0A%20%20%3Ctext%20x%3D%2250%22%20y%3D%2258%22%20font-size%3D%2242%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3E%F0%9F%92%BB%3C/text%3E%0A%3C/svg%3E"
    };

    // Default Seed Accounts for Testing
    const DEFAULT_ACCOUNTS = [
        {
            id: 1,
            fullname: "Aarav Sharma",
            username: "student",
            email: "student@glbitm.org",
            password: "student123",
            role: "student",
            idNumber: "230192010045",
            department: "Computer Science & Engineering",
            avatar: DEFAULT_AVATARS.student,
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            fullname: "Dr. Vivek Verma",
            username: "faculty",
            email: "faculty@glbitm.org",
            password: "faculty123",
            role: "faculty",
            idNumber: "GLB-FAC-108",
            department: "Information Technology",
            avatar: DEFAULT_AVATARS.faculty,
            createdAt: new Date().toISOString()
        },
        {
            id: 3,
            fullname: "Admin Office",
            username: "admin",
            email: "admin@glbitm.org",
            password: "admin123",
            role: "staff",
            idNumber: "GLB-ADM-001",
            department: "Administration & Registrar",
            avatar: DEFAULT_AVATARS.staff,
            createdAt: new Date().toISOString()
        }
    ];

    // Default Campus GPS Blocks Data
    const DEFAULT_BLOCKS = [
        {
            block_key: "ctmA",
            name: "🏢 CTM Block A",
            category: "Management & Corporate Wing",
            floors_count: 10,
            latitude: 28.4732,
            longitude: 77.4893,
            description: "10-story tower housing MBA, Corporate Placement Cell (T&P), Financial Analytics Labs, and Boardrooms.",
            elevator_info: "Lift A (All Floors 1-10), Lift B (Express: Floors 8, 9, 10 Only), Lift C (Floors 1-6 Only)"
        },
        {
            block_key: "ctmB",
            name: "🏢 CTM Block B",
            category: "Technology & Innovation Wing",
            floors_count: 10,
            latitude: 28.4730,
            longitude: 77.4898,
            description: "10-story tower housing MCA, Artificial Intelligence GPU Labs, Atal Startup Incubation Hub, and Hackathon Arena.",
            elevator_info: "Lift A (All Floors 1-10), Lift B (Express: Floors 8, 9, 10 Only), Lift C (Floors 1-6 Only)"
        },
        {
            block_key: "block1",
            name: "💻 Academic Block 1",
            category: "Computer Science Complex",
            floors_count: 4,
            latitude: 28.4725,
            longitude: 77.4885,
            description: "4-story computing center housing CSE, IT, Data Science research labs, and faculty cabins.",
            elevator_info: "Central Staircases & Accessibility Ramps"
        },
        {
            block_key: "block2",
            name: "⚙️ Academic Block 2",
            category: "Electronics & Mechanical Complex",
            floors_count: 4,
            latitude: 28.4721,
            longitude: 77.4890,
            description: "4-story engineering facility housing ECE, Robotics Center of Excellence, Mechanical workshops, and Civil labs.",
            elevator_info: "Central Staircases & Accessibility Ramps"
        },
        {
            block_key: "library",
            name: "📚 Central Library",
            category: "Learning Commons",
            floors_count: 1,
            latitude: 28.4728,
            longitude: 77.4888,
            description: "Single-level ground floor learning commons housing 50,000+ volumes, IEEE digital access, and quiet study hall.",
            elevator_info: "Ground Floor Level Facility (No upper floors)"
        },
        {
            block_key: "auditorium",
            name: "🎭 Auditorium & Convention Complex",
            category: "Cultural & Event Center",
            floors_count: 2,
            latitude: 28.4719,
            longitude: 77.4895,
            description: "Centrally air-conditioned 1000-seater main auditorium for national symposiums and youth fests.",
            elevator_info: "Main Level Entry & Balcony Access"
        }
    ];

    // Initialize database in LocalStorage
    function init() {
        if (!localStorage.getItem(DB_KEY)) {
            localStorage.setItem(DB_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
        } else {
            // Upgrade existing stored accounts with avatars if missing
            try {
                const existing = JSON.parse(localStorage.getItem(DB_KEY));
                let modified = false;
                existing.forEach(u => {
                    if (!u.avatar) {
                        u.avatar = DEFAULT_AVATARS[u.role] || DEFAULT_AVATARS.student;
                        modified = true;
                    }
                });
                if (modified) localStorage.setItem(DB_KEY, JSON.stringify(existing));
            } catch (e) {}
        }
    }

    // Get all users
    function getUsers() {
        init();
        try {
            return JSON.parse(localStorage.getItem(DB_KEY)) || DEFAULT_ACCOUNTS;
        } catch (e) {
            return DEFAULT_ACCOUNTS;
        }
    }

    // Save users
    function saveUsers(users) {
        localStorage.setItem(DB_KEY, JSON.stringify(users));
    }

    // Check if backend API is reachable
    async function checkBackend() {
        if (window.location.protocol === "file:") return false;
        try {
            const res = await fetch("/api/ping", { method: "GET" });
            return res.ok;
        } catch (e) {
            return false;
        }
    }

    function getAuthHeaders() {
        const token = localStorage.getItem(TOKEN_KEY);
        const headers = { "Content-Type": "application/json" };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        return headers;
    }

    // Calculate distance in meters using Haversine formula
    function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
        const R = 6371000;
        const toRad = deg => (deg * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
    }

    // -----------------------------------------------------------------------
    // Authentication: Register & Login
    // -----------------------------------------------------------------------
    async function register(userData) {
        const { fullname, username, email, password, role, idNumber, department, avatar } = userData;
        const chosenAvatar = avatar || DEFAULT_AVATARS[role] || DEFAULT_AVATARS.student;
        const fullPayload = { ...userData, avatar: chosenAvatar };

        // Try Python SQLite API first if on http
        const hasBackend = await checkBackend();
        if (hasBackend) {
            try {
                const response = await fetch("/api/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(fullPayload)
                });
                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.error || "Registration failed");
                }
                if (result.token) {
                    localStorage.setItem(TOKEN_KEY, result.token);
                }
                setCurrentSession(result.user);
                return result;
            } catch (err) {
                console.warn("Backend API error, falling back to local database:", err);
            }
        }

        // Local Database fallback
        init();
        const users = getUsers();
        const cleanUsername = username.trim().toLowerCase();
        const cleanEmail = email.trim().toLowerCase();

        if (users.some(u => u.username.toLowerCase() === cleanUsername)) {
            throw new Error(`Username "${username}" is already taken.`);
        }
        if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
            throw new Error(`Email "${email}" is already registered.`);
        }

        const newUser = {
            id: Date.now(),
            fullname: fullname.trim() || username.trim(),
            username: cleanUsername,
            email: cleanEmail,
            password: password,
            role: role || "student",
            idNumber: idNumber ? idNumber.trim() : "",
            department: department ? department.trim() : "",
            avatar: chosenAvatar,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        saveUsers(users);

        const sessionUser = {
            id: newUser.id,
            fullname: newUser.fullname,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            idNumber: newUser.idNumber,
            department: newUser.department,
            avatar: newUser.avatar
        };
        setCurrentSession(sessionUser);

        return {
            success: true,
            message: `Registration successful as ${role}!`,
            user: sessionUser
        };
    }

    async function login(usernameOrEmail, password, requestedRole) {
        // Try Python SQLite API first if on http
        const hasBackend = await checkBackend();
        if (hasBackend) {
            try {
                const response = await fetch("/api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username: usernameOrEmail,
                        password: password,
                        role: requestedRole
                    })
                });
                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.error || "Invalid credentials");
                }
                if (result.token) {
                    localStorage.setItem(TOKEN_KEY, result.token);
                }
                setCurrentSession(result.user);
                return result;
            } catch (err) {
                console.warn("Backend API error, falling back to local database:", err);
            }
        }

        // Local Database fallback
        init();
        const users = getUsers();
        const query = usernameOrEmail.trim().toLowerCase();

        const user = users.find(u => 
            (u.username.toLowerCase() === query || u.email.toLowerCase() === query) &&
            u.password === password
        );

        if (!user) {
            throw new Error("Invalid username/email or password.");
        }

        if (requestedRole && requestedRole !== "all" && user.role !== requestedRole) {
            throw new Error(`Account found, but registered as "${user.role.toUpperCase()}", not "${requestedRole.toUpperCase()}".`);
        }

        const sessionUser = {
            id: user.id,
            fullname: user.fullname,
            username: user.username,
            email: user.email,
            role: user.role,
            idNumber: user.idNumber,
            department: user.department,
            avatar: user.avatar || DEFAULT_AVATARS[user.role] || DEFAULT_AVATARS.student,
            loggedInAt: new Date().toISOString()
        };

        setCurrentSession(sessionUser);

        return {
            success: true,
            message: `Welcome back, ${user.fullname}!`,
            user: sessionUser
        };
    }

    function setCurrentSession(user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }

    function getCurrentSession() {
        try {
            const data = localStorage.getItem(SESSION_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            return null;
        }
    }

    // Lookup user by username or email (for avatar/preview)
    async function lookupUser(query) {
        if (!query) return { found: false };
        const clean = query.trim().toLowerCase();

        const hasBackend = await checkBackend();
        if (hasBackend) {
            try {
                const res = await fetch(`/api/users/lookup?username=${encodeURIComponent(clean)}`);
                if (res.ok) {
                    const data = await res.json();
                    return data;
                }
            } catch (e) {}
        }

        // Local storage lookup fallback
        const users = getUsers();
        const found = users.find(u => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean);
        if (found) {
            return {
                found: true,
                user: {
                    id: found.id,
                    fullname: found.fullname,
                    username: found.username,
                    role: found.role,
                    avatar: found.avatar || DEFAULT_AVATARS[found.role] || DEFAULT_AVATARS.student
                }
            };
        }
        return { found: false };
    }

    // Update avatar image for an account
    async function updateAvatar(username, avatarDataUrl) {
        if (!username || !avatarDataUrl) return { success: false };

        const hasBackend = await checkBackend();
        if (hasBackend) {
            try {
                await fetch("/api/user/avatar", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, avatar: avatarDataUrl })
                });
            } catch (e) {}
        }

        // Update local storage
        const users = getUsers();
        const target = users.find(u => u.username.toLowerCase() === username.toLowerCase());
        if (target) {
            target.avatar = avatarDataUrl;
            saveUsers(users);
        }

        const session = getCurrentSession();
        if (session && session.username.toLowerCase() === username.toLowerCase()) {
            session.avatar = avatarDataUrl;
            setCurrentSession(session);
        }

        return { success: true, avatar: avatarDataUrl };
    }

    async function logout() {
        const hasBackend = await checkBackend();
        if (hasBackend) {
            try {
                await fetch("/api/logout", {
                    method: "POST",
                    headers: getAuthHeaders()
                });
            } catch (e) {}
        }
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(TOKEN_KEY);
    }

    // -----------------------------------------------------------------------
    // Campus Navigation & GPS Geolocation Services
    // -----------------------------------------------------------------------
    async function getCampusBlocks() {
        const hasBackend = await checkBackend();
        if (hasBackend) {
            try {
                const res = await fetch("/api/blocks");
                if (res.ok) {
                    const data = await res.json();
                    return data.blocks;
                }
            } catch (e) {}
        }
        return DEFAULT_BLOCKS;
    }

    async function locatePosition(userLat, userLng) {
        const hasBackend = await checkBackend();
        if (hasBackend) {
            try {
                const res = await fetch("/api/locate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ lat: userLat, lng: userLng })
                });
                if (res.ok) {
                    return await res.json();
                }
            } catch (e) {}
        }

        // Local Geolocation Resolver fallback
        const results = DEFAULT_BLOCKS.map(b => {
            const dist = calculateDistanceMeters(userLat, userLng, b.latitude, b.longitude);
            return {
                block_key: b.block_key,
                name: b.name,
                category: b.category,
                distance_meters: dist,
                estimated_walk_minutes: Math.round((dist / 80) * 10) / 10,
                target_coords: { lat: b.latitude, lng: b.longitude }
            };
        });

        results.sort((a, b) => a.distance_meters - b.distance_meters);
        const campusDist = calculateDistanceMeters(userLat, userLng, CAMPUS_COORDS.lat, CAMPUS_COORDS.lng);

        return {
            user_location: { lat: userLat, lng: userLng },
            on_campus: campusDist < 600,
            distance_to_campus_center_meters: campusDist,
            nearest_building: results[0] || null,
            all_buildings_by_distance: results
        };
    }

    // Auto-init on script load
    init();

    return {
        init,
        register,
        login,
        getUsers,
        getCurrentSession,
        setCurrentSession,
        logout,
        getCampusBlocks,
        locatePosition,
        lookupUser,
        updateAvatar,
        DEFAULT_AVATARS,
        CAMPUS_COORDS,
        DEFAULT_BLOCKS,
        DEFAULT_ACCOUNTS
    };
})();

// Attach to window for global access
window.CollegeDB = CollegeDB;
