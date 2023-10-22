import { HiOutlinePencilAlt, HiOutlineTrash, HiCheck } from 'react-icons/hi';

import { db } from './firebase/config.js';
import {
  query,
  collection,
  addDoc,
  // getDocs,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from 'firebase/firestore';

import { useEffect, useState } from 'react';

function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState('');
  const [todoId, setTodoId] = useState(''); // to edit todo
  const [isEditing, setIsEditing] = useState(false); // to edit todo
  const [isCompleted, setIsCompleted] = useState(false);

  // read todos from firebase
  useEffect(() => {
    ///////////// FROM DOCS - works on db but not UI
    // const getAllTodos = async () => {
    //   const querySnapshot = await getDocs(collection(db, 'todos'));
    //   let todosArr = [];
    //   querySnapshot.forEach((doc) => {
    //     // console.log(`${doc.id} => ${doc.data()}`);
    //     todosArr.push({ ...doc.data(), id: doc.id });
    //   });
    //   console.log(todosArr);
    //   setTodos(todosArr);
    // };
    // getAllTodos();

    /////////////
    const q = query(collection(db, 'todos'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let todosArr = [];
      querySnapshot.forEach((doc) => {
        todosArr.push({ ...doc.data(), id: doc.id });
      });
      console.log(todosArr);
      setTodos(todosArr);
    });
    return () => unsubscribe;
  }, []);

  // create todo on firebase
  const createTodo = async (e) => {
    e.preventDefault();
    if (!task) return;
    await addDoc(collection(db, 'todos'), {
      task: task,
      completed: false,
    });
    setTask('');
  };

  // update todo on firebase: toggle complete
  const handleToggleComplete = async (todo) => {
    await updateDoc(doc(db, 'todos', todo.id), {
      completed: !isCompleted,
    });
    setIsCompleted((isCompleted) => !isCompleted);
  };

  // update todo: UI: change btn from 'add' to 'save' and fill input field with task to edit
  const handleEdit = async (todo) => {
    setTodoId(todo.id); // to be able to edit it on firebase
    // UI
    setIsEditing(true);
    setTask(todo.task);
  };

  // on firebase: edit todo
  const editTodo = async () => {
    await updateDoc(doc(db, 'todos', todoId), {
      task: task,
    });
    // reset UI
    setIsEditing(false);
    setTask('');
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'todos', id));
  };

  return (
    <main className='app'>
      <h1>MERN todo list</h1>
      <div className='form-input'>
        <input
          type='text'
          placeholder='Add a todo...'
          value={task}
          onChange={(e) => setTask(e.target.value)}
          autoFocus
        />
        <button onClick={isEditing ? editTodo : createTodo}>
          {isEditing ? 'Save changes' : 'Add'}
        </button>
      </div>
      {todos.length < 1 ? null : (
        <p>
          {todos.length === 1
            ? `${todos.length} todo:`
            : `${todos.length} todos:`}
        </p>
      )}

      <ul className='todo-list'>
        {todos.map((todo) => (
          <li
            className={`todo-item ${
              todo.completed ? 'completed' : 'not-completed'
            }`}
            key={todo.id}
          >
            <div className='text'>{todo.task}</div>
            <div className='icons'>
              <HiCheck
                className='icon green'
                onClick={() => handleToggleComplete(todo)}
              />
              <HiOutlinePencilAlt
                className='icon'
                onClick={() => handleEdit(todo)}
              />
              <HiOutlineTrash
                className='icon red'
                onClick={() => handleDelete(todo.id)}
              />
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
