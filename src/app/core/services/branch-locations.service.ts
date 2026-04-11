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

  syncActiveBranchDetails(address: string, mapsUrl: string) {
    const normalizedAddress = address.trim();
    const normalizedMapsUrl = mapsUrl.trim();
    if (!normalizedAddress || !normalizedMapsUrl) {
      return;
    }

    const active = this.getActiveBranch();
    const updated = this.branches().map((item) =>
      item.id === active.id
        ? {
            ...item,
            address: normalizedAddress,
            mapsUrl: normalizedMapsUrl,
            isActive: true
          }
        : item
    );

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

      const normalized = this.normalizePublicBranches(mapped);
      return this.ensureOneActive(normalized.length > 0 ? normalized : this.defaultBranches());
    } catch {
      return this.defaultBranches();
    }
  }

  private normalizePublicBranches(items: BranchLocation[]): BranchLocation[] {
    const defaults = this.defaultBranches();

    return defaults.map((fallback, index) => {
      const found = items.find(
        (item) => item.id === fallback.id || item.name.trim().toLowerCase() === fallback.name.trim().toLowerCase()
      );

      if (!found) {
        return {
          ...fallback,
          isActive: index === 0
        };
      }

      return {
        id: fallback.id,
        name: fallback.name,
        address: found.address,
        mapsUrl: found.mapsUrl,
        isActive: found.isActive
      };
    });
  }

  private defaultBranches(): BranchLocation[] {
    return [
      {
        id: 'branch-agouza',
        name: 'Agouza Branch',
        address: 'Agouza, Giza, Egypt',
        mapsUrl: 'https://www.google.com/maps/place/%D8%B9%D9%8A%D8%B3%D9%89+%D9%84%D9%84%D8%B3%D9%8A%D8%A7%D8%B1%D8%A7%D8%AA%E2%80%AD/@30.0586402,31.2141598,17z/data=!3m1!4b1!4m6!3m5!1s0x1458412035347337:0xef4d45c14349c49e!8m2!3d30.0586402!4d31.2141598!16s%2Fg%2F1tj435wp!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDQwOC4wIKXMDSoASAFQAw%3D%3D',
        isActive: true
      },
      {
        id: 'branch-giza',
        name: 'Agouza Branch 2',
        address: 'Giza, Egypt',
        mapsUrl: 'https://www.google.com/maps?q=Giza,+Egypt&output=embed',
        isActive: false
      }
    ];
  }
}
