import { 
    auth, 
    db, 
    onAuthStateChanged, 
    signOut,
    collection, 
    query, 
    where, 
    onSnapshot, 
    doc, 
    getDoc, 
    updateDoc, 
    addDoc, 
    serverTimestamp 
} from './firebase-config.js';

const foodListContainer = document.getElementById('food-list-container');
const loadingSpinner = document.getElementById('loading-spinner');
const noFoodMsg = document.getElementById('no-food-msg');

let currentUserRole = null;
let currentUserId = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUserId = user.uid;
        
        const logoutBtn = document.getElementById('nav-logout');
        if (logoutBtn) {
            logoutBtn.classList.remove('d-none');
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                signOut(auth).then(() => window.location.href = "login.html");
            });
        }
        
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                currentUserRole = userDoc.data().role;
                
                const addFoodLink = document.getElementById('nav-add-food');
                if (addFoodLink && currentUserRole === 'Provider') {
                    addFoodLink.classList.remove('d-none');
                }
            }
        } catch (error) {
            console.error("Error fetching user role: ", error);
        }
        
        if (foodListContainer) {
            loadGlobalFoodList();
        }
    } else {
        const loginBtn = document.getElementById('nav-login');
        if (loginBtn) loginBtn.classList.remove('d-none');
        
        if (foodListContainer) {
            loadGlobalFoodList();
        }
    }
});

function loadGlobalFoodList() {
    if(loadingSpinner) loadingSpinner.classList.remove('d-none');
    
    const donationsRef = collection(db, "donations");
    const q = query(donationsRef, where("status", "==", "available"));

    onSnapshot(q, (snapshot) => {
        if(loadingSpinner) loadingSpinner.classList.add('d-none');
        
        foodListContainer.innerHTML = '';
        
        if (snapshot.empty) {
            if(noFoodMsg) noFoodMsg.classList.remove('d-none');
        } else {
            if(noFoodMsg) noFoodMsg.classList.add('d-none');
            
            snapshot.forEach((docSnap) => {
                const food = docSnap.data();
                const btnHtml = generateAcceptButton(docSnap.id, currentUserRole);
                
                const col = document.createElement('div');
                col.className = 'col-md-6 col-lg-4 mb-4';
                col.innerHTML = `
                    <div class="card h-100 shadow-sm border-0">
                        <div class="card-body">
                            <h5 class="card-title text-success fw-bold">${food.foodName}</h5>
                            <span class="badge bg-success mb-2 status-badge">${food.status.toUpperCase()}</span>
                            <p class="card-text text-secondary mb-1"><strong>Quantity:</strong> ${food.quantity}</p>
                            <p class="card-text text-secondary mb-1"><strong>Location:</strong> ${food.location}</p>
                            <p class="card-text text-secondary mb-3"><strong>Expires:</strong> ${food.expiryTime.replace("T", " ")}</p>
                            ${btnHtml}
                        </div>
                    </div>
                `;
                foodListContainer.appendChild(col);
                
                const acceptBtn = col.querySelector(`#accept-btn-${docSnap.id}`);
                if (acceptBtn) {
                    acceptBtn.addEventListener('click', () => acceptDonation(docSnap.id, acceptBtn));
                }
            });
        }
    });
}

function generateAcceptButton(id, role) {
    if (role === 'NGO') {
        return `<button class="btn btn-outline-success w-100 fw-bold" id="accept-btn-${id}">Accept Pickup</button>`;
    } else if (role === 'Provider') {
        return `<button class="btn btn-secondary w-100" disabled>Providers cannot accept</button>`;
    } else {
        return `<a href="login.html" class="btn btn-primary w-100">Login to Accept</a>`;
    }
}

async function acceptDonation(donationId, btn) {
    if (!currentUserId || currentUserRole !== 'NGO') return;

    try {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Accepting...';

        const donationRef = doc(db, "donations", donationId);
        await updateDoc(donationRef, {
            status: "accepted"
        });

        await addDoc(collection(db, "pickups"), {
            donationId: donationId,
            ngoId: currentUserId,
            status: "accepted",
            acceptedAt: serverTimestamp()
        });
        
    } catch (error) {
        console.error("Error accepting donation:", error);
        btn.disabled = false;
        btn.textContent = 'Accept Pickup';
    }
}
