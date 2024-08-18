// const BankRate = require('../models/bankRateModel')

// exports.getBankRate = async (req, res) => {
//   try {
//     const bankRates = await BankRate.find(req.params.id)
//     res.status(200).json(bankRates)
//   } catch (error) {
//     res.status(500).send('Ooops!! Something Went Wrong, Try again...')
//   }
// }

// exports.addBankRate = async (req, res) => {
//   try {
//     const bankRate = await BankRate.create(req.body.bankRate)
//     res.status(201).json(bankRate)
//   } catch (error) {
//     if (error.message.match(/(Sending Account Id)/gi)) {
//       return res.status(400).send(error.message)
//     }
//     res.status(500).send('Ooops!! Something Went Wrong, Try again...')
//   }
// }

// exports.updateBankRate = async (req, res) => {
//   try {
//     const bankRate = await BankRate.findByIdAndUpdate(req.params.id, req.body.bankRate, {
//       new: true,
//       runValidators: true,
//     })
//     if (!bankRate) {
//       return res.status(404).send('Bank Rate Not Found')
//     }
//     res.status(200).json(bankRate)
//   } catch (error) {
//     if (error.message.match(/(Sending Account Id)/gi)) {
//       return res.status(400).send(error.message)
//     }
//     res.status(500).send('Ooops!! Something Went Wrong, Try again...')
//   }
// }
