const { GoogleGenerativeAI } = require('@google/generative-ai')
const Performance = require('../models/Performance')
const Player = require('../models/Player')

// Initialize Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// @desc    Analyze player performance stats using Gemini AI
// @route   POST /api/ai/analyze-player/:playerId
// @access  Private
exports.analyzePlayerPerformance = async (req, res) => {
  try {
    const { playerId } = req.params

    // 1. Fetch Player and Match Performance logs
    const player = await Player.findById(playerId).populate('userId', 'name')
    if (!player) {
      return res.status(404).json({ message: 'Player not found' })
    }

    const performances = await Performance.find({ playerId })
    if (performances.length === 0) {
      return res.status(400).json({ 
        message: 'No match performance logs found for this player. Log at least one match first.' 
      })
    }

    // 2. Aggregate stats
    const totalMatches = performances.length
    const totalGoals = performances.reduce((acc, match) => acc + match.goals, 0)
    const totalAssists = performances.reduce((acc, match) => acc + match.assists, 0)
    const avgRating = (performances.reduce((acc, match) => acc + match.rating, 0) / totalMatches).toFixed(1)
    const avgPassing = (performances.reduce((acc, match) => acc + match.passingAccuracy, 0) / totalMatches).toFixed(1)

    const prompt = `
      You are an expert football performance analyst. Evaluate the following player stats:
      - Player Name: ${player.userId?.name || 'Unknown'}
      - Position: ${player.position}
      - Preferred Foot: ${player.preferredFoot}
      - Age: ${player.age}
      - Matches Evaluated: ${totalMatches}
      - Total Goals: ${totalGoals}
      - Total Assists: ${totalAssists}
      - Average Match Rating: ${avgRating}/10
      - Average Pass Accuracy: ${avgPassing}%

      Provide a concise evaluation formatted in raw JSON with the following exact keys:
      {
        "potentialScore": <number between 1 and 100>,
        "potentialTier": "<High Potential / Squad Player / Developing Elite>",
        "strengths": ["<strength 1>", "<strength 2>"],
        "weaknesses": ["<weakness 1>", "<weakness 2>"],
        "trainingSuggestions": ["<suggestion 1>", "<suggestion 2>"]
      }
      Respond strictly with raw valid JSON. Do not include markdown code blocks or triple backticks.
    `

    // 3. Request analysis from Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })
    const result = await model.generateContent(prompt)
    const textResponse = result.response.text()

    // Clean response in case Markdown formatting backticks were added
    const cleanedJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim()
    const aiOutput = JSON.parse(cleanedJson)

    res.json({
      success: true,
      playerId,
      playerName: player.userId?.name,
      statsSummary: {
        totalMatches,
        totalGoals,
        totalAssists,
        avgRating,
        avgPassing,
      },
      aiAnalysis: aiOutput,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}