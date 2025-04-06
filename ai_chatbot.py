from openai import OpenAI, APIError, AuthenticationError
import json
import logging
from datetime import datetime
from flask import Flask, request, jsonify

app = Flask(__name__)

class AIOptimizationChatbot:
    def __init__(self, api_key):
        self.api_key = api_key
        self.client = OpenAI(api_key=api_key)
        self.conversation_history = []
        self.setup_logging()

    def setup_logging(self):
        logging.basicConfig(
            filename=f'chatbot_logs_{datetime.now().strftime("%Y%m%d")}.log',
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )

    def generate_response(self, user_input):
        try:
            self.conversation_history.append({"role": "user", "content": user_input})
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=self.conversation_history,
                max_tokens=1000,
                temperature=0.7
            )

            ai_response = response.choices[0].message.content
            self.conversation_history.append({"role": "assistant", "content": ai_response})
            logging.info(f"Generated response for input: {user_input[:50]}...")
            
            return ai_response

        except AuthenticationError as e:
            logging.error(f"OpenAI Authentication Error: {str(e)}")
            return jsonify({'error': 'Authentication failed. Please check your API key.'}), 401
        except APIError as e:
            logging.error(f"OpenAI API Error: {str(e)}")
            return jsonify({'error': 'OpenAI service is currently unavailable.'}), 503
        except Exception as e:
            logging.error(f"Unexpected error: {str(e)}", exc_info=True)
            return "An unexpected error occurred. Please try again later."

    def save_conversation(self, filename="conversation_history.json"):
        try:
            with open(filename, 'w') as f:
                json.dump(self.conversation_history, f, indent=2)
            logging.info(f"Conversation saved to {filename}")
        except Exception as e:
            logging.error(f"Error saving conversation: {str(e)}")

    def load_conversation(self, filename="conversation_history.json"):
        try:
            with open(filename, 'r') as f:
                self.conversation_history = json.load(f)
            logging.info(f"Conversation loaded from {filename}")
        except Exception as e:
            logging.error(f"Error loading conversation: {str(e)}")

# Initialize chatbot with API key
try:
    chatbot = AIOptimizationChatbot("sk-abcdef1234567890abcdef1234567890abcdef12")  # User-provided API key
except Exception as e:
    print(f"Failed to initialize chatbot: {str(e)}")
    exit(1)

@app.route('/')
def home():
    return "Chatbot API is running. Use POST /chat to interact."

@app.route('/chat', methods=['POST'])
def chat():
    try:
        if not request.is_json:
            return jsonify({'error': 'Request must be JSON'}), 400
            
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'Missing message parameter'}), 400
            
        user_input = data['message']
        print(f"Received chat request: {user_input[:100]}...")  # Log first 100 chars
        response = chatbot.generate_response(user_input)
        return jsonify({'response': response})
        
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == "__main__":
    print("Starting chatbot server...")
    app.run(host='0.0.0.0', port=8000)
