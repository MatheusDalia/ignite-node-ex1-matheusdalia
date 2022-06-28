const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {name} = request.headers;

  const user = users.find((user) => user.name === name)

  if(!user){
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;
  const id = uuidv4();
  
  const checkUser = users.find((user) => user.name === name)

  if(checkUser){
    return response.status(400).json({ error: "User already exists!" });
  }

  users.push({
    name,
    username,
    id,
    todos: []
  });

  return response.status(201).send();
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  
  return response.json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;

  const { title, deadline} = request.body;
  const id = uuidv4();
  user.todos.push({
    id, title, deadline, done: false, created_at: new Date()
  });

  return response.status(201).send();
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;
  const { title, deadline} = request.body;

  const todo = user.todos.find(todo => todo.id === id)

  if(!todo){
    return response.status(404).json({ error: "Todo not found" });
  }

  todo.title = title;
  todo.deadline = deadline;

  return response.json(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;
  const todo = user.todos.find(todo => todo.id === id)
  
  if(!todo){
    return response.status(404).json({ error: "Todo not found" });
  }

  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;
  const todoId = user.todos.findIndex(todo => todo.id === id)
  
  if(todoId === -1){
    return response.status(404).json({ error: "Todo not found" });
  }
  
  user.todos.splice(todoId, 1);
  
  return response.status(204).json();
});

module.exports = app;