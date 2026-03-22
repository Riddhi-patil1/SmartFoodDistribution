import { 
    auth, 
    db, 
    onAuthStateChanged, 
    collection, 
    addDoc, 
    serverTimestamp 
} from './firebase-config.js';

const donateForm = document.getElementById('donate-form');
const donateMessage = document.getElementById('donate-message');
const donateBtn = document.getElementById('donate-btn');

let currentUser = null;

// Ensure user is logged in
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
    } else {
        window.location.href = "login.html";
    }
});

if (donateForm) {
    donateForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        donateBtn.disabled = true;
        donateBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Submitting...';
        
        const foodName = document.getElementById('food-name').value;
        const quantity = document.getElementById('food-quantity').value;
        const location = document.getElementById('food-location').value;
        const expiryTime = document.getElementById('food-expiry').value;

        try {
            await addDoc(collection(db, "donations"), {
                foodName: foodName,
                quantity: quantity,
                location: location,
                expiryTime: expiryTime,
                providerId: currentUser.uid,
                status: "available", // default status
                createdAt: serverTimestamp()
            });

            // Show success Toast
            const toastEl = document.getElementById('liveToast');
            document.getElementById('toast-body').textContent = "Donation successfully added! Redirecting...";
            toastEl.className = "toast align-items-center text-bg-success border-0";
            const toast = new bootstrap.Toast(toastEl);
            toast.show();
            
            // Reset form
            donateForm.reset();
            
            // Redirect after 1.5 seconds
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1500);

        } catch (error) {
            const toastEl = document.getElementById('liveToast');
            document.getElementById('toast-body').textContent = "Failed to add donation. Please try again.";
            toastEl.className = "toast align-items-center text-bg-danger border-0";
            const toast = new bootstrap.Toast(toastEl);
            toast.show();
            console.error("Error adding document: ", error);
        } finally {
            donateBtn.disabled = false;
            donateBtn.textContent = 'Submit Donation';
        }
    });
}
