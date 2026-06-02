export default class ProgramsHero {
  render() {
    return `
      <section id="programs-hero" class="relative py-32 bg-stone-50 overflow-hidden flex items-center justify-center select-none border-b border-stone-200/50 z-10 pt-40">
        
        <!-- Faint visual backdrop overlays representing ripple thread -->
        <div class="absolute -top-[10%] -left-[10%] w-[450px] h-[450px] bg-gradient-to-br from-pink-quartz/20 to-transparent rounded-full filter blur-3xl pointer-events-none z-0"></div>
        <div class="absolute -bottom-[10%] -right-[10%] w-[450px] h-[450px] bg-gradient-to-br from-amber-200/10 to-transparent rounded-full filter blur-3xl pointer-events-none z-0"></div>
        
        <div class="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div class="flex flex-col items-center stagger-container">
            
            <!-- Tagline Badge -->
            <span class="font-display italic text-base md:text-lg text-pink-ruby tracking-wide mb-6 block select-none stagger-load">
              "What Are We, If Not for One Another?"
            </span>

            <!-- Main Headline -->
            <h1 class="font-display font-medium text-4xl sm:text-5xl lg:text-6xl text-text-dark tracking-tight leading-tight mb-6 stagger-load">
              Programs That Create Meaningful Impact
            </h1>

            <div class="w-12 h-px bg-pink-ruby/20 mb-8 stagger-load"></div>

            <!-- Legible Subtitle -->
            <p class="font-sans text-text-muted font-light text-base md:text-lg max-w-2xl leading-relaxed mb-10 stagger-load">
              We translate compassion into action through structured learning, guidance, and community outreach campaigns that nurture active citizenship.
            </p>

            <!-- CTA Actions -->
            <div class="flex flex-wrap items-center justify-center gap-4 stagger-load">
              <a href="#potential" class="inline-flex items-center gap-2 font-interface font-semibold text-[11px] uppercase tracking-widest px-8 py-4 rounded-md bg-gold-satin text-white hover:bg-gold-satin/95 shadow-sm transition-all duration-300">
                Explore Programs
              </a>
              <a href="#programs-cta" class="inline-flex items-center gap-2 font-interface font-semibold text-[11px] uppercase tracking-widest px-8 py-4 rounded-md border border-stone-200 text-stone-600 bg-white hover:border-pink-ruby hover:text-pink-ruby transition-all duration-300">
                Get Involved
              </a>
            </div>

          </div>
        </div>

      </section>
    `;
  }
}
