import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
	selector: 'app-stats-card',
	template: `
		<article class="card border border-base-300 bg-base-100 shadow">
			<div class="card-body">
				<p class="text-sm text-base-content/70">{{ label() }}</p>
				<p class="text-3xl font-semibold text-primary">{{ value() }}</p>
			</div>
		</article>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatsCardComponent {
	label = input.required<string>();
	value = input.required<number>();
}

