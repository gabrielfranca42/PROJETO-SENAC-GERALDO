
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');


app.use('/api/v1/users', userRoutes);
app.use('/api/v1/auth', authRoutes);