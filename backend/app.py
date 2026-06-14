from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
from google import genai
import PyPDF2
import json
import io

load_dotenv()

app = Flask(__name__)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

@app.route('/')
def home():
    return {"message": "EduQuest API is running!"}

@app.route('/api/upload-pdf', methods=['POST', 'OPTIONS'])
def upload_pdf():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    file = request.files['pdf']
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(file.read()))
    text = ''
    for page in pdf_reader.pages:
        text += page.extract_text()
    return jsonify({'text': text[:8000]})

@app.route('/api/summarize', methods=['POST', 'OPTIONS'])
def summarize():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    try:
        text = request.json['text']
        prompt = f"""Summarize the following study material clearly for a student.
Use simple language, highlight key concepts.
Content:
{text}"""
        response = client.models.generate_content(model='gemini-2.5-flash', contents=prompt)
        return jsonify({'summary': response.text})
    except Exception as e:
        print("SUMMARIZE ERROR:", str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-quiz', methods=['POST', 'OPTIONS'])
def generate_quiz():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    try:
        data = request.json
        print("QUIZ REQUEST RECEIVED:", data)  # add this line
        text = data['text']
        difficulty = data['difficulty']
        num_questions = data['num_questions']
        prompt = f"""Generate {num_questions} multiple choice questions at {difficulty} level from the content below.
Return ONLY a valid JSON array, no markdown, no explanation:
[{{"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"correct":"A) ...","explanation":"..."}}]
Content:
{text}"""
        response = client.models.generate_content(model='gemini-2.5-flash', contents=prompt)
        clean = response.text.strip().replace('```json','').replace('```','')
        questions = json.loads(clean)
        return jsonify(questions)
    except Exception as e:
        print("QUIZ ERROR:", str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/submit-score', methods=['POST', 'OPTIONS'])
def submit_score():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    return jsonify({'message': 'Score saved!'})

@app.route('/api/leaderboard', methods=['GET', 'OPTIONS'])
def leaderboard():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    return jsonify([])

if __name__ == '__main__':
    app.run(debug=True)