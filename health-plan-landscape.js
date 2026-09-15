// A company can intentionally appear in more than one functional bucket.
const LOGOS = '/assets/health-plan-logos/';
const EXPANSION = typeof HealthcareData === 'undefined' ? null : HealthcareData;
const BRANDS = {
  uhg: ['UnitedHealth Group','uhg.svg','https://www.unitedhealthgroup.com'],
  uhc: ['UnitedHealthcare','uhc.svg','https://www.uhc.com'],
  cvs: ['CVS Health','cvs.svg','https://www.cvshealth.com'],
  aetna: ['Aetna','aetna.svg','https://www.aetna.com'],
  cignagroup: ['The Cigna Group','cignagroup.svg','https://www.thecignagroup.com'],
  cigna: ['Cigna Healthcare','cigna.svg','https://www.cigna.com'],
  elevance: ['Elevance Health','elevance.svg','https://www.elevancehealth.com'],
  anthem: ['Anthem','anthem.svg','https://www.anthem.com'],
  humana: ['Humana','humana.png','https://www.humana.com'],
  kaiser: ['Kaiser Permanente','kaiser.svg','https://healthy.kaiserpermanente.org'],
  carelon: ['Carelon','carelon.svg','https://www.carelon.com'],
  evernorth: ['Evernorth','evernorth.svg','https://www.evernorth.com'],
  optum: ['Optum','optum.svg','https://www.optum.com'],
  centerwell: ['CenterWell','centerwell.svg','https://www.centerwell.com'],
  centerwellpharmacy: ['CenterWell Pharmacy','centerwellpharmacy.svg','https://www.centerwellpharmacy.com'],
  umr: ['UMR','umr.png','https://www.umr.com'],
  meritain: ['Meritain Health','meritain.png','https://www.meritain.com'],
  optumrx: ['Optum Rx','optumrx.svg','https://www.optumrx.com'],
  caremark: ['CVS Caremark','cvs-caremark.png','https://www.caremark.com'],
  express: ['Express Scripts','express-scripts.png','https://www.express-scripts.com'],
  carelonrx: ['CarelonRx','carelonrx.svg','https://www.carelonrx.com'],
  prime: ['Prime Therapeutics','prime.png','https://www.primetherapeutics.com'],
  gyde: ['Gyde','gyde.svg','https://www.gydehealth.ai'],
  corridor: ['Corridor','corridor.svg','https://corridoradvisors.com'],
  aon: ['Aon','aon.svg','https://www.aon.com'],
  marsh: ['Marsh','marsh.svg','https://www.marsh.com'],
  wtw: ['WTW','wtw.svg','https://www.wtwco.com/en-us'],
  gallagher: ['Gallagher','gallagher.png','https://www.ajg.com/us/'],
  lockton: ['Lockton','lockton.svg','https://global.lockton.com/us/en'],
  usi: ['USI Insurance Services','usi.png','https://www.usi.com/employee-benefits/'],
  hub: ['HUB International','hub.png','https://www.hubinternational.com/products/employee-benefits/'],
  bbrown: ['Brown & Brown','bbrown.jpg','https://us.bbrown.com/'],
  sunlife: ['Sun Life','sunlife.svg','https://www.sunlife.com'],
  voya: ['Voya','voya.svg','https://www.voya.com/workplace-solutions/stop-loss-insurance'],
  symetra: ['Symetra','symetra.webp','https://www.symetra.com/our-products/employers/stop-loss/'],
  hm: ['HM Insurance Group','hm.png','https://www.hmig.com'],
  tmhcc: ['Tokio Marine HCC','tmhcc.png','https://www.tmhcc.com/en-us'],
  amwins: ['Amwins','amwins.svg','https://www.amwins.com/solutions/benefits/self-funded'],
  ryan: ['Ryan Specialty','ryan.svg','https://ryanspecialty.com'],
  rsbenefits: ['Ryan Specialty Benefits','rsbenefits.png','https://rsbenefits.com'],
  bcs: ['BCS Financial','bcs.svg','https://bcsf.com'],
  mrm: ['Medical Risk Managers','mrm.svg','https://www.mrmstoploss.com'],
  pareto: ['ParetoHealth','pareto.svg','https://paretohealth.com'],
  arlo: ['Arlo','arlo.svg','https://www.joinarlo.com'],
  writewise: ['WriteWise','writewise.svg','https://www.writewise.com'],
  roundstone: ['Roundstone','roundstone.svg','https://www.roundstoneinsurance.com'],
  angle: ['Angle Health','angle.svg','https://www.anglehealth.com'],
  firefly: ['Firefly Health','firefly.svg','https://www.fireflyhealth.com'],
  curative: ['Curative','curative.svg','https://curative.com'],
  rivendell: ['Rivendell','rivendell.svg','https://rivendell.health'],
  vivian: ['Vivian','vivian.svg','https://vivianchoice.com'],
  prescience: ['Prescience','prescience.svg','https://www.getprescience.com'],
  centivo: ['Centivo','centivo.svg','https://centivo.com'],
  collective: ['Collective Health','collective.svg','https://collectivehealth.com'],
  trueclaim: ['TrueClaim','trueclaim.svg','https://www.trytrueclaim.com'],
  yuzu: ['Yuzu Health','yuzu.png','https://www.yuzu.health'],
  thatch: ['Thatch','thatch.svg','https://thatch.ai'],
  paytient: ['Paytient','paytient.svg','https://www.paytient.com'],
  helm: ['Helm','helm.svg','https://www.helmhealth.com'],
  truemed: ['Truemed','truemed.svg','https://www.truemed.com'],
  nomi: ['Nomi Health','nomi.svg','https://www.nomihealth.com'],
  garner: ['Garner','garner.svg','https://www.getgarner.com'],
  turquoise: ['Turquoise Health','turquoise.svg','https://turquoise.health'],
  oneimaging: ['OneImaging','oneimaging.svg','https://www.oneimaging.com'],
  worldclass: ['World Class Health','worldclass.svg','https://www.worldclasshealth.com'],
  aligned: ['Aligned Marketplace','aligned.svg','https://www.alignedmarketplace.com'],
  counsel: ['Counsel Health','counsel.svg','https://www.counselhealth.com'],
  milu: ['Milu Health','milu.svg','https://www.miluhealth.com'],
  smithrx: ['SmithRx','smithrx.svg','https://www.smithrx.com'],
  aradigm: ['Aradigm','aradigm.webp','https://www.aradigmhealth.com'],
  judi: ['Judi Health','judi.webp','https://www.judi.health'],
  rightway: ['Rightway','rightway.svg','https://www.rightwayhealthcare.com'],
  photon: ['Photon','photon.svg','https://www.photon.health'],
  quantum: ['Quantum Health','quantum.svg','https://www.quantum-health.com'],
  transcarent: ['Transcarent','transcarent.webp','https://transcarent.com'],
  zelis: ['Zelis','zelisp.svg','https://www.zelis.com'],
  oscar: ['Oscar Health','oscar.svg','https://www.hioscar.com/individuals'],
  clover: ['Clover Health','clover.svg','https://www.cloverhealth.com'],
  counterpart: ['Counterpart Health','counterpart.svg','https://www.counterparthealth.com'],
  devoted: ['Devoted Health','devoted.svg','https://www.devoted.com'],
  alignment: ['Alignment Health','alignment.webp','https://www.alignmenthealth.com'],
  centene: ['Centene','centene.jpg','https://www.centene.com'],
  ambetter: ['Ambetter Health','ambetter.png','https://www.ambetterhealth.com'],
  wellcare: ['Wellcare','wellcare.png','https://www.wellcare.com'],
  molina: ['Molina Healthcare','molina.svg','https://www.molinahealthcare.com'],
  hcsc: ['Health Care Service Corporation','hcsc.svg','https://www.hcsc.com'],
  healthspring: ['HealthSpring','healthspring.svg','https://www.healthspring.com'],
  guidewell: ['GuideWell','guidewell.png','https://www.guidewell.com'],
  floridablue: ['Florida Blue','floridablue.svg','https://www.floridablue.com'],
  highmark: ['Highmark','highmark.svg','https://www.highmark.com'],
  cambia: ['Cambia Health Solutions','cambia.svg','https://www.cambiahealth.com'],
  regence: ['Regence','regence.png','https://www.regence.com'],
  bcbsnd: ['Blue Cross Blue Shield of North Dakota','bcbsnd.png','https://www.bcbsnd.com'],
  bcbsmi: ['Blue Cross Blue Shield of Michigan','bcbsmi.svg','https://www.bcbsm.com'],
  blueshieldca: ['Blue Shield of California','blueshieldca.svg','https://www.blueshieldca.com'],
  ibx: ['Independence Blue Cross','ibx.svg','https://www.ibx.com'],
  carefirst: ['CareFirst BlueCross BlueShield','carefirst.svg','https://www.carefirst.com'],
  premera: ['Premera Blue Cross','premera.svg','https://www.premera.com'],
  bcbsnc: ['Blue Cross and Blue Shield of North Carolina','bcbsnc.jpg','https://www.bluecrossnc.com'],
  bcbsma: ['Blue Cross Blue Shield of Massachusetts','bcbsma.svg','https://www.bluecrossma.org'],
  horizon: ['Horizon Blue Cross Blue Shield of New Jersey','horizon.png','https://www.horizonblue.com'],
  bcbsmn: ['Blue Cross and Blue Shield of Minnesota','bcbsmn.svg','https://www.bluecrossmn.com'],
  bcbssc: ['BlueCross BlueShield of South Carolina','bcbssc.svg','https://www.southcarolinablues.com'],
  bcbsten: ['BlueCross BlueShield of Tennessee','bcbsten.svg','https://www.bcbst.com'],
  cotiviti: ['Cotiviti','cotiviti.png','https://www.cotiviti.com'],
  cognizant: ['Cognizant','cognizant.svg','https://www.cognizant.com'],
  trizetto: ['TriZetto',null,'https://www.cognizant.com/us/en/industries/healthcare-technology-solutions/trizetto','product'],
  healthedge: ['HealthEdge','healthedge.png','https://healthedge.com'],
  availity: ['Availity','availity.svg','https://www.availity.com'],
  aledade: ['Aledade','aledade.webp','https://aledade.com'],
  agilon: ['agilon health','agilon.svg','https://www.agilonhealth.com'],
  privia: ['Privia Health','privia.png','https://www.priviahealth.com'],
  astrana: ['Astrana Health','astrana.svg','https://www.astranahealth.com'],
  pearl: ['Pearl Health','pearl.png','https://pearlhealth.com'],
  chenmed: ['ChenMed','chenmed.svg','https://www.chenmed.com'],
  oakstreet: ['Oak Street Health','oakstreet.svg','https://www.oakstreethealth.com'],
  signify: ['Signify Health','signify.jpg','https://www.signifyhealth.com'],
  archwell: ['ArchWell Health','archwell.svg','https://archwellhealth.com'],
  cityblock: ['Cityblock Health','cityblock.svg','https://www.cityblock.com'],
  waymark: ['Waymark','waymark.svg','https://www.waymarkcare.com'],
  somatus: ['Somatus','somatus.png','https://somatus.com'],
  monogram: ['Monogram Health','monogram.svg','https://www.monogramhealth.com'],
  strive: ['Strive Health','strive.svg','https://strivehealth.com'],
  thyme: ['Thyme Care','thyme.svg','https://www.thymecare.com'],
  evolent: ['Evolent','evolent.png','https://www.evolent.com'],
  evicore: ['EviCore by Evernorth','evicore.svg','https://www.evicore.com'],
  cohere: ['Cohere Health','cohere.svg','https://www.coherehealth.com'],
  innovaccer: ['Innovaccer','innovaccer.svg','https://innovaccer.com'],
  arcadia: ['Arcadia','arcadia.svg','https://arcadia.io'],
  lightbeam: ['Lightbeam Health Solutions','lightbeam.svg','https://lightbeamhealth.com'],
  reveleer: ['Reveleer','reveleer.svg','https://www.reveleer.com'],
  ehealth: ['eHealth','ehealth.png','https://www.ehealthinsurance.com'],
  gohealth: ['GoHealth','gohealth.webp','https://www.gohealth.com'],
  selectquote: ['SelectQuote','selectquote.svg','https://www.selectquote.com'],
  integrity: ['Integrity','integrity.svg','https://integrity.com'],
  nationsbenefits: ['NationsBenefits','nationsbenefits.svg','https://www.nationsbenefits.com'],
  papa: ['Papa','papa.png','https://www.papa.com'],
  rxbenefits: ['RxBenefits','rxbenefits.svg','https://www.rxbenefits.com'],
  navitus: ['Navitus','navitus.svg','https://navitus.com'],
  ssm: ['SSM Health','ssm.png','https://www.ssmhealth.com'],
  medimpact: ['MedImpact','medimpact.svg','https://www.medimpact.com'],
  liviniti: ['Liviniti','liviniti.svg','https://www.liviniti.com'],
  empirx: ['EmpiRx Health','empirx.png','https://www.empirxhealth.com'],
  affirmedrx: ['AffirmedRx','affirmedrx.webp','https://affirmedrx.com'],
  rxsense: ['RxSense','rxsense.svg','https://www.rxsense.com'],
  lumicera: ['Lumicera','lumicera.svg','https://www.lumicera.com'],
  archimedes: ['Archimedes','archimedes.png','https://www.archimedesrx.com'],
  lumeris: ['Lumeris','lumeris.svg','https://www.lumeris.com'],
  essence: ['Essence Healthcare','essence.svg','https://www.essencehealthcare.com'],
  scan: ['SCAN Health Plan','scan.png','https://www.scanhealthplan.com'],
  healthfirst: ['Healthfirst','healthfirst.svg','https://healthfirst.org'],
  wellvana: ['Wellvana','wellvana.svg','https://wellvana.com'],
  vytalize: ['Vytalize Health','vytalize.png','https://www.vytalizehealth.com'],
  highmarkhealth: ['Highmark Health','highmarkhealth.svg','https://www.highmarkhealth.org'],
  ahn: ['Allegheny Health Network','ahn.svg','https://www.ahn.org'],
  careallies: ['CareAllies','careallies.jpg','https://www.careallies.com'],
  amazon: ['Amazon','amazon.svg','https://www.aboutamazon.com'],
  onemedical: ['One Medical','onemedical.svg','https://www.onemedical.com'],
  teladoc: ['Teladoc Health','teladoc.svg','https://www.teladochealth.com'],
  accolade: ['Accolade','accolade.png','https://www.accolade.com'],
  omada: ['Omada Health','omada.png','https://www.omadahealth.com'],
  hinge: ['Hinge Health','hinge.svg','https://www.hingehealth.com'],
  included: ['Included Health','included.svg','https://includedhealth.com'],
  headspace: ['Headspace','headspace.svg','https://organizations.headspace.com'],
  mosaic: ['Mosaic Health','mosaic.svg','https://mosaichealth.com'],
  apree: ['apree health','apree.svg','https://apreehealth.com'],
  castlight: ['Castlight Health','castlight.svg','https://www.castlighthealth.com'],
  vera: ['Vera Whole Health','vera.svg','https://www.verawholehealth.com'],
  caremore: ['CareMore Health','caremore.png','https://www.caremore.com'],
  millennium: ['Millennium Physician Group','millennium.svg','https://millenniumphysician.com'],
};

if (EXPANSION) for (const [id, brand] of Object.entries(EXPANSION.newBrands)) BRANDS[id] = [brand.name, brand.logo, brand.website];
const pair = (parent, child, note = '', relationship = 'owns') => ({ parent, id: child, note, relationship });
const marked = (id, note) => ({ id, note });
const BUCKETS = {
  brokers: ['gyde','corridor','aon',marked('marsh','Includes former Mercer'),'wtw','gallagher','lockton','usi','hub','bbrown'],
  benefits: [marked('thatch','ICHRA'),marked('collective','Benefits platform'),marked('paytient','Health payment accounts')],
  'individual-distribution': ['ehealth','gohealth','selectquote',marked('integrity','Distribution / agent platform')],
  risk: ['sunlife','voya','symetra','hm','tmhcc',marked('uhc','Stop-loss'),marked('cigna','Stop-loss')],
  mgu: [marked('arlo','MGU'),pair('ryan','rsbenefits','Includes former AccuRisk'),pair('bcs','mrm','Stop-loss MGU'),marked('amwins','Intermediary · former Stealth')],
  captive: [marked('roundstone','Group captives'),marked('pareto','Benefits captives'),marked('tmhcc','Captive stop-loss'),marked('writewise','Rx guarantees')],
  'incumbent-plans': [pair('uhg','uhc'),pair('cvs','aetna'),pair('cignagroup','cigna'),pair('elevance','anthem'),'kaiser',marked('hcsc','Blues in five states')],
  'challenger-plans': ['angle','firefly','curative','rivendell','vivian','prescience','centivo',marked('arlo','Employer plans')],
  'individual-plans': ['oscar',pair('centene','ambetter'),'molina','kaiser','hcsc','floridablue','carefirst','blueshieldca'],
  'medicare-plans': [pair('uhg','uhc'),'humana',pair('cvs','aetna'),pair('elevance','anthem'),pair('hcsc','healthspring'),pair('centene','wellcare'),'kaiser','molina','clover','devoted','alignment','highmark','carefirst',marked('essence','MA plan · Lumeris-enabled'),'scan','healthfirst'],
  'medicaid-plans': ['centene','molina',marked('uhc','Community Plan'),marked('elevance','Wellpoint / local plans'),marked('aetna','Aetna Better Health'),marked('carefirst','Community Health Plan'),marked('horizon','Horizon NJ Health'),'healthfirst'],
  'blues-plans': [pair('elevance','anthem','Selected Blues licensees'),marked('hcsc','BCBS IL · MT · NM · OK · TX'),'highmark',pair('guidewell','floridablue'),pair('cambia','regence','ID · OR · UT · WA','affiliated with'),pair('cambia','bcbsnd','Affiliated since 2026','affiliated with'),marked('bcbsmi','Michigan'),marked('blueshieldca','California · not Anthem'),marked('ibx','Philadelphia region'),marked('carefirst','MD · DC · parts of VA'),marked('premera','Washington · Alaska'),marked('bcbsnc','North Carolina'),marked('bcbsma','Massachusetts'),marked('horizon','New Jersey'),marked('bcbsmn','Minnesota'),marked('bcbssc','South Carolina'),marked('bcbsten','Tennessee')],
  'incumbent-tpa': [pair('uhg','umr'),pair('cvs','meritain'),pair('cignagroup','cigna','ASO'),pair('elevance','anthem','ASO')],
  'challenger-tpa': ['trueclaim','yuzu','collective',marked('judi','Judi Care / Judi Cloud')],
  'core-platforms': [pair('cognizant','trizetto','Facets / QNXT','offers'),marked('healthedge','HealthRules Payer'),marked('judi','Judi Cloud')],
  'incumbent-pbm': [pair('uhg','optumrx'),pair('cvs','caremark'),pair('cignagroup','express','via Evernorth'),pair('elevance','carelonrx')],
  'challenger-pbm': ['smithrx','rightway',marked('judi','Judi Rx · formerly Capital Rx'),marked('prime','Owned by participating Blues'),pair('ssm','navitus','Co-owned with Costco','co-owns'),'medimpact','liviniti','empirx','affirmedrx'],
  'rx-optimization': [marked('rxbenefits','PBO · contracting + clinical services')],
  'rx-technology': [marked('rxsense','RxAgile · administration technology'),marked('judi','Judi Cloud')],
  claims: ['trueclaim','yuzu',marked('judi','Unified claims'),marked('helm','Dynamic copays'),'zelis'],
  'payment-integrity': ['cotiviti',marked('healthedge','Source'),marked('optum','Payment integrity')],
  connectivity: ['availity',marked('cognizant','TriZetto connectivity'),'zelis'],
  payments: [marked('thatch','ICHRA funding'),'paytient',marked('truemed','HSA / FSA eligibility')],
  network: ['uhc','aetna','cigna','anthem','hcsc','highmark','carefirst'],
  'direct-network': ['nomi','garner',marked('turquoise','Price transparency'),'oneimaging','worldclass','aligned'],
  'incumbent-care': [pair('uhg','optum'),pair('elevance','carelon'),pair('cignagroup','evernorth'),pair('humana','centerwell'),pair('highmarkhealth','ahn'),pair('hcsc','careallies','Provider enablement')],
  'plan-care-management': [marked('aetna','Aetna One · internal care management'),marked('highmark','Plan care management'),marked('hcsc','Health care management'),marked('molina','Care / population management')],
  'challenger-care': ['firefly','aligned','counsel','milu','rightway','quantum','centivo',pair('transcarent','accolade','Acquired 2025'),'included',pair('mosaic','castlight','via apree health')],
  'care-programs': [marked('teladoc','Chronic care · includes Livongo'),marked('omada','Cardiometabolic / MSK'),marked('hinge','Musculoskeletal care'),marked('headspace','Behavioral care · formerly Ginger'),marked('optum','Behavioral Care · includes AbleTo'),marked('included','Virtual care'),pair('amazon','onemedical','Primary / virtual care')],
  dispensing: [pair('uhg','optumrx'),pair('cvs','caremark'),pair('cignagroup','express','via Evernorth'),pair('humana','centerwellpharmacy'),pair('navitus','lumicera','Specialty pharmacy')],
  'rx-infrastructure': [marked('photon','Prescription routing')],
  'specialty-drugs': [pair('navitus','archimedes','Specialty drug management'),marked('aradigm','Cell & gene therapy'),marked('writewise','Rx risk / guarantees')],
  'risk-quality': [marked('cotiviti','Risk adjustment / quality'),'reveleer','lightbeam',pair('cvs','signify','In-home evaluations')],
  'utilization-management': [pair('cignagroup','evicore','via Evernorth'),marked('carelon','Medical benefits management'),'evolent','cohere'],
  'supplemental-benefits': [marked('nationsbenefits','OTC / food / benefit platform'),marked('papa','Companionship / social support')],
  'vbc-primary': [pair('cvs','oakstreet'),pair('humana','centerwell','Senior primary care'),pair('uhg','optum','Risk-bearing care groups'),'chenmed','archwell','kaiser',pair('amazon','onemedical','Senior Health · formerly Iora'),pair('mosaic','vera','via apree · advanced primary care'),pair('mosaic','caremore','Complex / senior care'),pair('mosaic','millennium','Physician-led care')],
  'vbc-enablement': [marked('aledade','ACO / multi-payer enablement'),marked('agilon','Physician risk partnerships'),marked('privia','Physician network / ACOs'),marked('astrana','Care networks / delegated risk'),marked('pearl','Primary-care enablement'),'lumeris','wellvana','vytalize',pair('hcsc','careallies'),pair('mosaic','apree','Elevance / CD&R joint venture')],
  'vbc-specialty': [marked('somatus','Kidney / heart care'),marked('monogram','Polychronic / kidney care'),marked('strive','Kidney care'),marked('thyme','Oncology'),'evolent',marked('cityblock','Medicaid / complex care'),marked('waymark','Medicaid community care')],
  'vbc-technology': ['innovaccer','arcadia','lightbeam','reveleer',pair('clover','counterpart','Clinical decision support')],
};

if (EXPANSION) {
  for (const section of EXPANSION.sections) for (const category of section.categories) {
    BUCKETS[category.id] = category.entries.map(entry => Array.isArray(entry) ? marked(entry[0], entry[1]) : entry);
  }
  BUCKETS['individual-distribution'].push(marked('healthsherpa', 'ACA quoting & enrollment'));
}

// Provenance is separate from market positioning: a16z is not an AI certification.
const A16Z_BRANDS = new Set([
  'gyde','corridor','arlo','writewise','angle','firefly','curative','rivendell','vivian','prescience',
  'trueclaim','yuzu','smithrx','aradigm','judi','rightway','thatch','paytient','helm','truemed',
  'nomi','garner','turquoise','oneimaging','worldclass','aligned','counsel','milu','photon',
]);
const STARTUP_BRANDS = new Set([...A16Z_BRANDS,'collective','centivo','transcarent',
  'oscar','clover','counterpart','devoted','alignment','aledade','agilon','privia','pearl',
  'archwell','cityblock','waymark','somatus','monogram','strive','thyme','cohere','innovaccer','papa',
  'affirmedrx','rxsense','wellvana','vytalize','omada','hinge','included','headspace',
]);
const INCUMBENT_BRANDS = new Set([
  'uhg','uhc','cvs','aetna','cignagroup','cigna','elevance','anthem','humana','kaiser','carelon',
  'evernorth','optum','centerwell','centerwellpharmacy','umr','meritain','optumrx','caremark',
  'express','carelonrx','prime','aon','sunlife','roundstone','quantum','zelis',
  'marsh','wtw','gallagher','lockton','usi','hub','bbrown','voya','symetra','hm','tmhcc',
  'amwins','ryan','rsbenefits','bcs','mrm','pareto',
  'centene','ambetter','wellcare','molina','hcsc','healthspring','guidewell','floridablue',
  'highmark','cambia','regence','bcbsnd','bcbsmi','blueshieldca','ibx','carefirst','premera',
  'bcbsnc','bcbsma','horizon','bcbsmn','bcbssc','bcbsten','cotiviti','cognizant','trizetto',
  'healthedge','availity','astrana','chenmed','oakstreet','signify','evolent','evicore',
  'arcadia','lightbeam','reveleer','ehealth','gohealth','selectquote','integrity','nationsbenefits',
  'rxbenefits','navitus','ssm','medimpact','liviniti','empirx','lumicera','archimedes','lumeris',
  'essence','scan','healthfirst','highmarkhealth','ahn','careallies','amazon','onemedical','teladoc',
  'accolade','mosaic','apree','castlight','vera','caremore','millennium',
]);
const WHITE_LOGOS = new Set(['kaiser','curative','nomi','milu','rightway','oneimaging','corridor','cigna','marsh','lockton','ryan',
  'clover','cityblock','astrana','evolent','evicore','availity','innovaccer','arcadia','bcbsmn',
  'essence','highmarkhealth',
]);
const CROPPED_CANVASES = new Set(['humana','symetra']);
if (EXPANSION) for (const [id, brand] of Object.entries(EXPANSION.newBrands)) {
  (brand.cohort === 'startup' ? STARTUP_BRANDS : INCUMBENT_BRANDS).add(id);
  if (brand.white) WHITE_LOGOS.add(id);
}

function makeMark(id, note = '', className = '', tag = 'button') {
  const brand = BRANDS[id];
  if (!brand) throw new Error('Unknown company: ' + id);
  const [name, file, url] = brand;
  const link = document.createElement(tag);
  link.className = 'mark ' + className;
  if (tag === 'button') link.type = 'button';
  link.dataset.company = id;
  const cohort = STARTUP_BRANDS.has(id) ? 'startup' : INCUMBENT_BRANDS.has(id) ? 'incumbent' : null;
  if (!cohort) throw new Error('Missing company cohort: ' + id);
  const cohortLabel = cohort === 'startup' ? 'AI / tech startup' : 'Incumbent';
  link.dataset.cohort = cohort;
  link.dataset.source = A16Z_BRANDS.has(id) ? 'a16z' : 'expanded';
  link.title = name + (note ? ' — ' + note : '');
  link.setAttribute('aria-label', link.title + ' · ' + cohortLabel + (A16Z_BRANDS.has(id) ? ' · a16z source' : '') + (tag === 'button' ? ' (open entry details)' : ''));
  if (file) {
    const img = document.createElement('img');
    img.src = LOGOS + file + '?v=20260915-8';
    img.alt = name;
    img.decoding = 'async';
    if (WHITE_LOGOS.has(id)) img.classList.add('white-logo');
    if (CROPPED_CANVASES.has(id)) img.classList.add('padded-logo');
    if (id === 'thatch' || id === 'innovaccer' || id === 'medimpact' || EXPANSION?.newBrands[id]?.icon) {
      const wordmark = document.createElement('span');
      wordmark.className = 'icon-wordmark';
      img.classList.add('icon');
      wordmark.append(img, document.createTextNode(name));
      link.append(wordmark);
    } else link.append(img);
  } else {
    const text = document.createElement('span');
    text.className = brand[3] === 'product' ? 'product-name' : 'parent-name';
    text.textContent = name;
    link.append(text);
  }
  if (note) {
    const caption = document.createElement('small');
    caption.textContent = note;
    link.append(caption);
  }
  const badge = document.createElement('span');
  badge.className = 'cohort-tag ' + cohort;
  badge.textContent = cohortLabel;
  if (A16Z_BRANDS.has(id)) {
    const source = document.createElement('span');
    source.className = 'source-tag';
    source.textContent = 'a16z';
    badge.append(source);
  }
  link.append(badge);
  return link;
}

function makeEntry(entry, bucketId, index) {
  const item = typeof entry === 'string' ? { id: entry } : entry;
  const key = typeof bucketId === 'string' ? `${bucketId}--${item.id}--${index}` : null;
  if (!item.parent) {
    const mark = makeMark(item.id, item.note);
    if (key) mark.dataset.entry = key;
    mark.setAttribute('aria-controls', 'entry-panel');
    mark.setAttribute('aria-expanded', 'false');
    return mark;
  }
  const group = document.createElement('button');
  group.type = 'button';
  group.className = 'brand-pair';
  if (key) group.dataset.entry = key;
  group.setAttribute('aria-controls', 'entry-panel');
  group.setAttribute('aria-expanded', 'false');
  group.setAttribute('aria-label', BRANDS[entry.parent][0] + ' ' + entry.relationship + ' ' + BRANDS[entry.id][0] + (entry.note ? ' · ' + entry.note : '') + ' (open entry details)');
  const divider = document.createElement('span');
  divider.className = 'pair-line';
  divider.setAttribute('aria-hidden','true');
  group.append(makeMark(entry.parent, '', 'parent', 'span'), divider, makeMark(entry.id, entry.note, 'child', 'span'));
  return group;
}

if (EXPANSION && typeof window !== 'undefined') {
  const footer = document.querySelector('#map-poster .map-footer');
  for (const section of EXPANSION.sections) {
    const shell = document.createElement('section');
    shell.className = 'ecosystem-section';
    shell.id = section.id;
    shell.dataset.scope = section.scope;
    const heading = document.createElement('h2');
    heading.textContent = section.title;
    const note = document.createElement('p');
    note.className = 'ecosystem-note';
    note.textContent = section.description;
    const grid = document.createElement('div');
    grid.className = 'ecosystem-grid';
    for (const category of section.categories) {
      const block = document.createElement('section');
      block.className = 'subgroup';
      const title = document.createElement('h3');
      title.className = 'subhead';
      title.textContent = category.title;
      const marks = document.createElement('div');
      marks.className = 'marks';
      marks.dataset.bucket = category.id;
      block.append(title, marks);
      grid.append(block);
    }
    shell.append(heading, note, grid);
    footer.before(shell);
  }
}
for (const bucket of document.querySelectorAll('[data-bucket]')) {
  const entries = BUCKETS[bucket.dataset.bucket];
  if (!entries) throw new Error('Unknown map bucket: ' + bucket.dataset.bucket);
  bucket.replaceChildren(...entries.map((entry, index) => makeEntry(entry, bucket.dataset.bucket, index)));
}
const count = new Set([...document.querySelectorAll('[data-company]')].map(el => el.dataset.company)).size;
document.querySelector('#map-count').textContent = count + ' companies & brands';
document.querySelector('#print-map').addEventListener('click', () => window.print());
if (EXPANSION && typeof window !== 'undefined') {
  const titles = Object.fromEntries([...document.querySelectorAll('[data-bucket]')].map(bucket => [bucket.dataset.bucket, (bucket.previousElementSibling?.matches('h2,h3,h4') ? bucket.previousElementSibling : bucket.closest('.subgroup')?.querySelector('.subhead'))?.textContent]));
  window.HealthcareLandscape = { ...HealthcareModel.build(BRANDS, BUCKETS, EXPANSION, titles), brands: BRANDS };
}
