export default function Footer() {
  return (
    <footer className="border-t border-border py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-display text-lg font-semibold text-gold-gradient">
            KL
          </span>
          <span className="text-muted text-sm font-body">
            &nbsp;·&nbsp; Kenneth Lariosa
          </span>
        </div>
        <p className="text-muted text-xs font-mono text-center">
          © {new Date().getFullYear()} &nbsp;·&nbsp; Crafted with Next.js &
          Tailwind CSS
        </p>
        <a
          href="#"
          className="text-muted hover:text-gold transition-colors text-xs font-mono tracking-widest"
        >
          BACK TO TOP ↑
        </a>
      </div>
    </footer>
  );
}
