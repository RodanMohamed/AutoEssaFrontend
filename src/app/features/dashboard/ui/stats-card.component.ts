import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
	selector: 'app-stats-card',
	template: `
		<article class="stats-card card border border-base-300 bg-base-100 shadow">
			<div class="card-body">
				<p class="text-sm text-base-content/70">{{ label() }}</p>
				<p class="text-3xl font-semibold text-primary">{{ value() }}</p>
			</div>
		</article>
	`,
	styles: `
		.stats-card {
			position: relative;
			overflow: hidden;
		}

		.stats-card::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 4px;
			background: linear-gradient(90deg, #c89261 0%, #ae7545 100%);
		}
	`,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatsCardComponent {
	label = input.required<string>();
	value = input.required<number>();
}

