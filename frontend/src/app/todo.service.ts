import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Todo } from './models';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(`${this.apiUrl}/todos`);
  }

  getTodo(id: number): Observable<Todo> {
    return this.http.get<Todo>(`${this.apiUrl}/todos/${id}`);
  }

  createTodo(todo: Omit<Todo, 'id'>): Observable<Todo> {
    return this.http.post<Todo>(`${this.apiUrl}/todos`, todo);
  }

  updateTodo(id: number, todo: Todo): Observable<Todo> {
    return this.http.put<Todo>(`${this.apiUrl}/todos/${id}`, todo);
  }

  deleteTodo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/todos/${id}`);
  }

  getOverdueTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(`${this.apiUrl}/todos/overdue`);
  }

  getTodosByDate(date: string): Observable<Todo[]> {
    return this.getTodos().pipe(
      map(todos => todos.filter(t => t.due_date === date))
    );
  }

  getCompletedCount(): Observable<number> {
    return this.getTodos().pipe(
      map(todos => todos.filter(t => t.completed).length)
    );
  }

  getTotalCount(): Observable<number> {
    return this.getTodos().pipe(
      map(todos => todos.length)
    );
  }
}