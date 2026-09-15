(() => {
  const EXPANSION = window.DIADOCHI_EXPANSION || { factions:{}, regions:{}, regionGroups:{}, cities:[], people:[], armies:[], snapshots:[], battles:{} };
  const FACTIONS = {
    argead: { name: 'Argead regency', color: '#315f9d', light: '#6d92c7' },
    antipater: { name: 'Antipater / Cassander', color: '#466c9f', light: '#83a2ca' },
    perdiccas: { name: 'Perdiccas', color: '#725494', light: '#a989c3' },
    eumenes: { name: 'Eumenes', color: '#8f6e42', light: '#c1a477' },
    antigonus: { name: 'Antigonus & Demetrius', color: '#b85a2f', light: '#e18c58' },
    ptolemy: { name: 'Ptolemy', color: '#9f3942', light: '#d76e73' },
    seleucus: { name: 'Seleucus', color: '#167a85', light: '#52b4b8' },
    lysimachus: { name: 'Lysimachus', color: '#657f3d', light: '#9db369' },
    pyrrhus: { name: 'Pyrrhus', color: '#725b9d', light: '#a991c5' },
    maurya: { name: 'Mauryan Empire', color: '#a27c2b', light: '#cfad57' },
    independent: { name: 'Independent / local rulers', color: '#6d7468', light: '#9ba093' },
  };
  Object.assign(FACTIONS, EXPANSION.factions);

  // Shared satrapy-scale cells. Adjacent snapshots reassign these cells instead of
  // drawing unrelated macro-polygons, so borders remain stable and legible over time.
  // Coordinates are editorial reconstructions based on the cited historical maps.
  const REGIONS = {
    macedonia: [[19.4,39.1],[19.55,39.7],[19.9,40.2],[20.35,40.6],[20.8,40.85],[21.25,41.15],[21.7,41.55],[22.25,41.75],[22.9,41.9],[23.5,41.75],[24.15,41.55],[24.65,41.2],[25.1,40.7],[24.95,40.2],[24.45,39.85],[23.8,39.55],[23.15,39.25],[22.45,39.05],[21.7,38.95],[20.9,38.95],[20.2,39.0]],
    hellas: [[20.2,35.0],[19.95,35.65],[20.15,36.2],[20.55,36.75],[20.75,37.3],[20.7,37.9],[21.05,38.35],[21.7,38.95],[22.45,39.05],[23.15,39.25],[23.8,39.55],[24.45,39.85],[25.0,39.55],[25.25,39.0],[25.15,38.35],[24.85,37.8],[24.4,37.25],[24.2,36.65],[23.9,36.0],[23.35,35.45],[22.7,35.05],[21.9,34.8],[21.1,34.8]],
    epirusCell: [[18.2,38.1],[18.35,38.8],[18.75,39.45],[19.3,40.05],[19.95,40.45],[20.6,40.55],[21.15,40.25],[21.35,39.7],[21.15,39.15],[20.75,38.6],[20.2,38.15],[19.55,37.85],[18.85,37.75]],
    thraceCell: [[24.8,39.65],[25.35,40.05],[25.8,40.45],[26.1,41.0],[26.25,41.55],[26.55,42.0],[27.15,42.35],[27.9,42.6],[28.7,42.75],[29.6,42.8],[30.55,42.7],[31.4,42.4],[32.0,42.0],[32.35,41.45],[32.25,40.9],[31.75,40.45],[31.05,40.15],[30.35,39.9],[29.55,39.7],[28.7,39.45],[27.8,39.35],[26.95,39.4],[26.2,39.55],[25.55,39.6]],
    asiaMinorWest: [[25.7,35.45],[26.0,36.0],[26.15,36.7],[26.05,37.35],[26.25,38.0],[26.35,38.75],[26.1,39.45],[26.2,40.05],[26.6,40.55],[27.2,40.9],[28.0,41.05],[28.8,41.0],[29.55,40.8],[30.1,40.4],[30.45,39.85],[30.25,39.25],[29.95,38.65],[29.7,38.05],[29.85,37.45],[30.1,36.85],[29.85,36.25],[29.35,35.8],[28.65,35.45],[27.9,35.25],[27.1,35.25],[26.35,35.35]],
    phrygia: [[29.7,38.05],[29.95,38.65],[30.25,39.25],[30.45,39.85],[30.1,40.4],[30.65,40.75],[31.35,41.0],[32.15,41.15],[33.0,41.1],[33.75,40.85],[34.2,40.35],[34.35,39.75],[34.1,39.15],[33.65,38.7],[33.1,38.25],[32.45,37.85],[31.75,37.55],[31.05,37.35],[30.35,37.45]],
    lyciaPamphylia: [[26.0,35.1],[26.8,34.85],[27.65,34.75],[28.55,34.85],[29.35,35.15],[29.85,35.6],[30.1,36.15],[30.35,37.45],[31.05,37.35],[31.75,37.55],[32.45,37.85],[33.1,38.25],[33.3,37.65],[33.1,37.0],[32.65,36.45],[32.1,35.95],[31.35,35.5],[30.55,35.15],[29.7,34.85],[28.8,34.6],[27.9,34.55],[27.0,34.7],[26.3,34.85]],
    cappadocia: [[34.1,39.15],[34.35,39.75],[34.2,40.35],[34.65,40.75],[35.35,41.05],[36.15,41.25],[37.05,41.3],[37.95,41.15],[38.65,40.85],[39.05,40.35],[39.0,39.75],[38.65,39.2],[38.15,38.75],[37.55,38.35],[36.85,38.05],[36.1,37.9],[35.35,37.95],[34.65,38.35]],
    cilicia: [[32.45,35.35],[33.2,35.25],[33.95,35.3],[34.65,35.5],[35.3,35.85],[35.8,36.3],[36.1,36.85],[36.1,37.9],[35.35,37.95],[34.65,38.35],[34.1,39.15],[33.65,38.7],[33.1,38.25],[33.3,37.65],[33.1,37.0],[32.65,36.45],[32.1,35.95]],
    armenia: [[36.1,37.9],[36.85,38.05],[37.55,38.35],[38.15,38.75],[38.65,39.2],[39.0,39.75],[39.05,40.35],[39.55,40.75],[40.3,41.1],[41.2,41.35],[42.15,41.45],[43.1,41.35],[44.0,41.05],[44.7,40.6],[45.15,40.0],[45.3,39.35],[45.1,38.7],[44.55,38.2],[43.8,37.85],[42.95,37.6],[42.05,37.4],[41.1,37.2],[40.15,37.0],[39.25,36.85],[38.35,36.8],[37.55,36.9],[36.8,37.25]],
    northSyria: [[35.25,33.55],[35.65,34.2],[35.95,34.85],[36.1,35.5],[36.1,36.2],[36.1,36.85],[36.8,37.25],[37.55,36.9],[38.35,36.8],[39.25,36.85],[40.15,37.0],[40.6,36.5],[40.75,35.85],[40.55,35.2],[40.05,34.65],[39.35,34.2],[38.55,33.9],[37.7,33.65],[36.85,33.5],[36.0,33.45]],
    coeleSyria: [[33.55,29.4],[33.7,30.2],[33.8,31.0],[33.95,31.75],[34.15,32.45],[34.55,33.05],[35.25,33.55],[36.0,33.45],[36.85,33.5],[37.7,33.65],[38.55,33.9],[39.35,34.2],[39.4,33.55],[39.2,32.9],[38.85,32.25],[38.4,31.65],[37.85,31.1],[37.15,30.65],[36.4,30.3],[35.65,30.0],[34.85,29.75],[34.15,29.5]],
    lowerEgypt: [[24.2,27.7],[24.8,28.25],[25.4,28.85],[26.0,29.4],[26.65,29.95],[27.4,30.45],[28.2,30.85],[29.05,31.15],[29.95,31.4],[30.85,31.55],[31.75,31.55],[32.6,31.4],[33.35,31.15],[33.8,30.7],[33.55,29.4],[32.8,29.0],[31.95,28.7],[31.05,28.45],[30.1,28.2],[29.15,27.95],[28.2,27.7],[27.25,27.5],[26.35,27.4],[25.55,27.45]],
    upperEgypt: [[24.3,20.6],[25.2,20.35],[26.15,20.25],[27.1,20.35],[28.05,20.55],[29.0,20.8],[29.85,21.2],[30.6,21.7],[31.25,22.25],[31.75,22.9],[32.05,23.6],[32.15,24.35],[32.0,25.1],[31.65,25.85],[31.2,26.55],[30.65,27.15],[30.1,28.2],[29.15,27.95],[28.2,27.7],[27.25,27.5],[26.35,27.4],[25.55,27.45],[24.8,27.6],[24.25,27.9],[23.95,27.25],[23.85,26.45],[23.85,25.55],[23.9,24.6],[24.0,23.6],[24.05,22.55],[24.15,21.5]],
    cyrenaicaCell: [[18.1,27.25],[18.25,28.1],[18.45,28.95],[18.7,29.8],[19.05,30.55],[19.55,31.2],[20.15,31.7],[20.85,32.0],[21.65,32.2],[22.5,32.25],[23.35,32.15],[24.15,31.95],[24.75,31.55],[25.1,31.0],[24.95,30.4],[24.65,29.8],[24.4,29.1],[24.2,28.4],[24.25,27.9],[23.6,27.55],[22.85,27.25],[22.0,27.05],[21.1,26.95],[20.2,26.95],[19.35,27.0],[18.65,27.1]],
    upperMesopotamia: [[39.35,34.2],[40.05,34.65],[40.55,35.2],[40.75,35.85],[40.6,36.5],[40.15,37.0],[41.1,37.2],[42.05,37.4],[42.95,37.6],[43.8,37.85],[44.55,38.2],[45.35,38.25],[46.1,38.05],[46.65,37.65],[46.9,37.05],[46.75,36.4],[46.35,35.8],[45.8,35.3],[45.15,34.85],[44.4,34.5],[43.55,34.25],[42.65,34.05],[41.75,33.95],[40.85,34.0],[40.05,34.1]],
    babylonia: [[38.4,28.15],[39.25,27.9],[40.15,27.8],[41.05,27.85],[41.95,28.05],[42.85,28.35],[43.7,28.75],[44.5,29.2],[45.2,29.75],[45.8,30.4],[46.2,31.1],[46.4,31.85],[46.35,32.6],[46.05,33.3],[45.55,33.9],[45.15,34.85],[44.4,34.5],[43.55,34.25],[42.65,34.05],[41.75,33.95],[40.85,34.0],[40.05,34.1],[39.35,34.2],[39.4,33.55],[39.2,32.9],[38.85,32.25],[38.4,31.65],[37.85,31.1],[37.8,30.35],[37.95,29.55]],
    media: [[45.15,34.85],[45.55,33.9],[46.05,33.3],[46.35,32.6],[46.4,31.85],[47.15,31.65],[48.0,31.6],[48.85,31.7],[49.7,31.95],[50.5,32.3],[51.25,32.75],[51.95,33.3],[52.55,33.95],[53.0,34.65],[53.25,35.45],[53.35,36.25],[53.2,37.05],[52.85,37.75],[52.3,38.3],[51.6,38.7],[50.8,38.95],[49.9,39.0],[49.0,38.85],[48.15,38.55],[47.4,38.2],[46.65,37.65],[46.9,37.05],[46.75,36.4],[46.35,35.8],[45.8,35.3]],
    persis: [[46.4,24.2],[47.25,23.85],[48.15,23.65],[49.1,23.55],[50.05,23.6],[51.0,23.8],[51.9,24.1],[52.7,24.55],[53.35,25.1],[53.85,25.75],[54.15,26.5],[54.25,27.3],[54.1,28.1],[53.75,28.85],[53.25,29.5],[52.6,30.05],[51.85,30.5],[51.05,30.85],[50.2,31.15],[49.3,31.4],[48.4,31.55],[47.55,31.65],[46.4,31.85],[46.2,31.1],[45.8,30.4],[45.2,29.75],[44.5,29.2],[44.55,28.45],[44.8,27.65],[45.15,26.85],[45.55,26.1],[46.0,25.4]],
    parthia: [[52.55,33.95],[53.25,33.5],[54.05,33.15],[54.9,32.9],[55.8,32.8],[56.7,32.85],[57.6,33.05],[58.45,33.4],[59.2,33.9],[59.8,34.5],[60.2,35.2],[60.35,35.95],[60.25,36.7],[59.95,37.4],[59.45,38.05],[58.8,38.55],[58.0,38.9],[57.15,39.1],[56.25,39.15],[55.35,39.0],[54.5,38.75],[53.75,38.35],[52.85,37.75],[53.2,37.05],[53.35,36.25],[53.25,35.45],[53.0,34.65]],
    ariana: [[54.1,28.1],[54.25,27.3],[54.15,26.5],[54.7,25.95],[55.4,25.55],[56.2,25.3],[57.05,25.2],[57.9,25.3],[58.7,25.55],[59.45,25.95],[60.1,26.45],[60.6,27.05],[60.9,27.75],[61.0,28.5],[60.85,29.25],[60.5,29.95],[60.0,30.55],[59.4,31.05],[58.7,31.45],[57.95,31.75],[57.15,31.95],[56.35,32.0],[55.55,31.9],[54.8,31.65],[54.1,31.3],[53.5,30.85],[52.6,30.05],[53.25,29.5],[53.75,28.85]],
    sogdia: [[60.25,36.7],[60.35,35.95],[61.05,35.55],[61.85,35.3],[62.7,35.2],[63.55,35.3],[64.35,35.55],[65.05,35.95],[65.65,36.5],[66.1,37.15],[66.35,37.85],[66.4,38.6],[66.25,39.35],[65.9,40.05],[65.35,40.65],[64.65,41.1],[63.85,41.4],[63.0,41.55],[62.15,41.5],[61.35,41.3],[60.65,40.95],[60.05,40.45],[59.6,39.85],[59.45,38.05],[59.95,37.4]],
    bactriaCell: [[60.9,29.3],[61.7,29.05],[62.55,28.95],[63.4,29.05],[64.2,29.3],[64.95,29.7],[65.6,30.2],[66.15,30.8],[66.55,31.5],[66.75,32.25],[66.75,33.0],[66.55,33.7],[66.15,34.35],[65.6,34.9],[65.05,35.95],[64.35,35.55],[63.55,35.3],[62.7,35.2],[61.85,35.3],[61.05,35.55],[60.35,35.95],[60.2,35.2],[59.8,34.5],[59.2,33.9],[58.45,33.4],[57.6,33.05],[57.95,31.75],[58.7,31.45],[59.4,31.05],[60.0,30.55],[60.5,29.95]],
    arachosia: [[60.1,22.8],[61.0,22.55],[61.95,22.45],[62.9,22.55],[63.8,22.8],[64.65,23.2],[65.4,23.75],[66.0,24.4],[66.45,25.15],[66.7,25.95],[66.75,26.8],[66.6,27.65],[66.25,28.4],[65.75,29.05],[64.95,29.7],[64.2,29.3],[63.4,29.05],[62.55,28.95],[61.7,29.05],[60.9,29.3],[60.5,29.95],[60.0,30.55],[59.4,31.05],[58.7,31.45],[57.95,31.75],[58.2,30.9],[58.5,30.05],[58.8,29.2],[59.0,28.35],[59.15,27.5],[59.25,26.65],[59.35,25.8],[59.5,24.95],[59.7,24.15]],
    indusCell: [[66.0,23.0],[66.8,22.5],[67.7,22.15],[68.65,21.95],[69.65,21.9],[70.65,22.05],[71.6,22.35],[72.5,22.8],[73.3,23.4],[74.0,24.1],[74.55,24.9],[74.95,25.8],[75.2,26.75],[75.3,27.75],[75.25,28.75],[75.05,29.75],[74.7,30.7],[74.2,31.6],[73.6,32.4],[72.9,33.1],[72.1,33.65],[71.25,34.05],[70.35,34.3],[69.45,34.35],[68.55,34.25],[67.7,34.0],[66.9,33.6],[66.75,33.0],[66.75,32.25],[66.55,31.5],[66.15,30.8],[65.6,30.2],[64.95,29.7],[65.75,29.05],[66.25,28.4],[66.6,27.65],[66.75,26.8],[66.7,25.95],[66.45,25.15],[66.0,24.4]],
    cyprusCell: [[32.25,34.35],[32.6,34.15],[33.05,34.05],[33.55,34.05],[34.05,34.15],[34.45,34.35],[34.75,34.65],[34.9,35.0],[34.85,35.35],[34.6,35.6],[34.2,35.75],[33.7,35.8],[33.2,35.75],[32.75,35.6],[32.4,35.35],[32.2,35.0],[32.15,34.65]],
    levantStrip: [[33.45,29.5],[33.55,30.3],[33.65,31.1],[33.75,31.9],[33.9,32.7],[34.1,33.45],[34.35,34.1],[34.65,34.65],[35.05,35.05],[35.5,35.35],[36.0,35.5],[36.1,34.85],[35.65,34.2],[35.25,33.55],[34.55,33.05],[34.15,32.45],[33.95,31.75],[33.8,31.0],[33.7,30.2],[33.55,29.4]],
  };
  Object.assign(REGIONS, EXPANSION.regions);

  const REGION_GROUPS = {
    macedon: ['macedonia'],
    greece: ['hellas'],
    epirus: ['epirusCell'],
    thrace: ['thraceCell'],
    anatoliaWest: ['asiaMinorWest', 'phrygia', 'lyciaPamphylia'],
    anatoliaEast: ['cappadocia', 'cilicia', 'armenia'],
    syria: ['northSyria', 'coeleSyria'],
    egypt: ['lowerEgypt', 'upperEgypt'],
    cyrenaica: ['cyrenaicaCell'],
    mesopotamia: ['upperMesopotamia', 'babylonia'],
    iranWest: ['media', 'persis'],
    iranEast: ['parthia', 'ariana'],
    bactria: ['sogdia', 'bactriaCell'],
    indus: ['arachosia', 'indusCell'],
    cyprus: ['cyprusCell'],
    levantCoast: ['levantStrip'],
  };
  Object.assign(REGION_GROUPS, EXPANSION.regionGroups);

  const EMPIRE_EXTENTS = {
    europe: [[18.3,35.0],[18.4,36.1],[18.7,37.2],[18.5,38.2],[18.7,39.2],[19.1,40.2],[19.8,41.0],[20.8,41.6],[22.0,42.0],[23.3,42.2],[24.5,42.1],[25.5,41.8],[26.4,42.2],[27.7,42.7],[29.1,43.0],[30.6,42.8],[31.8,42.3],[32.5,41.5],[32.4,40.7],[31.5,40.0],[30.3,39.6],[29.0,39.3],[27.7,39.2],[26.5,39.4],[25.4,39.7],[25.0,39.0],[25.2,38.1],[24.9,37.2],[24.4,36.3],[23.5,35.5],[22.4,34.9],[21.1,34.7],[19.8,34.8]],
    asia: [[25.5,35.0],[25.9,36.1],[26.1,37.2],[25.9,38.3],[26.2,39.4],[27.0,40.4],[28.2,40.9],[29.6,41.1],[31.0,41.1],[32.5,41.4],[34.0,41.7],[35.6,41.8],[37.2,41.6],[38.8,41.0],[40.5,41.2],[42.2,41.5],[44.0,41.2],[45.7,40.7],[47.5,40.0],[49.3,39.4],[51.2,39.1],[53.1,39.3],[55.0,39.5],[57.0,39.2],[59.0,39.5],[61.0,40.2],[63.0,41.0],[65.1,41.5],[67.2,41.8],[69.3,41.6],[71.3,41.0],[73.2,40.0],[74.9,38.8],[76.3,37.3],[77.5,35.6],[78.4,33.7],[79.0,31.6],[79.2,29.4],[78.9,27.3],[78.2,25.3],[77.1,23.6],[75.7,22.3],[74.0,21.5],[72.1,21.2],[70.1,21.5],[68.1,21.9],[66.1,22.1],[64.1,22.0],[62.1,22.1],[60.1,22.5],[58.2,23.1],[56.5,24.0],[55.0,25.1],[53.7,26.3],[52.5,27.7],[51.3,28.9],[49.9,29.8],[48.4,30.6],[47.0,31.7],[45.6,32.8],[44.2,33.7],[42.7,34.2],[41.2,34.8],[39.8,35.5],[38.3,36.0],[36.8,36.2],[35.4,35.9],[34.1,35.5],[32.7,35.2],[31.3,34.9],[29.8,34.7],[28.3,34.6],[26.9,34.7]],
    egypt: [[24.0,20.3],[25.3,19.9],[27.0,19.8],[28.7,20.0],[30.2,20.5],[31.5,21.3],[32.4,22.5],[33.0,24.0],[33.3,25.7],[33.5,27.4],[34.0,29.0],[34.3,30.5],[34.1,31.6],[32.5,31.8],[30.8,31.8],[29.1,31.5],[27.5,31.1],[26.0,30.4],[24.9,29.4],[24.2,28.0],[23.9,26.4],[23.8,24.7],[23.8,22.9],[23.9,21.4]],
    cyrenaica: [[17.8,27.0],[19.1,26.6],[20.6,26.5],[22.1,26.8],[23.5,27.2],[24.8,27.8],[25.8,28.7],[26.1,29.8],[26.0,30.9],[25.5,31.8],[24.5,32.3],[23.1,32.5],[21.6,32.4],[20.2,32.0],[19.0,31.3],[18.3,30.3],[17.9,29.1]],
  };
  const BROAD_STORY_EXTENT = [[-11.5,28],[-9.5,36],[-4,44],[2,51],[11,56],[22,57],[33,54],[42,48],[50,42],[58,39],[67,40],[77,36],[80,26],[73,18],[58,16],[45,18],[33,20],[22,24],[12,27],[2,29]];

  const SATRAPY_LINES = [
    [[29.7,35.0],[29.5,36.4],[29.8,37.8],[30.2,39.3],[30.4,40.8]],
    [[32.4,35.2],[32.7,36.2],[33.4,37.3],[34.0,38.6],[34.0,40.5]],
    [[32.2,35.5],[33.8,37.4],[35.8,38.0]],
    [[35.8,38.0],[38.3,37.0],[40.8,37.2],[43.6,37.8]],
    [[38.8,29.4],[39.0,31.2],[39.4,33.1],[40.4,35.1],[41.0,37.0]],
    [[45.8,29.4],[46.2,31.3],[46.5,33.3],[46.9,35.5],[47.2,37.8]],
    [[46.3,31.7],[48.2,31.3],[50.2,30.8],[52.3,30.0],[54.0,29.0]],
    [[53.2,24.5],[53.8,27.0],[54.4,29.8],[55.1,32.6],[56.0,35.5],[56.5,38.5]],
    [[59.5,28.5],[60.2,31.0],[61.0,33.6],[62.0,36.2],[63.3,39.6]],
    [[65.1,23.0],[65.8,25.8],[66.7,28.6],[67.8,31.3],[69.2,33.6],[71.0,35.5]],
    [[24.2,28.0],[26.5,27.8],[28.8,27.9],[31.0,28.2],[33.1,28.6]],
  ];

  const SATRAPY_LABELS = [
    { name: 'ANATOLIA', p: [31.8,39.2] }, { name: 'CILICIA', p: [34.3,36.6] },
    { name: 'SYRIA', p: [36.5,34.5] }, { name: 'BABYLONIA', p: [43.7,32.2] },
    { name: 'MEDIA', p: [50.0,34.4] }, { name: 'PERSIS', p: [50.8,27.0] },
    { name: 'PARTHIA', p: [58.2,35.0] }, { name: 'BACTRIA', p: [68.2,37.2] },
    { name: 'EGYPT', p: [29.3,25.5] },
  ];

  const BACKGROUND_LABELS = [
    { name:'HISPANIA', p:[-3.5,40.2], rotate:-5 },
    { name:'GAUL', p:[2.0,46.5], rotate:-4 },
    { name:'GERMANIA', p:[11.5,52.5], rotate:2 },
    { name:'ITALIA', p:[12.0,43.0], rotate:-18 },
    { name:'ILLYRIA', p:[17.8,42.3], rotate:-13, mobile:false },
    { name:'THRACE', p:[27.2,43.25], rotate:-4 },
    { name:'SCYTHIA', p:[54.5,44.5], rotate:2 },
    { name:'ARABIA', p:[43.5,23.2], rotate:-5 },
    { name:'NUBIA', p:[30.2,19.3], rotate:-6, mobile:false },
    { name:'INDIA', p:[77.2,29.0], rotate:4 },
    { name:'MEDITERRANEAN SEA', p:[24.5,33.3], rotate:-4, water:true },
    { name:'AEGEAN SEA', p:[25.0,37.2], rotate:-8, water:true, mobile:false },
    { name:'BLACK SEA', p:[34.0,44.25], rotate:0, water:true },
    { name:'CASPIAN SEA', p:[50.5,42.6], rotate:-8, water:true },
    { name:'RED SEA', p:[37.2,23.2], rotate:-28, water:true, mobile:false },
    { name:'PERSIAN GULF', p:[51.7,25.8], rotate:-10, water:true, mobile:false },
    { name:'ARABIAN SEA', p:[64.5,19.3], rotate:0, water:true, mobile:false },
  ];

  // These are generalized editorial ridgelines, included to explain why armies
  // repeatedly funnel through Cilicia, Syria, the Iranian plateau, and the Hindu Kush.
  const MOUNTAIN_RANGES = [
    { name:'PYRENEES', points:[[-1.8,43.0],[0.2,42.7],[2.7,42.6]], label:[.5,43.15], rotate:-4 },
    { name:'ALPS', points:[[5.8,45.2],[8.0,46.0],[10.5,46.6],[13.3,46.5],[15.6,46.2]], label:[10.5,47.0], rotate:1 },
    { name:'APENNINES', points:[[8.5,44.4],[10.7,43.0],[12.5,41.5],[14.5,40.0],[16.2,38.7]], label:[13.2,41.3], rotate:-48 },
    { name:'ATLAS', points:[[-5.0,32.5],[0.0,34.2],[5.0,35.0],[10.0,35.7]], label:[2.7,34.0], rotate:8 },
    { name:'CARPATHIANS', points:[[17.0,48.4],[20.5,49.2],[24.0,48.7],[26.2,46.3]], label:[22.0,49.5], rotate:-5 },
    { name:'PINDUS', points:[[20.45,42.0],[20.65,40.8],[20.8,39.6],[21.15,38.45]], label:[20.15,40.15], rotate:-77 },
    { name:'TAURUS', points:[[27.2,37.15],[30.1,37.35],[33.0,37.6],[36.0,37.8],[38.4,38.25]], label:[32.8,37.15], rotate:3 },
    { name:'PONTIC MTS.', points:[[28.3,40.65],[31.5,40.8],[35.0,40.8],[38.2,40.65],[41.2,40.25]], label:[35.3,41.1], rotate:-2 },
    { name:'CAUCASUS', points:[[39.4,42.05],[42.2,42.55],[45.1,42.65],[48.4,42.2]], label:[44.3,43.0], rotate:-1 },
    { name:'ZAGROS', points:[[44.0,37.0],[46.3,35.1],[48.0,33.0],[50.1,30.8],[52.2,28.8],[54.6,27.1]], label:[49.15,32.05], rotate:-38 },
    { name:'HINDU KUSH', points:[[61.6,35.0],[64.3,35.65],[67.2,35.85],[70.2,35.45],[73.2,34.4]], label:[67.6,36.25], rotate:-2 },
    { name:'LEBANON', points:[[35.45,34.55],[35.7,33.75],[35.9,32.9],[36.15,32.05]], label:[36.35,33.2], rotate:-73, mobile:false },
  ];

  const BATTLE_DETAILS = {
    Lamia: { type:'Siege', belligerents:'Greek coalition vs. Antipater', commanders:'Leosthenes · Antipater', result:'Antipater contained, but not destroyed', forces:'A Macedonian field army holds the fortress while coalition forces control the approaches.', stakes:'The first test of Macedonian authority after Alexander’s death.', aftermath:'Leosthenes is killed during the siege. Reinforcements from Asia eventually reverse the Greek advantage.' },
    Crannon: { type:'Field battle', belligerents:'Macedon vs. Greek coalition', commanders:'Antipater & Craterus · Antiphilus', result:'Macedonian strategic victory', forces:'Both sides field Macedonian-style infantry; cavalry superiority proves decisive.', stakes:'Whether the Lamian War can continue after Macedonian reinforcements arrive.', aftermath:'The coalition fragments and Athens is forced to accept a Macedonian settlement.' },
    Pelusium: { type:'River campaign', belligerents:'Royal army vs. Ptolemy', commanders:'Perdiccas · Ptolemy', result:'Failed invasion of Egypt', forces:'The royal army attempts multiple Nile crossings against prepared defenders.', stakes:'Control of Egypt and the credibility of Perdiccas’ regency.', aftermath:'Heavy losses and failed crossings trigger a mutiny; Perdiccas is murdered by his officers.' },
    Orkynia: { type:'Field battle', belligerents:'Antigonus vs. Eumenes', commanders:'Antigonus · Eumenes', result:'Antigonid victory', forces:'A mobile pursuit through Cappadocia, shaped by cavalry and defections.', stakes:'Survival of the royalist cause in Anatolia.', aftermath:'Eumenes escapes to Nora; the war continues despite Antigonus’ battlefield success.' },
    Gabiene: { type:'Field battle', belligerents:'Antigonus vs. Eumenes', commanders:'Antigonus · Eumenes', result:'Antigonus wins the campaign', forces:'Large successor armies with veteran Silver Shields, cavalry, and elephants; ancient totals are disputed.', stakes:'Control of the eastern satrapies and the last royalist field army.', aftermath:'Antigonus captures the baggage train. The Silver Shields surrender Eumenes, who is executed.' },
    Gaza: { type:'Field battle', belligerents:'Ptolemy & Seleucus vs. Demetrius', commanders:'Ptolemy & Seleucus · Demetrius', result:'Ptolemaic victory', forces:'Infantry phalanxes, cavalry, and Demetrius’ elephants meet south of Gaza.', stakes:'Control of Coele-Syria and a route back into Babylonia for Seleucus.', aftermath:'Seleucus returns east with a small force, beginning the recovery of his satrapy and empire.' },
    Salamis: { type:'Naval battle', belligerents:'Antigonids vs. Ptolemaic fleet', commanders:'Demetrius · Menelaus', result:'Decisive Antigonid victory', forces:'A fleet action off Cyprus involving war galleys, transports, and a blockaded harbor.', stakes:'Control of Cyprus and naval supremacy in the eastern Mediterranean.', aftermath:'Cyprus falls. Antigonus and Demetrius assume the royal title, prompting rival kingships.' },
    Ipsus: { type:'Field battle', belligerents:'Coalition vs. Antigonids', commanders:'Seleucus & Lysimachus · Antigonus & Demetrius', result:'Coalition victory', forces:'One of the age’s largest encounters; Seleucid elephants isolate Demetrius’ cavalry from the phalanx.', stakes:'Antigonus’ last attempt to reunify Alexander’s empire.', aftermath:'Antigonus is killed. His Asian territories are divided, while Demetrius escapes with a mobile remnant.' },
    Macedon: { type:'Royal seizure', belligerents:'Demetrius vs. the Antipatrid regime', commanders:'Demetrius · Alexander V', result:'Demetrius takes the Macedonian throne', forces:'Political maneuver, court violence, and a veteran field army matter more than one set-piece battle.', stakes:'Possession of the old Argead homeland and its royal legitimacy.', aftermath:'Demetrius’ expansion alarms the other kings, who combine to drive him out.' },
    Corupedium: { type:'Field battle', belligerents:'Seleucus vs. Lysimachus', commanders:'Seleucus · Lysimachus', result:'Seleucid victory', forces:'Veteran armies of the last two living companions confront each other in western Anatolia.', stakes:'Command of Asia Minor and a possible reunion of Asia with Macedon.', aftermath:'Lysimachus is killed. Seleucus is assassinated months later before he can consolidate the victory.' },
    Lysimacheia: { type:'Field battle', belligerents:'Antigonus Gonatas vs. Galatian host', commanders:'Antigonus Gonatas · Galatian leaders', result:'Antigonid victory', forces:'Antigonus uses a fortified camp and deception against a raiding force.', stakes:'Security of Thrace and Antigonus’ claim to Macedonian kingship.', aftermath:'The victory strengthens Antigonus’ military reputation and helps stabilize his dynasty.' },
  };
  Object.assign(BATTLE_DETAILS, EXPANSION.battles);

  // A curated gazetteer of the principal capitals, ports, royal foundations,
  // administrative centers, and campaign junctions of the successor world.
  // Coordinates are approximate site centroids; importance is contextual rather
  // than a claim about precisely measured ancient population.
  const CITIES = [
    { name:'Pella', ancient:'Pella', p:[22.52,40.76], tier:1, kind:'Royal capital', region:'Macedonia', modern:'Pella, Greece', summary:'The administrative heart of the Macedonian kingdom and the court inherited by Alexander’s successors. Control of Pella gave a claimant access to the homeland’s royal institutions and manpower.' },
    { name:'Aigai', ancient:'Aigai', p:[22.32,40.48], tier:2, kind:'Dynastic sanctuary', region:'Macedonia', modern:'Vergina, Greece', summary:'The old Argead capital and royal burial place. Even after the court moved to Pella, Aigai remained the dynasty’s ceremonial center.' },
    { name:'Amphipolis', ancient:'Amphipolis', p:[23.84,40.82], tier:2, kind:'Military port', region:'Macedonia', modern:'Amfipoli, Greece', summary:'A fortified city controlling the Strymon valley, timber, mines, and the road east from Macedonia toward Thrace.' },
    { name:'Thessalonica', ancient:'Thessalonike', p:[22.94,40.64], tier:1, kind:'Royal foundation', region:'Macedonia', modern:'Thessaloniki, Greece', from:315, summary:'Founded by Cassander and named for his wife Thessalonike. Its excellent harbor soon made it Macedonia’s leading port.' },
    { name:'Athens', ancient:'Athenai', p:[23.73,37.98], tier:1, kind:'Great polis', region:'Hellas', modern:'Athens, Greece', summary:'Still the premier intellectual city of the Greek world. Its fleet, wealth, and symbolic prestige repeatedly drew the successors into Athenian politics.' },
    { name:'Corinth', ancient:'Korinthos', p:[22.93,37.91], tier:1, kind:'Strategic fortress', region:'Hellas', modern:'Ancient Corinth, Greece', summary:'The fortress of Acrocorinth commanded the land bridge between central Greece and the Peloponnese, making the city a coveted Macedonian garrison point.' },
    { name:'Sparta', ancient:'Sparta', p:[22.43,37.08], tier:2, kind:'Independent polis', region:'Peloponnese', modern:'Sparta, Greece', summary:'A diminished but fiercely independent military state that remained outside the Macedonian-led League of Corinth.' },
    { name:'Thebes', ancient:'Thebai', p:[23.32,38.32], tier:2, kind:'Rebuilt polis', region:'Boeotia', modern:'Thiva, Greece', from:316, summary:'Destroyed by Alexander in 335 BCE and re-established by Cassander in 316, partly as a political challenge to Alexander’s legacy.' },
    { name:'Rhodes', ancient:'Rhodos', p:[28.23,36.44], tier:1, kind:'Maritime republic', region:'Aegean', modern:'Rhodes, Greece', summary:'A wealthy naval and commercial republic. Its resistance to Demetrius Poliorcetes in 305–304 BCE became one of the defining sieges of the age.' },
    { name:'Byzantium', ancient:'Byzantion', p:[29.0,41.01], tier:2, kind:'Straits city', region:'Thrace', modern:'Istanbul, Türkiye', summary:'A rich independent city at the Bosporus, able to tax and protect the grain route between the Black Sea and Aegean.' },
    { name:'Lysimachia', ancient:'Lysimacheia', p:[26.62,40.58], tier:1, kind:'Royal capital', region:'Thrace', modern:'Bolayır area, Türkiye', from:309, summary:'Founded by Lysimachus on the Thracian Chersonese as a new capital commanding the route between Europe and Asia.' },
    { name:'Cyzicus', ancient:'Kyzikos', p:[27.88,40.39], tier:2, kind:'Commercial port', region:'Propontis', modern:'Erdek area, Türkiye', summary:'A prosperous port on the Propontis with strong walls, excellent harbors, and access to Black Sea commerce.' },
    { name:'Pergamon', ancient:'Pergamon', p:[27.18,39.13], tier:1, kind:'Fortress treasury', region:'Mysia', modern:'Bergama, Türkiye', summary:'A powerful hill fortress and treasury. Philetaerus’ command here became the nucleus of the later Attalid kingdom.' },
    { name:'Sardis', ancient:'Sardeis', p:[28.04,38.49], tier:1, kind:'Satrapal capital', region:'Lydia', modern:'Sart, Türkiye', summary:'The old Lydian capital and western terminus of the Persian Royal Road, controlling routes from the Aegean into inland Anatolia.' },
    { name:'Ephesus', ancient:'Ephesos', p:[27.34,37.94], tier:1, kind:'Great port', region:'Ionia', modern:'Selçuk, Türkiye', summary:'One of the richest Ionian ports and home of the sanctuary of Artemis. Lysimachus refounded and fortified the city near the end of the wars.' },
    { name:'Miletus', ancient:'Miletos', p:[27.28,37.53], tier:2, kind:'Ionian port', region:'Caria', modern:'Balat, Türkiye', summary:'A celebrated maritime and intellectual center whose harbors linked the Maeander valley to the Aegean.' },
    { name:'Halicarnassus', ancient:'Halikarnassos', p:[27.42,37.04], tier:2, kind:'Fortified port', region:'Caria', modern:'Bodrum, Türkiye', summary:'A formidable Carian harbor dominated by the Mausoleum and strong defenses, important to fleets operating along the southern Aegean coast.' },
    { name:'Gordium', ancient:'Gordion', p:[31.98,39.65], tier:2, kind:'Road junction', region:'Phrygia', modern:'Yassıhüyük, Türkiye', summary:'The former Phrygian capital stood astride the main overland routes through central Anatolia and carried powerful associations with Alexander.' },
    { name:'Celaenae', ancient:'Kelainai', p:[30.17,38.07], tier:2, kind:'Inland fortress', region:'Phrygia', modern:'Dinar, Türkiye', summary:'A fortress at the headwaters of the Maeander and a critical station on the road linking western Anatolia to Cilicia and Syria.' },
    { name:'Tarsus', ancient:'Tarsos', p:[34.9,36.92], tier:1, kind:'Cilician capital', region:'Cilicia', modern:'Tarsus, Türkiye', summary:'The chief city of Cilicia, positioned between a rich plain, a navigable river, and the passes through the Taurus Mountains.' },
    { name:'Salamis', ancient:'Salamis', p:[33.9,35.18], tier:1, kind:'Cypriot port', region:'Cyprus', modern:'Famagusta area, Cyprus', summary:'The largest city and harbor of Cyprus. Demetrius’ naval victory here in 306 BCE triggered the successors’ adoption of royal titles.' },
    { name:'Kition', ancient:'Kition', p:[33.63,34.92], tier:2, kind:'Phoenician port', region:'Cyprus', modern:'Larnaca, Cyprus', summary:'A major Phoenician-Cypriot harbor with commercial ties across the eastern Mediterranean.' },
    { name:'Antioch', ancient:'Antiocheia on the Orontes', p:[36.16,36.2], tier:1, kind:'Seleucid capital', region:'Syria', modern:'Antakya, Türkiye', from:300, summary:'Founded by Seleucus I as the inland capital of his Syrian heartland. It became one of the great metropolitan centers of the Hellenistic world.' },
    { name:'Seleucia Pieria', ancient:'Seleukeia in Pieria', p:[35.84,36.12], tier:1, kind:'Royal port', region:'Syria', modern:'Çevlik, Türkiye', from:300, summary:'The fortified seaport of Antioch and one member of the Syrian Tetrapolis, guarding the coast and the mouth of the Orontes.' },
    { name:'Apamea', ancient:'Apameia on the Orontes', p:[36.4,35.42], tier:2, kind:'Military foundation', region:'Syria', modern:'Qalaat al-Madiq, Syria', from:300, summary:'A Seleucid military and elephant depot in the Orontes valley, named for Seleucus’ wife Apama.' },
    { name:'Laodicea', ancient:'Laodikeia by the Sea', p:[35.78,35.52], tier:2, kind:'Royal port', region:'Syria', modern:'Latakia, Syria', from:300, summary:'A Seleucid coastal foundation and member of the Syrian Tetrapolis, serving maritime traffic along the northern Levant.' },
    { name:'Tyre', ancient:'Tyros', p:[35.2,33.27], tier:1, kind:'Phoenician metropolis', region:'Phoenicia', modern:'Tyre, Lebanon', summary:'A wealthy island-port until Alexander joined it to the mainland. Its shipyards and position made it central to control of the Levantine coast.' },
    { name:'Sidon', ancient:'Sidon', p:[35.37,33.56], tier:2, kind:'Phoenician port', region:'Phoenicia', modern:'Sidon, Lebanon', summary:'An old royal and commercial city whose harbors and naval expertise mattered to every ruler of Coele Syria.' },
    { name:'Damascus', ancient:'Damaskos', p:[36.29,33.51], tier:2, kind:'Caravan center', region:'Coele Syria', modern:'Damascus, Syria', summary:'An inland oasis city linking the Mediterranean coast with Arabia and the Euphrates corridor.' },
    { name:'Jerusalem', ancient:'Hierosolyma', p:[35.21,31.78], tier:2, kind:'Temple city', region:'Judaea', modern:'Jerusalem', summary:'The religious and administrative center of Judaea, contested between Ptolemaic and Seleucid spheres after Alexander.' },
    { name:'Gaza', ancient:'Gaza', p:[34.47,31.5], tier:1, kind:'Frontier fortress', region:'Southern Levant', modern:'Gaza', summary:'A fortified terminus of Arabian caravan routes and the coastal gateway between Egypt and Syria. Major armies repeatedly fought around it.' },
    { name:'Alexandria', ancient:'Alexandreia in Egypt', p:[29.92,31.2], tier:1, kind:'Ptolemaic capital', region:'Egypt', modern:'Alexandria, Egypt', summary:'Founded by Alexander and transformed by the Ptolemies into their royal capital, principal Mediterranean harbor, and greatest cultural center.' },
    { name:'Memphis', ancient:'Memphis', p:[31.25,29.85], tier:1, kind:'Egyptian capital', region:'Egypt', modern:'Mit Rahina, Egypt', summary:'Egypt’s ancient administrative and religious center. The Ptolemies used Memphis to connect their Greek court with Egyptian kingship and priesthood.' },
    { name:'Naucratis', ancient:'Naukratis', p:[30.62,30.9], tier:2, kind:'Greek trading city', region:'Nile Delta', modern:'Kom Gi’eif, Egypt', summary:'The oldest established Greek commercial settlement in Egypt and an important link between Nile trade and the Aegean.' },
    { name:'Ptolemais', ancient:'Ptolemais Hermiou', p:[31.8,26.48], tier:2, kind:'Royal foundation', region:'Upper Egypt', modern:'El Mansha, Egypt', from:285, summary:'Founded under Ptolemy I as a Greek-style administrative capital for Upper Egypt.' },
    { name:'Cyrene', ancient:'Kyrene', p:[21.86,32.82], tier:1, kind:'Greek metropolis', region:'Cyrenaica', modern:'Shahhat, Libya', summary:'The leading Greek city of Cyrenaica, wealthy from agriculture and the silphium trade and strategically tied to Ptolemaic Egypt.' },
    { name:'Babylon', ancient:'Babylon', p:[44.42,32.54], tier:1, kind:'Imperial metropolis', region:'Babylonia', modern:'Hillah, Iraq', summary:'Alexander’s last capital and the symbolic center of his empire. Possession of Babylon launched Seleucus’ rise and anchored control of Mesopotamia.' },
    { name:'Seleucia', ancient:'Seleukeia on the Tigris', p:[44.52,33.1], tier:1, kind:'Seleucid capital', region:'Babylonia', modern:'Near Baghdad, Iraq', from:305, summary:'Founded by Seleucus opposite the Tigris routes, it became the dynasty’s immense eastern capital and a successor to Babylon’s commercial role.' },
    { name:'Uruk', ancient:'Uruk', p:[45.64,31.32], tier:2, kind:'Temple city', region:'Babylonia', modern:'Warka, Iraq', summary:'One of Mesopotamia’s oldest great cities, still a thriving scholarly, temple, and administrative center in the Hellenistic period.' },
    { name:'Susa', ancient:'Susa', p:[48.26,32.19], tier:1, kind:'Royal capital', region:'Susiana', modern:'Shush, Iran', summary:'A former Achaemenid royal residence and treasury on the route between Mesopotamia and the Iranian plateau.' },
    { name:'Ecbatana', ancient:'Ekbatana', p:[48.51,34.8], tier:1, kind:'Royal capital', region:'Media', modern:'Hamadan, Iran', summary:'The old Median capital and a royal treasury city commanding the principal route across western Iran.' },
    { name:'Persepolis', ancient:'Persepolis', p:[52.89,29.94], tier:2, kind:'Achaemenid center', region:'Persis', modern:'Marvdasht, Iran', summary:'The monumental Achaemenid royal complex had been burned during Alexander’s conquest but remained a potent symbol in the Persian heartland.' },
    { name:'Bactra', ancient:'Baktra', p:[66.9,36.76], tier:1, kind:'Satrapal capital', region:'Bactria', modern:'Balkh, Afghanistan', summary:'The great oasis capital of Bactria, controlling routes between Iran, Central Asia, and India. Its wealthy satrapy was difficult for western kings to hold.' },
    { name:'Ai Khanoum', ancient:'Ai Khanoum', p:[69.52,37.17], tier:2, kind:'Hellenistic city', region:'Bactria', modern:'Takhar, Afghanistan', summary:'A major Greek-style city at the Oxus–Kokcha junction. Its precise foundation date is debated, but it became a striking center of Hellenistic life in Central Asia.' },
    { name:'Alexandria Eschate', ancient:'Alexandreia Eschate', p:[69.63,40.28], tier:2, kind:'Frontier foundation', region:'Sogdiana', modern:'Khujand, Tajikistan', summary:'“Alexandria the Furthest,” founded on the Jaxartes as a fortified northern limit of Alexander’s conquests.' },
    { name:'Maracanda', ancient:'Marakanda', p:[66.97,39.65], tier:2, kind:'Satrapal center', region:'Sogdiana', modern:'Samarkand, Uzbekistan', summary:'The principal city of Sogdiana and a key base during Alexander’s difficult Central Asian campaigns.' },
    { name:'Alexandria Arachosia', ancient:'Alexandreia in Arachosia', p:[65.7,31.62], tier:2, kind:'Military foundation', region:'Arachosia', modern:'Kandahar, Afghanistan', summary:'A Macedonian settlement and administrative center controlling routes between Iran, the Indus, and the Hindu Kush.' },
    { name:'Taxila', ancient:'Taxila / Takshashila', p:[72.84,33.74], tier:1, kind:'Regional metropolis', region:'Gandhara', modern:'Taxila, Pakistan', summary:'A wealthy city and intellectual center at the meeting point of routes from India, Central Asia, and the Iranian plateau.' },
  ];
  CITIES.push(...EXPANSION.cities);

  // The active cast is a second chronology layered over territorial control.
  // Locations are deliberately approximate: they place a person with a court,
  // army, or campaign theatre rather than pretending to track daily movement.
  const PEOPLE = [
    {
      id:'antipater', name:'Antipater', faction:'antipater', intro:323, end:319, death:319,
      epithet:'The old regent', portrait:'/images/diadochi/people/antipater.jpg', likeness:'Later engraved portrait',
      source:'https://commons.wikimedia.org/wiki/File:Antipatro_r%C3%A8_-_Fanelli_Francesco_-_1695.jpg',
      bio:'Alexander’s veteran governor in Europe. His authority anchors Macedonia until his succession choice fractures the regency.',
      positions:[{year:323,p:[22.52,40.76],place:'Pella'},{year:319,p:[22.52,40.76],place:'Macedonia'}],
      phases:[{year:323,role:'Regent in Europe',beat:'Holds Macedonia while the empire is divided.'},{year:321,role:'Regent of the kings',beat:'The victors at Triparadisus entrust him with the royal house.'},{year:319,role:'Regent of the empire',beat:'Dies after naming Polyperchon—not Cassander—as successor.'}],
    },
    {
      id:'perdiccas', name:'Perdiccas', faction:'perdiccas', intro:323, end:321, death:321,
      epithet:'Guardian of the kings', portrait:'/images/diadochi/people/perdiccas.jpg', likeness:'18th-century engraving',
      source:'https://commons.wikimedia.org/wiki/File:Perdicca,_generale_macedone_365-321_a.C.jpg',
      bio:'Commander of the royal army and the first regent after Alexander. His attempt to preserve a unified empire ends on the Nile.',
      positions:[{year:323,p:[44.42,32.54],place:'Babylon'},{year:322,p:[35.3,36.8],place:'Cilicia'},{year:321,p:[32.55,31.04],place:'The Nile'}],
      phases:[{year:323,role:'Regent and chiliarch',beat:'Takes charge of the kings and the royal army.'},{year:322,role:'Regent on campaign',beat:'Moves against rivals who reject the central regency.'},{year:321,role:'Invader of Egypt',beat:'Killed by his officers after disastrous Nile crossings.'}],
    },
    {
      id:'ptolemy', name:'Ptolemy', faction:'ptolemy', intro:323, end:282, death:282,
      epithet:'The keeper of Egypt', portrait:'/images/diadochi/people/ptolemy.jpg', likeness:'Hellenistic marble bust',
      source:'https://commons.wikimedia.org/wiki/File:Ptolemy_I_Soter_Louvre_Ma849.jpg',
      bio:'Patient, defensible, and rich: Ptolemy turns the Egyptian satrapy into the most durable of the successor kingdoms.',
      positions:[{year:323,p:[31.24,30.04],place:'Memphis'},{year:321,p:[32.55,31.04],place:'Egyptian frontier'},{year:305,p:[29.91,31.2],place:'Alexandria'},{year:282,p:[29.91,31.2],place:'Alexandria'}],
      phases:[{year:323,role:'Satrap of Egypt',beat:'Secures Egypt and diverts Alexander’s body to Memphis.'},{year:321,role:'Defender of Egypt',beat:'Breaks Perdiccas without abandoning his compact base.'},{year:305,role:'King Ptolemy I Soter',beat:'Assumes the royal title and builds a Mediterranean dynasty.'},{year:282,role:'King of Egypt',beat:'Dies in Alexandria after securing the succession.'}],
    },
    {
      id:'antigonus', name:'Antigonus', faction:'antigonus', intro:323, end:301, death:301,
      epithet:'The One-Eyed', portrait:'/images/diadochi/people/antigonus.jpg', likeness:'Later sculptural portrait',
      source:'https://commons.wikimedia.org/wiki/File:Antigonus_Monophthalmus_Bust.jpg',
      bio:'The most formidable reunifier of Alexander’s Asian empire. His victories make him master of Asia—and the target of every surviving rival.',
      positions:[{year:323,p:[30.3,38.7],place:'Phrygia'},{year:316,p:[52.4,31.7],place:'Gabiene'},{year:312,p:[36.3,35.2],place:'Syria'},{year:306,p:[33.4,35.1],place:'Eastern Mediterranean'},{year:301,p:[30.98,38.9],place:'Ipsus'}],
      phases:[{year:323,role:'Satrap of Phrygia',beat:'Begins with a powerful Anatolian command.'},{year:319,role:'Strategos of Asia',beat:'Hunts Eumenes across the length of the empire.'},{year:316,role:'Master of Asia',beat:'Defeats Eumenes and commands the greatest territorial base.'},{year:306,role:'King Antigonus I',beat:'Claims kingship after the victory at Salamis.'},{year:301,role:'King on the field',beat:'Falls fighting at Ipsus, aged about eighty.'}],
    },
    {
      id:'eumenes', name:'Eumenes', faction:'eumenes', intro:322, end:316, death:316,
      epithet:'The royalist outsider', portrait:'/images/diadochi/people/eumenes.jpg', likeness:'1700 engraving',
      source:'https://commons.wikimedia.org/wiki/File:Eumenes_of_Cardia.jpg',
      bio:'A Greek secretary among Macedonian warlords, Eumenes becomes the most ingenious defender of the joint kingship.',
      positions:[{year:322,p:[35.3,36.8],place:'Cappadocia'},{year:319,p:[36.1,36.8],place:'Cilicia'},{year:317,p:[49.1,33.5],place:'Media'},{year:316,p:[52.4,31.7],place:'Gabiene'}],
      phases:[{year:322,role:'Satrap and royal commander',beat:'Defeats Craterus and survives the first coalition.'},{year:319,role:'Champion of the kings',beat:'Takes the royal cause and the veteran Silver Shields east.'},{year:316,role:'Commander at Gabiene',beat:'Betrayed by the Silver Shields and executed by Antigonus.'}],
    },
    {
      id:'lysimachus', name:'Lysimachus', faction:'lysimachus', intro:323, end:281, death:281,
      epithet:'The Thracian survivor', portrait:'/images/diadochi/people/lysimachus.png', likeness:'Hellenistic marble bust',
      source:'https://commons.wikimedia.org/wiki/File:Lysimachus_bust_cropped.png',
      bio:'Initially boxed into turbulent Thrace, Lysimachus outlasts the first generation and eventually joins Europe to western Anatolia.',
      positions:[{year:323,p:[26.2,42.0],place:'Thrace'},{year:309,p:[26.62,40.58],place:'Lysimachia'},{year:301,p:[30.98,38.9],place:'Ipsus'},{year:281,p:[28.0,38.5],place:'Corupedium'}],
      phases:[{year:323,role:'Satrap of Thrace',beat:'Fights to hold the rough European frontier.'},{year:305,role:'King of Thrace',beat:'Takes the royal title with the other major successors.'},{year:301,role:'Victor of Ipsus',beat:'Receives much of western Anatolia after Antigonus falls.'},{year:281,role:'King of Thrace and Asia',beat:'Killed in battle against Seleucus at Corupedium.'}],
    },
    {
      id:'cassander', name:'Cassander', faction:'antipater', intro:319, end:297, death:297,
      epithet:'The dynast of Macedon', portrait:'/images/diadochi/people/cassander.jpg', likeness:'Ancient coin portrait',
      source:'https://commons.wikimedia.org/wiki/File:Coin_of_Cassander.jpg',
      bio:'Antipater’s ambitious son wins Macedonia by force, rebuilds Thebes, founds Thessalonica, and extinguishes Alexander’s direct line.',
      positions:[{year:319,p:[23.73,37.98],place:'Athens'},{year:316,p:[22.52,40.76],place:'Pella'},{year:297,p:[22.52,40.76],place:'Macedonia'}],
      phases:[{year:319,role:'Claimant against Polyperchon',beat:'Rejects his father’s settlement and fights for Macedonia.'},{year:316,role:'Ruler of Macedonia',beat:'Controls the royal family and restores Thebes.'},{year:305,role:'King Cassander',beat:'Adopts the royal title while consolidating the homeland.'},{year:297,role:'King of Macedonia',beat:'Dies of illness; his fragile succession soon collapses.'}],
    },
    {
      id:'seleucus', name:'Seleucus', faction:'seleucus', intro:321, end:281, death:281,
      epithet:'The eastern kingmaker', portrait:'/images/diadochi/people/seleucus.jpg', likeness:'Roman copy of a Greek bust',
      source:'https://commons.wikimedia.org/wiki/File:Seleuco_I_Nicatore.JPG',
      bio:'Driven out of Babylon and restored with a tiny force, Seleucus assembles the largest and most diverse successor kingdom.',
      positions:[{year:321,p:[44.42,32.54],place:'Babylon'},{year:316,p:[29.91,31.2],place:'Exile in Egypt'},{year:312,p:[44.42,32.54],place:'Return to Babylon'},{year:301,p:[30.98,38.9],place:'Ipsus'},{year:281,p:[28.0,38.5],place:'Corupedium'}],
      phases:[{year:321,role:'Satrap of Babylon',beat:'Receives Babylon in the settlement at Triparadisus.'},{year:316,role:'Exile and admiral',beat:'Escapes Antigonus and joins Ptolemy’s coalition.'},{year:312,role:'Restorer of Babylon',beat:'Returns east; Seleucid dating begins from this recovery.'},{year:305,role:'King Seleucus I Nicator',beat:'Rules from Syria deep into the Iranian east.'},{year:301,role:'Victor of Ipsus',beat:'War elephants help break the Antigonid army.'},{year:281,role:'Last great successor',beat:'Wins at Corupedium, then is assassinated crossing into Europe.'}],
    },
    {
      id:'demetrius', name:'Demetrius', faction:'antigonus', intro:314, end:283, death:283,
      epithet:'The Besieger', portrait:'/images/diadochi/people/demetrius.jpg', likeness:'Roman copy of a Greek bust',
      source:'https://commons.wikimedia.org/wiki/Category:Busts_of_Demetrius_I_Poliorcetes',
      bio:'Brilliant, theatrical, and inconsistent, Antigonus’ son turns siegecraft and naval power into a roaming claim on kingship.',
      positions:[{year:314,p:[35.0,35.2],place:'Syria'},{year:312,p:[34.46,31.5],place:'Gaza'},{year:306,p:[33.9,35.05],place:'Salamis, Cyprus'},{year:304,p:[28.23,36.44],place:'Rhodes'},{year:301,p:[30.98,38.9],place:'Ipsus'},{year:294,p:[22.52,40.76],place:'Pella'},{year:285,p:[36.5,37.0],place:'Cilicia'},{year:283,p:[36.5,37.0],place:'Captivity in Syria'}],
      phases:[{year:314,role:'Antigonid field commander',beat:'Emerges as the mobile arm of his father’s bid for empire.'},{year:306,role:'King Demetrius Poliorcetes',beat:'The naval victory at Salamis launches a royal claim.'},{year:304,role:'The Besieger at Rhodes',beat:'His colossal siege engines fail to break the island republic.'},{year:301,role:'Heir without an empire',beat:'Escapes Ipsus after his father is killed.'},{year:294,role:'King of Macedonia',beat:'Seizes the homeland but cannot hold its loyalties.'},{year:285,role:'Captive of Seleucus',beat:'Surrenders after a failed invasion of Asia.'},{year:283,role:'Royal prisoner',beat:'Dies in honorable captivity in Syria.'}],
    },
    {
      id:'pyrrhus', name:'Pyrrhus', faction:'pyrrhus', intro:288, end:276,
      epithet:'The restless king', portrait:'/images/diadochi/people/pyrrhus.jpg', likeness:'Roman copy of a Greek bust',
      source:'https://commons.wikimedia.org/wiki/File:Pyrrhus.JPG',
      bio:'A younger-generation commander whose daring campaigns briefly win Macedonia before drawing him toward war in Italy.',
      positions:[{year:288,p:[20.73,39.16],place:'Epirus'},{year:285,p:[22.52,40.76],place:'Macedonia'},{year:281,p:[20.73,39.16],place:'Epirus'},{year:276,p:[20.73,39.16],place:'Epirus'}],
      phases:[{year:288,role:'King of Epirus',beat:'Invades Macedonia with Lysimachus and drives out Demetrius.'},{year:285,role:'Joint king of Macedonia',beat:'Briefly holds western Macedonia before Lysimachus expels him.'},{year:281,role:'King of Epirus',beat:'Prepares the western expedition that will make his name proverbial.'}],
    },
    {
      id:'gonatas', name:'Antigonus Gonatas', faction:'antigonus', intro:283, end:276,
      epithet:'The dynasty rebuilt', portrait:'/images/diadochi/people/gonatas.jpg', likeness:'Coin type issued under Gonatas (head of Pan)',
      source:'https://commons.wikimedia.org/wiki/File:Antigonus_Gonatas_British_Museum.jpg',
      bio:'Demetrius’ son inherits little but a claim. He patiently rebuilds Antigonid power and finally secures Macedonia in 276 BCE.',
      positions:[{year:283,p:[23.73,37.98],place:'Central Greece'},{year:281,p:[26.0,40.6],place:'Thracian coast'},{year:277,p:[25.5,42.0],place:'Lysimachia'},{year:276,p:[22.52,40.76],place:'Macedonia'}],
      phases:[{year:283,role:'Antigonid claimant',beat:'Inherits his father’s fleet, garrisons, and royal claim.'},{year:277,role:'Victor over the Gauls',beat:'A victory near Lysimachia transforms his reputation.'},{year:276,role:'King of Macedonia',beat:'Takes the Macedonian throne and founds a durable dynasty.'}],
    },
  ];
  PEOPLE.push(...EXPANSION.people);

  const ARMIES = [
    {
      id:'royal-army', name:'The Royal Army', faction:'perdiccas', intro:323, end:321,
      description:'The central Macedonian army that followed Alexander into Asia, now carrying the kings and the regency’s claim to universal authority.',
      phases:[
        {year:323,p:[44.7,32.2],place:'Babylon camp',commander:'Perdiccas',composition:'Royal infantry, Companion cavalry, elephants',objective:'Hold the empire together under the joint kings'},
        {year:322,p:[35.6,36.6],place:'Cilician camp',commander:'Perdiccas',composition:'Royal field army and siege train',objective:'Bring the western satraps back under the regency'},
        {year:321,p:[32.3,30.8],place:'Pelusium and the Nile',commander:'Perdiccas',composition:'Royal field army, depleted at river crossings',objective:'Break Ptolemy’s control of Egypt'},
      ],
    },
    {
      id:'european-army', name:'Army of Europe', faction:'antipater', intro:323, end:319,
      description:'The Macedonian homeland army and garrison network. Whoever controlled it could dominate Greece and claim the machinery of the old kingdom.',
      phases:[
        {year:323,p:[22.7,40.5],place:'Pella and the Macedonian musters',commander:'Antipater',composition:'Macedonian levy, cavalry, Greek garrisons',objective:'Secure Europe after Alexander’s death'},
        {year:322,p:[22.2,39.6],place:'Lamia campaign camp',commander:'Antipater and Craterus',composition:'Relief army reinforced from Asia',objective:'Defeat the Greek coalition'},
        {year:321,p:[36.1,33.7],place:'Triparadisus assembly',commander:'Antipater',composition:'European army and royal contingents',objective:'Impose a new regency settlement'},
        {year:319,p:[22.7,40.5],place:'Macedonian royal camp',commander:'Polyperchon',composition:'Homeland army and royal guard',objective:'Preserve Antipater’s regency settlement'},
      ],
    },
    {
      id:'eumenid-army', name:'Eumenes’ Royalists', faction:'eumenes', intro:322, end:316,
      description:'A mobile royalist army built around the veteran Silver Shields, repeatedly surviving isolation and pursuit across Asia.',
      phases:[
        {year:322,p:[34.4,39.4],place:'Cappadocian field camp',commander:'Eumenes',composition:'Cappadocian cavalry and Macedonian infantry',objective:'Hold Cappadocia for the regency'},
        {year:321,p:[34.0,37.9],place:'Nora',commander:'Eumenes',composition:'A small besieged remnant',objective:'Survive Antigonus’ blockade'},
        {year:319,p:[35.5,36.5],place:'Cilician royal camp',commander:'Eumenes',composition:'Silver Shields, royal treasury, eastern levies',objective:'Defend the kings against Antigonus'},
        {year:318,p:[44.1,32.4],place:'Babylonian crossing camps',commander:'Eumenes',composition:'Coalition of eastern satrapal armies',objective:'Unite the Upper Satrapies'},
        {year:317,p:[51.3,32.5],place:'Paraitacene',commander:'Eumenes',composition:'Silver Shields, cavalry, and war elephants',objective:'Block Antigonus from the Iranian east'},
        {year:316,p:[52.2,31.5],place:'Gabiene winter camp',commander:'Eumenes',composition:'Royalist infantry, cavalry, and elephants',objective:'Defeat Antigonus before the coalition fractures'},
      ],
    },
    {
      id:'antigonid-army', name:'Antigonid Grand Army', faction:'antigonus', intro:323, end:301,
      description:'Antigonus’ immense Asian field army—the principal instrument of his attempt to reunify Alexander’s empire.',
      phases:[
        {year:323,p:[30.4,39.0],place:'Celaenae in Phrygia',commander:'Antigonus',composition:'Phrygian satrapal army',objective:'Secure the Anatolian command'},
        {year:319,p:[33.8,39.0],place:'Cappadocian pursuit camp',commander:'Antigonus',composition:'Asian field army and cavalry',objective:'Destroy Eumenes’ royalists'},
        {year:317,p:[50.5,33.2],place:'Media campaign camp',commander:'Antigonus',composition:'Infantry, heavy cavalry, and elephants',objective:'Force Eumenes into a decisive battle'},
        {year:316,p:[52.8,31.9],place:'Gabiene',commander:'Antigonus',composition:'Asian grand army and baggage raiders',objective:'Capture the royalist baggage and break its cohesion'},
        {year:314,p:[36.5,35.5],place:'Northern Syrian headquarters',commander:'Antigonus',composition:'Grand army, siege corps, and fleet support',objective:'Strip Ptolemy of the Syrian coast'},
        {year:312,p:[35.2,32.0],place:'Southern Syria after Gaza',commander:'Antigonus',composition:'Reconstituted Syrian army',objective:'Contain Ptolemy and recover the east'},
        {year:306,p:[34.2,35.4],place:'Cyprus and Syrian musters',commander:'Antigonus',composition:'Royal army supported by Demetrius’ fleet',objective:'Turn naval victory into universal kingship'},
        {year:302,p:[31.5,39.1],place:'Central Anatolian concentration',commander:'Antigonus and Demetrius',composition:'The largest Antigonid concentration of the wars',objective:'Crush the allied invasion of Asia'},
        {year:301,p:[31.1,38.9],place:'Ipsus battlefield camp',commander:'Antigonus',composition:'Macedonian phalanx, cavalry, and elephants',objective:'Defeat the coalition and preserve the Asian kingdom'},
      ],
    },
    {
      id:'ptolemaic-army', name:'Ptolemaic Army', faction:'ptolemy', intro:323, end:276,
      description:'Egypt’s compact standing army, backed by the Nile, treasury, fortified frontier, and a fleet that projects power without exposing the kingdom’s core.',
      phases:[
        {year:323,p:[31.4,29.9],place:'Memphis garrison camp',commander:'Ptolemy',composition:'Macedonian settlers, mercenaries, Egyptian support troops',objective:'Secure the Nile valley'},
        {year:321,p:[31.8,30.9],place:'Nile defense line',commander:'Ptolemy',composition:'Field army behind river crossings',objective:'Repel Perdiccas'},
        {year:320,p:[31.4,29.9],place:'Memphis and the eastern Delta',commander:'Ptolemy',composition:'Standing army and fortified frontier garrisons',objective:'Consolidate Egypt after the invasion'},
        {year:312,p:[34.5,31.5],place:'Gaza',commander:'Ptolemy and Seleucus',composition:'Egyptian field army and coalition cavalry',objective:'Break Antigonid control of Syria'},
        {year:311,p:[31.0,30.7],place:'Eastern Delta frontier',commander:'Ptolemaic generals',composition:'Frontier garrisons and mobile reserve',objective:'Hold Egypt and the southern Levant'},
        {year:306,p:[32.1,34.6],place:'Cyprus evacuation anchorages',commander:'Ptolemaic command',composition:'Surviving army and fleet detachments',objective:'Preserve Egypt after Salamis'},
        {year:305,p:[31.0,30.7],place:'Pelusiac frontier',commander:'Ptolemy I',composition:'Royal standing army and Delta fortresses',objective:'Defend the new kingdom'},
      ],
    },
    {
      id:'cassander-army', name:'Cassander’s Macedonians', faction:'antipater', intro:319, end:297,
      description:'The army that turns Antipater’s family network into a territorial monarchy in Macedonia and Greece.',
      phases:[
        {year:319,p:[23.5,38.1],place:'Piraeus and Athens',commander:'Cassander',composition:'Mercenaries, Macedonian adherents, fleet support',objective:'Dislodge Polyperchon from Greece'},
        {year:316,p:[22.6,40.5],place:'Pella',commander:'Cassander',composition:'Macedonian royal army and garrisons',objective:'Secure Macedonia and the royal family'},
        {year:305,p:[22.8,40.3],place:'Macedonian musters',commander:'King Cassander',composition:'Royal army and Greek garrison network',objective:'Preserve the homeland against Antigonid pressure'},
        {year:297,p:[22.6,40.5],place:'Pella royal camp',commander:'Cassander’s household',composition:'Macedonian standing army',objective:'Manage a failing dynastic succession'},
      ],
    },
    {
      id:'demetrian-army', name:'Demetrius’ Expeditionary Force', faction:'antigonus', intro:314, end:285,
      description:'A combined army, fleet, and siege corps whose mobility makes Demetrius the era’s most spectacular—and least predictable—commander.',
      phases:[
        {year:314,p:[35.5,34.9],place:'Syrian coastal camp',commander:'Demetrius',composition:'Young field army with fleet support',objective:'Hold Syria for Antigonus'},
        {year:312,p:[34.5,31.5],place:'Gaza',commander:'Demetrius',composition:'Cavalry-heavy field army and elephants',objective:'Block the Ptolemaic invasion'},
        {year:306,p:[33.9,35.1],place:'Salamis, Cyprus',commander:'Demetrius',composition:'Army, siege train, and victorious fleet',objective:'Destroy Ptolemaic power on Cyprus'},
        {year:304,p:[28.4,36.3],place:'Siege lines around Rhodes',commander:'Demetrius Poliorcetes',composition:'Siege army, Helepolis, and blockade fleet',objective:'Force Rhodes into the Antigonid alliance'},
        {year:301,p:[31.4,38.8],place:'Ipsus cavalry wing',commander:'Demetrius',composition:'Elite heavy cavalry and supporting infantry',objective:'Break the allied line'},
        {year:294,p:[22.7,40.4],place:'Macedonian royal camp',commander:'King Demetrius',composition:'Macedonian army, mercenaries, and fleet',objective:'Hold the Macedonian throne'},
        {year:288,p:[22.0,40.0],place:'Retreat from Macedonia',commander:'Demetrius',composition:'Shrinking loyalist field army',objective:'Escape Pyrrhus and Lysimachus'},
        {year:285,p:[36.1,37.0],place:'Cilician surrender camp',commander:'Demetrius',composition:'Exhausted Asian expedition',objective:'Find a route through Seleucid territory'},
      ],
    },
    {
      id:'seleucid-army', name:'Seleucid Eastern Army', faction:'seleucus', intro:312, end:281,
      description:'The army built from Seleucus’ return to Babylon, reinforced by Iranian cavalry and eventually by Indian war elephants.',
      phases:[
        {year:312,p:[44.5,32.4],place:'Babylon',commander:'Seleucus',composition:'A tiny returning cadre and local recruits',objective:'Retake the eastern capital'},
        {year:308,p:[50.3,34.3],place:'Median campaign camps',commander:'Seleucus',composition:'Babylonian infantry and Iranian cavalry',objective:'Reconnect the Upper Satrapies'},
        {year:305,p:[67.0,33.5],place:'Eastern settlement frontier',commander:'Seleucus I',composition:'Eastern army acquiring Indian elephants',objective:'Settle the frontier with Chandragupta'},
        {year:301,p:[30.8,39.1],place:'Allied camp at Ipsus',commander:'Seleucus',composition:'Combined-arms army with a large elephant corps',objective:'Seal Demetrius’ cavalry away from the battlefield'},
        {year:294,p:[36.3,35.4],place:'Antioch and northern Syria',commander:'Seleucus I',composition:'Royal army of the Seleucid west',objective:'Consolidate Syria and Anatolian approaches'},
        {year:281,p:[28.2,38.5],place:'Corupedium',commander:'Seleucus I',composition:'Veteran royal army',objective:'Defeat Lysimachus and cross into Macedonia'},
      ],
    },
    {
      id:'lysimachid-army', name:'Lysimachid Army', faction:'lysimachus', intro:323, end:281,
      description:'A hard-used Thracian army that grows from frontier garrisons into the decisive European wing of the anti-Antigonid coalition.',
      phases:[
        {year:323,p:[26.6,42.0],place:'Thracian frontier camps',commander:'Lysimachus',composition:'Macedonian garrisons and Thracian levies',objective:'Survive revolts and hold the European satrapy'},
        {year:309,p:[26.7,40.7],place:'Lysimachia',commander:'Lysimachus',composition:'Royal field army and Chersonese garrisons',objective:'Control the crossing between Europe and Asia'},
        {year:302,p:[29.2,40.0],place:'Western Anatolian invasion camp',commander:'Lysimachus',composition:'Thracian-Macedonian army with allied support',objective:'Pin Antigonus until Seleucus arrives'},
        {year:301,p:[30.5,39.2],place:'Allied camp at Ipsus',commander:'Lysimachus',composition:'Coalition infantry and cavalry',objective:'Destroy Antigonus’ Asian monarchy'},
        {year:281,p:[27.9,38.7],place:'Corupedium',commander:'Lysimachus',composition:'Royal army of Thrace and western Asia',objective:'Stop Seleucus’ advance'},
      ],
    },
    {
      id:'pyrrhic-army', name:'Pyrrhic Army', faction:'pyrrhus', intro:288, end:276,
      description:'Pyrrhus’ aggressive Epirote army, small enough to remain mobile and prestigious enough to attract Macedonian defections.',
      phases:[
        {year:288,p:[21.1,39.5],place:'Epirote-Macedonian frontier',commander:'Pyrrhus',composition:'Epirote phalanx, cavalry, and elephants',objective:'Invade Macedonia with Lysimachus'},
        {year:285,p:[21.8,40.2],place:'Western Macedonian camp',commander:'Pyrrhus',composition:'Epirote army and Macedonian defectors',objective:'Hold a share of the Macedonian kingdom'},
        {year:281,p:[20.9,39.3],place:'Epirus mustering grounds',commander:'Pyrrhus',composition:'Expeditionary army preparing for Italy',objective:'Turn west toward Tarentum'},
      ],
    },
  ];
  ARMIES.push(...EXPANSION.armies);

  const SNAPSHOTS = [
    {
      year: 323, short: 'Babylon', war: 'The succession crisis', title: 'One empire. No undisputed king.',
      copy: 'Alexander dies at Babylon. His half-brother Philip III and unborn son Alexander IV become joint kings in name; Perdiccas holds the royal army, while the generals divide the satrapies and wait for the arrangement to fail.',
      territories: ['macedon','greece','thrace','anatoliaWest','anatoliaEast','syria','egypt','mesopotamia','iranWest','iranEast','bactria','indus'].map(region => ({ faction: 'argead', region })),
      labels: [
        { faction: 'argead', name: 'THE MACEDONIAN EMPIRE', p: [49, 34], size: 17 },
        { faction: 'argead', name: 'REGENCY', p: [28, 40], size: 11 },
      ],
      routes: [
        { faction: 'antipater', name: 'Antipater moves south against the Greek revolt', points: [[22.5,40.8],[22.8,39.7],[22.4,38.9]] },
      ],
      battles: [{ name: 'Lamia', p: [22.43,38.9], note: 'The Greek coalition traps Antipater at Lamia during the revolt that follows Alexander’s death.' }],
      dispatches: [
        ['argead','Partition of Babylon','Satrapies are assigned under a nominal joint kingship.'],
        ['perdiccas','Perdiccas','The chiliarch controls the kings and the central army.'],
        ['ptolemy','Ptolemy','Takes Egypt, the most defensible and richest compact satrapy.'],
      ],
    },
    {
      year: 322, short: 'Lamia', war: 'The Lamian War', title: 'Macedon restores its grip on Greece.',
      copy: 'Athens and its allies try to break Macedonian control while the succession remains unsettled. Antipater escapes the siege of Lamia, receives reinforcements, and defeats the coalition at Crannon.',
      territories: [
        { faction: 'antipater', region: 'macedon' }, { faction: 'antipater', region: 'greece' },
        { faction: 'perdiccas', region: 'anatoliaWest' }, { faction: 'perdiccas', region: 'anatoliaEast' }, { faction: 'perdiccas', region: 'syria' }, { faction: 'perdiccas', region: 'mesopotamia' }, { faction: 'perdiccas', region: 'iranWest' }, { faction: 'perdiccas', region: 'iranEast' }, { faction: 'perdiccas', region: 'bactria' }, { faction: 'perdiccas', region: 'indus' },
        { faction: 'ptolemy', region: 'egypt' }, { faction: 'ptolemy', region: 'cyrenaica' }, { faction: 'lysimachus', region: 'thrace' },
      ],
      labels: [
        { faction: 'perdiccas', name: 'THE ROYAL ARMY', p: [48,34], size: 15 },
        { faction: 'ptolemy', name: 'PTOLEMY', p: [29,27], size: 12 },
        { faction: 'antipater', name: 'ANTIPATER', p: [22.7,40.5], size: 9 },
      ],
      routes: [
        { faction: 'antipater', name: 'Antipater and Craterus converge on Thessaly', points: [[22.5,40.7],[23.0,39.7],[22.4,39.0]] },
        { faction: 'antipater', name: 'Leonnatus crosses from Asia to relieve Antipater', points: [[27.8,39.6],[25.7,40.1],[23.3,39.4]] },
      ],
      battles: [{ name: 'Crannon', p: [22.28,39.52], note: 'The Macedonian victory ends the Greek coalition’s ability to continue the war.' }],
      dispatches: [
        ['antipater','Crannon','Macedonian victory ends the revolt in 322 BCE.'],
        ['perdiccas','Central command','Perdiccas remains regent and guardian of the kings.'],
        ['ptolemy','Egypt fortified','Ptolemy begins turning a satrapy into a durable power base.'],
      ],
    },
    {
      year: 321, short: 'The Nile', war: 'First War of the Diadochi', title: 'Perdiccas invades Egypt—and loses his army.',
      copy: 'Perdiccas tries to break Ptolemy before a wider coalition can close in. Failed Nile crossings destroy confidence in the regent. His own officers murder him in camp; the center of the empire collapses with him.',
      territories: [
        { faction: 'antipater', region: 'macedon' }, { faction: 'antipater', region: 'greece' },
        { faction: 'antigonus', region: 'anatoliaWest' }, { faction: 'perdiccas', region: 'anatoliaEast' }, { faction: 'perdiccas', region: 'syria' }, { faction: 'perdiccas', region: 'mesopotamia' }, { faction: 'perdiccas', region: 'iranWest' }, { faction: 'perdiccas', region: 'iranEast' }, { faction: 'perdiccas', region: 'bactria' }, { faction: 'perdiccas', region: 'indus' },
        { faction: 'ptolemy', region: 'egypt' }, { faction: 'ptolemy', region: 'cyrenaica' }, { faction: 'lysimachus', region: 'thrace' },
      ],
      labels: [
        { faction: 'perdiccas', name: 'PERDICCAS', p: [48,34], size: 14 },
        { faction: 'ptolemy', name: 'PTOLEMY', p: [29,27], size: 12 },
        { faction: 'antigonus', name: 'ANTIGONUS', p: [29.5,39], size: 9 },
      ],
      routes: [
        { faction: 'perdiccas', name: 'Perdiccas marches from Asia to the Nile', points: [[44.4,32.5],[39.1,33.4],[35.8,31.8],[32.4,30.8],[31.2,30.4]] },
        { faction: 'antigonus', name: 'Antigonus sails to Macedonia to join the coalition', naval: true, points: [[28.7,37.9],[25.4,39.0],[23.0,40.4]] },
      ],
      battles: [{ name: 'Pelusium', p: [32.55,31.04], note: 'Repeated attempts to force the Nile fail; Perdiccas is killed by his officers soon afterward.' }],
      dispatches: [
        ['perdiccas','Nile disaster','Failed crossings and heavy losses trigger mutiny.'],
        ['ptolemy','Defends Egypt','Ptolemy wins without risking his compact territorial base.'],
        ['antipater','Triparadisus','The victors make Antipater regent and redistribute commands.'],
      ],
    },
    {
      year: 319, short: 'Regency breaks', war: 'Second War of the Diadochi', title: 'Antipater dies. The settlement detonates.',
      copy: 'Antipater names Polyperchon—not his son Cassander—as regent. Cassander, Antigonus, and Ptolemy align against him. Eumenes receives the royal cause in Asia and begins the longest operational march of the wars.',
      territories: [
        { faction: 'antipater', region: 'macedon' }, { faction: 'antipater', region: 'greece' },
        { faction: 'antigonus', region: 'anatoliaWest' }, { faction: 'eumenes', region: 'anatoliaEast' }, { faction: 'eumenes', region: 'syria' },
        { faction: 'seleucus', region: 'mesopotamia' }, { faction: 'independent', region: 'iranWest' }, { faction: 'independent', region: 'iranEast' }, { faction: 'independent', region: 'bactria' }, { faction: 'independent', region: 'indus' },
        { faction: 'ptolemy', region: 'egypt' }, { faction: 'ptolemy', region: 'cyrenaica' }, { faction: 'lysimachus', region: 'thrace' },
      ],
      labels: [
        { faction: 'eumenes', name: 'EUMENES', p: [38.5,37], size: 11 },
        { faction: 'antigonus', name: 'ANTIGONUS', p: [29.5,39], size: 10 },
        { faction: 'ptolemy', name: 'PTOLEMY', p: [29,27], size: 12 },
      ],
      routes: [
        { faction: 'eumenes', name: 'Eumenes gathers the royal forces in Cilicia', points: [[36.7,40.3],[36.2,38.0],[35.3,36.7]] },
        { faction: 'antigonus', name: 'Antigonus crosses Anatolia to hunt Eumenes', points: [[28.0,38.5],[31.6,38.3],[34.8,37.1]] },
      ],
      battles: [{ name: 'Orkynia', p: [33.4,39.4], note: 'Antigonus defeats Eumenes in Cappadocia, but cannot end the campaign.' }],
      dispatches: [
        ['antipater','Two regents','Polyperchon holds the office; Cassander claims Antipater’s network.'],
        ['eumenes','The royalist','Eumenes fights in the names of the kings against Antigonus.'],
        ['antigonus','Command of Asia','Antigonus is ordered to destroy the remaining Perdiccan forces.'],
      ],
    },
    {
      year: 316, short: 'Gabiene', war: 'Third War of the Diadochi', title: 'Antigonus becomes master of Asia.',
      copy: 'After campaigns from Anatolia to Iran, Eumenes and Antigonus meet at Paraitacene and Gabiene. Antigonus captures the enemy baggage camp; the elite Silver Shields trade Eumenes for their families and possessions.',
      territories: [
        { faction: 'antipater', region: 'macedon' }, { faction: 'antipater', region: 'greece' }, { faction: 'lysimachus', region: 'thrace' },
        { faction: 'antigonus', region: 'anatoliaWest' }, { faction: 'antigonus', region: 'anatoliaEast' }, { faction: 'antigonus', region: 'syria' }, { faction: 'antigonus', region: 'mesopotamia' }, { faction: 'antigonus', region: 'iranWest' }, { faction: 'antigonus', region: 'iranEast' },
        { faction: 'independent', region: 'bactria' }, { faction: 'independent', region: 'indus' }, { faction: 'ptolemy', region: 'egypt' }, { faction: 'ptolemy', region: 'cyrenaica' },
      ],
      labels: [
        { faction: 'antigonus', name: 'ANTIGONUS · MASTER OF ASIA', p: [46,35], size: 15 },
        { faction: 'ptolemy', name: 'PTOLEMY', p: [29,27], size: 12 },
        { faction: 'antipater', name: 'CASSANDER', p: [22.7,40.5], size: 9 },
      ],
      routes: [
        { faction: 'eumenes', name: 'Eumenes marches east with the Silver Shields', points: [[35.4,36.8],[41.5,34.6],[48.6,32.7],[52.4,31.8]] },
        { faction: 'antigonus', name: 'Antigonus pursues across Mesopotamia and Media', points: [[37.0,37.0],[43.8,35.0],[49.5,33.5],[52.2,31.9]] },
      ],
      battles: [{ name: 'Gabiene', p: [52.4,31.7], note: 'Antigonus wins the campaign through capture of the baggage, not a clean tactical victory.' }],
      dispatches: [
        ['antigonus','Asia consolidated','Antigonus controls the largest military-fiscal base in the empire.'],
        ['eumenes','Eumenes executed','The last effective champion of the joint kingship is removed.'],
        ['seleucus','Seleucus flees','Driven from Babylon, Seleucus takes refuge with Ptolemy.'],
      ],
    },
    {
      year: 312, short: 'Babylon', war: 'The Babylonian War', title: 'Seleucus rides east with a tiny force.',
      copy: 'Demetrius loses to Ptolemy at Gaza. Seleucus uses the opening to return to Babylon with a small following, retakes the satrapy, and survives Antigonid counterattacks. The Seleucid era will later be dated from this return.',
      territories: [
        { faction: 'antipater', region: 'macedon' }, { faction: 'antipater', region: 'greece' }, { faction: 'lysimachus', region: 'thrace' },
        { faction: 'antigonus', region: 'anatoliaWest' }, { faction: 'antigonus', region: 'anatoliaEast' }, { faction: 'antigonus', region: 'syria' },
        { faction: 'seleucus', region: 'mesopotamia' }, { faction: 'seleucus', region: 'iranWest' }, { faction: 'independent', region: 'iranEast' }, { faction: 'independent', region: 'bactria' }, { faction: 'independent', region: 'indus' },
        { faction: 'ptolemy', region: 'egypt' }, { faction: 'ptolemy', region: 'cyrenaica' }, { faction: 'ptolemy', region: 'levantCoast' },
      ],
      labels: [
        { faction: 'antigonus', name: 'ANTIGONUS', p: [34,39], size: 12 },
        { faction: 'seleucus', name: 'SELEUCUS', p: [48,33], size: 12 },
        { faction: 'ptolemy', name: 'PTOLEMY', p: [29,27], size: 12 },
      ],
      routes: [
        { faction: 'seleucus', name: 'Seleucus returns from Gaza to Babylon', points: [[34.5,31.6],[37.8,32.6],[41.1,33.5],[44.4,32.6]] },
        { faction: 'antigonus', name: 'Demetrius attempts to recover Babylonia', points: [[36.3,35.4],[39.6,34.5],[44.1,33.0]] },
      ],
      battles: [{ name: 'Gaza', p: [34.47,31.5], note: 'Ptolemy defeats Demetrius; the defeat creates the opening for Seleucus’ return.' }],
      dispatches: [
        ['ptolemy','Victory at Gaza','Ptolemy breaks Demetrius’ field army in the south.'],
        ['seleucus','Return to Babylon','A small mobile column becomes the seed of an Asian empire.'],
        ['antigonus','Two-front problem','Antigonus must hold Syria while trying to recover the east.'],
      ],
    },
    {
      year: 306, short: 'The kings', war: 'Fourth War of the Diadochi', title: 'A naval victory creates five kings.',
      copy: 'Demetrius destroys Ptolemy’s fleet off Salamis in Cyprus. Antigonus and Demetrius assume the royal title; Ptolemy, Seleucus, Cassander, and Lysimachus follow. The fiction of a single Argead empire ends.',
      territories: [
        { faction: 'antipater', region: 'macedon' }, { faction: 'antipater', region: 'greece' }, { faction: 'lysimachus', region: 'thrace' },
        { faction: 'antigonus', region: 'anatoliaWest' }, { faction: 'antigonus', region: 'anatoliaEast' }, { faction: 'antigonus', region: 'syria' }, { faction: 'antigonus', region: 'cyprus' },
        { faction: 'seleucus', region: 'mesopotamia' }, { faction: 'seleucus', region: 'iranWest' }, { faction: 'seleucus', region: 'iranEast' }, { faction: 'seleucus', region: 'bactria' },
        { faction: 'maurya', region: 'indus' }, { faction: 'ptolemy', region: 'egypt' }, { faction: 'ptolemy', region: 'cyrenaica' },
      ],
      labels: [
        { faction: 'antigonus', name: 'ANTIGONID ASIA', p: [35,38.5], size: 13 },
        { faction: 'seleucus', name: 'SELEUCID EAST', p: [55,33], size: 14 },
        { faction: 'ptolemy', name: 'PTOLEMAIC EGYPT', p: [29,27], size: 12 },
      ],
      routes: [
        { faction: 'antigonus', name: 'Demetrius sails from Cilicia to Cyprus', naval: true, points: [[34.7,36.4],[34.5,35.8],[33.9,35.2]] },
        { faction: 'ptolemy', name: 'Ptolemy’s relief fleet sails from Egypt', naval: true, points: [[29.9,31.2],[31.8,33.0],[33.8,35.0]] },
      ],
      battles: [{ name: 'Salamis', p: [33.9,35.18], note: 'Demetrius’ victory captures or destroys most of the Ptolemaic fleet and secures Cyprus.' }],
      dispatches: [
        ['antigonus','Antigonus takes the diadem','The One-Eyed and Demetrius proclaim themselves kings.'],
        ['ptolemy','Rival kingship','Ptolemy adopts the title while retaining Egypt after repelling invasion.'],
        ['seleucus','Eastern settlement','Seleucus trades the Indus lands to Chandragupta for peace and war elephants.'],
      ],
    },
    {
      year: 301, short: 'Ipsus', war: 'Fourth War of the Diadochi', title: 'The elephants close the road at Ipsus.',
      copy: 'Lysimachus invades Anatolia and links with Seleucus. At Ipsus, Seleucus’ elephants prevent Demetrius from returning to the battlefield. Antigonus dies fighting; his Asian kingdom is divided by the victors.',
      territories: [
        { faction: 'antipater', region: 'macedon' }, { faction: 'antipater', region: 'greece' }, { faction: 'lysimachus', region: 'thrace' }, { faction: 'lysimachus', region: 'anatoliaWest' },
        { faction: 'antigonus', region: 'anatoliaEast' }, { faction: 'antigonus', region: 'syria' },
        { faction: 'seleucus', region: 'mesopotamia' }, { faction: 'seleucus', region: 'iranWest' }, { faction: 'seleucus', region: 'iranEast' }, { faction: 'seleucus', region: 'bactria' },
        { faction: 'maurya', region: 'indus' }, { faction: 'ptolemy', region: 'egypt' }, { faction: 'ptolemy', region: 'cyrenaica' }, { faction: 'ptolemy', region: 'levantCoast' },
      ],
      labels: [
        { faction: 'antigonus', name: 'ANTIGONUS', p: [36,38], size: 11 },
        { faction: 'seleucus', name: 'SELEUCUS', p: [55,33], size: 14 },
        { faction: 'lysimachus', name: 'LYSIMACHUS', p: [28.8,40.5], size: 9 },
      ],
      routes: [
        { faction: 'lysimachus', name: 'Lysimachus invades western Anatolia', points: [[28.4,41.0],[29.0,39.9],[30.8,38.9]] },
        { faction: 'seleucus', name: 'Seleucus marches west with the eastern army and elephants', points: [[44.4,32.6],[39.8,35.2],[35.1,37.3],[31.1,38.8]] },
        { faction: 'antigonus', name: 'Antigonus concentrates from Syria', points: [[36.2,36.2],[34.0,37.2],[31.2,38.8]] },
      ],
      battles: [{ name: 'Ipsus', p: [30.98,38.78], note: 'Antigonus is killed and his bid to reunify the empire ends.' }],
      dispatches: [
        ['seleucus','Elephant screen','Seleucus uses his elephants to isolate Demetrius’ returning cavalry.'],
        ['antigonus','Antigonus killed','The last great Asian reunification project dies with him.'],
        ['lysimachus','Anatolian kingdom','Lysimachus receives much of western Asia Minor after the victory.'],
      ],
    },
    {
      year: 294, short: 'Demetrius', war: 'The struggle for Macedon', title: 'The fugitive king takes Alexander’s homeland.',
      copy: 'Demetrius survives Ipsus with his fleet and fortified cities. After years of maneuver he seizes Macedon, only to face a widening coalition of Pyrrhus, Lysimachus, Ptolemy, and Seleucus.',
      territories: [
        { faction: 'antigonus', region: 'macedon' }, { faction: 'antigonus', region: 'greece' }, { faction: 'pyrrhus', region: 'epirus' },
        { faction: 'lysimachus', region: 'thrace' }, { faction: 'lysimachus', region: 'anatoliaWest' },
        { faction: 'seleucus', region: 'anatoliaEast' }, { faction: 'seleucus', region: 'syria' }, { faction: 'seleucus', region: 'mesopotamia' }, { faction: 'seleucus', region: 'iranWest' }, { faction: 'seleucus', region: 'iranEast' }, { faction: 'seleucus', region: 'bactria' },
        { faction: 'maurya', region: 'indus' }, { faction: 'ptolemy', region: 'egypt' }, { faction: 'ptolemy', region: 'cyrenaica' }, { faction: 'ptolemy', region: 'levantCoast' }, { faction: 'ptolemy', region: 'cyprus' },
      ],
      labels: [
        { faction: 'antigonus', name: 'DEMETRIUS', p: [23,40.5], size: 10 },
        { faction: 'lysimachus', name: 'LYSIMACHUS', p: [29.5,39.6], size: 9 },
        { faction: 'seleucus', name: 'SELEUCUS', p: [48,34], size: 14 },
        { faction: 'ptolemy', name: 'PTOLEMY', p: [29,27], size: 11 },
      ],
      routes: [
        { faction: 'antigonus', name: 'Demetrius moves from central Greece into Macedon', points: [[23.7,38.0],[23.2,39.2],[22.6,40.7]] },
        { faction: 'pyrrhus', name: 'Pyrrhus presses east from Epirus', points: [[20.0,39.4],[21.2,40.1],[22.3,40.5]] },
      ],
      battles: [{ name: 'Macedon', p: [22.7,40.6], note: 'Demetrius becomes king of Macedon, but his enlarged ambitions soon unite the other kings against him.' }],
      dispatches: [
        ['antigonus','A kingdom rebuilt','Fleet, siege train, and Greek garrisons keep Demetrius in the contest.'],
        ['pyrrhus','Epirus rising','Pyrrhus raids Macedon and becomes the most dangerous western rival.'],
        ['lysimachus','Pressure from Thrace','Lysimachus waits on Macedon’s eastern frontier.'],
      ],
    },
    {
      year: 281, short: 'Corupedium', war: 'The last war of the Successors', title: 'The final two companions meet in Lydia.',
      copy: 'Lysimachus controls Thrace, Macedon, and western Anatolia. Seleucus crosses into Asia Minor and defeats him at Corupedium. For a few months, Seleucus stands closer than anyone since Antigonus to reassembling the empire.',
      territories: [
        { faction: 'lysimachus', region: 'macedon' }, { faction: 'independent', region: 'greece' }, { faction: 'pyrrhus', region: 'epirus' },
        { faction: 'lysimachus', region: 'thrace' }, { faction: 'lysimachus', region: 'anatoliaWest' },
        { faction: 'seleucus', region: 'anatoliaEast' }, { faction: 'seleucus', region: 'syria' }, { faction: 'seleucus', region: 'mesopotamia' }, { faction: 'seleucus', region: 'iranWest' }, { faction: 'seleucus', region: 'iranEast' }, { faction: 'seleucus', region: 'bactria' },
        { faction: 'maurya', region: 'indus' }, { faction: 'ptolemy', region: 'egypt' }, { faction: 'ptolemy', region: 'cyrenaica' }, { faction: 'ptolemy', region: 'levantCoast' }, { faction: 'ptolemy', region: 'cyprus' },
      ],
      labels: [
        { faction: 'lysimachus', name: 'LYSIMACHUS', p: [28,40], size: 11 },
        { faction: 'seleucus', name: 'SELEUCUS', p: [49,34], size: 15 },
        { faction: 'ptolemy', name: 'PTOLEMAIC EGYPT', p: [29,27], size: 11 },
      ],
      routes: [
        { faction: 'seleucus', name: 'Seleucus advances across Anatolia', points: [[36.2,36.2],[33.1,37.3],[29.6,38.2],[28.0,38.6]] },
        { faction: 'lysimachus', name: 'Lysimachus moves south from the Hellespont', points: [[27.4,40.2],[27.6,39.4],[28.0,38.6]] },
      ],
      battles: [{ name: 'Corupedium', p: [28.05,38.62], note: 'Lysimachus is killed. Seleucus wins the last battle fought between Alexander’s original Successors.' }],
      dispatches: [
        ['seleucus','Last survivor','Seleucus defeats Lysimachus and claims Macedon.'],
        ['lysimachus','Killed in battle','His transcontinental kingdom immediately fragments.'],
        ['ptolemy','Ptolemy Ceraunus','The exiled Ptolemaic prince murders Seleucus shortly afterward.'],
      ],
    },
    {
      year: 276, short: 'Three worlds', war: 'The Hellenistic settlement', title: 'The age of improvisation becomes a system.',
      copy: 'After invasion, murder, and a Galatian shock, Antigonus II Gonatas secures Macedon. The map has settled into three durable dynastic centers: Antigonid Macedon, Ptolemaic Egypt, and Seleucid Asia.',
      territories: [
        { faction: 'antigonus', region: 'macedon' }, { faction: 'antigonus', region: 'greece' }, { faction: 'pyrrhus', region: 'epirus' },
        { faction: 'independent', region: 'thrace' }, { faction: 'independent', region: 'anatoliaWest' },
        { faction: 'seleucus', region: 'anatoliaEast' }, { faction: 'seleucus', region: 'syria' }, { faction: 'seleucus', region: 'mesopotamia' }, { faction: 'seleucus', region: 'iranWest' }, { faction: 'seleucus', region: 'iranEast' }, { faction: 'seleucus', region: 'bactria' },
        { faction: 'maurya', region: 'indus' }, { faction: 'ptolemy', region: 'egypt' }, { faction: 'ptolemy', region: 'cyrenaica' }, { faction: 'ptolemy', region: 'levantCoast' }, { faction: 'ptolemy', region: 'cyprus' },
      ],
      labels: [
        { faction: 'antigonus', name: 'ANTIGONID MACEDON', p: [23,40.5], size: 9 },
        { faction: 'seleucus', name: 'SELEUCID KINGDOM', p: [49,34], size: 15 },
        { faction: 'ptolemy', name: 'PTOLEMAIC KINGDOM', p: [29,27], size: 11 },
      ],
      routes: [
        { faction: 'antigonus', name: 'Antigonus Gonatas secures Macedon after defeating the Galatians', points: [[26.7,40.6],[24.5,40.8],[22.7,40.7]] },
      ],
      battles: [{ name: 'Lysimacheia', p: [26.38,40.58], note: 'Antigonus’ victory over the Galatians helps establish his authority in Macedon.' }],
      dispatches: [
        ['antigonus','Antigonid Macedon','A dynasty finally holds the old homeland.'],
        ['ptolemy','Ptolemaic Egypt','The richest compact successor kingdom endures for centuries.'],
        ['seleucus','Seleucid Asia','The largest successor realm links Syria, Mesopotamia, and Iran.'],
      ],
    },
  ];
  SNAPSHOTS.push(...EXPANSION.snapshots);
  SNAPSHOTS.sort((a, b) => b.year - a.year);

  const svg = d3.select('#map');
  const tooltip = document.getElementById('tooltip');
  const mapPanel = document.querySelector('.map-panel');
  const yearRail = document.getElementById('year-rail');
  const playButton = document.getElementById('play');
  const eraJump = document.getElementById('era-jump');
  const previousButton = document.getElementById('previous-year');
  const nextButton = document.getElementById('next-year');
  const castRail = document.getElementById('cast-rail');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lineClosed = d3.line().curve(d3.curveLinearClosed);
  const routeCurve = d3.line().curve(d3.curveCatmullRom.alpha(.65));
  let world;
  let physical = { lakes: null, rivers: null };
  let projection;
  let path;
  let root;
  let mapLayer;
  let mapWidth;
  let mapHeight;
  let currentIndex = 0;
  let transitionSequence = 0;
  let playback;
  let zoomBehavior;
  let currentZoomTransform = d3.zoomIdentity;
  let cityGroups;
  let personGroups;
  let armyGroups;
  let selectedCity;
  let selectedPerson;
  let selectedArmy;
  let selectedBattle;

  const STORY_YEARS = [...new Set([...SNAPSHOTS.map(snapshot => snapshot.year), ...d3.range(323, 275, -1)])].sort((a, b) => b - a);
  const YEAR_STATES = STORY_YEARS.map(year => {
    const exact = SNAPSHOTS.find(snapshot => snapshot.year === year);
    if (exact) return { ...exact, milestone: true, sourceYear: year };
    const previous = [...SNAPSHOTS].reverse().find(snapshot => snapshot.year > year) || SNAPSHOTS[0];
    const next = SNAPSHOTS.find(snapshot => snapshot.year < year);
    return {
      ...previous,
      year,
      sourceYear: previous.year,
      milestone: false,
      short: '—',
      war: 'Intervening year',
      title: 'The balance holds.',
      copy: `No major territorial redistribution is plotted for ${year} BCE. Control carries forward from the ${previous.year} BCE settlement${next ? ` toward the next documented shift in ${next.year} BCE` : ''}.`,
      routes: [],
      battles: [],
    };
  });

  function yearLabel(year) { return `${Math.abs(year)} ${year > 0 ? 'BCE' : 'CE'}`; }
  function yearNumber(year) { return Math.abs(year); }
  function yearEra(year) { return year > 0 ? 'BCE' : 'CE'; }

  const eventEls = YEAR_STATES.map((snapshot, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `year-button${snapshot.milestone ? ' milestone' : ''}`;
    button.dataset.index = index;
    button.setAttribute('aria-label', `${yearLabel(snapshot.year)}: ${snapshot.title}`);
    button.innerHTML = `<span class="year">${yearNumber(snapshot.year)}</span><span class="era-mini">${yearEra(snapshot.year)}</span><span class="short">${snapshot.short}</span>`;
    button.addEventListener('click', () => { stopPlayback(); setYear(index, true); });
    yearRail.appendChild(button);
    return button;
  });
  yearRail.style.gridTemplateColumns = `repeat(${YEAR_STATES.length}, minmax(52px, 1fr))`;
  yearRail.style.minWidth = `${YEAR_STATES.length * 52}px`;

  function polygonPath(points) {
    return lineClosed(points.map(point => projection(point)));
  }

  function mergeFactionCells(items, fillGaps = true) {
    const sample = 3;
    const width = Math.ceil(mapWidth / sample);
    const height = Math.ceil(mapHeight / sample);
    const byFaction = d3.group(items, item => item.faction);
    const contourPath = d3.geoPath(d3.geoIdentity().scale(sample));
    if (byFaction.size === 1) {
      const faction = byFaction.keys().next().value;
      return [{ faction, d: `M0,0H${mapWidth}V${mapHeight}H0Z` }];
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const prepared = items.map((item, itemIndex) => {
      const points = REGIONS[item.cell].map(point => projection(point).map(value => value / sample));
      return { ...item, itemIndex, points, center: d3.polygonCentroid(points) };
    });

    prepared.forEach((cell, index) => {
      const code = (index + 1) * 8;
      context.fillStyle = `rgb(${code},0,0)`;
      context.beginPath();
      cell.points.forEach(([x, y], pointIndex) => pointIndex ? context.lineTo(x, y) : context.moveTo(x, y));
      context.closePath();
      context.fill();
    });

    const pixels = context.getImageData(0, 0, width, height).data;
    const assignment = new Uint16Array(width * height);
    for (let index = 0; index < assignment.length; index += 1) {
      const encoded = Math.round(pixels[index * 4] / 8) - 1;
      if (pixels[index * 4 + 3] > 250 && encoded >= 0 && encoded < prepared.length) {
        assignment[index] = encoded;
        continue;
      }
      const x = index % width;
      const y = Math.floor(index / width);
      if (!fillGaps) {
        assignment[index] = 65535;
        continue;
      }
      let closest = 0;
      let closestDistance = Infinity;
      prepared.forEach((cell, cellIndex) => {
        const dx = x - cell.center[0];
        const dy = y - cell.center[1];
        const distance = dx * dx + dy * dy;
        if (distance < closestDistance) { closestDistance = distance; closest = cellIndex; }
      });
      assignment[index] = closest;
    }

    return [...byFaction.keys()].map(faction => {
      const values = new Float32Array(width * height);
      for (let index = 0; index < values.length; index += 1) {
        const assigned = assignment[index];
        values[index] = assigned < prepared.length && prepared[assigned].faction === faction ? 1 : 0;
      }
      const geometry = d3.contours().size([width, height]).smooth(true).thresholds([.5])(values)[0];
      return { faction, d: geometry ? contourPath(geometry) : '' };
    });
  }

  function showTooltip(event, title, copy) {
    tooltip.innerHTML = `<strong>${title}</strong>${copy || ''}`;
    tooltip.hidden = false;
    const pad = 14;
    const rect = tooltip.getBoundingClientRect();
    let left = event.clientX + 14;
    let top = event.clientY + 14;
    if (left + rect.width > window.innerWidth - pad) left = event.clientX - rect.width - 14;
    if (top + rect.height > window.innerHeight - pad) top = event.clientY - rect.height - 14;
    tooltip.style.left = `${Math.max(pad, left)}px`;
    tooltip.style.top = `${Math.max(pad, top)}px`;
  }

  function hideTooltip() { tooltip.hidden = true; }

  function cityIsAvailable(city, year) {
    return (!city.from || year <= city.from) && (!city.end || year >= city.end);
  }

  function peopleForYear(year) {
    return PEOPLE.filter(person => year <= person.intro && year >= person.end);
  }

  function armiesForYear(year) {
    return ARMIES.filter(army => year <= army.intro && year >= army.end);
  }

  function armyPhase(army, year) {
    let current = army.phases[0];
    army.phases.forEach(phase => { if (year <= phase.year) current = phase; });
    return current;
  }

  function armyMovement(army, year) {
    const index = army.phases.findIndex(phase => phase.year === year);
    if (index <= 0) return null;
    return { army, from: army.phases[index - 1], to: army.phases[index] };
  }

  function closeBattleProfile() {
    selectedBattle = undefined;
    document.getElementById('battle-profile').hidden = true;
    document.getElementById('battle-back').hidden = true;
    document.getElementById('campaign-profile').hidden = false;
  }

  function armyOffset(army) {
    const offsets = {
      'royal-army':[36,25], 'european-army':[36,25], 'eumenid-army':[-36,25],
      'antigonid-army':[36,25], 'ptolemaic-army':[36,25], 'cassander-army':[-36,25],
      'demetrian-army':[36,-25], 'seleucid-army':[-36,25], 'lysimachid-army':[-36,25],
      'pyrrhic-army':[36,25],
    };
    return offsets[army.id] || [34,24];
  }

  function armyTransform(army, year, scale = currentZoomTransform.k) {
    const [x, y] = projection(armyPhase(army, year).p);
    const [dx, dy] = armyOffset(army);
    return `translate(${x + dx / scale} ${y + dy / scale}) scale(${1 / scale})`;
  }

  function updateArmyScale(transform = currentZoomTransform) {
    if (!armyGroups) return;
    const year = YEAR_STATES[currentIndex].year;
    armyGroups
      .attr('transform', army => armyTransform(army, year, transform.k))
      .classed('show-label', () => transform.k >= 1.45);
  }

  function personPhase(person, year) {
    let current = person.phases[0];
    person.phases.forEach(phase => { if (year <= phase.year) current = phase; });
    return current;
  }

  function personPosition(person, year) {
    const positions = person.positions;
    if (year >= positions[0].year) return { ...positions[0], p: [...positions[0].p] };
    for (let index = 0; index < positions.length - 1; index += 1) {
      const start = positions[index];
      const end = positions[index + 1];
      if (year <= start.year && year >= end.year) {
        const progress = (start.year - year) / Math.max(1, start.year - end.year);
        return {
          p: [d3.interpolateNumber(start.p[0], end.p[0])(progress), d3.interpolateNumber(start.p[1], end.p[1])(progress)],
          place: progress < .5 ? start.place : end.place,
        };
      }
    }
    return { ...positions.at(-1), p: [...positions.at(-1).p] };
  }

  function personTransform(person, year, scale = currentZoomTransform.k) {
    const [x, y] = projection(personPosition(person, year).p);
    return `translate(${x} ${y}) scale(${1 / scale})`;
  }

  function updatePersonScale(transform = currentZoomTransform) {
    if (!personGroups) return;
    const year = YEAR_STATES[currentIndex].year;
    personGroups.attr('transform', person => personTransform(person, year, transform.k));
  }

  function cityIconType(city) {
    const kind = city.kind.toLowerCase();
    if (/capital|royal/.test(kind)) return 'capital';
    if (/port|maritime|harbor/.test(kind)) return 'port';
    if (/fortress|military|frontier/.test(kind)) return 'fortress';
    if (/metropolis|great polis|regional metropolis/.test(kind)) return 'metropolis';
    return 'town';
  }

  function cityIconSize(city) {
    if (cityIconType(city) === 'capital') return city.tier === 1 ? 15 : 11;
    return city.tier === 1 ? 12 : 8.5;
  }

  function cityYearContext(city) {
    const snapshot = YEAR_STATES[currentIndex];
    const distance = point => Math.hypot(city.p[0] - point[0], city.p[1] - point[1]);
    const battle = snapshot.battles.find(item => distance(item.p) < 1.15);
    if (battle) return `${battle.name} battle zone · ${yearLabel(snapshot.year)}`;
    const route = snapshot.routes.find(item => item.points.some(point => distance(point) < 1.2));
    if (route) return `${route.name} passes nearby`;
    const army = armiesForYear(snapshot.year).find(item => distance(armyPhase(item, snapshot.year).p) < 1.15);
    if (army) return `${army.name} operating nearby`;
    return `No major mapped action · ${yearLabel(snapshot.year)}`;
  }

  function cityDrawPriority(city) {
    return (city.tier === 1 ? 10 : 0) + (cityIconType(city) === 'capital' ? 10 : 0);
  }

  function cityTransform(city, scale = currentZoomTransform.k) {
    const [x, y] = projection(city.p);
    return `translate(${x} ${y}) scale(${1 / scale})`;
  }

  function updateCityScale(transform = currentZoomTransform) {
    if (!cityGroups) return;
    cityGroups
      .attr('transform', city => cityTransform(city, transform.k))
      .classed('show-secondary', city => city.tier === 2 && transform.k >= 1.7);
  }

  function closePersonProfile() {
    selectedPerson = undefined;
    document.getElementById('person-profile').hidden = true;
    document.getElementById('person-back').hidden = true;
    document.getElementById('campaign-profile').hidden = false;
    if (personGroups) personGroups.classed('selected', false);
    castRail?.querySelectorAll('.cast-card').forEach(card => card.classList.remove('selected'));
  }

  function closeArmyProfile() {
    selectedArmy = undefined;
    document.getElementById('army-profile').hidden = true;
    document.getElementById('army-back').hidden = true;
    document.getElementById('campaign-profile').hidden = false;
    if (armyGroups) armyGroups.classed('selected', false);
  }

  function closeCityProfile() {
    selectedCity = undefined;
    document.getElementById('city-profile').hidden = true;
    document.getElementById('city-back').hidden = true;
    document.getElementById('campaign-profile').hidden = false;
    if (cityGroups) cityGroups.classed('selected', false);
  }

  function selectCity(city) {
    stopPlayback();
    selectedCity = city;
    selectedPerson = undefined;
    selectedArmy = undefined;
    selectedBattle = undefined;
    document.getElementById('campaign-profile').hidden = true;
    document.getElementById('person-profile').hidden = true;
    document.getElementById('person-back').hidden = true;
    document.getElementById('army-profile').hidden = true;
    document.getElementById('army-back').hidden = true;
    document.getElementById('battle-profile').hidden = true;
    document.getElementById('battle-back').hidden = true;
    document.getElementById('city-profile').hidden = false;
    document.getElementById('city-back').hidden = false;
    document.getElementById('city-name').textContent = city.name;
    document.getElementById('city-dossier-symbol').setAttribute('href', `#city-icon-${cityIconType(city)}`);
    document.getElementById('city-ancient').textContent = city.ancient;
    document.getElementById('city-kind').textContent = city.kind;
    document.getElementById('city-region').textContent = city.region;
    document.getElementById('city-modern').textContent = city.modern;
    document.getElementById('city-context').textContent = cityYearContext(city);
    document.getElementById('city-summary').textContent = city.summary;
    if (cityGroups) cityGroups.classed('selected', item => item === city);
    if (window.innerWidth < 981) {
      document.querySelector('.detail-panel').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }

  function populatePersonProfile(person, year) {
    const phase = personPhase(person, year);
    const position = personPosition(person, year);
    const isDeathYear = person.death === year;
    const portraitImage = document.getElementById('person-portrait');
    const portraitMonogram = document.getElementById('person-monogram');
    portraitImage.hidden = !person.portrait;
    portraitMonogram.hidden = Boolean(person.portrait);
    portraitMonogram.textContent = person.monogram || person.name.split(/\s+/).map(part => part[0]).slice(0,2).join('');
    if (person.portrait) portraitImage.src = person.portrait;
    portraitImage.alt = person.portrait ? `${person.name}, ${person.likeness.toLowerCase()}` : '';
    document.getElementById('person-name').textContent = person.name;
    document.getElementById('person-epithet').textContent = person.epithet;
    document.getElementById('person-role').textContent = phase.role;
    document.getElementById('person-location').textContent = position.place;
    document.getElementById('person-beat').textContent = phase.beat;
    document.getElementById('person-bio').textContent = person.bio;
    document.getElementById('person-status').textContent = isDeathYear ? `Dies · ${yearLabel(year)}` : year === person.intro ? `Enters the story · ${yearLabel(year)}` : `Active · ${yearLabel(year)}`;
    document.getElementById('person-status').classList.toggle('death', isDeathYear);
    const imageSource = document.getElementById('person-image-source');
    document.getElementById('person-source-prefix').hidden = !person.source;
    document.getElementById('person-source-suffix').hidden = !person.source;
    document.getElementById('person-monogram-note').hidden = Boolean(person.source);
    imageSource.hidden = !person.source;
    imageSource.href = person.source || '#';
    imageSource.textContent = person.likeness || 'Editorial coin-style monogram';
  }

  function selectPerson(person) {
    stopPlayback();
    selectedPerson = person;
    selectedCity = undefined;
    selectedArmy = undefined;
    selectedBattle = undefined;
    const year = YEAR_STATES[currentIndex].year;
    populatePersonProfile(person, year);
    document.getElementById('campaign-profile').hidden = true;
    document.getElementById('city-profile').hidden = true;
    document.getElementById('city-back').hidden = true;
    document.getElementById('army-profile').hidden = true;
    document.getElementById('army-back').hidden = true;
    document.getElementById('battle-profile').hidden = true;
    document.getElementById('battle-back').hidden = true;
    document.getElementById('person-profile').hidden = false;
    document.getElementById('person-back').hidden = false;
    if (cityGroups) cityGroups.classed('selected', false);
    if (personGroups) personGroups.classed('selected', item => item === person);
    castRail?.querySelectorAll('.cast-card').forEach(card => card.classList.toggle('selected', card.dataset.person === person.id));
  }

  function selectArmy(army) {
    stopPlayback();
    selectedArmy = army;
    selectedCity = undefined;
    selectedPerson = undefined;
    selectedBattle = undefined;
    const year = YEAR_STATES[currentIndex].year;
    const phase = armyPhase(army, year);
    document.getElementById('army-name').textContent = army.name;
    document.getElementById('army-faction').textContent = FACTIONS[army.faction].name;
    document.getElementById('army-commander').textContent = phase.commander;
    document.getElementById('army-location').textContent = phase.place;
    document.getElementById('army-composition').textContent = phase.composition;
    document.getElementById('army-objective').textContent = phase.objective;
    document.getElementById('army-description').textContent = army.description;
    document.getElementById('army-standard').style.setProperty('--army-color', FACTIONS[army.faction].light);
    document.getElementById('campaign-profile').hidden = true;
    document.getElementById('city-profile').hidden = true;
    document.getElementById('person-profile').hidden = true;
    document.getElementById('city-back').hidden = true;
    document.getElementById('person-back').hidden = true;
    document.getElementById('battle-profile').hidden = true;
    document.getElementById('battle-back').hidden = true;
    document.getElementById('army-profile').hidden = false;
    document.getElementById('army-back').hidden = false;
    if (cityGroups) cityGroups.classed('selected', false);
    if (personGroups) personGroups.classed('selected', false);
    if (armyGroups) armyGroups.classed('selected', item => item === army);
    castRail?.querySelectorAll('.cast-card').forEach(card => card.classList.remove('selected'));
  }

  function selectBattle(battle) {
    stopPlayback();
    const detail = BATTLE_DETAILS[battle.name] || {};
    selectedBattle = battle;
    selectedCity = undefined;
    selectedPerson = undefined;
    selectedArmy = undefined;
    document.getElementById('battle-name').textContent = battle.name;
    document.getElementById('battle-year').textContent = yearLabel(YEAR_STATES[currentIndex].year);
    document.getElementById('battle-type').textContent = detail.type || 'Military action';
    document.getElementById('battle-belligerents').textContent = detail.belligerents || 'Contending successor forces';
    document.getElementById('battle-commanders').textContent = detail.commanders || 'Commanders disputed';
    document.getElementById('battle-result').textContent = detail.result || battle.note;
    document.getElementById('battle-forces').textContent = detail.forces || 'Surviving accounts do not permit a reliable reconstruction.';
    document.getElementById('battle-stakes').textContent = detail.stakes || battle.note;
    document.getElementById('battle-aftermath').textContent = detail.aftermath || battle.note;
    ['campaign-profile','city-profile','person-profile','army-profile'].forEach(id => { document.getElementById(id).hidden = true; });
    ['city-back','person-back','army-back'].forEach(id => { document.getElementById(id).hidden = true; });
    document.getElementById('battle-profile').hidden = false;
    document.getElementById('battle-back').hidden = false;
    if (cityGroups) cityGroups.classed('selected', false);
    if (personGroups) personGroups.classed('selected', false);
    if (armyGroups) armyGroups.classed('selected', false);
    castRail?.querySelectorAll('.cast-card').forEach(card => card.classList.remove('selected'));
    if (window.innerWidth < 981) document.querySelector('.detail-panel').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function createDefs() {
    const defs = svg.append('defs');
    defs.append('clipPath').attr('id', 'land-clip').append('path').attr('d', path(world.land));
    defs.append('clipPath').attr('id', 'person-portrait-clip').append('circle').attr('r', 13);
    const extentClip = defs.append('clipPath').attr('id', 'empire-extent-clip');
    Object.values(EMPIRE_EXTENTS).forEach(points => extentClip.append('path').attr('d', polygonPath(points)));
    defs.append('clipPath').attr('id', 'broad-story-extent-clip').append('path').attr('d', polygonPath(BROAD_STORY_EXTENT));

    [['arrow-land','#eadfbe'],['arrow-sea','#9ed3e0']].forEach(([id, color]) => {
      defs.append('marker')
        .attr('id', id).attr('viewBox', '0 -5 10 10').attr('refX', 9).attr('refY', 0)
        .attr('markerWidth', 6).attr('markerHeight', 6).attr('orient', 'auto')
        .append('path').attr('d', 'M0,-5L10,0L0,5Z').attr('fill', color);
    });

    const symbol = (id, viewBox = '-8 -8 16 16') => defs.append('symbol').attr('id', id).attr('viewBox', viewBox);
    const capital = symbol('city-icon-capital');
    capital.append('path').attr('class', 'city-icon-fill').attr('d', 'M-6,-2L0,-6L6,-2Z');
    capital.append('path').attr('class', 'city-icon-stroke').attr('d', 'M-5,-1H5M-4,-1V4M0,-1V4M4,-1V4M-6,5H6');
    capital.append('circle').attr('class', 'city-icon-gem').attr('r', 1.2).attr('cy', -3.2);

    const port = symbol('city-icon-port');
    port.append('circle').attr('class', 'city-icon-stroke').attr('r', 1.7).attr('cy', -3.8);
    port.append('path').attr('class', 'city-icon-stroke').attr('d', 'M0,-2V5M-3,0H3M-6,2.5C-5,6 -2.5,7 0,4.5C2.5,7 5,6 6,2.5M-6,2.5L-3.8,2M6,2.5L3.8,2');

    const fortress = symbol('city-icon-fortress');
    fortress.append('path').attr('class', 'city-icon-fill').attr('d', 'M-6,-5H-3V-2H-1V-5H1V-2H3V-5H6V6H-6Z');
    fortress.append('path').attr('class', 'city-icon-stroke').attr('d', 'M-6,-2H6M-2,6V2A2,2 0 0 1 2,2V6');

    const metropolis = symbol('city-icon-metropolis');
    metropolis.append('path').attr('class', 'city-icon-stroke').attr('d', 'M0,-7V-4M0,4V7M-7,0H-4M4,0H7M-5,-5L-3,-3M3,3L5,5M5,-5L3,-3M-3,3L-5,5');
    metropolis.append('circle').attr('class', 'city-icon-fill').attr('r', 3.5);
    metropolis.append('circle').attr('class', 'city-icon-gem').attr('r', 1.25);

    const town = symbol('city-icon-town');
    town.append('path').attr('class', 'city-icon-fill').attr('d', 'M0,-4.8L4.8,0L0,4.8L-4.8,0Z');
    town.append('circle').attr('class', 'city-icon-gem').attr('r', 1.15);

    const battle = symbol('battle-icon-swords', '-12 -12 24 24');
    const swordPath = 'M-1.15,-10L1.15,-10L1.6,3.2L4.8,3.2L4.8,5.2L1.45,5.2L1.45,9L0,11L-1.45,9L-1.45,5.2L-4.8,5.2L-4.8,3.2L-1.6,3.2Z';
    battle.append('path').attr('class', 'battle-sword-blade').attr('d', swordPath).attr('transform', 'rotate(-43)');
    battle.append('path').attr('class', 'battle-sword-blade').attr('d', swordPath).attr('transform', 'rotate(43)');
  }

  function renderBase() {
    svg.selectAll('*').remove();
    const bounds = mapPanel.getBoundingClientRect();
    const width = Math.max(520, bounds.width);
    const height = Math.max(420, bounds.height);
    mapWidth = width;
    mapHeight = height;
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const focus = width < 640 ? [[-10, 18], [72, 57]] : [[-12, 16], [80, 58]];
    projection = d3.geoMercator().fitExtent(
      [[20, 18], [width - 20, height - 18]],
      { type: 'MultiPoint', coordinates: focus },
    );
    path = d3.geoPath(projection);
    createDefs();
    root = svg.append('g');
    root.append('path').datum({ type: 'Sphere' }).attr('class', 'sphere').attr('d', path);
    root.append('path').datum(d3.geoGraticule10()).attr('class', 'graticule').attr('d', path);
    root.append('path').datum(world.land).attr('class', 'land-base').attr('d', path);
    root.append('path').datum(world.borders).attr('class', 'country-mesh').attr('d', path);
    root.append('g').attr('class', 'background-labels').attr('aria-hidden', 'true').selectAll('text')
      .data(BACKGROUND_LABELS.filter(label => width >= 640 || label.mobile !== false))
      .join('text')
      .attr('class', label => label.water ? 'background-label water-label' : 'background-label')
      .attr('x', label => projection(label.p)[0])
      .attr('y', label => projection(label.p)[1])
      .attr('transform', label => {
        const [x, y] = projection(label.p);
        return `rotate(${label.rotate || 0} ${x} ${y})`;
      })
      .text(label => label.name);
    mapLayer = root.append('g').attr('class', 'map-data');

    zoomBehavior = d3.zoom().scaleExtent([1, 7]).on('zoom', event => {
      currentZoomTransform = event.transform;
      root.attr('transform', event.transform);
      updateCityScale(event.transform);
      updatePersonScale(event.transform);
      updateArmyScale(event.transform);
    });
    svg.call(zoomBehavior).call(zoomBehavior.transform, currentZoomTransform);
    document.getElementById('zoom-in').onclick = () => svg.transition().duration(220).call(zoomBehavior.scaleBy, 1.45);
    document.getElementById('zoom-out').onclick = () => svg.transition().duration(220).call(zoomBehavior.scaleBy, 1 / 1.45);
    document.getElementById('zoom-reset').onclick = () => svg.transition().duration(260).call(zoomBehavior.transform, d3.zoomIdentity);
    renderSnapshot(YEAR_STATES[currentIndex]);
  }

  function renderSnapshot(snapshot, direction = 0) {
    if (!mapLayer) return;
    const activeScene = mapLayer.select('.snapshot-layer.current');
    if (!activeScene.empty() && activeScene.attr('data-year') === String(snapshot.year)) return;
    mapLayer.selectAll('.snapshot-layer').attr('clip-path', null);
    svg.select('defs').selectAll('[id^="state-reveal-"]').remove();
    const outgoingScenes = mapLayer.selectAll('.snapshot-layer');
    const transitionId = ++transitionSequence;
    const isAnimatedChange = !outgoingScenes.empty() && !reducedMotion && direction !== 0;
    outgoingScenes.classed('current', false).style('pointer-events', 'none').attr('aria-hidden', 'true');
    const scene = mapLayer.append('g')
      .attr('class', 'snapshot-layer current')
      .attr('data-year', snapshot.year)
      .style('opacity', 1);

    let revealClip;
    if (isAnimatedChange) {
      const clipId = `state-reveal-${transitionId}`;
      revealClip = svg.select('defs').append('clipPath').attr('id', clipId);
      revealClip.append('rect')
        .attr('x', direction > 0 ? 0 : mapWidth)
        .attr('y', 0)
        .attr('width', 0)
        .attr('height', mapHeight);
      scene.attr('clip-path', `url(#${clipId})`);
    }

    const resolvedTerritories = snapshot.territories.flatMap(item =>
      (REGION_GROUPS[item.region] || [item.region]).map(cell => ({ ...item, cell }))
    );
    const mergedTerritories = mergeFactionCells(resolvedTerritories, snapshot.extent !== 'med');
    const extentClipId = snapshot.extent === 'med' ? 'broad-story-extent-clip' : 'empire-extent-clip';
    const territories = scene.append('g').attr('clip-path', 'url(#land-clip)').append('g').attr('clip-path', `url(#${extentClipId})`);
    const territoryPaths = territories.selectAll('path')
      .data(mergedTerritories)
      .join('path')
      .attr('class', 'territory')
      .attr('d', d => d.d)
      .attr('fill', d => FACTIONS[d.faction].color)
      .attr('fill-opacity', .88)
      .on('pointermove', (event, d) => showTooltip(event, FACTIONS[d.faction].name, `Approximate control · ${yearLabel(snapshot.year)}`))
      .on('pointerleave', hideTooltip);

    if (isAnimatedChange) {
      territoryPaths
        .attr('fill-opacity', .42)
        .attr('stroke-opacity', .35)
        .transition().delay(120).duration(720).ease(d3.easeCubicOut)
        .attr('fill-opacity', .88)
        .attr('stroke-opacity', 1);
    }

    // Inland water and relief sit above political color. This keeps geography
    // legible while still allowing the territorial layer to dominate the story.
    const physicalLayer = scene.append('g').attr('class', 'physical-layer').attr('aria-hidden', 'true');
    if (physical.lakes) {
      physicalLayer.append('g').attr('class', 'lake-layer').selectAll('path')
        .data(physical.lakes.features).join('path')
        .attr('class', 'inland-lake')
        .attr('d', path);
    }
    if (physical.rivers) {
      physicalLayer.append('g').attr('class', 'river-layer').selectAll('path')
        .data(physical.rivers.features).join('path')
        .attr('class', feature => `river river-rank-${Math.min(6, feature.properties.scalerank || 6)}`)
        .attr('d', path);
    }
    const mountains = physicalLayer.append('g').attr('class', 'mountain-layer');
    mountains.selectAll('path.mountain-shadow').data(MOUNTAIN_RANGES).join('path')
      .attr('class', range => `mountain-shadow${range.mobile === false ? ' desktop-relief' : ''}`)
      .attr('d', range => routeCurve(range.points.map(point => projection(point))));
    mountains.selectAll('path.mountain-ridge').data(MOUNTAIN_RANGES).join('path')
      .attr('class', range => `mountain-ridge${range.mobile === false ? ' desktop-relief' : ''}`)
      .attr('d', range => routeCurve(range.points.map(point => projection(point))));
    mountains.selectAll('text').data(MOUNTAIN_RANGES).join('text')
      .attr('class', range => `mountain-label${range.mobile === false ? ' desktop-relief' : ''}`)
      .attr('x', range => projection(range.label)[0])
      .attr('y', range => projection(range.label)[1])
      .attr('transform', range => {
        const [x, y] = projection(range.label);
        return `rotate(${range.rotate || 0} ${x} ${y})`;
      })
      .text(range => range.name);
    physicalLayer.append('path').datum(world.borders).attr('class', 'country-mesh overlay').attr('d', path);

    if (snapshot.year <= 323 && snapshot.year >= 316) {
      const satrapies = scene.append('g').attr('clip-path', 'url(#land-clip)').append('g').attr('clip-path', 'url(#empire-extent-clip)');
      satrapies.selectAll('path').data(SATRAPY_LINES).join('path')
        .attr('class', 'satrapy-line')
        .attr('d', points => routeCurve(points.map(point => projection(point))));
      satrapies.selectAll('text').data(SATRAPY_LABELS).join('text')
        .attr('class', 'satrapy-label')
        .attr('x', d => projection(d.p)[0])
        .attr('y', d => projection(d.p)[1])
        .text(d => d.name);
    }

    const labels = scene.append('g').selectAll('text')
      .data(snapshot.labels).join('text')
      .attr('class', 'faction-label')
      .attr('x', d => projection(d.p)[0])
      .attr('y', d => projection(d.p)[1])
      .style('font-size', d => `${d.size || 12}px`)
      .text(d => d.name);
    labels
      .attr('opacity', isAnimatedChange ? 0 : 1)
      .attr('transform', isAnimatedChange ? 'translate(0 7)' : null)
      .transition().delay(isAnimatedChange ? 430 : 0).duration(reducedMotion ? 0 : 420).ease(d3.easeCubicOut)
      .attr('opacity', 1)
      .attr('transform', 'translate(0 0)');

    const routes = scene.append('g').attr('class', 'routes').selectAll('g')
      .data(snapshot.routes).join('g');

    routes.each(function(d) {
      const group = d3.select(this);
      const points = d.points.map(point => projection(point));
      const routeD = routeCurve(points);
      group.append('path').attr('class', 'route-shadow').attr('d', routeD);
      const line = group.append('path')
        .attr('class', `route-line${d.naval ? ' naval' : ''}${reducedMotion ? '' : ' entering'}`)
        .attr('d', routeD)
        .attr('stroke', d.naval ? '#9ed3e0' : FACTIONS[d.faction].light);
      const node = line.node();
      if (node) {
        const length = node.getTotalLength();
        line.style('--route-length', length).attr('stroke-dasharray', d.naval ? `7 5` : length).attr('stroke-dashoffset', reducedMotion || d.naval ? 0 : length);
      }
      group.append('path').attr('class', 'route-hit').attr('d', routeD)
        .on('pointermove', event => showTooltip(event, FACTIONS[d.faction].name, d.name))
        .on('pointerleave', hideTooltip);

      const [sx, sy] = points[0];
      const marker = group.append('g')
        .attr('class', d.naval ? 'route-unit naval-unit' : 'route-unit army-unit')
        .attr('transform', `translate(${sx} ${sy})`)
        .style('pointer-events', 'none');
      if (d.naval) {
        marker.append('path').attr('class', 'unit-shadow').attr('d', 'M-9,2Q0,6 9,2L6,6H-6Z');
        marker.append('path').attr('class', 'unit-hull').attr('d', 'M-8,1Q0,4.5 8,1L5,5H-5Z').attr('fill', FACTIONS[d.faction].color);
        marker.append('path').attr('class', 'unit-detail').attr('d', 'M-5,0H6M-2,0V-5L4,-1H-2M-7,5L-10,7M-3,5L-5,8M2,5L3,8M6,4L9,6');
      } else {
        marker.append('path').attr('class', 'unit-shadow').attr('d', 'M-7,-8H7V3L0,8L-7,3Z');
        marker.append('path').attr('class', 'unit-standard').attr('d', 'M-6,-8H6V2L0,7L-6,2Z').attr('fill', FACTIONS[d.faction].color);
        marker.append('path').attr('class', 'unit-detail').attr('d', 'M-8,-10V9M-8,-9H6');
        marker.append('circle').attr('class', 'unit-gem').attr('r', 1.7).attr('cy', -1.5);
      }
    });

    const activeArmies = armiesForYear(snapshot.year);
    const armyMovements = activeArmies.map(army => armyMovement(army, snapshot.year)).filter(Boolean);
    const movementGroups = scene.append('g').attr('class', 'army-movements').selectAll('g')
      .data(armyMovements).join('g');
    movementGroups.append('path')
      .attr('class', 'army-movement-shadow')
      .attr('d', movement => routeCurve([projection(movement.from.p), projection(movement.to.p)]));
    movementGroups.append('path')
      .attr('class', 'army-movement-line')
      .attr('stroke', movement => FACTIONS[movement.army.faction].light)
      .attr('d', movement => routeCurve([projection(movement.from.p), projection(movement.to.p)]))
      .on('pointermove', (event, movement) => showTooltip(event, movement.army.name, `${movement.from.place} → ${movement.to.place}`))
      .on('pointerleave', hideTooltip);
    armyGroups = scene.append('g').attr('class', 'army-camps').selectAll('g')
      .data(activeArmies, army => army.id).join('g')
      .attr('class', army => `army-camp${armyMovement(army, snapshot.year) ? ' arrived' : ''}${selectedArmy === army ? ' selected' : ''}`)
      .on('click', (event, army) => { event.stopPropagation(); selectArmy(army); })
      .on('pointermove', (event, army) => {
        const phase = armyPhase(army, snapshot.year);
        showTooltip(event, army.name, `${phase.commander} · Encamped at ${phase.place}`);
      })
      .on('pointerleave', hideTooltip);
    armyGroups.append('line')
      .attr('class', 'army-camp-leader')
      .attr('x1', 0).attr('y1', 0)
      .attr('x2', army => -armyOffset(army)[0])
      .attr('y2', army => -armyOffset(army)[1]);
    armyGroups.append('circle').attr('class', 'army-camp-hit').attr('r', 17)
      .attr('role', 'button')
      .attr('tabindex', 0)
      .attr('aria-label', army => `${army.name}, commanded by ${armyPhase(army, snapshot.year).commander}, encamped at ${armyPhase(army, snapshot.year).place}`)
      .on('click', (event, army) => { event.stopPropagation(); selectArmy(army); })
      .on('keydown', (event, army) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectArmy(army); }
      });
    armyGroups.append('circle').attr('class', 'army-camp-ring').attr('r', 12).attr('stroke', army => FACTIONS[army.faction].light);
    armyGroups.append('path').attr('class', 'army-tent').attr('d', 'M-8,6L0,-6L8,6ZM0,-6V6M-8,6H8');
    armyGroups.append('path').attr('class', 'army-standard-pole').attr('d', 'M-9,-9V8');
    armyGroups.append('path').attr('class', 'army-standard-flag').attr('d', 'M-9,-9H2L-1,-4H-9Z').attr('fill', army => FACTIONS[army.faction].light);
    armyGroups.append('rect').attr('class', 'army-camp-label-backdrop').attr('x', 15).attr('y', -9).attr('height', 18).attr('width', army => Math.max(64, army.name.length * 5.6 + 14));
    armyGroups.append('text').attr('class', 'army-camp-label').attr('x', 22).attr('y', 3).text(army => army.name);
    updateArmyScale();

    if (isAnimatedChange && !reducedMotion) {
      armyGroups.attr('opacity', 0)
        .attr('transform', army => `${armyTransform(army, snapshot.year)} translate(0 8)`)
        .transition().delay((army, index) => 520 + index * 35).duration(360).ease(d3.easeCubicOut)
        .attr('opacity', 1)
        .attr('transform', army => armyTransform(army, snapshot.year));
    }

    const battles = scene.append('g').attr('class', 'battles').selectAll('g')
      .data(snapshot.battles).join('g')
      .attr('class', 'battle-marker')
      .attr('transform', d => `translate(${projection(d.p).join(' ')})`)
      .attr('role', 'button')
      .attr('tabindex', 0)
      .attr('aria-label', d => `Open dossier for ${d.name}, ${yearLabel(snapshot.year)}`)
      .on('click', (event, d) => { event.stopPropagation(); selectBattle(d); })
      .on('keydown', (event, d) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectBattle(d); }
      })
      .on('pointermove', (event, d) => showTooltip(event, d.name, d.note))
      .on('pointerleave', hideTooltip);
    battles.append('circle').attr('class', 'battle-aura').attr('r', 14);
    battles.append('circle').attr('class', 'battle-ring').attr('r', 11);
    battles.append('use').attr('class', 'battle-swords').attr('href', '#battle-icon-swords').attr('x', -8).attr('y', -8).attr('width', 16).attr('height', 16);
    battles.append('rect')
      .attr('class', 'battle-label-backdrop')
      .attr('x', 14).attr('y', -8.5)
      .attr('width', d => Math.max(45, d.name.length * 5.6 + 14))
      .attr('height', 17);
    battles.append('text').attr('class', 'battle-label').attr('x', 21).attr('y', 3).text(d => d.name);
    if (isAnimatedChange) {
      battles
        .attr('opacity', 0)
        .attr('transform', d => `translate(${projection(d.p).join(' ')}) scale(.35)`)
        .transition().delay(610).duration(390).ease(d3.easeBackOut.overshoot(1.25))
        .attr('opacity', 1)
        .attr('transform', d => `translate(${projection(d.p).join(' ')}) scale(1)`);
    }

    const availableCities = CITIES.filter(city => cityIsAvailable(city, snapshot.year))
      .sort((a, b) => cityDrawPriority(a) - cityDrawPriority(b));
    cityGroups = scene.append('g').attr('class', 'cities').selectAll('g')
      .data(availableCities, city => city.name).join('g')
      .attr('class', city => `city-marker tier-${city.tier} icon-${cityIconType(city)}${selectedCity === city ? ' selected' : ''}`)
      .attr('role', 'button')
      .attr('tabindex', 0)
      .attr('aria-label', city => `${city.name}, ${city.kind} in ${city.region}`)
      .on('click', (event, city) => { event.stopPropagation(); selectCity(city); })
      .on('keydown', (event, city) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectCity(city); }
      })
      .on('pointermove', (event, city) => showTooltip(event, city.name, `${city.kind} · ${city.region}`))
      .on('pointerleave', hideTooltip);
    cityGroups.append('circle').attr('class', 'city-hit').attr('r', city => cityIconSize(city) * .72 + 4);
    cityGroups.append('circle').attr('class', 'city-halo').attr('r', city => cityIconSize(city) * .54);
    cityGroups.append('circle').attr('class', 'city-select-ring').attr('r', city => cityIconSize(city) * .62 + 2);
    cityGroups.append('use')
      .attr('class', 'city-emblem')
      .attr('href', city => `#city-icon-${cityIconType(city)}`)
      .attr('x', city => -cityIconSize(city) / 2)
      .attr('y', city => -cityIconSize(city) / 2)
      .attr('width', city => cityIconSize(city))
      .attr('height', city => cityIconSize(city));
    cityGroups.append('text')
      .attr('class', 'city-label')
      .attr('x', (city, index) => (index % 2 ? 1 : -1) * (cityIconSize(city) * .55 + 4))
      .attr('y', (city, index) => index % 3 ? -(cityIconSize(city) * .36 + 2) : cityIconSize(city) * .55 + 7)
      .attr('text-anchor', (city, index) => index % 2 ? 'start' : 'end')
      .text(city => city.name);
    updateCityScale();

    const activePeople = peopleForYear(snapshot.year);
    personGroups = scene.append('g').attr('class', 'people-layer').selectAll('g')
      .data(activePeople, person => person.id).join('g')
      .attr('class', person => `person-marker${person.death === snapshot.year ? ' death-year' : ''}${person.intro === snapshot.year ? ' entering-story' : ''}${selectedPerson === person ? ' selected' : ''}`)
      .attr('role', 'button')
      .attr('tabindex', 0)
      .attr('aria-label', person => `${person.name}, ${personPhase(person, snapshot.year).role}, near ${personPosition(person, snapshot.year).place}`)
      .on('click', (event, person) => { event.stopPropagation(); selectPerson(person); })
      .on('keydown', (event, person) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectPerson(person); }
      })
      .on('pointermove', (event, person) => showTooltip(event, person.name, `${personPhase(person, snapshot.year).role} · ${personPosition(person, snapshot.year).place}`))
      .on('pointerleave', hideTooltip);
    personGroups.append('circle').attr('class', 'person-aura').attr('r', 20);
    personGroups.append('circle').attr('class', 'person-ring').attr('r', 15).attr('stroke', person => FACTIONS[person.faction].light);
    personGroups.append('image')
      .attr('class', 'person-map-portrait')
      .attr('href', person => person.portrait)
      .attr('x', -13).attr('y', -13).attr('width', 26).attr('height', 26)
      .attr('preserveAspectRatio', 'xMidYMid slice')
      .attr('clip-path', 'url(#person-portrait-clip)');
    personGroups.filter(person => !person.portrait).append('text')
      .attr('class', 'person-map-monogram').attr('text-anchor', 'middle').attr('y', 3.5)
      .text(person => person.monogram || person.name.split(/\s+/).map(part => part[0]).slice(0,2).join(''));
    personGroups.append('path').attr('class', 'person-pointer').attr('d', 'M-4,14L0,20L4,14Z').attr('fill', person => FACTIONS[person.faction].light);
    personGroups.append('rect').attr('class', 'person-label-backdrop').attr('x', 18).attr('y', -9).attr('height', 18).attr('width', person => Math.max(56, person.name.length * 6.2 + 14));
    personGroups.append('text').attr('class', 'person-label').attr('x', 25).attr('y', 3).text(person => person.name);
    personGroups.filter(person => person.death === snapshot.year).append('g').attr('class', 'death-mark')
      .call(group => {
        group.append('circle').attr('cx', 12).attr('cy', -12).attr('r', 7);
        group.append('path').attr('d', 'M9,-15L15,-9M15,-15L9,-9');
      });
    updatePersonScale();
    // Battles remain the primary event target in milestone years, even when a
    // commander portrait occupies the same campaign theatre.
    scene.select('.battles').raise();

    if (isAnimatedChange && !reducedMotion) {
      personGroups.attr('opacity', 0)
        .attr('transform', person => `${personTransform(person, snapshot.year)} scale(.65)`)
        .transition().delay((person, index) => 650 + index * 55).duration(420).ease(d3.easeBackOut.overshoot(1.18))
        .attr('opacity', 1)
        .attr('transform', person => personTransform(person, snapshot.year));
    }

    if (isAnimatedChange) {
      cityGroups.attr('opacity', 0)
        .transition().delay((city, index) => 500 + Math.min(index, 20) * 12).duration(300)
        .attr('opacity', 1);
    }

    if (isAnimatedChange) {
      const revealRect = revealClip.select('rect');
      revealRect.transition().duration(980).ease(d3.easeCubicInOut)
        .attr('x', 0)
        .attr('width', mapWidth)
        .on('end', () => {
          revealClip.remove();
          if (transitionId === transitionSequence) scene.attr('clip-path', null);
        });
      window.setTimeout(() => {
        revealClip.remove();
        if (transitionId === transitionSequence) scene.attr('clip-path', null);
      }, 1040);
      outgoingScenes.interrupt().transition().delay(560).duration(420).ease(d3.easeCubicIn)
        .style('opacity', .12).remove();
    } else {
      outgoingScenes.remove();
    }

    updateLegend(snapshot);
    updateCast(snapshot, direction);
  }

  function updateCast(snapshot, direction = 0) {
    const activePeople = peopleForYear(snapshot.year);
    document.getElementById('cast-count').textContent = `${activePeople.length} active`;
    castRail.innerHTML = activePeople.map(person => {
      const phase = personPhase(person, snapshot.year);
      const position = personPosition(person, snapshot.year);
      const entering = person.intro === snapshot.year;
      const dying = person.death === snapshot.year;
      const state = dying ? 'Dies this year' : entering ? 'Enters story' : phase.role;
      return `<button class="cast-card${entering ? ' entering' : ''}${dying ? ' dying' : ''}${selectedPerson === person ? ' selected' : ''}" data-person="${person.id}" type="button" aria-label="Open ${person.name} character dossier">
        <span class="cast-portrait-wrap${person.portrait ? '' : ' monogram'}" style="--faction:${FACTIONS[person.faction].light}">${person.portrait ? `<img src="${person.portrait}" alt="">` : `<b>${person.monogram || person.name.split(/\s+/).map(part => part[0]).slice(0,2).join('')}</b>`}</span>
        <span class="cast-copy"><strong>${person.name}</strong><small>${state}</small><em>${position.place}</em></span>
      </button>`;
    }).join('');
    castRail.querySelectorAll('.cast-card').forEach(card => {
      card.addEventListener('click', () => selectPerson(PEOPLE.find(person => person.id === card.dataset.person)));
    });
    if (!reducedMotion && direction !== 0) {
      castRail.animate([
        { opacity: .35, transform: `translateX(${direction < 0 ? -10 : 10}px)` },
        { opacity: 1, transform: 'translateX(0)' },
      ], { duration: 520, easing: 'cubic-bezier(.2,.75,.25,1)' });
    }
  }

  function updateLegend(snapshot) {
    const used = [...new Set(snapshot.territories.map(item => item.faction))];
    document.getElementById('map-key').innerHTML = used.map(id => `<span class="key-item"><i class="key-swatch" style="background:${FACTIONS[id].color}"></i>${FACTIONS[id].name}</span>`).join('')
      + `<span class="key-item"><i class="key-capital"></i>Capital</span>`
      + `<span class="key-item"><i class="key-city"></i>${CITIES.filter(city => cityIsAvailable(city, snapshot.year)).length} cities</span>`
      + (snapshot.battles.length ? '<span class="key-item"><i class="key-battle">⚔</i>Battle</span>' : '')
      + `<span class="key-item"><i class="key-camp"></i>${armiesForYear(snapshot.year).length} field armies</span>`
      + '<span class="key-item"><i class="key-route"></i>Army</span><span class="key-item"><i class="key-route naval"></i>Fleet</span>';
  }

  function updateNarrative(snapshot, direction = 0) {
    closeBattleProfile();
    closeArmyProfile();
    closePersonProfile();
    closeCityProfile();
    document.getElementById('date-year').textContent = yearNumber(snapshot.year);
    document.querySelector('.date-era').textContent = yearEra(snapshot.year);
    document.getElementById('war-label').textContent = snapshot.war;
    document.getElementById('event-title').textContent = snapshot.title;
    document.getElementById('event-copy').textContent = snapshot.copy;
    document.getElementById('dispatch-list').innerHTML = snapshot.dispatches.map(([faction, title, copy]) => `
      <div class="dispatch-item">
        <i class="dispatch-dot" style="--c:${FACTIONS[faction].light}"></i>
        <div><strong>${title}</strong>${copy}</div>
      </div>`).join('');
    if (!reducedMotion) {
      const travel = direction < 0 ? -12 : 12;
      document.getElementById('campaign-profile').animate([
        { opacity: .18, transform: `translateX(${travel}px)`, filter: 'blur(3px)' },
        { opacity: 1, transform: 'translateX(0)', filter: 'blur(0)' },
      ], { duration: 620, easing: 'cubic-bezier(.22,.75,.25,1)' });
      document.getElementById('date-year').animate([
        { opacity: .2, transform: `translateY(${direction < 0 ? -10 : 10}px) scale(.92)` },
        { opacity: 1, transform: 'translateY(0) scale(1)' },
      ], { duration: 520, easing: 'cubic-bezier(.16,.8,.25,1)' });
    }
  }

  function setYear(index, centerButton = false) {
    const targetIndex = Math.max(0, Math.min(YEAR_STATES.length - 1, index));
    const direction = Math.sign(targetIndex - currentIndex);
    currentIndex = targetIndex;
    const snapshot = YEAR_STATES[currentIndex];
    eventEls.forEach((button, buttonIndex) => {
      const active = buttonIndex === currentIndex;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    if (centerButton) eventEls[currentIndex].scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
    previousButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === YEAR_STATES.length - 1;
    const chapterOptions = [...eraJump.options];
    const activeChapter = [...chapterOptions].reverse().find(option => currentIndex >= YEAR_STATES.findIndex(state => state.year === Number(option.value))) || chapterOptions[0];
    eraJump.value = activeChapter.value;
    if (!reducedMotion && direction !== 0) {
      mapPanel.classList.remove('state-forward', 'state-backward', 'state-changing');
      document.querySelector('.chronology').classList.remove('state-changing');
      document.querySelector('.detail-panel').classList.remove('state-changing');
      void mapPanel.offsetWidth;
      mapPanel.classList.add(direction > 0 ? 'state-forward' : 'state-backward', 'state-changing');
      document.querySelector('.chronology').classList.add('state-changing');
      document.querySelector('.detail-panel').classList.add('state-changing');
      const motionId = transitionSequence + 1;
      window.setTimeout(() => {
        if (motionId !== transitionSequence) return;
        mapPanel.classList.remove('state-forward', 'state-backward', 'state-changing');
        document.querySelector('.chronology').classList.remove('state-changing');
        document.querySelector('.detail-panel').classList.remove('state-changing');
      }, 1050);
    }
    updateNarrative(snapshot, direction);
    renderSnapshot(snapshot, direction);
  }

  function stopPlayback() {
    clearInterval(playback);
    playback = undefined;
    playButton.setAttribute('aria-pressed', 'false');
    playButton.innerHTML = '<span aria-hidden="true">▶</span><span>Play the timeline</span>';
  }

  playButton.addEventListener('click', () => {
    if (playback) { stopPlayback(); return; }
    if (currentIndex === YEAR_STATES.length - 1) setYear(0, true);
    playButton.setAttribute('aria-pressed', 'true');
    playButton.innerHTML = '<span aria-hidden="true">Ⅱ</span><span>Pause</span>';
    playback = setInterval(() => {
      if (currentIndex >= YEAR_STATES.length - 1) { stopPlayback(); return; }
      setYear(currentIndex + 1, true);
    }, 1450);
  });

  previousButton.addEventListener('click', () => { stopPlayback(); setYear(currentIndex - 1, true); });
  nextButton.addEventListener('click', () => { stopPlayback(); setYear(currentIndex + 1, true); });
  eraJump.addEventListener('change', () => {
    stopPlayback();
    const index = YEAR_STATES.findIndex(snapshot => snapshot.year === Number(eraJump.value));
    if (index >= 0) setYear(index, true);
  });
  window.addEventListener('keydown', event => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); stopPlayback(); setYear(currentIndex - 1, true); }
    if (event.key === 'ArrowRight') { event.preventDefault(); stopPlayback(); setYear(currentIndex + 1, true); }
  });

  document.getElementById('city-back').addEventListener('click', closeCityProfile);
  document.getElementById('person-back').addEventListener('click', closePersonProfile);
  document.getElementById('army-back').addEventListener('click', closeArmyProfile);
  document.getElementById('battle-back').addEventListener('click', closeBattleProfile);

  function showLoadError() {
    const box = document.createElement('div');
    box.className = 'error-state';
    box.innerHTML = '<strong>The campaign map could not load.</strong><span>Reload the page to try the geographic base again.</span>';
    mapPanel.appendChild(box);
  }

  const topologySource = window.DIADOCHI_WORLD
    ? Promise.resolve(window.DIADOCHI_WORLD)
    : fetch('/assets/diadochi/countries-50m.json').then(response => {
        if (!response.ok) throw new Error(`Map data returned ${response.status}`);
        return response.json();
      });

  const physicalSource = location.protocol === 'file:'
    ? Promise.resolve([null, null])
    : Promise.all([
        fetch('/assets/diadochi/lakes-50m.geojson').then(response => response.ok ? response.json() : null),
        fetch('/assets/diadochi/rivers-50m.geojson').then(response => response.ok ? response.json() : null),
      ]).catch(error => {
        console.warn('Physical geography could not be loaded.', error);
        return [null, null];
      });

  function cropPhysical(collection) {
    if (!collection) return null;
    const features = collection.features.filter(feature => {
      const [[west, south], [east, north]] = d3.geoBounds(feature);
      return east >= -13 && west <= 81 && north >= 16 && south <= 59;
    });
    return { ...collection, features };
  }

  Promise.all([topologySource, physicalSource])
    .then(([topology, [lakes, rivers]]) => {
      world = {
        land: topojson.feature(topology, topology.objects.land),
        borders: topojson.mesh(topology, topology.objects.countries, (a, b) => a !== b),
      };
      physical = { lakes: cropPhysical(lakes), rivers: cropPhysical(rivers) };
      renderBase();
      setYear(0);
      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(renderBase, 120);
      });
    })
    .catch(error => {
      console.error(error);
      showLoadError();
      updateNarrative(SNAPSHOTS[0]);
    });
})();
