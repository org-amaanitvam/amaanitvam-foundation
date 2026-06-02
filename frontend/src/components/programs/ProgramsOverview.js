export default class ProgramsOverview {
  render() {
    return `
      <section id="ecosystem" class="relative py-28 bg-stone-50/50 overflow-hidden border-t border-b border-stone-200/20 z-20 select-none">
        
        <!-- Faint vertical line background thread -->
        <div class="absolute top-0 left-1/2 w-px h-full bg-stone-200/40 -translate-x-1/2 pointer-events-none z-0"></div>

        <div class="max-w-6xl mx-auto px-6 relative z-10 text-center">
          
          <div class="max-w-2xl mx-auto mb-16 scroll-reveal">
            <span class="font-interface font-semibold text-[11px] uppercase tracking-widest text-pink-ruby">Program Ecosystem</span>
            <h2 class="font-display font-semibold text-3xl text-text-dark mt-2 tracking-tight">
              Initiative Pathways
            </h2>
            <p class="font-sans text-[14.5px] text-text-muted mt-3 font-light leading-relaxed">
              Our initiatives are not separate projects, but connected pathways contributing to one unified mission. We guide potential through structured learning and community outreach.
            </p>
          </div>

          <!-- Dynamic Journey Pathway (not a static org chart) -->
          <div class="flex flex-col items-center justify-center relative select-none stagger-container max-w-lg mx-auto py-8 bg-white border border-stone-200/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-500">
            
            <!-- Continuous subtle connection line inside the card container -->
            <div class="absolute left-1/2 top-8 bottom-8 w-px bg-gradient-to-b from-stone-200 via-pink-ruby/20 to-stone-200 -translate-x-1/2 pointer-events-none z-0"></div>

            <!-- Node 1: Opportunity -->
            <div class="relative flex flex-col items-center mb-6 stagger-load z-10">
              <span class="px-4 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-stone-500 font-interface text-[10px] uppercase font-bold tracking-widest">Opportunity</span>
            </div>

            <!-- Connecting Arrow -->
            <div class="mb-4 text-stone-300 stagger-load font-light select-none">↓</div>

            <!-- Node 2: Project Manthan -->
            <div class="relative flex flex-col items-center mb-6 stagger-load z-10">
              <span class="px-6 py-2.5 rounded-md bg-white border-2 border-pink-ruby text-pink-ruby font-interface text-xs uppercase font-bold tracking-widest shadow-sm hover:scale-103 transition-transform duration-300">Project Manthan</span>
            </div>

            <!-- Connecting Arrow -->
            <div class="mb-4 text-stone-300 stagger-load font-light select-none">↓</div>

            <!-- Node 3: Learning -->
            <div class="relative flex flex-col items-center mb-6 stagger-load z-10">
              <span class="px-4 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-stone-500 font-interface text-[10px] uppercase font-bold tracking-widest">Learning</span>
            </div>

            <!-- Connecting Arrow -->
            <div class="mb-4 text-stone-300 stagger-load font-light select-none">↓</div>

            <!-- Node 4: Project Shiksha -->
            <div class="relative flex flex-col items-center mb-6 stagger-load z-10">
              <span class="px-6 py-2.5 rounded-md bg-white border-2 border-amber-500 text-amber-600 font-interface text-xs uppercase font-bold tracking-widest shadow-sm hover:scale-103 transition-transform duration-300">Project Shiksha</span>
            </div>

            <!-- Connecting Arrow -->
            <div class="mb-4 text-stone-300 stagger-load font-light select-none">↓</div>

            <!-- Node 5: Growth -->
            <div class="relative flex flex-col items-center mb-6 stagger-load z-10">
              <span class="px-4 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-stone-500 font-interface text-[10px] uppercase font-bold tracking-widest">Growth</span>
            </div>

            <!-- Connecting Arrow -->
            <div class="mb-4 text-stone-300 stagger-load font-light select-none">↓</div>

            <!-- Node 6: Project Pravah -->
            <div class="relative flex flex-col items-center mb-6 stagger-load z-10">
              <span class="px-6 py-2.5 rounded-md bg-white border-2 border-pink-ruby text-pink-ruby font-interface text-xs uppercase font-bold tracking-widest shadow-sm hover:scale-103 transition-transform duration-300">Project Pravah</span>
            </div>

            <!-- Connecting Arrow -->
            <div class="mb-4 text-stone-300 stagger-load font-light select-none">↓</div>

            <!-- Node 7: Community Impact -->
            <div class="relative flex flex-col items-center stagger-load z-10">
              <span class="px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-interface text-[10px] uppercase font-bold tracking-widest">Community Impact</span>
            </div>

          </div>

        </div>
      </section>
    `;
  }
}
