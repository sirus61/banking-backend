const mongoose = require('mongoose')
const Account = require('./Backend/models/accountModel')  // Adjust the path as needed

// Connect to MongoDB
mongoose.connect('mongodb+srv://banking:test@testbanking.4fqadcz.mongodb.net/test', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB')
    updateCreditScores().then(() => {
      console.log('Credit scores updated')
      mongoose.disconnect()
    })
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err)
  })

async function updateCreditScores() {
  const accounts = await Account.find()

  for (const account of accounts) {
    let creditScore = calculateCreditScore(account)
    account.credit_score = creditScore
    await account.save()
    console.log(`Updated credit score for account ${account._id}: ${creditScore}`)
  }
}

function calculateCreditScore(account) {
  // Example criteria for calculating credit score
  let score = 50  // Base score

  // Increase score based on balance
  if (account.balance > 100000) {
    score += 20
  } else if (account.balance > 50000) {
    score += 10
  }

  // Decrease score based on number of withdrawals
  if (account.withdraw_logs.length > 50) {
    score -= 10
  }

  // Increase score based on number of deposits
  if (account.deposit_logs.length > 50) {
    score += 10
  }

  // Ensure the score is within the range [0, 100]
  score = Math.max(0, Math.min(100, score))

  return score
}
