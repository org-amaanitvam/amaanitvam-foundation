export default class ProgramsCTA {
  render() {
    return `
      <section id="programs-cta" class="relative py-28 bg-white overflow-hidden border-t border-stone-200/20 z-20">
        <!-- Thin background vertical thread connector -->
        <div class="absolute top-0 left-1/2 w-px h-full bg-stone-200/40 -translate-x-1/2 pointer-events-none z-0"></div>

        <div class="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <div class="max-w-2xl mx-auto flex flex-col items-center scroll-reveal">
            
            <span class="font-interface font-semibold text-[11px] uppercase tracking-widest text-pink-ruby mb-4">The Invitation</span>
            
            <h2 class="font-display font-semibold text-3xl text-text-dark tracking-tight mb-6 font-medium">
              Be the Change You Wish to See
            </h2>
            
            <p class="font-sans text-[14.5px] text-text-muted leading-relaxed font-light mb-10 max-w-lg">
              Join our mission to empower lives through education, compassion, and community action.
            </p>

            <div class="flex flex-wrap items-center justify-center gap-4">
              <a href="https://www.amaanitvam.org/donate/" target="_blank" class="inline-flex items-center gap-2 font-interface font-semibold text-[11px] uppercase tracking-widest px-8 py-4 rounded-md bg-gold-satin text-white hover:bg-gold-satin/95 shadow-sm transition-all duration-300">
                Donate Now
              </a>
              <a href="#volunteer-form" class="inline-flex items-center gap-2 font-interface font-semibold text-[11px] uppercase tracking-widest px-8 py-4 rounded-md border border-stone-200 text-stone-600 bg-white hover:border-pink-ruby hover:text-pink-ruby transition-all duration-300">
                Get Involved
              </a>
            </div>

          </div>
        </div>
      </section>
    `;
  }
}
