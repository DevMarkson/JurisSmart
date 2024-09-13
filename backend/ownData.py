import os
import json
from dotenv import load_dotenv

# Add OpenAI import
from openai import AzureOpenAI

def main(): 
        
    try:
        # Flag to show citations
        show_citations = True  # Set to True to show legal references/citations

        # Get configuration settings 
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
            api_version="2023-09-01-preview")

        # Get the prompt (question related to IP law)
        text = input('\nEnter a legal question related to Intellectual Property Law:\n')

        # Configure your data source (IP law data stored in Azure Cognitive Search)
        extension_config = dict(dataSources = [  
            { 
                "type": "AzureCognitiveSearch", 
                "parameters": { 
                    "endpoint": azure_search_endpoint, 
                    "key": azure_search_key, 
                    "indexName": azure_search_index,
                }
            }]
        )

        # Send request to Azure OpenAI model
        print("...Sending the following request to Azure OpenAI endpoint...")
        print("Request: " + text + "\n")

        # Adjust the system message to define the chatbot's role as a legal advisor
        response = client.chat.completions.create(
            model = azure_oai_deployment,
            temperature = 0.5,
            max_tokens = 1000,
            messages = [
                {"role": "system", "content": "You are a legal advisor specializing in Intellectual Property Law for Nigeria, the US, and the UK. Answer legal questions by retrieving relevant information from legal acts."},
                {"role": "user", "content": text}
            ],
            extra_body = extension_config
        )

        # Print the response (legal advice or summarization)
        print("Response: " + response.choices[0].message.content + "\n")

        if show_citations:
            try:
                # Attempt to retrieve the citations from the response
                citations = response.choices[0].message.context.get("messages", [])[0].get("content", None)
                
                if citations:
                    # Process the citations if they exist
                    citation_json = json.loads(citations)
                    print("Citations:")
                    for c in citation_json.get("citations", []):
                        print(f"  Title: {c.get('title', 'No title available')}\n    URL: {c.get('url', 'No URL available')}")
                else:
                    print("No citations available in the response.")
            except Exception as e:
                print(f"An error occurred while processing citations: {e}")

    except Exception as ex:
        print(ex)


if __name__ == '__main__': 
    main()
