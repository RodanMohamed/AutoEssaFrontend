import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-hero-section',
  template: `
    <section class="hero min-h-[40vh] rounded-3xl bg-gradient-to-br from-primary to-secondary text-primary-content">
      <div class="hero-content text-center">
        <div class="max-w-3xl">
          <h1 class="font-serif text-4xl leading-tight md:text-5xl">{{ title() }}</h1>
          <p class="py-4 text-base-content/90">{{ subtitle() }}</p>
          <a href="#featured" class="btn btn-accent">Browse Featured Cars</a>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroSectionComponent {
  title = input.required<string>();
  subtitle = input.required<string>();
}
