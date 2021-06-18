import {
  RecoilRoot,
  atom,
useRecoilValue,
useRecoilState,
useSetRecoilState,
selector} from 'recoil'
import axios from 'axios'
import React, {useState} from 'react'

function App() {
  return (
    <RecoilRoot>
      <React.Suspense fallback={<hi>Cargando</hi>}>
        <UserData />
        <TodoFilter />
        <TodoStats />
        <ItemCreator />
        <TodoList />
      </React.Suspense>
      
    </RecoilRoot>
  );
}
let idUnico = 0
const todoListState = atom({
  key: 'TodoListState',
  default: []
})

const todoFilterState = atom({
  key: 'todoFilterState',
  default: 'all'
})

const todoFilterSelector = selector({
  key: 'todoFilterSelector',
  get: ({get}) => {
    const list = get(todoListState)
    const filter = get(todoFilterState)
    switch (filter) {
      case 'done':
        return list.filter(item => item.isCompleted)
      case 'notDone':
        return list.filter(item => !item.isCompleted)    
      default:
        return list
    }
  }
})

const todoStatsSelector = selector({
  key: 'todoStatsSelector',
  get: ({get}) => {
    const list = get(todoListState)
    const todo = list.filter(item => !item.isCompleted).length
    const notTodo = list.filter(item => item.isCompleted).length
    const completedPorcentage = list.length === 0 ? 0 : notTodo / list.length

    const data = {
      total: list.length,
      todo,
      notTodo,
      completedPorcentage
    }
    return data
  }
})

const userDataSelector = selector({
  key: "userDataSelector",
  get: async () => {
    const response = await axios.get("http://localhost:3001/users/1")

    return response.data
  }
})
  



function ItemCreator(){
  const [text, setText] = useState('')
  const setNewTodo = useSetRecoilState(todoListState)

  const onChangeText = (event) => {
    setText(event.target.value)
  }
  const onClick = () => {
    setNewTodo(oldTodoList => {
      return [...oldTodoList,
      {
        id: idUnico++, text, isCompleted: false
      }]
    })
    setText('')
  }  
  
  return (
    <div>
      <input value={text} onChange={onChangeText} />
      <button onClick={onClick}>Agregar</button>
    </div>
  )
}

/*
const todos = [
  { id: 1, text: "Todo 1", isCompleted: false},
  { id: 2, text: "Todo 2", isCompleted: false},
  { id: 3, text: "Todo 3", isCompleted: true},
]
*/

function TodoList() {
  const todos = useRecoilValue(todoFilterSelector)
 return(
  <div>
    {
      todos.map(item => <TodoItem key={item.id} {...item} />)
    }
  </div>)
}

function changeItem(id, todoList, changedItem) {
  const index = todoList.findIndex(item => item.id === id)

  return [...todoList.slice(0, index), changedItem, ...todoList.slice(index+1, todoList.length)]
}

function deleteItem(id, todoList) {
  const index = todoList.findIndex(item => item.id === id)

  return [...todoList.slice(0, index), ...todoList.slice(index+1, todoList.length)]
}

function TodoItem({id, text, isCompleted}) {
  const [todoList, setTodoList] = useRecoilState(todoListState)

  const onChangeTodoItem = (event) => {
    const textValue = event.target.value
    const changedItem = {
      id,
      text: textValue,
      isCompleted
    }
    setTodoList(changeItem(id, todoList, changedItem))
  }

  const onToggleCompleted = (event) => {
    const changedItem = {
      id,
      text,
      isCompleted : !isCompleted
    }
    setTodoList(changeItem(id, todoList, changedItem))
  }
  
  const onClickDelete = () => {
    setTodoList(deleteItem(id, todoList))
  }
  return (
    <div>
    <input value={text} onChange={onChangeTodoItem} />
    <input type="checkbox" checked={isCompleted} onChange={onToggleCompleted}/>
    <button onClick={onClickDelete}>x</button>
    </div>
  )
}   

function TodoFilter(){
  const [filterState, setFilterState] = useRecoilState(todoFilterState)

  const onSeletedItem = (event) => {
    const {value} = event.target
    setFilterState(value)
  }
  return(
    <div>
      Filtro:
      <select value={filterState} onChange={onSeletedItem}>
        <option value="all">Todos</option>
        <option value="done">Realizados</option>
        <option value="notDone">No Realizados</option>
      </select>
    </div>
  )
}

function TodoStats(){
  const {total, todo, notTodo, completedPorcentage} = useRecoilValue(todoStatsSelector)
  return(
    <div>
      <span>Tareas Totales {total} </span><br/>
      <span>Tareas por hacer {todo} </span><br/>
      <span>Tareas realizadas {notTodo} </span><br/>
      <span>Progreso: % {completedPorcentage*100} </span>
    </div>
  )
}

function UserData(){
  const user = useRecoilValue(userDataSelector)
  return(
    <h1>{user.name}</h1>
  )
}
export default App;
