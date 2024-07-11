import ollama

# Read the prompt content from the file
prompt_file_path = "llama3_prompt.txt"
with open(prompt_file_path, "r") as file:
    prompt = file.read()

# Create a custom model with the prompt
modelfile = f'''
FROM llama3
SYSTEM {prompt}
'''

ollama.create(model='jira-llama3-custom', modelfile=modelfile)
