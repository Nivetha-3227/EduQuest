from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import google.generativeai as genai
import PyPDF2
import json
import io

load_dotenv()

app = Flask(__name__)
CORS(app, origins="*")

genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-1.5-flash')

@app.route('/')
def home():
    return {"message": "EduQuest API is running!"}

@app.route('/api/upload-pdf', methods=['POST'])
def upload_pdf():
    file = request.files['pdf']
    pdf_reader = PyPDF2.PdfReader(io.BytesIO(file.read()))
    text = ''
    for page in pdf_reader.pages:
        text += page.extract_text()
    return jsonify({'text': text[:8000]})

@app.route('/api/summarize', methods=['POST'])
def summarize():
    text = request.json['text']
    prompt = f"""Summarize the following study material clearly for a student.
Use simple language, highlight key concepts.

Content:
{text}"""
    response = model.generate_content(prompt)
    return jsonify({'summary': response.text})

@app.route('/api/generate-quiz', methods=['POST'])
def generate_quiz():
    data = request.json
    text = data['text']
    difficulty = data['difficulty']
    num_questions = data['num_questions']

    prompt = f"""Generate {num_questions} multiple choice questions at {difficulty} level from the content below.
Return ONLY a valid JSON array, no markdown, no explanation:
[{{"question":"...","options":["A) ...","B) ...","C) ...","D) ..."],"correct":"A) ...","explanation":"..."}}]

Content:
{text}"""

    response = model.generate_content(prompt)
    clean = response.text.strip().replace('```json','').replace('```','')
    questions = json.loads(clean)
    return jsonify(questions)

@app.route('/api/submit-score', methods=['POST'])
def submit_score():
    data = request.json
    # Will connect to Supabase later
    return jsonify({'message': 'Score saved!'})

@app.route('/api/leaderboard', methods=['GET'])
def leaderboard():
    # Will connect to Supabase later
    return jsonify([])

if __name__ == '__main__':
    app.run(debug=True)