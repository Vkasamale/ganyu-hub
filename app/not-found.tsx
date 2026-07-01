import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <p className="font-serif text-6xl italic text-ink/30">404</p>
      <h1 className="mt-4 text-2xl font-semibold">Nothing here.</h1>
      <p className="mt-2 text-sm text-neutral-600">
        The page you were after doesn&apos;t exist, or it moved.
      </p>
      <Link href="/" className="mt-6">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
