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

let allDonations = [];

function loadGlobalFoodList() {
    if(loadingSpinner) loadingSpinner.classList.remove('d-none');
    
    const donationsRef = collection(db, "donations");
    const q = query(donationsRef, where("status", "==", "available"));

    let isInitialLoad = true;
    onSnapshot(q, (snapshot) => {
        if(loadingSpinner) loadingSpinner.classList.add('d-none');
        
        foodListContainer.innerHTML = '';
        
        if (snapshot.empty) {
            allDonations = [];
        } else {
            allDonations = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
        }
        
        if (!isInitialLoad && currentUserRole === 'NGO') {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const food = change.doc.data();
                    const toastMsg = document.getElementById('toast-body');
                    const toastEl = document.getElementById('liveToast');
                    if(toastMsg && toastEl) {
                        toastMsg.textContent = `New food available nearby: ${food.foodName} (${food.quantity})`;
                        const toast = new bootstrap.Toast(toastEl);
                        toast.show();
                    }
                }
            });
        }
        isInitialLoad = false;
        
        renderDonations();
    });
}

function getUrgencyLevel(expiryStr) {
    const expiryTime = new Date(expiryStr).getTime();
    const now = new Date().getTime();
    const diffHours = (expiryTime - now) / (1000 * 60 * 60);
    
    if (diffHours < 1) return { level: 'red', text: 'Urgent (< 1 hr)', class: 'bg-danger' };
    if (diffHours <= 3) return { level: 'orange', text: 'Moderate (1-3 hrs)', class: 'bg-warning text-dark' };
    return { level: 'green', text: 'Safe (> 3 hrs)', class: 'bg-success' };
}

function formatTimeLeft(expiryStr) {
    const expiryTime = new Date(expiryStr).getTime();
    const now = new Date().getTime();
    if (expiryTime < now) return "Expired";
    const diffHours = Math.floor((expiryTime - now) / (1000 * 60 * 60));
    const diffMins = Math.floor(((expiryTime - now) % (1000 * 60 * 60)) / (1000 * 60));
    return `Expires in: ${diffHours}h ${diffMins}m`;
}

// Generates a consistent pseudo-random distance based on string hash for demonstration
function generateMockDistance(locationStr) {
    if(!locationStr) return 15.0;
    let hash = 0;
    for (let i = 0; i < locationStr.length; i++) {
        hash = locationStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 200) / 10 + 1.5; // distance between 1.5 and 21.5 km
}

function renderDonations() {
    const locFilter = (document.getElementById('filter-location')?.value || '').toLowerCase();
    const expFilter = document.getElementById('filter-expiry')?.value || 'all';
    const minQty = parseInt(document.getElementById('filter-quantity')?.value) || 0;
    const maxDist = parseFloat(document.getElementById('filter-distance')?.value) || 9999;

    let filtered = allDonations.filter(food => {
        const foodQty = parseInt(food.quantity) || 0;
        const urgency = getUrgencyLevel(food.expiryTime).level;
        const dist = generateMockDistance(food.location);
        
        let matchLoc = food.location.toLowerCase().includes(locFilter);
        let matchQty = foodQty >= minQty;
        let matchExp = (expFilter === 'all' || urgency === expFilter);
        let matchDist = dist <= maxDist;
        
        return matchLoc && matchQty && matchExp && matchDist;
    });

    // Sort: Urgent first
    filtered.sort((a, b) => {
        const uA = getUrgencyLevel(a.expiryTime).level;
        const uB = getUrgencyLevel(b.expiryTime).level;
        const weights = { 'red': 1, 'orange': 2, 'green': 3 };
        return weights[uA] - weights[uB];
    });

    foodListContainer.innerHTML = '';

    if (filtered.length === 0) {
        if(noFoodMsg) noFoodMsg.classList.remove('d-none');
    } else {
        if(noFoodMsg) noFoodMsg.classList.add('d-none');
        
        filtered.forEach((food) => {
            const btnHtml = generateAcceptButton(food.id, currentUserRole);
            const urgencyInfo = getUrgencyLevel(food.expiryTime);
            const timeStr = formatTimeLeft(food.expiryTime);
            const dist = generateMockDistance(food.location).toFixed(1);
            
            const col = document.createElement('div');
            col.className = 'col-md-6 col-lg-4 mb-4';
            col.innerHTML = `
                <div class="card h-100 shadow-sm border-0 ${urgencyInfo.level === 'red' ? 'border border-danger border-2' : ''}">
                    <div class="card-header bg-white border-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
                        <span class="badge ${urgencyInfo.class} status-badge"><i class="bi bi-clock-history me-1"></i>${urgencyInfo.text}</span>
                        <span class="text-secondary small fw-bold"><i class="bi bi-geo-alt me-1"></i>~${dist} km away</span>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title text-success fw-bold mb-3"><i class="bi bi-basket me-2"></i>${food.foodName}</h5>
                        <p class="card-text text-secondary mb-1"><i class="bi bi-box me-2"></i><strong>Quantity:</strong> ${food.quantity}</p>
                        <p class="card-text text-secondary mb-1"><i class="bi bi-building me-2"></i><strong>Location:</strong> ${food.location}</p>
                        <p class="card-text ${timeStr==='Expired' ? 'text-danger' : 'text-secondary'} fw-bold mb-3"><i class="bi bi-hourglass-split me-2"></i>${timeStr}</p>
                        ${btnHtml}
                    </div>
                </div>
            `;
            foodListContainer.appendChild(col);
            
            const acceptBtn = col.querySelector(`#accept-btn-${food.id}`);
            if (acceptBtn) {
                acceptBtn.addEventListener('click', () => acceptDonation(food.id, acceptBtn));
            }
        });
    }
}

// Add event listeners for filters
document.getElementById('apply-filters-btn')?.addEventListener('click', renderDonations);

function generateAcceptButton(id, role) {
    if (role === 'NGO') {
        return `<button class="btn btn-outline-success w-100 fw-bold" id="accept-btn-${id}"><i class="bi bi-check2-circle me-1"></i>Accept Pickup</button>`;
    } else if (role === 'Provider') {
        return `<button class="btn btn-secondary w-100" disabled><i class="bi bi-shield-lock me-1"></i>Providers cannot accept</button>`;
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
            assignedAt: serverTimestamp()
        });
        
        // Success Toast Notification
        const toastMsg = document.getElementById('toast-body');
        const toastEl = document.getElementById('liveToast');
        if(toastMsg && toastEl) {
            toastMsg.textContent = `Pickup Successfully Accepted! Added to your Dashboard.`;
            toastEl.className = 'toast align-items-center text-bg-success border-0';
            const toast = new bootstrap.Toast(toastEl);
            toast.show();
        }
        
    } catch (error) {
        console.error("Error accepting donation:", error);
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-check2-circle me-1"></i>Accept Pickup';
    }
}
