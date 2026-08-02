export interface SafeRouter {
  canGoBack: () => boolean;
  back: () => void;
  replace: (href: any) => void;
}

export function goBackOr(router: SafeRouter, fallback: string) {
  if (router.canGoBack()) router.back();
  else router.replace(fallback);
}
