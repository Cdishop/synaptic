import { useState, useEffect } from 'react'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import LinearProgress from '@mui/material/LinearProgress'
import TextareaAutosize from '@mui/material/TextareaAutosize'
import Box from '@mui/material/Box'

// Sample questions without TypeScript annotations
const agreementQuestions = [
  { id: 'q1', text: "I would like to spend a year in London or Paris.", type: 'agreement' },
  { id: 'q2', text: "If I had my life to live over, I would sure do things differently.", type: 'agreement' },
  { id: 'q3', text: "I am an impulse buyer.", type: 'agreement' },
  { id: 'q4', text: "I am a homebody.", type: 'agreement' },
  { id: 'q5', text: "A nationally advertised brand is usually a better buy than a generic brand.", type: 'agreement' },
]

const activityQuestions = [
  { id: 'a1', text: "Go to a party", type: 'activity' },
  { id: 'a2', text: "Go dancing", type: 'activity' },
  { id: 'a3', text: "Go to a movie at a theater", type: 'activity' },
  { id: 'a4', text: "Go to a live theater performance or to the opera", type: 'activity' },
  { id: 'a5', text: "Go for a walk", type: 'activity' },
]

const difficultyQuestions = [
  { id: 'd1', text: "Go dancing", type: 'difficulty' },
  { id: 'd2', text: "Go to a movie at a theater", type: 'difficulty' },
  { id: 'd3', text: "Go for a walk", type: 'difficulty' },
  { id: 'd4', text: "Play video or computer games", type: 'difficulty' },
  { id: 'd5', text: "Visit with friends", type: 'difficulty' },
  { id: 'd6', text: "Read books, magazines, or newspapers", type: 'difficulty' },
  { id: 'd7', text: "Go for a weekend trip", type: 'difficulty' },
]

const hiddenPrompt = `You are a conversational agent designed to get to know a conversation partner participant by asking questions that help you understand their personal interests, values, goals, and preferences. Your goal is to understand their values and goals to better predict their choices. Start with the questions provided below. Probe or follow up to ask for more detail about their answers, moving to the next question after each response. Use only the questions listed to avoid any outside knowledge. At the end, I will ask you to predict the participant's preferences for specific activities.`

export default function ExperimentFlow() {
  const [step, setStep] = useState(1)
  const [conversation, setConversation] = useState([])
  const [userInput, setUserInput] = useState('')
  const [responses, setResponses] = useState({})
  const [predictions, setPredictions] = useState({})
  const [accuracy, setAccuracy] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  const questions = [
    'If you could change anything about the way you were raised, what would it be?',
    'What would constitute a "perfect" day for you?',
    'For what in your life do you feel most grateful?',
    'If you could wake up tomorrow having gained one quality or ability, what would it be?',
    'Is there something that you\'ve dreamed of doing for a long time? Why haven\'t you done it?'
  ]

  useEffect(() => {
    if (step === 1 && conversation.length === 0) {
      setConversation([`AI: Hello! Let's start our conversation. ${questions[0]}`])
    }
  }, [step, conversation])

  const handleSendMessage = () => {
    if (userInput.trim() === '') return
    const newConversation = [...conversation, `You: ${userInput}`]
    setConversation(newConversation)
    setUserInput('')

    setTimeout(() => {
      let aiMessage
      if (Math.random() < 0.3 && currentQuestionIndex < questions.length) {
        aiMessage = "That's interesting! Can you tell me more about that?"
      } else {
        setCurrentQuestionIndex(prevIndex => prevIndex + 1)
        if (currentQuestionIndex < questions.length - 1) {
          aiMessage = questions[currentQuestionIndex + 1]
        } else {
          aiMessage = "Thank you for sharing your thoughts. Let's move on to the survey."
          setTimeout(() => setStep(2), 2000)
        }
      }
      setConversation([...newConversation, `AI: ${aiMessage}`])
    }, 1000)
  }

  const handleResponse = (questionId, type, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], [type]: value }
    }))
  }

  const handleChallengeReason = (questionId, reason) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], challengeReason: reason }
    }))
  }

  const handleSurveySubmit = () => {
    setStep(3)
    simulateLLMPredictions()
  }

  const simulateLLMPredictions = () => {
    const simulatedPredictions = {}
    ;[...agreementQuestions, ...activityQuestions, ...difficultyQuestions].forEach(question => {
      simulatedPredictions[question.id] = {
        agreement: Math.floor(Math.random() * 7) + 1,
        liking: Math.floor(Math.random() * 5) + 1,
        difficulty: Math.floor(Math.random() * 5) + 1,
      }
    })
    setPredictions(simulatedPredictions)

    let correctPredictions = 0
    let totalPredictions = 0
    Object.keys(responses).forEach(questionId => {
      const response = responses[questionId]
      const prediction = simulatedPredictions[questionId]
      if (response.agreement && prediction.agreement) {
        if (Math.abs(response.agreement - prediction.agreement) <= 1) correctPredictions++
        totalPredictions++
      }
      if (response.liking && prediction.liking) {
        if (Math.abs(response.liking - prediction.liking) <= 1) correctPredictions++
        totalPredictions++
      }
      if (response.difficulty && prediction.difficulty) {
        if (Math.abs(response.difficulty - prediction.difficulty) <= 1) correctPredictions++
        totalPredictions++
      }
    })
    setAccuracy(Math.round((correctPredictions / totalPredictions) * 100))

    setTimeout(() => setStep(4), 2000)
  }

  const renderMatrixTable = (questions, type) => {
    const scale = type === 'agreement' ? [1, 2, 3, 4, 5, 6, 7] : [1, 2, 3, 4, 5]
    const leftLabel = type === 'agreement' ? 'Strongly Disagree' : type === 'activity' ? 'Dislike Very Much' : 'Very Difficult'
    const rightLabel = type === 'agreement' ? 'Strongly Agree' : type === 'activity' ? 'Like Very Much' : 'Very Easy'

    return (
      <Box sx={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderSpacing: '0 10px' }}>
          <thead>
            <tr>
              <th style={{ width: '30%', textAlign: 'left' }}>{type === 'agreement' ? 'Statement' : 'Activity'}</th>
              {scale.map(value => (
                <th key={value} style={{ textAlign: 'center' }}>{value}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {questions.map(question => (
              <tr key={question.id}>
                <td>{question.text}</td>
                {scale.map(value => (
                  <td key={value} style={{ textAlign: 'center' }}>
                    <RadioGroup
                      onChange={(e) => handleResponse(question.id, type, parseInt(e.target.value))}
                    >
                      <FormControlLabel
                        value={value.toString()}
                        control={<Radio />}
                        label=""
                      />
                    </RadioGroup>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    )
  }

  return (
    <Card sx={{ maxWidth: '800px', margin: 'auto' }}>
      <Typography variant="h5" component="div" sx={{ padding: '16px' }}>
        Experimental Platform
      </Typography>
      <CardContent>
        {step === 1 && (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ height: 400, overflowY: 'auto', border: '1px solid #ccc', borderRadius: 2, padding: 2 }}>
              {conversation.map((message, index) => (
                <Typography key={index} color={message.startsWith('AI:') ? 'primary' : 'textSecondary'}>
                  {message}
                </Typography>
              ))}
            </Box>
            <Box sx={{ display: 'flex', mt: 2 }}>
              <TextField
                fullWidth
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your response..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button variant="contained" onClick={handleSendMessage} sx={{ ml: 2 }}>
                Send
              </Button>
            </Box>
          </Box>
        )}
        {step === 2 && (
          <Box>
            <Typography variant="h6">Survey</Typography>
            {renderMatrixTable(agreementQuestions, 'agreement')}
            {renderMatrixTable(activityQuestions, 'activity')}
            {renderMatrixTable(difficultyQuestions, 'difficulty')}
            <Button variant="contained" onClick={handleSurveySubmit} sx={{ mt: 4 }}>
              Submit Answers
            </Button>
          </Box>
        )}
        {step === 3 && (
          <Box textAlign="center">
            <Typography>Generating LLM predictions based on the conversation...</Typography>
            <LinearProgress sx={{ width: '100%', mt: 2 }} />
          </Box>
        )}
        {step === 4 && (
          <Box textAlign="center">
            <Typography variant="h6">LLM Prediction Accuracy</Typography>
            <Typography variant="h3" color="primary">{accuracy}%</Typography>
            <LinearProgress variant="determinate" value={accuracy} sx={{ width: '100%', mt: 2 }} />
            <Typography>The LLM correctly predicted {accuracy}% of your responses within a margin of 1 point.</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
