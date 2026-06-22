export interface Todo {
  id?: number;
  title: string;
  description?: string;
  due_date?: string;
  completed: boolean;
  size?: number;
}

export interface CalendarEvent {
  id?: number;
  title: string;
  description?: string;
  date: string;
  start_time: string;
  end_time: string;
  size?: number;
}

export interface CalendarDay {
  date: string;
  events: CalendarEvent[];
  todos: Todo[];
}