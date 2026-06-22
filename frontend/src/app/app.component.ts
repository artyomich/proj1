import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from './todo.service';
import { CalendarService } from './calendar.service';
import { Todo, CalendarEvent } from './models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Todo List with Calendar';
  
  // Todo state
  todos: Todo[] = [];
  newTodo: Partial<Todo> = { title: '', description: '', due_date: '', completed: false };
  editingTodo: Todo | null = null;
  filter: 'all' | 'active' | 'completed' | 'overdue' = 'all';
  
  // Calendar state
  currentMonth: Date = new Date();
  selectedDate: string | null = null;
  calendarEvents: CalendarEvent[] = [];
  newEvent: Partial<CalendarEvent> = { title: '', description: '', date: '', start_time: '09:00', end_time: '10:00' };
  editingEvent: CalendarEvent | null = null;
  
  // UI state
  showEventForm: boolean = false;
  isLoading: boolean = false;
  error: string | null = null;
  
  // Today's date string for overdue detection
  todayStr: string = new Date().toISOString().split('T')[0];

  private todoService = inject(TodoService);
  private calendarService = inject(CalendarService);

  ngOnInit() {
    this.loadTodos();
    this.loadCalendarEvents();
  }

  // ==================== Todo Methods ====================
  
  loadTodos() {
    this.isLoading = true;
    this.error = null;
    this.todoService.getTodos().subscribe({
      next: (data) => { this.todos = data; this.isLoading = false; },
      error: (err) => { this.error = 'Ошибка загрузки задач'; this.isLoading = false; }
    });
  }

  loadOverdueTodos() {
    this.isLoading = true;
    this.todoService.getOverdueTodos().subscribe({
      next: (data) => {
        this.todos = data;
        this.filter = 'overdue';
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  addTodo() {
    if (!this.newTodo.title?.trim()) return;
    const todoData: Omit<Todo, 'id'> = {
      title: this.newTodo.title.trim(),
      description: this.newTodo.description,
      due_date: this.newTodo.due_date,
      completed: this.newTodo.completed || false
    };
    this.todoService.createTodo(todoData).subscribe({
      next: (todo) => {
        this.todos.push(todo);
        this.newTodo = { title: '', description: '', due_date: '', completed: false };
      },
      error: () => { this.error = 'Ошибка создания задачи'; }
    });
  }

  updateTodo(todo: Todo) {
    if (!todo.id) return;
    this.todoService.updateTodo(todo.id, todo).subscribe({
      next: () => {
        const idx = this.todos.findIndex(t => t.id === todo.id);
        if (idx !== -1) this.todos[idx] = todo;
        this.editingTodo = null;
      },
      error: () => { this.error = 'Ошибка обновления задачи'; }
    });
  }

  deleteTodo(id: number) {
    this.todoService.deleteTodo(id).subscribe({
      next: () => { this.todos = this.todos.filter(t => t.id !== id); },
      error: () => { this.error = 'Ошибка удаления задачи'; }
    });
  }

  toggleComplete(todo: Todo) {
    todo.completed = !todo.completed;
    this.updateTodo(todo);
  }

  getFilteredTodos(): Todo[] {
    switch (this.filter) {
      case 'active': return this.todos.filter(t => !t.completed);
      case 'completed': return this.todos.filter(t => t.completed);
      case 'overdue': return this.todos.filter(t => !t.completed && t.due_date && t.due_date < new Date().toISOString().split('T')[0]);
      default: return this.todos;
    }
  }

  getCompletedCount(): number {
    return this.todos.filter(t => t.completed).length;
  }

  getTotalCount(): number {
    return this.todos.length;
  }

  startEditTodo(todo: Todo) {
    this.editingTodo = { ...todo };
  }

  cancelEditTodo() {
    this.editingTodo = null;
  }

  // ==================== Calendar Methods ====================
  
  loadCalendarEvents() {
    this.calendarService.getEvents().subscribe({
      next: (events) => { this.calendarEvents = events; },
      error: () => {}
    });
  }

  getDaysInMonth(year: number, month: number): Date[] {
    const date = new Date(year, month, 1);
    const days: Date[] = [];
    const firstDay = date.getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    
    for (let i = -startOffset; i < 42; i++) {
      const d = new Date(date);
      d.setDate(date.getDate() + i);
      days.push(d);
    }
    return days;
  }

  getEventsForDate(dateStr: string): { events: CalendarEvent[], todos: Todo[] } {
    const events = (this.calendarEvents || []).filter(e => e.date === dateStr);
    const todos = (this.todos || []).filter(t => t.due_date === dateStr);
    return { events, todos };
  }

  isSelectedDate(dateStr: string): boolean {
    return this.selectedDate === dateStr;
  }

  selectDate(dateStr: string) {
    this.selectedDate = dateStr;
    this.showEventForm = true;
  }

  addEvent() {
    if (!this.newEvent.title?.trim() || !this.newEvent.date) return;
    const eventData: Omit<CalendarEvent, 'id'> = {
      title: this.newEvent.title.trim(),
      description: this.newEvent.description,
      date: this.newEvent.date,
      start_time: this.newEvent.start_time || '09:00',
      end_time: this.newEvent.end_time || '10:00'
    };
    this.calendarService.createEvent(eventData).subscribe({
      next: (event) => {
        this.calendarEvents.push(event);
        this.newEvent = { title: '', description: '', date: this.selectedDate || '', start_time: '09:00', end_time: '10:00' };
        this.showEventForm = false;
      },
      error: () => { this.error = 'Ошибка создания события'; }
    });
  }

  deleteEvent(date: string) {
    this.calendarService.deleteEvent(date).subscribe({
      next: () => {
        this.calendarEvents = this.calendarEvents.filter(e => e.date !== date);
        if (this.selectedDate === date) {
          this.selectedDate = null;
          this.showEventForm = false;
        }
      },
      error: () => { this.error = 'Ошибка удаления события'; }
    });
  }

  prevMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
  }

  nextMonth() {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
  }

  getMonthName(): string {
    const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    return months[this.currentMonth.getMonth()];
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  // ==================== Utility ====================
  
  clearError() {
    this.error = null;
  }
}