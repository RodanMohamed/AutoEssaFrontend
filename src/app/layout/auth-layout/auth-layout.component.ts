import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  template: `
    <div class="auth-shell grid min-h-screen place-items-center p-4 sm:p-6">
      <section class="auth-card card w-full max-w-xl border shadow-xl">
        <div class="card-body p-6 sm:p-8">
          <p class="auth-eyebrow mb-1 text-center text-xs font-semibold uppercase tracking-[0.24em]">Premium Experience</p>
          <h1 class="mb-5 text-center font-serif text-3xl sm:text-4xl">Auto Essa</h1>
          <router-outlet />
        </div>
      </section>
    </div>
  `,
  styles: `
    .auth-shell {
      background:
        radial-gradient(circle at 15% 20%, rgba(227, 199, 173, 0.35), transparent 42%),
        radial-gradient(circle at 86% 82%, rgba(200, 166, 136, 0.25), transparent 46%),
        linear-gradient(145deg, #fbf3e8 0%, #f3e6d7 55%, #efe0ce 100%);
    }

    .auth-card {
      border-color: #d8c3a9;
      background: linear-gradient(180deg, #fffaf2 0%, #f8eedf 100%);
      box-shadow: 0 26px 70px rgba(85, 57, 28, 0.22);
      animation: auth-card-enter 560ms ease-out both;
    }

    .auth-eyebrow {
      color: #8a6039;
    }

    h1 {
      color: #5e3f24;
    }

    @keyframes auth-card-enter {
      from {
        opacity: 0;
        transform: translateY(14px) scale(0.985);
      }

      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthLayoutComponent {}
