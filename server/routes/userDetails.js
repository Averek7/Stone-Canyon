const router = require("express").Router();

router.post("/userDetails", async (req, res) => {
  const { userDetails } = req.body;

  console.log(userDetails)

  if (!userDetails) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // const aiResponse = await generateResponse(serviceId);

  return res.status(200).json({
    message: "Form submitted successfully!",
    // ai_response: aiResponse,
  });
});

module.exports = router;
