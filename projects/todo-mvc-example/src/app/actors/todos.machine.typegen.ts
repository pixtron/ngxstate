
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "done.invoke.todos.inserting:invocation[0]": { type: "done.invoke.todos.inserting:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"done.invoke.todos.loading:invocation[0]": { type: "done.invoke.todos.loading:invocation[0]"; data: unknown; __tip: "See the XState TS docs to learn how to strongly type this." };
"xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {
          "filter": "done.invoke.todos:invocation[0]";
"insert": "done.invoke.todos.inserting:invocation[0]";
"loadTodos": "done.invoke.todos.loading:invocation[0]";
"update": "done.invoke.todos.updateing:invocation[0]";
        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: "filter" | "insert" | "loadTodos" | "update";
        };
        eventsCausingActions: {
          "clearCompletedTodos": "todos.clearCompleted";
"createTodo": "done.invoke.todos.inserting:invocation[0]";
"deleteTodo": "todo.delete";
"deleteTodos": "todos.delete";
"setTodoCompleted": "todos.setCompleted";
"setTodos": "done.invoke.todos.loading:invocation[0]";
        };
        eventsCausingDelays: {

        };
        eventsCausingGuards: {

        };
        eventsCausingServices: {
          "filter": "xstate.init";
"insert": "todo.new";
"loadTodos": "xstate.init";
"update": "todo.delete" | "todo.patch" | "todos.delete";
        };
        matchesStates: "idle" | "inserting" | "loading" | "updateing";
        tags: never;
      }
