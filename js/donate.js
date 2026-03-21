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

            // Show success message
            donateMessage.className = "alert alert-success";
            donateMessage.textContent = "Donation successfully added!";
            donateMessage.classList.remove('d-none');
            
            // Reset form
            donateForm.reset();
            
            // Hide message after 3 seconds
            setTimeout(() => {
                donateMessage.classList.add('d-none');
            }, 3000);

        } catch (error) {
            donateMessage.className = "alert alert-danger";
            donateMessage.textContent = "Failed to add donation. Please try again.";
            donateMessage.classList.remove('d-none');
            console.error("Error adding document: ", error);
        } finally {
            donateBtn.disabled = false;
            donateBtn.textContent = 'Submit Donation';
        }
    });
}
