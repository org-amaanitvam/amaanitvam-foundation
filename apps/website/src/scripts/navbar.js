function getViewportSize() {
    return {
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 768,
        isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
        isDesktop: window.innerWidth >= 1024
    };
}

export function initNavbar() {
    const nav = document.getElementById('site-nav');
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const currentPage = document.body.dataset.page || '';

    if (
        !nav ||
        !menuToggle ||
        !mobileMenu ||
        nav.dataset.initialized === 'true'
    ) {
        return;
    }

    nav.dataset.initialized = 'true';

    // 1. Highlight active links
    document.querySelectorAll('[data-nav]').forEach(function (link) {
        if (link.dataset.nav === currentPage) {
            link.classList.add('is-active');
            link.setAttribute('aria-current', 'page');
        }
    });

    // 2. Navbar transparency scroll effect
    function updateNav() {
        if (!nav) return;
        const hero = document.querySelector('[data-hero]');
        const scrolled = window.scrollY > 40;
        const hasHero = hero && hero.getBoundingClientRect().bottom > 80;

        if (hasHero && !scrolled) {
            nav.classList.add('is-transparent');
            nav.classList.remove('is-solid');
        } else {
            nav.classList.remove('is-transparent');
            nav.classList.add('is-solid');
        }
    }

    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();

    // 3. Mobile Menu Logic with enhanced close behavior
    // 3. Mobile Menu Logic
    function closeMenu() {
        mobileMenu.classList.remove('is-open');
        mobileMenu.setAttribute('aria-hidden', 'true');

        menuToggle.classList.remove('is-active');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open navigation menu');

        document.body.style.overflow = '';

        // Saare mobile dropdown close
        mobileMenu
            .querySelectorAll('.mobile-group-links.is-open')
            .forEach(function (group) {
                group.classList.remove('is-open');
            });

        mobileMenu
            .querySelectorAll('.mobile-group-toggle[aria-expanded="true"]')
            .forEach(function (button) {
                button.setAttribute('aria-expanded', 'false');
            });
    }

    function toggleMenu(event) {
        event.stopPropagation();

        const isOpen = !mobileMenu.classList.contains('is-open');

        mobileMenu.classList.toggle('is-open', isOpen);
        mobileMenu.setAttribute('aria-hidden', String(!isOpen));

        menuToggle.classList.toggle('is-active', isOpen);
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        menuToggle.setAttribute(
            'aria-label',
            isOpen ? 'Close navigation menu' : 'Open navigation menu'
        );

        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    menuToggle.addEventListener('click', toggleMenu);

    // About, Get Involved, Learning Hub etc. dropdown
    mobileMenu
        .querySelectorAll('.mobile-group-toggle')
        .forEach(function (button) {
            button.addEventListener('click', function () {
                const group = button.nextElementSibling;

                if (
                    !group ||
                    !group.classList.contains('mobile-group-links')
                ) {
                    return;
                }

                const willOpen = !group.classList.contains('is-open');

                // Ek time par sirf ek dropdown open
                mobileMenu
                    .querySelectorAll('.mobile-group-links.is-open')
                    .forEach(function (otherGroup) {
                        if (otherGroup !== group) {
                            otherGroup.classList.remove('is-open');

                            const otherButton = otherGroup.previousElementSibling;

                            if (otherButton) {
                                otherButton.setAttribute('aria-expanded', 'false');
                            }
                        }
                    });

                group.classList.toggle('is-open', willOpen);
                button.setAttribute('aria-expanded', String(willOpen));
            });
        });

    // Kisi link par click hone par menu close
    mobileMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeMenu);
    });

    // Desktop width par menu close
    window.addEventListener(
        'resize',
        function () {
            if (window.innerWidth >= 1181) {
                closeMenu();
            }
        },
        { passive: true }
    );

    // Bahar click karne par menu close
    document.addEventListener('click', function (event) {
        if (
            mobileMenu.classList.contains('is-open') &&
            !menuToggle.contains(event.target) &&
            !mobileMenu.contains(event.target)
        ) {
            closeMenu();
        }
    });

    // Escape key par close
    document.addEventListener('keydown', function (event) {
        if (
            event.key === 'Escape' &&
            mobileMenu.classList.contains('is-open')
        ) {
            closeMenu();
            menuToggle.focus();
        }
    });

    // 4. Dropdown Menu Logic with touch support
    document.querySelectorAll('.nav-item.has-dropdown').forEach(function (item) {
        const trigger = item.querySelector('.dropdown-trigger');
        const menu = item.querySelector('.dropdown-menu');
        if (!trigger || !menu) return;

        const viewport = getViewportSize();

        // Desktop: hover events
        if (!viewport.isMobile) {
            item.addEventListener('mouseenter', () => {
                trigger.setAttribute('aria-expanded', 'true');
                menu.classList.add('is-open');
            });
            item.addEventListener('mouseleave', () => {
                trigger.setAttribute('aria-expanded', 'false');
                menu.classList.remove('is-open');
            });
        }

        // Mobile/Touch: click events
        trigger.addEventListener('click', function (e) {
            e.preventDefault();
            const isOpen = menu.classList.toggle('is-open');
            trigger.setAttribute('aria-expanded', isOpen);
        });

        // Close dropdown when clicking menu items
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('is-open');
                trigger.setAttribute('aria-expanded', 'false');
            });
        });
    });

    // Reinitialize dropdown behavior on resize
    let dropdownResizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(dropdownResizeTimeout);
        dropdownResizeTimeout = setTimeout(function () {
            // Close all dropdowns on resize
            document.querySelectorAll('.dropdown-menu.is-open').forEach(menu => {
                menu.classList.remove('is-open');
                const trigger = menu.closest('.nav-item.has-dropdown')?.querySelector('.dropdown-trigger');
                if (trigger) trigger.setAttribute('aria-expanded', 'false');
            });
        }, 250);
    }, { passive: true });
}
