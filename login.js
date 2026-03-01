import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js";
import { doc, setDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

let savedUsername = "";
let savedPassword = "";// accept only letters and digits for username; prevents spaces & weird chars
const usernameRegex = /^[a-zA-Z0-9]+$/;const charRegex = /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?]+$/;

function clearAllInputs() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.type === 'checkbox' ? input.checked = false : input.value = "";
    });
    document.getElementById('reg-pass').type = "password";
    document.getElementById('login-pass').type = "password";
    document.getElementById('reg-btn').disabled = true;
}

function navToLogin() {
    const reg = document.getElementById('register-section');
    const log = document.getElementById('login-section');
    reg.classList.replace('active', 'inactive');
    log.classList.replace('inactive', 'active');
    // clear any lingering registration hints or messages
    clearSuggestions();
    showMessage('');
    setTimeout(clearAllInputs, 200);
}

function navToRegister() {
    const reg = document.getElementById('register-section');
    const log = document.getElementById('login-section');
    log.classList.replace('active', 'inactive');
    reg.classList.replace('inactive', 'active');
    // also wipe out any previous suggestions/messages
    clearSuggestions();
    showMessage('');
    setTimeout(clearAllInputs, 200);
}

function togglePassword(id, cb) {
    document.getElementById(id).type = cb.checked ? "text" : "password";
}

function updateThemeIcon() {
    const icon = document.getElementById('theme-icon');
    if (!icon) return;
    // sun path and moon path
    const moonPath = 'M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z';
    const sunPath = 'M12 3v2m0 14v2m9-9h-2M5 12H3m15.36 6.36l-1.42-1.42M6.66 6.66L5.24 5.24m12.02 0l-1.42 1.42M6.66 17.34l-1.42 1.42M12 7a5 5 0 100 10 5 5 0 000-10z';
    const isDark = document.body.classList.contains('dark-mode');
    if (isDark) {
        icon.innerHTML = `<path d="${sunPath}" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    } else {
        icon.innerHTML = `<path d="${moonPath}" fill="currentColor"/>`;
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    updateThemeIcon();
}

// set initial icon once DOM is ready
document.addEventListener('DOMContentLoaded', updateThemeIcon);

// Helper: generate simple username suggestions (numbers appended)
// (used when a desired name is already taken)
function generateSuggestions(username, count = 2) {
    const base = username.replace(/\s+/g, '').toLowerCase();
    const suggestions = new Set();
    while (suggestions.size < count) {
        const suffix = Math.floor(Math.random() * 9000) + 100; // 3-4 digit
        suggestions.add(`${base}${suffix}`);
    }
    return Array.from(suggestions);
}

// UI helpers for inline messages and suggestion chips
function showMessage(msg) {
    const el = document.getElementById('username-msg');
    if (el) {
        el.textContent = msg;
        el.style.display = msg ? 'block' : 'none';
    }
    // clear chips when only showing a plain message
    if (!msg) clearSuggestions();
}

function clearSuggestions() {
    const cont = document.getElementById('username-suggestions');
    if (cont) {
        cont.innerHTML = '';
        cont.style.display = 'none';
    }
}

function showSuggestions(msg, suggestions = []) {
    showMessage(msg);
    const cont = document.getElementById('username-suggestions');
    if (!cont) return;
    cont.innerHTML = '';
    suggestions.forEach(name => {
        const span = document.createElement('span');
        span.className = 'suggestion-chip';
        span.textContent = name;
        span.addEventListener('click', () => {
            regUser.value = name;
            validate();
            clearSuggestions();
            regUser.focus();
        });
        cont.appendChild(span);
    });
    cont.style.display = suggestions.length ? 'flex' : 'none';
}

function setLoading(loading) {
    if (loading) {
        regBtn.classList.add('loading');
        regBtn.textContent = 'Checking…';
    } else {
        regBtn.classList.remove('loading');
        regBtn.textContent = 'Sign Up';
    }
}

// Logic (Register)
const regUser = document.getElementById('reg-user');
const regPass = document.getElementById('reg-pass');
const regBtn = document.getElementById('reg-btn');

const validate = () => {
    regBtn.disabled = !(regUser.value.length >= 3 && regPass.value.length >= 5 && charRegex.test(regPass.value));
};

regUser.addEventListener('input', () => {
    validate();
    showMessage('');
    regUser.classList.remove('invalid');
    if (!regUser.value.trim()) {
        clearSuggestions();
    }
});
regPass.addEventListener('input', validate);

// REGISTER LOGIC
document.getElementById('reg-btn').addEventListener('click', async () => {
    showMessage('');
    const desiredUsername = document.getElementById('reg-user').value.trim();
    const password = document.getElementById('reg-pass').value;

    if (!desiredUsername) {
        showMessage('Please enter a username.');
        regUser.classList.add('invalid');
        return;
    }
    if (!usernameRegex.test(desiredUsername)) {
        showMessage('Username may only contain letters and numbers.');
        regUser.classList.add('invalid');
        return;
    }

    // If Firestore is available, check for existing username and suggest alternatives
    let usernameCheckUnavailable = false;
    if (window.db) {
        try {
            setLoading(true);
            const playersRef = collection(window.db, 'players');
            const q = query(playersRef, where('username', '==', desiredUsername));
            const snapshot = await getDocs(q);
            setLoading(false);
            if (!snapshot.empty) {
                const suggestions = generateSuggestions(desiredUsername, 2);
                showSuggestions(`Username "${desiredUsername}" is taken; try`, suggestions);
                // prefill first suggestion so user can continue quickly
                regUser.value = suggestions[0];
                regUser.focus();
                validate();
                return;
            }
        } catch (e) {
            setLoading(false);
            // do not spam console with permission warnings
            if (e?.code === 'permission-denied' || (e.message && e.message.toLowerCase().includes('permission'))) {
                usernameCheckUnavailable = true;
                showMessage('⚠️ Could not verify username (Firestore permissions).');
            } else {
                console.error('Username availability check failed', e);
                showMessage('Unable to verify username availability. Please try again later.');
                return;
            }
        }
    }

    const email = document.getElementById('reg-user').value.trim() + "@game.com"; // Simulating email if you only want usernames

    try {
        const userCredential = await createUserWithEmailAndPassword(window.auth, email, password);
        const user = userCredential.user;

        // Initialize player data in Firestore
        await setDoc(doc(window.db, "players", user.uid), {
            username: document.getElementById('reg-user').value.trim(),
            email: email,
            totalArenaWins: 0,
            matchesPlayed: 0,
            matchHistory: [],
            joinDate: new Date().toISOString(),
            role: 'player'
        });

        alert("Account Created!");
        showMessage('');
        navToLogin();
    } catch (error) {
        // If the email is already in use, it likely means the username (username@game.com) is taken
        if (error?.code === 'auth/email-already-in-use' || (error?.message && error.message.includes('email-already-in-use'))) {
            const suggestions = generateSuggestions(desiredUsername, 2);
            showSuggestions(`That name is already taken; maybe`, suggestions);
            regUser.value = suggestions[0];
            regUser.focus();
            validate();
            return;
        }
        // handle invalid-email or bad-request, etc.
        if (error?.code === 'auth/invalid-email' || error?.code === 'auth/invalid-password' || error.code === 'auth/weak-password') {
            showMessage(error.message);
            return;
        }
        alert(error.message);
    }
});

// LOGIN LOGIC
document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('login-user').value.trim() + "@game.com";
    const password = document.getElementById('login-pass').value;

    try {
        await signInWithEmailAndPassword(window.auth, email, password);
        window.location.href = "game.html";
    } catch (error) {
        alert("Login failed: " + error.message);
    }
});

// Expose functions used by inline handlers in HTML (module scope is not global)
window.clearAllInputs = clearAllInputs;
window.navToLogin = navToLogin;
window.navToRegister = navToRegister;
window.togglePassword = togglePassword;
window.toggleTheme = toggleTheme;

// Provide a logout helper that uses firebase signOut if available
window.logout = async function() {
    try {
        if (window.signOut && window.auth) await window.signOut(window.auth);
    } catch (e) {
        console.error('Logout failed', e);
    }
    window.location.href = 'index.html';
};
