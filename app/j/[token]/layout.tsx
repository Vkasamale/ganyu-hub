// Stripped layout for the public share-link landing page: no nav, no footer.
// Root layout provides <html>/<body>; this just wraps the page in a bare shell.
export default function ClientLinkLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-raised">{children}</div>;
}
