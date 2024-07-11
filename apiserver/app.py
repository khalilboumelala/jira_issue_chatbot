from flask import Flask, request, Response, stream_with_context
from flask_cors import CORS
import ollama

app = Flask(__name__)
CORS(app)

# Read the prompt content from the file
prompt_file_path = "llama3_prompt.txt"
with open(prompt_file_path, "r") as file:
    prompt = file.read()

# Initialize the model context with the prompt
initial_messages = [{'role': 'system', 'content': prompt}]
conversation_history = initial_messages[:]  # Copy initial messages to the conversation history

@app.route("/ai_stream", methods=["POST", "GET"])
def ai_stream():
    if request.method == "POST":
        json_content = request.json
        user_query = json_content.get("query")
    else:  # Handle GET request
        user_query = request.args.get("query")

    user_message = {'role': 'user', 'content': user_query}
    conversation_history.append(user_message)  # Add user message to conversation history

    @stream_with_context
    def generate():
        stream = ollama.chat(
            model='jira-llama3',
            messages=conversation_history,
            stream=True
        )
        for chunk in stream:
            yield f"data: {chunk['message']['content']}\n\n"
        yield "data: [DONE]\n\n"

    return Response(generate(), content_type='text/event-stream')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
