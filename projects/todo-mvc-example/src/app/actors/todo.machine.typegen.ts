
  // This file was automatically generated. Edits will be overwritten

  export interface Typegen0 {
        '@@xstate/typegen': true;
        internalEvents: {
          "xstate.init": { type: "xstate.init" };
        };
        invokeSrcNameMap: {

        };
        missingImplementations: {
          actions: never;
          delays: never;
          guards: never;
          services: never;
        };
        eventsCausingActions: {
          "removeTodo": "todo.remove";
"setCompleted": "todo.setCompleted";
"toggleCompleted": "todo.toggle";
"updateTodoTitle": "edit.complete";
        };
        eventsCausingDelays: {

        };
        eventsCausingGuards: {

        };
        eventsCausingServices: {

        };
        matchesStates: "editing" | "reading";
        tags: never;
      }
