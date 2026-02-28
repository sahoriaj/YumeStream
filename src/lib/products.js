/**
 * Products catalog.
 * downloadUrl and paypalId are resolved at runtime via secrets.js
 * so they NEVER appear in view-source.
 */
export const PRODUCTS = [
  {
    id: 'animeflix-single',
    name: 'AnimeFlix',
    subtitle: 'Single Domain License',
    description:
      'Full anime streaming website template with multi-server video player, membership system, episode management, and SEO-optimized responsive design.',
    price: 29,
    priceDisplay: '$29',
    badge: 'Best Seller',
    licenseType: 'single',
    licenseNote: '1 Domain — 1 License',
    features: [
      'Multi-server video player',
      'Membership & subscription system',
      'Episode & series management',
      'SEO optimized structure',
      'Mobile-first responsive',
      'Dark & Light theme',
      'Lifetime updates',
      'Priority support',
    ],
    paypalKey: '29',   // maps to getPaypalId29() in secrets.js
    color: '#3b9eff',
  },
  {
    id: 'animeflix-unlimited',
    name: 'AnimeFlix',
    subtitle: 'Unlimited Domain License',
    description:
      'Same full template — use it on as many domains as you need. Perfect for agencies and multi-project developers.',
    price: 199,
    priceDisplay: '$199',
    badge: 'Best Value',
    licenseType: 'unlimited',
    licenseNote: 'Unlimited Domains',
    features: [
      'Everything in Single License',
      'Unlimited domain deployments',
      'White-label rights',
      'Commercial use allowed',
      'Priority Telegram support',
      'Custom negotiation available',
    ],
    paypalKey: '199',  // maps to getPaypalId199() in secrets.js
    color: '#a855f7',
  },
]
