require('dotenv').config()
const path = require('path')
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const Admin = require('./models/adminModel')
const User = require('./models/userModel')
const AccountRequest = require('./models/accountRequestModel')
const Account = require('./models/accountModel')
const notificationController = require('./middlewares/notificationMiddleware/sendNotificationMiddleware')

const app = express()

// Connect to MongoDB
const { connectToMongoose } = require('./config/db')

app.use(express.json())
app.use(cors())

const { apiLimiter } = require('./middlewares/rateLimitMiddleware/rateLimitMiddleware')
app.use('/api', apiLimiter)

const usersRoute = require('./routes/usersRoutes')
app.use('/api/users', usersRoute)

const adminsRoute = require('./routes/adminRoutes')
app.use('/api/admins', adminsRoute)

const accountRoute = require('./routes/accountRoutes')
app.use('/api/account', accountRoute)

const accountRequestRoute = require('./routes/accountRequestRoutes')
app.use('/api/request', accountRequestRoute)


async function setupDemo() {
  const adminExists = await Admin.findOne({ role: 'owner' });
  if (adminExists) {
    console.log('Admin exists');
    return;
  }

  await Admin.create({
    admin_name: 'Admin User',
    email: 'admin@example.com',
    password: await bcrypt.hash('adminPassword', 10),
    role: 'owner',
  });

  let usersCreated = [];
  for (let i = 0; i < 100; i++) {
    const phoneNumber = `980000${(i + 1000).toString().padStart(4, '0')}`;

    const newUser = new User({
      user_name: `user${i}`,
      email: `user${i}@example.com`,
      password: await bcrypt.hash('userPassword' + i, 10),
      phone: phoneNumber,
      full_addresse: `123 Example St, City${i}`,
      zip_code: 44600,
    });

    const savedUser = await newUser.save();
    usersCreated.push(savedUser);

    const newAccountRequest = new AccountRequest({
      client_id: savedUser._id.toString(),
      initial_balance: Math.floor(Math.random() * 100000),
    });

    const savedAccountRequest = await newAccountRequest.save();

    const newAccount = new Account({
      client_id: savedUser._id.toString(),
      balance: savedAccountRequest.initial_balance,
    });

    const savedAccount = await newAccount.save();

    await User.findByIdAndUpdate(savedUser._id, {
      $inc: { no_of_account: 1 },
      $push: {
        accounts: savedAccount._id.toString(),
        notifications: {
          type: 'approved',
          title: 'Account Approved!',
          message: 'Your account has been approved and created successfully.',
          data: [{ account_id: savedAccount._id.toString() }],
        },
      },
    });

    await AccountRequest.findByIdAndDelete(savedAccountRequest._id);
  }

  simulateTransactions(usersCreated);
}

async function simulateTransactions(users) {
  for (let i = 0; i < users.length; i++) {
    const currentUser = users[i];
    const currentAccount = await Account.findOne({ client_id: currentUser._id });

    for (let j = 0; j < 100; j++) {
      const transactionType = Math.random();
      const amount = Math.floor(Math.random() * 1000) + 100;

      if (transactionType < 0.33) {
        // Deposit logic
        currentAccount.balance += amount;
        currentAccount.deposit_logs.push({ depositted_amount: amount });
        console.log(`Deposit of ${amount} completed for user ${currentUser.user_name}`);
      } else if (transactionType < 0.66 && currentAccount.balance > amount) {
        // Withdraw logic
        currentAccount.balance -= amount;
        currentAccount.withdraw_logs.push({ withdrawed_amount: amount });
        console.log(`Withdrawal of ${amount} completed for user ${currentUser.user_name}`);
      } else {
        // Transfer logic
        const recipientIndex = Math.floor(Math.random() * users.length);
        if (i !== recipientIndex && currentAccount.balance > amount) {
          const recipientAccount = await Account.findOne({ client_id: users[recipientIndex]._id });
          currentAccount.balance -= amount;
          recipientAccount.balance += amount;

          currentAccount.out.push({
            to: recipientAccount._id,
            balance_transfered: amount,
          });
          recipientAccount.in.push({
            from: currentAccount._id,
            balance_transfered: amount,
          });

          await recipientAccount.save();
          console.log(`Transfer of ${amount} from ${currentUser.user_name} to ${users[recipientIndex].user_name} completed`);
        }
      }
      await currentAccount.save();
    }
  }
}

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../Frontend/dist')))
  app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, '../', 'Frontend', 'dist', 'index.html')))
}

connectToMongoose()
  .then(() => {
    setupDemo()
    app.listen(process.env.PORT || 5001, () => console.log(`Server is running on port ${process.env.PORT || 5001}`))
  })
  .catch(err => console.error('Connection error:', err))

module.exports = app
