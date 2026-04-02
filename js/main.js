// Main functionality for FoodLink: Theme Toggle and Chatbot

// Theme Toggle Logic
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const icon = themeToggle ? themeToggle.querySelector('i') : null;

// Initialize theme from localStorage
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (icon) {
        icon.classList.replace('fa-moon', 'fa-sun');
    }
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            icon.classList.replace('fa-sun', 'fa-moon');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            icon.classList.replace('fa-moon', 'fa-sun');
        }
    });
}

// Chatbot Logic
const chatBtn = document.getElementById('chatBtn');
const chatContainer = document.getElementById('chatContainer');
const closeChat = document.getElementById('closeChat');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendMessage = document.getElementById('sendMessage');

if (chatBtn) {
    chatBtn.addEventListener('click', () => {
        chatContainer.classList.toggle('active');
    });
}

if (closeChat) {
    closeChat.addEventListener('click', () => {
        chatContainer.classList.remove('active');
    });
}

const botResponses = {
    'donate': 'To donate food, click on "Donate Food" button in your dashboard or the homepage. Fill in the details like food type, quantity, and expiry time.',
    'pickup': 'If you are an NGO, go to the "Food List" page to see available donations. Click "Request" on an item and the provider will see your request.',
    'expiry': 'Expiry time is set by the provider. It helps NGOs know when the food needs to be picked up and consumed.',
    'prediction': 'Our AI prediction works by analyzing historical donation data and local events to forecast food surplus areas. Currently, it helps in prioritizing urgent pickups.',
    'how': 'FoodLink connects food providers (restaurants, events) with NGOs to redistribute surplus food efficiently.',
    'hi': 'Hello! How can I help you today with FoodLink?',
    'hello': 'Hi there! Looking for information on how to donate or request food?',
    'thanks': 'You\'re welcome! Together we can reduce food waste.',
    'thank you': 'Happy to help! Let me know if you need anything else.'
};

function getBotResponse(input) {
    input = input.toLowerCase();
    if (input.includes('donate') || input.includes('food')) {
        return botResponses.donate;
    } else if (input.includes('pickup') || input.includes('accept') || input.includes('request')) {
        return botResponses.pickup;
    } else if (input.includes('expiry') || input.includes('time')) {
        return botResponses.expiry;
    } else if (input.includes('prediction') || input.includes('ai')) {
        return botResponses.prediction;
    } else if (input.includes('how') || input.includes('work')) {
        return botResponses.how;
    } else if (input.includes('hi') || input.includes('hello')) {
        return botResponses.hi;
    } else if (input.includes('thank')) {
        return botResponses.thanks;
    }
    return "I'm sorry, I didn't quite catch that. You can ask about donating food, picking up requests, expiry times, or how our AI works!";
}

function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    msgDiv.textContent = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function handleSend() {
    const text = chatInput.value.trim();
    if (text) {
        addMessage(text, 'user');
        chatInput.value = '';
        
        setTimeout(() => {
            const response = getBotResponse(text);
            addMessage(response, 'bot');
        }, 500);
    }
}

if (sendMessage) {
    sendMessage.addEventListener('click', handleSend);
}

if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });
}

// Password toggle functionality (for login/register pages)
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('login-password') || document.getElementById('reg-password');

if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });
}
