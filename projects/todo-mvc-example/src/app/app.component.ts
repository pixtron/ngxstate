import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
    <footer class="info">
      <p>Double-click to edit a todo</p>
      <p>
        Created by
        <a href="https://github.com/pixtron">Stefan Aebischer</a> using
        <a href="https://github.com/statelyai/xstate">XState</a> and
        <a href="https://github.com/angular/angular">Angular</a>
      </p>
      <p>Part of <a href="https://todomvc.com/">TodoMVC</a></p>
    </footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
