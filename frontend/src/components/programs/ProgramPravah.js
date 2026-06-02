export default class ProgramPravah {
  render() {
    return `
      <section id="pravah-program" class="relative py-28 bg-white overflow-hidden z-20 select-none">
        
        <!-- Faint vertical line background thread -->
        <div class="absolute top-0 left-1/2 w-px h-full bg-stone-200/40 -translate-x-1/2 pointer-events-none z-0"></div>

        <div class="max-w-7xl mx-auto px-6 relative z-10">
          
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            <!-- Left Side: Image Panel (5 cols, Sunset wide/community field) -->
            <div class="lg:col-span-5 flex justify-center scroll-reveal">
              <div class="bg-white p-4 border border-stone-200/80 rounded-2xl shadow-sm max-w-sm overflow-hidden select-none hover:shadow-md transition-shadow duration-500">
                <img src="/field-children.jpg" alt="Children holding hands on sunset hill" class="rounded-xl object-cover aspect-[4/5] hover:scale-101 transition-transform duration-700">
              </div>
            </div>

            <!-- Right Side: Program details & Objectives (7 cols) -->
            <div class="lg:col-span-7 text-left stagger-container">
              
              <div class="mb-8 stagger-load">
                <span class="font-interface font-semibold text-[10px] uppercase tracking-widest text-pink-ruby">Chapter 03 — The Ripple Effect</span>
                <h2 class="font-display font-semibold text-3xl text-text-dark mt-2 tracking-tight">Project Pravah</h2>
                
                <!-- Official Description Narrative Lead -->
                <p class="font-sans text-[14.5px] text-text-muted leading-relaxed font-light mt-4 italic border-l-2 border-pink-ruby/30 pl-4">
                  Reaching communities through awareness, engagement, and social development initiatives that encourage positive change. We expand outreach to 23+ young lives to foster civic responsibility and community action.
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
                      <span>Promote social awareness.</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-pink-ruby mt-1 text-xs">✓</span>
                      <span>Support community engagement.</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-pink-ruby mt-1 text-xs">✓</span>
                      <span>Encourage active citizenship.</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-pink-ruby mt-1 text-xs">✓</span>
                      <span>Nurture civic responsibility.</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-pink-ruby mt-1 text-xs">✓</span>
                      <span>Foster community participation.</span>
                    </li>
                  </ul>
                </div>

                <!-- Activities Column -->
                <div>
                  <h4 class="font-interface font-bold text-xs uppercase tracking-widest text-text-dark mb-4">Core Activities</h4>
                  <ul class="space-y-3 font-sans text-[13.5px] text-text-muted font-light">
                    <li class="flex items-start gap-2">
                      <span class="text-pink-ruby mt-1 text-xs">▪</span>
                      <span>Community outreach campaigns</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-pink-ruby mt-1 text-xs">▪</span>
                      <span>Social awareness seminars</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-pink-ruby mt-1 text-xs">▪</span>
                      <span>Youth engagement drives</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-pink-ruby mt-1 text-xs">▪</span>
                      <span>Civic participation meets</span>
                    </li>
                    <li class="flex items-start gap-2">
                      <span class="text-pink-ruby mt-1 text-xs">▪</span>
                      <span>Community development initiatives</span>
                    </li>
                  </ul>
                </div>

              </div>

              <!-- Refined Footer Snapshot Strip -->
              <div class="mt-10 pt-6 border-t border-stone-100 flex flex-wrap items-center gap-6 text-[11px] font-interface uppercase font-semibold text-stone-500 stagger-load select-none">
                <span class="px-3 py-1 rounded bg-pink-blush text-pink-ruby border border-pink-ruby/10">23+ Children Supported</span>
                <span>Program: Active</span>
                <span>•</span>
                <span>Initiative: Ongoing</span>
              </div>

            </div>

          </div>

        </div>
      </section>
    `;
  }
}
