document.addEventListener('DOMContentLoaded', () => {
    const fab = document.querySelector('.ai-assistant-fab');
    const panel = document.getElementById('ai-assistant-panel');
    const closeBtn = document.querySelector('.ai-assistant-close');
    const messagesEl = document.getElementById('ai-assistant-messages');
    const suggestionsEl = document.getElementById('ai-assistant-suggestions');
    const form = document.getElementById('ai-assistant-form');
    const input = document.getElementById('ai-assistant-input');

    if (!fab || !panel || !form || !input || !messagesEl) return;

    const history = [];
    let sending = false;

    const openPanel = () => {
        panel.classList.add('open');
        panel.setAttribute('aria-hidden', 'false');
        fab.setAttribute('aria-expanded', 'true');
        input.focus();
    };

    const closePanel = () => {
        panel.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
        fab.setAttribute('aria-expanded', 'false');
    };

    fab.addEventListener('click', () => {
        if (panel.classList.contains('open')) closePanel();
        else openPanel();
    });

    if (closeBtn) closeBtn.addEventListener('click', closePanel);

    document.addEventListener('click', (event) => {
        if (!panel.classList.contains('open')) return;
        if (panel.contains(event.target) || fab.contains(event.target)) return;
        closePanel();
    });

    const appendMessage = (role, text) => {
        const div = document.createElement('div');
        div.className = `ai-msg ai-msg-${role === 'user' ? 'user' : 'bot'}`;
        div.textContent = text;
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
        return div;
    };

    const sendMessage = async (rawText) => {
        const text = rawText.trim();
        if (!text || sending) return;

        sending = true;
        if (suggestionsEl) suggestionsEl.style.display = 'none';

        appendMessage('user', text);
        history.push({ role: 'user', content: text });

        const typingEl = document.createElement('div');
        typingEl.className = 'ai-msg ai-msg-typing';
        typingEl.textContent = 'NOVA Assistant is typing...';
        messagesEl.appendChild(typingEl);
        messagesEl.scrollTop = messagesEl.scrollHeight;

        try {
            const response = await fetch('/.netlify/functions/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: history })
            });
            const data = await response.json();
            typingEl.remove();
            const replyText = data.reply || "Sorry, I couldn't answer that. Please try WhatsApp instead.";
            appendMessage('bot', replyText);
            history.push({ role: 'assistant', content: replyText });
        } catch (err) {
            typingEl.remove();
            appendMessage('bot', 'Could not reach the assistant right now. Please try WhatsApp instead.');
        } finally {
            sending = false;
        }
    };

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const text = input.value;
        input.value = '';
        sendMessage(text);
    });

    document.querySelectorAll('.ai-suggestion-chip').forEach((chip) => {
        chip.addEventListener('click', () => sendMessage(chip.textContent));
    });
});
