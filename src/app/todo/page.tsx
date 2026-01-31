'use client';
import React, { useState } from 'react';
import './todo.css';

const page = () => {
    const [todos, setTodos] = useState([]);
    const [nextId, setNextId] = useState(1);
    const [showForm, setShowForm] = useState(false);

    const aufgabenArten = ['Hausaufgabe', 'Projekt', 'Test', 'Besprechung'];

    // State für neues Todo
    const [newTodo, setNewTodo] = useState({
        aufgabe: 'Hausaufgabe',
        punkte: '',
        notizen: '',
        erledigt: false,
        vonWem: '',
        vonWann: '',
        bisWann: ''
    });

    const handleAddTodo = () => {
        const todoToAdd = {
            todoID: nextId,
            erstelltAm: new Date().toISOString().split('T')[0],
            ...newTodo
        };
        setTodos([...todos, todoToAdd]);
        setNextId(nextId + 1);
        setShowForm(false);
        // Reset Formular
        setNewTodo({
            aufgabe: 'Hausaufgabe',
            punkte: '',
            notizen: '',
            erledigt: false,
            vonWem: '',
            vonWann: '',
            bisWann: ''
        });
    };

    return (
        <div className="todo-container">
            <table>
                <thead>
                <tr>
                    <th>todoID</th>
                    <th>Aufgabe</th>
                    <th>Punkte</th>
                    <th>Notizen</th>
                    <th>Erledigt</th>
                    <th>Von wem</th>
                    <th>Von wann</th>
                    <th>Bis wann</th>
                    <th>Erstellt am</th>
                </tr>
                </thead>
                <tbody>
                {todos.map((todo) => (
                    <tr key={todo.todoID}>
                        <td>{todo.todoID}</td>
                        <td>{todo.aufgabe}</td>
                        <td>{todo.punkte}</td>
                        <td>{todo.notizen}</td>
                        <td><input type="checkbox" checked={todo.erledigt} readOnly /></td>
                        <td>{todo.vonWem}</td>
                        <td>{todo.vonWann}</td>
                        <td>{todo.bisWann}</td>
                        <td>{todo.erstelltAm}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <div className="new-todo-container">
                {!showForm && (
                    <button className="new-todo" onClick={() => setShowForm(true)}>
                        Neue Aufgabe
                    </button>
                )}

                {showForm && (
                    <div className="new-todo-form">
                        <select
                            value={newTodo.aufgabe}
                            onChange={(e) => setNewTodo({...newTodo, aufgabe: e.target.value})}
                        >
                            {aufgabenArten.map((art) => (
                                <option key={art} value={art}>{art}</option>
                            ))}
                        </select>

                        <input
                            type="number"
                            placeholder="Punkte"
                            value={newTodo.punkte}
                            onChange={(e) => setNewTodo({...newTodo, punkte: e.target.value})}
                        />
                        <input
                            type="text"
                            placeholder="Notizen"
                            value={newTodo.notizen}
                            onChange={(e) => setNewTodo({...newTodo, notizen: e.target.value})}
                        />
                        <input
                            type="text"
                            placeholder="Von wem"
                            value={newTodo.vonWem}
                            onChange={(e) => setNewTodo({...newTodo, vonWem: e.target.value})}
                        />
                        <input
                            type="date"
                            placeholder="Von wann"
                            value={newTodo.vonWann}
                            onChange={(e) => setNewTodo({...newTodo, vonWann: e.target.value})}
                        />
                        <input
                            type="date"
                            placeholder="Bis wann"
                            value={newTodo.bisWann}
                            onChange={(e) => setNewTodo({...newTodo, bisWann: e.target.value})}
                        />
                        <label>
                            Erledigt:
                            <input
                                type="checkbox"
                                checked={newTodo.erledigt}
                                onChange={(e) => setNewTodo({...newTodo, erledigt: e.target.checked})}
                            />
                        </label>

                        <button onClick={handleAddTodo}>Hinzufügen</button>
                        <button onClick={() => setShowForm(false)}>Abbrechen</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default page;
