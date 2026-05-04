"use client";

import { useEffect } from "react";

type AutoRedirectProps = {
  targetUrl: string;
};

export default function AutoRedirect({ targetUrl }: AutoRedirectProps) {
  useEffect(() => {
    window.location.replace(targetUrl);
  }, [targetUrl]);

  return null;
}
