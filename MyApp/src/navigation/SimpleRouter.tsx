import React, {createContext, useCallback, useContext, useMemo, useState} from 'react';

export type RouteName =
  | 'Index'
  | 'Dashboard'
  | 'Doctors'
  | 'Medications'
  | 'Assistant'
  | 'Auth'
  | 'Onboarding'
  | 'Profile'
  | 'Symptoms'
  | 'NotFound';

type RouterContextValue = {
  route: RouteName;
  params?: Record<string, unknown>;
  navigate: (route: RouteName, params?: Record<string, unknown>) => void;
  goBack: () => void;
};

const RouterContext = createContext<RouterContextValue | undefined>(undefined);

export function RouterProvider({
  initialRoute = 'Dashboard',
  children,
}: {
  initialRoute?: RouteName;
  children: React.ReactNode;
}) {
  const [stack, setStack] = useState<Array<{name: RouteName; params?: Record<string, unknown>}>>([
    {name: initialRoute},
  ]);

  const navigate = useCallback((name: RouteName, params?: Record<string, unknown>) => {
    setStack(prev => [...prev, {name, params}]);
  }, []);

  const goBack = useCallback(() => {
    setStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const value = useMemo<RouterContextValue>(() => {
    const top = stack[stack.length - 1];
    return {route: top.name, params: top.params, navigate, goBack};
  }, [stack, navigate, goBack]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}

