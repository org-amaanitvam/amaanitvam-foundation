(function () {
  const init = () => {
    const socialLinks = {
      'Instagram': 'https://www.instagram.com/amaanitvamfoundation',
      'Facebook': 'https://www.facebook.com/people/Amaanitvam-Foundation/61583427622759/',
      'Email': 'mailto:admin@amaanitvam.org'
    };

    document.querySelectorAll('.social-card').forEach(card => {
      const platform = card.querySelector('h3')?.textContent.trim();
      const url = socialLinks[platform];
      if (!url) return;

      card.style.cursor = 'pointer';

      card.addEventListener('click', () => {
        if (url.startsWith('mailto:')) {
          window.location.href = url;
        } else {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      });
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();