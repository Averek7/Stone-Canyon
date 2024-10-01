# Chatbot Interaction with OpenAI API and CSV Data

## Project Overview

This project implements an interactive chatbot that integrates OpenAI API responses and uses CSV data to provide personalized question-answer interactions for users. The chatbot processes user input, fetches data from a CSV file for predefined questions and options, and leverages OpenAI's API to enhance responses when needed. It also tracks user selections and provides a final service ID based on selected options.

## Approach

1. **Frontend Integration**: 
   - Built a dynamic chatbot interface using React, with options for the user to select predefined answers. These options were fetched from a CSV file processed on the backend.
   - Implemented a flow where the chatbot presents questions sequentially and stores user responses to compute a final service ID based on logic applied to the first set of questions and options.

2. **Backend with OpenAI Integration**:
   - The backend API fetches data from a CSV file containing the questions and options. It dynamically provides these options to the frontend.
   - Integrated OpenAI API to provide additional conversational enhancements when required. For example, if the user input is outside the predefined scope, the chatbot consults OpenAI's API for generating responses.
  
3. **User Interaction Handling**:
   - User responses are tracked using state management in React, and the final service ID is calculated based on user selections.
   - A modal form is included to collect additional user details before confirming the final service ID.

4. **Testing**:
   - The solution was tested using sample datasets in CSV format. The questions and options were mapped correctly, and the chatbot displayed them in sequence.
   - API calls to OpenAI were tested to handle cases where user input didn’t match predefined options, ensuring responses were generated dynamically.
   - Extensive testing was done on form submissions, modals, and the final service ID calculation to ensure smooth user flow.

## Challenges Faced

1. **State Management for Dynamic Inputs**:
   - Handling user input and dynamically updating state was a key challenge, particularly when switching between predefined options and API-generated responses.
   - **Solution**: Used React's state management to track user selections, and a conditional rendering system to toggle between CSV data and API responses.

2. **Mapping CSV Data to Frontend**:
   - Parsing CSV data and properly mapping it to questions and options on the frontend required careful attention to indexing and ensuring that the CSV format was consistent.
   - **Solution**: Developed a structured format for the CSV data and built a parsing function that extracted questions and options efficiently.

3. **OpenAI API Rate Limits**:
   - Integrating OpenAI API responses posed a challenge due to rate limits when multiple users interacted with the bot simultaneously.
   - **Solution**: Implemented basic rate-limiting and error handling to ensure API calls were throttled and users received fallback responses when necessary.

## Tools Used

1. **React**: For building the chatbot frontend and managing user interactions.
2. **Node.js/Express**: Backend API to serve questions from the CSV file and interact with OpenAI API.
3. **OpenAI API**: Used for generating additional responses when user input was not within predefined answers.
4. **Axios**: For making HTTP requests from both the frontend (React) and backend (Node.js).
5. **CSV Parsing Libraries**: For processing CSV data on the backend and dynamically providing it to the frontend.

## Testing the Solution

- **Unit Testing**: Each component (e.g., input handling, option selection, OpenAI API responses) was tested individually to ensure correctness.