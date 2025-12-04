let stompClient = null;
let username = null;

const messageArea = document.getElementById('messageArea');
const messageField = document.getElementById('message');
const usernameField = document.getElementById('username');
const sendBtn = document.getElementById('sendBtn');
const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');

const emojiBtn = document.getElementById('emojiBtn');
const emojiPanel = document.getElementById('emojiPanel');

// Initially hide emoji panel using inline style
emojiPanel.style.display = "none";

// Show/hide emoji panel on button click
emojiBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent document click from immediately hiding panel
    emojiPanel.style.display = emojiPanel.style.display === "block" ? "none" : "block";
});

// Populate emojis
emojiPanel.innerHTML = emojiPanel.textContent
    .trim()
    .split(/\s+/)
    .map(e => `<span class="emoji">${e}</span>`)
    .join(" ");

// Add click for each emoji
emojiPanel.querySelectorAll(".emoji").forEach(span => {
    span.addEventListener("click", () => {
        messageField.value += span.textContent; // Add only clicked emoji
        emojiPanel.style.display = "none";      // hide panel after selection
        messageField.focus();                     // focus input
    });
});

// Hide emoji panel if clicking outside
document.addEventListener("click", (event) => {
    if (!emojiBtn.contains(event.target) && !emojiPanel.contains(event.target)) {
        emojiPanel.style.display = "none";
    }
});


// ===== WebSocket Chat logic =====
function setConnected(connected) {
    connectBtn.disabled = connected;
    disconnectBtn.disabled = !connected;
    sendBtn.disabled = !connected;
    usernameField.disabled = connected;

    if (!connected) messageArea.innerHTML = "";
}

function connect() {
    username = usernameField.value.trim();
    if (!username) {
        alert("Enter username first!");
        return;
    }

    const socket = new SockJS(window.location.origin + '/ws');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, function () {
        setConnected(true);
        appendSystemMessage("Connected as " + username);

        // Subscribe to public topic
        stompClient.subscribe("/topic/public", function (output) {
            showMessage(JSON.parse(output.body));
        });

        // Send join notification
        stompClient.send("/app/chat.addUser", {}, JSON.stringify({
            sender: username,
            type: "JOIN",
            content: username + " joined"
        }));
    });
}

function disconnect() {
    if (stompClient) stompClient.disconnect();
    setConnected(false);
    appendSystemMessage("Disconnected");
}

function sendMessage() {
    const text = messageField.value.trim();
    if (!text) return;

    const msg = {
        sender: username,
        content: text,
        type: "CHAT"
    };

    stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(msg));
    messageField.value = "";
}

function showMessage(msg) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("message");

    // Align messages: self = right, others = left
    if (msg.sender === username) wrapper.classList.add("self");
    else wrapper.classList.add("other");

    const meta = document.createElement("div");
    meta.classList.add("meta");
    meta.textContent = msg.sender + " • " + new Date().toLocaleTimeString();

    const content = document.createElement("div");
    content.innerHTML = msg.content; // Can contain emoji characters

    wrapper.appendChild(meta);
    wrapper.appendChild(content);
    messageArea.appendChild(wrapper);

    messageArea.scrollTop = messageArea.scrollHeight;
}

function appendSystemMessage(text) {
    showMessage({ sender: "System", content: text, type: "CHAT" });
}

// ===== Event listeners =====
connectBtn.addEventListener("click", connect);
disconnectBtn.addEventListener("click", disconnect);
sendBtn.addEventListener("click", sendMessage);

messageField.addEventListener("keyup", (e) => {
    if (e.key === "Enter") sendMessage();
});
