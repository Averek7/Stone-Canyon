const express = require("express");
const csv = require("csv-parser");
const cors = require("cors");
const axios = require("axios");
const { OpenAI } = require("openai");

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

let servicesData = [];

// Google Sheets CSV export link
const driveLink =
  "https://docs.google.com/spreadsheets/d/1xaeEm3vd5bMXAVbObaIeRgNFQ4hpW1O0QrEt5G_fX0Q/edit?usp=sharing";
const csvUrl = driveLink.replace("edit?usp=sharing", "export?format=csv");

// Load CSV data
axios.get(csvUrl, { responseType: "stream" }).then((response) => {
  response.data
    .pipe(csv())
    .on("data", (data) =>
      servicesData.push({
        categoryID: data["Category ID"].trim(),
        categoryName: data["Category Name"].trim(),
        serviceID: data["Service ID"].trim(),
        questionFunnel: data["Question Funnel"].trim(),
      })
    )
    .on("end", () => {
      console.log("CSV data loaded");
    });
});


app.post("/api/get-question", (req, res) => {
  const { categoryID } = req.body;
  const services = servicesData.filter(
    (service) => service.categoryID === categoryID
  );

  if (services.length > 0) {
    const questions = [];

    services.forEach((service) => {
      const funnelParts = service.questionFunnel
        .split("|")
        .map((part) => part.trim());

      funnelParts.forEach((part) => {
        const questionParts = part.split(">");
        const questionText = questionParts[0].trim(); // Get the question text
        const options = questionParts[1]
          ? questionParts[1].split(",").map((opt) => opt.trim())
          : []; // Get the options

        // Create or find the existing question entry
        let questionEntry = questions.find((q) => q.question === questionText);
        if (!questionEntry) {
          questionEntry = { question: questionText, options: [] };
          questions.push(questionEntry);
        }

        options.forEach((option) => {
          // Only add unique combinations of option and service ID
          if (
            !questionEntry.options.some(
              (o) => o.option === option && o.serviceID === service.serviceID
            )
          ) {
            questionEntry.options.push({
              option,
              serviceID: service.serviceID,
            });
          }
        });
      });
    });

    // Structure the response to have unique serviceID mapping
    const responseQuestions = questions.map((question) => {
      const uniqueOptions = {};
      question.options.forEach((option) => {
        if (!uniqueOptions[option.option]) {
          uniqueOptions[option.option] = option.serviceID;
        }
      });
      return {
        question: question.question,
        options: Object.entries(uniqueOptions).map(([option, serviceID]) => ({
          option,
          serviceID,
        })),
      };
    });

    res.json({ questions: responseQuestions, categoryName: services[0].categoryName });
  } else {
    res.status(404).json({ error: "Category not found" });
  }
});

const openai = new OpenAI({
  apiKey:
    "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", // Replace with your actual OpenAI API key
});

app.post("/api/get-prompt", async (req, res) => {
  try {
    const { currentQuestion } = req.body;

    const prompt = `How can i assist you ? ${currentQuestion}`;
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    const generatedPrompt = response.choices[0].message.content.trim();
    res.json({ prompt: generatedPrompt });
  } catch (error) {
    console.error("Error generating prompt:", error);
    res.status(500).json({ error: "Failed to generate prompt" });
  }
});

app.use('/api', require('./routes/userDetails'))

app.listen(3000, () => console.log("Server started on port 3000"));
