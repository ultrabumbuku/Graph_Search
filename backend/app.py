from flask import Flask, request, jsonify
from flask_cors import CORS
from graph_generator import get_related_words

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]}})

@app.route('/api/get_related_words', methods=['GET'])
def api_get_related_words():
    query = request.args.get('query', '')
    print(f"Received query: {query}")
    if not query:
        return jsonify({'error': 'Query parameter is required'}), 400

    try:
        graph_data = get_related_words(query)
        print(f"Returning data: {graph_data}")
        response = jsonify(graph_data)
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return jsonify({'error': str(e)}), 500
@app.route('/api/get_related_words', methods=['OPTIONS'])
def handle_options_request():
    return '', 204
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)