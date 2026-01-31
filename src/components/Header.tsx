import Image from "next/image";
import { auth, signOut } from "@/lib/auth";

interface HeaderProps {
  totalEntries: number;
  isLoaded: boolean;
}

export async function Header({ totalEntries, isLoaded }: HeaderProps) {
  const session = await auth();

  return (
    <header className="flex justify-between items-center mb-12 animate-fade-in">
      <div className="flex items-center gap-4">
        <Image
          src="/white-que.png"
          alt="Quango"
          width={36}
          height={36}
          className="rounded"
        />
        <div>
          <h1 className="text-xl font-semibold tracking-tight-custom">Q-Score</h1>
          <p className="text-muted text-xs">Team Points Tracker</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right text-sm text-muted hidden sm:block">
          <div className="font-medium text-foreground">Quango Inc</div>
          <div className="text-xs mt-0.5">
            {isLoaded && totalEntries > 0 ? `${totalEntries} entries logged` : "Internal Tool"}
          </div>
        </div>
        {session?.user && (
          <div className="flex items-center gap-3">
            {session.user.image && (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="text-xs text-muted hover:text-foreground transition-colors"
                title="Sign out"
              >
                Sign out
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
