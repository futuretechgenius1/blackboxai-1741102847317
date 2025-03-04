class ChatApp {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.chatForm = document.getElementById('chat-form');
        this.userInput = document.getElementById('user-input');
        
        this.setupEventListeners();
        this.adjustTextareaHeight();
    }

    setupEventListeners() {
        this.chatForm.addEventListener('submit', (e) => this.handleSubmit(e));
        this.userInput.addEventListener('input', () => this.adjustTextareaHeight());
        this.userInput.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    adjustTextareaHeight() {
        this.userInput.style.height = 'auto';
        this.userInput.style.height = this.userInput.scrollHeight + 'px';
    }

    handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.chatForm.dispatchEvent(new Event('submit'));
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        const message = this.userInput.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        this.userInput.value = '';
        this.adjustTextareaHeight();

        try {
            // Show loading state
            const loadingId = this.addLoadingMessage();

            // Get AI response
            const response = await this.getAIResponse(message);

            // Remove loading message and add AI response
            this.removeLoadingMessage(loadingId);
            this.addMessage(response, 'ai');
        } catch (error) {
            console.error('Error:', error);
            this.addErrorMessage();
        }
    }

    addMessage(content, role) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message-appear flex items-start space-x-3';

        const iconDiv = document.createElement('div');
        iconDiv.className = 'flex-shrink-0';
        iconDiv.innerHTML = role === 'user' 
            ? '<i class="fas fa-user text-gray-600 text-xl"></i>'
            : '<i class="fas fa-robot text-blue-600 text-xl"></i>';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'flex-1';
        contentDiv.innerHTML = `<p class="text-gray-800 whitespace-pre-wrap">${this.escapeHtml(content)}</p>`;

        messageDiv.appendChild(iconDiv);
        messageDiv.appendChild(contentDiv);
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addLoadingMessage() {
        const loadingId = Date.now();
        const loadingDiv = document.createElement('div');
        loadingDiv.id = `loading-${loadingId}`;
        loadingDiv.className = 'message-appear flex items-start space-x-3';
        loadingDiv.innerHTML = `
            <div class="flex-shrink-0">
                <i class="fas fa-robot text-blue-600 text-xl"></i>
            </div>
            <div class="flex-1">
                <div class="flex items-center space-x-2">
                    <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                    <div class="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                </div>
            </div>
        `;
        this.chatMessages.appendChild(loadingDiv);
        this.scrollToBottom();
        return loadingId;
    }

    removeLoadingMessage(loadingId) {
        const loadingDiv = document.getElementById(`loading-${loadingId}`);
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }

    addErrorMessage() {
        this.addMessage('Sorry, there was an error processing your request. Please try again.', 'ai');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    async getAIResponse(message) {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            throw new Error('Failed to get AI response');
        }
    }
}

// Initialize the chat app
new ChatApp();
