(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.HealthcareModel = api;
})(typeof window === 'undefined' ? this : window, function () {
  'use strict';
  const guides = {
    brokers: ['Employer benefits advisory', 'Helps employers evaluate benefit strategies, funding arrangements and service partners.', 'Employer HR, benefits and finance teams'],
    benefits: ['Benefits funding and purchasing', 'Supports benefit purchasing, individual-coverage funding or member payment arrangements. These are different roles within benefits buying.', 'Employers and benefits administrators'],
    'individual-distribution': ['Individual and Medicare distribution', 'Helps consumers and agents compare coverage and complete enrollment; distribution is distinct from underwriting insurance.', 'Consumers, agents and health plans'],
    risk: ['Risk-bearing medical stop-loss', 'Provides contractual protection for specified high claims in self-funded employer health plans.', 'Self-funded employers and benefit advisors'],
    mgu: ['Stop-loss underwriting and intermediation', 'Supports underwriting, placement or distribution of stop-loss arrangements. An intermediary is not automatically the insurance risk bearer.', 'Employers, brokers and stop-loss insurers'],
    captive: ['Captive and risk programs', 'Supports pooled or specialized employer risk arrangements. A captive manager, participating employer and insurer have different responsibilities.', 'Self-funded employers and benefit advisors'],
    'incumbent-plans': ['Employer and commercial health insurance', 'Provides employer medical coverage or administrative services. Fully insured and self-funded arrangements place claims risk with different parties.', 'Employers and covered employees'],
    'challenger-plans': ['Challenger employer health plans', 'Offers employer coverage or coordinated plan arrangements with a technology-led or alternative benefit model.', 'Employers and covered employees'],
    'individual-plans': ['Individual and ACA coverage', 'Offers individual or family health coverage, including ACA Marketplace products where available.', 'Individuals and families'],
    'medicare-plans': ['Medicare Advantage coverage', 'Offers private Medicare health-plan products. Availability, benefits and networks depend on county, contract and plan year.', 'Medicare-eligible members'],
    'medicaid-plans': ['Medicaid and CHIP managed care', 'Operates managed-care coverage under public-program contracts. Eligibility and benefits follow the relevant state program.', 'State agencies and eligible members'],
    'blues-plans': ['Regional Blue Cross Blue Shield coverage', 'An independent licensee or affiliated organization in the Blues system. Brand affiliation is not evidence of common ownership.', 'Members, employers and public-program purchasers'],
    'incumbent-tpa': ['Carrier-owned administration', 'Operates eligibility, claims and member-service functions for self-funded arrangements; administration is separate from assuming claims risk.', 'Self-funded employers'],
    'challenger-tpa': ['Independent administration and platforms', 'Supports health-plan operations through administrative services, software or both. Contract scope determines which party performs each function.', 'Employers, plans and benefits partners'],
    'core-platforms': ['Payer core-administration software', 'Supplies software for membership, benefits, claims and payer administration. A software vendor is not necessarily the operating TPA.', 'Health plans and administrators'],
    'incumbent-pbm': ['Payer-owned pharmacy-benefit management', 'Administers prescription benefits through a pharmacy-benefit business within a larger healthcare group.', 'Health plans and employer benefit purchasers'],
    'challenger-pbm': ['Pharmacy-benefit management', 'Administers prescription benefits and related network, clinical or cost-management services according to the purchaser agreement.', 'Health plans and employer benefit purchasers'],
    'rx-optimization': ['Pharmacy benefits optimization', 'Supports PBM contracting, clinical programs and service around pharmacy benefits. An optimizer is not interchangeable with the contracted PBM.', 'Employers and benefits advisors'],
    'rx-technology': ['Pharmacy-administration technology', 'Supplies software and infrastructure for prescription-benefit administration and claims processing.', 'PBMs, health plans and administrators'],
    claims: ['Claims pricing and payments', 'Supports medical claims processing, pricing, cost sharing or payment operations; capabilities differ by business.', 'Health plans and administrators'],
    'payment-integrity': ['Payment accuracy', 'Uses review, analytics and workflow controls to identify incorrect claims payments and support accurate reimbursement.', 'Health-plan payment-integrity teams'],
    connectivity: ['Payer-provider transactions', 'Connects eligibility, claims, authorizations and other administrative information across payer and provider systems.', 'Payers, providers and clearinghouses'],
    payments: ['Member funding and accounts', 'Supports benefit funding, payment accounts or qualifying healthcare purchases; these are not all insurance products.', 'Employers, plans and eligible members'],
    network: ['Broad provider access', 'Offers access to contracted provider networks through insurance or administrative arrangements.', 'Health plans, employers and members'],
    'direct-network': ['Direct contracting and selected care access', 'Supports alternative access, provider selection, transparent pricing or centers of excellence. These vendors do not all operate a broad insurance network.', 'Employers, plans and members'],
    'incumbent-care': ['Group-owned care and services', 'Shows care-delivery and service businesses within healthcare groups. The parent relationship is distinct from the insurance product.', 'Payers, employers, providers and patients'],
    'plan-care-management': ['Internal plan care management', 'Represents a health insurer’s own care-management capabilities, not an invented standalone service subsidiary.', 'Covered members and health-plan clinical teams'],
    'challenger-care': ['Care navigation and coordination', 'Helps members locate care, understand benefits and coordinate healthcare journeys through employer or health-plan programs.', 'Employers, plans and their members'],
    'care-programs': ['Virtual and condition-focused care', 'Provides virtual care or condition-specific programs. Delivering care does not automatically imply a downside-risk VBC contract.', 'Employers, plans and patients'],
    dispensing: ['Pharmacy dispensing and networks', 'Supports prescription fulfillment or pharmacy access, including specialty services where offered. Dispensing differs from benefit administration.', 'Patients, prescribers and benefit purchasers'],
    'rx-infrastructure': ['Prescription infrastructure', 'Provides technology that connects prescribing workflows with pharmacy fulfillment.', 'Prescribers, pharmacies and digital-health platforms'],
    'specialty-drugs': ['Specialty medication management', 'Supports specialty-drug access, clinical management or financial-risk arrangements. Not every specialist is a full-service PBM.', 'Payers and employer benefit purchasers'],
    'risk-quality': ['Risk adjustment and clinical information', 'Supports documentation, risk adjustment, clinical evaluation or quality-related workflows. Each company’s role differs; risk scores are not quality scores.', 'Health-plan risk and clinical teams'],
    'utilization-management': ['Utilization and medical-benefit management', 'Supports prior authorization, clinical review or specialty pathways on the payer side of the coverage process.', 'Health-plan clinical and utilization teams'],
    'supplemental-benefits': ['Supplemental benefits and social support', 'Provides benefit administration or nonmedical support through contracted programs. Availability depends on the plan and eligible population.', 'Health plans, employers and members'],
    'vbc-primary': ['Primary care in value-based arrangements', 'Delivers or supports coordinated primary care, often for seniors. The degree of financial risk depends on the specific contract.', 'Patients, payers and care partners'],
    'vbc-enablement': ['Physician and ACO enablement', 'Supports provider organizations with technology, operations and value-based contracts. Enablement is different from insurance coverage.', 'Physician groups, ACOs and health systems'],
    'vbc-specialty': ['Specialty and complex-population VBC', 'Coordinates care for complex populations or conditions and may support value-based contracts. Not every agreement involves capitation.', 'Payers and provider organizations'],
    'vbc-technology': ['Value-based care technology', 'Supplies data, analytics or clinical software supporting value-based care. Software alone does not make a vendor a risk-bearing provider.', 'ACOs, health systems, medical groups and payers']
  };
  const safeUrl = value => { try { const u = new URL(value); return u.protocol === 'https:' ? u.href : null; } catch { return null; } };
  function normalize(entry) {
    if (typeof entry === 'string') return { id: entry, note: '' };
    if (Array.isArray(entry)) return { id: entry[0], note: entry[1] || '' };
    return { ...entry, note: entry.note || '' };
  }
  const keyFor = (bucket, entry, index) => `${bucket}--${normalize(entry).id}--${index}`;
  function build(brands, buckets, data, titles = {}) {
    const categories = {};
    for (const [id, guide] of Object.entries(guides)) categories[id] = { id, title: titles[id] || guide[0], role: guide[0], description: guide[1], buyer: guide[2], scope: 'payers', section: 'Health plans & shared infrastructure' };
    for (const section of data.sections) for (const category of section.categories) categories[category.id] = { ...category, scope: section.scope, section: section.title };
    const entries = Object.entries(buckets).flatMap(([bucket, items]) => items.map((raw, index) => {
      const item = normalize(raw), brand = brands[item.id], category = categories[bucket];
      if (!brand || !category) throw new Error(`Uncatalogued entry ${bucket}:${item.id}`);
      const website = safeUrl(brand[2]);
      if (!website) throw new Error(`Missing safe website for ${item.id}`);
      const host = new URL(website).hostname.replace(/^www\./, '');
      const referenced = data.existingSources.filter(source => { try { const sourceHost = new URL(source.url).hostname.replace(/^www\./, ''); return sourceHost === host || sourceHost.endsWith('.' + host); } catch { return false; } });
      const sources = data.newBrands[item.id]?.sources || [{ title: brand[0] + ' — official overview', url: website }, ...referenced.slice(0, 3)];
      return { key: keyFor(bucket, item, index), bucket, company: item.id, parent: item.parent || null, parentName: item.parent ? brands[item.parent][0] : '', relationship: item.relationship || null, note: item.note, name: brand[0], website, summary: data.profiles[item.id], category, sources: sources.filter(s => safeUrl(s.url)), scope: category.scope };
    }));
    return { entries, categories };
  }
  function search(entries, query, scope = 'all') {
    const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
    return entries.filter(e => (scope === 'all' || (scope === 'providers' ? e.scope === 'providers' || e.scope === 'rcm' : e.scope === scope)) && terms.every(term => [e.name, e.parentName, e.note, e.summary, e.category.title, e.category.role, e.category.section].join(' ').toLocaleLowerCase().includes(term)));
  }
  return { guides, normalize, keyFor, build, search, safeUrl };
});
