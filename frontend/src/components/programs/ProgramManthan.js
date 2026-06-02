export default class ProgramManthan {
  render() {
    return `
      <section id="manthan-program" class="relative py-28 bg-white overflow-hidden z-20 select-none">
        
        <!-- Faint vertical line background thread -->
        <div class="absolute top-0 left-1/2 w-px h-full bg-stone-200/40 -translate-x-1/2 pointer-events-none z-0"></div>

        <div class="max-w-7xl mx-auto px-6 relative z-10">
          
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            <!-- Left Side: Image Panel (5 cols, Warm Child-focused Classroom) -->
            <div class="lg:col-span-5 flex justify-center scroll-reveal">
              <div class="bg-white p-4 border border-stone-200/80 rounded-2xl shadow-sm max-w-sm overflow-hidden select-none hover:shadow-md transition-shadow duration-500">
                <img src="/classroom-child.jpg" alt="Smiling child laughing in classroom with book" class="rounded-xl object-cover aspect-[4/5] hover:scale-101 transition-transform duration-700">
              </div>
            </div>

            <!-- Right Side: Program details & Objectives (7 cols) -->
            <div class="lg:col-span-7 text-left stagger-container">
              
              <div class="mb-8 stagger-load">
                <span class="font-interface font-semibold text-[10px] uppercase tracking-widest text-pink-ruby">Chapter 01 — The First Door</span>
                <h2 class="font-display font-semibold text-3xl text-text-dark mt-2 tracking-tight">Project Manthan</h2>
                
                <!-- Official Description Narrative Lead -->
                <p class="font-sans text-[14.5px] text-text-muted leading-relaxed font-light mt-4 italic border-l-2 border-pink-ruby/30 pl-4">
                  Providing educational support, awareness, and mentorship to help underprivileged children build brighter futures through learning. This is our foundation, supporting 60+ children with active learning classes and mentor networks.
                </p>
              </div>

              <!-- Objectives & Activities Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 stagger-load">
                
                <!-- Objectives Column -->
                <div>
                  <h4 class="font-interface font-bold text-xs uppercase tracking-widest text-text-dark mb-4">Core Objectives</h4>
                  <ul class="space-y-3 font-sans text-[13.5px] text-text-muted font-light">
                    <li class="flex items-start gap-2">
                      <span class="text-pink-ruby mt-1 text-xs">✓</span>
                      <span>Promote awareness about the importance of education.</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-pink-ruby mt-1 text-xs">✓</span>
                      <span>Provide educational support to underserved children.</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-pink-ruby mt-1 text-xs">✓</span>
                      <span>Encourage regular learning and academic participation.</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-pink-ruby mt-1 text-xs">✓</span>
                      <span>Build confidence, self-dignity and personal growth.</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-pink-ruby mt-1 text-xs">✓</span>
                      <span>Reduce educational inequalities.</span>
                    </li>
                  </ul>
                </div>

                <!-- Activities Column -->
                <div>
                  <h4 class="font-interface font-bold text-xs uppercase tracking-widest text-text-dark mb-4">Core Activities</h4>
                  <ul class="space-y-3 font-sans text-[13.5px] text-text-muted font-light">
                    <li class="flex items-start gap-2">
                      <span class="text-pink-ruby mt-1 text-xs">▪</span>
                      <span>Free educational classes</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-pink-ruby mt-1 text-xs">▪</span>
                      <span>Active learning sessions</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-pink-ruby mt-1 text-xs">▪</span>
                      <span>Structured mentorship</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-pink-ruby mt-1 text-xs">▪</span>
                      <span>Academic guidance</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-pink-ruby mt-1 text-xs">▪</span>
                      <span>Educational awareness campaigns</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-pink-ruby mt-1 text-xs">▪</span>
                      <span>Equal access to learning</span>
                    </li>
                  </ul>
                </div>

              </div>

              <!-- Refined Footer Snapshot Strip -->
              <div class="mt-10 pt-6 border-t border-stone-100 flex flex-wrap items-center gap-6 text-[11px] font-interface uppercase font-semibold text-stone-500 stagger-load select-none">
                <span class="px-3 py-1 rounded bg-pink-blush text-pink-ruby border border-pink-ruby/10">60+ Children Supported</span>
                <span>Initiative: Ongoing</span>
                <span>•</span>
                <span>Environment: Free & Inclusive</span>
              </div>

            </div>

          </div>

        </div>
      </section>
    `;
  }
}
