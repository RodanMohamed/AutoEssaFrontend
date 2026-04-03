import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-about-page',
  template: `
    <section class="space-y-6">
      <h1 class="font-serif text-4xl">About Auto Essa</h1>
      <article class="card border border-base-300 bg-base-100 shadow">
        <div class="card-body space-y-4">
          <p>
            Auto Essa was built to simplify how customers in Egypt rent or buy cars. We focus on trust,
            transparent information, and fast communication.
          </p>
          <p>
            Our mission is to convert browsing into confident decisions through clear specs, honest pricing,
            and responsive support.
          </p>
        </div>
      </article>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class AboutPage {}
