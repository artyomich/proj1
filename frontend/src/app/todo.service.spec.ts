import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TodoService } from './todo.service';
import { Todo } from './models';
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

describe('TodoService', () => {
  let service: TodoService;
  let mockHttpClient: MockHttpClient;

  beforeEach(() => {
    mockHttpClient = createMockHttpClient();
    // @ts-expect-error - mocking for testing
    service = new TodoService(mockHttpClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTodos', () => {
    it('should return an array of todos', async () => {
      const mockTodos: Todo[] = [
        { id: 1, title: 'Test 1', completed: false },
        { id: 2, title: 'Test 2', completed: true }
      ];
      mockHttpClient.get.mockReturnValue(of(mockTodos));

      const result = await firstValueFrom(service.getTodos());

      expect(result.length).toBe(2);
      expect(result[0].title).toBe('Test 1');
      expect(mockHttpClient.get).toHaveBeenCalledWith('http://localhost:8000/api/todos');
    });
  });

  describe('getTodo', () => {
    it('should return a single todo by id', async () => {
      const mockTodo: Todo = { id: 1, title: 'Test', completed: false };
      mockHttpClient.get.mockReturnValue(of(mockTodo));

      const result = await firstValueFrom(service.getTodo(1));

      expect(result.id).toBe(1);
      expect(result.title).toBe('Test');
      expect(mockHttpClient.get).toHaveBeenCalledWith('http://localhost:8000/api/todos/1');
    });
  });

  describe('createTodo', () => {
    it('should create a new todo', async () => {
      const newTodo = { title: 'New Task', description: 'Desc', due_date: '2026-12-31', completed: false };
      const createdTodo = { id: 3, ...newTodo };
      mockHttpClient.post.mockReturnValue(of(createdTodo));

      const result = await firstValueFrom(service.createTodo(newTodo));

      expect(result.title).toBe('New Task');
      expect(result.id).toBe(3);
      expect(mockHttpClient.post).toHaveBeenCalledWith('http://localhost:8000/api/todos', newTodo);
    });
  });

  describe('updateTodo', () => {
    it('should update an existing todo', async () => {
      const updatedTodo: Todo = { id: 1, title: 'Updated', completed: true };
      mockHttpClient.put.mockReturnValue(of(updatedTodo));

      const result = await firstValueFrom(service.updateTodo(1, updatedTodo));

      expect(result.title).toBe('Updated');
      expect(result.completed).toBe(true);
      expect(mockHttpClient.put).toHaveBeenCalledWith('http://localhost:8000/api/todos/1', updatedTodo);
    });
  });

  describe('deleteTodo', () => {
    it('should delete a todo', async () => {
      const deleteResponse = { message: 'Todo deleted' };
      mockHttpClient.delete.mockReturnValue(of(deleteResponse));

      const result = await firstValueFrom(service.deleteTodo(1));

      expect(result).toEqual(deleteResponse);
      expect(mockHttpClient.delete).toHaveBeenCalledWith('http://localhost:8000/api/todos/1');
    });
  });

  describe('getOverdueTodos', () => {
    it('should return overdue todos', async () => {
      const overdueTodos: Todo[] = [
        { id: 1, title: 'Overdue', due_date: '2026-01-01', completed: false }
      ];
      mockHttpClient.get.mockReturnValue(of(overdueTodos));

      const result = await firstValueFrom(service.getOverdueTodos());

      expect(result.length).toBe(1);
      expect(result[0].due_date).toBe('2026-01-01');
      expect(mockHttpClient.get).toHaveBeenCalledWith('http://localhost:8000/api/todos/overdue');
    });
  });
});