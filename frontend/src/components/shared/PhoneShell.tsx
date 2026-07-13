import Image from 'next/image';
import type { ReactNode } from 'react';
import appBackdrop from '@/assets/app-backdrop.png';
import { ShellBackButton } from './ShellBackButton';

// Phone-shell layout for every in-app view (auth, onboarding, dashboard).
// A full-screen bokeh-city photo backdrop, darkened with a navy wash to stay
// dark-only, with a centered glass phone-frame card floating on top,
// ditto-style. On real phones the frame expands to fill the viewport; the
// framed look is a tablet/desktop enhancement.
// Pass `backHref` for a fixed back target, or `back` to walk browser history.
// Pass `center` for short content (e.g. auth forms) that should sit vertically
// centered in the card instead of anchored to the top with blank space below.
export function PhoneShell({
  children,
  back,
  backHref,
  center,
}: {
  children: ReactNode;
  back?: boolean;
  backHref?: string;
  center?: boolean;
}) {
  const showBack = back || Boolean(backHref);

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-1 flex-col items-center justify-center sm:p-6">
      {/* Full-screen backdrop: bokeh photo, darkened so the glass card stays legible.
          Painted first in DOM order (no negative z-index) since fixed elements with
          a negative z-index can paint behind the document background in some browsers. */}
      <div aria-hidden className="fixed inset-0 overflow-hidden">
        <Image
          src={appBackdrop}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="100vw"
          className="object-cover"
        />
        <div className="bg-navy-deep/45 absolute inset-0" />
        <div className="from-navy-deep/70 via-transparent to-navy-deep/70 absolute inset-0 bg-gradient-to-b" />
      </div>

      {/* Phone frame: glass card, full-bleed on mobile, framed from sm up. */}
      <div className="relative z-10 flex w-full flex-1 flex-col overflow-hidden border-white/10 bg-[rgba(10,37,64,0.85)] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:max-h-[calc(100dvh-3rem)] sm:min-h-[780px] sm:w-[430px] sm:flex-none sm:rounded-[2.5rem] sm:border">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto px-5 pt-6 pb-10 sm:px-7">
          {showBack && (
            <div className="mb-4 shrink-0">
              <ShellBackButton href={backHref} />
            </div>
          )}
          <div
            className={
              center ? 'flex flex-1 flex-col justify-center' : 'flex-1'
            }
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
