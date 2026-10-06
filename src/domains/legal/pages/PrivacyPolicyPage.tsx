'use client';

import { Alert } from '@/shared/components/molecules/Alert';
import { PRIVACY_POLICY_LABELS } from '../constants';

const LABELS = PRIVACY_POLICY_LABELS;

export function PrivacyPolicyPage() {
  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-slate-950">{LABELS.PAGE_TITLE}</h1>
        <p className="text-sm text-slate-500">
          {LABELS.LAST_UPDATED_LABEL}: {LABELS.LAST_UPDATED}
        </p>
      </header>

      <p className="text-sm leading-relaxed text-slate-700">{LABELS.INTRO}</p>

      <Alert variant="default">
        <p className="text-sm font-medium text-slate-950">{LABELS.ACCOUNT_NOTICE_TITLE}</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-700">{LABELS.ACCOUNT_NOTICE_BODY}</p>
      </Alert>

      {LABELS.SECTIONS.map((section) => (
        <section key={section.ID} id={section.ID} className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold text-slate-950">{section.TITLE}</h2>

          {section.PARAGRAPHS.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-relaxed text-slate-700">
              {paragraph}
            </p>
          ))}

          {section.ITEMS.length > 0 && (
            <ul className="flex list-disc flex-col gap-2 pl-5">
              {section.ITEMS.map((item) => (
                <li key={item} className="text-sm leading-relaxed text-slate-700">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </article>
  );
}
