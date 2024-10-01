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

    const selectedServiceID = selectedOption ? selectedOption.serviceID : "";

    setPreviousInteractions((prev) => [
      ...prev,
      { question: currentQuestion.question, option: option },
    ]);

    setUserResponses({
      ...userResponses,
      [currentQuestion.question]: option,
    });

    if (currentQuestionIndex === questions.length - 1) {
      setServiceID(selectedServiceID);
      setModalType("confirm");
      setShowModal(true);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleConfirm = async () => {
    const userDetailsWithServiceID = {
      ...userDetails,
      serviceID,
    };

    console.log("User Details Submitted:", userDetailsWithServiceID);
    try {
      const response = await axios.post(
        "https://stone-canyon.onrender.com/api/userDetails",
        {
          userDetails: userDetailsWithServiceID,
        }
      );
      console.log("User details submitted successfully:", response);
    } catch (error) {
      console.error("Error submitting user details:", error);
    }

    setModalType("serviceID");
    setShowModal(true);
  };

  useEffect(() => {
    if (categoryID) {
      fetchQuestions(categoryID);
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
        <h4>Category Serves to : {category}</h4>
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
