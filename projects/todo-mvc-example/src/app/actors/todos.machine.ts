import {
  ActorRefFrom,
  assign,
  createMachine,
  pure,
  raise,
  sendTo,
  spawn,
  stop,
} from 'xstate';

import { Filter, Todo } from '../models';

import { TodoMachine, todoMachine } from './todo.machine';

type TodoRefs = ActorRefFrom<TodoMachine>[];

export type TodosContext = {
  todoRefs: TodoRefs;
  filter: Filter;
};

export type TodosEvents =
  | { type: 'filter.change'; filter: Filter }
  | { type: 'todo.new'; title: string }
  | { type: 'todo.delete'; id: string }
  | { type: 'todo.patch'; id: string; patch: Partial<Omit<Todo, 'id'>> }
  | { type: 'todos.clearCompleted' }
  | { type: 'todos.delete'; ids: string[] }
  | { type: 'todos.setCompleted'; completed: boolean };
export const todosMachine = createMachine(
  {
    id: 'todos',
    predictableActionArguments: true,
    preserveActionOrder: true,
    schema: {
      context: {} as TodosContext,
      events: {} as TodosEvents,
      services: {} as {
        loadTodos: {
          data: Todo[];
        };
        update: {
          data: void;
        };
        insert: {
          data: Todo;
        };
      },
    },
    tsTypes: {} as import('./todos.machine.typegen').Typegen0,
    context: {
      todoRefs: [] as TodoRefs,
      filter: Filter.ALL,
    },
    invoke: {
      src: 'filter',
    },
    initial: 'loading',
    states: {
      loading: {
        invoke: {
          src: 'loadTodos',
          onDone: {
            actions: 'setTodos',
            target: 'idle',
          },
        },
      },
      idle: {
        on: {
          'todo.new': {
            cond: (_, event) => event.title.trim().length > 0,
            target: 'inserting',
          },
          'todo.delete': {
            target: 'updateing',
            actions: ['deleteTodo'],
          },
          'todo.patch': {
            target: 'updateing',
          },
          'todos.clearCompleted': {
            actions: 'clearCompletedTodos',
          },
          'todos.delete': {
            target: 'updateing',
            actions: ['deleteTodos'],
          },
          'todos.setCompleted': {
            actions: 'setTodoCompleted',
          },
          'filter.change': {
            actions: assign({ filter: (_, event) => event.filter }),
          },
        },
      },
      updateing: {
        invoke: {
          src: 'update',
          onDone: 'idle',
        },
      },
      inserting: {
        invoke: {
          src: 'insert',
          onDone: {
            target: 'idle',
            actions: 'createTodo',
          },
        },
      },
    },
  },
  {
    actions: {
      setTodos: assign({
        todoRefs: (_, event) => event.data.map(spawnTodo),
      }),
      createTodo: assign({
        todoRefs: (context, event) => {
          return [...context.todoRefs, spawnTodo(event.data)];
        },
      }),
      clearCompletedTodos: pure(context => {
        const ids = context.todoRefs
          .map(ref => ref.getSnapshot()!.context.todo)
          .filter(todo => todo.completed)
          .map(todo => todo.id);

        return [raise({ type: 'todos.delete', ids })];
      }),
      deleteTodo: pure((context, event) => {
        const machineId = getTodoMachineId(event.id);
        return [
          assign({
            todoRefs: context.todoRefs.filter(ref => ref.id !== machineId),
          }),
          stop(machineId),
        ];
      }),
      deleteTodos: pure((context, event) => {
        const deletedIds = event.ids.map(getTodoMachineId);
        return [
          assign({
            todoRefs: context.todoRefs.filter(
              ref => !deletedIds.includes(ref.id)
            ),
          }),
          ...deletedIds.map(stop),
        ];
      }),
      setTodoCompleted: pure((context, event) =>
        context.todoRefs.map(ref =>
          sendTo(ref, {
            type: 'todo.setCompleted',
            completed: event.completed,
          })
        )
      ),
    },
  }
);

function spawnTodo(todo: Todo) {
  return spawn(
    todoMachine.withContext({
      todo: todo,
      newTitle: '',
    }),
    getTodoMachineId(todo.id)
  );
}

function getTodoMachineId(todoId: string) {
  return `todo-${todoId}`;
}

export type TodosMachine = typeof todosMachine;
