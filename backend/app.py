from flask import Flask, render_template, request, jsonify
import os
import json
from dotenv import load_dotenv
from openai import AzureOpenAI
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS on the entire app
app.secret_key = 'azure_ai_9999999'

# Load environment variables
load_dotenv()
azure_oai_endpoint = os.getenv("AZURE_OAI_ENDPOINT")
azure_oai_key = os.getenv("AZURE_OAI_KEY")
azure_oai_deployment = os.getenv("AZURE_OAI_DEPLOYMENT")
azure_search_endpoint = os.getenv("AZURE_SEARCH_ENDPOINT")
azure_search_key = os.getenv("AZURE_SEARCH_KEY")
azure_search_index = os.getenv("AZURE_SEARCH_INDEX")

# Client will be initialized when first needed
client = None


def get_azure_client():
    global client
    if client is None:
        try:
            # Try the newer initialization method first
            client = AzureOpenAI(
                azure_endpoint=azure_oai_endpoint,
                api_key=azure_oai_key,
                api_version="2023-12-01-preview"
            )
        except Exception as e:
            print(f"Error with new method: {e}")
            try:
                # Fallback to older initialization method
                client = AzureOpenAI(
                    api_key=azure_oai_key,
                    api_version="2023-12-01-preview",
                    azure_endpoint=azure_oai_endpoint
                )
            except Exception as e2:
                print(f"Error with fallback method: {e2}")
                try:
                    # Last resort - minimal parameters
                    client = AzureOpenAI(
                        api_key=azure_oai_key,
                        azure_endpoint=azure_oai_endpoint
                    )
                except Exception as e3:
                    print(f"All initialization methods failed: {e3}")
                    raise e3
    return client


# PDF links for citations
pdf_links_dict = {
    "CopyrightAct2023FinalPublication - Nigeira.pdf": "https://www.copyright.gov.ng/wp-content/uploads/2023/04/CopyrightAct2023FinalPublication1.pdf#:~:text=13.",
    "COP24_Chapter-19_USA.pdf": "https://iclg.com/practice-areas/copyright-laws-and-regulations/usa",
    "COP24_Chapter-18_UK.pdf": "https://iclg.com/practice-areas/copyright-laws-and-regulations/united-kingdom",
    "COP24_Chapter-11_Nigeria.pdf": "https://iclg.com/practice-areas/copyright-laws-and-regulations/nigeria",
    "Patent and Design Act - U.S.pdf": "https://www.uspto.gov/web/offices/pac/mpep/consolidated_laws.pdf",
    "Patents and Designs Act 1970 - Nigeria.pdf": "https://lawsofnigeria.placng.org/laws/P2.pdf",
    "Trade Mark Act - Nigeria": "https://nigeriatradeportal.fmiti.gov.ng/media/Trade%20Mark%20Act.pdf",
    "CopyRight Acts - USA": "https://www.copyright.gov/title17/title17.pdf",
    "Copyright, Designs and Patents Act 1988 - UK": "https://www.legislation.gov.uk/ukpga/1988/48/data.pdf",
    "Trademark Act 1946 - US.pdf": "https://www.uspto.gov/sites/default/files/trademarks/law/Trademark_Statutes.pdf",
    "COP24_Chapter-18_UnitedKingdom.pdf": "https://www.legislation.gov.uk/ukpga/1994/26/data.pdf"
}


@app.route('/')
def index():
    return jsonify({
        'status': 'JurisSmart Backend is running!',
        'message': 'Legal AI API is ready to serve requests',
        'endpoints': {
            'generate': '/generate',
            'health': '/health'
        }
    })


@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': '2025-10-12',
        'service': 'jurissmart-backend'
    })


@app.route('/generate', methods=['POST'])
def generate_response():
    data = request.json
    prompt = data.get('prompt')
    temperature = data.get('settings', {}).get('temperature', 0.5)
    max_tokens = data.get('settings', {}).get('max_tokens', 1000)
    show_citations = data.get('show_citations', True)

    # Configure your data source (IP law data stored in Azure Cognitive Search)
    try:
        # Get the client instance
        azure_client = get_azure_client()

        # Send request to Azure OpenAI model
        response = azure_client.chat.completions.create(
            model=azure_oai_deployment,
            temperature=temperature,
            max_tokens=max_tokens,
            messages=[
                {"role": "system", "content": "You are a legal advisor specializing in Intellectual Property Law for Nigeria, the US, and the UK. Answer legal questions by retrieving relevant information from legal acts."},
                {"role": "user", "content": prompt}
            ],
            extra_body={
                "data_sources": [{
                    "type": "azure_search",
                    "parameters": {
                        "endpoint": azure_search_endpoint,
                        "index_name": azure_search_index,
                        "authentication": {
                            "type": "api_key",
                            "key": azure_search_key
                        }
                    }
                }]
            }
        )

        response_text = response.choices[0].message.content
        final_citations = []

        # Process citations if available (simplified for newer API)
        if show_citations:
            try:
                # Check if there are any citations in the response
                if hasattr(response.choices[0].message, 'context') and response.choices[0].message.context:
                    # Process citations from the new API format
                    context_data = response.choices[0].message.context
                    if isinstance(context_data, dict) and 'citations' in context_data:
                        citations = context_data['citations']
                        for i, citation in enumerate(citations, 1):
                            title = citation.get('title', f'Document {i}')
                            pdf_link = pdf_links_dict.get(
                                title, "No link available")
                            final_citations.append({
                                'number': i,
                                'title': title,
                                'pdf_link': pdf_link
                            })
            except Exception as e:
                print(f"An error occurred while processing citations: {e}")
                # Continue without citations if there's an error

        # Check for "not found" message and handle accordingly
        if "The requested information is not available in the retrieved data. Please try another query or topic." in response_text:
            return jsonify({
                'response': response_text,  # The generated text with numbered citations
                'citations': []  # List of unique citation numbers, titles, and PDF links
            })

        return jsonify({
            'response': response_text,  # The generated text with numbered citations
            'citations': final_citations  # List of unique citation numbers, titles, and PDF links
        })
    except Exception as ex:
        return jsonify({'error': str(ex)})


@app.route('/feedback', methods=['POST'])
def handle_feedback():
    try:
        data = request.json
        prompt = data.get('prompt')
        response = data.get('response')
        rating = data.get('rating')  # 'good' or 'bad'
        
        # Log the feedback (this will show up in Heroku logs)
        print(f"FEEDBACK RECEIVED: Rating={rating}")
        print(f"Prompt: {prompt}")
        print(f"Response Preview: {response[:50]}...")
        print("-" * 30)
        
        return jsonify({'status': 'success', 'message': 'Feedback received'})
    except Exception as e:
        print(f"Error processing feedback: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
