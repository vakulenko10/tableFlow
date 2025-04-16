"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { Provider } from 'react-redux';
import { store } from '@/store';
export default function SessionWrapper({ children }: { children: ReactNode }) {
  return <SessionProvider><Provider store={store}>{children}</Provider></SessionProvider>;
}
