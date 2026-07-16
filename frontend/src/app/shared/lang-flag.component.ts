import { Component, Input } from '@angular/core';
import { lenguaBandera } from '../core/books/book.model';

/**
 * SVG flags — Windows often fails to render emoji regional flags
 * (shows "es", "fr", black flag, etc.). Inline SVG works everywhere.
 */
@Component({
  selector: 'app-lang-flag',
  standalone: true,
  template: `
    <span class="lang-flags" [attr.title]="code" [attr.aria-label]="code">
      @for (id of flagIds; track id) {
        <svg
          class="lang-flag"
          viewBox="0 0 36 24"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          @switch (id) {
            @case ('es') {
              <rect width="36" height="24" fill="#c60b1e" />
              <rect y="6" width="36" height="12" fill="#ffc400" />
            }
            @case ('ca') {
              <rect width="36" height="24" fill="#fcdd09" />
              <rect y="2.4" width="36" height="2.4" fill="#da121a" />
              <rect y="7.2" width="36" height="2.4" fill="#da121a" />
              <rect y="12" width="36" height="2.4" fill="#da121a" />
              <rect y="16.8" width="36" height="2.4" fill="#da121a" />
            }
            @case ('us') {
              <rect width="36" height="24" fill="#bf0a30" />
              <rect y="1.85" width="36" height="1.85" fill="#fff" />
              <rect y="5.54" width="36" height="1.85" fill="#fff" />
              <rect y="9.23" width="36" height="1.85" fill="#fff" />
              <rect y="12.92" width="36" height="1.85" fill="#fff" />
              <rect y="16.62" width="36" height="1.85" fill="#fff" />
              <rect y="20.31" width="36" height="1.85" fill="#fff" />
              <rect width="14.4" height="12.92" fill="#002868" />
            }
            @case ('uk') {
              <rect width="36" height="24" fill="#012169" />
              <path d="M0 0 L36 24 M36 0 L0 24" stroke="#fff" stroke-width="4" />
              <path d="M0 0 L36 24 M36 0 L0 24" stroke="#c8102e" stroke-width="2" />
              <path d="M18 0 V24 M0 12 H36" stroke="#fff" stroke-width="7" />
              <path d="M18 0 V24 M0 12 H36" stroke="#c8102e" stroke-width="4" />
            }
            @case ('fr') {
              <rect width="12" height="24" fill="#002395" />
              <rect x="12" width="12" height="24" fill="#fff" />
              <rect x="24" width="12" height="24" fill="#ed2939" />
            }
            @case ('pt') {
              <rect width="36" height="24" fill="#ff0000" />
              <rect width="14.4" height="24" fill="#006600" />
              <circle cx="14.4" cy="12" r="4.2" fill="#ffcc00" />
              <circle cx="14.4" cy="12" r="2.6" fill="#fff" />
              <circle cx="14.4" cy="12" r="1.5" fill="#ff0000" />
            }
            @default {
              <rect width="36" height="24" fill="#6b6560" />
            }
          }
        </svg>
      }
    </span>
  `,
  styles: `
    :host {
      display: inline-flex;
      vertical-align: middle;
      line-height: 0;
    }
    .lang-flags {
      display: inline-flex;
      align-items: center;
      gap: 0.2rem;
    }
    .lang-flag {
      width: 1.15rem;
      height: 0.77rem;
      border-radius: 1px;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35);
      display: block;
      flex-shrink: 0;
    }
    :host.large .lang-flag {
      width: 1.5rem;
      height: 1rem;
    }
  `,
})
export class LangFlagComponent {
  /** Bandera API (`ES`, `US/UK`, `CAT`…) or lengua (`es`, `en`, `ca`…). */
  @Input({ required: true }) set code(value: string | null | undefined) {
    this._code = normalizeBandera(value);
    this.flagIds = flagIdsFor(this._code);
  }
  get code(): string {
    return this._code;
  }

  private _code = '';
  flagIds: string[] = [];
}

function normalizeBandera(value: string | null | undefined): string {
  if (!value) return '';
  const upper = value.toUpperCase();
  if (upper === 'USA') return 'US/UK';
  if (['ES', 'FR', 'PT', 'CAT', 'US/UK'].includes(upper) || value === 'US/UK') {
    return value === 'USA' ? 'US/UK' : value.includes('/') ? value : upper;
  }
  return lenguaBandera(value) || upper;
}

function flagIdsFor(bandera: string): string[] {
  switch (bandera) {
    case 'ES':
      return ['es'];
    case 'CAT':
      return ['ca'];
    case 'US/UK':
    case 'USA':
      return ['us', 'uk'];
    case 'FR':
      return ['fr'];
    case 'PT':
      return ['pt'];
    default:
      return [];
  }
}
