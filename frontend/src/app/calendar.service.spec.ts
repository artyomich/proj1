import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CalendarService } from './calendar.service';
import { CalendarEvent } from './models';
import { firstValueFrom, of } from 'rxjs';

// Mock HttpClient
class MockHttpClient {
  get = vi.fn();
  post = vi.fn();
  put = vi.fn();
  delete = vi.fn();
}

function createMockHttpClient(): MockHttpClient {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  };
}

describe('CalendarService', () => {
  let service: CalendarService;
  let mockHttpClient: MockHttpClient;

  beforeEach(() => {
    mockHttpClient = createMockHttpClient();
    // @ts-expect-error - mocking for testing
    service = new CalendarService(mockHttpClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getEvents', () => {
    it('should return an array of calendar events', async () => {
      const mockEvents: CalendarEvent[] = [
        { id: 1, title: 'Meeting', date: '2026-06-23', start_time: '09:00', end_time: '10:00' },
        { id: 2, title: 'Lunch', date: '2026-06-23', start_time: '12:00', end_time: '13:00' }
      ];
      mockHttpClient.get.mockReturnValue(of(mockEvents));

      const result = await firstValueFrom(service.getEvents());

      expect(result.length).toBe(2);
      expect(result[0].title).toBe('Meeting');
      expect(mockHttpClient.get).toHaveBeenCalledWith('http://localhost:8000/api/calendar/events');
    });
  });

  describe('getEventByDate', () => {
    it('should return an event for a specific date', async () => {
      const mockEvent: CalendarEvent = {
        id: 1, title: 'Meeting', date: '2026-06-23', start_time: '09:00', end_time: '10:00'
      };
      mockHttpClient.get.mockReturnValue(of(mockEvent));

      const result = await firstValueFrom(service.getEventByDate('2026-06-23'));

      expect(result).toBeTruthy();
      expect(result?.title).toBe('Meeting');
      expect(mockHttpClient.get).toHaveBeenCalledWith('http://localhost:8000/api/calendar/2026-06-23');
    });

    it('should return null when event not found', async () => {
      mockHttpClient.get.mockReturnValue(of(null));

      const result = await firstValueFrom(service.getEventByDate('2026-12-31'));

      expect(result).toBeNull();
      expect(mockHttpClient.get).toHaveBeenCalledWith('http://localhost:8000/api/calendar/2026-12-31');
    });
  });

  describe('createEvent', () => {
    it('should create a new calendar event', async () => {
      const newEvent = { title: 'New Event', date: '2026-07-01', start_time: '14:00', end_time: '15:00' };
      const createdEvent = { id: 3, ...newEvent };
      mockHttpClient.post.mockReturnValue(of(createdEvent));

      const result = await firstValueFrom(service.createEvent(newEvent));

      expect(result.title).toBe('New Event');
      expect(result.id).toBe(3);
      expect(mockHttpClient.post).toHaveBeenCalledWith('http://localhost:8000/api/calendar', newEvent);
    });
  });

  describe('updateEvent', () => {
    it('should update an existing event', async () => {
      const updatedEvent: CalendarEvent = {
        id: 1, title: 'Updated Event', date: '2026-06-23', start_time: '10:00', end_time: '11:00'
      };
      mockHttpClient.put.mockReturnValue(of(updatedEvent));

      const result = await firstValueFrom(service.updateEvent('2026-06-23', updatedEvent));

      expect(result.title).toBe('Updated Event');
      expect(result.date).toBe('2026-06-23');
      expect(mockHttpClient.put).toHaveBeenCalledWith('http://localhost:8000/api/calendar/2026-06-23', updatedEvent);
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event', async () => {
      const deleteResponse = { message: 'Event deleted' };
      mockHttpClient.delete.mockReturnValue(of(deleteResponse));

      const result = await firstValueFrom(service.deleteEvent('2026-06-23'));

      expect(result).toEqual(deleteResponse);
      expect(mockHttpClient.delete).toHaveBeenCalledWith('http://localhost:8000/api/calendar/2026-06-23');
    });
  });
});