import * as React from 'react';
import useScript from 'react-script-hook';

export interface RecaptchaProps {
  siteKey: string;
  hideDefaultBadge?: boolean;
}

export default function useRecaptcha({
  siteKey,
  hideDefaultBadge = false
}: RecaptchaProps) {
  const { promise, resolve } = React.useMemo(createPromiseResolver, [
    siteKey,
    hideDefaultBadge
  ]);

  useScript({
    src: `https://www.google.com/recaptcha/api.js?render=${siteKey}`,
    onload: () =>
      (window as any).grecaptcha.ready(() => {
        resolve((window as any).grecaptcha);
      })
  });

  React.useEffect(() => {
    if (isBrowser && hideDefaultBadge) {
      injectStyle('.grecaptcha-badge { visibility: hidden; }');
    }
  }, [hideDefaultBadge]);

  return React.useCallback(
    async (action: string) => {
      const grecaptcha = await promise;
      return grecaptcha.execute(siteKey, { action });
    },
    [siteKey, promise]
  );
}

interface Recaptcha {
  ready(): Promise<void>;
  execute(siteKey: string, config: { action: string }): void;
}

const isBrowser =
  typeof window !== 'undefined' && typeof window.document !== 'undefined';

const createPromiseResolver = () => {
  let resolve: (grecaptcha: Recaptcha) => void = () => {};

  const promise = new Promise<Recaptcha>(r => {
    resolve = r;
  });

  return { resolve, promise };
};

const injectStyle = (rule: string) => {
  const styleEl = document.createElement('style') as HTMLStyleElement;
  document.head.appendChild(styleEl);

  const styleSheet = styleEl.sheet as CSSStyleSheet;
  if (styleSheet) styleSheet.insertRule(rule, styleSheet.cssRules.length);
};