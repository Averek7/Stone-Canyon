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
        const questionText = questionParts[0].trim();
        const options = questionParts[1]
          ? questionParts[1].split(",").map((opt) => opt.trim())
          : [];

        let questionEntry = questions.find((q) => q.question === questionText);
        if (!questionEntry) {
          questionEntry = { question: questionText, options: [] };
          questions.push(questionEntry);
        }

        options.forEach((option) => {
          let optionEntry = questionEntry.options.find(
            (o) => o.option === option
          );
          if (!optionEntry) {
            optionEntry = { option, serviceIDs: [] };
            questionEntry.options.push(optionEntry);
          }

          // Add the serviceID to the option's serviceIDs array if it's not already present
          if (!optionEntry.serviceIDs.includes(service.serviceID)) {
            optionEntry.serviceIDs.push(service.serviceID);
          }
        });
      });
    });

    const responseQuestions = questions.map((question) => ({
      question: question.question,
      options: question.options.map((opt) => ({
        option: opt.option,
        serviceIDs: opt.serviceIDs, // Return all associated service IDs
      })),
    }));

    res.json({
      questions: responseQuestions,
      categoryName: services[0].categoryName,
    });
  } else {
    res.status(404).json({ error: "Category not found" });
  }
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API,
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

app.use("/api", require("./routes/userDetails"));

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(3000, () => console.log("Server started on port 3000"));
