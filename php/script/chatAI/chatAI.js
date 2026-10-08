const WEBHOOK =
  "https://n9n.whiteee.store/webhook/32cf8c09-0d0a-4ce4-9c36-2d4831182843";
function toggleChat() {
  const chatBox = document.getElementById("chatBox");
  if (chatBox.style.display === "flex") {
    chatBox.style.display = "none";
  } else {
    chatBox.style.display = "flex";
    document.querySelector(".badge").style.display = "none";
  }
}
function handleEnter(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}
async function sendMessage() {
  const input = document.getElementById("message");
  const text = input.value.trim();
  if (!text) return;
  addMessage(text, "user");
  input.value = "";
  showTyping();
  try {
    const response = await fetch(WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    const data = await response.json();
    removeTyping();
    typeMessage(data.reply);
  } catch (error) {
    removeTyping();
    addMessage("server 522", "bot");
  }
}
function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.innerHTML = `        ${text}        <div class="time">            ${getTime()}        </div>    `;
  document.getElementById("messages").appendChild(div);
  scrollBottom();
}
async function typeMessage(text) {
  const div = document.createElement("div");
  div.className = "message bot";
  document.getElementById("messages").appendChild(div);
  let content = "";
  for (let i = 0; i < text.length; i++) {
    content += text.charAt(i);
    div.innerHTML = `            ${content}            <div class="time">                ${getTime()}            </div>        `;
    scrollBottom();
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
}
function showTyping() {
  const typing = document.createElement("div");
  typing.id = "typing";
  typing.className = "typing-box";
  typing.innerHTML = `        <div class="dot"></div>        <div class="dot"></div>        <div class="dot"></div>    `;
  document.getElementById("messages").appendChild(typing);
  scrollBottom();
}
function removeTyping() {
  const typing = document.getElementById("typing");
  if (typing) {
    typing.remove();
  }
}
function scrollBottom() {
  const messages = document.getElementById("messages");
  messages.scrollTop = messages.scrollHeight;
}
function getTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
