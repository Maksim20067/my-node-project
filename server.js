// Подключаем необходимые модули
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Устанавливаем middleware для парсинга JSON
app.use(express.json());

// Путь к файлу, где будут храниться данные пользователей
const filePath = path.join(__dirname, 'users.json');

// Функция для чтения данных из файла
function readUsersFromFile() {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  }
  return [];
}

// Функция для записи данных в файл
function writeUsersToFile(users) {
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
}

// 1. Получить всех пользователей
app.get('/users', (req, res) => {
  const users = readUsersFromFile();
  res.json(users);
});

// 2. Получить пользователя по ID
app.get('/users/:id', (req, res) => {
  const users = readUsersFromFile();
  const user = users.find(u => u.id === parseInt(req.params.id));

  if (!user) {
    return res.status(404).send('Пользователь не найден');
  }

  res.json(user);
});

// 3. Добавить нового пользователя
app.post('/users', (req, res) => {
  const { id, name } = req.body;

  if (!id || !name) {
    return res.status(400).send('ID и имя обязательны');
  }

  const users = readUsersFromFile();
  const userExists = users.find(u => u.id === id);

  if (userExists) {
    return res.status(400).send('Пользователь с таким ID уже существует');
  }

  const newUser = { id, name };
  users.push(newUser);
  writeUsersToFile(users);

  res.status(201).json(newUser);
});

// 4. Обновить пользователя
app.put('/users/:id', (req, res) => {
  const { name } = req.body;
  const users = readUsersFromFile();
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));

  if (userIndex === -1) {
    return res.status(404).send('Пользователь не найден');
  }

  users[userIndex].name = name;
  writeUsersToFile(users);

  res.json(users[userIndex]);
});

// 5. Удалить пользователя
app.delete('/users/:id', (req, res) => {
  let users = readUsersFromFile();
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));

  if (userIndex === -1) {
    return res.status(404).send('Пользователь не найден');
  }

  users = users.filter(u => u.id !== parseInt(req.params.id));
  writeUsersToFile(users);

  res.status(204).send();
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
