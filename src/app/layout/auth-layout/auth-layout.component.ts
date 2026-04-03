import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  template: `
    <div class="grid min-h-screen place-items-center bg-base-200 p-4">
      <section class="card w-full max-w-md border border-base-300 bg-base-100 shadow-xl">
        <div class="card-body">
          <h1 class="mb-2 text-center font-serif text-3xl text-primary">Auto Essa</h1>
          <router-outlet />
        </div>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthLayoutComponent {}
