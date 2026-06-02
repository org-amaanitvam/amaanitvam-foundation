export default class ProgramShiksha {
  render() {
    return `
      <section id="shiksha-program" class="relative py-28 bg-stone-50/50 overflow-hidden border-t border-b border-stone-200/20 z-20 select-none">
        
        <!-- Faint vertical line background thread -->
        <div class="absolute top-0 left-1/2 w-px h-full bg-stone-200/40 -translate-x-1/2 pointer-events-none z-0"></div>

        <div class="max-w-7xl mx-auto px-6 relative z-10">
          
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            <!-- Left Side: Program details & Objectives (7 cols) -->
            <div class="lg:col-span-7 text-left stagger-container order-2 lg:order-1">
              
              <div class="mb-8 stagger-load">
                <span class="font-interface font-semibold text-[10px] uppercase tracking-widest text-amber-600">Chapter 02 — The Growth Stage</span>
                <h2 class="font-display font-semibold text-3xl text-text-dark mt-2 tracking-tight">Project Shiksha</h2>
                
                <!-- Official Description Narrative Lead -->
                <p class="font-sans text-[14.5px] text-text-muted leading-relaxed font-light mt-4 italic border-l-2 border-amber-500/35 pl-4">
                  Expanding access to quality learning opportunities and empowering young minds through education and guidance. Built on the belief that education is a powerful tool, we inspire curiosity and access for 45+ children.
                </p>
              </div>

              <!-- Objectives & Activities Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 stagger-load">
                
                <!-- Objectives Column -->
                <div>
                  <h4 class="font-interface font-bold text-xs uppercase tracking-widest text-text-dark mb-4">Core Objectives</h4>
                  <ul class="space-y-3 font-sans text-[13.5px] text-text-muted font-light">
                    <li class="flex items-start gap-2">
                      <span class="text-amber-600 mt-1 text-xs">✓</span>
                      <span>Access to learning opportunities.</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-amber-600 mt-1 text-xs">✓</span>
                      <span>Educational growth.</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-amber-600 mt-1 text-xs">✓</span>
                      <span>Support children facing barriers.</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-amber-600 mt-1 text-xs">✓</span>
                      <span>Build confidence through learning.</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-amber-600 mt-1 text-xs">✓</span>
                      <span>Promote educational awareness.</span>
                    </li>
                  </ul>
                </div>

                <!-- Activities Column -->
                <div>
                  <h4 class="font-interface font-bold text-xs uppercase tracking-widest text-text-dark mb-4">Core Activities</h4>
                  <ul class="space-y-3 font-sans text-[13.5px] text-text-muted font-light">
                    <li class="flex items-start gap-2">
                      <span class="text-amber-600 mt-1 text-xs">▪</span>
                      <span>Educational support initiatives</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-amber-600 mt-1 text-xs">▪</span>
                      <span>Focused learning sessions</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-amber-600 mt-1 text-xs">▪</span>
                      <span>Awareness campaigns</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-amber-600 mt-1 text-xs">▪</span>
                      <span>Student engagement activities</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-amber-600 mt-1 text-xs">▪</span>
                      <span>Community participation programs</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-amber-600 mt-1 text-xs">▪</span>
                      <span>Mentorship opportunities</span>
                    </li>
                  </ul>
                </div>

              </div>

              <!-- Refined Footer Snapshot Strip -->
              <div class="mt-10 pt-6 border-t border-stone-200/40 flex flex-wrap items-center gap-6 text-[11px] font-interface uppercase font-semibold text-stone-500 stagger-load select-none">
                <span class="px-3 py-1 rounded bg-gold-light text-gold-ochre border border-gold-ochre/10">45+ Children Supported</span>
                <span>Program: Active</span>
                <span>•</span>
                <span>Initiative: Ongoing</span>
              </div>

            </div>

            <!-- Right Side: Image Panel (5 cols, Landscape Child under golden sunset, Growth tone) -->
            <div class="lg:col-span-5 flex justify-center scroll-reveal order-1 lg:order-2">
              <div class="bg-white p-4 border border-stone-200/80 rounded-2xl shadow-sm max-w-sm overflow-hidden select-none hover:shadow-md transition-shadow duration-500">
                <div class="relative overflow-hidden rounded-xl">
                  <!-- Subtle upward gradient visual overlays -->
                  <div class="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent pointer-events-none mix-blend-overlay"></div>
                  <img src="/landscape-child.jpg" alt="Child holding notebook looking into mountain sunset" class="object-cover aspect-[4/5] hover:scale-101 transition-transform duration-700">
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>
    `;
  }
}
