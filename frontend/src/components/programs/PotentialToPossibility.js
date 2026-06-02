export default class PotentialToPossibility {
  render() {
    return `
      <section id="potential" class="relative py-28 bg-white overflow-hidden z-20 select-none">
        
        <!-- Faint vertical line background thread -->
        <div class="absolute top-0 left-1/2 w-px h-full bg-stone-200/80 -translate-x-1/2 pointer-events-none z-0"></div>

        <div class="max-w-3xl mx-auto px-6 relative z-10 text-center">
          
          <div class="mb-16 scroll-reveal">
            <span class="font-interface font-semibold text-[11px] uppercase tracking-widest text-pink-ruby mb-4 block">The Context</span>
            <h2 class="font-display font-semibold text-2xl md:text-3xl text-text-dark tracking-tight leading-snug font-medium">
              From Potential to Possibility
            </h2>
          </div>

          <!-- Vertical Timeline Progression of Care -->
          <div class="flex flex-col items-center gap-8 relative select-none stagger-container">
            
            <!-- Step 1 -->
            <div class="flex flex-col items-center stagger-load">
              <div class="font-display italic text-lg sm:text-xl text-stone-800 font-light">
                Potential exists everywhere
              </div>
              <span class="w-6 h-px bg-stone-300 mt-4"></span>
            </div>

            <!-- Step 2 -->
            <div class="flex flex-col items-center stagger-load">
              <div class="font-display italic text-lg sm:text-xl text-stone-800 font-light">
                Opportunities are not always equal
              </div>
              <span class="w-6 h-px bg-stone-300 mt-4"></span>
            </div>

            <!-- Step 3 -->
            <div class="flex flex-col items-center stagger-load">
              <div class="font-display italic text-lg sm:text-xl text-stone-800 font-light">
                Support can unlock growth
              </div>
              <span class="w-6 h-px bg-stone-300 mt-4"></span>
            </div>

            <!-- Step 4 -->
            <div class="flex flex-col items-center stagger-load">
              <div class="font-display italic text-lg sm:text-xl text-stone-800 font-light">
                Growth strengthens communities
              </div>
              <span class="w-6 h-px bg-pink-ruby/30 mt-6"></span>
            </div>

            <!-- Step 5: Resolution block -->
            <div class="mt-4 flex flex-col items-center stagger-load">
              <span class="font-interface text-[11px] font-bold uppercase tracking-[0.2em] text-pink-ruby mb-3 block">
                Amaanitvam responds through
              </span>
              <div class="font-display italic text-base text-stone-900 flex flex-wrap items-center justify-center gap-3">
                <span class="hover:text-pink-ruby transition-colors duration-300 font-semibold">Manthan</span>
                <span class="text-stone-400">→</span>
                <span class="hover:text-gold-ochre transition-colors duration-300 font-semibold">Shiksha</span>
                <span class="text-stone-400">→</span>
                <span class="hover:text-pink-ruby transition-colors duration-300 font-semibold">Pravah</span>
              </div>
            </div>

          </div>

        </div>
      </section>
    `;
  }
}
