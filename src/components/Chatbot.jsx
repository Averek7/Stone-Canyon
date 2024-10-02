import axios from "axios";
import React, { useEffect, useState } from "react";
import { useCategory } from "../context/CategoryContext";
import Modal from "./Modal";

const Chatbot = ({ onClose }) => {
  const { categoryID, setChatbotVisible } = useCategory();
  const [questions, setQuestions] = useState([]);
  const [category, setCategory] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponses, setUserResponses] = useState({});
  const [previousInteractions, setPreviousInteractions] = useState([]);
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    zipcode: "",
    address: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [serviceID, setServiceID] = useState("");
  const [modalType, setModalType] = useState("confirm");
  const [userInput, setUserInput] = useState("");
  const [possibleServiceIDs, setPossibleServiceIDs] = useState([]);
  const [generatedPrompt, setGeneratedPrompt] = useState("");

  const fetchQuestions = async (categoryID) => {
    try {
      const response = await axios.post(
        "https://stone-canyon.onrender.com/api/get-question",
        { categoryID }
      );
      setQuestions(response.data.questions);
      setCategory(response.data.categoryName);
      setCurrentQuestionIndex(0);
      setPreviousInteractions([]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setLoading(false);
    }
  };

  const handleOptionSelect = (option) => {
    const currentQuestion = questions[currentQuestionIndex];
    const selectedOption = currentQuestion.options.find(
      (opt) => opt.option === option
    );

    if (selectedOption) {
      // Initialize possibleServiceIDs if it's the first question
      if (currentQuestionIndex === 0) {
        // Set possibleServiceIDs to the serviceIDs of the selected option
        setPossibleServiceIDs(selectedOption.serviceIDs);
      } else {
        // Update possible service IDs based on previous selections
        setPossibleServiceIDs((prevIDs) => {
          const newPossibleIDs = prevIDs.filter((id) =>
            selectedOption.serviceIDs.includes(id)
          );
          setServiceID(newPossibleIDs); // Update serviceID here
          return newPossibleIDs;
        });
      }

      // Update previous interactions and user responses
      setPreviousInteractions((prev) => [
        ...prev,
        { question: currentQuestion.question, option: option },
      ]);

      setUserResponses({
        ...userResponses,
        [currentQuestion.question]: option,
      });

      // Handle case when there's only one question
      if (questions.length === 1) {
        const finalServiceID = selectedOption.serviceIDs[0]; // Since there's only one question, take the first service ID

        setServiceID([finalServiceID]);
        setModalType("confirm");
        setShowModal(true);
      }
      // Handle case when possibleServiceIDs reduces to a single ID
      else if (possibleServiceIDs.length === 1) {
        const finalServiceID = possibleServiceIDs[0]; // Only one valid service ID remains

        // Set the final serviceID and open the confirmation modal
        setServiceID([finalServiceID]);
        setModalType("confirm");
        setShowModal(true);
      }
      // Check if this is the last question
      else if (currentQuestionIndex === questions.length - 1) {
        if (possibleServiceIDs.length > 0) {
          setModalType("confirm");
          setShowModal(true);
        } else {
          console.error("No valid service ID found.");
          setShowModal(false);
        }
      } else {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        setUserInput("");
      }
    }
  };

  const generatePrompt = async (query) => {
    try {
      const response = await axios.post("https://stone-canyon.onrender.com/api/prompt", {
        query,
      });
      const newPrompt = response.data.prompt;

      const userInteraction = {
        question: generatedPrompt,
        option: userInput,
      };

      // setPreviousInteractions((prev) => [...prev, userInteraction]);

      setGeneratedPrompt(newPrompt);
    } catch (error) {
      console.error("Error generating prompt:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputSubmit = (e) => {
    e.preventDefault();

    const categoryMatch = userInput.match(/Category\s*(\d+)/i);
    console.log(categoryMatch);
    if (categoryMatch) {
      setChatbotVisible(true);
      fetchQuestions(categoryMatch[1]);
      return;
    }

    const interaction = { question: generatedPrompt, option: userInput };
    setPreviousInteractions((prev) => [...prev, interaction]);
    setUserResponses((prev) => ({ ...prev, [generatedPrompt]: userInput }));

    if (!categoryID) {
      setLoading(true);
      generatePrompt(userInput);
      setUserInput("");
    } else {
      const currentQuestion = questions[currentQuestionIndex];
      const selectedOption = userInput;

      if (
        currentQuestion.options.some((opt) => opt.option === selectedOption)
      ) {
        handleOptionSelect(selectedOption);
      } else {
        alert("Please select a valid option.");
      }
    }
  };

  const handleConfirm = async () => {
    const userDetailsWithServiceID = {
      ...userDetails,
      serviceID,
      additionalInfo: userInput,
    };

    try {
      const response = await axios.post(
        "https://stone-canyon.onrender.com/api/userDetails",
        {
          userDetails: userDetailsWithServiceID,
        }
      );

      alert("User details submitted successfully !");
    } catch (error) {
      console.error("Error submitting user details:", error);
    }

    setModalType("serviceID");
    setShowModal(true);
  };

  useEffect(() => {
    if (categoryID) {
      fetchQuestions(categoryID);
    } else {
      setLoading(false);
      setGeneratedPrompt("How can I assist you?");
    }
  }, [categoryID]);

  if (loading) {
    return <p>Loading...</p>;
  }

  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <span>Chatbot</span>
        <button onClick={onClose} className="close-button">
          ✖️
        </button>
      </div>

      <div className="chatbot-body">
        <h4>
          {categoryID
            ? `Category Serves to: ${category}`
            : "No Category Selected"}
        </h4>

        {previousInteractions.map((interaction, index) => (
          <div key={index} className="previous-interaction">
            <p className="bot-response">
              <strong>Bot:</strong> {interaction.question}
            </p>
            <p className="user-response">
              <strong>You:</strong> {interaction.option}
            </p>
          </div>
        ))}

        <div className="previous-interaction">
          <p className="bot-response">
            <strong>Bot:</strong> {generatedPrompt}
          </p>
        </div>

        {loading && (
          <div className="loading-indicator">
            <p>Bot is thinking...</p>
          </div>
        )}

        {!showModal && currentQuestionIndex < questions.length && (
          <div className="current-question">
            <p className="bot-response">
              <strong>Bot:</strong> {questions[currentQuestionIndex].question}
            </p>
            <div className="options">
              {questions[currentQuestionIndex].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(option.option)}
                  className="option-button"
                >
                  {option.option}
                </button>
              ))}
            </div>
          </div>
        )}
        {isLastQuestion && serviceID && (
          <div className="current-question">
            <p className="bot-response">
              <strong>Bot:</strong> Your selected Service ID is: {serviceID}
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleInputSubmit} className="input-form">
        <input
          type="text"
          placeholder="Type your option..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="user-input"
        />
        <button type="submit">Submit</button>
      </form>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setChatbotVisible(false);
        }}
        userDetails={userDetails}
        setUserDetails={setUserDetails}
        onConfirm={handleConfirm}
        serviceID={serviceID}
        modalType={modalType}
      />
    </div>
  );
};

export default Chatbot;
