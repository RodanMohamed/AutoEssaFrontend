import { Injectable, signal } from '@angular/core';

export interface BranchLocation {
  id: string;
  name: string;
  address: string;
  mapsUrl: string;
  isActive: boolean;
}

const BRANCH_STORAGE_KEY = 'autoessa.branches';

@Injectable({ providedIn: 'root' })
export class BranchLocationsService {
  readonly branches = signal<BranchLocation[]>(this.readBranches());

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event: StorageEvent) => {
        if (event.key === BRANCH_STORAGE_KEY) {
          this.branches.set(this.readBranches());
        }
      });
    }
  }

  saveBranch(payload: Omit<BranchLocation, 'isActive'>, isActive?: boolean) {
    const current = this.branches();
    const exists = current.some((item) => item.id === payload.id);

    const updated = exists
      ? current.map((item) => {
          if (item.id !== payload.id) {
            return isActive ? { ...item, isActive: false } : item;
          }

          return {
            ...item,
            ...payload,
            isActive: typeof isActive === 'boolean' ? isActive : item.isActive
          };
        })
      : [
          ...current.map((item) => ({
            ...item,
            isActive: isActive ? false : item.isActive
          })),
          {
            ...payload,
            isActive: !!isActive
          }
        ];

    this.setBranches(this.ensureOneActive(updated));
  }

  setActiveBranch(id: string) {
    const updated = this.branches().map((item) => ({
      ...item,
      isActive: item.id === id
    }));

    this.setBranches(this.ensureOneActive(updated));
  }

  deleteBranch(id: string): boolean {
    const current = this.branches();
    if (current.length <= 1) {
      return false;
    }

    const exists = current.some((item) => item.id === id);
    if (!exists) {
      return false;
    }

    const remaining = current.filter((item) => item.id !== id);
    this.setBranches(this.ensureOneActive(remaining));
    return true;
  }

  getActiveBranch(): BranchLocation {
    const active = this.branches().find((item) => item.isActive);
    return active ?? this.defaultBranches()[0];
  }

  private setBranches(value: BranchLocation[]) {
    this.branches.set(value);
    localStorage.setItem(BRANCH_STORAGE_KEY, JSON.stringify(value));
  }

  private ensureOneActive(items: BranchLocation[]): BranchLocation[] {
    if (items.some((item) => item.isActive)) {
      return items;
    }

    if (items.length === 0) {
      return this.defaultBranches();
    }

    return items.map((item, index) => ({
      ...item,
      isActive: index === 0
    }));
  }

  private readBranches(): BranchLocation[] {
    const raw = localStorage.getItem(BRANCH_STORAGE_KEY);
    if (!raw) {
      return this.defaultBranches();
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        return this.defaultBranches();
      }

      const mapped = parsed
        .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
        .map((item, index) => ({
          id: typeof item['id'] === 'string' ? item['id'] : `branch-${index + 1}`,
          name: typeof item['name'] === 'string' ? item['name'] : `Branch ${index + 1}`,
          address: typeof item['address'] === 'string' ? item['address'] : 'Cairo, Egypt',
          mapsUrl:
            typeof item['mapsUrl'] === 'string'
              ? item['mapsUrl']
              : 'https://www.google.com/maps?q=Cairo&output=embed',
          isActive: typeof item['isActive'] === 'boolean' ? item['isActive'] : index === 0
        }));

      return this.ensureOneActive(mapped.length > 0 ? mapped : this.defaultBranches());
    } catch {
      return this.defaultBranches();
    }
  }

  private defaultBranches(): BranchLocation[] {
    return [
      {
        id: 'branch-1',
        name: 'Nasr City Branch',
        address: 'Nasr City, Cairo, Egypt',
        mapsUrl: 'https://www.google.com/maps?q=Nasr+City+Cairo&output=embed',
        isActive: true
      },
      {
        id: 'branch-2',
        name: 'Maadi Branch',
        address: 'Maadi, Cairo, Egypt',
        mapsUrl: 'https://www.google.com/maps?q=Maadi+Cairo&output=embed',
        isActive: false
      },
      {
        id: 'branch-3',
        name: 'Alexandria Branch',
        address: 'Smouha, Alexandria, Egypt',
        mapsUrl: 'https://www.google.com/maps?q=Smouha+Alexandria&output=embed',
        isActive: false
      }
    ];
  }
}
