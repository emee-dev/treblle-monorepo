import app from './app.ts';
const PORT = process.env.PORT || 7000;

app.listen(PORT, () => console.log(`Server started....`));
