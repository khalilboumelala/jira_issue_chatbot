console.log("testtesttest")

AJS.toInit(() => {
    const chatbotToggler = document.querySelector(".chatbot-toggler");
    const closeBtn = document.querySelector(".close-btn");
    const chatbox = document.querySelector(".chatbox");
    const chatInput = document.querySelector(".chat-input textarea");
    const sendChatBtn = document.querySelector(".chat-input span");

    let userMessage = null; // Variable to store user's message
    const inputInitHeight = chatInput.scrollHeight;
    let availableModel = "jira-llama3:"; // Default to a known model
    let chatHistory = []; // Store chat history

    const checkAvailableModels = async () => {
        try {
            const response = await fetch(`${ollama_host}/api/models`);
            const data = await response.json();
            if (data.includes("jira-llama3:")) {
                availableModel = "jira-llama3:";
            } else if (data.length > 0) {
                availableModel = data[0];
            }
        } catch (error) {
            console.error("Error fetching available models:", error);
        }
    };

    var ollama_host = localStorage.getItem("host-address") || 'http://localhost:11434';

    const createChatLi = (message, className) => {
        const chatLi = document.createElement("li");
        chatLi.classList.add("chat", `${className}`);
        let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
        chatLi.innerHTML = chatContent;
        chatLi.querySelector("p").textContent = message;
        return chatLi;
    }

    const generateResponse = async (chatElement) => {
        const messageElement = chatElement.querySelector("p");
        const ollama_instance = new Ollama({
            model: "jira-llama3:latest",
            url: `${ollama_host}/api/`
        });

        try {
            const response = await ollama_instance.chat_request(chatHistory, { stream: false });

            const responseBody = response.message.content.trim();

            if (responseBody.includes("'api_link'") && responseBody.includes("'parameters'")) {
                const startIndex = responseBody.indexOf("{");
                const endIndex = responseBody.lastIndexOf("}");
                let jsonResponse = responseBody.substring(startIndex, endIndex + 1);
                jsonResponse = jsonResponse.replace(/'/g, '"');
                const responseObject = JSON.parse(jsonResponse);

                const confirmation = confirm("Do you want to proceed with creating the issue?");
                if (confirmation) {
                    const apiLink = responseObject.api_link;
                    const parameters = responseObject.parameters;

                    const authHeader = 'Basic ' + btoa('your-username:your-api-token');

                    const requestOptions = {
                        method: 'GET',
                        headers: {
                            'Authorization': authHeader
                        }
                    };

                    fetch(apiLink, requestOptions)
                        .then(response => {
                            console.log("API Response:", response);
                        })
                        .catch(error => {
                            console.error("API Error:", error);
                        });
                } else {
                    messageElement.textContent = "Okay, let me know if you need any further assistance.";
                }
            } else {
                messageElement.textContent = responseBody;
            }
            chatHistory.push({ role: 'assistant', content: messageElement.textContent });
        } catch (error) {
            messageElement.classList.add("error");
            messageElement.textContent = "Oops! Something went wrong. Please try again.";
            console.error("Error:", error);
        } finally {
            chatbox.scrollTo(0, chatbox.scrollHeight);
        }
    }

    const handleChat = () => {
        userMessage = chatInput.value.trim();
        if (!userMessage) return;

        chatInput.value = "";
        chatInput.style.height = `${inputInitHeight}px`;

        chatbox.appendChild(createChatLi(userMessage, "outgoing"));
        chatbox.scrollTo(0, chatbox.scrollHeight);

        chatHistory.push({ role: 'user', content: userMessage });

        setTimeout(() => {
            const incomingChatLi = createChatLi("Thinking...", "incoming");
            chatbox.appendChild(incomingChatLi);
            chatbox.scrollTo(0, chatbox.scrollHeight);
            generateResponse(incomingChatLi);
        }, 600);
    }

    chatInput.addEventListener("input", () => {
        chatInput.style.height = `${inputInitHeight}px`;
        chatInput.style.height = `${chatInput.scrollHeight}px`;
    });

    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
            e.preventDefault();
            handleChat();
        }
    });

    sendChatBtn.addEventListener("click", handleChat);
    closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
    chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
});
