export default class ProgramJourney {
  render() {
    return `
      <section id="program-journey" class="relative py-36 bg-stone-50/50 overflow-hidden border-t border-b border-stone-200/20 z-20 select-none">
        
        <!-- Continuous vertical timeline background thread -->
        <div class="absolute top-0 left-1/2 w-px h-full bg-stone-200/60 -translate-x-1/2 pointer-events-none z-0"></div>

        <div class="max-w-4xl mx-auto px-6 relative z-10 text-center">
          
          <div class="max-w-2xl mx-auto mb-24 scroll-reveal">
            <span class="font-interface font-semibold text-[11px] uppercase tracking-widest text-pink-ruby">The Visual Connection</span>
            <h2 class="font-display font-semibold text-3xl text-text-dark mt-2 tracking-tight font-medium">
              The Journey of Care
            </h2>
            <p class="font-sans text-[14.5px] text-text-muted mt-3 font-light leading-relaxed">
              We connect educational excellence, academic guidance, and community surveys into a single pipeline of transformation.
            </p>
          </div>

          <!-- Vertical Timeline Steps with significant space -->
          <div class="relative pl-8 sm:pl-12 py-4 stagger-container select-none max-w-2xl mx-auto">
            
            <!-- Timeline active running thread -->
            <div class="absolute left-3.5 sm:left-5 top-0 bottom-0 w-0.5 bg-stone-200 pointer-events-none z-0"></div>
            <div class="absolute left-3.5 sm:left-5 top-0 w-0.5 bg-gradient-to-b from-pink-ruby via-pink-ruby to-amber-500 origin-top scale-y-0 transition-transform duration-1000 ease-out z-0" id="journey-active-line"></div>

            <!-- Step 1: Manthan (Support & Learning) -->
            <div class="relative mb-24 journey-step stagger-load text-left">
              <!-- Active dot node -->
              <div class="absolute -left-[32px] sm:-left-[40px] top-1 w-4 h-4 rounded-full border-2 border-stone-300 bg-white transition-all duration-500 ease-out z-10 journey-dot" data-idx="0"></div>
              
              <div class="pl-2">
                <span class="font-interface font-bold text-[10px] uppercase tracking-widest text-pink-ruby mb-2 block">Step 01 — Project Manthan</span>
                <h3 class="font-display italic text-xl text-text-dark mb-3 tracking-wide font-medium">Support & Learning</h3>
                <p class="font-sans text-[14px] text-text-muted leading-relaxed font-light">
                  Establishing the baseline. Providing direct educational classes, mentorship networks, and academic awareness drives to spark initial educational interest.
                </p>
              </div>
            </div>

            <!-- Step 2: Shiksha (Growth & Confidence) -->
            <div class="relative mb-24 journey-step stagger-load text-left">
              <!-- Active dot node -->
              <div class="absolute -left-[32px] sm:-left-[40px] top-1 w-4 h-4 rounded-full border-2 border-stone-300 bg-white transition-all duration-500 ease-out z-10 journey-dot" data-idx="1"></div>
              
              <div class="pl-2">
                <span class="font-interface font-bold text-[10px] uppercase tracking-widest text-amber-600 mb-2 block">Step 02 — Project Shiksha</span>
                <h3 class="font-display italic text-xl text-text-dark mb-3 tracking-wide font-medium">Intellectual Growth</h3>
                <p class="font-sans text-[14px] text-text-muted leading-relaxed font-light">
                  Nurturing intellectual interest. Expanding access to academic resources, guiding active curiosity, and mentoring children to overcome local barriers.
                </p>
              </div>
            </div>

            <!-- Step 3: Pravah (Confidence & Participation) -->
            <div class="relative journey-step stagger-load text-left">
              <!-- Active dot node -->
              <div class="absolute -left-[32px] sm:-left-[40px] top-1 w-4 h-4 rounded-full border-2 border-stone-300 bg-white transition-all duration-500 ease-out z-10 journey-dot" data-idx="2"></div>
              
              <div class="pl-2">
                <span class="font-interface font-bold text-[10px] uppercase tracking-widest text-pink-ruby mb-2 block">Step 03 — Project Pravah</span>
                <h3 class="font-display italic text-xl text-text-dark mb-3 tracking-wide font-medium">Community Participation</h3>
                <p class="font-sans text-[14px] text-text-muted leading-relaxed font-light">
                  The ripple expands. Channeling student learning into active civic campaigns, regional development projects, and collaborative community action.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>
    `;
  }

  static init() {
    const steps = document.querySelectorAll('.journey-step');
    const dots = document.querySelectorAll('.journey-dot');
    const activeLine = document.getElementById('journey-active-line');

    if (!steps.length || !activeLine) return;

    // Observe active journey steps scroll triggers
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const item = entry.target;
          const dot = item.querySelector('.journey-dot');
          const idx = parseInt(dot.getAttribute('data-idx'), 10);

          dot.classList.remove('border-stone-300', 'bg-white');
          dot.classList.add('border-pink-ruby', 'bg-pink-ruby', 'scale-110');

          const ratio = (idx + 1) / steps.length;
          activeLine.style.transform = `scaleY(${ratio})`;
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '0px 0px -100px 0px'
    });

    steps.forEach(step => observer.observe(step));
  }
}
