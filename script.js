// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const timerDisplay = document.querySelector('.timer-display');
const timerControls = document.querySelector('.timer-controls');
const taskInput = document.querySelector('.task-input input');
const taskList = document.querySelector('.task-list');
const moodButtons = document.querySelectorAll('.mood-btn');
const chatMessages = document.querySelector('.chat-messages');
const chatInput = document.querySelector('.chat-input input');
const chatSendButton = document.querySelector('.chat-input button');

// Theme Toggle
themeToggle.addEventListener('click', () => {
    document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    themeToggle.innerHTML = document.body.dataset.theme === 'dark' ? 
        '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

// Mobile Navigation
hamburger.addEventListener('click', () => {
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    hamburger.classList.toggle('active');
});

// Timer functionality
class FocusTimer {
    constructor() {
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.initialTime = this.timeLeft;
        this.isRunning = false;
        this.timer = null;
        this.timerDisplay = document.querySelector('.timer-display');
        this.startBtn = document.querySelector('.timer-btn:first-child');
        this.resetBtn = document.querySelector('.timer-btn:last-child');
        
        // Add time control buttons
        this.addTimeControls();
        
        // Initialize event listeners
        this.initializeEventListeners();
        
        // Initial display update
        this.updateDisplay();
    }
    
    addTimeControls() {
        const timerCard = document.querySelector('.tool-card:first-child');
        const timeControls = document.createElement('div');
        timeControls.className = 'time-controls';
        timeControls.innerHTML = `
            <div class="time-settings">
                <button class="time-btn" data-time="15">15min</button>
                <button class="time-btn active" data-time="25">25min</button>
                <button class="time-btn" data-time="45">45min</button>
            </div>
        `;
        
        // Insert before timer display
        timerCard.insertBefore(timeControls, this.timerDisplay);
        
        // Add styles dynamically
        const style = document.createElement('style');
        style.textContent = `
            .time-controls {
                margin-bottom: 1rem;
                text-align: center;
            }
            .time-settings {
                display: flex;
                gap: 0.5rem;
                justify-content: center;
                margin-bottom: 1rem;
            }
            .time-btn {
                padding: 0.5rem 1rem;
                border: 1px solid var(--primary-color);
                background: none;
                color: var(--text-color);
                border-radius: var(--border-radius);
                cursor: pointer;
                transition: var(--transition);
                font-size: 0.9rem;
            }
            .time-btn:hover {
                background-color: var(--primary-color);
                color: white;
            }
            .time-btn.active {
                background-color: var(--primary-color);
                color: white;
            }
        `;
        document.head.appendChild(style);
    }
    
    initializeEventListeners() {
        // Start/Pause button
        this.startBtn.addEventListener('click', () => this.toggleTimer());
        
        // Reset button
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        
        // Time setting buttons
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const minutes = parseInt(e.target.dataset.time);
                this.setTime(minutes);
                
                // Update active state
                document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }
    
    setTime(minutes) {
        if (this.isRunning) {
            this.toggleTimer(); // Stop the timer if it's running
        }
        this.timeLeft = minutes * 60;
        this.initialTime = this.timeLeft;
        this.updateDisplay();
    }
    
    toggleTimer() {
        if (!this.isRunning) {
            this.startTimer();
            this.startBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        } else {
            this.pauseTimer();
            this.startBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
        }
    }
    
    startTimer() {
        this.isRunning = true;
        this.timer = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
                this.updateDisplay();
            } else {
                this.timerComplete();
            }
        }, 1000);
    }
    
    pauseTimer() {
        this.isRunning = false;
        clearInterval(this.timer);
    }
    
    resetTimer() {
        this.pauseTimer();
        this.timeLeft = this.initialTime;
        this.updateDisplay();
        this.startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timerDisplay.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    timerComplete() {
        this.pauseTimer();
        this.startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
        playNotificationSound();
        showNotification('Focus session complete! Take a break.');
        
        // Vibrate if supported
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
    }
}

// Initialize the Focus Timer
const focusTimer = new FocusTimer();

// Task List
function addTask(taskText) {
    if (taskText.trim() === '') return;
    
    const li = document.createElement('li');
    li.innerHTML = `
        <span>${taskText}</span>
        <div class="task-actions">
            <button class="complete-btn"><i class="fas fa-check"></i></button>
            <button class="delete-btn"><i class="fas fa-trash"></i></button>
        </div>
    `;
    
    taskList.appendChild(li);
    taskInput.value = '';
    
    // Add event listeners to the new task buttons
    li.querySelector('.complete-btn').addEventListener('click', () => {
        li.classList.toggle('completed');
    });
    
    li.querySelector('.delete-btn').addEventListener('click', () => {
        li.remove();
    });
}

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask(taskInput.value);
    }
});

document.querySelector('.task-input button').addEventListener('click', () => {
    addTask(taskInput.value);
});

// Mood Check-in
moodButtons.forEach(button => {
    button.addEventListener('click', () => {
        const mood = button.dataset.mood;
        moodButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Store mood in localStorage
        localStorage.setItem('lastMood', mood);
        localStorage.setItem('lastMoodTime', new Date().toISOString());
        
        // Show mood confirmation
        showNotification(`Mood recorded: ${mood}`);
    });
});

// Chat with Gemini API
async function sendMessage(message) {
    if (!message.trim()) return;
    
    // Add user message to chat
    addMessageToChat('user', message);
    
    // Show typing indicator
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('message', 'ai', 'typing');
    typingIndicator.innerHTML = `
        <div class="message-header">
            <i class="fas fa-robot"></i>
            <span>ADHD Assistant</span>
        </div>
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    chatMessages.appendChild(typingIndicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    try {
        // Gemini API key
        const API_KEY = 'AIzaSyDA5SRBz2uh9tALVffoIgskGaByTQ2zaIQ';
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + API_KEY, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are an ADHD productivity assistant. Please provide helpful, concise advice about: ${message}`
                    }]
                }]
            })
        });
        
        // Remove typing indicator
        typingIndicator.remove();
        
        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;
        
        // Add AI response to chat
        addMessageToChat('ai', aiResponse);
    } catch (error) {
        console.error('Error:', error);
        // Remove typing indicator
        typingIndicator.remove();
        addMessageToChat('ai', 'Sorry, I encountered an error. Please try again later.');
    }
}

function addMessageToChat(sender, message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    
    if (sender === 'ai') {
        messageDiv.innerHTML = `
            <div class="message-header">
                <i class="fas fa-robot"></i>
                <span>ADHD Assistant</span>
            </div>
            <p>${message}</p>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-header">
                <i class="fas fa-user"></i>
                <span>You</span>
            </div>
            <p>${message}</p>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Improved chat input handling
chatSendButton.addEventListener('click', () => {
    const message = chatInput.value.trim();
    if (message) {
        sendMessage(message);
        chatInput.value = '';
        chatInput.focus();
    }
});

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (message) {
            sendMessage(message);
            chatInput.value = '';
        }
    }
});

// Add typing indicator styles
const style = document.createElement('style');
style.textContent = `
    .typing-indicator {
        display: flex;
        gap: 4px;
        padding: 8px;
    }
    
    .typing-indicator span {
        width: 8px;
        height: 8px;
        background-color: var(--primary-color);
        border-radius: 50%;
        animation: typing 1s infinite;
    }
    
    .typing-indicator span:nth-child(2) {
        animation-delay: 0.2s;
    }
    
    .typing-indicator span:nth-child(3) {
        animation-delay: 0.4s;
    }
    
    @keyframes typing {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-4px);
        }
    }
    
    .message-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        font-weight: 600;
    }
    
    .message-header i {
        color: var(--primary-color);
    }
    
    .message p {
        margin: 0;
        line-height: 1.5;
    }
    
    .message.user .message-header i {
        color: white;
    }
`;

document.head.appendChild(style);

// Notification System
function showNotification(message) {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Sound Effects
function playNotificationSound() {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateTimerDisplay();
    
    // Check for saved mood
    const lastMood = localStorage.getItem('lastMood');
    const lastMoodTime = localStorage.getItem('lastMoodTime');
    
    if (lastMood && lastMoodTime) {
        const moodTime = new Date(lastMoodTime);
        const now = new Date();
        const hoursDiff = (now - moodTime) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
            const moodButton = document.querySelector(`.mood-btn[data-mood="${lastMood}"]`);
            if (moodButton) {
                moodButton.classList.add('active');
            }
        }
    }
}); 