/**
 * ============================================================
 *  MODEL — Application Data & State
 *  Single source of truth for all content and UI state.
 *  Zero DOM access. Zero side effects.
 * ============================================================
 */

const AppModel = (() => {

  /* ─── PRODUCT DATA ─── */
  const product = {
    name:       'Two For One Twister',
    subtitle:   'Premium HDPE Pipes & Coils for Modern Infrastructure',
    priceRange: '₹4,80,000 – 7,90,000',
  };

  /* ─── CAROUSEL IMAGES ─── */
  const slides = [
    { src: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=600&fit=crop', alt: 'HDPE pipe installation view 1' },
    { src: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',    alt: 'HDPE pipe product view 2'     },
    { src: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&h=600&fit=crop', alt: 'Industrial pipe work view 3'  },
    { src: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop', alt: 'Pipe installation site view 4' },
    { src: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=800&h=600&fit=crop', alt: 'HDPE coil pipe view 5'         },
    { src: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop', alt: 'Pipe infrastructure view 6'   },
  ];

  /* ─── USE CASE CARDS ─── */
  const useCases = [
    { title: 'Fishnet Manufacturing',  desc: 'High-performance solutions for packaging yarn and reinforcement threads.', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=280&fit=crop' },
    { title: 'Agriculture Irrigation', desc: 'Efficient water delivery for large-scale agricultural irrigation.',        img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=280&fit=crop' },
    { title: 'Municipal Water Supply', desc: 'City-wide water distribution with certified leak-proof joints.',           img: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=280&fit=crop' },
    { title: 'Industrial Drainage',    desc: 'Robust pipes for chemical effluents with superior corrosion resistance.',  img: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=280&fit=crop' },
    { title: 'Gas Distribution',       desc: 'Underground gas pipeline solutions meeting all international standards.',  img: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=400&h=280&fit=crop' },
    { title: 'Mining & Construction',  desc: 'High-pressure rated pipes for demanding mining environments.',             img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=280&fit=crop' },
  ];

  /* ─── PROCESS TABS ─── */
  const processTabs = [
    { id: 'rawmaterial', label: 'Raw Material',   title: 'High-Grade Raw Material Selection',  desc: 'Only PE100-grade polyethylene with optimal molecular weight distribution is selected, ensuring every pipe meets the highest performance benchmarks.', points: ['PE100-grade resin only', 'Rigorous material testing'],              img: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=640&h=420&fit=crop' },
    { id: 'extrusion',   label: 'Extrusion',      title: 'Precision Extrusion Process',         desc: 'State-of-the-art extrusion machinery ensures consistent wall thickness and exact diameter across the entire pipe length with zero variance.',        points: ['Uniform wall thickness', 'Consistent pipe diameter'],               img: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=640&h=420&fit=crop' },
    { id: 'cooling',     label: 'Cooling',         title: 'Controlled Cooling System',           desc: 'Precision cooling baths maintain optimal temperatures to lock in dimensional stability and ensure structural integrity throughout every batch.',        points: ['Controlled bath temperature', 'Dimensional stability guaranteed'],   img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=640&h=420&fit=crop' },
    { id: 'sizing',      label: 'Sizing',          title: 'Precision Sizing & Calibration',      desc: 'Advanced vacuum sizing equipment delivers exact outer diameter and perfect roundness, meeting all international standards without compromise.',         points: ['Precise outer diameter', 'Perfect roundness guaranteed'],           img: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=640&h=420&fit=crop' },
    { id: 'quality',     label: 'Quality Control', title: 'Rigorous Quality Control',            desc: 'Every pipe undergoes comprehensive testing including hydrostatic pressure tests, dimensional checks, and material property verification.',             points: ['100% hydrostatic pressure tested', 'ISO-certified QC process'],     img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=640&h=420&fit=crop' },
    { id: 'marking',     label: 'Marking',         title: 'Permanent Identification Marking',    desc: 'Clear, indelible markings including all specifications, certification marks, and full traceability codes are applied to every pipe.',                 points: ['BIS/ISO certification marks', 'Complete traceability codes'],       img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=640&h=420&fit=crop' },
    { id: 'cutting',     label: 'Cutting',         title: 'Precision Cutting',                   desc: 'Automated cutting systems ensure clean, perfectly square cuts at exact lengths as specified per customer and project requirements.',                    points: ['Exact length specification', 'Burr-free square ends'],               img: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=640&h=420&fit=crop' },
    { id: 'packaging',   label: 'Packaging',       title: 'Safe Packaging & Dispatch',           desc: 'Pipes are carefully packaged to prevent transit damage, with full documentation, certification copies, and inspection reports in every shipment.',     points: ['Damage-free delivery assured', 'Full documentation included'],      img: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=640&h=420&fit=crop' },
  ];

  /* ─── FAQ ─── */
  const faqs = [
    { q: 'What is the purpose of HDPE pipes in infrastructure?',   a: 'HDPE pipes safely transport water, gas, chemicals, and slurries. They are valued for corrosion resistance, flexibility, and a proven 50+ year service life — ideal for municipal, agricultural, and industrial applications.' },
    { q: 'What are the key benefits of HDPE over metal pipes?',     a: 'HDPE pipes are lighter, fully corrosion-resistant, and cost significantly less to install and maintain. They offer superior flexibility, longer service life, and are more environmentally sustainable.' },
    { q: 'How are HDPE pipes joined together?',                     a: 'HDPE pipes join by butt fusion, electrofusion, or mechanical fittings. Butt fusion creates a permanent joint as strong as the pipe itself. Electrofusion suits field repairs and confined spaces.' },
    { q: 'What pressure ratings are available for your pipes?',     a: 'We offer pipes from PN 2.5 through PN 16. The PN rating indicates the maximum continuous operating pressure in bar at 20°C. Higher PN ratings correspond to thicker walls and greater capacity.' },
    { q: 'Are HDPE pipes certified safe for potable water supply?', a: 'Yes. Our pipes comply with IS 7634, ISO 4427, and ASTM D3035, and are certified safe for potable water transport. They do not leach any chemicals into the water supply.' },
  ];

  /* ─── TESTIMONIALS ─── */
  const testimonials = [
    { quote: 'Revolutionized our production efficiency. The consistent performance has been critical for our large-scale infrastructure applications.',    name: 'Johann Mueller',  role: 'Production Director',  initial: 'J' },
    { quote: 'Excellent support for specialized applications. Durability in harsh environments has significantly improved our operational quality.',       name: 'Carlos Mendoza',  role: 'Operations Manager',   initial: 'C' },
    { quote: 'Provides exact specifications every time. Their understanding of industrial requirements is exceptional — no compromises on quality.',       name: 'Rajesh Kumar',    role: 'Manufacturing Head',   initial: 'R' },
    { quote: 'Outstanding quality and reliability. The pipes have consistently exceeded our expectations under the most demanding site conditions.',       name: 'Arjun Sharma',    role: 'Project Engineer',     initial: 'A' },
  ];

  /* ─── PORTFOLIO ─── */
  const portfolio = [
    { title: 'HDPE Fittings & Accessories',        desc: 'Complete electrofusion and butt fusion fittings — elbows, tees, reducers, and couplers for seamless connections.',           img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=480&h=280&fit=crop' },
    { title: 'Professional Installation Services', desc: 'Expert installation and fusion welding ensuring regulatory compliance and long-term system reliability.',                     img: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=480&h=280&fit=crop' },
    { title: 'PE-RT Heating Pipes',                desc: 'Raised Temperature Resistance pipes for underfloor heating, radiator connections, and domestic hot water applications.',     img: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=480&h=280&fit=crop' },
  ];

  /*
   * RESPONSIVE BREAKPOINTS — Official Figma Specification
   * These drive the --section-padding-inline/block CSS custom properties
   * that every section inherits, ensuring pixel-perfect compliance.
   *
   * Screen ≥1600px / 1440px → 100px all sides, max-width 1240px
   * Screen ≥1200px          → 80px all sides
   * Screen ≥1080px          → 60px inline, 80px block
   * Screen ≥800px           → 48px inline, 80px block
   * Screen ≥360px (mobile)  → 16px inline, 48px block
   */
  const breakpoints = [
    { minWidth: 1440, paddingInline: 100, paddingBlock: 100 },
    { minWidth: 1200, paddingInline:  80, paddingBlock:  80 },
    { minWidth: 1080, paddingInline:  60, paddingBlock:  80 },
    { minWidth:  800, paddingInline:  48, paddingBlock:  80 },
    { minWidth:    0, paddingInline:  16, paddingBlock:  48 },
  ];

  /* ─── APPLICATION STATE ─── */
  const _state = {
    activeSlide:      0,
    activeTab:        'rawmaterial',
    openFaqIndex:     0,
    openModal:        null,
    isStickyVisible:  false,
    isMobileMenuOpen: false,
  };

  function getState(key) { return key ? _state[key] : Object.assign({}, _state); }
  function setState(key, value) { _state[key] = value; }

  /* ─── UTILITIES ─── */
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
  }

  /**
   * Get current breakpoint padding values based on window width.
   * @returns {{ paddingInline: number, paddingBlock: number }}
   */
  function getCurrentPadding() {
    const w = window.innerWidth;
    return breakpoints.find(bp => w >= bp.minWidth) || breakpoints[breakpoints.length - 1];
  }

  /* ─── PUBLIC API ─── */
  return {
    product, slides, useCases, processTabs, faqs, testimonials, portfolio,
    breakpoints, getState, setState, validateEmail, getCurrentPadding,
  };

})();