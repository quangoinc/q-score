import { teamMembers, tasks } from "@/lib/data";

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-8 md:px-12 md:py-12 max-w-5xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-start mb-16 animate-fade-in">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight-custom">Q-Score</h1>
          <p className="text-muted text-sm mt-1">Team Points Tracker</p>
        </div>
        <div className="text-right text-sm text-muted">
          <div>Quango Inc</div>
          <div className="mt-1">Internal Tool</div>
        </div>
      </header>

      {/* ASCII Divider */}
      <div className="text-muted text-xs tracking-widest mb-12 animate-fade-in stagger-1">
        + — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — +
      </div>

      <div className="grid md:grid-cols-2 gap-16">
        {/* Team Members Section */}
        <section className="animate-fade-in stagger-2">
          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-muted text-sm font-medium">01</span>
            <h2 className="text-lg font-semibold">Team</h2>
          </div>

          <div className="space-y-4">
            {teamMembers.map((member, index) => (
              <div
                key={member.id}
                className="group flex items-center justify-between py-3 border-b border-border"
              >
                <div className="flex items-center gap-4">
                  <span className="text-muted text-xs w-6">[{String(index + 1).padStart(2, "0")}]</span>
                  <span className="font-medium">{member.name}</span>
                </div>
                <span className="text-muted text-sm">0 pts</span>
              </div>
            ))}
          </div>
        </section>

        {/* Tasks Section */}
        <section className="animate-fade-in stagger-3">
          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-muted text-sm font-medium">02</span>
            <h2 className="text-lg font-semibold">Tasks</h2>
          </div>

          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="group flex items-center justify-between py-3 border-b border-border"
              >
                <span className="font-medium">{task.name}</span>
                <span className="text-sm px-3 py-1 bg-card rounded-full">
                  +{task.points} pts
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ASCII Divider */}
      <div className="text-muted text-xs tracking-widest mt-16 mb-8 animate-fade-in stagger-4">
        + — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — +
      </div>

      {/* Footer */}
      <footer className="flex justify-between items-center text-sm text-muted animate-fade-in stagger-5">
        <div>&copy; {new Date().getFullYear()} Quango Inc</div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-muted" />
          <span>v0.1</span>
        </div>
      </footer>
    </main>
  );
}
