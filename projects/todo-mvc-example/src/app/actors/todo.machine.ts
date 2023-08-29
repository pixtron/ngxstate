import { assign, createMachine, pure, sendParent } from 'xstate';

import { Todo } from '../models';

export type TodoContext = {
  newTitle: string;
  todo: Todo;
};

export type TodoEvents =
  | { type: 'todo.remove' }
  | { type: 'todo.toggle' }
  | { type: 'todo.setCompleted'; completed: boolean }
  | { type: 'edit.start' }
  | { type: 'edit.cancel' }
  | { type: 'edit.change'; title: string }
  | { type: 'edit.complete' };

export const todoMachine = createMachine(
  {
    id: 'todo',
    predictableActionArguments: true,
    preserveActionOrder: true,
    initial: 'reading',
    schema: {
      context: {} as TodoContext,
      events: {} as TodoEvents,
    },
    tsTypes: {} as import('./todo.machine.typegen').Typegen0,
    states: {
      reading: {
        entry: assign({ newTitle: '' }),
        on: {
          'todo.setCompleted': {
            actions: 'setCompleted',
          },
          'todo.remove': {
            actions: 'removeTodo',
          },
          'todo.toggle': {
            actions: 'toggleCompleted',
          },
          'edit.start': 'editing',
        },
      },
      editing: {
        entry: assign({ newTitle: context => context.todo.title }),
        on: {
          'edit.cancel': 'reading',
          'edit.change': {
            actions: assign({ newTitle: (_, event) => event.title }),
          },
          'edit.complete': {
            target: 'reading',
            actions: 'updateTodoTitle',
          },
        },
      },
    },
  },
  {
    actions: {
      updateTodoTitle: pure(context => {
        const newTitle = context.newTitle.trim();

        if (newTitle.length === 0) {
          return [sendParent({ type: 'todo.delete', id: context.todo.id })];
        } else if (newTitle !== context.todo.title) {
          const id = context.todo.id;
          const patch = { title: newTitle };

          return [
            assign({
              todo: context => ({
                ...context.todo,
                ...patch,
              }),
            }),
            sendParent({ type: 'todo.patch', id, patch }),
          ];
        }

        return [];
      }),
      removeTodo: sendParent(context => ({
        type: 'todo.delete',
        id: context.todo.id,
      })),
      setCompleted: pure((context, event) => {
        if (context.todo.completed !== event.completed) {
          const patch = { completed: event.completed };
          return [
            assign({
              todo: {
                ...context.todo,
                ...patch,
              },
            }),
            sendParent({
              type: 'todo.patch',
              id: context.todo.id,
              patch,
            }),
          ];
        } else {
          return [];
        }
      }),
      toggleCompleted: pure(context => {
        const id = context.todo.id;
        const patch = { completed: !context.todo.completed };
        return [
          assign({
            todo: {
              ...context.todo,
              ...patch,
            },
          }),
          sendParent({ type: 'todo.patch', id, patch }),
        ];
      }),
    },
  }
);

export type TodoMachine = typeof todoMachine;
