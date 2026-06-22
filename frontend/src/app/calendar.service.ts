import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CalendarEvent } from './models';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api';

  getEvents(): Observable<CalendarEvent[]> {
    return this.http.get<CalendarEvent[]>(`${this.apiUrl}/calendar/events`);
  }

  getEventByDate(date: string): Observable<CalendarEvent | null> {
    return this.http.get<CalendarEvent | null>(`${this.apiUrl}/calendar/${date}`);
  }

  createEvent(event: Omit<CalendarEvent, 'id'>): Observable<CalendarEvent> {
    return this.http.post<CalendarEvent>(`${this.apiUrl}/calendar`, event);
  }

  updateEvent(date: string, event: CalendarEvent): Observable<CalendarEvent> {
    return this.http.put<CalendarEvent>(`${this.apiUrl}/calendar/${date}`, event);
  }

  deleteEvent(date: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/calendar/${date}`);
  }
}