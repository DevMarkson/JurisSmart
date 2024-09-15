# JurisSmart

**JurisSmart** is a web application designed to assist users in navigating complex legal matters, with a special emphasis on Intellectual Property law. Built using **React.js** for the frontend, **Flask** for the backend, the app leverages **Azure OpenAI** and **Azure Cognitive Search** to provide fast, accurate legal answers. The app retrieves relevant information from legal documents and trusted sources across **Nigeria**, the **USA**, and the **UK** and provides citation-backed answers, ensuring users receive reliable, authoritative responses.

## Table of Contents

- [Introduction](#introduction)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Technologies Used](#technnologies-used)
- [Installation and Setup](#installation-and-setup)
- [Technologies Used](#technologies-used)
- [API Endpoints](#api-endpoints)


## Introduction

JurisSmart aims to simplify the complexities of IP law by providing users with clear, concise answers to their legal questions. The application uses advanced AI models to generate responses and includes citations from authoritative legal texts.

## Problem Statement

Navigating the complexities of legal documentation, especially in Intellectual Property (IP) law, can be daunting. Legal documents are often challenging to interpret, and finding the relevant information quickly is a struggle for non-experts. JurisSmart simplifies this process by offering a tool that delivers fast, concise, and verifiable legal advice.

## Solution

JurisSmart simplifies access to IP law information by:

- Offering a user-friendly interface to ask legal questions.
- Providing AI-generated responses from Azure OpenAI, and Azure Cognitive Search based on real legal data.
- Citing legal sources dynamically and linking to the original documents.
- Quick access to common legal questions.
- Users can send feedback via email.

## Project Structure

The project is divided into two main parts: the front-end and the back-end.

### Front-end

- **index.html**: Entry point for the React application.
- **package.json**: Contains project metadata and dependencies.
- **src/**: Contains the source code for the React application.
  - **App.jsx**: Main application component.
  - **components/**: Contains reusable React components like `Chat.jsx` and `Navbar.jsx`
  - **main.jsx**: Entry point for the React application.
  - **index.css**: Global CSS styles.

### Backend

- **app.py**: Main Flask application that handles API requests and integrates with Azure OpenAI and Azure Cognitive Search.
- **requirements.txt**: Lists the Python dependencies.

## Deployment

The web application has been deployed and is accessible at [jurissmart.azurewebsites.net](https://jurissmart.azurewebsites.net/)

## Technologies Used

### Frontend

- React
- Vite
- EmailJs

### Backend

- Flask
- Azure OpenAI
- Azure Cognitive Search
- Azure blob storage

## Installation and Setup

### Prerequisites

To set up the app locally, you need:

- Python 3.x
- Azure Account with access to Azure OpenAI and Azure Cognitive Search services

### Backend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/DevMarkson/jurissmart.git
   cd jurissmart
   cd backend
   ```

2. Install dependencies

   ```bash
   pip install -r requirements.txt
   ```

3. Set up the environment variables in a `.env` file:

   ```bash
   AZURE_OAI_ENDPOINT=<Your Azure OpenAI Endpoint>
   AZURE_OAI_KEY=<Your Azure OpenAI API Key>
   AZURE_OAI_DEPLOYMENT=<Azure OpenAI Deployment Name>
   AZURE_SEARCH_ENDPOINT=<Azure Cognitive Search Endpoint>
   AZURE_SEARCH_KEY=<Azure Cognitive Search Key>
   AZURE_SEARCH_INDEX=<Azure Cognitive Search Index>
   ```

4. Start the flask server

   ```bash
   python app.py
   ```

## API Endpoints

### Request body
- **POST /generate**: Ask a legal question
```
   {
   "prompt": "What are the copyright laws in Nigeria?",
   "settings": {
      "temperature": 0.5,
      "max_tokens": 1000
   },
   "show_citations": true
   }
```

### Response
```
{
  "response": "Under Nigerian law, the Copyright Act protects various forms of expression...",
  "citations": [
    {
      "number": 1,
      "title": "CopyrightAct2023FinalPublication - Nigeria.pdf",
      "pdf_link": "https://www.copyright.gov.ng/wp-content/uploads/2023/04/CopyrightAct2023FinalPublication1.pdf"
    }
  ]
}
```
