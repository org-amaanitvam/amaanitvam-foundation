export default class GrowingWithCommunities {
  render() {
    return `
      <section id="growing-with-communities" class="relative py-28 bg-stone-50/50 overflow-hidden border-t border-stone-200/20 z-20">
        <!-- Thin background vertical thread connector -->
        <div class="absolute top-0 left-1/2 w-px h-full bg-stone-200/40 -translate-x-1/2 pointer-events-none z-0"></div>

        <div class="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <div class="max-w-2xl mx-auto flex flex-col items-center scroll-reveal">
            
            <span class="font-interface font-semibold text-[11px] uppercase tracking-widest text-pink-ruby mb-4">Future Vision</span>
            
            <h2 class="font-display font-semibold text-3xl text-text-dark tracking-tight mb-6 font-medium">
              Growing With Communities
            </h2>
            
            <p class="font-sans text-[15px] text-text-muted leading-relaxed font-light mb-8 max-w-xl">
              We continue to expand our program pathways systematically to nurture educational growth, active community participation, and civic responsibility. Under our future milestone <strong class="font-semibold text-text-dark">"Growing Impact Across Communities,"</strong> we focus on establishing secure and inclusive learning spaces, enabling student-led surveys, and building pathways of change.
            </p>

            <span class="w-8 h-px bg-stone-300"></span>

          </div>
        </div>
      </section>
    `;
  }
}
