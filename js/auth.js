import { 
    auth, 
    db, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    doc, 
    setDoc,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    sendPasswordResetEmail
} from './firebase-config.js';

const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const errorAlert = document.getElementById('auth-error');
const successAlert = document.getElementById('auth-success');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('reg-btn');
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const role = document.getElementById('reg-role').value;

        try {
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Registering...';
            if(errorAlert) errorAlert.classList.add('d-none');
            
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: name,
                email: email,
                role: role
            });
            
            window.location.href = "dashboard.html";
        } catch (error) {
            if(errorAlert) {
                errorAlert.textContent = error.message;
                errorAlert.classList.remove('d-none');
            }
            btn.disabled = false;
            btn.textContent = 'Register';
        }
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('login-btn');
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        try {
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Logging in...';
            if(errorAlert) errorAlert.classList.add('d-none');
            if(successAlert) successAlert.classList.add('d-none');
            
            // Set persistence based on "Remember Me"
            const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
            await setPersistence(auth, persistence);
            
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = "dashboard.html";
        } catch (error) {
            if(errorAlert) {
                errorAlert.textContent = "Invalid email or password. Please try again.";
                errorAlert.classList.remove('d-none');
            }
            btn.disabled = false;
            btn.textContent = 'Login';
        }
    });

    // Forgot Password Logic
    const forgotPasswordLink = document.getElementById('forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            
            if (!email) {
                if(errorAlert) {
                    errorAlert.textContent = "Please enter your email address to reset password.";
                    errorAlert.classList.remove('d-none');
                }
                return;
            }

            try {
                await sendPasswordResetEmail(auth, email);
                if(successAlert) {
                    successAlert.textContent = "Password reset link sent to your email!";
                    successAlert.classList.remove('d-none');
                }
                if(errorAlert) errorAlert.classList.add('d-none');
            } catch (error) {
                if(errorAlert) {
                    errorAlert.textContent = "Error: " + error.message;
                    errorAlert.classList.remove('d-none');
                }
            }
        });
    }
}
