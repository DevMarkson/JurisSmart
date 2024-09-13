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

# Initialize the Azure OpenAI client
client = AzureOpenAI(
    base_url=f"{azure_oai_endpoint}/openai/deployments/{azure_oai_deployment}/extensions",
    api_key=azure_oai_key,
    api_version="2023-09-01-preview"
)

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
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate_response():
    data = request.json
    prompt = data.get('prompt')
    temperature = data.get('settings', {}).get('temperature', 0.5)
    max_tokens = data.get('settings', {}).get('max_tokens', 1000)
    show_citations = data.get('show_citations', True)

    # Configure your data source (IP law data stored in Azure Cognitive Search)
    extension_config = dict(dataSources=[
        {
            "type": "AzureCognitiveSearch",
            "parameters": {
                "endpoint": azure_search_endpoint,
                "key": azure_search_key,
                "indexName": azure_search_index,
            }
        }
    ])

    try:
        # Send request to Azure OpenAI model
        response = client.chat.completions.create(
            model=azure_oai_deployment,
            temperature=temperature,
            max_tokens=max_tokens,
            messages=[
                {"role": "system", "content": "You are a legal advisor specializing in Intellectual Property Law for Nigeria, the US, and the UK. Answer legal questions by retrieving relevant information from legal acts."},
                {"role": "user", "content": prompt}
            ],
            extra_body=extension_config
        )

        response_text = response.choices[0].message.content
        pdf_links = []

        # Process citations if available
        if show_citations:
            try:
                citations = response.choices[0].message.context.get("messages", [])[0].get("content", None)
                if citations:
                    citation_json = json.loads(citations)
                    citation_data = citation_json.get("citations", [])
                    
                    # Replace [doc1], [doc2], etc. with numbered citations
                    for i, citation in enumerate(citation_data, 1):
                        title = citation.get('title', 'No title available').strip()
                        pdf_link = pdf_links_dict.get(title, "No link available")  # Use dictionary to get the link
                        response_text = response_text.replace(f"[doc{i}]", f"[{i}]")  # Replace with numbered references
                        pdf_links.append({'number': i, 'title': title, 'pdf_link': pdf_link})

            except Exception as e:
                print(f"An error occurred while processing citations: {e}")

        return jsonify({
            'response': response_text,  # The generated text with numbered citations
            'citations': pdf_links       # List of citation numbers, titles, and PDF links
        })
    except Exception as ex:
        return jsonify({'error': str(ex)})

if __name__ == '__main__':
    app.run(debug=True)
