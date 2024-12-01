import { useState, useEffect } from 'react'
import { CheckSquare, Square, Trash, Plus } from 'lucide-react'

interface Todo {
  id: string
  text: string
  completed: boolean
}

const TodoList = () => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')

  useEffect(() => {
    const storedTodos = localStorage.getItem('todos')
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos))
    }
  }, [])

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.trim()) return

    const todo: Todo = {
      id: Date.now().toString(),
      text: newTodo,
      completed: false
    }

    const updatedTodos = [...todos, todo]
    setTodos(updatedTodos)
    localStorage.setItem('todos', JSON.stringify(updatedTodos))
    setNewTodo('')
  }

  const toggleTodo = (id: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
    setTodos(updatedTodos)
    localStorage.setItem('todos', JSON.stringify(updatedTodos))
  }

  const deleteTodo = (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id)
    setTodos(updatedTodos)
    localStorage.setItem('todos', JSON.stringify(updatedTodos))
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Notlarım</h2>
      
      <form onSubmit={addTodo} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Yeni not ekle..."
            className="flex-1 border rounded-lg px-3 py-2"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
          </button>
        </div>
      </form>

      <div className="space-y-2">
        {todos.map(todo => (
          <div
            key={todo.id}
            className="flex items-center justify-between gap-2 p-2 hover:bg-gray-50 rounded-lg group"
          >
            <div className="flex items-center gap-2 flex-1">
              <button
                onClick={() => toggleTodo(todo.id)}
                className="text-gray-500 hover:text-blue-600"
              >
                {todo.completed ? (
                  <CheckSquare className="h-5 w-5 text-blue-600" />
                ) : (
                  <Square className="h-5 w-5" />
                )}
              </button>
              <span className={`flex-1 ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                {todo.text}
              </span>
            </div>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TodoList